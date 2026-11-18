/**
@author ertdfgcvb
@title  Time: frames
@desc   Use of context.frame (ASCII horizon)
*/

// The default framerate can be altered
// by exporting a 'settings' object (see the manual for details).
export const settings = { fps : 30 }

export function main(coord, { cols, rows, frame }) {
	const z = Math.floor((coord.y - rows / 2))

	// Avoid division by zero
	if (z == 0) return ' '

	// Calculate a fake perspective
	const val = (coord.x - cols / 2) / z

	// Add time (frame) for animation
	// and make sure to get a displayable charCode (int, positive, valid range)
	const code = Math.floor(val + cols / 2 + frame * 0.3) % 94 + 32
	return String.fromCharCode(code)
}

// Display some info
import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(ctx) {
	desk.update(ctx)
}
