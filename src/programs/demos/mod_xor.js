/**
@author ertdfgcvb
@title  Mod Xor
@desc   Patterns obtained trough modulo and xor
Inspired by this tweet by @ntsutae
https://twitter.com/ntsutae/status/1292115106763960327
[header]
*/

const pattern = "└┧─┨┕┪┖┫┘┩┙┪━".split('')

export function main(coord, context, cursor, buffers){
	const t1 = Math.floor(context.time * 0.01)
	const t2 = Math.floor(t1 * 0.05)
	const x = coord.x * context.metrics.aspect
	const y = coord.y + t1
	const m = t2 * 2 % 30 + 31
	const i = (x + y^x - y) % m & 1
	const c = (t2 + i) % pattern.length
	return pattern[c]
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers, {
		color : 'white', background : 'royalblue', shadowStyle : 'gray'
	})
}

