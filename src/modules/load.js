export default { image, text, json }

// All reject on errors: with a top-level await the program stops with the message
//   const img = await Load.image('photo.png')

export function image(url) {
	return new Promise((resolve, reject) => {
		const img = new Image()
		// Pixels can be read from images of other origins that allow it
		img.crossOrigin = 'anonymous'
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Could not load image: ' + url))
		img.src = url
	})
}

export async function text(url) {
	return (await get(url)).text()
}

export async function json(url) {
	return (await get(url)).json()
}

async function get(url) {
	const res = await fetch(url)
	if (!res.ok) throw new Error('Could not load ' + url + ' (' + res.status + ')')
	return res
}
