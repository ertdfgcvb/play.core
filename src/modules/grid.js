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

	// Normalized coords (0..1), mirrored outside the range
	sampleNearest(sx, sy) {
		const mx = 1 - Math.abs(Math.abs(sx) % 2 - 1)
		const my = 1 - Math.abs(Math.abs(sy) % 2 - 1)
		return this.get(Math.round(mx * (this.width - 1)), Math.round(my * (this.height - 1)))
	}

	// Bilinear, normalized coords; edges are clamped
	sample(sx, sy) {
		const x = sx * this.width - 0.5
		const y = sy * this.height - 0.5
		const l = Math.floor(x)
		const b = Math.floor(y)
		const fx = x - l
		const fy = y - b
		const g = (i, j) => this.get(clamp(i, 0, this.width - 1), clamp(j, 0, this.height - 1))
		const p1 = mix(g(l, b), g(l + 1, b), fx)
		const p2 = mix(g(l, b + 1), g(l + 1, b + 1), fx)
		return mix(p1, p2, fy)
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

function mix(a, b, t) {
	return a * (1 - t) + b * t
}

function clamp(v, min, max) {
	return v < min ? min : v > max ? max : v
}
