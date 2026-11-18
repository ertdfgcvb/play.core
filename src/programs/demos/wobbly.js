/**
@author ertdfgcvb
@title  Wobbly
@desc   Draw donuts with SDF
*/

import { length, rot } from '@ertdfgcvb/play/vec2.js'
import { map, fract, smoothstep } from '@ertdfgcvb/play/num.js'

const density = '▀▄▚▐─═0123.+?'

export function main(coord, { time, cols, rows, metrics }) {
	const t = time * 0.001
	const m = Math.min(cols, rows)
	const a = metrics.aspect

	let st = {
		x : 2.0 * (coord.x - cols / 2) / m * a,
		y : 2.0 * (coord.y - rows / 2) / m
	}

	st = rot(st, 0.6 * Math.sin(0.62 * t) * length(st) * 2.5)
	st = rot(st, t * 0.2)

	const s = map(Math.sin(t), -1, 1, 0.5, 1.8)
	const pt = {
		x : fract(st.x * s) - 0.5,
		y : fract(st.y * s) - 0.5
	}

	const r = 0.5 * Math.sin(0.5 * t + st.x * 0.2) + 0.5

	const d = sdCircle(pt, r)

	const width = 0.05 + 0.3 * Math.sin(t)

	const k = smoothstep(width, width + 0.2, Math.sin(10 * d + t))
	const c = (1.0 - Math.exp(-3 * Math.abs(d))) * k

	const index = Math.floor(c * (density.length - 1))

	return {
		char  : density[index],
		color : k == 0 ? 'orangered' : 'royalblue',
	}
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}

// Signed distance functions by Inigo Quilez:
// https://iquilezles.org/articles/distfunctions2d

function sdCircle(p, radius) {
	return length(p) - radius
}
