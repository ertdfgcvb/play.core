/**
@author No1
@title  Camera RGB
@desc   Color input from camera (warning: slow FPS)
[header]
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
