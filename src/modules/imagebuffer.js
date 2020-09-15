/**
An abstraction for images or video streams.
NOTE: this is not a general purpose imaging class.
The purpose is to offer a ready to use buffer (an array of grayscale or {r,g,b,a} values)
with the size of the (ascii) context and adjusted aspect ratio.

Image data is passed as the follwing:

   0. source (canvas or video element)
-> 1. copy to a resized & adjusted canvas
-> 2. copy to array buffer (gray or rgba)
-> 3. manipulate the buffer (mirror, normalize, etc)
-> 4. write it to a destination or return it directly

Three main functions are implemented to resize / scale the source image:
- cover(context, scale)
- fit(context, scale)
- copy(x, y, w, h)

Two functions to transfer the canvas to an array
- gray()
- rgba()

One of the above functions has to be called before buffer functions can be used
- mirrorX()
- normalize() // only for grayscale

Typical use could be (video):

import cam from "/src/modules/camera.js"

const c = cam.init() // The camera module returns an ImageBuffer object

export function pre(asciiContext, pointer, buffers) {
	const scale = 1.5 // zoom in slightly
	c.cover(asciiContext, scale).gray().normalize().mirrorX().write(buffers.data)
}

*/

import { map } from './num.js'

export const TYPE_EMPTY = Symbol()
export const TYPE_RGBA  = Symbol()
export const TYPE_GRAY  = Symbol()
export const MODE_COVER = Symbol()
export const MODE_FIT   = Symbol()

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

	// 1. ----------------------------------------------------------------------

	// Resizes the destination canvas to the size of the ascii context
	// and covers it with the source image.
	// An otional scaling factor can be passed.
	cover(context, scale=1) {
		// Adjust the target canvas
		this.canvas.width = context.cols
		this.canvas.height = context.rows
		centerImage(this.sourceCanvas, this.canvas, scale, context.aspect, MODE_COVER, false)
		this.type = TYPE_EMPTY
		return this
	}

	// Resizes the destination canvas to the size of the ascii context
	// and fits the source image in it.
	// An otional scaling factor can be passed.
	fit(context, scale=1) {
		// Adjust the target canvas
		this.canvas.width = context.cols
		this.canvas.height = context.rows
		centerImage(this.sourceCanvas, this.canvas, scale, context.aspect, MODE_FIT, false)
		this.type = TYPE_EMPTY
		return this
	}

	// Raw copy of source to dest, doesn't take in account the ascii context aspect ratio and size
	copy(x, y, w, h) {
		w = w || sourceCanvas.width
		h = h || sourceCanvas.height
		this.canvas.width = w
		this.canvas.height = h
		const ctx = this.canvas.getContext('2d')
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, w, h)
		ctx.drawImage(sourceCanvas, x, y, w, h)
		this.type = TYPE_EMPTY
		return this
	}

	// 2. ----------------------------------------------------------------------

	gray(buf){
		buf = buf || this.buffer
		toGray(this.canvas, buf)
		this.type = TYPE_GRAY
		return this
	}

	rgba(buf){
		buf = buf || this.buffer
		toRGBA(this.canvas, buf)
		this.type = TYPE_RGBA
		return this
	}

	// 3. ----------------------------------------------------------------------

	mirrorX(buf){
		if (this.type == TYPE_EMPTY) return // TODO: warn?
		buf = buf || this.buffer
		// Width and height are obtained from the canvas… not super safe
		const w = this.canvas.width
		const h = this.canvas.height
		for (let j=0; j<h; j++) {
			for (let i=0; i<w/2; i++) {
				const a = w * j + i
				const b = w * (j + 1) - i - 1
				const t = buf[b]
				buf[b] = buf[a]
				buf[a] = t
			}
		}
		return this
	}

	normalize(buf, lower=0, upper=1){
		if (this.type == TYPE_EMPTY) return // TODO: warn?
		buf = buf || this.buffer
		if (this.type == TYPE_GRAY) {
			normGray(this.buffer, buf, lower, upper)
		} if (this.type == TYPE_RGBA) {
			normRGBA(this.buffer, buf, lower, upper)
		}
		return this
	}

	// 4. ----------------------------------------------------------------------

	write(buf){
		if (Array.isArray(buf)) {
			for (let i=0; i<this.buffer.length; i++) buf[i] = this.buffer[i]
		}
		return this
	}

	data(){
		return this.buffer
	}

	// TODO:
	/*
	sample(x, y){

	}

	get(x, y){

	}
	*/

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

function centerImage(sourceCanvas, targetCanvas, scale=1, aspectAdjust=1, mode=MODE_COVER, mirrorX=false){
	const type = sourceCanvas.nodeName

	// Source size and aspect
	const sw  = type == 'VIDEO' ? sourceCanvas.videoWidth : sourceCanvas.width
	const sh  = type == 'VIDEO' ? sourceCanvas.videoHeight : sourceCanvas.height
	const sa = sw / sh

	// Target size and aspect
	const tw  = targetCanvas.width
	const th  = targetCanvas.height
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
	const sx = scale
	const sy = scale * aspectAdjust // adjust aspect
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


// Fills the target array 'out' with values (0-255) from the image data
function toGray(canvas, out){
	out = out || []
	const w = canvas.width
	const h = canvas.height
	const data = canvas.getContext('2d').getImageData(0, 0, w, h).data
	let idx = 0
	for (let i=0; i<data.length; i += 4) {
		// https://en.wikipedia.org/wiki/Grayscale
		const v = data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722
		out[idx++] = Math.floor(v) // / 255.0
	}
	return out
}

// Fills the target array 'out' with rgba values (0-255) from the image data
function toRGBA(canvas, out){
	out = out || []
	const w = canvas.width
	const h = canvas.height
	const data = canvas.getContext('2d').getImageData(0, 0, w, h).data
	let idx = 0
	for (let i=0; i<data.length; i+=4) {
		out[idx++] = {
			r : data[i  ], // / 255.0,
			g : data[i+1], // / 255.0,
			b : data[i+2], // / 255.0,
			a : data[i+3]  // / 255.0
		}
	}
	return out
}

// Normalizes an array array (auto levels)
function normGray(array, out, lower=0, upper=1){
	out = out || []

	let min =  Number.MAX_VALUE
	let max = -Number.MAX_VALUE
	for (let i=0; i<array.length; i++) {
		min = Math.min(array[i], min)
		max = Math.max(array[i], max)
	}
	// return target.map( v => {
	//     return map(v, min, max, 0, 1)
	// })
	for (let i=0; i<array.length; i++) {
		out[i] = map(array[i], min, max, lower, upper)
	}
	return out
}

// Normalizes an RGBA array, each channel individually
// TODO: better / generic impl.?
function normRGBA(array, out, lower=0, upper=1){
	out = out || []

	const min = {
		r : Number.MAX_VALUE,
		g : Number.MAX_VALUE,
		b : Number.MAX_VALUE,
		a : Number.MAX_VALUE
	}

	const max = {
		r : -Number.MAX_VALUE,
		g : -Number.MAX_VALUE,
		b : -Number.MAX_VALUE,
		a : -Number.MAX_VALUE
	}

	for (let i=0; i<array.length; i++) {
		const c = array[i]
		min.r = Math.min(c.r, min.r)
		min.g = Math.min(c.g, min.g)
		min.b = Math.min(c.b, min.b)
		min.a = Math.min(c.a, min.a)
		max.r = Math.max(c.r, max.r)
		max.g = Math.max(c.g, max.g)
		max.b = Math.max(c.b, max.b)
		max.a = Math.max(c.a, max.a)
	}

	for (let i=0; i<array.length; i++) {
		out[i] = {
			r : map(array[i], min.r, max.r, lower, upper),
			g : map(array[i], min.g, max.g, lower, upper),
			b : map(array[i], min.b, max.b, lower, upper),
			a : map(array[i], min.a, max.a, lower, upper)
		}
	}
	return out
}
