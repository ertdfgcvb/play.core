/**
@author ertdfgcvb
@title  Cursor
@desc   Crosshair example with mouse cursor
[header]
*/

export function main(coord, context, cursor, buffer) {
	// The cursor coordinates are mapped to the cell
	// (fractional, needs rounding).
	const x = Math.floor(cursor.x) // column of the cell hovered
	const y = Math.floor(cursor.y) // row of the cell hovered

	if (coord.x == x && coord.y == y) return '┼'
	if (coord.x == x) return '│'
	if (coord.y == y) return '─'
	return ' '
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer, {
		color : 'white', backgroundColor : 'royalblue', shadowStyle : 'gray'
	})
}
