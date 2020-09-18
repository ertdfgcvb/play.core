/**
@author No1
@title  Camera grayscale
@desc   Grayscale input from camera
[header]
*/

import {sort} from "/src/modules/sort.js"
import {map} from "/src/modules/num.js"
import cam from "/src/modules/camera.js"

const c = cam.init()
// For a debug view uncomment the following line:
// c.display(document.body, 10, 10)

const chars = sort(" .x?▁▂▃▄▅▆▇█".split(''))

export function pre(context, cursor, buffers){
	c.cover(context).normalize().mirrorX().write(buffers.data)
}

export function main(coord, context, cursor, buffers){
	// Coord also contains the index of each cell:
	const color = buffers.data[coord.index]
	const index = Math.floor(color.gray / 255.0 * chars.length)
	return chars[index]
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers)
}
