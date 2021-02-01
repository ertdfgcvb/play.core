/**
[header]
@author ertdfgcvb
@title  Sin Sin
@desc   Wave variation
*/

const pattern = '┌┘└┐╰╮╭╯'

const { sin, round, abs } = Math

export function main(coord, context, cursor, buffer) {
	const t = context.time * 0.0005
	const x = coord.x
	const y = coord.y
	const o = sin(y * x * sin(t) * 0.003 + y * 0.01 + t) * 20
	const i = round(abs(x + y + o)) % pattern.length
	return pattern[i]
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer, { shadowStyle : 'gray' })
}
