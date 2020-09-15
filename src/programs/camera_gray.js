/**
@author No1
@title  Camera

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

import {sort} from "/src/modules/sort.js"
import {map} from "/src/modules/num.js"
import cam from "/src/modules/camera.js"

const c = cam.init()
// Debug:
// c.display(document.body, 10, 10)

const chars = sort(" .x?▁▂▃▄▅▆▇█".split(''))

export function pre(context, cursor, buffers){
    c.cover(context).gray().normalize().mirrorX().write(buffers.data)
}

export function main(coord, context, cursor, buffers){
    // Coord also contains the index of each box:
    const c = buffers.data[coord.index]
    const index = Math.floor(c * chars.length)
    return chars[index]
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}
