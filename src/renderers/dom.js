import { useElement, applyStyle, loadFont, fontInfo, watchElement, escapeHTML } from '../core/style.js'
import { cellDefaults, measureFont, drawCells } from './canvas.js'

export default async function dom(target, settings) {
	const { element, created } = useElement(target, 'pre')
	applyStyle(element, settings)
	await loadFont(element)
	element.textContent = ''

	const rowElements = []
	// The HTML of each row in the previous frame: a row is written only when it changes
	let prevRows = []
	let cols = 0
	let rows = 0
	let metrics = null
	const watch = watchElement(element, () => metrics = null)

	// The average pitch of a block of text: what the layout actually produces,
	// fractions and rounding included (the computed line-height is not reliable)
	function measureCell() {
		const N = 100
		const L = 10
		const span = document.createElement('span')
		span.style.cssText = 'display:inline-block;white-space:pre;position:absolute;visibility:hidden'
		span.textContent = ('X'.repeat(N) + '\n').repeat(L - 1) + 'X'.repeat(N)
		element.appendChild(span)
		const r = span.getBoundingClientRect()
		element.removeChild(span)
		const f = fontInfo(element)
		return Object.freeze({
			cellWidth  : r.width / N,
			lineHeight : r.height / L,
			aspect     : (r.width / N) / (r.height / L),
			fontFamily : f.fontFamily,
			fontSize   : f.fontSize,
		})
	}

	let pw = -1
	let ph = -1

	function measure() {
		const { width, height } = watch.size
		// A resize can come with a font size change (media queries)
		if (!metrics || width != pw || height != ph) {
			pw = width
			ph = height
			metrics = measureCell()
		}
		return {
			cols    : settings.cols || Math.floor(width / metrics.cellWidth),
			rows    : settings.rows || Math.floor(height / metrics.lineHeight),
			width,
			height,
			metrics,
		}
	}

	function render(context, buffer) {
		const { width : c, height : r, data } = buffer

		if (c != cols || r != rows) {
			cols = c
			rows = r
			// Empty: every row is written on the next pass
			prevRows = []
		}

		while (rowElements.length < r) {
			const span = document.createElement('span')
			span.style.display = 'block'
			element.appendChild(span)
			rowElements.push(span)
		}
		while (rowElements.length > r) rowElements.pop().remove()

		for (let j=0; j<r; j++) {
			const html = rowHTML(data, j * c, c, settings)
			if (html !== prevRows[j]) {
				prevRows[j] = html
				rowElements[j].innerHTML = html
			}
		}
	}

	function snapshotHTML(buffer) {
		const f = fontInfo(element)
		let body = ''
		for (let j=0; j<buffer.height; j++) body += rowHTML(buffer.data, j * buffer.width, buffer.width, settings) + '\n'
		const css = 'pre{margin:0;'
			+ 'font-family:' + f.fontFamily + ';'
			+ 'font-size:' + f.fontSize + 'px;'
			+ 'line-height:' + metrics.lineHeight + 'px;'
			+ 'font-weight:' + f.fontWeight + ';'
			+ 'color:' + f.color + ';'
			+ 'background-color:' + f.backgroundColor + '}'
		const html = '<!DOCTYPE html>\n<meta charset="utf-8">\n<style>' + css + '</style>\n<pre>' + body + '</pre>\n'
		return new Blob([html], { type : 'text/html;charset=utf-8' })
	}

	function snapshotPNG(buffer) {
		const f = fontInfo(element)
		const dpr = globalThis.devicePixelRatio || 1
		const canvas = document.createElement('canvas')
		const c2d = canvas.getContext('2d')
		const m = measureFont(c2d, f)
		const d = cellDefaults(f, settings)
		// Opaque PNG: the element background, white if transparent
		d.backgroundColor = d.backgroundColor || (f.backgroundColor == 'rgba(0, 0, 0, 0)' ? 'white' : f.backgroundColor)
		canvas.width = Math.ceil(buffer.width * m.cellWidth * dpr)
		canvas.height = Math.ceil(buffer.height * m.lineHeight * dpr)
		drawCells(c2d, buffer, m, d, dpr)
		return new Promise(resolve => canvas.toBlob(resolve))
	}

	return {
		element,
		measure,
		render,
		snapshot(format, context, buffer) {
			if (format == 'html') return snapshotHTML(buffer)
			if (format == 'png') return snapshotPNG(buffer)
			return null
		},
		dispose() {
			watch.dispose()
			if (created) element.remove()
		},
	}
}

// Spans only where the style differs from the element defaults
function rowHTML(data, offs, cols, s) {
	let html = ''
	let open = false
	let pc, pb, pw
	for (let i=0; i<cols; i++) {
		const cell = data[offs + i]
		if (i == 0 || cell.color !== pc || cell.backgroundColor !== pb || cell.fontWeight !== pw) {
			pc = cell.color
			pb = cell.backgroundColor
			pw = cell.fontWeight
			if (open) html += '</span>'
			let css = ''
			if (pc && pc !== s.color) css += 'color:' + pc + ';'
			if (pb && pb !== s.backgroundColor) css += 'background:' + pb + ';'
			if (pw && pw !== s.fontWeight) css += 'font-weight:' + pw + ';'
			open = css != ''
			if (open) html += '<span style="' + css + '">'
		}
		html += escapeHTML(cell.char)
	}
	if (open) html += '</span>'
	return html
}
