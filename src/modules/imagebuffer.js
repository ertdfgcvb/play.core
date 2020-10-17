/**
@module    imagebuffer.js
@desc      An abstraction for images or video streams
@cathegory internal

NOTE: this is not a general purpose imaging class.
The purpose is to offer a ready to use buffer (an array of {r,g,b,a,grey} values)
with the size of the (ascii) context and adjusted aspect ratio.

Image data is processed as the follwing:

   0.  source (canvas or video element)
-> 1a. copy to a resized & adjusted canvas
-> 1b. copy to array buffer (color as object: rgba + gray)
-> 2.  manipulate the buffer (mirror, normalize, etc)
-> 3.  write it to a destination or return it directly

Three main functions are implemented to resize / scale the source image:
- cover(context, scale)
- fit(context, scale)
- copy(x, y, w, h)

One of the above functions has to be called before buffer functions can be used
- mirrorX()
- normalize() // only for gray
- qauntize()

Typical use could be (video):

import cam from "/src/modules/camera.js"

const c = cam.init() // The camera module returns an ImageBuffer object

export function pre(asciiContext, pointer, buffers) {
	const scale = 1.5 // zoom in slightly
	c.cover(asciiContext, scale).normalize().mirrorX().write(buffers.data)
}

*/

import { map, mix, clamp } from './num.js'

export const TYPE_EMPTY = Symbol()
export const TYPE_GRAY  = Symbol()
export const TYPE_RGB   = Symbol()
export const TYPE_RGBA  = Symbol()
export const TYPE_RGBAG = Symbol()
export const MODE_COVER = Symbol()
export const MODE_FIT   = Symbol()

const black = {
	r    : 0,
	g    : 0,
	b    : 0,
	a    : 1.0,
	gray : 0
}

export class ImageBuffer {

	// 0. ----------------------------------------------------------------------

	constructor(sourceCanvas){
		this.sourceCanvas = sourceCanvas
		this.canvas = document.createElement("canvas")
		// A flat buffer to store image data
		// in the form of {r, g, b, [a]} or
		this.buffer = []
		this.type = TYPE_EMPTY
	}

	// 1a + 1b -----------------------------------------------------------------

	// Resizes the destination canvas to the size of the ascii context
	// and covers it with the source image.
	// An otional scaling factor can be passed.
	cover(context, scale={x:1, y:1}) {
		// Adjust the target canvas
		this.canvas.width = context.cols
		this.canvas.height = context.rows
		centerImage(this.sourceCanvas, this.canvas, scale, context.metrics.aspect, MODE_COVER, false)

		toBuffer(this.canvas, this.buffer)
		this.type = TYPE_RGBAG
		return this
	}

	// Resizes the destination canvas to the size of the ascii context
	// and fits the source image in it.
	// An otional scaling factor can be passed.
	fit(context, scale={x:1, y:1}) {
		// Adjust the target canvas
		this.canvas.width = context.cols
		this.canvas.height = context.rows

		centerImage(this.sourceCanvas, this.canvas, scale, context.metrics.aspect, MODE_FIT, false)

		toBuffer(this.canvas, this.buffer)
		this.type = TYPE_RGBAG
		return this
	}

	// Copy of source to dest, doesn't take in account the ascii context aspect ratio and size
	copy(w, h) {
		this.canvas.width  = w || this.sourceCanvas.width
		this.canvas.height = h || this.sourceCanvas.height

		const ctx = this.canvas.getContext('2d')
		// ctx.fillStyle = 'black'
		// ctx.fillRect(0, 0, w, h)
		ctx.drawImage(this.sourceCanvas, 0, 0, this.canvas.width, this.canvas.height)

		toBuffer(this.canvas, this.buffer)
		this.type = TYPE_RGBAG
		return this
	}

	// 2. ----------------------------------------------------------------------

	mirrorX(buf){
		if (this.type == TYPE_EMPTY) return // TODO: warn?
		buf = buf || this.buffer
		// Width and height are obtained from the canvas… not super safe
		for (let j=0; j<h; j++) {
			for (let i=0; i<w/2; i++) {
				const a = this.canvas.width * j + i
				const b = this.canvas.width * (j + 1) - i - 1
				const t = buf[b] // Swap
				buf[b] = buf[a]
				buf[a] = t
			}
		}
		return this
	}

	normalize(buf){
		if (this.type == TYPE_EMPTY) return // TODO: warn?
		buf = buf || this.buffer
		normalizeGray(this.buffer, buf, 0, 255)
		return this
	}

	quantize(palette, buf) {
		if (this.type == TYPE_EMPTY) return // TODO: warn?
		buf = buf || this.buffer
		paletteQuantize(this.buffer, buf, palette)
		return this
	}

	// 3. ----------------------------------------------------------------------

	write(buf){
		if (Array.isArray(buf)) {
			for (let i=0; i<this.buffer.length; i++) buf[i] = this.buffer[i]
		}
		return this
	}

	data(){
		return this.buffer
	}

	sampleGray(sx, sy){
	  	const x  = sx * this.canvas.width - 0.5
	  	const y  = sy * this.canvas.height - 0.5

		let l = Math.floor(x)
  		let b = Math.floor(y)
  		let r = l + 1
  		let t = b + 1
  		const lr = x - l
  		const bt = y - b

  		l = clamp(l, 0, this.canvas.width - 1)  // left
  		r = clamp(r, 0, this.canvas.width - 1)  // right
  		b = clamp(b, 0, this.canvas.height - 1) // borrom
  		t = clamp(t, 0, this.canvas.height - 1) // top

  		const p1 = mix(this.get(l, b).gray, this.get(r, b).gray, lr)
  		const p2 = mix(this.get(l, t).gray, this.get(r, t).gray, lr)
  		return mix(p1, p2, bt)
	}

	get(x, y){
		if (this.type == TYPE_EMPTY)          return black
		if (x < 0 || x >= this.canvas.width)  return black
		if (y < 0 || y >= this.canvas.height) return black

		return this.buffer[x + y * this.canvas.width]
	}


	// Debug -------------------------------------------------------------------

	// Attaches the canvas to a target element for debug purposes
	display(target, x=0, y=0){
		target = target || document.body
		this.canvas.style.position = "absolute"
		this.canvas.style.left = x + "px"
		this.canvas.style.top = y + "px"
		document.body.appendChild(this.canvas)
	}
}

// Helpers ---------------------------------------------------------------------

function centerImage(sourceCanvas, targetCanvas, scale={x:1, y:1}, aspectAdjust=1, mode=MODE_COVER, mirrorX=false){
	const type = sourceCanvas.nodeName

	// Source size and aspect
	const sw = type == 'VIDEO' ? sourceCanvas.videoWidth : sourceCanvas.width
	const sh = type == 'VIDEO' ? sourceCanvas.videoHeight : sourceCanvas.height
	const sa = sw / sh

	// Target size and aspect
	const tw = targetCanvas.width
	const th = targetCanvas.height
	const ta = tw / th

	// Destination width and height (adjusted for cover / fit)
	let dw, dh

	// Cover the entire dest canvas with image content
	if (mode == MODE_COVER) {
		if (sa > ta * aspectAdjust) {
			dw = th / aspectAdjust * sa
			dh = th / aspectAdjust
		} else {
			dw = tw
			dh = tw / sa
		}
	}
	// Fit the entire source image in dest tanvas (with black bars)
	else {
		if (sa > ta * aspectAdjust) {
			dw = tw
			dh = tw / sa
		} else {
			dw = th / aspectAdjust * sa
			dh = th / aspectAdjust
		}
	}

	// Update the targetCanvas with correct aspect ratios
	const sx = scale.x
	const sy = scale.y * aspectAdjust // adjust aspect
	const ctx = targetCanvas.getContext('2d')

	// Fill the canvas in case of 'fit'
	ctx.fillStyle = 'black'
	ctx.fillRect(0, 0, tw, th)
	ctx.save()
	ctx.translate(tw/2, th/2)
	ctx.scale(mirrorX ? -sx : sx, sy) // flip for mirror mode
	ctx.drawImage(sourceCanvas, -dw/2, -dh/2, dw, dh)
	ctx.restore()
}

// Fills the target array 'out' with rgba + gray values (0-255) from the image data
function toBuffer(canvas, out){
	out = out || []
	const w = canvas.width
	const h = canvas.height
	const data = canvas.getContext('2d').getImageData(0, 0, w, h).data
	let idx = 0
	for (let i=0; i<data.length; i+=4) {
		const r    = data[i  ]  // / 255.0,
		const g    = data[i+1]  // / 255.0,
		const b    = data[i+2]  // / 255.0,
		const a    = data[i+3]  / 255.0
		const gray = toGray(r, g, b)
		out[idx++] = { r, g, b, a, gray }
	}
	return out
}

// https://en.wikipedia.org/wiki/Grayscale
function toGray(r,g,b) {
	return Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722) / 255.0
}

function paletteQuantize(arrayIn, arrayOut, palette) {
	arrayOut = arrayOut || []
	const distFn = (a, b) => Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2))
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
		arrayOut[i] = {...nearest, gray : toGray(nearest.r, nearest.g, nearest.b) }
	}
	return arrayOut
}

// Normalizes the gray component (auto levels)
function normalizeGray(arrayIn, arrayOut, lower=0, upper=255){
	arrayOut = arrayOut || []

	let min =  Number.MAX_VALUE
	let max = -Number.MAX_VALUE
	for (let i=0; i<arrayIn.length; i++) {
		min = Math.min(arrayIn[i].gray, min)
		max = Math.max(arrayIn[i].gray, max)
	}
	// return target.map( v => {
	//     return map(v, min, max, 0, 1)
	// })
	for (let i=0; i<arrayIn.length; i++) {
		const gray = min == max ? min : Math.round(map(arrayIn[i].gray, min, max, lower, upper))
		arrayOut[i] = {...arrayOut[i], gray}
	}
	return arrayOut
}
