/**
@module    image.js
@desc      Image loader and helper
@cathegory public

TODO: add full desc
*/

import { map } from "./num.js"
import { ImageBuffer } from './imagebuffer.js'
import Load from './load.js'

export default {
	load
}

function load(path){

	const source = document.createElement('canvas')
	source.width = 1
	source.height = 1

	const ib = new ImageBuffer(source)

	Load.image(path).then( img => {
		console.log('Image ' + path + ' loaded. Size: ' + img.width + '×' + img.height)
		source.width = img.width
		source.height = img.height
		source.getContext('2d').drawImage(img, 0, 0)
		ib.resize(source.width, source.height)
		ib.copy()
	})

	return ib
}

