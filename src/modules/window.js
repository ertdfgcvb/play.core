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

// Background colors given in turn to the Desktop windows (white text)
export const PALETTE = ['royalblue', 'crimson', 'seagreen', 'darkorange', 'darkviolet', 'teal', 'sienna', 'slategray']

// The look of the Desktop windows and of info()
const WINDOW = {
	paddingX   : 1,
	paddingY   : 0,
	shadow     : 'gray',
	titleStyle : 'invert',
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
	// Fixed size: the box does not change with the numbers
	return panel(ctx, infoText(ctx), x, y, { ...INFO, ...style })
}

const INFO = {
	...WINDOW,
	title           : 'info',
	width           : 24,
	height          : 8,
	color           : 'white',
	backgroundColor : 'royalblue',
}

export function infoText(ctx) {
	return [
		'fps     ' + Math.round(ctx.fps),
		'frame   ' + ctx.frame,
		'time    ' + Math.floor(ctx.time),
		'size    ' + ctx.cols + '×' + ctx.rows,
		'aspect  ' + ctx.metrics.aspect.toFixed(2),
		'cursor  ' + Math.floor(ctx.cursor.x) + ',' + Math.floor(ctx.cursor.y),
	].join('\n')
}

// -- Desktop: a simple window manager -----------------------------------------

// Content functions get a view of the inner area: local coords, clipped
class View {
	constructor(buffer, x, y, width, height) {
		this.target = buffer
		this.ox = x
		this.oy = y
		this.width = width
		this.height = height
	}

	get(x, y) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null
		return this.target.get(this.ox + x, this.oy + y)
	}

	set(x, y, value) {
		x = Math.floor(x)
		y = Math.floor(y)
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
		this.target.set(this.ox + x, this.oy + y, value)
	}

	fillRect(x, y, w, h, value) {
		for (let j=y; j<y+h; j++) {
			for (let i=x; i<x+w; i++) this.set(i, j, value)
		}
		return this
	}
}

// Windows on top of the output: click to bring to front, drag by the title bar,
// close with the × in the title bar. Call update(ctx) in post().
// style: the panel style of all the windows (overrides the window look and the palette)
// palette: background colors given in turn to windows without colors
export class Desktop {
	constructor(style = {}, palette = PALETTE) {
		this.style = { ...WINDOW, ...style }
		this.palette = palette
		this.count = 0
		this.windows = []
		this.drag = null
	}

	// opts: x, y, width, height, title, content, closable, style
	// content: a string, a block, or a function (view, ctx) drawing into the inner area
	// Returns the window: its fields can be changed, close() removes it
	open(opts = {}) {
		const fn = typeof opts.content == 'function'
		const win = {
			x        : 0,
			y        : 0,
			width    : fn ? 24 : 0,
			height   : fn ? 8 : 0,
			title    : '',
			content  : '',
			closable : true,
			style    : {},
			rect     : null,
			...opts,
		}
		const colored = c => c && (c.color !== undefined || c.backgroundColor !== undefined)
		if (!colored(this.style) && !colored(win.style) && this.palette.length) {
			win.style = { color : 'white', backgroundColor : this.palette[this.count % this.palette.length], ...win.style }
		}
		this.count++
		win.close = () => this.close(win)
		this.windows.push(win)
		return win
	}

	// Opens the info box (frame, time, size, cursor) as a window
	info(opts = {}) {
		const { width, height, title, color, backgroundColor } = INFO
		return this.open({
			x : 2, y : 1, width, height, title,
			style   : { color, backgroundColor },
			content : (view, ctx) => write(view, infoText(ctx), 0, 0),
			...opts,
		})
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
			const fn = typeof win.content == 'function'
			win.rect = panel(ctx, fn ? '' : win.content, win.x, win.y, style)
			if (win.closable && win.rect.width >= 8) write(ctx, '×', win.rect.x + win.rect.width - 3, win.rect.y, cellStyle(style))
			if (fn) {
				const i = win.rect.inner
				win.content(new View(ctx.buffer, i.x, i.y, i.width, i.height), ctx)
			}
		}
	}
}

function cellStyle(s) {
	return { color : s.color, backgroundColor : s.backgroundColor, fontWeight : s.fontWeight }
}
