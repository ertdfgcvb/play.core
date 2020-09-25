/**
@author Alex Miller
@title  Sand game
@desc   Click to drop sand
*/

import { dist, sub } from '/src/modules/vec2.js'

let prevFrame;
let initialized = false;
let width, height;

function newParticle() {
	return 'sand'.charAt(Math.random() * 4)
}

export function pre(context, cursor, buffers) {
	if (!initialized) {
		for (let i = 0; i < buffers.length; i++) {
			buffers.state[i] = {char : Math.random() > 0.5 ? newParticle() : ' '};
        }
		initialized = true;

		width = context.cols;
		height = context.rows;
	}


	// Use the spread operator to copy the previous frame
	// You must make a copy, otherwise `prevFrame` will be updated prematurely
	prevFrame = [...buffers.state];
}

export function main(coord, context, cursor, buffers) {
	if (cursor.pressed) {
		if (dist(coord, cursor) < 3) {
			return {
				char: Math.random() > 0.5 ? newParticle() : ' ',

				background: 'white',
				color: 'rgb(179, 158, 124)',
				weight: 500
			}
		}
	}

	const { x, y } = coord;

	const me = get(x, y);
	const below = get(x, y + 1);
	const above = get(x, y - 1);

	const left = get(x - 1, y);
	const right = get(x + 1, y);

	const topleft = get(x - 1, y - 1);
	const topright = get(x + 1, y - 1);
	const bottomleft = get(x - 1, y + 1);
	const bottomright = get(x + 1, y + 1);
	const frame = context.frame;


	if (y >= context.rows - 1) {
		return {
			char: 'GROUND_'.charAt(x % 7),
			background: 'rgb(138, 162, 70)',
			color: 'rgb(211, 231, 151)',
			weight: 900
		}
	}

	if (x >= context.cols - 1 || x <= 0) {
		return {
			char: 'WALL'.charAt(y % 4),
			background: 'rgb(247, 187, 39)',
			color: 'white',
			weight: 900
		}
	}



	let char = ' '
	if (alive(me)) {
		if (alive(below) &&
			((frame % 2 == 0 && alive(bottomright)) ||
			(frame % 2 == 1 && alive(bottomleft)))) {
			char = me;
		} else {
			char = ' ';
		}
	} else {
		if (alive(above)) {
			char = above;
		} else if (alive(left) && frame % 2 == 0 && alive(topleft)) {
			char = topleft;
		} else if (alive(right) && frame % 2 == 1 && alive(topright)) {
			char = topright;
		} else {
			char = ' ';
		}


		if ('WALL'.indexOf(char) > -1) {
			char = ' ';
		}
	}

	return {
		char,
		background: 'white',
		color: 'rgb(179, 158, 124)',
		weight: 500
	}
}

function alive(char) {
	return char != ' ';
}

function get(x, y) {
	if (x < 0 || x >= width) return 0;
	if (y < 0 || y >= height) return 0;
	const index = y * width + x;
	return prevFrame[index].char;
}

