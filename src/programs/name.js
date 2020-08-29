/**
@author No1
@title  Name

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

const TAU = Math.PI * 2

export function main(coord, context){
    const a = context.frame * 0.05
    const f = Math.floor((1-Math.cos(a)) * 10) + 1
    const g = Math.floor(a / TAU) % 6 + 1
    const i = coord.index % (coord.y * g + 1) % (f % context.cols)
    return {
        char : 'Andreas'[i],
        background : 'black',
        color : 'white',
        weight : '700'
    }
}