/**
@author No1
@title  xy coordinates
@desc   The smallest program possible?
[header]
*/

export function main(coord){
	return String.fromCharCode((coord.y + coord.x) % 32 + 65)
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, {
		color : 'white', background : 'blue', shadowStyle : 'gray'
	})
}
