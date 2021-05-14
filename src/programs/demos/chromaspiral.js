/**
[header]
@author ertdfgcvb
@title  Chroma Spiral
@desc   Shadertoy port
Inspired by this shader by scry
https://www.shadertoy.com/view/tdsyRf
*/

import { map } from '../../modules/num.js'
import { sort } from '../../modules/sort.js'
import { vec2, rot, add, mulN, addN, subN, length } from '../../modules/vec2.js'

const { min, sin, cos, floor } = Math

const density  = '#Wabc:+-. '
const colors = ['deeppink', 'black', 'red', 'blue', 'orange', 'yellow']

export function main(coord, context, cursor, buffer) {
	const t  = context.time * 0.0002
    const m = min(context.cols, context.rows)
    const a = context.metrics.aspect

	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / m * a,
		y : 2.0 * (coord.y - context.rows / 2) / m
	}

	for (let i=0;i<3;i++) {
		subN(st, 0.5 + i * 0.005, st)
		const o = i * 3.0
		const v = vec2(sin(t * 3.0 + o), cos(t * 2.0 + o))
		add(st, v, st)
		mulN(st, cos(t * 0.1), st)
		addN(st, 0.5 - i*0.005, st)

		const ang = -t + length(subN(st, 0.2))
		subN(st, 0.5, st)
		rot(st, ang, st)
		addN(st, 0.5, st)
	}

	mulN(st, 0.6, st)

	const s = cos(t*1.0) * 2.0;
	let c = sin(st.x * 3.0 + s) + sin(st.y * 21)
	c = map(sin(c * 0.5), -1, 1, 0, 1)

	addN(st, 0.1 + t * 0.1, st);
	c = sin(st.x * 3.0 + s) + sin(st.y * 21)
	c = map(sin(c * 0.5), -1, 1, 0, 1)

	const index = floor(c * (density.length - 1))
	const color = floor(c * (colors.length - 1))

	return {
		// char : (coord.x + coord.y) % 2 ? density[index] : '╲',
		char : density[index],
		color : colors[color]
	}
}

import { drawInfo } from '../../modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer)
}