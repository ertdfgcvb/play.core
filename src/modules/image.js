/**
@module   image.js
@desc     Image loader and helper
@category public

TODO: add full desc
*/

import Canvas from './canvas.js'
import Load from './load.js'

export default {
	load
}

function load(path){

	const source = document.createElement('canvas')
	source.width = 1
	source.height = 1

	const can = new Canvas()

	Load.image(path).then( img => {
		console.log('Image ' + path + ' loaded. Size: ' + img.width + '×' + img.height)
		can.resize(img.width, img.height)
		can.copy(img)
	}).catch(err => {
		console.warn('There was an error loading image ' + path + '.')
	})

	return can
}
