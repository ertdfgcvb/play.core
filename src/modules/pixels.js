import { Grid } from './grid.js'

export class Pixels extends Grid {
	constructor() {
		super(0, 0)
		this.canvas = typeof OffscreenCanvas == 'function' ? new OffscreenCanvas(1, 1) : document.createElement('canvas')
		this.ctx = this.canvas.getContext('2d', { willReadFrequently : true })
	}

	// Draws a video, image, canvas or ImageData into w × h pixels (source size if omitted)
	// and reads them as { r, g, b (0..255), a, gray (0..1) }.
	// mode:   'cover', 'fit' (black bars) or 'stretch'
	// aspect: the cell aspect (ctx.metrics.aspect), corrects the image proportions
	// mirror: flips horizontally (selfie view)
	draw(source, w, h, { mode = 'cover', aspect = 1, mirror = false } = {}) {
		const s = sourceSize(source)
		w = Math.max(1, Math.round(w || s.width))
		h = Math.max(1, Math.round(h || s.height))
		if (this.canvas.width != w || this.canvas.height != h) {
			this.canvas.width = w
			this.canvas.height = h
		}

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
			ctx.save()
			ctx.translate(w / 2, h / 2)
			if (mirror) ctx.scale(-1, 1)
			ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
			ctx.restore()
		}

		return this.read()
	}

	// Reads the pixels of the internal canvas
	read() {
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
		return this
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
