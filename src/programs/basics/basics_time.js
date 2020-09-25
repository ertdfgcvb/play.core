/**
@author No1
@title  Simple output
@desc   The smallest program possible?
[header]
*/

export function main(coord, context){
	// Time can be measured in frames or in milliseconds
	// const t = context.time * 0.01
	const f = context.frame
	return String.fromCharCode((coord.y + coord.x + f) % 32 + 65)
}


import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, {
		color : 'white', background : 'blue', shadowStyle : 'gray'
	})
}
