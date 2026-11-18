import { Grid2 } from './grid.js'

export function createCell(settings) {
	return {
		char            : ' ',
		color           : settings.color,
		backgroundColor : settings.backgroundColor,
		fontWeight      : settings.fontWeight,
	}
}

// A Grid2 of cells: writes are merged into the cell objects, which are never replaced.
// A value is a char (string, number) or a partial cell { char, color, ... }
export class Buffer extends Grid2 {
	constructor(w, h, settings) {
		super(0, 0)
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

	set(x, y, value) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return
		this.merge(this.data[x + y * this.width], value)
	}

	fill(fn) {
		let idx = 0
		for (let j=0; j<this.height; j++) {
			for (let i=0; i<this.width; i++) {
				this.merge(this.data[idx], fn(i, j, idx, this.width, this.height))
				idx++
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
	}
}
