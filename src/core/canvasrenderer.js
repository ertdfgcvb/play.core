/**
@module   canvasrenderer.js
@desc     renders to canvas
@category renderer
*/


export function canvasRenderer(context, buffers, settings) {

	const canvas = context.parentInfo.element

	const scale = devicePixelRatio

	const c = context.cols
	const r = context.rows
	const m = context.metrics

	const cw = m.cellWidth
	const ch = Math.round(m.lineHeight)

	// Stretch the canvas to the container width
	canvas.width = context.parentInfo.width * scale
	canvas.height = context.parentInfo.height * scale

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
	ctx.clearRect(0, 0, canvas.width, canvas.height)

	ctx.fillStyle = bg
	ctx.fillRect(0, 0, cw * c * scale, ch * r * scale)

	ctx.save()
	ctx.scale(scale, scale)

	ctx.fillStyle = fg
	ctx.textBaseline = 'top'

	for (let j=0; j<r; j++) {
		for (let i=0; i<c; i++) {
			const cell = buffers.state[j * c + i]
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
