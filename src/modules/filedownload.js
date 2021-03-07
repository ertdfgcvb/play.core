/**
@module   filedownload.js
@desc     Exports a file via Blob
@category internal

Downloads a Blob as file and this “hack”:
creates an anchor with a “download” attribute
and then emits a click event.
See: https://github.com/eligrey/FileSaver.js
*/

const mimeTypes = {
	'js'  : 'text/javascript',
	'txt' : 'text/plain',
	'png' : 'image/png',
	'jpg' : 'text/jpeg',
}

// For text elements
export function saveSourceAsFile(src, filename) {
	const ext = getFileExt(filename)
	const type = mimeTypes[ext]
	const blob = type ? new Blob([src], {type}) : new Blob([src])
	saveBlobAsFile(blob, filename)
}

// Gets extension of a filename
function getFileExt(filename) {
	return filename.split('.').pop()
}

// For canvas elements
export function saveBlobAsFile(blob, filename) {

	const a = document.createElement('a')
	a.download = filename
	a.rel = 'noopener'
	a.href = URL.createObjectURL(blob)

	setTimeout(() => { URL.revokeObjectURL(a.href) }, 10000)
	setTimeout(() => { click(a) }, 0)
}

function click(node) {
	try {
		node.dispatchEvent(new MouseEvent('click'))
	} catch (err) {
		var e = document.createEvent('MouseEvents')
		e.initMouseEvent('click')
		node.dispatchEvent(e)
	}
}
