/**
@module   canvasrenderer.js
@desc     renders to canvas
@category renderer
*/

export default {
	preferredElementNodeName : 'CANVAS',
	render
}

function render(context, buffer) {

	const canvas = context.settings.element

	const scale = devicePixelRatio

	const c = context.cols
	const r = context.rows
	const m = context.metrics

	const cw = m.cellWidth
	const ch = Math.round(m.lineHeight)

	// Shortcut
	const settings = context.settings

	// Fixed size, to allow precise export
	if (settings.canvasSize) {
		canvas.width  = settings.canvasSize.width * scale
		canvas.height = settings.canvasSize.height * scale
		canvas.style.width  = settings.canvasSize.width + 'px'
		canvas.style.height = settings.canvasSize.height + 'px'
	}
	// Stretch the canvas to the container width
	else {
		canvas.width  = context.width * scale
		canvas.height = context.height * scale
	}

	const ff = ' ' + m.fontSize + 'px ' + m.fontFamily
	const bg = settings && settings.background ? settings.background : 'white'
	const fg = settings && settings.color ? settings.color : 'black'
	const weight = settings && settings.weight ? settings.color : '400'

	// Set the background of the box-element
	canvas.style.backgroundColor = settings.background || 'white'

	// Transparent canvas backround for the remaining size
	// (fractions of cellWidth and lineHeight).
	// Only the 'rendered' area has a solid color.
	const ctx = canvas.getContext('2d')
	//ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = bg
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	ctx.save()
	ctx.scale(scale, scale)

	// Custom settings: it’s possible to center the canvas
	if (settings.canvasOffset) {
		const offs = settings.canvasOffset
		const ox = Math.round(offs.x == 'auto' ? (canvas.width / scale - c * cw) / 2 : offs.x)
		const oy = Math.round(offs.y == 'auto' ? (canvas.height / scale - r * ch) / 2 : offs.y)
		ctx.translate(ox, oy)
	}


	ctx.fillStyle = fg
	ctx.textBaseline = 'top'

	for (let j=0; j<r; j++) {
		for (let i=0; i<c; i++) {
			const cell = buffer[j * c + i]
			const x = i * cw
			const y = j * ch
			if (cell.background && cell.background != bg) {
				ctx.fillStyle = cell.background || bg
				ctx.fillRect(Math.round(x), y, Math.ceil(cw), ch)
			}
			ctx.font = (cell.weight || weight) + ff
			ctx.fillStyle = cell.color || fg
			ctx.fillText(cell.char, x, y)
		}
	}
	ctx.restore()
}
