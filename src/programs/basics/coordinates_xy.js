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

	// Shortcuts for frame and coord
	const f = context.frame
	const {x, y} = coord

	// Invert direction for odd rows
	if (coord.y % 2 == 0) {
		return density[(y + x + f) % density.length]
	} else {
		return density[(y + context.cols - x + f) % density.length]
	}
}
