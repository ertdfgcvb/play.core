/**
Box drawing helpers.
Boxes can be styled with custom borders and shadows.
a style object has to be passed plus some text content:

const style = {
	x           : 2,
	y           : 2,
	width       : 10,
	height      : 5,
	txt         : ''
	background  : 'white',
	color       : 'black',
	weight      : 'normal',
	shadowStyle : 'none',
	borderStyle : 'round'
}
*/

// The drawing styles for the borders.
const borderStyles = {
	double : {
		topleft     : '╔',
		topright    : '╗',
		bottomright : '╝',
		bottomleft  : '╚',
		top         : '═',
		bottom      : '═',
		left        : '║',
		right       : '║',
		bg          : ' ',
	},
	single : {
		topleft     : '┌',
		topright    : '┐',
		bottomright : '┘',
		bottomleft  : '╰',
		top         : '─',
		bottom      : '─',
		left        : '│',
		right       : '│',
		bg          : ' ',
	},
	round : {
		topleft     : '╭',
		topright    : '╮',
		bottomright : '╯',
		bottomleft  : '╰',
		top         : '─',
		bottom      : '─',
		left        : '│',
		right       : '│',
		bg          : ' ',
	},
	singleDouble : {
		topleft     : '┌',
		topright    : '╖',
		bottomright : '╝',
		bottomleft  : '╘',
		top         : '─',
		bottom      : '═',
		left        : '│',
		right       : '║',
		bg          : ' ',
	},
	none : {
		topleft     : ' ',
		topright    : ' ',
		bottomright : ' ',
		bottomleft  : ' ',
		top         : ' ',
		bottom      : ' ',
		left        : ' ',
		right       : ' ',
		bg          : ' ',
	}
}

// The glyphs to draw a shadow.
const shadowStyles = {
	light : {
		char   : '░',
	},
	medium : {
		char   : '▒',
	},
	dark : {
		char   : '▓',
	},
	solid : {
		char   : '█',
	},
	checker : {
		char   : '▚',
	},
	x : {
		char   : '╳',
	},
	gray : {
		color      : 'dimgray',
		background : 'lightgray'
	},
	none : {
	}
}

// Safe set and merge functions for a generic buffer object.
// A buffer object contains at least a 'state' array
// and a 'width' and a 'height' field to allow easy setting.
// The value to be set is a 'cell' object like:
// { char, color, background, weight }
// which can overwrite the buffer (set) or partially merged (merge)
export function set(val, x, y, buffers) {
	if (x < 0 || x >= buffers.cols) return
	if (y < 0 || y >= buffers.rows) return
	const i = x + y * buffers.cols
	buffers.state[i] = val
}

export function merge(val, x, y, buffers) {
	if (x < 0 || x >= buffers.cols) return
	if (y < 0 || y >= buffers.rows) return
	const i = x + y * buffers.cols
	buffers.state[i] = {...(buffers.state[i]) || {}, ...val}
}

export function setRect(val, x, y, w, h, buffers) {
	for (let j=y; j<y+h; j++ ) {
		for (let i=x; i<x+w; i++ ) {
			set(val, i, j, buffers)
		}
	}
}

export function mergeRect(val, x, y, w, h, buffers) {
	for (let j=y; j<y+h; j++ ) {
		for (let i=x; i<x+w; i++ ) {
			merge(val, i, j, buffers)
		}
	}
}

export function setText(style, buffers) {

}

const defaultBoxStyle = {
	x           : 2,
	y           : 2,
	width       : 10,
	height      : 5,
	txt         : '',
	background  : 'white',
	color       : 'black',
	weight      : 'normal',
	shadowStyle : 'none',
	borderStyle : 'round',
	shadowX     : 2,
	shadowY     : 1,
}

export function drawBox(style, buffers){

	const s = {...defaultBoxStyle, ...style}

	const buf_w = buffers.cols
	const buf_h = buffers.rows
	const x1 = s.x
	const y1 = s.y
	const x2 = s.x+s.width-1
	const y2 = s.y+s.height-1
	const w = s.width  // TODO: auto
	const h = s.height // TODO: auto

	const border = borderStyles[s.borderStyle] || borderStyles['round']

	// Background, overwrite the buffer
	setRect({
		char       : border.bg,
		color      : s.color,
		weight     : s.weight,
		background : s.background
	}, x1, y1, w, h, buffers)

	// Corners
	merge({ char : border.topleft     }, x1, y1, buffers)
	merge({ char : border.topright    }, x2, y1, buffers)
	merge({ char : border.bottomright }, x2, y2, buffers)
	merge({ char : border.bottomleft  }, x1, y2, buffers)

	// Top & Bottom
	mergeRect({ char : border.top    }, x1+1, y1, w-2, 1, buffers)
	mergeRect({ char : border.bottom }, x1+1, y2, w-2, 1, buffers)

	// Left & Right
	mergeRect({ char : border.left  }, x1, y1+1, 1, h-2, buffers)
	mergeRect({ char : border.right }, x2, y1+1, 1, h-2, buffers)

	// Shadows
	const ox = s.shadowX
	const oy = s.shadowY
	const ss = shadowStyles[s.shadowStyle] || shadowStyles['none']

	// Shadow Bottom
	mergeRect( ss, x1+ox, y2+1, w, oy, buffers )

	// Shadow Right
	mergeRect( ss, x2+1, y1+oy, ox, h-oy, buffers )

	// Txt
	if (s.txt) {
		s.txt.trim().split('\n').forEach((line, lineNum) => {
			const row = y1 + 1 + lineNum
			line.split('').forEach((char, charNum) => {
				const col = x1 + 2 + charNum
				merge({char}, col, row, buffers)
			})
		})
	}
}

// -- Utility for some info output ---------------------------------------------

const defaultInfoStyle = {
	x           : 3,
	y           : 2,
	width       : 24,
	height      : 8,
	background  : 'white',
	color       : 'black',
	weight      : 'normal',
	shadowStyle : 'none',
	borderStyle : 'round',
}

export function drawInfo(context, cursor, buffers, style){

	let txt = ""
	txt += "FPS       " + Math.round(context.fps) + "\n"
	txt += "frame     " + context.frame + "\n"
	txt += "time      " + Math.floor(context.time) + "\n"
	txt += "size      " + context.cols + "×" + context.rows + "\n"
	// NOTE: width and height can be a float in case of user zoom
	txt += "context   " + Math.floor(context.width) + "×" + Math.floor(context.height) + "\n"
	txt += "cursor    " + Math.floor(cursor.x) + "," + Math.floor(cursor.y) + "\n"

	const s = {...defaultInfoStyle, ...style, txt}

	drawBox(s, buffers)
}
