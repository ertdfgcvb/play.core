/**
@author ertdfgcvb
@title  Time: frames
@desc   Use of context.frame
[header]
*/

// The default framerate can be altered
// by exporting a 'settings' object (see the manual for details).
export const settings = { fps : 10 }

export function main(coord, context, cursor, buffer) {
	const f = context.frame
	return String.fromCharCode((coord.y + coord.x + f) % 32 + 65)
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer, {
		color : 'white', background : 'royalblue', shadowStyle : 'gray'
	})
}
