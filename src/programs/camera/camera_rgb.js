/**
@author ertdfgcvb
@title  Camera RGB
@desc   Color input from camera (quantized)
[header]
*/
import { map } from '/src/modules/num.js'
import { rgb2hex, rgb}  from '/src/modules/colors.js'
import Camera from '/src/modules/camera.js'

const cam = Camera.init()
// For a debug view uncomment the following line:
// cam.display(document.body, 10, 10)

const chars = ' .+=?X#ABC'.split('')

// A custom palette used for color quantization:
const pal = []
pal.push(rgb(  0,   0,   0))
pal.push(rgb(255,   0,   0))
pal.push(rgb(255, 255,   0))
pal.push(rgb(  0, 100, 250))
pal.push(rgb(100, 255, 255))
//pal.push(rgb(255, 182, 193))
//pal.push(rgb(255, 255, 255))

export function pre(context, cursor, buffers){
	// Add a zoom effect
	const scale = map(Math.sin(context.time * 0.001), -1, 1, 1, 3)
	cam.cover(context, {x:scale, y:scale}).mirrorX().quantize(pal).write(buffers.data)
}

export function main(coord, context, cursor, buffers){
	// Coord also contains the index of each cell
	const color = buffers.data[coord.index]
	// Add some chars to the output
	const index = Math.floor(color.gray / 255.0 * (chars.length-1))
	return {
		char       : chars[index],
		color      : 'white',
		// convert {r,g,b} obj to a valid CSS hex string
		background : rgb2hex(color)
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers)
}
