/**
@author ertdfgcvb
@title  Camera double resolution
@desc   Doubled vertical resolution input from camera
[header]
*/

import { sort } from '/src/modules/sort.js'
import Camera from '/src/modules/camera.js'
import { X11 } from '/src/modules/palettes.js'

const cam = Camera.init()
// For a debug view uncomment the following line:
// cam.display(document.body, 10, 10)

const pal = ['red', 'blue', 'white', 'black'].map( e=> {
	return X11[e].rgb
})

export function pre(context, cursor, buffers){
	cam.cover({cols:context.cols, rows:context.rows*2}).quantize(pal).mirrorX().write(buffers.data)
}

export function main(coord, context, cursor, buffers){
	// Coord also contains the index of each cell:
	const idx   = coord.y * context.cols * 2 + coord.x
	const upper = buffers.data[idx]
	const lower = buffers.data[idx + context.cols]

	return {
		char       :'▄',
		color      : `rgb(${lower.r},${lower.g},${lower.b})`,
		background : `rgb(${upper.r},${upper.g},${upper.b})`
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers)
}
