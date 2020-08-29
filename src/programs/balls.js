/**
@author No1
@title  Balls

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

import { map } from "/src/modules/num.js"
import { sdCircle, opSmoothUnion } from "/src/modules/sdf.js"

//let chars = " ▚╳▄▀abc".split('')
let chars = "╳ABC|/:÷×+-=?*· .".split('')

const PI  = Math.PI
const TAU = Math.PI * 2

export function main(coord, context, cursor, buffer){

    const t = context.time
    const a = Math.min(context.cols, context.rows)
    const st = {
        x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
        y : 2.0 * (coord.y - context.rows / 2) / a
    }

    // const z = map(Math.sin(t * 0.00032), -1, 1, 0.5, 1)
    // st.x *= z
    // st.y *= z

    const s = map(Math.sin(t * 0.0005), -1, 1, 0.0, 0.9)

    let d = 1e100

    const num = 16
    for (let i=0; i<num; i++){
        const r = map(Math.cos(t * 0.011 * (i + 1)/(num+1)), -1, 1, 0.1, 0.3)
        const x = map(Math.cos(t * 0.00023 * (i / num * PI + PI)), -1, 1, -1.2, 1.2)
        const y = map(Math.sin(t * 0.00037 * (i / num * PI + PI)), -1, 1, -1.2, 1.2)
        const f = transform(st, {x: x, y: y},  t * 0.002)
        d = opSmoothUnion(d, sdCircle(f, r), s)
    }

    let c = 1.0 - Math.exp(-3 * Math.abs(d));
    //if (d < 0) c = 0

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
