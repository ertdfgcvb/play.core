/**
@module   color.js
@desc     Some common palettes and simple color helpers
@category public

Colors can be defined as:

rgb : { r:255, g:0, b:0 }
int : 16711680 (0xff0000)
hex : '#FF0000'
css : 'rgb(255,0,0)'

CSS1 and CSS3 palettes are exported as maps
C64 and CGA palettes are exported as arrays

Most of the times colors are ready to use as in CSS:
this means r,g,b have 0-255 range but alpha 0-1

Colors in exported palettes are augmented to:
{
	name : 'red',
	r    : 255,        // 0-255 (as in CSS)
	g    : 0,          // 0-255 (as in CSS)
	b    : 0,          // 0-255 (as in CSS)
	a    : 1.0,        // 0-1   (as in CSS)
	v    : 0.6,        // 0-1   (gray value)
	hex  : '#FF0000',
	css  : 'rgb(255,0,0)'
	int  : 16711680
}

*/

// Convert r,g,b,a values to {r,g,b,a}
export function rgb(r,g,b,a=1.0) {
	return {r,g,b,a}
}

// Convert r,g,b,a values to {r,g,b,a}
export function hex(r,g,b,a=1.0) {
	return rgb2hex({r,g,b,a})
}

// Convert r,g,b,a values to 'rgb(r,g,b,a)'
export function css(r,g,b,a=1.0) {
	if (a === 1.0) return `rgb(${r},${g},${b})`
	// CSS3 (in CSS4 we could return rgb(r g b a))
	return `rgba(${r},${g},${b},${a})`}

// Convert {r,g,b,a} values to 'rgb(r,g,b,a)'
export function rgb2css(rgb) {
	if (rgb.a === undefined || rgb.a === 1.0) {
		return `rgb(${rgb.r},${rgb.g},${rgb.b})`
	}
	// CSS3 (in CSS4 we could return rgb(r g b a))
	return `rgba(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`
}

// Convert {r,g,b} values to '#RRGGBB' or '#RRGGBBAA'
export function rgb2hex(rgb) {

	let r = Math.round(rgb.r).toString(16).padStart(2, '0')
	let g = Math.round(rgb.g).toString(16).padStart(2, '0')
	let b = Math.round(rgb.b).toString(16).padStart(2, '0')

  	// Alpha not set
	if (rgb.a === undefined) {
		return '#' + r + g + b
	}

	let a = Math.round(rgb.a * 255).toString(16).padStart(2, '0')
	return '#' + r + g + b + a
}

// Convert {r,g,b} values to gray value [0-1]
export function rgb2gray(rgb) {
	return Math.round(rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722) / 255.0
}

// hex is not a string but an int number
export function int2rgb(int) {
	return {
		a : 1.0,
		r : int >> 16 & 0xff,
		g : int >>  8 & 0xff,
		b : int       & 0xff
	}
}

// export function int2hex(int) {
// 	return '#' + (int).toString(16)
// }

// https://www.c64-wiki.com/wiki/Color
const _C64 = [
	{ int : 0x000000, name : 'black' },       //  0
	{ int : 0xffffff, name : 'white' },       //  1
	{ int : 0x880000, name : 'red' },         //  2
	{ int : 0xaaffee, name : 'cyan' },        //  3
	{ int : 0xcc44cc, name : 'violet' },      //  4
	{ int : 0x00cc55, name : 'green' },       //  5
	{ int : 0x0000aa, name : 'blue' },        //  6
	{ int : 0xeeee77, name : 'yellow' },      //  7
	{ int : 0xdd8855, name : 'orange' },      //  8
	{ int : 0x664400, name : 'brown' },       //  9
	{ int : 0xff7777, name : 'lightred' },    // 10
	{ int : 0x333333, name : 'darkgrey' },    // 11
	{ int : 0x777777, name : 'grey' },        // 12
	{ int : 0xaaff66, name : 'lightgreen' },  // 13
	{ int : 0x0088ff, name : 'lightblue' },   // 14
	{ int : 0xbbbbbb, name : 'lightgrey' }    // 15
]

const _CGA = [
	{ int : 0x000000, name : 'black' },        //  0
	{ int : 0x0000aa, name : 'blue' },         //  1
	{ int : 0x00aa00, name : 'green' },        //  2
	{ int : 0x00aaaa, name : 'cyan' },         //  3
	{ int : 0xaa0000, name : 'red' },          //  4
	{ int : 0xaa00aa, name : 'magenta' },      //  5
	{ int : 0xaa5500, name : 'brown' },        //  6
	{ int : 0xaaaaaa, name : 'lightgray' },    //  7
	{ int : 0x555555, name : 'darkgray' },     //  8
	{ int : 0x5555ff, name : 'lightblue' },    //  9
	{ int : 0x55ff55, name : 'lightgreen' },   // 10
	{ int : 0x55ffff, name : 'lightcyan' },    // 11
	{ int : 0xff5555, name : 'lightred' },     // 12
	{ int : 0xff55ff, name : 'lightmagenta' }, // 13
	{ int : 0xffff55, name : 'yellow' },       // 14
	{ int : 0xffffff, name : 'white' }         // 15
]

// https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
const _CSS1 = [
	{ int : 0x000000, name : 'black' },
	{ int : 0xc0c0c0, name : 'silver' },
	{ int : 0x808080, name : 'gray' },
	{ int : 0xffffff, name : 'white' },
	{ int : 0x800000, name : 'maroon' },
	{ int : 0xff0000, name : 'red' },
	{ int : 0x800080, name : 'purple' },
	{ int : 0xff00ff, name : 'fuchsia' },
	{ int : 0x008000, name : 'green' },
	{ int : 0x00ff00, name : 'lime' },
	{ int : 0x808000, name : 'olive' },
	{ int : 0xffff00, name : 'yellow' },
	{ int : 0x000080, name : 'navy' },
	{ int : 0x0000ff, name : 'blue' },
	{ int : 0x008080, name : 'teal' },
	{ int : 0x00ffff, name : 'aqua' }
]

const _CSS2 = [..._CSS1,
	{int : 0xffa500, name :'orange'}
]

const _CSS3 = [..._CSS2,
	{ int : 0xf0f8ff, name : 'aliceblue' },
	{ int : 0xfaebd7, name : 'antiquewhite' },
	{ int : 0x7fffd4, name : 'aquamarine' },
	{ int : 0xf0ffff, name : 'azure' },
	{ int : 0xf5f5dc, name : 'beige' },
	{ int : 0xffe4c4, name : 'bisque' },
	{ int : 0xffebcd, name : 'blanchedalmond' },
	{ int : 0x8a2be2, name : 'blueviolet' },
	{ int : 0xa52a2a, name : 'brown' },
	{ int : 0xdeb887, name : 'burlywood' },
	{ int : 0x5f9ea0, name : 'cadetblue' },
	{ int : 0x7fff00, name : 'chartreuse' },
	{ int : 0xd2691e, name : 'chocolate' },
	{ int : 0xff7f50, name : 'coral' },
	{ int : 0x6495ed, name : 'cornflowerblue' },
	{ int : 0xfff8dc, name : 'cornsilk' },
	{ int : 0xdc143c, name : 'crimson' },
	{ int : 0x00ffff, name : 'aqua' },
	{ int : 0x00008b, name : 'darkblue' },
	{ int : 0x008b8b, name : 'darkcyan' },
	{ int : 0xb8860b, name : 'darkgoldenrod' },
	{ int : 0xa9a9a9, name : 'darkgray' },
	{ int : 0x006400, name : 'darkgreen' },
	{ int : 0xa9a9a9, name : 'darkgrey' },
	{ int : 0xbdb76b, name : 'darkkhaki' },
	{ int : 0x8b008b, name : 'darkmagenta' },
	{ int : 0x556b2f, name : 'darkolivegreen' },
	{ int : 0xff8c00, name : 'darkorange' },
	{ int : 0x9932cc, name : 'darkorchid' },
	{ int : 0x8b0000, name : 'darkred' },
	{ int : 0xe9967a, name : 'darksalmon' },
	{ int : 0x8fbc8f, name : 'darkseagreen' },
	{ int : 0x483d8b, name : 'darkslateblue' },
	{ int : 0x2f4f4f, name : 'darkslategray' },
	{ int : 0x2f4f4f, name : 'darkslategrey' },
	{ int : 0x00ced1, name : 'darkturquoise' },
	{ int : 0x9400d3, name : 'darkviolet' },
	{ int : 0xff1493, name : 'deeppink' },
	{ int : 0x00bfff, name : 'deepskyblue' },
	{ int : 0x696969, name : 'dimgray' },
	{ int : 0x696969, name : 'dimgrey' },
	{ int : 0x1e90ff, name : 'dodgerblue' },
	{ int : 0xb22222, name : 'firebrick' },
	{ int : 0xfffaf0, name : 'floralwhite' },
	{ int : 0x228b22, name : 'forestgreen' },
	{ int : 0xdcdcdc, name : 'gainsboro' },
	{ int : 0xf8f8ff, name : 'ghostwhite' },
	{ int : 0xffd700, name : 'gold' },
	{ int : 0xdaa520, name : 'goldenrod' },
	{ int : 0xadff2f, name : 'greenyellow' },
	{ int : 0x808080, name : 'grey' },
	{ int : 0xf0fff0, name : 'honeydew' },
	{ int : 0xff69b4, name : 'hotpink' },
	{ int : 0xcd5c5c, name : 'indianred' },
	{ int : 0x4b0082, name : 'indigo' },
	{ int : 0xfffff0, name : 'ivory' },
	{ int : 0xf0e68c, name : 'khaki' },
	{ int : 0xe6e6fa, name : 'lavender' },
	{ int : 0xfff0f5, name : 'lavenderblush' },
	{ int : 0x7cfc00, name : 'lawngreen' },
	{ int : 0xfffacd, name : 'lemonchiffon' },
	{ int : 0xadd8e6, name : 'lightblue' },
	{ int : 0xf08080, name : 'lightcoral' },
	{ int : 0xe0ffff, name : 'lightcyan' },
	{ int : 0xfafad2, name : 'lightgoldenrodyellow' },
	{ int : 0xd3d3d3, name : 'lightgray' },
	{ int : 0x90ee90, name : 'lightgreen' },
	{ int : 0xd3d3d3, name : 'lightgrey' },
	{ int : 0xffb6c1, name : 'lightpink' },
	{ int : 0xffa07a, name : 'lightsalmon' },
	{ int : 0x20b2aa, name : 'lightseagreen' },
	{ int : 0x87cefa, name : 'lightskyblue' },
	{ int : 0x778899, name : 'lightslategray' },
	{ int : 0x778899, name : 'lightslategrey' },
	{ int : 0xb0c4de, name : 'lightsteelblue' },
	{ int : 0xffffe0, name : 'lightyellow' },
	{ int : 0x32cd32, name : 'limegreen' },
	{ int : 0xfaf0e6, name : 'linen' },
	{ int : 0xff00ff, name : 'fuchsia' },
	{ int : 0x66cdaa, name : 'mediumaquamarine' },
	{ int : 0x0000cd, name : 'mediumblue' },
	{ int : 0xba55d3, name : 'mediumorchid' },
	{ int : 0x9370db, name : 'mediumpurple' },
	{ int : 0x3cb371, name : 'mediumseagreen' },
	{ int : 0x7b68ee, name : 'mediumslateblue' },
	{ int : 0x00fa9a, name : 'mediumspringgreen' },
	{ int : 0x48d1cc, name : 'mediumturquoise' },
	{ int : 0xc71585, name : 'mediumvioletred' },
	{ int : 0x191970, name : 'midnightblue' },
	{ int : 0xf5fffa, name : 'mintcream' },
	{ int : 0xffe4e1, name : 'mistyrose' },
	{ int : 0xffe4b5, name : 'moccasin' },
	{ int : 0xffdead, name : 'navajowhite' },
	{ int : 0xfdf5e6, name : 'oldlace' },
	{ int : 0x6b8e23, name : 'olivedrab' },
	{ int : 0xff4500, name : 'orangered' },
	{ int : 0xda70d6, name : 'orchid' },
	{ int : 0xeee8aa, name : 'palegoldenrod' },
	{ int : 0x98fb98, name : 'palegreen' },
	{ int : 0xafeeee, name : 'paleturquoise' },
	{ int : 0xdb7093, name : 'palevioletred' },
	{ int : 0xffefd5, name : 'papayawhip' },
	{ int : 0xffdab9, name : 'peachpuff' },
	{ int : 0xcd853f, name : 'peru' },
	{ int : 0xffc0cb, name : 'pink' },
	{ int : 0xdda0dd, name : 'plum' },
	{ int : 0xb0e0e6, name : 'powderblue' },
	{ int : 0xbc8f8f, name : 'rosybrown' },
	{ int : 0x4169e1, name : 'royalblue' },
	{ int : 0x8b4513, name : 'saddlebrown' },
	{ int : 0xfa8072, name : 'salmon' },
	{ int : 0xf4a460, name : 'sandybrown' },
	{ int : 0x2e8b57, name : 'seagreen' },
	{ int : 0xfff5ee, name : 'seashell' },
	{ int : 0xa0522d, name : 'sienna' },
	{ int : 0x87ceeb, name : 'skyblue' },
	{ int : 0x6a5acd, name : 'slateblue' },
	{ int : 0x708090, name : 'slategray' },
	{ int : 0x708090, name : 'slategrey' },
	{ int : 0xfffafa, name : 'snow' },
	{ int : 0x00ff7f, name : 'springgreen' },
	{ int : 0x4682b4, name : 'steelblue' },
	{ int : 0xd2b48c, name : 'tan' },
	{ int : 0xd8bfd8, name : 'thistle' },
	{ int : 0xff6347, name : 'tomato' },
	{ int : 0x40e0d0, name : 'turquoise' },
	{ int : 0xee82ee, name : 'violet' },
	{ int : 0xf5deb3, name : 'wheat' },
	{ int : 0xf5f5f5, name : 'whitesmoke' },
	{ int : 0x9acd32, name : 'yellowgreen' }
]

const _CSS4 = [..._CSS3,
	{ int: 0x663399, name : 'rebeccapurple'}
]


// Helper function
function augment(pal) {
	return pal.map(el => {
		const rgb = int2rgb(el.int)
		const hex = rgb2hex(rgb)
		const css = rgb2css(rgb)
		const v   = rgb2gray(rgb)
	 	return {...el, ...rgb, v, hex, css}
	})
}

// Helper function
function toMap(pal) {
	const out = {}
	pal.forEach(el => {
		out[el.name] = el
	})
	return out
}

export const CSS4 = toMap(augment(_CSS4))
export const CSS3 = toMap(augment(_CSS3))
export const CSS2 = toMap(augment(_CSS2))
export const CSS1 = toMap(augment(_CSS1))
export const C64  = augment(_C64)
export const CGA  = augment(_CGA)

