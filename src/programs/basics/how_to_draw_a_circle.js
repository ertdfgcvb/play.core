/**
@author ertdfgcvb
@title  How to draw a circle
@desc   Use of context.metrics.aspect
[header]
*/

import { length } from '/src/modules/vec2.js'

export function main(coord, context, cursor, buffers){

	// Used to fix screen aspect
	const m = Math.min(context.cols, context.rows)

    // contex.aspect contains the cell aspect ratio
	const aspectRatio = cursor.pressed ? context.metrics.aspect : 1

	// Coordinate space (-1, 1) & corrected screen aspect (a)
    const st = {
        x : 2.0 * (coord.x - context.cols / 2) / m * aspectRatio, // apply aspect
        y : 2.0 * (coord.y - context.rows / 2) / m
    }

	// Distance of point from center
	const l = length(st)
    return l < 0.6  ? 'X' : '.'
}

// Draw some info
import { drawBox } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	// Apply some rounding
	const ar = cursor.pressed ? (''+context.metrics.aspect).substr(0, 8) : 1

	// Output string
	let text = ''
	text += 'Hold the cursor button\n'
	text += 'to change the aspect ratio:\n'
	text += 'aspectRatio = ' + ar + '\n'

	// Custom box style
	const style = {
		background : 'tomato',
		borderStyle : 'double',
		shadowStyle : 'gray'
	}

	// Finally draw the box
    drawBox(text, style, buffers)
}