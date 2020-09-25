/**
@author No1
@title  Sin Sin (Wave)
@desc   Resize the window to modify the pattern
[header]
*/

// Globals have module scope
const chars = "┌┘└┐╰╮╭╯".split('')

// This is the main loop.
// Character coordinates are passed in coord {x, y, index}.
// The function must return a single character or, alternatively, an object:
// {char, color, backgroung, weight}.
export function main(coord, context, cursor, buffers){
	const t = context.time * 0.0005
	const x = coord.x
	const y = coord.y
	const o = Math.sin(y * x * Math.sin(t) * 0.003 + y * 0.01 + t) * 20
	const i = Math.round(Math.abs(x + y + o)) % chars.length
	return {
		char       : chars[i],
		weight     : '700'
	}
}

import { drawInfo } from "/src/modules/drawbox.js"

// This function is called after the main loop and is useful
// to manipulate the buffers; in this case with a window overlay.
export function post(context, cursor, buffers){
    //drawInfo(context, cursor, buffers)
}
