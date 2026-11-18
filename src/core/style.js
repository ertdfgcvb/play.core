const CSS = [
	'backgroundColor',
	'color',
	'fontFamily',
	'fontSize',
	'fontWeight',
	'letterSpacing',
	'lineHeight',
	'textAlign',
]

// Returns the target element or a new one appended to the body
export function useElement(element, nodeName) {
	if (element) return { element, created : false }
	const el = document.createElement(nodeName)
	// Without a size there would be no rows
	el.style.cssText = 'display:block;margin:0;width:100%;height:100vh'
	document.body.appendChild(el)
	return { element : el, created : true }
}

export function applyStyle(el, settings) {
	for (const k of CSS) {
		if (settings[k] !== undefined && settings[k] !== null && settings[k] !== '') el.style[k] = settings[k]
	}
	// Runs of text must stay on the grid
	el.style.fontKerning = 'none'
	el.style.fontVariantLigatures = 'none'
	if (!settings.allowSelect) {
		el.style.userSelect = 'none'
		el.style.webkitUserSelect = 'none'
	}
}

export function fontInfo(el) {
	const s = getComputedStyle(el)
	const fontSize = parseFloat(s.fontSize)
	return {
		fontFamily      : s.fontFamily,
		fontSize,
		fontWeight      : s.fontWeight,
		fontStyle       : s.fontStyle,
		// 'normal' is font dependent, 1.2 is the usual value
		lineHeight      : parseFloat(s.lineHeight) || fontSize * 1.2,
		color           : s.color,
		backgroundColor : s.backgroundColor,
	}
}

// fonts.ready alone resolves before a face that is not yet used is loaded
export async function loadFont(el) {
	if (typeof document == 'undefined' || !document.fonts) return
	const f = fontInfo(el)
	try {
		await document.fonts.load(f.fontStyle + ' ' + f.fontWeight + ' ' + f.fontSize + 'px ' + f.fontFamily)
	} catch (e) {}
	await document.fonts.ready
}

// Size tracking without a forced layout per frame; the first size is read once.
// onFont: fonts that finish loading later change the metrics
export function watchElement(el, onFont) {
	const r = el.getBoundingClientRect()
	const size = { width : r.width, height : r.height }
	const ro = new ResizeObserver(entries => {
		const e = entries[entries.length - 1]
		const b = e.borderBoxSize && e.borderBoxSize[0]
		size.width = b ? b.inlineSize : e.target.getBoundingClientRect().width
		size.height = b ? b.blockSize : e.target.getBoundingClientRect().height
	})
	ro.observe(el)
	const fonts = typeof document != 'undefined' && document.fonts
	if (fonts) fonts.addEventListener('loadingdone', onFont)
	return {
		size,
		dispose() {
			ro.disconnect()
			if (fonts) fonts.removeEventListener('loadingdone', onFont)
		},
	}
}

export function escapeHTML(str) {
	if (str.length == 1) return str == '<' ? '&lt;' : str == '>' ? '&gt;' : str == '&' ? '&amp;' : str
	return str.replace(/[<>&]/g, c => c == '<' ? '&lt;' : c == '>' ? '&gt;' : '&amp;')
}
