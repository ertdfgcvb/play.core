// sort.js: Sorts chars by ink coverage in a given font (async)

// Sorts chars by ink coverage, drawn in the given font: densest first
// (dark on light backgrounds), sparsest first with ascending.
// Async: waits for the font, the result depends on it.
//   const density = await sort(' .x?▂▄▆█', 'Simple Console')
export async function sort(chars, fontFamily = 'monospace', { ascending = false, fontWeight = 'normal', size = 32 } = {}) {
	const font = fontWeight + ' ' + size + 'px ' + fontFamily
	if (typeof document != 'undefined' && document.fonts) {
		try {
			await document.fonts.load(font)
		} catch (e) {}
	}

	const w = size * 2
	const canvas = typeof OffscreenCanvas == 'function' ? new OffscreenCanvas(w, w) : document.createElement('canvas')
	canvas.width = w
	canvas.height = w
	const ctx = canvas.getContext('2d', { willReadFrequently : true })
	ctx.font = font
	ctx.textAlign = 'center'
	ctx.textBaseline = 'middle'
	ctx.fillStyle = 'white'

	const list = [...chars].map(char => {
		ctx.clearRect(0, 0, w, w)
		ctx.fillText(char, w / 2, w / 2)
		const data = ctx.getImageData(0, 0, w, w).data
		let ink = 0
		for (let i=3; i<data.length; i+=4) ink += data[i]
		return { char, ink }
	})

	// Stable: chars with the same coverage keep their order
	list.sort(ascending ? (a, b) => a.ink - b.ink : (a, b) => b.ink - a.ink)
	return list.map(e => e.char).join('')
}
