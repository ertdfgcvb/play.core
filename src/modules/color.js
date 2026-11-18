// color.js: Color conversions, CSS color parsing, mixing and palette matching

import { CSS_COLORS } from '../core/css_colors.js'

// Colors are { r, g, b (0..255), a (0..1) }, as in CSS
export function rgb(r, g, b, a = 1) {
	return { r, g, b, a }
}

// r, g, b, a to '#rrggbb', or '#rrggbbaa' if not opaque
export function hex(r, g, b, a = 1) {
	return rgb2hex({ r, g, b, a })
}

// r, g, b, a to 'rgb(r,g,b)', or 'rgba(r,g,b,a)' if not opaque
export function css(r, g, b, a = 1) {
	return rgb2css({ r, g, b, a })
}

export function rgb2css(c) {
	if (c.a === undefined || c.a === 1) return 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')'
	return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
}

// Values out of range (computed colors) are clamped
export function rgb2hex(c) {
	const h = v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')
	if (c.a === undefined || c.a === 1) return '#' + h(c.r) + h(c.g) + h(c.b)
	return '#' + h(c.r) + h(c.g) + h(c.b) + h(c.a * 255)
}

// Rec. 709 luma, 0..1 (as Pixels)
export function rgb2gray(c) {
	return (c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722) / 255
}

// 0xff0000 to { r, g, b, a }
export function int2rgb(int) {
	return {
		r : int >> 16 & 0xff,
		g : int >>  8 & 0xff,
		b : int       & 0xff,
		a : 1,
	}
}

// -- Mixing and matching ------------------------------------------------------

// Interpolates two colors, t 0..1 (not clamped)
export function mixColor(a, b, t) {
	const aa = a.a === undefined ? 1 : a.a
	const ba = b.a === undefined ? 1 : b.a
	return {
		r : a.r + (b.r - a.r) * t,
		g : a.g + (b.g - a.g) * t,
		b : a.b + (b.b - a.b) * t,
		a : aa + (ba - aa) * t,
	}
}

// h in degrees, s and l 0..1
export function hsl(h, s, l, a = 1) {
	const [r, g, b] = hsl2rgb(h, s, l)
	return { r, g, b, a }
}

// The closest color of a palette (array or map), by perceived difference
export function nearest(c, palette) {
	const list = Array.isArray(palette) ? palette : Object.values(palette)
	let best = list[0]
	let dist = Infinity
	for (const p of list) {
		const d = redmean(c, p)
		if (d < dist) {
			dist = d
			best = p
		}
	}
	return best
}

// Cheap perceptual distance: https://en.wikipedia.org/wiki/Color_difference
function redmean(a, b) {
	const r = (a.r + b.r) * 0.5
	const dr = a.r - b.r
	const dg = a.g - b.g
	const db = a.b - b.b
	return (2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db
}

// -- Parsing ------------------------------------------------------------------

const parsed = new Map()

// CSS color string to a frozen { r, g, b, a }, null if not valid.
// Names, #rgb[a], #rrggbb[aa], rgb[a](), hsl[a](); cached
export function parseColor(str) {
	if (typeof str != 'string') return null
	let c = parsed.get(str)
	if (c !== undefined) return c
	c = parse(str.trim().toLowerCase())
	c = c ? Object.freeze(c) : null
	// Bounded: programs can generate colors per frame
	if (parsed.size > 4096) parsed.clear()
	parsed.set(str, c)
	return c
}

function parse(s) {
	if (s == 'transparent') return { r : 0, g : 0, b : 0, a : 0 }
	const named = CSS_COLORS[s]
	if (named) return { ...int2rgb(named[0]), a : 1 }

	if (s[0] == '#') {
		const h = s.slice(1)
		if (!/^[0-9a-f]+$/.test(h)) return null
		if (h.length == 3 || h.length == 4) {
			const v = [...h].map(d => parseInt(d + d, 16))
			return { r : v[0], g : v[1], b : v[2], a : h.length == 4 ? v[3] / 255 : 1 }
		}
		if (h.length == 6 || h.length == 8) {
			const v = h.match(/../g).map(d => parseInt(d, 16))
			return { r : v[0], g : v[1], b : v[2], a : h.length == 8 ? v[3] / 255 : 1 }
		}
		return null
	}

	const m = s.match(/^(rgba?|hsla?)\((.*)\)$/)
	if (!m) return null
	// Comma and space syntax: rgb(1, 2, 3, 0.5) or rgb(1 2 3 / 50%)
	const parts = m[2].split(/[\s,\/]+/).filter(Boolean)
	if (parts.length < 3) return null
	const alpha = parts.length > 3 ? unit(parts[3], 1) : 1
	if (m[1][0] == 'r') {
		const [r, g, b] = parts.slice(0, 3).map(p => clamp(unit(p, 255), 0, 255))
		return { r, g, b, a : clamp(alpha, 0, 1) }
	}
	const h = parseFloat(parts[0])
	const sat = clamp(unit(parts[1], 1), 0, 1)
	const l = clamp(unit(parts[2], 1), 0, 1)
	const [r, g, b] = hsl2rgb(h, sat, l)
	return { r, g, b, a : clamp(alpha, 0, 1) }
}

// '50%' is half of max, a plain number is taken as is
function unit(p, max) {
	return p.endsWith('%') ? parseFloat(p) / 100 * max : parseFloat(p)
}

function hsl2rgb(h, s, l) {
	h = ((h % 360) + 360) % 360
	const k = n => (n + h / 30) % 12
	const a = s * Math.min(l, 1 - l)
	const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
	return [f(0), f(8), f(4)].map(v => Math.round(v * 255))
}

function clamp(v, min, max) {
	return v < min ? min : v > max ? max : v
}

