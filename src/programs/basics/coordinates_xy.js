/**
@author ertdfgcvb
@title  Coordinates: x, y
@desc   Use of coord.x and coord.y
[header]
*/

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.:!?'

export function main(coord, context, cursor, buffer) {
	// To generate an output return a character
	// or an object with a “char” field, for example {char: 'x'}
	const i = (coord.y + coord.x) % chars.length
	return chars[i]
}
