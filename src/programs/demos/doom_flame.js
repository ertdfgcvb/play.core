/**
[header]
@author ertdfgcvb
@title  Doom Flame
@desc   Oldschool flame effect
*/

import { clamp, map } from '/src/modules/num.js'
import { CSS4 } from '/src/modules/color.js'
import { mix, smoothstep } from '/src/modules/num.js'

export const settings = { fps : 30, backgroundColor : 'black', color : 'white' }

const { min, max, sin, floor } = Math

const flame = '...::/\\/\\/\\+=*abcdef01XYZ#'
let cols, rows

const noise = valueNoise()

const data = []

export function pre(context, cursor, buffer) {


	// Detect resize (and reset buffer, in case)
	if (cols != context.cols || rows != context.rows) {
		cols = context.cols
		rows = context.rows
		data.length = cols * rows // Don't loose reference
		data.fill(0)
	}

	// Fill the floor with some noise
	if (!cursor.pressed) {
		const t = context.time * 0.0015
		const last = cols * (rows - 1)
		for (let i=0; i<cols; i++) {
			const val = floor(map(noise(i * 0.05, t), 0, 1, 5, 40))
			data[last + i] = min(val, data[last + i] + 2)
		}
	} else {
		const cx = floor(cursor.x)
		const cy = floor(cursor.y)
		data[cx + cy * cols] = rndi(5, 50)
	}

	// Propagate towards the ceiling with some randomness
	for (let i=0; i<data.length; i++) {
		const row = floor(i / cols)
		const col = i % cols
  		const dest = row * cols + clamp(col + rndi(-1, 1), 0, cols-1)
  		const src = min(rows-1, row + 1) * cols + col
  		data[dest] = max(0, data[src]-rndi(0, 2))
	}
}

export function main(coord, context, cursor, buffer) {
	const u = data[coord.index]
	if (u === 0) return // Inserts a space

	return {
		char : flame[clamp(u, 0, flame.length-1)],
		fontWeight : u > 20 ? 700 : 100
	}
}

// Random int betweem a and b, inclusive!
function rndi(a, b=0) {
	if (a > b) [a, b] = [b, a]
	return Math.floor(a + Math.random() * (b - a + 1))
}

// Value noise:
// https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/procedural-patterns-noise-part-1
function valueNoise() {

	const tableSize = 256;
	const r = new Array(tableSize)
	const permutationTable = new Array(tableSize * 2)

    // Create an array of random values and initialize permutation table
    for (let k=0; k<tableSize; k++) {
        r[k] = Math.random()
        permutationTable[k] = k
    }

    // Shuffle values of the permutation table
    for (let k=0; k<tableSize; k++) {
        const i = Math.floor(Math.random() * tableSize)
        // swap
        ;[permutationTable[k], permutationTable[i]] = [permutationTable[i], permutationTable[k]]
        permutationTable[k + tableSize] = permutationTable[k]
    }

    return function(px, py) {
	    const xi = Math.floor(px)
	    const yi = Math.floor(py)

	    const tx = px - xi
	    const ty = py - yi

	    const rx0 = xi % tableSize
	    const rx1 = (rx0 + 1) % tableSize
	    const ry0 = yi % tableSize
	    const ry1 = (ry0 + 1) % tableSize

	    // Random values at the corners of the cell using permutation table
	    const c00 = r[permutationTable[permutationTable[rx0] + ry0]]
	    const c10 = r[permutationTable[permutationTable[rx1] + ry0]]
	    const c01 = r[permutationTable[permutationTable[rx0] + ry1]]
	    const c11 = r[permutationTable[permutationTable[rx1] + ry1]]

	    // Remapping of tx and ty using the Smoothstep function
	    const sx = smoothstep(0, 1, tx);
	    const sy = smoothstep(0, 1, ty);

	    // Linearly interpolate values along the x axis
	    const nx0 = mix(c00, c10, sx)
	    const nx1 = mix(c01, c11, sx)

	    // Linearly interpolate the nx0/nx1 along they y axis
	    return mix(nx0, nx1, sy)
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer)
}
