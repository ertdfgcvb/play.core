/**
@author ertdfgcvb
@title  Name game
@desc   What’s your name?
*/

// The default backround color and font attributes can be altered
// by exporting a ‘settings’ object (see the manual for details).
export const settings = {
	backgroundColor : 'black',
	color           : 'white',
	fontSize        : '3em',
	fontWeight      : 'lighter' // or 100
}

const TAU = Math.PI * 2

export function main(coord, { frame, cols }) {
	const a = frame * 0.05
	const f = Math.floor((1 - Math.cos(a)) * 10) + 1
	const g = Math.floor(a / TAU) % 10 + 1
	const i = coord.index % (coord.y * g + 1) % (f % cols)
	// NOTE: If the function returns ‘undefined’ or ‘null’
	// the cell is left as it is: a space, as the buffer is cleared each frame.
	// In some cases ‘i’ may be greater than 2:
	// JavaScript array out of bounds results in ‘undefined’.
	return 'Ada'[i]
}
