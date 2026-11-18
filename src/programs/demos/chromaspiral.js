/**
@author ertdfgcvb
@title  Chroma Spiral
@desc   Shadertoy port
Inspired by this shader by scry
https://www.shadertoy.com/view/tdsyRf
*/

import { map } from '@ertdfgcvb/play/num.js'
import { sort } from '@ertdfgcvb/play/sort.js'
import { vec2, rot, add, mul, sub, length } from '@ertdfgcvb/play/vec2.js'

const { min, sin, cos, floor } = Math

const density  = '#Wabc:+-. '
const colors = ['deeppink', 'black', 'red', 'blue', 'orange', 'yellow']

export function main(coord, context) {
	const t  = context.time * 0.0002
    const m = min(context.cols, context.rows)
    const a = context.metrics.aspect

	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / m * a,
		y : 2.0 * (coord.y - context.rows / 2) / m
	}

	for (let i=0;i<3;i++) {
		const o = i * 3
		const v = vec2(sin(t * 3 + o), cos(t * 2 + o))
		add(st, v, st)

		const ang = -t + length(sub(st, 0.5))
		rot(st, ang, st)
	}

	mul(st, 0.6, st)

	const s = cos(t) * 2.0
	let c = sin(st.x * 3.0 + s) + sin(st.y * 21)
	c = map(sin(c * 0.5), -1, 1, 0, 1)

	const index = floor(c * (density.length - 1))
	const color = floor(c * (colors.length - 1))

	return {
		// char : (coord.x + coord.y) % 2 ? density[index] : '╲',
		char : density[index],
		color : colors[color]
	}
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}