/**
@author ertdfgcvb
@title  Cursor
@desc   Crosshair example with mouse cursor
*/

export function main(coord, { cursor }) {
	// The cursor coordinates are mapped to the cell
	// (fractional, needs rounding).
	const x = Math.floor(cursor.x) // column of the cell hovered
	const y = Math.floor(cursor.y) // row of the cell hovered

	if (coord.x == x && coord.y == y) return '┼'
	if (coord.x == x) return '│'
	if (coord.y == y) return '─'
	return (coord.x + coord.y) % 2 ? '·' : ' '
}

// The info box as a window: drag it by the title bar, close it with [■]
import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}
