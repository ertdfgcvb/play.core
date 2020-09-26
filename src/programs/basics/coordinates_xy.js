/**
@author ertdfgcvb
@title  Coordinates: x, y
@desc   Use of coord.x and coord.y
[header]
*/

export function main(coord, context, cursor, buffers){
	const char = String.fromCharCode((coord.y + coord.x) % 32 + 65)
	return char
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, {
		color : 'white', background : 'blue', shadowStyle : 'gray'
	})
}
