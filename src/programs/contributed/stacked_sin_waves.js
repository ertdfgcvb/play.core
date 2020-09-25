/**
@author Raurir
@title  Stacked sin waves
@desc   noob at frag shaders
*/

const chars = '█▓▒░ '.split('')

import { map } from '/src/modules/num.js'

export function main(coord, context, cursor, buffers){
	const t = context.time * 0.002
	const x = coord.x
	const y = coord.y
	const v0 = context.cols / 4 + wave(t, y, [0.15, 0.13, 0.37], [10,8,5]) * 0.9;
	const v1 = v0 + wave(t, y, [0.12, 0.14, 0.27], [3,6,5]) * 0.8;
	const v2 = v1 + wave(t, y, [0.089, 0.023, 0.217], [2,4,2]) * 0.3;
	const v3 = v2 + wave(t, y, [0.167, 0.054, 0.147], [4,6,7]) * 0.4;
	const i = x > v3 ? 4
		: x > v2 ? 3
		: x > v1 ? 2
		: x > v0 ? 1
		: 0;

	const r = map(Math.sin(t + y * 0.1), -1.5, 1, 0x11, 0xff)

	return {
		char       : chars[i],
		color      : `#0000${Math.round(r).toString(16)}`,
		background : 'black'
	}
}

function wave(t, y, seeds, amps) {
	return (
		(Math.sin(t + y * seeds[0]) + 1) * amps[0]
		+ (Math.sin(t + y * seeds[1]) + 1) * amps[1]
		+ (Math.sin(t + y * seeds[2])) * amps[2]
	)
}