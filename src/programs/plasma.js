/**
@author No1
@title  Sin Sin
@desc   inspired by https://www.shadertoy.com/view/MdXGDH
[header]
*/

import {vec2, dot, add, sub, length} from '/src/modules/vec2.js'
import {map} from '/src/modules/num.js'

export const settings = {
	fps : 60
}

const {sin, cos, floor, PI} = Math
const chars = '▅▃▁$?01abc+-><:. '.split('')

export function main(coord, context){
	const t1 = context.time * 0.0009
	const t2 = context.time * 0.0003
	const a = Math.min(context.cols, context.rows)
	let st = {
		x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
		y : 2.0 * (coord.y - context.rows / 2) / a
	}
	const center = vec2(sin(-t1), cos(-t1))
	const v1 = sin(dot(coord, vec2(sin(t1), cos(t1))) * 0.08)
	const v2 = cos(length(sub(st, center)) * 4.0)
	const v3 = v1 + v2
	const idx = floor(map(v3, -2, 2, 0, 1) * chars.length)

	// Colors are quantized for performance:
	// lower value = harder gradient, better performance
	const quant = 2
	const mult  = 255 / (quant - 1)
	const r = floor(map(cos(v3 + t2), -1, 1, 0, quant)) * mult
	const g = floor(map(sin(v3 + t2), -1, 1, 0, quant)) * mult
	const b = floor(map(cos(t2), -1, 1, 0, quant)) * mult

	return {
		char : chars[idx],
		color : 'black',
		background : `rgb(${r},${g},${b})`,
	}
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers)
}
