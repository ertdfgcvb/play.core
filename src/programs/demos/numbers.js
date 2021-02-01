/**
[header]
@author ertdfgcvb
@title  Numbers
@desc   Fun with integers
*/

import { map } from '/src/modules/num.js'
import { CGA } from '/src/modules/color.js'

export const settings = {
	backgroundColor : 'black'
}

// Remove some colors (backwards, in place) from the CGA palette
CGA.splice(10, 1)
//CGA.splice(6, 1)
CGA.splice(4, 1)
CGA.splice(2, 1)
CGA.splice(0, 1)

const ints = [
	488162862,
	147460255,
	487657759,
	1042482734,
	71662658,
	1057949230,
	487540270,
	1041305872,
	488064558,
	488080430
]

const numX = 5     // number width
const numY = 6     // number height
const spacingX = 2 // spacing, after scale
const spacingY = 1

const bit = (n, k) => n >> k & 1

export function main(coord, context, cursor, buffer) {

	const f = context.frame

	const scale = (map(Math.sin(f * 0.01), -1, 1, 0.99, context.rows / numY))

	const x = coord.x / scale
	const y = coord.y / scale

	const sx = numX + spacingX / scale
	const sy = numY + spacingY / scale
	const cx = Math.floor(x / sx) // cell X
	const cy = Math.floor(y / sy) // cell Y

	const offs = Math.round(map(Math.sin(f * 0.012 + (cy * 0.5)), -1, 1, 0, 100))
	const num = (cx + cy + offs) % 10

	const nx = Math.floor(x % sx)
	const ny = Math.floor(y % sy)

	let char

	if (nx < numX && ny < numY) {
		char = bit(ints[num], (numX - nx - 1) + (numY - ny - 1) * numX)
	} else {
		char = 0
	}

	let color = num % CGA.length
	return {
		char : '.▇'[char],
		color : char ? CGA[color].hex : CGA[5].hex
	}
}

