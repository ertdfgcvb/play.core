/**
@author No1
@title  Boxes

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

import { map } from "/src/modules/num.js"
import { sdBox, opSmoothUnion } from "/src/modules/sdf.js"

let chars = "▚▀abc|/:÷×+-=?*·. ".split('')

export function main(coord, context, cursor, buffers){

    const t = context.time
    const a = Math.max(context.cols, context.rows)
    const st = {
        x : 2.0 * (coord.x - context.cols / 2) / a,
        y : 2.0 * (coord.y - context.rows / 2) / a / context.aspect,
    }

    let d = 1e100

    const s = map(Math.sin(t * 0.0005), -1, 1, 0.0, 0.4)
    const g = 1.2
    for (let by=-g; by<=g; by+=g*0.33) {
        for (let bx=-g; bx<=g; bx+=g*0.33) {
            const r = t * 0.0004 * (bx + g*2) + (by + g*2)
            const f = transform(st, {x: bx, y: by},  r)
            const d1 = sdBox(f, {x:g*0.33, y:0.01})
            d = opSmoothUnion(d, d1, s)
        }
    }

    let c = 1.0 - Math.exp(-5 * Math.abs(d))
    const index = Math.floor(c * chars.length)
    return chars[index]
}

function transform(p, trans, rot){
    const s = Math.sin(-rot)
    const c = Math.cos(-rot)
    const dx = p.x - trans.x
    const dy = p.y - trans.y
    return {
        x : dx * c - dy * s,
        y : dx * s + dy * c,
    }
}

import { drawInfo } from "/src/modules/drawbox.js"
export function post(context, cursor, buffers){
    drawInfo(context, cursor, buffers)
}