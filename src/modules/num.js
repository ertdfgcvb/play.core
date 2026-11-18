// -- GLSL built-ins -----------------------------------------------------------

export function fract(x) {
	return x - Math.floor(x)
}

// Floored modulo: positive for negative x, unlike %
export function mod(x, y) {
	return x - y * Math.floor(x / y)
}

export function clamp(x, min, max) {
	return x < min ? min : x > max ? max : x
}

export function sign(x) {
	return x > 0 ? 1 : x < 0 ? -1 : 0
}

export function mix(a, b, t) {
	return a * (1 - t) + b * t
}

export function step(edge, x) {
	return x < edge ? 0 : 1
}

export function smoothstep(edge0, edge1, x) {
	const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
	return t * t * (3 - 2 * t)
}

export function radians(deg) {
	return deg * Math.PI / 180
}

export function degrees(rad) {
	return rad * 180 / Math.PI
}

export function inversesqrt(x) {
	return 1 / Math.sqrt(x)
}

// GLSL atan: one argument is atan(y_over_x), two arguments are atan2(y, x)
export function atan(y, x) {
	return x === undefined ? Math.atan(y) : Math.atan2(y, x)
}

// -- Not GLSL -----------------------------------------------------------------

export function smootherstep(edge0, edge1, x) {
	const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
	return t * t * t * (t * (t * 6 - 15) + 10)
}

// Maps v from [inA, inB] to [outA, outB]
export function map(v, inA, inB, outA, outB) {
	return outA + (outB - outA) * ((v - inA) / (inB - inA))
}

// map() clamped to [outA, outB]
export function mapClamped(v, inA, inB, outA, outB) {
	const t = clamp((v - inA) / (inB - inA), 0, 1)
	return outA + (outB - outA) * t
}

// Inverse of mix: where v sits between a and b (0..1, not clamped)
export function unmix(a, b, v) {
	return (v - a) / (b - a)
}

// Wraps v into [min, max)
export function wrap(v, min, max) {
	return min + mod(v - min, max - min)
}

// Back and forth between 0 and len
export function pingpong(v, len) {
	return len - Math.abs(mod(v, 2 * len) - len)
}

// Snaps v (0..1) to n levels: 0, 1/(n-1), ..., 1
export function quantize(v, n) {
	return Math.round(v * (n - 1)) / (n - 1)
}

// -- Distances ----------------------------------------------------------------
// Euclidean gives circles, Manhattan diamonds, Chebyshev squares

export function lenEuclidean(x, y) {
	return Math.sqrt(x * x + y * y)
}

export function lenManhattan(x, y) {
	return Math.abs(x) + Math.abs(y)
}

export function lenChebyshev(x, y) {
	return Math.max(Math.abs(x), Math.abs(y))
}

export function distEuclidean(ax, ay, bx, by) {
	return lenEuclidean(bx - ax, by - ay)
}

export function distManhattan(ax, ay, bx, by) {
	return lenManhattan(bx - ax, by - ay)
}

export function distChebyshev(ax, ay, bx, by) {
	return lenChebyshev(bx - ax, by - ay)
}
