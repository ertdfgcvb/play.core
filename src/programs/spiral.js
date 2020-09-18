/**
@author No1
@title  Wobbly
@desc   inspired by https://www.shadertoy.com/view/XdSGzR
[header]
*/

import {vec2, dot, add, sub, length} from '/src/modules/vec2.js'
import {map} from '/src/modules/num.js'
import {sort} from '/src/modules/sort.js'

export const settings = {
	fps : 60
}

const {sin, cos, floor, PI, atan, sqrt, pow} = Math
const TAU = PI * 2

const chars = sort('▅▃▁?ab012:. '.split(''))

export function main(coord, context){
	const t = context.time * 0.0006
	const a = Math.min(context.cols, context.rows)
	let st = {
		x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
		y : 2.0 * (coord.y - context.rows / 2) / a
	}

	const radius = length(st)
	const rot = 0.03 * TAU * t
	const turn = atan(st.y, st.x) / TAU + rot

	const n_sub = 1.5

	const turn_sub = n_sub * turn % n_sub

	const k = 0.1 * sin(3.0 * t)
	const s = k * sin(50.0 * (pow(radius, 0.1) - 0.4 * t))
	const turn_sine = turn_sub + s

	const i_turn = floor(chars.length * turn_sine % chars.length)
	const i_radius = floor(1.5 / pow(radius * 0.5, 0.6) + 5.0 * t)
	const idx = (i_turn + i_radius) % chars.length

	return chars[idx]
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, {
		color : 'white', background : 'blue', shadowStyle : 'gray'
	})
}
