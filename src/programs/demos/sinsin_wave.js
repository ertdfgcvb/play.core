/**
@author ertdfgcvb
@title  Sin Sin
@desc   Wave variation
[header]
*/

const pattern = '┌┘└┐╰╮╭╯'.split('')

export function main(coord, context, cursor, buffers){
	const t = context.time * 0.0005
	const x = coord.x
	const y = coord.y
	const o = Math.sin(y * x * Math.sin(t) * 0.003 + y * 0.01 + t) * 20
	const i = Math.round(Math.abs(x + y + o)) % pattern.length
	return pattern[i]
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, { shadowStyle : 'gray' })
}
