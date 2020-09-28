/**
Some common palettes and simple color helpers

Colors can be defined as:

rgb : {r:255, g:0, b:0}
int : 16711680 (0xFF0000)
hex : '#FF0000'
css : 'rgb(255,0,0)'

CSS1 and CSS3 palettes are exported as maps
C64 and CGA palettes are exported as arrays

Colors in exported palettes are augmented to:
{
	name: 'red',
	r: 255,
	g: 0,
	b: 0,
	a: 255,
	gray: 54,
	hex: '#FF0000',
	css: 'rgb(255,0,0)'
	int: 16711680,
}

*/

export function rgb(r,g,b,a=255){
	return {r,g,b,a}
}

export function rgb2css(rgb) {
	return `rgb(${rgb.r},${rgb.g},${rgb.b})`
}

export function rgb2hex(rgb) {
	let r = (rgb.r).toString(16).toUpperCase()
  	if (r.length < 2) r = '0' + r

	let g = (rgb.g).toString(16).toUpperCase()
  	if (g.length < 2) g = '0' + g

	let b = (rgb.b).toString(16).toUpperCase()
  	if (b.length < 2) b = '0' + b

	return '#' + r + g + b
}

export function rgb2gray(rgb) {
	return Math.round(rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722)
}

function augment(pal) {
	return pal.map(el => {
		const rgb  = int2rgb(el.int)
		const hex  = rgb2hex(rgb)
		const css  = rgb2css(rgb)
		const gray = rgb2gray(rgb)
	 	return {...el, ...rgb, gray, hex, css}
	})
}

function toMap(pal) {
	const out = {}
	pal.forEach(el => {
		out[el.name] = el
	})
	return out
}

// export function int2hex(int) {
// 	return '#' + (int).toString(16).toUpperCase()
// }

// https://www.c64-wiki.com/wiki/Color
const _C64 = [
	{ int : 0x000000, name : 'black' },
	{ int : 0xFFFFFF, name : 'white' },
	{ int : 0x880000, name : 'red' },
	{ int : 0xAAFFEE, name : 'cyan' },
	{ int : 0xCC44CC, name : 'violet' },
	{ int : 0x00CC55, name : 'green' },
	{ int : 0x0000AA, name : 'blue' },
	{ int : 0xEEEE77, name : 'yellow' },
	{ int : 0xDD8855, name : 'orange' },
	{ int : 0x664400, name : 'brown' },
	{ int : 0xFF7777, name : 'lightred' },
	{ int : 0x333333, name : 'darkgrey' },
	{ int : 0x777777, name : 'grey' },
	{ int : 0xAAFF66, name : 'lightgreen' },
	{ int : 0x0088FF, name : 'lightblue' },
	{ int : 0xBBBBBB, name : 'lightgrey' }
]

const _CGA = [
	{ int : 0x000000, name : 'black' },
	{ int : 0x0000AA, name : 'blue' },
	{ int : 0x00AA00, name : 'green' },
	{ int : 0x00AAAA, name : 'cyan' },
	{ int : 0xAA0000, name : 'red' },
	{ int : 0xAA00AA, name : 'magenta' },
	{ int : 0xAA5500, name : 'brown' },
	{ int : 0xAAAAAA, name : 'lightgray' },
	{ int : 0x555555, name : 'darkgray' },
	{ int : 0x5555FF, name : 'lightblue' },
	{ int : 0x55FF55, name : 'lightgreen' },
	{ int : 0x55FFFF, name : 'lightcyan' },
	{ int : 0xFF5555, name : 'lightred' },
	{ int : 0xFF55FF, name : 'lightmagenta' },
	{ int : 0xFFFF55, name : 'yellow' },
	{ int : 0xFFFFFF, name : 'white' }
]

// https://en.wikipedia.org/wiki/Web_colors#Basic_colors
const _CSS1 = [
	{ int : 0xFFFFFF, name :'white' },
	{ int : 0xC0C0C0, name :'silver' },
	{ int : 0x808080, name :'gray' },
	{ int : 0x000000, name :'black' },
	{ int : 0xFF0000, name :'red' },
	{ int : 0x800000, name :'maroon' },
	{ int : 0xFFFF00, name :'yellow' },
	{ int : 0x808000, name :'olive' },
	{ int : 0x00FF00, name :'lime' },
	{ int : 0x008000, name :'green' },
	{ int : 0x00FFFF, name :'aqua' },
	{ int : 0x008080, name :'teal' },
	{ int : 0x0000FF, name :'blue' },
	{ int : 0x000080, name :'navy' },
	{ int : 0xFF00FF, name :'fuchsia' },
	{ int : 0x800080, name :'purple' }
]

// https://www.cssportal.com/css3-color-names
const _CSS3 = [
	{ int : 0xF0F8FF, name : 'aliceblue' },
	{ int : 0xFAEBD7, name : 'antiquewhite' },
	{ int : 0x00FFFF, name : 'aqua' },
	{ int : 0x7FFFD4, name : 'aquamarine' },
	{ int : 0xF0FFFF, name : 'azure' },
	{ int : 0xF5F5DC, name : 'beige' },
	{ int : 0xFFE4C4, name : 'bisque' },
	{ int : 0x000000, name : 'black' },
	{ int : 0xFFEBCD, name : 'blanchedalmond' },
	{ int : 0x0000FF, name : 'blue' },
	{ int : 0x8A2BE2, name : 'blueviolet' },
	{ int : 0xA52A2A, name : 'brown' },
	{ int : 0xDEB887, name : 'burlywood' },
	{ int : 0x5F9EA0, name : 'cadetblue' },
	{ int : 0x7FFF00, name : 'chartreuse' },
	{ int : 0xD2691E, name : 'chocolate' },
	{ int : 0xFF7F50, name : 'coral' },
	{ int : 0x6495ED, name : 'cornflowerblue' },
	{ int : 0xFFF8DC, name : 'cornsilk' },
	{ int : 0xDC143C, name : 'crimson' },
	{ int : 0x00FFFF, name : 'cyan' },
	{ int : 0x00008B, name : 'darkblue' },
	{ int : 0x008B8B, name : 'darkcyan' },
	{ int : 0xB8860B, name : 'darkgoldenrod' },
	{ int : 0xA9A9A9, name : 'darkgray' },
	{ int : 0x006400, name : 'darkgreen' },
	{ int : 0xA9A9A9, name : 'darkgrey' },
	{ int : 0xBDB76B, name : 'darkkhaki' },
	{ int : 0x8B008B, name : 'darkmagenta' },
	{ int : 0x556B2F, name : 'darkolivegreen' },
	{ int : 0xFF8C00, name : 'darkorange' },
	{ int : 0x9932CC, name : 'darkorchid' },
	{ int : 0x8B0000, name : 'darkred' },
	{ int : 0xE9967A, name : 'darksalmon' },
	{ int : 0x8FBC8F, name : 'darkseagreen' },
	{ int : 0x483D8B, name : 'darkslateblue' },
	{ int : 0x2F4F4F, name : 'darkslategray' },
	{ int : 0x2F4F4F, name : 'darkslategrey' },
	{ int : 0x00CED1, name : 'darkturquoise' },
	{ int : 0x9400D3, name : 'darkviolet' },
	{ int : 0xFF1493, name : 'deeppink' },
	{ int : 0x00BFFF, name : 'deepskyblue' },
	{ int : 0x696969, name : 'dimgray' },
	{ int : 0x696969, name : 'dimgrey' },
	{ int : 0x1E90FF, name : 'dodgerblue' },
	{ int : 0xB22222, name : 'firebrick' },
	{ int : 0xFFFAF0, name : 'floralwhite' },
	{ int : 0x228B22, name : 'forestgreen' },
	{ int : 0xFF00FF, name : 'fuchsia' },
	{ int : 0xDCDCDC, name : 'gainsboro' },
	{ int : 0xF8F8FF, name : 'ghostwhite' },
	{ int : 0xFFD700, name : 'gold' },
	{ int : 0xDAA520, name : 'goldenrod' },
	{ int : 0x808080, name : 'gray' },
	{ int : 0x808080, name : 'grey' },
	{ int : 0x008000, name : 'green' },
	{ int : 0xADFF2F, name : 'greenyellow' },
	{ int : 0xF0FFF0, name : 'honeydew' },
	{ int : 0xFF69B4, name : 'hotpink' },
	{ int : 0xCD5C5C, name : 'indianred' },
	{ int : 0x4B0082, name : 'indigo' },
	{ int : 0xFFFFF0, name : 'ivory' },
	{ int : 0xF0E68C, name : 'khaki' },
	{ int : 0xE6E6FA, name : 'lavender' },
	{ int : 0xFFF0F5, name : 'lavenderblush' },
	{ int : 0x7CFC00, name : 'lawngreen' },
	{ int : 0xFFFACD, name : 'lemonchiffon' },
	{ int : 0xADD8E6, name : 'lightblue' },
	{ int : 0xF08080, name : 'lightcoral' },
	{ int : 0xE0FFFF, name : 'lightcyan' },
	{ int : 0xFAFAD2, name : 'lightgoldenrodyellow' },
	{ int : 0xD3D3D3, name : 'lightgray' },
	{ int : 0xD3D3D3, name : 'lightgrey' },
	{ int : 0x90EE90, name : 'lightgreen' },
	{ int : 0xD3D3D3, name : 'lightgrey' },
	{ int : 0xFFB6C1, name : 'lightpink' },
	{ int : 0xFFA07A, name : 'lightsalmon' },
	{ int : 0x20B2AA, name : 'lightseagreen' },
	{ int : 0x87CEFA, name : 'lightskyblue' },
	{ int : 0x778899, name : 'lightslategray' },
	{ int : 0x778899, name : 'lightslategrey' },
	{ int : 0xB0C4DE, name : 'lightsteelblue' },
	{ int : 0xFFFFE0, name : 'lightyellow' },
	{ int : 0x00FF00, name : 'lime' },
	{ int : 0x32CD32, name : 'limegreen' },
	{ int : 0xFAF0E6, name : 'linen' },
	{ int : 0xFF00FF, name : 'magenta' },
	{ int : 0x800000, name : 'maroon' },
	{ int : 0x66CDAA, name : 'mediumaquamarine' },
	{ int : 0x0000CD, name : 'mediumblue' },
	{ int : 0xBA55D3, name : 'mediumorchid' },
	{ int : 0x9370DB, name : 'mediumpurple' },
	{ int : 0x3CB371, name : 'mediumseagreen' },
	{ int : 0x7B68EE, name : 'mediumslateblue' },
	{ int : 0x00FA9A, name : 'mediumspringgreen' },
	{ int : 0x48D1CC, name : 'mediumturquoise' },
	{ int : 0xC71585, name : 'mediumvioletred' },
	{ int : 0x191970, name : 'midnightblue' },
	{ int : 0xF5FFFA, name : 'mintcream' },
	{ int : 0xFFE4E1, name : 'mistyrose' },
	{ int : 0xFFE4B5, name : 'moccasin' },
	{ int : 0xFFDEAD, name : 'navajowhite' },
	{ int : 0x000080, name : 'navy' },
	{ int : 0xFDF5E6, name : 'oldlace' },
	{ int : 0x808000, name : 'olive' },
	{ int : 0x6B8E23, name : 'olivedrab' },
	{ int : 0xFFA500, name : 'orange' },
	{ int : 0xFF4500, name : 'orangered' },
	{ int : 0xDA70D6, name : 'orchid' },
	{ int : 0xEEE8AA, name : 'palegoldenrod' },
	{ int : 0x98FB98, name : 'palegreen' },
	{ int : 0xAFEEEE, name : 'paleturquoise' },
	{ int : 0xDB7093, name : 'palevioletred' },
	{ int : 0xFFEFD5, name : 'papayawhip' },
	{ int : 0xFFDAB9, name : 'peachpuff' },
	{ int : 0xCD853F, name : 'peru' },
	{ int : 0xFFC0CB, name : 'pink' },
	{ int : 0xDDA0DD, name : 'plum' },
	{ int : 0xB0E0E6, name : 'powderblue' },
	{ int : 0x800080, name : 'purple' },
	{ int : 0x663399, name : 'rebeccapurple' },
	{ int : 0xFF0000, name : 'red' },
	{ int : 0xBC8F8F, name : 'rosybrown' },
	{ int : 0x4169E1, name : 'royalblue' },
	{ int : 0x8B4513, name : 'saddlebrown' },
	{ int : 0xFA8072, name : 'salmon' },
	{ int : 0xF4A460, name : 'sandybrown' },
	{ int : 0x2E8B57, name : 'seagreen' },
	{ int : 0xFFF5EE, name : 'seashell' },
	{ int : 0xA0522D, name : 'sienna' },
	{ int : 0xC0C0C0, name : 'silver' },
	{ int : 0x87CEEB, name : 'skyblue' },
	{ int : 0x6A5ACD, name : 'slateblue' },
	{ int : 0x708090, name : 'slategray' },
	{ int : 0x708090, name : 'slategrey' },
	{ int : 0xFFFAFA, name : 'snow' },
	{ int : 0x00FF7F, name : 'springgreen' },
	{ int : 0x4682B4, name : 'steelblue' },
	{ int : 0xD2B48C, name : 'tan' },
	{ int : 0x008080, name : 'teal' },
	{ int : 0xD8BFD8, name : 'thistle' },
	{ int : 0xFF6347, name : 'tomato' },
	{ int : 0x40E0D0, name : 'turquoise' },
	{ int : 0xEE82EE, name : 'violet' },
	{ int : 0xF5DEB3, name : 'wheat' },
	{ int : 0xFFFFFF, name : 'white' },
	{ int : 0xF5F5F5, name : 'whitesmoke' },
	{ int : 0xFFFF00, name : 'yellow' },
	{ int : 0x9ACD32, name : 'yellowgreen' }
]

// hex is not a string but an int number
export function int2rgb(int) {
	return {
		a : 255,
		r : int >> 16 & 0xFF,
		g : int >>  8 & 0xFF,
		b : int       & 0xFF

	}
}

export const CSS3 = toMap(augment(_CSS3))
export const CSS1 = toMap(augment(_CSS1))
export const C64  = augment(_C64)
export const CGA  = augment(_CGA)

