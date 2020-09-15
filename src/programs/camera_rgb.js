/**
@author No1
@title  Camera RGB

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

import {map} from "/src/modules/num.js"
import cam from "/src/modules/camera.js"

const c = cam.init()
// Debug:
// c.display(document.body, 10, 10)

export function pre(context, cursor, buffers){
    const scale = map(Math.sin(context.time * 0.001), -1, 1, 1, 10)
    c.cover(context, scale).rgba().mirrorX().write(buffers.data)
}

export function main(coord, context, cursor, buffers){
    // Coord also contains the index of each box:
    const c = buffers.data[coord.index]
    return {
        char  : '█',
        color : `rgb(${c.r},${c.g},${c.b})`
    }
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}
