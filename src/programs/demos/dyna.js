/**
[header]
@author ertdfgcvb
@title  Dyna
@desc   A remix of Paul Haeberli’s Dynadraw

The original from 1989:
http://www.graficaobscura.com/dyna/
*/

import { copy, length, vec2, add, sub, divN, mulN } from '/src/modules/vec2.js'
import { smoothstep } from '/src/modules/num.js'

export const settings = { fps : 60 }

const MASS = 20   // Pencil mass
const DAMP = 0.95 // Pencil damping
const RADIUS = 15 // Pencil radius

let cols, rows

export function pre(context, cursor, buffer) {

	// Detect window resize
	if (cols != context.cols || rows != context.rows) {
		cols = context.cols
		rows = context.rows
		for (let i=0; i<cols*rows; i++) {
			buffer[i].value = 0
		}
	}

	const a = context.metrics.aspect // Shortcut

	dyna.update(cursor)

	// Calc line between pos and pre
	const points = line(dyna.pos, dyna.pre)

	for (const p of points) {
		const sx = Math.max(0, p.x - RADIUS)
		const ex = Math.min(cols, p.x + RADIUS)
		const sy = Math.floor(Math.max(0, p.y - RADIUS * a))
		const ey = Math.floor(Math.min(rows, p.y + RADIUS * a))

		for (let j=sy; j<ey; j++) {
			for (let i=sx; i<ex; i++) {
				const x = (p.x - i)
				const y = (p.y - j) / a
				const l = 1 - length({x, y}) / RADIUS
				const idx = i + cols * j
				buffer[idx].value = Math.max(buffer[idx].value, l)
			}
		}
	}
}

const density = ' .:░▒▓█Ñ#+-'.split('')

// Just a renderer
export function main(coord, context, cursor, buffer) {
	const i = coord.index
	const v = smoothstep(0, 0.9, buffer[i].value)
	buffer[i].value *= 0.99
	const idx = Math.floor(v * (density.length - 1))
	return density[idx]
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer, {
		color : 'white', backgroundColor : 'royalblue', shadowStyle : 'gray'
	})
}

// -----------------------------------------------------------------------------

class Dyna {
	constructor(mass, damp) {
		this.pos = vec2(0,0)
		this.vel = vec2(0,0)
		this.pre = vec2(0,0)
		this.mass = mass
		this.damp = damp
	}
	update(cursor) {
		const force = sub(cursor, this.pos)
		const acc = divN(force, this.mass)
		this.vel = mulN(add(this.vel, acc), this.damp)
		this.pre = copy(this.pos)
		this.pos = add(this.pos, this.vel)
	}
}

const dyna = new Dyna(MASS, DAMP)

// -----------------------------------------------------------------------------
// Bresenham’s line algorithm
// https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
// NOTE: vectors a and b will be floored

function line(a, b) {
	let   x0 = Math.floor(a.x)
	let   y0 = Math.floor(a.y)
	const x1 = Math.floor(b.x)
	const y1 = Math.floor(b.y)
    const dx = Math.abs(x1 - x0)
    const dy = -Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let  err = dx + dy

	const points = []

    while (true) {
        points.push({x:x0, y:y0})
        if (x0 == x1 && y0 == y1) break
        let e2 = 2 * err
        if (e2 >= dy) {
            err += dy
            x0 += sx
		}
        if (e2 <= dx) {
            err += dx
            y0 += sy
		}
	}
	return points
}
