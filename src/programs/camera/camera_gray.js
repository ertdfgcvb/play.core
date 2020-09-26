/**
@author ertdfgcvb
@title  Camera grayscale
@desc   Grayscale input from camera
[header]
*/

import { sort } from '/src/modules/sort.js'
import Camera from '/src/modules/camera.js'

const cam = Camera.init()
// For a debug view uncomment the following line:
// cam.display(document.body, 10, 10)

const chars = sort(' .x?▂▄▆█'.split(''))

export function pre(context, cursor, buffers){
	cam.cover(context).normalize().mirrorX().write(buffers.data)
}

export function main(coord, context, cursor, buffers){
	// Coord also contains the index of each cell:
	const color = buffers.data[coord.index]
	const index = Math.floor(color.gray / 255.0 * (chars.length-1))
	return chars[index]
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers)
}
