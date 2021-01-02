/**
@author Eliza
@title  Color Waves
@desc   ¯\_(ツ)_/¯
*/

const chars = '¯\_(ツ)_/¯.::.ᕦ(ò_óˇ)ᕤ '.split('')

export function main(coord, context, cursor){
	const t = context.time * 0.0001

	const x = coord.x
	const y = coord.y

	const a = Math.cos(y * Math.cos(t) * 0.2 + x * 0.04 + t);
	const b = Math.sin(x * Math.sin(t) * 0.2 * y * 0.04 + t);
	const c = Math.cos(y * Math.cos(t) * 0.2 + x * 0.04 + t);

	const o =  a + b + c * 20;

	const colors = ['mediumvioletred', 'gold', 'orange', 'chartreuse', 'blueviolet', 'deeppink'];

	const i = Math.round(Math.abs(x + y + o)) % chars.length
	return {
		char       : chars[i],
		color      : colors[i % colors.length],
		weight     : '700'
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer){
	drawInfo(context, cursor, buffer)
}
