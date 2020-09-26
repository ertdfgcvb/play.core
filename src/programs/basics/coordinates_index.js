/**
@author ertdfgcvb
@title  Coordinates: index
@desc   Use of coord.index
[header]
*/

// Global variables have scope in the whole module.
const chars = '▁▂▃▄▅▆▇▆▅▄▃▂▁ '.split('')

// Resize the browser window to modify the pattern.
export function main(coord, context, cursor, buffers){
	const i = coord.index % chars.length
	return chars[i]
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, {
		color : 'white', background : 'blue', shadowStyle : 'gray'
	})
}
