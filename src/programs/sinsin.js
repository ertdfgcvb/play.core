/**
@author No1
@title  Sin Sin

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

// Globals have module scope
const chars = "ABCxyz01═|+:. ".split('')

// This is the main loop.
// Character coordinates are passed in coord {x, y, index}.
// The function must return a single character or, alternatively, an object:
// {char, color, background, weight}.
export function main(coord, context, cursor, buffers){
	const t = context.time * 0.0001
	const x = coord.x
	const y = coord.y
	const o = Math.sin(y * Math.sin(t) * 0.2 + x * 0.04 + t) * 20
	const i = Math.round(Math.abs(x + y + o)) % chars.length
	return {
		char       : chars[i],
		color      : 'black',
		background : 'white',
		weight     : '100',
	}
}

import { drawInfo } from "/src/modules/drawbox.js"

// This function is called after the main loop and is useful
// to manipulate the buffers; in this case with a window overlay.
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}
