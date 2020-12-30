/**
@module   string.js
@desc     String helpers
@category internal

Wraps a string to a specific width.
Doesn’t break words and keeps trailing line breaks.
Counts lines and maxWidth (can be greater than width).
If no width is passed the function just measures the 'box' of the text.
*/

export function wrap(string, width=0) {

	if (width==0) return measure(string)

	const paragraphs = string.split('\n')
	let out = ''

	let maxWidth = 0
	let numLines = 0

	for (const p of paragraphs) {
		const chunks = p.split(' ')
		let len = 0
		for(const word of chunks) {
			// First word
			if (len == 0) {
				out += word
				len = word.length
				maxWidth = Math.max(maxWidth, len)
			}
			// Subsequent words
			else {
				if (len + 1 + word.length <= width) {
					out += ' ' + word
					len += word.length + 1
					maxWidth = Math.max(maxWidth, len)
				} else {
					// Remove last space
					out += '\n' + word
					len = word.length + 1
					numLines++
				}
			}
		}
		out += '\n'
		numLines++
	}

	// Remove last \n
	out = out.slice(0, -1)

	// Adjust line count in case of last trailing \n
	if (out.charAt(out.length-1) == '\n') numLines--

	return {
		text : out,
		numLines,
		maxWidth
	}
}

export function measure(string) {
	let numLines = 0
	let maxWidth = 0
	let len = 0

	for (let i=0; i<string.length; i++) {
		const char = string[i]
		if (char == '\n') {
			len = 0
			numLines++
		} else {
			len++
			maxWidth = Math.max(maxWidth, len)
		}
	}
	return {
		text : string,
		numLines,
		maxWidth
	}
}
