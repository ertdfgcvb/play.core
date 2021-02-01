/**
[header]
@author ertdfgcvb
@title  Time: milliseconds
@desc   Use of context.time
*/

// Globals have module scope
const pattern = 'ABCxyz01═|+:. '

// This is the main loop.
// Character coordinates are passed in coord {x, y, index}.
// The function must return a single character or, alternatively, an object:
// {char, color, background, weight}.
export function main(coord, context, cursor, buffer) {
	const t = context.time * 0.0001
	const x = coord.x
	const y = coord.y
	const o = Math.sin(y * Math.sin(t) * 0.2 + x * 0.04 + t) * 20
	const i = Math.round(Math.abs(x + y + o)) % pattern.length
	return {
		char   : pattern[i],
		fontWeight : '100', // or 'light', 'bold', '400'
	}
}

import { drawInfo } from '/src/modules/drawbox.js'

// This function is called after the main loop and is useful
// to manipulate the buffer; in this case with a window overlay.
export function post(context, cursor, buffer) {
	// An extra object can be passed to drawInfo to alter the default style
	drawInfo(context, cursor, buffer, {
		color : 'white', backgroundColor : 'royalblue', shadowStyle : 'gray'
	})
}
