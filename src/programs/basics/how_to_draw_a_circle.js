/**
[header]
@author ertdfgcvb
@title  How to draw a circle
@desc   Use of context.metrics.aspect
*/

import { length } from '/src/modules/vec2.js'

export function main(coord, context, cursor, buffer) {

    // contex.metrics.aspect contains the font (or cell) aspect ratio
	const aspectRatio = cursor.pressed ? context.metrics.aspect : 1

	// Transform coordinate space to (-1, 1)
	// width corrected screen aspect (m) and cell aspect (aspectRatio)
    const m = Math.min(context.cols, context.rows)
    const st = {
        x : 2.0 * (coord.x - context.cols / 2) / m * aspectRatio, // apply aspect
        y : 2.0 * (coord.y - context.rows / 2) / m
    }

	// Distance of each cell from the center (0, 0)
	const l = length(st)

	// 0.6 is the radius of the circle
    return l < 0.6  ? 'X' : '.'
}

// Draw some info
import { drawBox } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	// Apply some rounding to the aspect for better output
	const ar = cursor.pressed ? (''+context.metrics.aspect).substr(0, 8) : 1

	// Output string
	let text = ''
	text += 'Hold the cursor button\n'
	text += 'to change the aspect ratio:\n'
	text += 'aspectRatio = ' + ar + '\n'

	// Custom box style
	const style = {
		backgroundColor : 'tomato',
		borderStyle : 'double',
		shadowStyle : 'gray'
	}

	// Finally draw the box
    drawBox(text, style, buffer, context.cols, context.rows)
}