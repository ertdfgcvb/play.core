/**
@author ertdfgcvb
@title  Hotlink
@desc   Function hotlink example (GitHub)
        The code for the Open Simplex Noise function is downloaded from GitHub
        and evaluated through “new Function()”.
*/

// Don’t do this :)
// The script is not a module: it is downloaded as text and evaluated.
// The program starts once it is loaded (top-level await)
const src = await (await fetch('https://raw.githubusercontent.com/blindman67/SimplexNoiseJS/master/simplexNoise.js')).text()
const openSimplexNoise = new Function('return ' + src)()
const noise3D = openSimplexNoise(Date.now()).noise3D

const density = 'Ñ@#W$9876543210?!abcxyz;:+=-,._ '

export function main(coord, context) {
	const t = context.time * 0.0007
	const s = 0.03
	const x = coord.x * s
	const y = coord.y * s / context.metrics.aspect + t
	const i = Math.floor((noise3D(x, y, t) * 0.5 + 0.5) * density.length)
	return density[i]
}
