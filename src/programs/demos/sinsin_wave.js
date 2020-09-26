/**
@author ertdfgcvb
@title  Sin Sin
@desc   Wave variation
[header]
*/

const chars = '┌┘└┐╰╮╭╯'.split('')

export function main(coord, context, cursor, buffers){
	const t = context.time * 0.0005
	const x = coord.x
	const y = coord.y
	const o = Math.sin(y * x * Math.sin(t) * 0.003 + y * 0.01 + t) * 20
	const i = Math.round(Math.abs(x + y + o)) % chars.length
	return {
		char   : chars[i],
		weight : '700'
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers)
}
