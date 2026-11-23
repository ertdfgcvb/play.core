/**
@author ertdfgcvb
@title  Box fun
@desc   Jenny Holzer, Truisms (1977–79)
*/

import { panel } from '@ertdfgcvb/play/window.js'

const { sin, cos, floor } = Math

const quote = 'REPETITION IS THE BEST WAY TO LEARN'
const w = 17
const h = 5
const gapX = 4
const gapY = 2

const style = {
	width           : w,
	height          : h,
	paddingX        : 2,
	paddingY        : 1,
	color           : 'black',
	backgroundColor : 'white',
	border          : 'double',
	shadow          : 0.2,
}

export function main(coord) {
	// Background pattern for the desktop
	return (coord.x + coord.y) % 2 ? '·' : ' '
}

// Panels drawn each frame over the output
export function post(context) {
	const { cols, rows } = context
	const t = context.time * 0.006
	const numX = floor((cols - 6) / (w + gapX))
	const numY = floor((rows - 4) / (h + gapY))
	const marginX = floor((cols - numX * (w + gapX) + gapX) / 2)
	const marginY = floor((rows - numY * (h + gapY) + gapY) / 2)

	for (let j=0; j<numY; j++) {
		for (let i=0; i<numX; i++) {
			const x = marginX + i * (w + gapX) + floor(sin((i + j) * 0.6 + t) * gapX)
			const y = marginY + j * (h + gapY) + floor(cos((i + j) * 0.6 + t) * gapY)
			const title = quote[(i + j * numX) % quote.length]
			panel(context, 'pos: ' + x + '×' + y, x, y, { ...style, title })
		}
	}
}
