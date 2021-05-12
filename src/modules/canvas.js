/**
@module   canvas.js
@desc     A wrapper for a canvas element
@category public

A canvas 'wrapper' class.
The purpose is to offer a ready to use buffer (a "pixel" array
of {r, g, b, (a, v)} objects) of the same size of the ASCII context (or not)
which can be read or sampled.
Some convenience functions are provided.

Resizes the canvas:
- resize(w, h)

Five main functions are implemented to copy a source (canvas, video, image)
to the internal canvas:
- image(source)  // resizes the canvas to the source image and copies it
- copy(source, ...)
- cover(source, ...)
- fit(source, ...)
- center(source, ...)

A call to these functions will also update the internal 'pixels' array trough:
- loadPixels()

A few extra functions are provided to manipulate the array directly:
- mirrorX()
- normalize() // only v values
- quantize()

Finally the whole buffer can be copied to a destination trough:
- writeTo()

Or accessed with:
- get(x, y)
- sample(x, y)
*/

import { map, mix, clamp } from './num.js'

export const MODE_COVER  = Symbol()
export const MODE_FIT    = Symbol()
export const MODE_CENTER = Symbol()

const BLACK = { r:0, g:0, b:0, a:1, v:0 }
const WHITE = { r:255, g:255, b:255, a:1, v:1 }

export default class Canvas {

	constructor(sourceCanvas) {
		this.canvas = sourceCanvas || document.createElement('canvas')

		// Initialize the canvas as a black 1x1 image so it can be used
		this.canvas.width = 1
		this.canvas.height = 1
		this.ctx = this.canvas.getContext('2d')
		this.ctx.putImageData(this.ctx.createImageData(1, 1), 0, 0);

		// A flat buffer to store image data
		// in the form of {r, g, b, [a, v]}
		this.pixels = []
		this.loadPixels()
	}

	get width() {
		return this.canvas.width
	}

	get height() {
		return this.canvas.height
	}

	// -- Functions that act on the canvas -------------------------------------

	resize(dWidth, dHeight) {
		this.canvas.width = dWidth
		this.canvas.height = dHeight
		this.pixels.length = 0
		return this
	}

	// Copies the source canvas or video element to dest via drawImage
	// allows distortion, offsets, etc.
	copy(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {

		sx = sx || 0
		sy = sy || 0
		sWidth = sWidth || source.videoWidth || source.width
		sHeight = sHeight || source.videoHeight || source.height

		dx = dx || 0
		dy = dy || 0
		dWidth = dWidth || this.canvas.width
		dHeight = dHeight || this.canvas.height

		this.ctx.drawImage(source, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
		this.loadPixels()

		return this
	}

	// Resizes the canvas to the size of the source image
	// and paints the image on it.
	image(source) {
		const w = source.videoWidth || source.width
		const h = source.videoHeight || source.height
		this.resize(w, h)
		this.copy(source, 0, 0, w, h, 0, 0, w, h)
		return this
	}

	// Covers the destintation canvas with the source image
	// without resizing the canvas.
	// An otional aspect factor can be passed.
	cover(source, aspect=1) {
		centerImage(source, this.canvas, 1, aspect, MODE_COVER)
		this.loadPixels()
		return this
	}

	// Fits the source image on the destintation canvas
	// without resizing the canvas.
	// An otional aspect factor can be passed.
	fit(source, aspect=1) {
		centerImage(source, this.canvas, 1, aspect, MODE_FIT)
		this.loadPixels()
		return this
	}

	// Centers the source image on the destination canvas
	// without resizing the canvas.
	// Optional scaling factors can be passed.
	center(source, scaleX=1, scaleY=1) {
		centerImage(source, this.canvas, scaleX, scaleY, MODE_CENTER)
		this.loadPixels()
		return this
	}

	// -- Functions that act directly on the pixel array -----------------------

	mirrorX() {
		const w = this.canvas.width
		const h = this.canvas.height
		const buf = this.pixels
		const half = Math.floor(w / 2)
		for (let j=0; j<h; j++) {
			for (let i=0; i<half; i++) {
				const a = w * j + i
				const b = w * (j + 1) - i - 1
				const t = buf[b]
				buf[b] = buf[a]
				buf[a] = t
			}
		}
		return this
	}

	normalize() {
		normalizeGray(this.pixels, this.pixels, 0.0, 1.0)
		return this
	}

	quantize(palette) {
		paletteQuantize(this.pixels, this.pixels, palette)
		return this
	}

	// -- Getters (pixel array) ------------------------------------------------

	// Get color at coord
	get(x, y) {
		if (x < 0 || x >= this.canvas.width) return BLACK
		if (y < 0 || y >= this.canvas.height) return BLACK
		return this.pixels[x + y * this.canvas.width]
	}

	// Sample value at coord (0-1)
	sample(sx, sy, gray=false) {
		const w = this.canvas.width
		const h = this.canvas.height

	  	const x  = sx * w - 0.5
	  	const y  = sy * h - 0.5

		let l = Math.floor(x)
  		let b = Math.floor(y)
  		let r = l + 1
  		let t = b + 1
  		const lr = x - l
  		const bt = y - b

  		// Instead of clamping use safe "get()"
  		// l = clamp(l, 0, w - 1) // left
  		// r = clamp(r, 0, w - 1) // right
  		// b = clamp(b, 0, h - 1) // bottom
  		// t = clamp(t, 0, h - 1) // top

  		// Avoid 9 extra interpolations if only gray is needed
  		if (gray) {
	  		const p1 = mix(this.get(l, b).v, this.get(r, b).v, lr)
	  		const p2 = mix(this.get(l, t).v, this.get(r, t).v, lr)
	  		return mix(p1, p2, bt)
	  	} else {
	  		const p1 = mixColors(this.get(l, b), this.get(r, b), lr)
	  		const p2 = mixColors(this.get(l, t), this.get(r, t), lr)
	  		return mixColors(p1, p2, bt)
	  	}
	}

	// Read
	loadPixels() {
		// New data could be shorter,
		// empty without loosing the ref.
		this.pixels.length = 0
		const w = this.canvas.width
		const h = this.canvas.height
		const data = this.ctx.getImageData(0, 0, w, h).data
		let idx = 0
		for (let i=0; i<data.length; i+=4) {
			const r = data[i  ] // / 255.0,
			const g = data[i+1] // / 255.0,
			const b = data[i+2] // / 255.0,
			const a = data[i+3] / 255.0 // CSS style
			this.pixels[idx++] = {
				r, g, b, a,
				v : toGray(r, g, b)
			}
		}
		return this
	}

	// -- Helpers --------------------------------------------------------------

	writeTo(buf) {
		if (Array.isArray(buf)) {
			for (let i=0; i<this.pixels.length; i++) buf[i] = this.pixels[i]
		}
		return this
	}

	// Debug -------------------------------------------------------------------

	// Attaches the canvas to a target element for debug purposes
	display(target, x=0, y=0) {
		target = target || document.body
		this.canvas.style.position = 'absolute'
		this.canvas.style.left = x + 'px'
		this.canvas.style.top = y + 'px'
		this.canvas.style.width = 'auto'
		this.canvas.style.height = 'auto'
		this.canvas.style.zIndex = 10
		document.body.appendChild(this.canvas)
	}
}


// Helpers ---------------------------------------------------------------------

function mixColors(a, b, amt) {
	return {
		r : mix(a.r, b.r, amt),
		g : mix(a.g, b.g, amt),
		b : mix(a.b, b.b, amt),
		v : mix(a.v, b.v, amt)
	}
}

function getElementSize(source) {
	const type = source.nodeName
	const width = type == 'VIDEO' ? source.videoWidth : source.width || 0
	const height = type == 'VIDEO' ? source.videoHeight : source.height || 0
	return { width, height }
}

function centerImage(sourceCanvas, targetCanvas, scaleX=1, scaleY=1, mode=MODE_CENTER) {

	// Source size
	const s = getElementSize(sourceCanvas)

	// Source aspect (scaled)
	const sa = (scaleX * s.width) / (s.height * scaleY)

	// Target size and aspect
	const tw = targetCanvas.width
	const th = targetCanvas.height
	const ta = tw / th

	// Destination width and height (adjusted for cover / fit)
	let dw, dh

	// Cover the entire dest canvas with image content
	if (mode == MODE_COVER) {
		if (sa > ta) {
			dw = th * sa
			dh = th
		} else {
			dw = tw
			dh = tw / sa
		}
	}
	// Fit the entire source image in dest tanvas (with black bars)
	else if (mode == MODE_FIT) {
		if (sa > ta) {
			dw = tw
			dh = tw / sa
		} else {
			dw = th * sa
			dh = th
		}
	}
	// Center the image
	else if (mode == MODE_CENTER) {
		dw = s.width * scaleX
		dh = s.height * scaleY
	}

	// Update the targetCanvas with correct aspect ratios
	const ctx = targetCanvas.getContext('2d')

	// Fill the canvas in case of 'fit'
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, tw, th)
	ctx.save()
	ctx.translate(tw/2, th/2)
	ctx.drawImage(sourceCanvas, -dw/2, -dh/2, dw, dh)
	ctx.restore()
}

// Use this or import 'rgb2gray' from color.js
// https://en.wikipedia.org/wiki/Grayscale
function toGray(r, g, b) {
	return Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722) / 255.0
}

function paletteQuantize(arrayIn, arrayOut, palette) {
	arrayOut = arrayOut || []

	// Euclidean:
	// const distFn = (a, b) => Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)

	// Redmean:
	// https://en.wikipedia.org/wiki/Color_difference
	const distFn = (a, b) => {
		const r = (a.r + b.r) * 0.5
		let s = 0
		s += (2 + r / 256) * Math.pow(a.r - b.r, 2)
		s += 4 * Math.pow(a.g - b.g, 2)
		s += (2 + (255 - r) / 256) * Math.pow(a.b - b.b, 2)
		return Math.sqrt(s)
	}

	for (let i=0; i<arrayIn.length; i++) {
		const a = arrayIn[i]
		let dist = Number.MAX_VALUE
		let nearest
		for (const b of palette) {
			const d = distFn(a, b)
			if (d < dist) {
				dist = d
				nearest = b
			}
		}
		arrayOut[i] = {...nearest, v : arrayIn[i].v } // Keep the original gray value intact
	}
	return arrayOut
}

// Normalizes the gray component (auto levels)
function normalizeGray(arrayIn, arrayOut, lower=0.0, upper=1.0) {
	arrayOut = arrayOut || []

	let min = Number.MAX_VALUE
	let max = 0
	for (let i=0; i<arrayIn.length; i++) {
		min = Math.min(arrayIn[i].v, min)
		max = Math.max(arrayIn[i].v, max)
	}
	// return target.map( v => {
	//     return map(v, min, max, 0, 1)
	// })
	for (let i=0; i<arrayIn.length; i++) {
		const v = min == max ? min : map(arrayIn[i].v, min, max, lower, upper)
		arrayOut[i] = {...arrayOut[i], v}
	}
	return arrayOut
}
