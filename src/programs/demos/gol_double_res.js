/**
[header]
@author ertdfgcvb
@title  Golgol
@desc   Double resolution version of GOL

Based on Alex Miller’s version of Game of Life:
https://play.ertdfgcvb.xyz/#/src/contributed/game_of_life

By using three box chars (plus space) each char can host
two vertical cells of the automata allowing a double resolution.
'█' both cells are occupied
' ' both cells are empty
'▀' upper cell is occupied
'▄' lower cell is occupied

All the automata state is stored in the custom 'data' buffer.
Each frame of the animation depends on the previous frame,
so in this case the 'data' buffer is two arrays (see initialization in pre).
*/

// Safe set function
function set(val, x, y, w, h, buf) {
	if (x < 0 || x >= w) return
	if (y < 0 || y >= h) return
	buf[y * w + x] = val
}

// Safe get function
function get(x, y, w, h, buf) {
	if (x < 0 || x >= w) return 0
	if (y < 0 || y >= h) return 0
	return buf[y * w + x]
}

// Some state to detect window resize / init
let cols, rows

const data = []

// The automata is computed in a single step and stored in the 'data' buffer
export function pre(context, cursor, buffer) {

	// The window has been resized (or “init”), reset the buffer:
	if (cols != context.cols || rows != context.rows) {
		cols = context.cols
		rows = context.rows
		const len = context.cols * context.rows	* 2 // double height

		// We need two buffer (store them in the user 'data' array)
		data[0] = []
		data[1] = []
		// Initialize with some random state
		for (let i=0; i<len; i++) {
			const v = Math.random() > 0.5 ? 1 : 0
			data[0][i] = v
			data[1][i] = v
		}
	}

	// Update the buffer
	const prev = data[ context.frame % 2]
	const curr = data[(context.frame + 1) % 2]
	const w = cols
	const h = rows * 2

	// Fill a random rect of 10x10
	if (cursor.pressed) {
		const cx = Math.floor(cursor.x) // cursor has float values
		const cy = Math.floor(cursor.y * 2)
		const s = 5
		for (let y=cy-s; y<=cy+s; y++) {
			for (let x=cx-s; x<=cx+s; x++) {
				const val = Math.random() < 0.5 ? 1 : 0
				set(val, x, y, w, h, prev)
			}
		}
	}

	// Update the automata
	for (let y=0; y<h; y++) {
		for (let x=0; x<w; x++) {
			const current = get(x, y, w, h, prev)
			const neighbors =
				get(x - 1, y - 1, w, h, prev) +
				get(x,     y - 1, w, h, prev) +
				get(x + 1, y - 1, w, h, prev) +
				get(x - 1, y,     w, h, prev) +
				get(x + 1, y,     w, h, prev) +
				get(x - 1, y + 1, w, h, prev) +
				get(x,     y + 1, w, h, prev) +
				get(x + 1, y + 1, w, h, prev)
			// Update
			const i = x + y * w
			if (current == 1) {
				curr[i] = neighbors == 2 || neighbors == 3 ? 1 : 0
			} else {
				curr[i] = neighbors == 3 ? 1 : 0
			}
		}
	}
}

// Just a renderer
export function main(coord, context, cursor, buffer) {
	// Current buffer
	const curr = data[(context.frame + 1) % 2]

	// Upper and lower half
	const idx = coord.x + coord.y * 2 * context.cols
	const upper = curr[idx]
	const lower = curr[idx + context.cols]

	if (upper && lower) return '█' // both cells are occupied
	if (upper)          return '▀' // upper cell
	if (lower)          return '▄' // lower cell
	                    return ' ' // both cells are empty
}

// Draw some info
import { drawBox } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {

	const buff = data[(context.frame + 1) % 2]
	const numCells = buff.reduce((a, b) => a + b, 0)

	let text = ''
	text += 'frame ' + context.frame + '\n'
	text += 'size  ' + context.cols + '×' + context.rows + '\n'
	text += 'cells ' + numCells + '/' + buff.length + '\n'

    drawBox(text, {
		backgroundColor : 'tomato',
		color           : 'black',
		borderStyle     : 'double',
		shadowStyle     : 'gray'
	}, buffer)
}

