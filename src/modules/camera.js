/**
Camera module
TODO: add description
*/

import { map } from "../modules/num.js"

let video, canvas, ctx
const buf = []

export default {
	init,
	update,
	getGray,
	normalize,
}

function init(){
	// Avoid double init of video object
	video = video || getUserMedia()
	canvas = canvas || document.createElement("canvas")
	ctx = ctx || canvas.getContext('2d')
	return {
		canvas,
		video
	}
}

function update(context, scale=1.0){

	const w  = context.cols
	const h  = context.rows
	const va = video.videoWidth / video.videoHeight // video aspect
	const ma = context.aspect
	const ca = w / h

	// Adjust the canvas size to the context size
	canvas.width  = w
	canvas.height = h

	// Always 'cover'
	let dw, dh
	if (va > ca * ma) {
		dw = h / ma * va
		dh = h / ma
	} else {
		dw = w
		dh = w / va
	}

	// Update the canvas with correct aspect ratios
	const sx = scale
	const sy = scale * ma // adjust aspect
	ctx.save()
	ctx.translate(w/2, h/2)
	ctx.scale(-sx, sy)   // flip for mirror mode
	ctx.drawImage(video, -dw/2, -dh/2, dw, dh)
	ctx.restore()
}

function getGray(target){
	target = target || buf
	const w = canvas.width
	const h = canvas.height
	const data = ctx.getImageData(0, 0, w, h).data
	let idx = 0
	for (let i=0; i<data.length; i += 4) {
		// https://en.wikipedia.org/wiki/Grayscale
		const v = data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722
		target[idx++] = v / 255.0
	}
	// Chop excessive length, not really necessary…
	const len = w * h
	if (target.length > len) target.length = len
	return target
}

function normalize(target){
	target = target || buf
	let min = 1.0
	let max = 0.0
	for (let i=0; i<target.length; i++) {
		min = Math.min(target[i], min)
		max = Math.max(target[i], max)
	}
	for (let i=0; i<target.length; i++) {
		target[i] = map(target[i], min, max, 0, 1)
	}
	// return target.map( v => {
	//     return map(v, min, max, 0, 1)
	// })
}

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
function getUserMedia(callback){

	// getUserMedia is not supported by browser
	if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
		throw new DOMException('getUserMedia not supported in this browser')
		return
	}

	// Create a video element
	const video = document.createElement('video')
	video.setAttribute('playsinline', '') // Required to work in iOS 11 & up

	const constraints = {
		audio: false,
		video: { facingMode: "user" }
	}

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		if ('srcObject' in video) {
			video.srcObject = stream
		} else {
			video.src = window.URL.createObjectURL(stream)
		}
	}).catch(function(err){
		let msg = 'No camera available.'
		if (err.code == 1) msg = 'User denied access to use camera.'
		console.log(msg);
		console.error(err)
	})

	video.addEventListener('loadedmetadata', function() {
		video.play()
		if (typeof callback === 'function') callback(video.srcObject)
	})
	return video
}


