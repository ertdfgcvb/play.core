/**
[header]
@author ertdfgcvb
@title  Coordinates: x, y
@desc   Use of coord.x and coord.y
*/

const density = 'Ñ@#W$9876543210?!abc;:+=-,._ '

export function main(coord, context, cursor, buffer) {
	// To generate an output return a single character
	// or an object with a “char” field, for example {char: 'x'}

	// Shortcuts for frame, cols and coord (x, y)
	const {cols, frame } = context
	const {x, y} = coord

	// -1 for even lines, 1 for odd lines
	const sign = y % 2 * 2 - 1
	const index = (cols + y + x * sign + frame) % density.length

	return density[index]
}