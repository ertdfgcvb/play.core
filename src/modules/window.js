import { Grid } from './grid.js'
import { write } from './block.js'
import { wrap, measure, truncate, length, align } from './text.js'

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
	width      : 0,    // 0: fits the content
	height     : 0,
	paddingX   : 2,
	paddingY   : 1,
	title      : '',
	titleStyle : null, // cell style of the title, or 'invert' (swaps color and backgroundColor)
	align      : null, // 'center': x, y is the center
}

// Border, fill and shadow, into the buffer (or ctx.buffer). style: { border, shadow, shadowX, shadowY, color, backgroundColor, fontWeight }.
// Colors left undefined are the output defaults: the box is opaque.
// Returns the rect and its inner area
export function box(target, x, y, w, h, style = {}) {
	const buffer = target.buffer || target
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
// or a Grid (a block). style: box style plus width, height, paddingX, paddingY, title, titleStyle, align
export function panel(target, content = '', x = 0, y = 0, style = {}) {
	const buffer = target.buffer || target
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

	if (s.title && w >= 6) {
		const ts = s.titleStyle == 'invert' ? { ...cell, color : cell.backgroundColor, backgroundColor : cell.color } : { ...cell, ...s.titleStyle }
		write(buffer, ' ' + truncate(s.title, w - 6) + ' ', x + 2, y, ts)
	}

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
	return panel(ctx, infoText(ctx), x, y, { ...INFO, ...style })
}

const INFO = {
	title           : 'info',
	paddingX        : 1,
	paddingY        : 0,
	color           : 'white',
	backgroundColor : 'royalblue',
	shadow          : 'gray',
	titleStyle      : 'invert',
}

// Lines padded to a fixed width: a window fitting the text keeps its size
export function infoText(ctx) {
	return [
		'fps     ' + Math.round(ctx.fps),
		'frame   ' + ctx.frame,
		'time    ' + Math.floor(ctx.time),
		'size    ' + ctx.cols + '×' + ctx.rows,
		'aspect  ' + ctx.metrics.aspect.toFixed(2),
		'cursor  ' + Math.floor(ctx.cursor.x) + ',' + Math.floor(ctx.cursor.y),
	].map(l => align(l, 20)).join('\n')
}

// -- Desktop: a simple window manager -----------------------------------------

// Windows on top of the output: click to bring to front, drag by the title bar,
// close with the × in the title bar. Call update(ctx) in post().
// style: the default panel style of the windows, each window style overrides it
export class Desktop {
	constructor(style = {}) {
		this.style = style
		this.windows = []
		this.drag = null
	}

	// opts: x, y, width, height (0: fit), title, content, closable,
	// and any panel style (color, border, shadow, ...) overriding the Desktop style.
	// content: a string, a block (Grid), or a function ctx => string or block, called each frame.
	// Returns the window: its fields can be changed, close() removes it
	open(opts = {}) {
		const { x = 0, y = 0, width = 0, height = 0, title = '', content = '', closable = true, ...style } = opts
		const win = { x, y, width, height, title, content, closable, style, rect : null }
		win.close = () => this.close(win)
		this.windows.push(win)
		return win
	}


	close(win) {
		const i = this.windows.indexOf(win)
		if (i >= 0) this.windows.splice(i, 1)
		if (this.drag && this.drag.win == win) this.drag = null
	}

	front(win) {
		const i = this.windows.indexOf(win)
		if (i >= 0 && i < this.windows.length - 1) {
			this.windows.splice(i, 1)
			this.windows.push(win)
		}
	}

	// The topmost window covering the cell, or null
	hit(x, y) {
		x = Math.floor(x)
		y = Math.floor(y)
		for (let i=this.windows.length - 1; i>=0; i--) {
			const r = this.windows[i].rect
			if (r && x >= r.x && y >= r.y && x < r.x + r.width && y < r.y + r.height) return this.windows[i]
		}
		return null
	}

	update(ctx) {
		const c = ctx.cursor
		const cx = Math.floor(c.x)
		const cy = Math.floor(c.y)

		// A press shorter than a frame is missed: the cursor is sampled per frame
		if (c.pressed && !c.prev.pressed) {
			const win = this.hit(cx, cy)
			if (win) {
				this.front(win)
				const r = win.rect
				if (cy == r.y) {
					if (win.closable && cx == r.x + r.width - 3) {
						win.close()
					} else {
						this.drag = { win, dx : cx - win.x, dy : cy - win.y }
					}
				}
			}
		}

		if (this.drag) {
			if (c.pressed) {
				const w = this.drag.win
				// The title bar stays reachable
				w.x = Math.max(4 - w.rect.width, Math.min(ctx.cols - 4, cx - this.drag.dx))
				w.y = Math.max(0, Math.min(ctx.rows - 1, cy - this.drag.dy))
			} else {
				this.drag = null
			}
		}

		for (const win of this.windows) {
			const style = { ...this.style, ...win.style, width : win.width, height : win.height, title : win.title }
			const content = typeof win.content == 'function' ? win.content(ctx) : win.content
			win.rect = panel(ctx, content ?? '', win.x, win.y, style)
			if (win.closable && win.rect.width >= 8) write(ctx, '×', win.rect.x + win.rect.width - 3, win.rect.y, cellStyle(style))
		}
	}
}

function cellStyle(s) {
	return { color : s.color, backgroundColor : s.backgroundColor, fontWeight : s.fontWeight }
}
