import { Grid } from './grid.js'
import { dedent } from './text.js'

// A Grid of chars (or cells) from a multiline string, an array of strings
// or a 2D array. Transparent chars are null, as outside the grid:
// grid.get(x, y) ?? fallback works in main()
// transparent: the char that does not overwrite (null: none)
// styles:      { char : { color, backgroundColor, fontWeight } }
export function block(source, { transparent = ' ', styles = null } = {}) {
	const rows = typeof source == 'string'
		? dedent(source).split('\n').map(l => [...l])
		: source.map(r => typeof r == 'string' ? [...r] : r)

	let w = 0
	for (const r of rows) w = Math.max(w, r.length)
	const g = new Grid(w, rows.length)
	g.data.fill(null)

	for (let j=0; j<rows.length; j++) {
		const r = rows[j]
		for (let i=0; i<r.length; i++) {
			let c = r[i]
			if (c === undefined || c === null) continue
			const char = typeof c == 'object' ? c.char : c
			if (char === transparent) continue
			if (styles && typeof c != 'object' && styles[c]) c = { char : c, ...styles[c] }
			g.data[i + j * w] = c
		}
	}
	return g
}

// Writes a Grid (or a string) into the buffer, clipped to its size.
// Strings are drawn opaque, spaces included.
// style: a cell style for all the chars; the chars of a styled block keep their own.
// style.align = 'center': x, y is the center
// Returns the drawn rect { x, y, width, height }
export function write(buffer, source, x = 0, y = 0, style = null) {
	const g = source instanceof Grid ? source : block(String(source), { transparent : null })

	x = Math.round(x)
	y = Math.round(y)
	let cellStyle = null
	if (style) {
		const { align, ...rest } = style
		if (align == 'center') {
			x -= Math.floor(g.width / 2)
			y -= Math.floor(g.height / 2)
		}
		if (Object.keys(rest).length) cellStyle = rest
	}

	const d = g.data
	for (let j=0; j<g.height; j++) {
		for (let i=0; i<g.width; i++) {
			const v = d[i + j * g.width]
			if (v === null || v === undefined) continue
			if (cellStyle) buffer.set(x + i, y + j, cellStyle)
			buffer.set(x + i, y + j, v)
		}
	}
	return { x, y, width : g.width, height : g.height }
}
