/**
@author No1
@title  Wobbly

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

import { sdCircle } from '/src/modules/sdf.js'
import { sort } from '/src/modules/sort.js'
import { length, dot, rot } from '/src/modules/vec2.js'
import { map, fract, smoothstep } from '/src/modules/num.js'

const charMap = sort('▚╳▄▀▐─═0123.+?+'.split(''))

export function main(coord, context, cursor, buffer){

	const t = context.time * 0.001
	const a = Math.min(context.cols, context.rows)
	let st = {
		x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
		y : 2.0 * (coord.y - context.rows / 2) / a
	}

	st = rot(st, 0.6 * Math.sin(0.62 * t) * length(st) * 2.5)
	st = rot(st, t * 0.2)

	const s = map(Math.sin(t), -1, 1, 0.5, 1.8)
	const pt = {
		x : fract(st.x * s) - 0.5,
		y : fract(st.y * s) - 0.5
	}

	const r = 0.5 * Math.sin(0.5 * t + st.x * 0.2) + 0.5

	const d = sdCircle(pt, r)

	const width = 0.05 + 0.3 * Math.sin(t);

	const k = smoothstep(width, width + 0.2, Math.sin(10 * d + t));
	const c = (1.0 - Math.exp(-3 * Math.abs(d))) * k

	const index = Math.floor(c * charMap.length)

	return {
		char       : charMap[index],
		color      : k < 0.4 ? 'orangered' : 'royalblue',
		// background : coord.y % 2 ? 'white' : 'cornsilk'
		background : 'cornsilk'
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffers){
	drawInfo(context, cursor, buffers, {
		color : 'white', background : 'blue', shadowStyle : 'gray'
	})
}
