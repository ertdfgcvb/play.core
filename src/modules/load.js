/**
@module   loader.js
@desc     Various file type loader, returns a Promise
@category internal

Example:

import Load from './load.js'

// Usage: load different file types with one callback
Promise.all([
	Load.text('assets/1/text.txt'),
	Load.image('assets/1/blocks.png'),
	Load.image('assets/1/colors.png'),
	Load.json('data.json'),
]).then(function(res) {
	console.log('Everything has loaded!')
	console.log(res)
}).catch(function() {
	console.log('Error')
})

// Usage: load a single resource
Load.image('assets/1/colors.png').then( img => {
	console.log(`Image has loaded, size is: ${img.width}x${img.height}`)
})

*/

export default { json, image, text }

function image (url) {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = () => {
			console.log('Loader: error loading image ' + url)
			resolve(null)
		}
		img.src = url
	})
}

function text (url) {
	return fetch(url).then( response => {
		return response.text()
	}).catch( err => {
		console.log('Loader: error loading text ' + url)
		return ''
	})
}

function json (url) {
	return fetch(url).then( response => {
		return response.json()
	}).catch( err => {
		console.log('Loader: error loading json ' + url)
		return {}
	})
}

