/**
[header]
@author Alex Miller
@title  Sand game
@desc   Click to drop sand
*/

import { dist, sub } from '/src/modules/vec2.js'

let prevFrame;
let width, height;

function newParticle() {
	return 'sand'.charAt(Math.random() * 4)
}

export function pre(context, cursor, buffer) {
	if (width != context.cols || height != context.rows) {
		const length = context.cols * context.rows
		for (let i = 0; i < length; i++) {
			buffer[i] = {char : Math.random() > 0.5 ? newParticle() : ' '};
		}
		width = context.cols;
		height = context.rows;
	}

	// Use the spread operator to copy the previous frame
	// You must make a copy, otherwise `prevFrame` will be updated prematurely
	prevFrame = [...buffer];
}

export function main(coord, context, cursor, buffer) {
	if (cursor.pressed) {
		if (dist(coord, cursor) < 3) {
			return {
				char: Math.random() > 0.5 ? newParticle() : ' ',

				backgroundColor: 'white',
				color: 'rgb(179, 158, 124)',
				fontWeight: 500
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
			backgroundColor: 'rgb(138, 162, 70)',
			color: 'rgb(211, 231, 151)',
			fontWeight: 700
		}
	}

	if (x >= context.cols - 1 || x <= 0) {
		return {
			char: 'WALL'.charAt(y % 4),
			backgroundColor: 'rgb(247, 187, 39)',
			color: 'white',
			fontWeight: 700
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
		backgroundColor: 'white',
		color: 'rgb(179, 158, 124)',
		fontWeight: 500
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

