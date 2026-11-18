import { Grid } from './grid.js'
import { write } from './block.js'
import { wrap, measure, truncate, length } from './text.js'

// Clockwise from the top left corner: ┌ ─ ┐ │ ┘ ─ └ │
// A custom border is any string of 8 chars
export const BORDERS = {
	single       : '┌─┐│┘─└│',
	double       : '╔═╗║╝═╚║',
	round        : '╭─╮│╯─╰│',
	bold         : '┏━┓┃┛━┗┃',
	singleDouble : '┌─╖║╝═╘│',
	fat          : '█▀███▄██',
	ascii        : '+-+|+-+|',
	none         : '        ',
}

// Merged into the cells under the shadow: a char, a color, or both.
// A custom shadow is any partial cell
export const SHADOWS = {
	light   : { char : '░' },
	medium  : { char : '▒' },
	dark    : { char : '▓' },
	solid   : { char : '█' },
	checker : { char : '▚' },
	x       : { char : '╳' },
	gray    : { color : 'dimgray', backgroundColor : 'lightgray' },
}

const PANEL = {
	width    : 0,      // 0: fits the content
	height   : 0,
	paddingX : 2,
	paddingY : 1,
	title    : '',
	align    : null,   // 'center': x, y is the center
}

// Border, fill and shadow. style: { border, shadow, shadowX, shadowY, color, backgroundColor, fontWeight }.
// Colors left undefined are the output defaults: the box is opaque.
// Returns the rect and its inner area
export function box(buffer, x, y, w, h, style = {}) {
	const s = { border : 'round', shadow : null, shadowX : 2, shadowY : 1, ...style }
	const cell = cellStyle(s)
	const b = [...(BORDERS[s.border] || (typeof s.border == 'string' && length(s.border) == 8 ? s.border : BORDERS.round))]

	const sh = typeof s.shadow == 'string' ? SHADOWS[s.shadow] : s.shadow
	if (sh) {
		buffer.fillRect(x + s.shadowX, y + h, w, s.shadowY, sh)
		buffer.fillRect(x + w, y + s.shadowY, s.shadowX, h - s.shadowY, sh)
	}

	for (let j=0; j<h; j++) {
		for (let i=0; i<w; i++) {
			let char = ' '
			if (j == 0) char = i == 0 ? b[0] : i == w - 1 ? b[2] : b[1]
			else if (j == h - 1) char = i == 0 ? b[6] : i == w - 1 ? b[4] : b[5]
			else if (i == 0) char = b[7]
			else if (i == w - 1) char = b[3]
			buffer.set(x + i, y + j, cell)
			buffer.set(x + i, y + j, char)
		}
	}
	return { x, y, width : w, height : h, inner : { x : x + 1, y : y + 1, width : w - 2, height : h - 2 } }
}

// A box with a title and content: a string (wrapped to width if set, clipped)
// or a Grid (a block). style: box style plus width, height, paddingX, paddingY, title, align
export function panel(buffer, content = '', x = 0, y = 0, style = {}) {
	const s = { ...PANEL, ...style }
	const px = s.paddingX
	const py = s.paddingY
	const isGrid = content instanceof Grid

	let str = ''
	let cw, ch
	if (isGrid) {
		cw = content.width
		ch = content.height
	} else {
		str = String(content)
		if (s.width) str = wrap(str, s.width - 2 - 2 * px)
		const m = measure(str)
		cw = m.width
		ch = m.height
	}

	const w = s.width || Math.max(cw + 2 + 2 * px, s.title ? length(s.title) + 6 : 0)
	const h = s.height || ch + 2 + 2 * py
	if (s.align == 'center') {
		x = Math.round(x) - Math.floor(w / 2)
		y = Math.round(y) - Math.floor(h / 2)
	}

	const r = box(buffer, x, y, w, h, s)
	const cell = cellStyle(s)

	if (s.title && w >= 6) write(buffer, ' ' + truncate(s.title, w - 6) + ' ', x + 2, y, cell)

	const ix = x + 1 + px
	const iy = y + 1 + py
	const iw = Math.max(0, w - 2 - 2 * px)
	const ih = Math.max(0, h - 2 - 2 * py)

	if (isGrid) {
		write(buffer, content.getRect(0, 0, Math.min(iw, cw), Math.min(ih, ch)), ix, iy, cell)
	} else {
		const lines = str.split('\n').slice(0, ih)
		for (let i=0; i<lines.length; i++) write(buffer, truncate(lines[i], iw), ix, iy + i, cell)
	}

	return { ...r, inner : { x : ix, y : iy, width : iw, height : ih } }
}

// Frame, time, size and cursor info, for debugging
export function info(ctx, x = 2, y = 1, style = {}) {
	const text = [
		'fps     ' + Math.round(ctx.fps),
		'frame   ' + ctx.frame,
		'time    ' + Math.floor(ctx.time),
		'size    ' + ctx.cols + '×' + ctx.rows,
		'aspect  ' + ctx.metrics.aspect.toFixed(2),
		'cursor  ' + Math.floor(ctx.cursor.x) + ',' + Math.floor(ctx.cursor.y),
	].join('\n')
	// Fixed width: the box does not change size with the numbers
	return panel(ctx.buffer, text, x, y, { width : 24, ...style })
}

function cellStyle(s) {
	return { color : s.color, backgroundColor : s.backgroundColor, fontWeight : s.fontWeight }
}
