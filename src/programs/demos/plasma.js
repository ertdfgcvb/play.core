/**
[header]
@author ertdfgcvb
@title  Plasma
@desc   Oldschool plasma demo
Plasma primer: https://www.bidouille.org/prog/plasma
*/

import { vec2, dot, add, sub, length } from '/src/modules/vec2.js'
import { map } from '/src/modules/num.js'
import { css } from '/src/modules/color.js'

export const settings = { fps : 60 }

const {sin, cos, floor, PI} = Math
const density = '$?01▄abc+-><:. '

const PI23 = PI * 2 / 3
const PI43 = PI * 4 / 3

export function main(coord, context, cursor, buffer) {
	const t1 = context.time * 0.0009
	const t2 = context.time * 0.0003
    const m = Math.min(context.cols, context.rows)
    const a = context.metrics.aspect

	let st = {
		x : 2.0 * (coord.x - context.cols / 2) / m * a,
		y : 2.0 * (coord.y - context.rows / 2) / m
	}
	const center = vec2(sin(-t1), cos(-t1))
	const v1 = sin(dot(coord, vec2(sin(t1), cos(t1))) * 0.08)
	const v2 = cos(length(sub(st, center)) * 4.0)
	const v3 = v1 + v2
	const idx = floor(map(v3, -2, 2, 0, 1) * density.length)

	// Colors are quantized for performance:
	// lower value = harder gradient, better performance
	const quant = 2
	const mult  = 255 / (quant - 1)
	const r = floor(map(sin(v3 * PI   + t1), -1, 1, 0, quant)) * mult
	const g = floor(map(sin(v3 * PI23 + t2), -1, 1, 0, quant)) * mult
	const b = floor(map(sin(v3 * PI43 - t1), -1, 1, 0, quant)) * mult

	return {
		char : density[idx],
		color : 'white',
		backgroundColor : css(r, g, b) // r, g, b are floats
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer)
}
