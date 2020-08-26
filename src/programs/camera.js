/**
@author No1
@title  Camera

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

import { sort } from "/src/modules/sort.js"
import cam from "/src/modules/camera.js"

const chars = sort(" .x?▁▂▃▄▅▆▇█".split(''))

const c = cam.init()

// Debug:
// c.canvas.style.position = "absolute"
// c.canvas.style.left = "0"
// c.canvas.style.top = "0"
// document.body.appendChild(c.canvas)

export function pre(context, cursor, buffers){
    cam.update(context)
    cam.getGray(buffers.data)
    cam.normalize(buffers.data)
}

export function main(coord, context, cursor, buffers){
    // Coord also contains the index of each box:
    const i = coord.x + coord.y * context.cols
    const c = buffers.data[i]
    const index = Math.floor(c * chars.length)
    return {
        char       : chars[index],
        color      : 'black',
        background : 'white'
    }
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}
