/**
@author No1
@title  How to draw a square
@desc   Draw a SDF square
[header]
*/

import { vec2, length } from '/src/modules/vec2.js'
import { map } from '/src/modules/num.js'

// Set framerate to 60
export const settings = { fps : 60 }

// This function can also be found in:
// import { sdBox } from '/src/modules/sdf'
export function sdBox(p, size){
	const d = {
		x : Math.abs(p.x) - size.x,
		y : Math.abs(p.y) - size.y,
	}
	d.x = Math.max(d.x, 0)
	d.y = Math.max(d.y, 0)
	return length(d)
}

export function main(coord, context, cursor, buffers){
    const t = context.time
    const a = Math.min(context.cols, context.rows)

	// Normalize space and adjust aspect ratio (screen and char)
	const st = {
        x : 2.0 * (coord.x - context.cols / 2) / a,
        y : 2.0 * (coord.y - context.rows / 2) / a / context.aspect,
    }

	// Transform the st by rotating it
	const ang = t * 0.0015
	const s = Math.sin(-ang)
    const c = Math.cos(-ang)
	const p = {
		x : st.x * c - st.y * s,
        y : st.x * s + st.y * c
	}

	// Size of the box
	const size = map(Math.sin(t * 0.0023), -1, 1, 0.1, 2)

	// Calculate the distance
    const d = sdBox(p, vec2(size, size))

	// Visualize the distance field
	// return d == 0 ? ' ' : (''+d).charAt(2)
	return d == 0 ? (coord.x%2==0 ? '─' : '┼') : (''+d).charAt(2)

}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}