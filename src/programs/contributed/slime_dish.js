/**
[header]
@author zspotter
        (IG @zzz_desu, TW @zspotter)
@title  Slime Dish
@desc   Low-res physarum slime mold simulation

🔍  Tap and hold to magnify.

With inspiration from:
- https://sagejenson.com/physarum
- https://uwe-repository.worktribe.com/output/980579
- http://www.tech-algorithm.com/articles/nearest-neighbor-image-scaling
*/

import * as v2 from '/src/modules/vec2.js'
import { map } from '/src/modules/num.js'

// Environment
const WIDTH = 400;
const HEIGHT = 400;
const NUM_AGENTS = 1500;
const DECAY = 0.9;
const MIN_CHEM = 0.0001;

// Agents
const SENS_ANGLE = 45 * Math.PI / 180;
const SENS_DIST = 9;
const AGT_SPEED = 1;
const AGT_ANGLE = 45 * Math.PI / 180;
const DEPOSIT = 1;

// Rendering
const TEXTURE = [
	"  ``^@",
	" ..„v0",
];
const OOB = ' ';

// 0@0@0@0@0@0^v^v^v^v^v^„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .
// @0@0@0@0@0@v^v^v^v^v^v`„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .
// 0@0@0@0@0@0^v^v^v^v^v^„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .
// @0@0@0@0@0@v^v^v^v^v^v`„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .

export const settings = {
	backgroundColor : 'black',
	color : 'white',
	fontSize: '12px',
}

export function boot(context, buffer, data) {
	document.body.style.cursor = 'crosshair';

	data.chem = new Float32Array(HEIGHT*WIDTH);
	data.wip = new Float32Array(HEIGHT*WIDTH);

	data.agents = [];
	for (let agent = 0; agent < NUM_AGENTS; agent++) {
		data.agents.push(new Agent(
			// Random position
			v2.mulN(v2.addN(v2.mulN(randCircle(), 0.5), 1), 0.5 * WIDTH),
			// Random direction
			v2.rot(v2.vec2(1, 0), Math.random()*2*Math.PI),
		));
	}

	data.viewScale = { y: 100/context.metrics.aspect, x: 100 };
	data.viewFocus = { y: 0.5, x: 0.5 };
}

export function pre(context, cursor, buffer, data) {
	// Diffuse & decay
	for (let row = 0; row < HEIGHT; row++) {
		for (let col = 0; col < WIDTH; col++) {
			let val = DECAY * blur(row, col, data.chem);
			if (val < MIN_CHEM)
				val = 0;
			data.wip[row*HEIGHT+col] = val;
		}
	}
	const swap = data.chem;
	data.chem = data.wip;
	data.wip = swap;

	const { chem, agents, view } = data;

	// Sense, rotate, and move
	const isScattering = Math.sin(context.frame/150) > 0.8;
	for (const agent of agents) {
		agent.scatter = isScattering;
		agent.react(chem);
	}

	// Deposit
	for (const agent of agents) {
		agent.deposit(chem);
	}

	// Update view params
	updateView(cursor, context, data);
}

export function main(coord, context, cursor, buffer, data) {
	const { viewFocus, viewScale } = data;

	// A down and upscaling algorithm based on nearest-neighbor image scaling.

	const offset = {
		y: Math.floor(viewFocus.y * (HEIGHT - viewScale.y * context.rows)),
		x: Math.floor(viewFocus.x * (WIDTH - viewScale.x * context.cols)),
	};

	// The "nearest neighbor"
	const sampleFrom = {
		y: offset.y + Math.floor(coord.y * viewScale.y),
		x: offset.x + Math.floor(coord.x * viewScale.x),
	};

	// The next nearest-neighbor cell, which we look up to the border of
	const sampleTo = {
		y: offset.y + Math.floor((coord.y+1) * viewScale.y),
		x: offset.x + Math.floor((coord.x+1) * viewScale.x),
	};

	if (!bounded(sampleFrom) || !bounded(sampleTo))
		return OOB;

	// When upscaling, sample W/H may be 0
	const sampleH = Math.max(1, sampleTo.y - sampleFrom.y);
	const sampleW = Math.max(1, sampleTo.x - sampleFrom.x);

	// Combine all cells in [sampleFrom, sampleTo) into a single value.
	// For this case, the value half way between the average and max works well.
	let max = 0;
	let sum = 0;
	for (let x = sampleFrom.x; x < sampleFrom.x + sampleW; x++) {
		for (let y = sampleFrom.y; y < sampleFrom.y + sampleH; y++) {
			const v = data.chem[y*HEIGHT+x];
			max = Math.max(max, v);
			sum += v;
		}
	}
	let val = sum / (sampleW * sampleH);
	val = (val + max) / 2;

	// Weight val so we get better distribution of textures
	val = Math.pow(val, 1/3);

	// Convert the cell value into a character from the texture map
	const texRow = (coord.x+coord.y) % TEXTURE.length;
	const texCol = Math.ceil(val * (TEXTURE[0].length-1));
	const char = TEXTURE[texRow][texCol];
	if (!char)
		throw new Error(`Invalid char for ${val}`);

	return char;
}

// import { drawInfo } from '/src/modules/drawbox.js'
// export function post(context, cursor, buffer) {
// 	drawInfo(context, cursor, buffer)
// }

function updateView(cursor, context, data) {
	let targetScale;
	if (cursor.pressed) {
		// 1 display char = 1 grid cell
		targetScale = {
			y: 1 / context.metrics.aspect,
			x: 1,
		};
	}
	else if (context.rows / context.metrics.aspect < context.cols) {
		// Fit whole grid on wide window
		targetScale = {
			y: 1.1*WIDTH / context.rows,
			x: 1.1*WIDTH / context.rows * context.metrics.aspect,
		};
	}
	else {
		// Fit whole grid on tall window
		targetScale = {
			y: 1.1*WIDTH / context.cols / context.metrics.aspect,
			x: 1.1*WIDTH / context.cols,
		};
	}

	if (data.viewScale.y !== targetScale.y || data.viewScale.x !== targetScale.x) {
		data.viewScale.y += 0.1 * (targetScale.y - data.viewScale.y);
		data.viewScale.x += 0.1 * (targetScale.x - data.viewScale.x);
	}

	let targetFocus = !cursor.pressed
		? { y: 0.5, x: 0.5 }
		: { y: cursor.y / context.rows, x: cursor.x / context.cols };
	if (data.viewFocus.y !== targetFocus.y || data.viewFocus.x !== targetFocus.x) {
		data.viewFocus.y += 0.1 * (targetFocus.y - data.viewFocus.y);
		data.viewFocus.x += 0.1 * (targetFocus.x - data.viewFocus.x);
	}
}

// 0@0@0@0@0@0^v^v^v^v^v^„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .
// @0@0@0@0@0@v^v^v^v^v^v`„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .
// 0@0@0@0@0@0^v^v^v^v^v^„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .
// @0@0@0@0@0@v^v^v^v^v^v`„`„`„`„`„`„`.`.`.`.`.`.`. . . . . .

class Agent {
	constructor(pos, dir) {
		this.pos = pos;
		this.dir = dir;
		this.scatter = false;
	}

	sense(m, chem) {
		const senseVec = v2.mulN(v2.rot(this.dir, m * SENS_ANGLE), SENS_DIST);
		const pos = v2.floor(v2.add(this.pos, senseVec));
		if (!bounded(pos))
			return -1;
		const sensed = chem[pos.y*HEIGHT+pos.x];
		if (this.scatter)
			return 1 - sensed;
		return sensed;
	}

	react(chem) {
		// Sense
		let forwardChem = this.sense(0, chem);
		let leftChem = this.sense(-1, chem);
		let rightChem = this.sense(1, chem);

		// Rotate
		let rotate = 0;
		if (forwardChem > leftChem && forwardChem > rightChem) {
			rotate = 0;
		}
		else if (forwardChem < leftChem && forwardChem < rightChem) {
			if (Math.random() < 0.5) {
				rotate = -AGT_ANGLE;
			}
			else {
				rotate = AGT_ANGLE;
			}
		}
		else if (leftChem < rightChem) {
			rotate = AGT_ANGLE;
		}
		else if (rightChem < leftChem) {
			rotate = -AGT_ANGLE;
		}
		else if (forwardChem < 0) {
			// Turn around at edge
			rotate = Math.PI/2;
		}
		this.dir = v2.rot(this.dir, rotate);

		// Move
		this.pos = v2.add(this.pos, v2.mulN(this.dir, AGT_SPEED));
	}

	deposit(chem) {
		const {y, x} = v2.floor(this.pos);
		const i = y*HEIGHT+x;
		chem[i] = Math.min(1, chem[i] + DEPOSIT);
	}
}

const R = Math.min(WIDTH, HEIGHT)/2;

function bounded(vec) {
	return ((vec.x-R)**2 + (vec.y-R)**2 <= R**2);
}

function blur(row, col, data) {
	let sum = 0;
	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			sum += data[(row+dy)*HEIGHT + col + dx] ?? 0;
		}
	}
	return sum / 9;
}

function randCircle() {
	const r = Math.sqrt(Math.random());
	const theta = Math.random() * 2 * Math.PI;
	return {
		x: r * Math.cos(theta),
		y: r * Math.sin(theta)
	};
}