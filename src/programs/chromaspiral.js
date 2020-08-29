/**
@author No1
@title  Chroma Spiral

META-Enter  : run
META-S      : save a new version (locally, with permalink)
META-Period : show/hide editor
META-K      : upload a version to the server (needs a new @name and @title)

Where META can be the CMD, OPT or CTRL key
Use CRTL-Enter on macOS to avoid inserting a new line

Type ?help
anywhere (or edit the previous line) to open the manual for an overview
about the playground, more commands like this and links to many examples.

Type ?immediate on
to enable immediate mode.

Type ?video night
to switch to dark mode for the editor.
*/

import { map } from '/src/modules/num.js'
import { sort } from '/src/modules/sort.js'
import { vec2, rot, add, mulN, addN, subN, length } from '/src/modules/vec2.js'

const chars  = '╳╱╲XYZabc.:+-=!? '.split('')
const colors = ['deeppink', 'black', 'red', 'blue', 'orange', 'yellow']

export function main(coord, context, cursor, buffers){

	const t  = context.time * 0.0002
	const a  = Math.min(context.cols, context.rows)
	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
		y : 2.0 * (coord.y - context.rows / 2) / a
	}

	for (let i=0;i<3;i++) {
		subN(st, 0.5 + i * 0.005, st)
		const o = i * 3.0
		const v = vec2(Math.sin(t * 3.0 + o), Math.cos(t * 2.0 + o))
		add(st, v, st)
		mulN(st, Math.cos(t * 0.1), st)
		addN(st, 0.5 - i*0.005, st)

		const ang = -t + length(subN(st, 0.2))
		subN(st, 0.5, st)
		rot(st, ang, st)
		addN(st, 0.5, st)
	}

	mulN(st, 0.6, st)

	const s = Math.cos(t*1.0) * 2.0;
	let c = Math.sin(st.x * 3.0 + s) + Math.sin(st.y * 21)
	c = map(Math.sin(c * 0.5), -1, 1, 0, 1)

	addN(st, 0.1 + t * 0.1, st);
	c = Math.sin(st.x * 3.0 + s) + Math.sin(st.y * 21)
	c = map(Math.sin(c * 0.5), -1, 1, 0, 1)

	const index = Math.floor(c * chars.length - 1)
	const color = Math.floor(c * colors.length - 1)

	return {
		// char  : (coord.x + coord.y) % 2 ? chars[index] : '╲',
		char  : chars[index],
		color : colors[color],
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers)
}