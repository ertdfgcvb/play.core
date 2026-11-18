import { clamp } from '@ertdfgcvb/play/num.js'

export const settings = { backgroundColor : 'black', color : 'white' }

const { min, max, floor, sin, random } = Math

const palette = ['black', 'purple', 'darkred', 'red', 'orangered', 'gold', 'lemonchiffon', 'white']
const flame = '011222233334444444455566667'.split('').map(Number)

export function pre({ cols, rows, time, cursor, grid }) {
	const d = grid('heat', Uint8Array)
	const last = cols * (rows - 1)
	for (let i=0; i<cols; i++) {
		const n = sin(i * 0.11 + time * 0.002) * sin(i * 0.037 - time * 0.0013) * 0.5 + 0.5
		d[last + i] = floor(5 + n * 45)
	}
	if (cursor.pressed) d[floor(cursor.x) + floor(cursor.y) * cols] = 50
	for (let i=0; i<last; i++) {
		const col = i % cols
		const dest = i - col + clamp(col + rndi(-1, 1), 0, cols - 1)
		d[dest] = max(0, d[i + cols] - rndi(0, 2))
	}
}

export function main({ index }, { grid }) {
	const u = grid('heat')[index]
	const v = flame[min(u, flame.length - 1)]
	if (v === 0) return ' '
	return {
		char            : u % 10,
		color           : palette[min(palette.length - 1, v + 1)],
		backgroundColor : palette[v],
	}
}

function rndi(a, b) {
	return floor(a + random() * (b - a + 1))
}
