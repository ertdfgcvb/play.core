let clicks = 0

export function main({ x, y }, { cursor }) {
	const cx = Math.floor(cursor.x)
	const cy = Math.floor(cursor.y)
	if (x == cx && y == cy) return '┼'
	if (x == cx) return '│'
	if (y == cy) return '─'
	return (x + y) % 2 ? '·' : ' '
}

export function pointerDown() {
	clicks++
}

export function post({ buffer, frame, fps, cols, rows }) {
	const s = ' frame ' + frame + ' fps ' + Math.round(fps) + ' ' + cols + 'x' + rows + ' clicks ' + clicks + ' '
	for (let i=0; i<s.length; i++) buffer.set(i + 1, 1, { char : s[i], color : 'white', backgroundColor : 'royalblue' })
}
