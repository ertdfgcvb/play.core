/**
@author ertdfgcvb
@title  How to draw a circle
@desc   Use of context.metrics.aspect
*/

import { length } from '@ertdfgcvb/play/vec2.js'

export function main(coord, { cols, rows, metrics, cursor }) {

	// metrics.aspect holds the font (or cell) aspect ratio
	const aspectRatio = cursor.pressed ? 1 : metrics.aspect

	// Transform coordinate space to (-1, 1)
	// width corrected screen aspect (m) and cell aspect (aspectRatio)
	const m = Math.min(cols * aspectRatio, rows)
	const st = {
		x : 2.0 * (coord.x - cols / 2) / m * aspectRatio, // apply aspect
		y : 2.0 * (coord.y - rows / 2) / m
	}

	// Distance of each cell from the center (0, 0)
	const l = length(st)

	// 0.7 is the radius of the circle
	return l < 0.7  ? 'X' : '.'
}

// A window with its own style; the content is a function, updated each frame
import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()

desk.open({
	x               : 2,
	y               : 1,
	title           : 'aspect',
	backgroundColor : 'tomato',
	border          : 'double',
	shadow          : 'gray',
	content         : ({ cursor, metrics }) => {
		// Apply some rounding to the aspect for better output
		const ar = cursor.pressed ? 1 : String(metrics.aspect).slice(0, 8)
		return 'Hold the cursor button\n' +
			'to change the aspect ratio:\n' +
			'aspectRatio = ' + ar
	},
})

export function post(ctx) {
	desk.update(ctx)
}
