/**
@author ertdfgcvb
@title  Coordinates: x, y
@desc   Use of coord.x and coord.y
[header]
*/

export function main(coord, context, cursor, buffer) {
	// To generate an output return a character
	// or an object with a “char” field, for example {char: 'x'}
	return String.fromCharCode((coord.y + coord.x) % 62 + 65)
}
