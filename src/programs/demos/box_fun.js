/**
[header]
@author ertdfgcvb
@title  Box fun
@desc   Think inside of the box
*/

import { clamp, map } from '/src/modules/num.js'

const {sin, cos, floor} = Math

export function main(coord, context, cursor, buffer) {
	// Basic background pattern
	return (coord.x + coord.y) % 2 ? '·' : ' '
}

import { drawBox } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	const { rows, cols } =  context
	const t = context.time * 0.002
	const baseW = 15
	const baseH = 5
	const spacingX = 4
	const spacingY = 2

	let marginX = 3
	let marginY = 2

	const numX = floor((cols - marginX*2) / (baseW+spacingX))
	const numY = floor((rows - marginY*2) / (baseH+spacingY))

	marginX = floor((cols - numX * baseW - (numX-1) * spacingX)/2)
	marginY = floor((rows - numY * baseH - (numY-1) * spacingY)/2)

	const q = 'THINK INSIDE OF THE BOX'

	const baseStyle = {
		paddingX        : 2,
		paddingY        : 1,
		color           : 'black',
		backgroundColor : 'white',
		borderStyle     : 'double',
		shadowStyle     : 'light',
	}

	for (let j=0; j<numY; j++) {
		for (let i=0; i<numX; i++) {
			const ox = floor(sin((i + j) * 0.6 + t*3) * spacingX)
			const oy = floor(cos((i + j) * 0.6 + t*3) * spacingY)
			const ow = 0//floor(sin((i + j) * 0.4 + t*2) * 5) + 5
			const oh = 0//floor(cos((i + j) * 0.4 + t*2) * 2) + 2
			const style = {
				x      : marginX + i * (baseW + spacingX) + ox,
				y      : marginY + j * (baseH + spacingY) + oy,
				width  : baseW + ow,
				height : baseH + oh,
				...baseStyle
			}
			let txt = ''
			txt += `*${q[(i + j * numX) % q.length]}*\n`
			txt += `pos: ${style.x}×${style.y}\n`

			drawBox(txt, style, buffer, cols, rows)
		}
	}
}
