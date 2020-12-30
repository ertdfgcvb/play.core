/**
@author ertdfgcvb
@title  Camera grayscale
@desc   Grayscale input from camera
[header]
*/

import { sort } from '/src/modules/sort.js'
import Camera from '/src/modules/camera.js'
import Canvas from '/src/modules/canvas.js'

const cam = Camera.init()
const can = new Canvas()
// For a debug view uncomment the following line:
// can.display(document.body, 10, 10)

const density = sort(' .x?▂▄▆█', 'Simple Console', false)

export function pre(context, cursor, buffers) {
	const a = context.metrics.aspect

	// The canvas is resized so that 1 cell -> 1 pixel
	can.resize(context.cols, context.rows)
	// The cover() function draws an image (cam) to the canvas covering
	// the whole frame. The aspect ratio can be adjusted with the second
	// parameter.
	can.cover(cam, a).mirrorX().normalize().writeTo(buffers.data)
}

export function main(coord, context, cursor, buffers) {
	// Coord also contains the index of each cell:
	const color = buffers.data[coord.index]
	const index = Math.floor(color.gray * (density.length-1))
	return density[index]
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers) {
	drawInfo(context, cursor, buffers)
}

