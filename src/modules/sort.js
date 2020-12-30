/**
@module   sort.js
@desc     Sorts a set of characters by brightness
@category public

Paints chars on a temporary canvas and counts the pixels.
This could be done once and then stored / hardcoded.
The fontFamily paramter needs to be set because it's used by the canvas element
to draw the correct font.
*/

export function sort(charSet, fontFamily, ascending = false) {

	const size = 30
	const ctx = document.createElement('canvas').getContext('2d')
	ctx.canvas.width = size * 2
	ctx.canvas.height = size * 2

	ctx.canvas.style.right = '0'
	ctx.canvas.style.top = '0'
	ctx.canvas.style.position = 'absolute'
	document.body.appendChild(ctx.canvas)  // NOTE: needs to be attached to the DOM

	if (ctx.getImageData(0, 0, 1, 1).data.length == 0) {
		console.warn("getImageData() is not supported on this browser.\nCan’t sort chars for brightness.")
		return charSet
	}

	let out = []
	for (let i=0; i<charSet.length; i++) {
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		ctx.fillStyle = 'rgb(255,255,255)'
		ctx.font = size + 'px ' + fontFamily  // NOTE: font family inherit doesn't work
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText(charSet[i], ctx.canvas.width / 2, ctx.canvas.height / 2)

		out[i] = {
			count : 0,
			char  : charSet[i],
			index : i,
		}

		const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data

		for (let y=0; y<ctx.canvas.height; y++) {
			const oy = y * ctx.canvas.width
			for (let x=0; x<ctx.canvas.width; x++) {
				let r = data[4 * (x + oy)]
				out[i].count += r
			}
		}
		//console.log(out[i].char, out[i].count)
	}

	// cleanup
	document.body.removeChild(ctx.canvas)
	if (ascending) {
		return out.sort((a, b) => a.count - b.count).map( x => x.char).join('')
	} else {
		return out.sort((a, b) => b.count - a.count).map( x => x.char).join('')
	}
}
