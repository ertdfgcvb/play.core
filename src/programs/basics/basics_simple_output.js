/**
@author No1
@title  Simple output
@desc   The smallest program possible?
[header]
*/

export function main(coord, context, cursor){
	return '?'
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, {
		color : 'white', background : 'blue', shadowStyle : 'gray'
	})
}
