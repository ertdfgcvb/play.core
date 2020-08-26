/**
@author No1
@title  Circle

META-Enter  : run
META-S      : save a new version (locally, with permalink)
META-Period : show/hide editor
META-U      : upload a version to the server (needs a new @name and @title)

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

import { sdCircle, opSmoothUnion, } from "/src/modules/sdf.js"
import { sort } from "/src/modules/sort.js"

const chars = sort("/\\MXYZabc!?=-. ".split(''))

export function main(coord, context, cursor, buffer){

    const t  = context.time * 0.002
    const a  = Math.min(context.cols, context.rows)
    const st = {
        x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
        y : 2.0 * (coord.y - context.rows / 2) / a
    }

    const rad = (Math.cos(t)) * 0.4 + 0.5
    const d = sdCircle(st, rad)
    const c = 1.0 - Math.exp(-5 * Math.abs(d))
    const index = Math.floor(c * chars.length)

    return {
        char       : coord.x % 2 ? "│" : chars[index],
        color      : "white",
        background : "black",
    }
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, metrics, cursor, buffer){
    drawInfo(context, metrics, cursor, buffer)
}
