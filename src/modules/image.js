/**
@module   image.js
@desc     Image loader and helper
@category public

Loads an image and draws it on a canvas.
The returned object is a canvas wrapper and its methods (get, sample, etc.)
can be used before the image has completely loaded.

Usage:
// Starts async loading:
const img = Image.load('res/pattern.png')
// Returns a black color until the image has been loaded:
const color = img.get(10, 10)

*/

import Canvas from './canvas.js'
import Load from './load.js'

export default {
	load
}

function load(path) {

	const source = document.createElement('canvas')
	source.width = 1
	source.height = 1

	const can = new Canvas(source)

	Load.image(path).then( img => {
		console.log('Image ' + path + ' loaded. Size: ' + img.width + '×' + img.height)
		can.resize(img.width, img.height)
		can.copy(img)
	}).catch(err => {
		console.warn('There was an error loading image ' + path + '.')
	})

	return can
}
