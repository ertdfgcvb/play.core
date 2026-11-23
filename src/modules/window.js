// window.js: Boxes, panels with title and text, Desktop (window manager), debug info text

import { Grid } from './grid.js'
import { write, isGridLike } from './block.js'
import { run } from '../run.js'
import { wrap, measure, truncate, length, align } from './text.js'
import { parseColor, mixColor, rgb2css, rgb2hex } from './color.js'

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

// The ends of the title and the close button (left, close, right), joined to the top line of a border
const ENDS = {
	single       : '┤●├',
	double       : '╡●╞',
	round        : '┤●├',
	bold         : '┫●┣',
	singleDouble : '┤●├',
	ascii        : '|•|',
}

// A border without ends of its own (fat, none, custom): spaces
function ends(border) {
	const e = ENDS[border ?? 'round']
	if (e) return [...e]
	return typeof border == 'string' && (BORDERS[border] || length(border) == 8) ? [' ', '●', ' '] : [...ENDS.round]
}

const PANEL = {
	width      : 0,    // 0: fits the content
	height     : 0,
	paddingX   : 2,
	paddingY   : 1,
	title      : '',
	titleStyle : null, // cell style of the title, or 'invert' (swaps color and backgroundColor)
	titleX     : 2,    // first column of the title, from the left border
	titleAlign : 'center', // or 'left' (at titleX)
	align      : null, // 'center': x, y is the center
}

// Border, fill and shadow, into the buffer (or context.buffer). style: { border, shadow, shadowX, shadowY, shadowColor, color, backgroundColor, fontWeight }.
// shadow: 0..1, how much the cells under it are tinted toward shadowColor (true: 0.2); their chars stay.
// Colors left undefined are the output defaults: the box is opaque.
// Returns the rect and its inner area
export function box(target, x, y, w, h, style = {}) {
	const buffer = target.buffer || target
	const s = { border : 'round', shadow : 0, shadowX : 2, shadowY : 1, shadowColor : 'black', ...style }
	const cell = cellStyle(s)
	const b = [...(BORDERS[s.border] || (typeof s.border == 'string' && length(s.border) == 8 ? s.border : BORDERS.round))]

	const k = s.shadow === true ? 0.2 : +s.shadow || 0
	if (k > 0) {
		shade(buffer, x + s.shadowX, y + h, w, s.shadowY, k, s.shadowColor)
		shade(buffer, x + w, y + s.shadowY, s.shadowX, h - s.shadowY, k, s.shadowColor)
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

// Tints the cells of a rect toward a color, keeping their chars
function shade(buffer, x, y, w, h, k, tint) {
	const t = parseColor(tint) || { r : 0, g : 0, b : 0 }
	// An undefined background is the page's: a translucent tint over it
	const over = rgb2css({ r : t.r, g : t.g, b : t.b, a : k })
	const mix = css => {
		const c = parseColor(css)
		return c ? rgb2hex(mixColor(c, { ...t, a : c.a }, k)) : css
	}
	for (let j=y; j<y+h; j++) {
		for (let i=x; i<x+w; i++) {
			const c = buffer.get(i, j)
			if (!c || typeof c != 'object') continue
			buffer.set(i, j, { color : mix(c.color), backgroundColor : c.backgroundColor ? mix(c.backgroundColor) : over })
		}
	}
}

// A box with a title and content: a string (wrapped to width if set, clipped)
// or a Grid (a block). style: box style plus width, height, paddingX, paddingY, title, titleStyle, align
export function panel(target, content = '', x = 0, y = 0, style = {}) {
	const buffer = target.buffer || target
	const s = { ...PANEL, ...style }
	const px = s.paddingX
	const py = s.paddingY
	const isGrid = isGridLike(content)

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

	const w = s.width || Math.max(cw + 2 + 2 * px, s.title ? length(s.title) + s.titleX + 4 : 0)
	const h = s.height || ch + 2 + 2 * py
	if (s.align == 'center') {
		x = Math.round(x) - Math.floor(w / 2)
		y = Math.round(y) - Math.floor(h / 2)
	}

	const r = box(buffer, x, y, w, h, s)
	const cell = cellStyle(s)

	if (s.title && w >= s.titleX + 4) {
		const e = ends(s.border)
		const t = e[0] + truncate(s.title, w - s.titleX - 4) + e[2]
		const tx = s.titleAlign == 'left' ? s.titleX : Math.max(s.titleX, Math.floor((w - length(t)) / 2))
		write(buffer, t, x + tx, y, variant(cell, s.titleStyle))
	}

	const ix = x + 1 + px
	const iy = y + 1 + py
	const iw = Math.max(0, w - 2 - 2 * px)
	const ih = Math.max(0, h - 2 - 2 * py)

	if (isGrid) {
		const src = content instanceof Grid ? content.getRect(0, 0, Math.min(iw, cw), Math.min(ih, ch)) : content
		write(buffer, src, ix, iy, cell)
	} else {
		const lines = str.split('\n').slice(0, ih)
		for (let i=0; i<lines.length; i++) write(buffer, truncate(lines[i], iw), ix, iy + i, cell)
	}

	return { ...r, inner : { x : ix, y : iy, width : iw, height : ih } }
}

// The info window of Desktop.info()
const INFO = {
	title           : 'info',
	paddingX        : 1,
	paddingY        : 0,
	color           : 'white',
	backgroundColor : 'royalblue',
	shadow          : 0.2,
}

// Frame, time, size and cursor info, for debugging: write(context, infoText(context), 0, 0)
// Lines padded to a fixed width: a window fitting the text keeps its size
export function infoText(context) {
	return [
		'fps     ' + Math.round(context.fps),
		'frame   ' + context.frame,
		'time    ' + Math.floor(context.time),
		'size    ' + context.cols + '×' + context.rows,
		'aspect  ' + context.metrics.aspect.toFixed(2),
		'cursor  ' + Math.floor(context.cursor.x) + ',' + Math.floor(context.cursor.y),
	].map(l => align(l, 20)).join('\n')
}

// -- Desktop: a simple window manager -----------------------------------------

// Windows on top of the output: click to bring to front, drag by the title bar,
// close with ┤●├ in the title bar (closeStyle: style of the ●). Call update(context) in post().
// style: the default panel style of the windows, each window style overrides it
export class Desktop {
	constructor(style = {}) {
		this.style = style
		this.windows = []
		this.drag = null
	}

	// opts: x, y, width, height (0: fit), title, content, closable,
	// and any panel style (color, border, shadow, ...) overriding the Desktop style.
	// content: a string, a block (Grid), a function context => string or block (called each frame),
	// or a program (a module, or a URL object: a separate copy) running inside the window.
	// Returns the window: its fields can be changed, close() removes it
	open(opts = {}) {
		const { x = 0, y = 0, width = 0, height = 0, title = '', content = '', closable = true, ...style } = opts
		const win = { x, y, width, height, title, content, closable, style, rect : null, program : null }
		if (isProgram(content)) {
			// A program needs a size: it does not fit its content
			win.width = width || 32
			win.height = height || 12
			win.program = startProgram(content)
		}
		win.close = () => this.close(win)
		this.windows.push(win)
		return win
	}


	// Opens the info window; opts override its style
	info(opts = {}) {
		return this.open({ x : 2, y : 1, ...INFO, content : infoText, ...opts })
	}

	close(win) {
		const i = this.windows.indexOf(win)
		if (i >= 0) this.windows.splice(i, 1)
		if (win.program) win.program.stop()
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

	update(context) {
		const c = context.cursor
		const cx = Math.floor(c.x)
		const cy = Math.floor(c.y)

		// A press shorter than a frame is missed: the cursor is sampled per frame
		if (c.pressed && !c.prev.pressed) {
			const win = this.hit(cx, cy)
			if (win) {
				this.front(win)
				const r = win.rect
				if (cy == r.y) {
					if (win.closable && cx >= r.x + 1 && cx <= r.x + 3) {
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
				w.x = Math.max(4 - w.rect.width, Math.min(context.cols - 4, cx - this.drag.dx))
				w.y = Math.max(0, Math.min(context.rows - 1, cy - this.drag.dy))
			} else {
				this.drag = null
			}
		}

		const top = this.windows[this.windows.length - 1]
		for (const win of this.windows) {
			const style = { ...this.style, ...win.style, width : win.width, height : win.height, title : win.title }
			let content
			if (win.program) {
				const s = { ...PANEL, ...style }
				const inner = {
					x      : win.x + 1 + s.paddingX,
					y      : win.y + 1 + s.paddingY,
					width  : Math.max(1, win.width - 2 - 2 * s.paddingX),
					height : Math.max(1, win.height - 2 - 2 * s.paddingY),
				}
				// The pointer belongs to the program only on the topmost window, not while dragging
				const active = win == top && !this.drag
				content = win.program.step(context, inner, active)
			} else {
				content = typeof win.content == 'function' ? win.content(context) : win.content
			}
			// Turbo Vision: the close button ┤●├ at the left of the title bar, the title after it
			const closable = win.closable && (win.width || 8) >= 8
			if (closable) style.titleX = 5
			win.rect = panel(context, content ?? '', win.x, win.y, style)
			if (closable) {
				const cell = cellStyle(style)
				const e = ends(style.border)
				write(context, e[0] + ' ' + e[2], win.rect.x + 1, win.rect.y, cell)
				write(context, e[1], win.rect.x + 2, win.rect.y, variant(cell, style.closeStyle))
			}
		}
	}
}

// A cell style, 'invert' or null (unchanged)
function variant(cell, style) {
	if (style == 'invert') return { ...cell, color : cell.backgroundColor, backgroundColor : cell.color }
	return { ...cell, ...style }
}

function isProgram(c) {
	if (typeof URL == 'function' && c instanceof URL) return true
	return typeof c == 'object' && c !== null && !isGridLike(c) && ['main', 'pre', 'post'].some(k => typeof c[k] == 'function')
}

// A program inside a window: run() with a renderer that has the size of the window,
// stepped by the Desktop each frame; the cursor is relative to the inner area
function startProgram(source) {
	const size = { cols : 1, rows : 1 }
	let metrics = Object.freeze({ cellWidth : 1, lineHeight : 1, aspect : 0.5, fontFamily : '', fontSize : 16 })
	const state = { x : 0, y : 0, pressed : false, keys : new Set(), events : [] }
	let handle = null
	let error = null
	let stopped = false

	const renderer = () => ({
		element : null,
		input   : { state, dispose() {} },
		measure : () => ({
			cols    : size.cols,
			rows    : size.rows,
			width   : size.cols * metrics.cellWidth,
			height  : size.rows * metrics.lineHeight,
			metrics,
		}),
		render() {},
		dispose() {},
	})

	run(source, { renderer, autoStart : false, pauseOffscreen : false }).then(h => {
		if (stopped) h.stop()
		else handle = h
	}).catch(err => error = err)

	return {
		get handle() { return handle },
		step(context, inner, active) {
			if (error) return String(error.message || error)
			if (!handle) return ''
			size.cols = inner.width
			size.rows = inner.height
			metrics = context.metrics
			const cw = metrics.cellWidth
			const lh = metrics.lineHeight
			const c = context.cursor
			const lx = c.x - inner.x
			const ly = c.y - inner.y
			const inside = lx >= 0 && ly >= 0 && lx < inner.width && ly < inner.height
			const pressed = active && inside && c.pressed
			const push = type => state.events.push({ type, x : lx * cw, y : ly * lh })
			if (active && inside && (lx != state.x / cw || ly != state.y / lh)) push('pointerMove')
			state.x = lx * cw
			state.y = ly * lh
			if (pressed && !state.pressed) push('pointerDown')
			if (!pressed && state.pressed) push('pointerUp')
			state.pressed = pressed
			state.keys.clear()
			for (const k of context.keys) state.keys.add(k)
			try {
				handle.step(1, context.dt)
			} catch (err) {
				error = err
				handle.stop()
				return String(err.message || err)
			}
			return handle.buffer
		},
		stop() {
			stopped = true
			if (handle) handle.stop()
		},
	}
}

function cellStyle(s) {
	return { color : s.color, backgroundColor : s.backgroundColor, fontWeight : s.fontWeight }
}
