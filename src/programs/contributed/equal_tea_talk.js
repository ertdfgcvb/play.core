/**
[header]
@author nkint
@title  EQUAL TEA TALK, #65
@desc   Inspired by Frederick Hammersley, 1969
See: http://www.hammersleyfoundation.org/index.php/artwork/computer-drawings/184-computer-drawings/331-equal-tea-talk
*/

import { map, step, mod } from '/src/modules/num.js'
import { vec2, mul, fract as fract2 } from '/src/modules/vec2.js'

const chars = '#BEFTI_'.split('')

const wx = new Array(50).fill(0).map((_, i) => i);
const sumW = (n) => (n * 2 + 3) * 5
const getW = (cols) => {
	let w = 0
	for(let _wx of wx) {
		const s = sumW(_wx)
		if (cols <= s) {
			break;
		}
		w = s;
	}
	return w
}

const blank =  ' ';

export const settings = {
	fontWeight: '100'
}

export function main(coord, context, cursor, buffer){
	const t = context.time * 0.0001

	// compute resolution to fit geometry, not the screen
	// 🙏thanks andreas
	let w = getW(context.cols);

	// show blank if the resolution is too small
	if(context.cols <= sumW(1)) {
		return blank
	}

	// clamp the space to the resolution
	if(coord.x >= w) {
		return blank
	}

	// ----------------------------- st space
	// -----------------------------
	// -----------------------------
	const st = {
		x : (coord.x / w),
		y : (coord.y / context.rows),
	}
	const _st =  mul(st, vec2(5.0, 1.0));
	const tileIndex = step(1, mod(_st.x, 2.0));
	// make each cell between 0.0 - 1.0
	// see Truchet Tiles from https://thebookofshaders.com/09/
	// for reference/inspiration
	const __st = fract2(_st);

	const color = tileIndex === 0 ? (_st.y) : (1 - _st.y);
	const i = Math.floor(
		map(
			color,
			0, 1,
			0, chars.length - 1
		)
	);

	let char = chars[i];

	// ----------------------------- pixel space
	// -----------------------------
	// -----------------------------
	const unit = w / 5
	const middle = Math.floor(unit/2) - 1;
	const xPx = coord.x % unit

	const isFirstOrLast = xPx !==0 && xPx !== unit

	if(
		isFirstOrLast &&
		(((xPx) === middle) || ((xPx) === middle + 2))
	) {
		char = ' '
	}

	if(
		isFirstOrLast &&
		(xPx) === middle + 1
	) {
		char = '-'
	}

	// some debug utils
	// throw new Error('dudee')
	// if(coord.x === 0) { console.log() }

	return char
}
