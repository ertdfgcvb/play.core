/**
@module    camera.js
@desc      Webcam init and helper
@cathegory public

TODO: add full desc
*/

import { map } from "./num.js"
import { ImageBuffer } from './imagebuffer.js'

let video, imgbuf

export default {
	init
}

function init(){
	// Avoid double init of video object
	video = video || getUserMedia()
	imgbuf = imgbuf || new ImageBuffer(video)
	return imgbuf
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
