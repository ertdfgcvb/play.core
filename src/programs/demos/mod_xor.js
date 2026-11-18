/**
@author ertdfgcvb
@title  Mod Xor
@desc   Patterns obtained trough modulo and xor
Inspired by this tweet by @ntsutae
https://twitter.com/ntsutae/status/1292115106763960327
*/

const pattern = '└┧─┨┕┪┖┫┘┩┙┪━'

export function main(coord, context) {
	const t1 = Math.floor(context.frame / 2)
	const t2 = Math.floor(context.frame / 128)
	const x = coord.x
	const y = coord.y + t1
	const m = t2 * 2 % 30 + 31
	const i = (x + y^x - y) % m & 1
	const c = (t2 + i) % pattern.length
	return pattern[c]
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}

