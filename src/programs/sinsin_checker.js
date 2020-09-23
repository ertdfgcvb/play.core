/**
@author No1
@title  Sin Sin (Checker)
@desc   Resize the window to modify the pattern
[header]
*/

// Globals have module scope
const chars = [" _000111_ ".split(''), ".+abc+.      ".split('')]
const col = ['black', 'blue']
const weights = [100, 700]

// This is the main loop.
// Character coordinates are passed in coord {x, y, index}.
// The function must return a single character or, alternatively, an object:
// {char, color, backgroung, weight}.

const f = Math.floor
const s = Math.sin

export function main(coord, context, cursor, buffers){
	const h = context.rows
	const w = context.cols
	const t = context.time * 0.001
	const x = coord.x - w/2
	const y = coord.y - h/2
	const o = s(y * x * 0.001 + y * x * 0.002 + t ) * 40
	const i = f(Math.abs(x + y + o))
	const c = (f(coord.x * 0.09) + f(coord.y * 0.09)) % 2
	return {
		char       : chars[c][i % chars[c].length],
		color      : 'black', //col[c],
		background : 'white', //col[(c+1)%2],
		weight     : weights[c],
	}
}

import { drawInfo } from "/src/modules/drawbox.js"

// This function is called after the main loop and is useful
// to manipulate the buffers; in this case with a window overlay.
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}
