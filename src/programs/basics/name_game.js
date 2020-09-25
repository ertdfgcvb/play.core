/**
@author No1
@title  Name game
@desc   What’s your name?
[header]
*/

// The default backround color and font attributes can be altered
// by exporting a 'settings' object (see the manual for details).
export const settings = {
		background : 'black',
		color : 'white',
		weight : 'bold' // or '700'
}

const TAU = Math.PI * 2

export function main(coord, context){
	const a = context.frame * 0.05
	const f = Math.floor((1 - Math.cos(a)) * 10) + 1
	const g = Math.floor(a / TAU) % 10 + 1
	const i = coord.index % (coord.y * g + 1) % (f % context.cols)
	// NOTE: If the function returns undefined or null
	// the a default character will be inserted (space).
	// In this case i may be greater than 2...
	return 'Ada'[i]
}
