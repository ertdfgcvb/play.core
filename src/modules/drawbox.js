/**
@module   drawbox.js
@desc     Draw text boxes with optional custom styles
@category public

A style object can be passed to override the default style:

const style = {
	x           : 3,
	y           : 2,
	width       : 0,
	height      : 0,
	background  : 'white',
	color       : 'black',
	weight      : 'normal',
	shadowStyle : 'none',
	borderStyle : 'round'
	paddingX    : 2,
	paddingY    : 1,
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
	fat : {
		topleft     : '█' ,
		topright    : '█',
		bottomright : '█',
		bottomleft  : '█',
		top         : '▀',
		bottom      : '▄',
		left        : '█',
		right       : '█',
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

const defaultTextBoxStyle = {
	x           : 2,
	y           : 1,
	width       : 0, // auto width
	height      : 0, // auto height
	paddingX    : 2, // text offset from the left border
	paddingY    : 1, // text offset from the top border
	background  : 'white',
	color       : 'black',
	weight      : 'normal',
	shadowStyle : 'none',
	borderStyle : 'round',
	shadowX     : 2, // horizontal shadow offset
	shadowY     : 1, // vertical shadow offset
}

import { wrap, measure } from './string.js'
import { merge, setRect, mergeRect, mergeText } from './buffer.js'

export function drawBox(text, style, buffers, target) {

	const s = {...defaultTextBoxStyle, ...style}

	let boxWidth  = s.width
	let boxHeight = s.height

	if (!boxWidth || !boxHeight) {
		const m = measure(text)
		boxWidth = boxWidth || m.maxWidth + s.paddingX * 2
		boxHeight = boxHeight || m.numLines + s.paddingY * 2
	}

	const x1 = s.x
	const y1 = s.y
	const x2 = s.x + boxWidth - 1
	const y2 = s.y + boxHeight - 1
	const w  = boxWidth
	const h  = boxHeight

	const border = borderStyles[s.borderStyle] || borderStyles['round']

	// Background, overwrite the buffer
	setRect({
		char       : border.bg,
		color      : s.color,
		weight     : s.weight,
		background : s.background
	}, x1, y1, w, h, buffers, target)

	// Corners
	merge({ char : border.topleft     }, x1, y1, buffers, target)
	merge({ char : border.topright    }, x2, y1, buffers, target)
	merge({ char : border.bottomright }, x2, y2, buffers, target)
	merge({ char : border.bottomleft  }, x1, y2, buffers, target)

	// Top & Bottom
	mergeRect({ char : border.top    }, x1+1, y1, w-2, 1, buffers, target)
	mergeRect({ char : border.bottom }, x1+1, y2, w-2, 1, buffers, target)

	// Left & Right
	mergeRect({ char : border.left  }, x1, y1+1, 1, h-2, buffers, target)
	mergeRect({ char : border.right }, x2, y1+1, 1, h-2, buffers, target)

	// Shadows
	const ss = shadowStyles[s.shadowStyle] || shadowStyles['none']
	if (ss !== shadowStyles['none']) {
		const ox = s.shadowX
		const oy = s.shadowY
		// Shadow Bottom
		mergeRect(ss, x1+ox, y2+1, w, oy, buffers, target)
		// Shadow Right
		mergeRect(ss, x2+1, y1+oy, ox, h-oy, buffers, target)
	}

	// Txt
	mergeText({
		text,
		color: style.color,
		background: style.background,
		weight: style.weght
	}, x1+s.paddingX, y1+s.paddingY, buffers, target)
}

// -- Utility for some info output ---------------------------------------------

const defaultInfoStyle = {
	width       : 24,
	background  : 'white',
	color       : 'black',
	weight      : 'normal',
	shadowStyle : 'none',
	borderStyle : 'round',
}

export function drawInfo(context, cursor, buffers, style) {

	let info = ''
	info += 'FPS         ' + Math.round(context.runtime.fps) + '\n'
	info += 'frame       ' + context.frame + '\n'
	info += 'time        ' + Math.floor(context.time) + '\n'
	info += 'size        ' + context.cols + '×' + context.rows + '\n'
	// info += 'row repaint ' + context.runtime.updatedRowNum + '\n'
	info += 'font aspect ' + context.metrics.aspect.toFixed(2) + '\n'
	info += 'cursor      ' + Math.floor(cursor.x) + ',' + Math.floor(cursor.y) + '\n'
	// NOTE: width and height can be a float in case of user zoom
	// info += 'context      ' + Math.floor(context.width) + '×' + Math.floor(context.height) + '\n'

	const textBoxStyle = {...defaultInfoStyle, ...style}

	drawBox(info, textBoxStyle, buffers)
}
