/**
@author No1
@title  Cursor
@desc   Example with mouse cursor
[header]
*/

import { sdCircle, opSmoothUnion } from "/src/modules/sdf.js"
import { sub, vec2 } from "/src/modules/vec2.js"

const charMap = "╳\\|/?*:÷×+-=·".split('')

export function main(coord, context, cursor, buffers){

	const t = context.time

	const a  = Math.min(context.cols, context.rows)
	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
		y : 2.0 * (coord.y - context.rows / 2) / a
	}

	// A bit of a waste as cursor is not coord dependent;
	// it could be calculated in pre(), and stored in a global
	// (see commented code below).
	const p = {
		x : 2.0 * (cursor.x - context.cols / 2) / a * context.aspect,
		y : 2.0 * (cursor.y - context.rows / 2) / a
	}

	// Positions
	const pos1 = sub(st, vec2(Math.cos(t*0.0012)*0.5, Math.sin(t*0.0011)*0.5))
	const pos2 = sub(st, p)

	// Radii
	const rad1 = Math.cos(t * 0.002) * 0.2 + 0.2
	const rad2 = Math.cos(t * 0.003) * 0.2 + 0.2

	// Circles
	const d1 = sdCircle(pos1, rad1)
	const d2 = sdCircle(pos2, rad2)

	let d = 1e100
	d = opSmoothUnion(d, d1, 0.5)
	d = opSmoothUnion(d, d2, 0.5)

	let c = 1.0 - Math.exp(-10 * Math.abs(d))

	const index = Math.floor(c * charMap.length)
	return charMap[index]
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, metrics, cursor, buffers){
	drawInfo(context, metrics, cursor, buffers)
}

// Uncomment this to calculate the cursor position only once
// And pass it to the main function as a global
/*
const p = vec2(0, 0)
export function pre(context, cursor, buffers){
	const a  = Math.min(context.cols, context.rows)
	p.x = 2.0 * (cursor.x - context.cols / 2) / a * context.aspect,
	p.y = 2.0 * (cursor.y - context.rows / 2) / a
}
*/

