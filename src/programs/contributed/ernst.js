/**
[header]
@author nkint
@title  oeö
@desc   Inspired by Ernst Jandl, 1964
*/

import { dist, vec2, length, add, mulN } from '/src/modules/vec2.js'
import { map, smoothstep } from '/src/modules/num.js';

const { PI, atan2, floor, cos, max } = Math;

function polygon(center, edges, time) {
	time = time || 0
	// from https://observablehq.com/@riccardoscalco/draw-regular-polygons-by-means-of-functions
	const p = center;
	const N = edges;
	const a = (atan2(p.x, p.y) + 2 + time * PI) / (2. * PI);
	const b = (floor(a * N) + 0.5) / N;
	const c = length(p) * cos((a - b) * 2. * PI);
	return smoothstep(0.3, 0.31, c);
}

export function main(coord, context, cursor, buffer){
	const m = max(context.cols, context.rows)
    const a = context.metrics.aspect

	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / m,
		y : 2.0 * (coord.y - context.rows / 2) / m / a,
	}

	const centerT = add(
		st,
		vec2(0, cos(context.time * 0.0021) * 0.5)
	);
	const colorT = polygon(centerT, 3, context.time * 0.0002)

	const triangle = colorT <= 0.1 ? 1 : 0

	const centerQ = add(
		st,
		vec2(cos(context.time * 0.0023) * 0.5, 0)
	);
	const colorQ = polygon(centerQ, 4, -context.time * 0.0004)
	const quadrato = colorQ <= 0.1 ? 2 : 0
	const i = triangle + quadrato;
	const chars = [' ', 'e', 'o', 'ö']

	const colors = ['white', '#527EA8', '#BB2A1C', '#DFA636']
	return {
		char       : chars[i],
		color      : colors[i],
		fontWeight : '100'
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer){
	drawInfo(context, cursor, buffer)
}

