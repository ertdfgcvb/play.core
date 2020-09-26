/**
@author ertdfgcvb
@title  Circle
@desc   Draw a smooth circle with exp()
[header]
*/

import { sdCircle } from '/src/modules/sdf.js'
import { sort } from '/src/modules/sort.js'

const chars = sort('/\\MXYZabc!?=-. '.split(''))

export const settings = { fps : 60 }

export function main(coord, context, cursor, buffer){

	const t  = context.time * 0.002
	const a  = Math.min(context.cols, context.rows)
	const st = {
		x : 2.0 * (coord.x - context.cols / 2) / a * context.aspect,
		y : 2.0 * (coord.y - context.rows / 2) / a
	}

	const radius = (Math.cos(t)) * 0.4 + 0.5
	const d = sdCircle(st, radius)
	const c = 1.0 - Math.exp(-5 * Math.abs(d))
	const index = Math.floor(c * chars.length)

	return {
		char : coord.x % 2 ? '│' : chars[index],
		background : 'black',
		color : 'white'
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, metrics, cursor, buffer){
	drawInfo(context, metrics, cursor, buffer)
}
