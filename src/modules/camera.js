export default { init }

let pending = null

// Resolves to a playing <video> of the user-facing camera; the same one on every call.
// Rejects if there is no camera or the access is denied.
export function init(constraints = { audio : false, video : { facingMode : 'user' } }) {
	if (!pending) {
		pending = start(constraints).catch(err => {
			pending = null
			throw err
		})
	}
	return pending
}

async function start(constraints) {
	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		throw new Error('Camera not supported in this browser')
	}
	const stream = await navigator.mediaDevices.getUserMedia(constraints)
	const video = document.createElement('video')
	video.setAttribute('playsinline', '') // iOS: no fullscreen player
	video.muted = true
	video.srcObject = stream
	await new Promise(resolve => video.addEventListener('loadedmetadata', resolve, { once : true }))
	await video.play()
	return video
}
