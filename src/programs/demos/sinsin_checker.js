/**
@author ertdfgcvb
@title  Sin Sin
@desc   Checker variation
[header]
*/

const pattern = [
	" _000111_ ".split(''),
	".+abc+.      ".split('')
]
const col = ['black', 'blue']
const weights = [100, 700]

const { floor, sin } = Math

export function main(coord, context, cursor, buffers){
	const t = context.time * 0.001
	const x = coord.x - context.cols / 2
	const y = coord.y - context.rows / 2
	const o = sin(y * x * 0.001 + y * x * 0.002 + t ) * 40
	const i = floor(Math.abs(x + y + o))
	const c = (floor(coord.x * 0.09) + floor(coord.y * 0.09)) % 2
	return {
		char       : pattern[c][i % pattern[c].length],
		color      : 'black', //col[c],
		background : 'white', //col[(c+1)%2],
		weight     : weights[c],
	}
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers, { shadowStyle : 'gray' })
}
