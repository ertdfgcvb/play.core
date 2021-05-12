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
	if (x < 0 || x >= targetCols) return {}
	if (y < 0 || y >= targetRows) return {}
	const i = x + y * targetCols
	return target[i]
}

// Safe set and merge functions for a generic buffer object.
// A buffer object contains at least a 'state' array
// and a 'width' and a 'height' field to allow easy setting.
// The value to be set is a single character or a 'cell' object like:
// { char, color, backgroundColor, fontWeight }
// which can overwrite the buffer (set) or partially merged (merge)
export function set(val, x, y, target, targetCols, targetRows) {
	if (x < 0 || x >= targetCols) return
	if (y < 0 || y >= targetRows) return
	const i = x + y * targetCols
	target[i] = val
}

export function merge(val, x, y, target, targetCols, targetRows) {
	if (x < 0 || x >= targetCols) return
	if (y < 0 || y >= targetRows) return
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
// 		fontWeight : '400',
// 		backgroundColor : 'black',
//      etc...
//	}
// or just as a string into the target buffer.
export function mergeText(textObj, x, y, target, targetCols, targetRows) {
	let text, mergeObj
	// An object has been passed as argument, expect a 'text' field
	if (typeof textObj == "object") {
		text = textObj.text
		// Extract all the fields to be merged...
		mergeObj = {...textObj}
		// ...but emove text field
		delete mergeObj.text
	}
	// A string has been passed as argument
	else {
		text = textObj
	}

	let col = x
	let row = y
	// Hackish and inefficient way to retain info of the first and last
	// character of each line merged into the matrix.
	// Can be useful to wrap with markup.
	const wrapInfo = []

	text.split('\n').forEach((line, lineNum) => {
		line.split('').forEach((char, charNum) => {
			col = x + charNum
			merge({char, ...mergeObj}, col, row, target, targetCols, targetRows)
		})
		const first = get(x, row, target, targetCols, targetRows)
		const last = get(x+line.length-1, row, target, targetCols, targetRows)
		wrapInfo.push({first, last})
		row++
	})

	// Adjust for last ++
	row = Math.max(y, row-1)

	// Returns some info about the inserted text:
	// - the coordinates (offset) of the last inserted character
	// - the first an last chars of each line (wrapInfo)
	return {
		offset : {col, row},
		// first  : wrapInfo[0].first,
		// last   : wrapInfo[wrapInfo.length-1].last,
		wrapInfo
	}
}
