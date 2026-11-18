export function createCell(settings) {
	return {
		char            : ' ',
		color           : settings.color,
		backgroundColor : settings.backgroundColor,
		fontWeight      : settings.fontWeight,
	}
}

// The cells of a frame: writes are merged into the cell objects, which are never replaced.
// A value is a char (string, number) or a partial cell { char, color, ... }
export class Buffer {
	constructor(w, h, settings) {
		this.settings = settings
		this.resize(w, h)
	}

	resize(w, h) {
		this.width  = Math.max(0, w) || 0
		this.height = Math.max(0, h) || 0
		this.data   = new Array(this.width * this.height)
		for (let i=0; i<this.data.length; i++) this.data[i] = createCell(this.settings)
		return this
	}

	// Fractional coords (cursor) address the cell they fall in
	get(x, y) {
		x = Math.floor(x)
		y = Math.floor(y)
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return null
		return this.data[x + y * this.width]
	}

	set(x, y, value) {
		x = Math.floor(x)
		y = Math.floor(y)
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
		this.merge(this.data[x + y * this.width], value)
	}

	fill(fn) {
		let idx = 0
		for (let j=0; j<this.height; j++) {
			for (let i=0; i<this.width; i++) {
				this.merge(this.data[idx], fn(i, j, idx))
				idx++
			}
		}
		return this
	}

	fillRect(x, y, w, h, value) {
		for (let j=y; j<y+h; j++) {
			for (let i=x; i<x+w; i++) {
				this.set(i, j, value)
			}
		}
		return this
	}

	merge(cell, value) {
		if (value === undefined || value === null || value === '') return
		if (typeof value == 'object') {
			Object.assign(cell, value)
			if (typeof cell.char != 'string') cell.char = cell.char == null ? ' ' : String(cell.char)
			if (cell.char === '') cell.char = ' '
		} else {
			cell.char = String(value)
		}
	}

	clear() {
		const s = this.settings
		for (const c of this.data) {
			c.char            = ' '
			c.color           = s.color
			c.backgroundColor = s.backgroundColor
			c.fontWeight      = s.fontWeight
		}
		return this
	}
}
