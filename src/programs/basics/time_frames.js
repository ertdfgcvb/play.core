/**
@author ertdfgcvb
@title  Time: frames
@desc   Use of context.frame (ASCII horizon)
[header]
*/

// The default framerate can be altered
// by exporting a 'settings' object (see the manual for details).
export const settings = { fps : 30 }

export function main(coord, context, cursor, buffer) {
	const z = Math.floor((coord.y - context.rows / 2))
	if (z == 0) return ' '

	const code = Math.floor((coord.x - context.cols/2) / z + context.frame	* 0.3)
	return String.fromCharCode(code % 94 + 32)
}

// Display some info
import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer, {
		color : 'white', background : 'royalblue', shadowStyle : 'gray'
	})
}
