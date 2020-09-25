/**
@author No1
@title  Mod Xor
@desc   Inspired by this tweet: https://twitter.com/ntsutae/status/1292115106763960327
[header]
*/

const chars = "└┧─┨┕┪┖┫┘┩┙┪━".split('')

export function main(coord, context, cursor, buffers){
	const t1 = Math.floor(context.time * 0.01)
	const t2 = Math.floor(t1 * 0.05)
	const x = coord.x * context.aspect
	const y = coord.y + t1
	const m = t2 * 2 % 30 + 31
	const i = (x + y^x - y) % m & 1
	const c = (t2 + i) % chars.length
	return chars[c]
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}

