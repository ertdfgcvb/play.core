/**
[header]
@author ilithya
@title  Emoji Wave
@desc   From wingdings icons to unicode emojis
		Inspired by emojis evolution
*/

export const settings = {
	color : 'white',
	backgroundColor : 'rgb(100, 0, 300)'
}

const {sin, cos, floor} = Math
const density = '☆ ☺︎ 👀 🌈 🌮🌮 🌈 👀 ☺︎ ☆'

export function main(coord, context) {
	const t = context.time * 0.0008

	const x = coord.x
	const y = coord.y

	const c = context.cols
	const posCenter = floor((c - density.length) * 0.5)

	const wave = sin(y * cos(t)) * 5

	const i = floor(x + wave) - posCenter

	// Note: “undefined” is rendered as a space…
	return density[i]
}