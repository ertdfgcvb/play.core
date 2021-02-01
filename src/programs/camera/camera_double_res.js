/**
[header]
@author ertdfgcvb
@title  Camera double resolution
@desc   Doubled vertical resolution input from camera
*/

import { CSS3 } from '/src/modules/color.js'
import Camera from '/src/modules/camera.js'
import Canvas from '/src/modules/canvas.js'

const cam = Camera.init()
const can = new Canvas()
// For a debug view uncomment the following line:
// can.display(document.body, 10, 10)

// Palette for quantization
const pal = []
pal.push(CSS3.red)
pal.push(CSS3.blue)
pal.push(CSS3.white)
pal.push(CSS3.black)
pal.push(CSS3.lightblue)

// Camera data
const data = []

export function pre(context, cursor, buffer) {
	const a = context.metrics.aspect

	// The canvas is resized to the double of the height of the context
	can.resize(context.cols, context.rows * 2)

	// Also the aspect ratio needs to be doubled
	can.cover(cam, a * 2).quantize(pal).mirrorX().writeTo(data)
}

export function main(coord, context, cursor, buffer) {
	// Coord also contains the index of each cell:
	const idx   = coord.y * context.cols * 2 + coord.x
	const upper = data[idx]
	const lower = data[idx + context.cols]

	return {
		char :'▄',
		color : lower.hex,
		backgroundColor : upper.hex
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer)
}

