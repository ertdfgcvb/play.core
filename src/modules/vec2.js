// A single argument fills all the components, as in GLSL: vec2(1)
export function vec2(x, y = x) {
	return { x, y }
}

export function copy(a, out = vec2(0)) {
	out.x = a.x
	out.y = a.y
	return out
}

// -- Component-wise, b can be a number ---------------------------------------

export function add(a, b, out = vec2(0)) {
	if (typeof b == 'number') {
		out.x = a.x + b
		out.y = a.y + b
	} else {
		out.x = a.x + b.x
		out.y = a.y + b.y
	}
	return out
}

export function sub(a, b, out = vec2(0)) {
	if (typeof b == 'number') {
		out.x = a.x - b
		out.y = a.y - b
	} else {
		out.x = a.x - b.x
		out.y = a.y - b.y
	}
	return out
}

export function mul(a, b, out = vec2(0)) {
	if (typeof b == 'number') {
		out.x = a.x * b
		out.y = a.y * b
	} else {
		out.x = a.x * b.x
		out.y = a.y * b.y
	}
	return out
}

export function div(a, b, out = vec2(0)) {
	if (typeof b == 'number') {
		out.x = a.x / b
		out.y = a.y / b
	} else {
		out.x = a.x / b.x
		out.y = a.y / b.y
	}
	return out
}

export function min(a, b, out = vec2(0)) {
	if (typeof b == 'number') {
		out.x = Math.min(a.x, b)
		out.y = Math.min(a.y, b)
	} else {
		out.x = Math.min(a.x, b.x)
		out.y = Math.min(a.y, b.y)
	}
	return out
}

export function max(a, b, out = vec2(0)) {
	if (typeof b == 'number') {
		out.x = Math.max(a.x, b)
		out.y = Math.max(a.y, b)
	} else {
		out.x = Math.max(a.x, b.x)
		out.y = Math.max(a.y, b.y)
	}
	return out
}

// Floored modulo, as GLSL
export function mod(a, b, out = vec2(0)) {
	if (typeof b == 'number') {
		out.x = a.x - b * Math.floor(a.x / b)
		out.y = a.y - b * Math.floor(a.y / b)
	} else {
		out.x = a.x - b.x * Math.floor(a.x / b.x)
		out.y = a.y - b.y * Math.floor(a.y / b.y)
	}
	return out
}


// GLSL step: edge can be a number
export function step(edge, x, out = vec2(0)) {
	out.x = x.x < (typeof edge == 'number' ? edge : edge.x) ? 0 : 1
	out.y = x.y < (typeof edge == 'number' ? edge : edge.y) ? 0 : 1
	return out
}

export function clamp(a, lo, hi, out = vec2(0)) {
	out.x = Math.min(Math.max(a.x, typeof lo == 'number' ? lo : lo.x), typeof hi == 'number' ? hi : hi.x)
	out.y = Math.min(Math.max(a.y, typeof lo == 'number' ? lo : lo.y), typeof hi == 'number' ? hi : hi.y)
	return out
}

// t can be a number or a vector
export function mix(a, b, t, out = vec2(0)) {
	out.x = a.x + (b.x - a.x) * (typeof t == 'number' ? t : t.x)
	out.y = a.y + (b.y - a.y) * (typeof t == 'number' ? t : t.y)
	return out
}

export function neg(a, out = vec2(0)) {
	out.x = -a.x
	out.y = -a.y
	return out
}

export function abs(a, out = vec2(0)) {
	out.x = Math.abs(a.x)
	out.y = Math.abs(a.y)
	return out
}

export function sign(a, out = vec2(0)) {
	out.x = Math.sign(a.x)
	out.y = Math.sign(a.y)
	return out
}

export function floor(a, out = vec2(0)) {
	out.x = Math.floor(a.x)
	out.y = Math.floor(a.y)
	return out
}

export function ceil(a, out = vec2(0)) {
	out.x = Math.ceil(a.x)
	out.y = Math.ceil(a.y)
	return out
}

export function round(a, out = vec2(0)) {
	out.x = Math.round(a.x)
	out.y = Math.round(a.y)
	return out
}

export function fract(a, out = vec2(0)) {
	out.x = a.x - Math.floor(a.x)
	out.y = a.y - Math.floor(a.y)
	return out
}

// -- Geometry ----------------------------------------------------------------

export function dot(a, b) {
	return a.x * b.x + a.y * b.y
}

export function length(a) {
	return Math.sqrt(a.x * a.x + a.y * a.y)
}

export function lengthSq(a) {
	return a.x * a.x + a.y * a.y
}

export function distance(a, b) {
	return Math.sqrt(distSq(a, b))
}

export function distSq(a, b) {
	const dx = a.x - b.x
	const dy = a.y - b.y
	return dx * dx + dy * dy
}

// A zero vector stays zero
export function normalize(a, out = vec2(0)) {
	const l = length(a)
	const k = l > 0 ? 1 / l : 0
	out.x = a.x * k
	out.y = a.y * k
	return out
}

// GLSL reflect: i incident, n normalized normal
export function reflect(i, n, out = vec2(0)) {
	const d = 2 * dot(n, i)
	out.x = i.x - d * n.x
	out.y = i.y - d * n.y
	return out
}

export function rot(a, ang, out = vec2(0)) {
	const s = Math.sin(ang)
	const c = Math.cos(ang)
	const x = a.x * c - a.y * s
	out.y = a.x * s + a.y * c
	out.x = x
	return out
}
