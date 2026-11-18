import { Grid } from './grid.js'

// Fetches an image as ImageBitmap (a source for Pixels); rejects with the reason
export async function loadImage(url) {
	const res = await fetch(url)
	if (!res.ok) throw new Error('Could not load image: ' + url + ' (' + res.status + ')')
	return createImageBitmap(await res.blob())
}

export class Pixels extends Grid {
	constructor() {
		super(0, 0)
		this.canvas = typeof OffscreenCanvas == 'function' ? new OffscreenCanvas(1, 1) : document.createElement('canvas')
		this.ctx = this.canvas.getContext('2d', { willReadFrequently : true })
	}

	// The pixels are { r, g, b (0..255), a, gray (0..1) }. Chainable, for example:
	//   px.resize(cols, rows).cover(cam, metrics.aspect).flipX().normalize()

	// Size of the image the sources are drawn into (usually cols × rows)
	resize(w, h) {
		// Called by the Grid constructor, before the canvas exists
		if (!this.canvas) {
			this.width = 0
			this.height = 0
			this.data = []
			return this
		}
		w = Math.max(1, Math.round(w))
		h = Math.max(1, Math.round(h))
		if (this.canvas.width != w || this.canvas.height != h) {
			this.canvas.width = w
			this.canvas.height = h
		}
		return this
	}

	// Sources: video, image, canvas, ImageBitmap or ImageData.
	// aspect: the cell aspect (ctx.metrics.aspect), corrects the image proportions

	// Fills the whole image, cropping the source
	cover(source, aspect = 1) {
		return this.#draw(source, 'cover', aspect)
	}

	// The whole source, with black bars
	fit(source, aspect = 1) {
		return this.#draw(source, 'fit', aspect)
	}

	// Distorted to the image size
	stretch(source) {
		return this.#draw(source, 'stretch', 1)
	}

	// Resizes to the source size and copies it
	image(source) {
		const s = sourceSize(source)
		return this.resize(s.width, s.height).#draw(source, 'stretch', 1)
	}

	flipX() {
		const w = this.width
		for (let j=0; j<this.height; j++) {
			const o = j * w
			for (let i=0; i<w>>1; i++) {
				const t = this.data[o + i]
				this.data[o + i] = this.data[o + w - 1 - i]
				this.data[o + w - 1 - i] = t
			}
		}
		return this
	}

	flipY() {
		const w = this.width
		const h = this.height
		for (let j=0; j<h>>1; j++) {
			for (let i=0; i<w; i++) {
				const a = j * w + i
				const b = (h - 1 - j) * w + i
				const t = this.data[a]
				this.data[a] = this.data[b]
				this.data[b] = t
			}
		}
		return this
	}

	#draw(source, mode, aspect) {
		const w = this.canvas.width
		const h = this.canvas.height
		const s = sourceSize(source)
		const ctx = this.ctx
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, w, h)

		// A video without frames yet has no size
		if (s.width > 0 && s.height > 0) {
			const img = isImageData(source) ? toCanvas(source) : source
			const sa = s.width / (s.height * aspect)
			const ta = w / h
			let dw = w
			let dh = h
			if (mode == 'cover') {
				if (sa > ta) dw = h * sa
				else dh = w / sa
			} else if (mode == 'fit') {
				if (sa > ta) dh = w / sa
				else dw = h * sa
			}
			ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
		}

		this.#readCanvas()
		return this
	}

	#readCanvas() {
		const w = this.canvas.width
		const h = this.canvas.height
		const src = this.ctx.getImageData(0, 0, w, h).data
		const out = new Array(w * h)
		for (let i=0; i<out.length; i++) {
			const r = src[i * 4]
			const g = src[i * 4 + 1]
			const b = src[i * 4 + 2]
			out[i] = { r, g, b, a : src[i * 4 + 3] / 255, gray : gray(r, g, b) }
		}
		this.width = w
		this.height = h
		this.data = out
	}

	// Used by sample() and sampler(): mixes pixel objects
	lerp(a, b, t) {
		const s = 1 - t
		return {
			r    : a.r * s + b.r * t,
			g    : a.g * s + b.g * t,
			b    : a.b * s + b.b * t,
			a    : a.a * s + b.a * t,
			gray : a.gray * s + b.gray * t,
		}
	}

	// Nearest palette color ({ r, g, b, ... }, other fields are kept, for example hex);
	// gray and alpha stay those of the source
	quantize(palette) {
		for (let i=0; i<this.data.length; i++) {
			const p = this.data[i]
			let best = palette[0]
			let dist = Infinity
			for (const c of palette) {
				const d = redmean(p, c)
				if (d < dist) {
					dist = d
					best = c
				}
			}
			this.data[i] = { ...best, a : p.a, gray : p.gray }
		}
		return this
	}

	// Stretches gray to [lower, upper] (auto levels)
	normalize(lower = 0, upper = 1) {
		let min = Infinity
		let max = -Infinity
		for (const p of this.data) {
			if (p.gray < min) min = p.gray
			if (p.gray > max) max = p.gray
		}
		const range = max - min
		for (const p of this.data) {
			p.gray = range == 0 ? lower : lower + (p.gray - min) / range * (upper - lower)
		}
		return this
	}

	threshold(t = 0.5) {
		for (const p of this.data) p.gray = p.gray < t ? 0 : 1
		return this
	}
}

// Rec. 709 luma, 0..1
function gray(r, g, b) {
	return (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255
}

// Perceptual color distance, cheap: https://en.wikipedia.org/wiki/Color_difference
function redmean(a, b) {
	const r = (a.r + b.r) * 0.5
	const dr = a.r - b.r
	const dg = a.g - b.g
	const db = a.b - b.b
	return (2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db
}

function sourceSize(s) {
	if (s.videoWidth !== undefined) return { width : s.videoWidth, height : s.videoHeight }
	return { width : s.naturalWidth || s.width || 0, height : s.naturalHeight || s.height || 0 }
}

function isImageData(s) {
	return s.data && s.data.length !== undefined && s.width && s.height && !s.getContext
}

function toCanvas(imageData) {
	const c = typeof OffscreenCanvas == 'function' ? new OffscreenCanvas(imageData.width, imageData.height) : document.createElement('canvas')
	c.width = imageData.width
	c.height = imageData.height
	c.getContext('2d').putImageData(imageData, 0, 0)
	return c
}
