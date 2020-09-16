/**
@author No1
@title  Boxes
@desc   Smooth SDF boxes
[header]
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