/**
@author No1
@title  Camera grayscale
@desc   Grayscale input from camera

[header]

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
