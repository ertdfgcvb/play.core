let downs = 0

export function main(coord, { frame, cols, rows, cursor }) {
	if (coord.x == Math.floor(cursor.x) && coord.y == Math.floor(cursor.y)) return '+'
	if (coord.index == 0) return frame % 10
	if (coord.index == 1) return downs
	return coord.x == cols - 1 || coord.y == rows - 1 ? '#' : ':'
}

export function pointerDown() {
	downs++
}
