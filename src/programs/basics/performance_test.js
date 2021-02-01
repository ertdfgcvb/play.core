/**
[header]
@author ertdfgcvb
@title  Perfomance test
@desc   Vertical vs horizontal changes impact FPS
*/

import { map } from '/src/modules/num.js'

export const settings = { fps : 60 }

const { cos } = Math

export function main(coord, context, cursor, buffer) {

	// Hold the mouse button to switch the direction
	// of the gradient and observe the drop in FPS.
	// Frequent *horizontal* changes in style will slow down
	// the DOM rendering as each character needs to be
	// wrapped in an individual, inline-styled <span>.
	// Frequent verical changes won’t affect the speed.

	const direction = cursor.pressed ? coord.x : coord.y

	const f = context.frame * 0.05

    const r1 = map(cos(direction * 0.06 + 1 -f), -1, 1, 0, 255)
    const g1 = map(cos(direction * 0.07 + 2 -f), -1, 1, 0, 255)
    const b1 = map(cos(direction * 0.08 + 3 -f), -1, 1, 0, 255)
    const r2 = map(cos(direction * 0.03 + 1 -f), -1, 1, 0, 255)
    const g2 = map(cos(direction * 0.04 + 2 -f), -1, 1, 0, 255)
    const b2 = map(cos(direction * 0.05 + 3 -f), -1, 1, 0, 255)

	return {
		char : context.frame % 10,
		color : `rgb(${r2},${g2},${b2})`,
		backgroundColor : `rgb(${r1},${g1},${b1})`,
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer)
}
