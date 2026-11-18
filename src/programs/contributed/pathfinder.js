/**
@author Alex Miller
@title  Pathfinder
@desc   Click to spawn new path segments

Ported from v1 to v2 of the ASCII Playground (API changes only).
*/

import { distance, sub } from '@ertdfgcvb/play/vec2.js'
import * as v2 from '@ertdfgcvb/play/vec2.js'

const vec2 = v2.vec2

let prevFrame;
let width, height;

const colors = [
	'red',
	'orange',
	'yellow',
	'green',
	'blue',
	'indigo',
	'violet'
];

export const settings = {
	clear : false, // the buffer holds the state: it is not cleared each frame
	fps             : 30,    // fps capping
	backgroundColor : '#000000',    // background color of the container element
}

const roads = '┃━┏┓┗┛┣┫┳┻╋';

export function pre(context) {
	const buffer = context.buffer.data
	if (width != context.cols || height != context.rows) {
		const length = context.cols * context.rows
		for (let i = 0; i < length; i++) {
			buffer[i] = Math.random() < 0.001 ? {
				char: choose(roads),
				color: 'white'
			} : { char : ' ' };
        }
		width = context.cols;
		height = context.rows;
	}

	// Copy the previous frame (the cells, not only the array)
	// You must make a copy, otherwise `prevFrame` will be updated prematurely
	prevFrame = buffer.map(cell => ({ ...cell }));
}

function choose(list) {
	return list.charAt(Math.floor(Math.random() * list.length))
}

export function main(coord, context) {
	const { cursor } = context
	const {x, y} = coord;
	if (cursor.pressed &&
			Math.floor(cursor.x) == x &&
			Math.floor(cursor.y) == y &&
	        get(x, y) == ' ') {
		return {
			char: choose(roads),
			color: 'white'
		};
	}

	const last = get(x, y);

	// '┃ ━ ┏ ┓ ┗ ┛ ┣ ┫ ┳ ┻ ╋';

	if (last == ' ') {
		let char = ' '

		const top = get(x, y - 1);
		const bottom = get(x, y + 1);
		const left = get(x - 1, y);
		const right = get(x + 1, y);


		if ('┃┫┣╋┏┓┳'.includes(top)) {
			char = choose('┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┗┫┣┻╋');
		} else if ('┃┗┛┣┫┻╋'.includes(bottom)) {
			char = choose('┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┏┓┣┫┳╋');
		} else if ('━┏┗┣┳┻╋'.includes(left)) {
			char = choose('━━━━━━━━━━━━━━━━━━━━┓┛┫┳┻╋');
		} else if ('━┓┛┫┳┻╋'.includes(right)) {
			char = choose('━━━━━━━━━━━━━━━━━━━━┏┗┣┳┻╋');
		}

		return {
			char,
			color: 'white'
		};
	}

	return {
		char: last,
		color: 'white'
	};
}


function get(x, y) {
	if (x < 0 || x >= width) return 0;
	if (y < 0 || y >= height) return 0;
	const index = y * width + x;
	return prevFrame[index].char;
}

