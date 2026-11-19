import { useElement, applyStyle, loadFont, fontInfo, watchElement } from '../core/style.js'

export default async function canvas(target, settings) {
	let { element, created } = useElement(target, 'canvas')
	// A program can ask for the canvas renderer: in any other element a canvas is created
	if (element.nodeName != 'CANVAS') {
		const c = document.createElement('canvas')
		c.style.cssText = 'display:block;width:100%;height:100%'
		element.appendChild(c)
		element = c
		created = true
	}
	applyStyle(element, settings)
	await loadFont(element)

	// A canvas without a CSS size takes the size of its attributes: setting them to the
	// device resolution would grow it at each resize. Such a canvas (default size 300×150,
	// no inline size) gets a fixed CSS size once; a canvas sized by CSS is left alone
	const r0 = element.getBoundingClientRect()
	if (!element.style.width && !element.style.height && r0.width == element.width && r0.height == element.height) {
		element.style.width = r0.width + 'px'
		element.style.height = r0.height + 'px'
	}

	const c2d = element.getContext('2d')
	let rw = -1
	let rh = -1
	let dpr = 1
	let metrics = null
	let defaults
	const watch = watchElement(element, () => metrics = null)

	function measure() {
		const { width, height } = watch.size
		const ndpr = globalThis.devicePixelRatio || 1
		if (!metrics || width != rw || height != rh || ndpr != dpr) {
			rw = width
			rh = height
			dpr = ndpr
			element.width = Math.round(rw * dpr)
			element.height = Math.round(rh * dpr)
			const f = fontInfo(element)
			defaults = cellDefaults(f, settings)
			metrics = measureFont(c2d, f)
		}
		return {
			cols    : settings.cols || Math.floor(rw / metrics.cellWidth),
			rows    : settings.rows || Math.floor(rh / metrics.lineHeight),
			width   : rw,
			height  : rh,
			metrics,
		}
	}

	return {
		element,
		measure,
		render(context, buffer) {
			drawCells(c2d, buffer, metrics, defaults, dpr)
		},
		snapshot(format) {
			if (format != 'png') return null
			return new Promise(resolve => element.toBlob(resolve))
		},
		dispose() {
			watch.dispose()
			if (created) element.remove()
		},
	}
}

export function cellDefaults(f, settings) {
	return {
		color           : settings.color || f.color,
		backgroundColor : settings.backgroundColor || null,
		fontWeight      : settings.fontWeight || f.fontWeight,
		fontSize        : f.fontSize,
		fontFamily      : f.fontFamily,
	}
}

export function measureFont(c2d, f) {
	c2d.font = f.fontWeight + ' ' + f.fontSize + 'px ' + f.fontFamily
	const cellWidth = c2d.measureText('X'.repeat(50)).width / 50
	// Integer rows: no seams between the cell backgrounds
	const lineHeight = Math.round(f.lineHeight)
	// Vertical position as in the DOM: the font box centered in the line
	const tm = c2d.measureText('X')
	const ascent = tm.fontBoundingBoxAscent
	const descent = tm.fontBoundingBoxDescent
	const baseline = ascent >= 0 && descent >= 0 ? (lineHeight - ascent - descent) / 2 + ascent : null
	return Object.freeze({
		cellWidth,
		lineHeight,
		aspect     : cellWidth / lineHeight,
		fontFamily : f.fontFamily,
		fontSize   : f.fontSize,
		baseline,
	})
}

// Also used for the PNG snapshots of other renderers
export function drawCells(c2d, buffer, m, d, dpr) {
	const { width : cols, height : rows, data } = buffer
	const cw = m.cellWidth
	const lh = m.lineHeight
	const bg = d.backgroundColor
	const suffix = ' ' + d.fontSize + 'px ' + d.fontFamily

	c2d.setTransform(1, 0, 0, 1, 0, 0)
	if (bg) {
		c2d.fillStyle = bg
		c2d.fillRect(0, 0, c2d.canvas.width, c2d.canvas.height)
	} else {
		c2d.clearRect(0, 0, c2d.canvas.width, c2d.canvas.height)
	}
	c2d.setTransform(dpr, 0, 0, dpr, 0, 0)
	c2d.textBaseline = m.baseline === null ? 'middle' : 'alphabetic'
	const by = m.baseline === null ? lh / 2 : m.baseline

	let font = ''
	let fill = ''
	let idx = 0
	for (let j=0; j<rows; j++) {
		const y = j * lh
		for (let i=0; i<cols; i++) {
			const cell = data[idx++]
			const x = i * cw
			if (cell.backgroundColor && cell.backgroundColor !== bg) {
				fill = cell.backgroundColor
				c2d.fillStyle = fill
				c2d.fillRect(Math.round(x), y, Math.ceil(cw), lh)
			}
			if (cell.char === ' ') continue
			const f = (cell.fontWeight || d.fontWeight) + suffix
			if (f !== font) {
				font = f
				c2d.font = f
			}
			const c = cell.color || d.color
			if (c !== fill) {
				fill = c
				c2d.fillStyle = c
			}
			c2d.fillText(cell.char, x, y + by)
		}
	}
}
