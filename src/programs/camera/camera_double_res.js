/**
@author ertdfgcvb
@title  Camera double resolution
@desc   Doubled vertical resolution input from camera
*/

import { CSS3 } from '@ertdfgcvb/play/palettes.js'
import Camera from '@ertdfgcvb/play/camera.js'
import { Pixels } from '@ertdfgcvb/play/pixels.js'

const cam = await Camera.init()
const px = new Pixels()

// Palette for quantization
const pal = [CSS3.red, CSS3.blue, CSS3.white, CSS3.black, CSS3.lightblue]

export function pre({ cols, rows, metrics }) {
	// The image is resized to double the height of the grid:
	// the aspect ratio needs to be doubled too
	px.resize(cols, rows * 2).cover(cam, metrics.aspect * 2).quantize(pal).flipX()
}

export function main(coord, { cols }) {
	// Two pixels per cell: upper and lower half
	const idx   = coord.y * cols * 2 + coord.x
	const upper = px.data[idx]
	const lower = px.data[idx + cols]
	return {
		char            : '▄',
		color           : lower.hex,
		backgroundColor : upper.hex
	}
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}
