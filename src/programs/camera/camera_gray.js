/**
[header]
@author ertdfgcvb
@title  Camera grayscale
@desc   Grayscale input from camera
*/

import { sort } from '@ertdfgcvb/play/sort.js'
import Camera from '@ertdfgcvb/play/camera.js'
import { Pixels } from '@ertdfgcvb/play/pixels.js'

// The program starts once the camera is ready (top-level await)
const cam = await Camera.init()
const px = new Pixels()

// The chars sorted by density, measured in the font (async: waits for the font)
const density = await sort(' .x?▂▄▆█', 'Simple Console')

export function pre({ cols, rows, metrics }) {
	// The image is resized so that 1 cell -> 1 pixel.
	// cover() draws the camera covering the whole frame,
	// the aspect ratio of the cells corrects the proportions
	px.resize(cols, rows).cover(cam, metrics.aspect).flipX().normalize()
}

export function main(coord) {
	// Coord also contains the index of each cell:
	const p = px.data[coord.index]
	// Alternatively, by coordinates (null outside the image):
	// const p = px.get(coord.x, coord.y)
	const index = Math.floor(p.gray * (density.length - 1))
	return density[index]
}

import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop()
desk.info()

export function post(ctx) {
	desk.update(ctx)
}
