/**
@module    image.js
@desc      Image loader and helper
@cathegory public

TODO: add full desc
*/

import { map } from "./num.js"
import { ImageBuffer } from './imagebuffer.js'
import Load from './load.js'

let image, imgbuf

export default {
	load
}

function load(path){

	const sourceCanvas = document.createElement('canvas')
	sourceCanvas.width = 1
	sourceCanvas.height = 1
	//document.body.appendChild(sourceCanvas)

	const ib = new ImageBuffer(sourceCanvas)

	Load.image(path).then( img => {
		console.log('Image ' + path + ' loaded. Size: ' + img.width + '×' + img.height)
		sourceCanvas.width = img.width
		sourceCanvas.height = img.height
		sourceCanvas.getContext('2d').drawImage(img, 0, 0)
		ib.copy()
	})

	return ib
}

