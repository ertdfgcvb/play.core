/**
@author ertdfgcvb
@title  Moiré explorer
@desc   Click or tap to toggle mode
*/

import { vec2, distance, mul } from '@ertdfgcvb/play/vec2.js'
import { map } from '@ertdfgcvb/play/num.js'

export const settings = { fps : 60 }

// Shorthands
const { sin, cos, atan2, floor, min } = Math

// Change the mouse pointer to 'pointer' (once, on the first frame)
export function pre(context) {
	if (context.frame == 0 && context.settings.element) context.settings.element.style.cursor = 'pointer'
}

// Cycle modes with click or tap
export const pointerDown = () => mode = ++mode % 3
let mode = 0

const density = ' ..._-:=+abcXW@#ÑÑÑ'

export function main(coord, context) {
	const t = context.time * 0.0001
	const m = min(context.cols, context.rows)
	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / m,
		y : 2.0 * (coord.y - context.rows / 2) / m,
	}
	st.x *= context.metrics.aspect

	const centerA = mul(vec2(cos(t*3), sin(t*7)), 0.5)
	const centerB = mul(vec2(cos(t*5), sin(t*4)), 0.5)

	// Set A or B to zero to see only one of the two frequencies
	const A = mode % 2 == 0 ? atan2(centerA.y-st.y, centerA.x-st.x) : distance(st, centerA)
	const B = mode     == 0 ? atan2(centerB.y-st.y, centerB.x-st.x) : distance(st, centerB)

	const aMod = map(cos(t*2.12), -1, 1, 6, 60)
	const bMod = map(cos(t*3.33), -1, 1, 6, 60)
	//const aMod = 27
	//const bMod = 29

	const a = cos(A * aMod)
	const b = cos(B * bMod)

	const i = ((a * b) + 1) / 2 // mult
	//const i = ((a + b) + 2) / 4 // sum
	const idx = floor(i * density.length)
	return density[idx]
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}
