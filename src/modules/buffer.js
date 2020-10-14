/**
@module    buffer.js
@desc      Safe buffer helpers, mostly for internal use
@cathegory internal

Safe set() and get() functions, rect() and text() ‘drawing’ helpers.

Buffers are 1D arrays for 2D data so at least a ‘width’ parameter
has to be known to correctly access the array.

Data is written or read from the default ‘buffers.state’ array
but an optional ‘target’ can be passed.
Read some value from the user-data buffer:

const v = get(10, 10, buffers, bufers.data)

(width and height are still obtained from the ‘buffers’ object)

NOTE: set() is slightly faster than merge() as no testing is done,
the value is just written directly into the buffer.
*/

// Safe get function to read from a buffer
export function get(x, y, buffers, target) {
	target = target || buffers.state
	if (x < 0 || x >= buffers.cols) return
	if (y < 0 || y >= buffers.rows) return
	const i = x + y * buffers.cols
	return target[i]
}

// Safe set and merge functions for a generic buffer object.
// A buffer object contains at least a 'state' array
// and a 'width' and a 'height' field to allow easy setting.
// The value to be set is a single character or a 'cell' object like:
// { char, color, background, weight }
// which can overwrite the buffer (set) or partially merged (merge)
export function set(val, x, y, buffers, target) {
	target = target || buffers.state
	if (x < 0 || x >= buffers.cols) return
	if (y < 0 || y >= buffers.rows) return
	const i = x + y * buffers.cols
	target[i] = val
}

export function merge(val, x, y, buffers, target) {
	target = target || buffers.state
	if (x < 0 || x >= buffers.cols) return
	if (y < 0 || y >= buffers.rows) return
	const i = x + y * buffers.cols

	// Flatten:
	const cell = typeof target[i] == 'object' ? target[i] : { char : target[i] }

	target[i] = { ...cell, ...val }
}

export function setRect(val, x, y, w, h, buffers, target) {
	for (let j=y; j<y+h; j++ ) {
		for (let i=x; i<x+w; i++ ) {
			set(val, i, j, buffers, target)
		}
	}
}

export function mergeRect(val, x, y, w, h, buffers, target) {
	target = target || buffers.state
	for (let j=y; j<y+h; j++ ) {
		for (let i=x; i<x+w; i++ ) {
			merge(val, i, j, buffers, target)
		}
	}
}

export function mergeText(txt, x, y, buffers, target) {
	let col = x
	let row = y
	txt.split('\n').forEach((line, lineNum) => {
		line.split('').forEach((char, charNum) => {
			col = x + charNum
			merge({char}, col, row, buffers, target)
		})
		row++
	})

	// Adjust for last ++
	row = Math.max(y, row-1)

	// Returns some info about the inserted text:
	// - the coordinates (offset) of the last inserted character
	// - the first an last chars
	return {
		offset : {col, row},
		first  : get(x, y, buffers),
		last   : get(col, row, buffers)
	}
}

