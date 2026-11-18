/**
@author ertdfgcvb
@title  Canvas renderer
@desc   Rendering to a canvas element
*/

// The canvas renderer draws the cells on a <canvas> element;
// with a non canvas element as target a canvas is created inside it.
// The canvas follows its CSS size: with fixed cols and rows
// the grid is drawn from the top left corner.
export const settings = {
	renderer        : 'canvas',
	cols            : 42,
	rows            : 22,
	backgroundColor : 'pink',
	color           : 'black'
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.:!?'

export function main(coord, { frame, cols }) {
	const { x, y } = coord
	const l = chars.length
	return y % 2 ? chars[(y + x + frame) % l] : chars[(y + cols - x + frame) % l]
}
