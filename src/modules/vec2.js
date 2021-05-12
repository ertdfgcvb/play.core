/**
@module   vec2.js
@desc     2D vector helper functions
@category public

- No vector class (a 'vector' is just any object with {x, y})
- The functions never modify the original object.
- An optional destination object can be passed as last paremeter to all
  the functions (except vec2()).
- All function can be exported individually or grouped via default export.
- For the default export use:
	import * as Vec2 from '/src/modules/vec2.js'
*/

// Creates a vector
export function vec2(x, y) {
	return {x, y}
}

// Copies a vector
export function copy(a, out) {
	out = out || vec2(0, 0)

	out.x = a.x
	out.y = a.y

	return out
}

// Adds two vectors
export function add(a, b, out) {
	out = out || vec2(0, 0)

	out.x = a.x + b.x
	out.y = a.y + b.y

	return out
}

// Subtracts two vectors
export function sub(a, b, out) {
	out = out || vec2(0, 0)

	out.x = a.x - b.x
	out.y = a.y - b.y

	return out
}

// Multiplies a vector by another vector (component-wise)
export function mul(a, b, out) {
	out = out || vec2(0, 0)

	out.x = a.x * b.x
	out.y = a.y * b.y

	return out
}

// Divides a vector by another vector (component-wise)
export function div(a, b, out) {
	out = out || vec2(0, 0)

	out.x = a.x / b.x
	out.y = a.y / b.y

	return out
}

// Adds a scalar to a vector
export function addN(a, k, out) {
	out = out || vec2(0, 0)

	out.x = a.x + k
	out.y = a.y + k

	return out
}

// Subtracts a scalar from a vector
export function subN(a, k, out) {
	out = out || vec2(0, 0)

	out.x = a.x - k
	out.y = a.y - k

	return out
}

// Mutiplies a vector by a scalar
export function mulN(a, k, out) {
	out = out || vec2(0, 0)

	out.x = a.x * k
	out.y = a.y * k

	return out
}

// Divides a vector by a scalar
export function divN(a, k, out) {
	out = out || vec2(0, 0)

	out.x = a.x / k
	out.y = a.y / k

	return out
}

// Computes the dot product of two vectors
export function dot(a, b) {
	return a.x * b.x + a.y * b.y
}

// Computes the length of vector
export function length(a) {
	return Math.sqrt(a.x * a.x + a.y * a.y)
}

// Computes the square of the length of vector
export function lengthSq(a) {
	return a.x * a.x + a.y * a.y
}

// Computes the distance between 2 points
export function dist(a, b) {
	const dx = a.x - b.x
	const dy = a.y - b.y

	return Math.sqrt(dx * dx + dy * dy)
}

// Computes the square of the distance between 2 points
export function distSq(a, b) {
	const dx = a.x - b.x
	const dy = a.y - b.y

	return dx * dx + dy * dy
}

// Divides a vector by its Euclidean length and returns the quotient
export function norm(a, out) {
	out = out || vec2(0, 0)

	const l = length(a)
	if (l > 0.00001) {
		out.x = a.x / l
		out.y = a.y / l
	} else {
		out.x = 0
		out.y = 0
	}

	return out
}

// Negates a vector
export function neg(v, out) {
	out = out || vec2(0, 0)

	out.x = -a.x
	out.y = -a.y

	return out
}

// Rotates a vector
export function rot(a, ang, out) {
	out = out || vec2(0, 0)

	const s = Math.sin(ang)
	const c = Math.cos(ang)

	out.x = a.x * c - a.y * s,
	out.y = a.x * s + a.y * c

	return out
}

// Performs linear interpolation on two vectors
export function mix(a, b, t, out) {
	out = out || vec2(0, 0)

	out.x = (1 - t) * a.x + t * b.x
	out.y = (1 - t) * a.y + t * b.y

	return out
}

// Computes the abs of a vector (component-wise)
 export function abs(a, out) {
	out = out || vec2(0, 0)

	out.x = Math.abs(a.x)
	out.y = Math.abs(a.y)

	return out
}

// Computes the max of two vectors (component-wise)
export function max(a, b, out) {
	out = out || vec2(0, 0)

	out.x = Math.max(a.x, b.x)
	out.y = Math.max(a.y, b.y)

	return out
}

// Computes the min of two vectors (component-wise)
export function min(a, b, out) {
	out = out || vec2(0, 0)

	out.x = Math.min(a.x, b.x)
	out.y = Math.min(a.y, b.y)

	return out
}

// Returns the fractional part of the vector (component-wise)
export function fract(a, out) {
	out = out || vec2(0, 0)
	out.x = a.x - Math.floor(a.x)
	out.y = a.y - Math.floor(a.y)
	return out
}

// Returns the floored vector (component-wise)
export function floor(a, out) {
	out = out || vec2(0, 0)
	out.x = Math.floor(a.x)
	out.y = Math.floor(a.y)
	return out
}

// Returns the ceiled vector (component-wise)
export function ceil(a, out) {
	out = out || vec2(0, 0)
	out.x = Math.ceil(a.x)
	out.y = Math.ceil(a.y)
	return out
}

// Returns the rounded vector (component-wise)
export function round(a, out) {
	out = out || vec2(0, 0)
	out.x = Math.round(a.x)
	out.y = Math.round(a.y)
	return out
}


