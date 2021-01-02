/**
@author ertdfgcvb
@title  Coordinates: x, y
@desc   Use of coord.x and coord.y
[header]
*/

export function main(coord, context) {
	const char = String.fromCharCode((coord.y + coord.x) % 62 + 65)
	return char
}
