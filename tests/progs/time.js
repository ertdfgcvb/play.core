export function main({ x, y }, { time, cols }) {
	const s = String(floor(time))
	return s[(x + y * cols) % s.length]
}

const { floor } = Math
