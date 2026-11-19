/**
@author ertdfgcvb
@title  Camera RGB
@desc   Color input from camera (quantised)
*/

import { rgb, rgb2hex } from '@ertdfgcvb/play/color.js'
import Camera from '@ertdfgcvb/play/camera.js'
import { Pixels } from '@ertdfgcvb/play/pixels.js'

const cam = await Camera.init()
const px = new Pixels()

const density = ' .+=?X#ABC'

// A custom palette used for color quantisation:
const pal = []
pal.push(rgb(  0,   0,   0))
pal.push(rgb(255,   0,   0))
pal.push(rgb(255, 255,   0))
pal.push(rgb(  0, 100, 250))
pal.push(rgb(100, 255, 255))
//pal.push(rgb(255, 182, 193))
//pal.push(rgb(255, 255, 255))

export function pre({ cols, rows, metrics }) {
	// The image is resized so that 1 cell -> 1 pixel,
	// cover() draws the camera covering the whole frame
	px.resize(cols, rows).cover(cam, metrics.aspect).flipX().quantize(pal)
}

export function main(coord) {
	// Coord also contains the index of each cell
	const color = px.data[coord.index]
	// Add some chars to the output
	const index = Math.floor(color.gray * (density.length - 1))
	return {
		char            : density[index],
		color           : 'white',
		// convert {r,g,b} obj to a valid CSS hex string
		backgroundColor : rgb2hex(color)
	}
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(context) {
	desk.update(context)
}
