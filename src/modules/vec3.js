// vec3.js: 3D vector functions, GLSL style

// A single argument fills all the components, as in GLSL: vec3(1)
export function vec3(x, y = x, z = x) {
	return { x, y, z }
}

export function copy(a, out = vec3(0)) {
	out.x = a.x
	out.y = a.y
	out.z = a.z
	return out
}

// -- Component-wise, b can be a number ---------------------------------------

export function add(a, b, out = vec3(0)) {
	if (typeof b == 'number') {
		out.x = a.x + b
		out.y = a.y + b
		out.z = a.z + b
	} else {
		out.x = a.x + b.x
		out.y = a.y + b.y
		out.z = a.z + b.z
	}
	return out
}

export function sub(a, b, out = vec3(0)) {
	if (typeof b == 'number') {
		out.x = a.x - b
		out.y = a.y - b
		out.z = a.z - b
	} else {
		out.x = a.x - b.x
		out.y = a.y - b.y
		out.z = a.z - b.z
	}
	return out
}

export function mul(a, b, out = vec3(0)) {
	if (typeof b == 'number') {
		out.x = a.x * b
		out.y = a.y * b
		out.z = a.z * b
	} else {
		out.x = a.x * b.x
		out.y = a.y * b.y
		out.z = a.z * b.z
	}
	return out
}

export function div(a, b, out = vec3(0)) {
	if (typeof b == 'number') {
		out.x = a.x / b
		out.y = a.y / b
		out.z = a.z / b
	} else {
		out.x = a.x / b.x
		out.y = a.y / b.y
		out.z = a.z / b.z
	}
	return out
}

export function min(a, b, out = vec3(0)) {
	if (typeof b == 'number') {
		out.x = Math.min(a.x, b)
		out.y = Math.min(a.y, b)
		out.z = Math.min(a.z, b)
	} else {
		out.x = Math.min(a.x, b.x)
		out.y = Math.min(a.y, b.y)
		out.z = Math.min(a.z, b.z)
	}
	return out
}

export function max(a, b, out = vec3(0)) {
	if (typeof b == 'number') {
		out.x = Math.max(a.x, b)
		out.y = Math.max(a.y, b)
		out.z = Math.max(a.z, b)
	} else {
		out.x = Math.max(a.x, b.x)
		out.y = Math.max(a.y, b.y)
		out.z = Math.max(a.z, b.z)
	}
	return out
}

// Floored modulo, as GLSL
export function mod(a, b, out = vec3(0)) {
	if (typeof b == 'number') {
		out.x = a.x - b * Math.floor(a.x / b)
		out.y = a.y - b * Math.floor(a.y / b)
		out.z = a.z - b * Math.floor(a.z / b)
	} else {
		out.x = a.x - b.x * Math.floor(a.x / b.x)
		out.y = a.y - b.y * Math.floor(a.y / b.y)
		out.z = a.z - b.z * Math.floor(a.z / b.z)
	}
	return out
}


// GLSL step: edge can be a number
export function step(edge, x, out = vec3(0)) {
	out.x = x.x < (typeof edge == 'number' ? edge : edge.x) ? 0 : 1
	out.y = x.y < (typeof edge == 'number' ? edge : edge.y) ? 0 : 1
	out.z = x.z < (typeof edge == 'number' ? edge : edge.z) ? 0 : 1
	return out
}

export function clamp(a, lo, hi, out = vec3(0)) {
	out.x = Math.min(Math.max(a.x, typeof lo == 'number' ? lo : lo.x), typeof hi == 'number' ? hi : hi.x)
	out.y = Math.min(Math.max(a.y, typeof lo == 'number' ? lo : lo.y), typeof hi == 'number' ? hi : hi.y)
	out.z = Math.min(Math.max(a.z, typeof lo == 'number' ? lo : lo.z), typeof hi == 'number' ? hi : hi.z)
	return out
}

// t can be a number or a vector
export function mix(a, b, t, out = vec3(0)) {
	out.x = a.x + (b.x - a.x) * (typeof t == 'number' ? t : t.x)
	out.y = a.y + (b.y - a.y) * (typeof t == 'number' ? t : t.y)
	out.z = a.z + (b.z - a.z) * (typeof t == 'number' ? t : t.z)
	return out
}

export function neg(a, out = vec3(0)) {
	out.x = -a.x
	out.y = -a.y
	out.z = -a.z
	return out
}

export function abs(a, out = vec3(0)) {
	out.x = Math.abs(a.x)
	out.y = Math.abs(a.y)
	out.z = Math.abs(a.z)
	return out
}

export function sign(a, out = vec3(0)) {
	out.x = Math.sign(a.x)
	out.y = Math.sign(a.y)
	out.z = Math.sign(a.z)
	return out
}

export function floor(a, out = vec3(0)) {
	out.x = Math.floor(a.x)
	out.y = Math.floor(a.y)
	out.z = Math.floor(a.z)
	return out
}

export function ceil(a, out = vec3(0)) {
	out.x = Math.ceil(a.x)
	out.y = Math.ceil(a.y)
	out.z = Math.ceil(a.z)
	return out
}

export function round(a, out = vec3(0)) {
	out.x = Math.round(a.x)
	out.y = Math.round(a.y)
	out.z = Math.round(a.z)
	return out
}

export function fract(a, out = vec3(0)) {
	out.x = a.x - Math.floor(a.x)
	out.y = a.y - Math.floor(a.y)
	out.z = a.z - Math.floor(a.z)
	return out
}

// -- Geometry ----------------------------------------------------------------

export function dot(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z
}

export function length(a) {
	return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
}

export function lengthSq(a) {
	return a.x * a.x + a.y * a.y + a.z * a.z
}

export function distance(a, b) {
	return Math.sqrt(distSq(a, b))
}

export function distSq(a, b) {
	const dx = a.x - b.x
	const dy = a.y - b.y
	const dz = a.z - b.z
	return dx * dx + dy * dy + dz * dz
}

// A zero vector stays zero
export function normalize(a, out = vec3(0)) {
	const l = length(a)
	const k = l > 0 ? 1 / l : 0
	out.x = a.x * k
	out.y = a.y * k
	out.z = a.z * k
	return out
}

// GLSL reflect: i incident, n normalized normal
export function reflect(i, n, out = vec3(0)) {
	const d = 2 * dot(n, i)
	out.x = i.x - d * n.x
	out.y = i.y - d * n.y
	out.z = i.z - d * n.z
	return out
}

export function cross(a, b, out = vec3(0)) {
	const x = a.y * b.z - a.z * b.y
	const y = a.z * b.x - a.x * b.z
	out.z = a.x * b.y - a.y * b.x
	out.x = x
	out.y = y
	return out
}

export function rotX(a, ang, out = vec3(0)) {
	const s = Math.sin(ang)
	const c = Math.cos(ang)
	const y = a.y * c - a.z * s
	out.z = a.y * s + a.z * c
	out.y = y
	out.x = a.x
	return out
}

export function rotY(a, ang, out = vec3(0)) {
	const s = Math.sin(ang)
	const c = Math.cos(ang)
	const z = a.z * c - a.x * s
	out.x = a.z * s + a.x * c
	out.z = z
	out.y = a.y
	return out
}

export function rotZ(a, ang, out = vec3(0)) {
	const s = Math.sin(ang)
	const c = Math.cos(ang)
	const x = a.x * c - a.y * s
	out.y = a.x * s + a.y * c
	out.x = x
	out.z = a.z
	return out
}
