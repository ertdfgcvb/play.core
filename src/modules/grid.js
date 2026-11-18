// grid.js: 2D grid with sampling, wrapping and transforms

export class Grid {
	constructor(w, h, type = Array) {
		this.type = type
		this.resize(w, h)
	}

	resize(w, h, fillValue = 0) {
		this.width  = Math.max(0, w) || 0
		this.height = Math.max(0, h) || 0
		this.data   = new this.type(this.width * this.height)
		if (typeof fillValue == 'function') {
			this.fill(fillValue)
		} else {
			this.data.fill(fillValue)
		}
		return this
	}

	fill(fn) {
		let idx = 0
		for (let j=0; j<this.height; j++) {
			for (let i=0; i<this.width; i++) {
				this.data[idx] = fn(i, j, idx, this.width, this.height)
				idx++
			}
		}
		return this
	}

	fillRect(tx, ty, tw, th, value) {
		for (let j=0; j<th; j++) {
			for (let i=0; i<tw; i++) {
				this.set(tx + i, ty + j, value)
			}
		}
		return this
	}

	loop(fn) {
		let idx = 0
		for (let j=0; j<this.height; j++) {
			for (let i=0; i<this.width; i++) {
				fn(this.data[idx], i, j, idx, this.width, this.height)
				idx++
			}
		}
		return this
	}

	get(gx, gy) {
		if (gx < 0 || gy < 0 || gx >= this.width || gy >= this.height) return null
		return this.data[gx + gy * this.width]
	}

	getWrapped(gx, gy) {
		gx = ((gx % this.width) + this.width) % this.width
		gy = ((gy % this.height) + this.height) % this.height
		return this.data[gx + gy * this.width]
	}

	set(gx, gy, value) {
		if (gx < 0 || gy < 0 || gx >= this.width || gy >= this.height) return
		this.data[gx + gy * this.width] = value
	}

	setArray(array) {
		if (array.length != this.data.length) return
		for (let i=0; i<array.length; i++) this.data[i] = array[i]
	}

	setRectArray(tx, ty, tw, th, array) {
		for (let j=0; j<th; j++) {
			for (let i=0; i<tw; i++) {
				this.set(tx + i, ty + j, array[i + tw * j])
			}
		}
	}

	setGrid(gx, gy, grid) {
		this.setRectArray(gx, gy, grid.width, grid.height, grid.data)
	}

	getRect(gx, gy, rw, rh) {
		const out = new Grid(rw, rh, this.type)
		for (let j=0; j<rh; j++) {
			for (let i=0; i<rw; i++) {
				out.set(i, j, this.get(i + gx, j + gy))
			}
		}
		return out
	}

	getTransformed(flipX = 0, flipY = 0, rot = 0) {
		const swap = rot == 1 || rot == 3
		const out = new Grid(swap ? this.height : this.width, swap ? this.width : this.height, this.type)
		for (let j=0; j<out.height; j++) {
			for (let i=0; i<out.width; i++) {
				let ti, tj
				if (rot == 1) {
					ti = out.height - j - 1
					tj = i
				} else if (rot == 2) {
					ti = out.width - i - 1
					tj = out.height - j - 1
				} else if (rot == 3) {
					ti = j
					tj = out.width - i - 1
				} else {
					ti = i
					tj = j
				}
				ti = flipX ? out.width - 1 - ti : ti
				tj = flipY ? out.height - 1 - tj : tj
				out.set(ti, tj, this.get(i, j))
			}
		}
		return out
	}

	// Normalized coords (0..1), bilinear, clamped edges; values are mixed with lerp()
	sample(u, v) {
		return sampleAt(this, u, v, 'linear', WRAP.clamp, this.lerp)
	}

	// Returns a sampler (u, v) => value, configured once:
	// filter: 'nearest' or 'linear'
	// wrap:   'clamp', 'repeat' or 'mirror'
	// lerp:   (a, b, t) => value, for values other than numbers
	sampler({ filter = 'linear', wrap = 'clamp', lerp = this.lerp } = {}) {
		const w = WRAP[wrap] || WRAP.clamp
		return (u, v) => sampleAt(this, u, v, filter, w, lerp)
	}

	lerp(a, b, t) {
		return a * (1 - t) + b * t
	}

	isEqual(grid) {
		if (grid.width != this.width || grid.height != this.height) return false
		for (let i=0; i<this.data.length; i++) {
			if (this.data[i] !== grid.data[i]) return false
		}
		return true
	}

	toString() {
		let out = ''
		for (let y=0; y<this.height; y++) {
			for (let x=0; x<this.width; x++) {
				out += this.get(x, y)
			}
			out += '\n'
		}
		return out
	}
}

const WRAP = {
	clamp  : (i, n) => i < 0 ? 0 : i >= n ? n - 1 : i,
	repeat : (i, n) => ((i % n) + n) % n,
	mirror : (i, n) => {
		const p = 2 * n
		i = ((i % p) + p) % p
		return i < n ? i : p - 1 - i
	},
}

function sampleAt(g, u, v, filter, wrap, lerp) {
	const w = g.width
	const h = g.height
	const d = g.data
	const x = u * w - 0.5
	const y = v * h - 0.5
	if (filter == 'nearest') return d[wrap(Math.round(x), w) + wrap(Math.round(y), h) * w]
	const l = Math.floor(x)
	const t = Math.floor(y)
	const fx = x - l
	const fy = y - t
	const x0 = wrap(l, w)
	const x1 = wrap(l + 1, w)
	const y0 = wrap(t, h) * w
	const y1 = wrap(t + 1, h) * w
	return lerp(lerp(d[x0 + y0], d[x1 + y0], fx), lerp(d[x0 + y1], d[x1 + y1], fx), fy)
}
