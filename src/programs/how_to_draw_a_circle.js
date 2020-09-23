/**
@author No1
@title  How to draw a circle
@desc   Draw a SDF square
[header]
*/

import { length } from "/src/modules/vec2.js"

export function main(coord, context, cursor, buffers){

	// Used to fix screen aspect
	const a = Math.min(context.cols, context.rows)

    // contex.aspect contains the cell aspect ratio
	const aspectRatio = cursor.pressed ? context.aspect : 1

	// Coordinate space (-1, 1) & corrected screen aspect (a)
    const st = {
        x : 2.0 * (coord.x - context.cols / 2) / a * aspectRatio, // apply aspect
        y : 2.0 * (coord.y - context.rows / 2) / a
    }

	// Distance of point from center
	const l = length(st)
    return l < 0.6  ? 'X' : '.'
}

// Draw some info
import { drawBox } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
	// Apply some rounding
	const ar = cursor.pressed ? (''+context.aspect).substr(0, 8) : 1

	// Output string
	let txt = ''
	txt += 'Hold the cursor button\n'
	txt += 'to change the aspect ratio.\n'
	txt += 'aspectRatio = ' + ar + '\n'

	// Box style
	const style = {
		x : 3,
		y : 2,
		width : 32,
		height : 6,
		txt : txt,
		background : 'yellow',
		borderStyle : 'double'
	}

	// Finally draw the box
    drawBox(style, buffers)
}