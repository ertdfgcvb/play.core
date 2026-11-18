/**
@author ertdfgcvb
@title  Sin Sin
@desc   Wave variation
*/

const pattern = '┌┘└┐╰╮╭╯'

const { sin, round, abs } = Math

export function main(coord, context) {
	const t = context.time * 0.0005
	const x = coord.x
	const y = coord.y
	const o = sin(y * x * sin(t) * 0.003 + y * 0.01 + t) * 20
	const i = round(abs(x + y + o)) % pattern.length
	return pattern[i]
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}
