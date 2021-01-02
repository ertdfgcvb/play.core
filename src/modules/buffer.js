/**
@module   buffer.js
@desc     Safe buffer helpers, mostly for internal use
@category internal

Safe set() and get() functions, rect() and text() ‘drawing’ helpers.

Buffers are 1D arrays for 2D data, a ‘width’ and a 'height' parameter
have to be known (and passed to the functions) to correctly / safely access
the array.

const v = get(10, 10, buffer, cols, rows)

*/

// Safe get function to read from a buffer
export function get(x, y, target, targetCols, targetRows) {
	if (x < 0 || x >= targetCols) return {}
	if (y < 0 || y >= targetRows) return {}
	const i = x + y * targetCols
	return target[i]
}

// Safe set and merge functions for a generic buffer object.
// A buffer object contains at least a 'state' array
// and a 'width' and a 'height' field to allow easy setting.
// The value to be set is a single character or a 'cell' object like:
// { char, color, background, weight }
// which can overwrite the buffer (set) or partially merged (merge)
export function set(val, x, y, target, targetCols, targetRows) {
	if (x < 0 || x >= targetCols) return
	if (y < 0 || y >= targetRows) return
	const i = x + y * targetCols
	target[i] = val
}

export function merge(val, x, y, target, targetCols, targetRows) {
	if (x < 0 || x >= targetCols) return
	if (y < 0 || y >= targetRows) return
	const i = x + y * targetCols

	// Flatten:
	const cell = typeof target[i] == 'object' ? target[i] : { char : target[i] }

	target[i] = { ...cell, ...val }
}

export function setRect(val, x, y, w, h, target, targetCols, targetRows) {
	for (let j=y; j<y+h; j++ ) {
		for (let i=x; i<x+w; i++ ) {
			set(val, i, j, target, targetCols, targetRows)
		}
	}
}

export function mergeRect(val, x, y, w, h, target, targetCols, targetRows) {
	for (let j=y; j<y+h; j++ ) {
		for (let i=x; i<x+w; i++ ) {
			merge(val, i, j, target, targetCols, targetRows)
		}
	}
}

// Merges a textObj in the form of:
//	{
// 		text : 'abc\ndef',
// 		color : 'red',
// 		weight : '400',
// 		background : 'black'
//	}
// or just as a string into the target buffer.
export function mergeText(textObj, x, y, target, targetCols, targetRows) {
	let col = x
	let row = y

	// if textObj is s a string convert it to an obj
	const text = typeof textObj == "string" ? textObj : textObj.text
	const color = textObj.color
	const background = textObj.background
	const weight = textObj.weight

	text.split('\n').forEach((line, lineNum) => {
		line.split('').forEach((char, charNum) => {
			col = x + charNum
			merge({char, color, background, weight}, col, row, target, targetCols, targetRows)
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
		first  : get(x, y, target, targetCols, targetRows),
		last   : get(col, row, target, targetCols, targetRows)
	}
}
