/**
@author ertdfgcvb
@title  Rectangles
@desc   Smooth SDF Rectangles
*/

import { length } from '@ertdfgcvb/play/vec2.js'

import { map, clamp, mix } from '@ertdfgcvb/play/num.js'

let density = '▚▀abc|/:÷×+-=?*· '

export function main(coord, context) {

	const t = context.time
    const m = Math.max(context.cols, context.rows)
    const a = context.metrics.aspect

	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / m,
		y : 2.0 * (coord.y - context.rows / 2) / m / a
	}

	let d = 1e100

	const s = map(Math.sin(t * 0.0005), -1, 1, 0.0, 0.4)
	const g = 1.2
	for (let by=-g; by<=g; by+=g*0.33) {
		for (let bx=-g; bx<=g; bx+=g*0.33) {
			const r = t * 0.0004 * (bx + g*2) + (by + g*2)
			const f = transform(st, {x: bx, y: by},  r)
			const d1 = sdBox(f, {x:g*0.33, y:0.01})
			d = opSmoothUnion(d, d1, s)
		}
	}

	let c = 1.0 - Math.exp(-5 * Math.abs(d))
	const index = Math.floor(c * density.length)

	return density[index]
}

function transform(p, trans, rot) {
	const s = Math.sin(-rot)
	const c = Math.cos(-rot)
	const dx = p.x - trans.x
	const dy = p.y - trans.y
	return {
		x : dx * c - dy * s,
		y : dx * s + dy * c,
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

function sdBox(p, size) {
	const d = {
		x : Math.max(Math.abs(p.x) - size.x, 0),
		y : Math.max(Math.abs(p.y) - size.y, 0),
	}
	return length(d) + Math.min(Math.max(d.x, d.y), 0.0)
}

function opSmoothUnion(d1, d2, k) {
	const h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0)
	return mix(d2, d1, h) - k * h * (1.0 - h)
}
