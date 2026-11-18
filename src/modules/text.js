// text.js: String tools: dedent, measure, wrap, align, truncate

// Removes the first and last empty lines and the common indentation:
// art can be written as an indented template literal
export function dedent(str) {
	const lines = str.split('\n')
	if (lines.length > 1 && lines[0].trim() == '') lines.shift()
	if (lines.length > 1 && lines[lines.length - 1].trim() == '') lines.pop()
	let indent = Infinity
	for (const l of lines) {
		if (l.trim() == '') continue
		indent = Math.min(indent, l.match(/^[ \t]*/)[0].length)
	}
	if (indent == Infinity) indent = 0
	return lines.map(l => l.slice(indent)).join('\n')
}

export function measure(str) {
	const lines = str.split('\n')
	let width = 0
	for (const l of lines) width = Math.max(width, length(l))
	return { width, height : lines.length }
}

// In code points: '█', '╳' or an emoji count as one cell
export function length(str) {
	let n = 0
	for (const c of str) n++
	return n
}

// Wraps to width, at spaces; words longer than width are kept whole
export function wrap(str, width) {
	const out = []
	for (const p of str.split('\n')) {
		let line = ''
		let len = 0
		for (const word of p.split(' ')) {
			const wl = length(word)
			if (len == 0) {
				line = word
				len = wl
			} else if (len + 1 + wl <= width) {
				line += ' ' + word
				len += 1 + wl
			} else {
				out.push(line)
				line = word
				len = wl
			}
		}
		out.push(line)
	}
	return out.join('\n')
}

// Pads a line to width: 'left', 'center' or 'right'
export function align(str, width, mode = 'left') {
	const space = width - length(str)
	if (space <= 0) return str
	if (mode == 'right') return ' '.repeat(space) + str
	if (mode == 'center') {
		const l = Math.floor(space / 2)
		return ' '.repeat(l) + str + ' '.repeat(space - l)
	}
	return str + ' '.repeat(space)
}

export function truncate(str, width, ellipsis = '…') {
	const chars = [...str]
	if (chars.length <= width) return str
	const e = length(ellipsis)
	return chars.slice(0, Math.max(0, width - e)).join('') + ellipsis
}
