/**
@module    exportframe.js
@desc      Exports a single frame or range to a file
@cathegory internal

Exports a frame as image.
Expects the canvas renderer as the active renderer.
This is a sort of hack, adapted from:
https://github.com/eligrey/FileSaver.js

Tested on Safari, FF, Chrome
*/



export function exportFrame(context, filename, from=1, to=from) {

	// Renderer is not canvas.
	// A renderer instance could be imported here and the content of the buffer
	// rendere to a tmp canvas… maybe overkill: let’s keep things simple for now.
	const canvas = context.parentInfo.element
	if (canvas.nodeName != 'CANVAS') {
		console.warn("exportframe.js: Can’t export, canvas renderer is required.")
		return
	}


	// Filename not provided
	if (!filename) {
		console.warn("exportframe.js: Filename not provided.")
		return
	}

	// Filename chunks
	const m = filename.match(/(.+)\.([0-9a-z]+$)/i)
	const base = m[1]
	const ext = m[2]

	const f = context.frame
	if (f >= from && f <= to) {
		const out = base + "_" + (f.toString().padStart(5, '0')) + "." + ext
		console.info("exportframe.js: Exporting frame " + out)
		canvas.toBlob( blob => saveAs(blob, out))
	}
}

// The hack: creates an anchor with a 'download' attribute
// and then emits a click event. Works well enough!
function saveAs (blob, name) {

	const a = document.createElement('a')
	a.download = name
	a.rel = 'noopener'
	a.href = URL.createObjectURL(blob)

	setTimeout(() => { URL.revokeObjectURL(a.href) }, 30000)
	setTimeout(() => { click(a) }, 0)
}

function click (node) {
	try {
		node.dispatchEvent(new MouseEvent('click'))
	} catch (err) {
		var e = document.createEvent('MouseEvents')
		e.initMouseEvent('click')
		node.dispatchEvent(e)
	}
}
