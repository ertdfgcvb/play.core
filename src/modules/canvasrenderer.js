/**
@module    canvasrenderer.js
@desc      exports a frame to canvas
@cathegory public

*/

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

export function render(context, cursor, buffers, settings) {

	const scale = 2.0

	const r = context.rows
	const c = context.cols
	const m = context.metrics

	const cw = Math.round(m.cellWidth)
	const ch = Math.round(m.lineHeight)

	canvas.width = c * cw * 2
	canvas.height = r * ch * 2

	const ff = context.CSSInfo.fontSize + ' ' + context.CSSInfo.fontFamily

	ctx.textBaseline = 'top'

	const bg = settings && settings.background ? settings.background : 'white'
	const fg = settings && settings.color ? settings.color : 'black'
	const weight = settings && settings.weight ? settings.color : '400'

	ctx.fillStyle = bg
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.save()
	ctx.scale(scale, scale)

	ctx.fillStyle = fg

	for (let j=0; j<r; j++) {
		for (let i=0; i<c; i++) {
			const cell = buffers.state[j * c + i]
			const x = i * cw
			const y = j * ch
			if (cell.background && cell.background != bg) {
				ctx.fillStyle = cell.background || bg
				ctx.fillRect(x, y, cw, ch)
			}
			ctx.font = (cell.weight || weight) + ' ' + ff
			ctx.fillStyle = cell.color || fg
			ctx.fillText(cell.char, x, y)
		}
	}
	ctx.restore()
}
