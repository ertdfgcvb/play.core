/**
@author No1
@title  Camera RGB
@desc   Color input from camera (warning: slow FPS)
[header]
*/
import {map} from "/src/modules/num.js"
import {sort} from "/src/modules/sort.js"
import cam from "/src/modules/camera.js"

const c = cam.init()
// For a debug view uncomment the following line:
// c.display(document.body, 10, 10)

const chars = ' .+=?X#ABC'.split('')

// A palette used for color quantization
const pal = [
	{r:  0, g:  0, b:  0},
	{r:255, g:  0, b:  0},
	{r:255, g:255, b:  0},
	{r:  0, g:100, b:250},
	{r:100, g:255, b:255},
	// {r:255, g:182, b:193},
	// {r:255, g:255, b:255},
]

export function pre(context, cursor, buffers){
	// Scale the image slightly
	const scale = map(Math.sin(context.time * 0.001), -1, 1, 1, 3)
	c.cover(context, scale).mirrorX().quantize(pal).write(buffers.data)
}

export function main(coord, context, cursor, buffers){
	// Coord also contains the index of each cell:
	const color = buffers.data[coord.index]
	const index = Math.floor(color.gray / 255.0 * chars.length)
	return {
		char       : chars[index],
		color      : 'white',
		background : `rgb(${c.r},${c.g},${c.b})`
	}
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
	//drawInfo(context, cursor, buffers)
}
