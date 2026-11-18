// palettes.js: The C64, CGA and EGA palettes and the CSS named colors

import { int2rgb, rgb2hex, rgb2css, rgb2gray } from './color.js'
import { CSS_COLORS } from '../core/css_colors.js'

// Entries: { name, int, r, g, b, a, gray, hex, css }.
// C64, CGA and EGA are arrays (in hardware order), the CSS palettes are maps by name: CSS4.tomato

// https://www.c64-wiki.com/wiki/Color
export const C64 = augment([
	{ int : 0x000000, name : 'black'      },
	{ int : 0xffffff, name : 'white'      },
	{ int : 0x880000, name : 'red'        },
	{ int : 0xaaffee, name : 'cyan'       },
	{ int : 0xcc44cc, name : 'violet'     },
	{ int : 0x00cc55, name : 'green'      },
	{ int : 0x0000aa, name : 'blue'       },
	{ int : 0xeeee77, name : 'yellow'     },
	{ int : 0xdd8855, name : 'orange'     },
	{ int : 0x664400, name : 'brown'      },
	{ int : 0xff7777, name : 'lightred'   },
	{ int : 0x333333, name : 'darkgrey'   },
	{ int : 0x777777, name : 'grey'       },
	{ int : 0xaaff66, name : 'lightgreen' },
	{ int : 0x0088ff, name : 'lightblue'  },
	{ int : 0xbbbbbb, name : 'lightgrey'  },
])

// The 16 colors of CGA (and the EGA default palette)
export const CGA = augment([
	{ int : 0x000000, name : 'black'        },
	{ int : 0x0000aa, name : 'blue'         },
	{ int : 0x00aa00, name : 'green'        },
	{ int : 0x00aaaa, name : 'cyan'         },
	{ int : 0xaa0000, name : 'red'          },
	{ int : 0xaa00aa, name : 'magenta'      },
	{ int : 0xaa5500, name : 'brown'        },
	{ int : 0xaaaaaa, name : 'lightgray'    },
	{ int : 0x555555, name : 'darkgray'     },
	{ int : 0x5555ff, name : 'lightblue'    },
	{ int : 0x55ff55, name : 'lightgreen'   },
	{ int : 0x55ffff, name : 'lightcyan'    },
	{ int : 0xff5555, name : 'lightred'     },
	{ int : 0xff55ff, name : 'lightmagenta' },
	{ int : 0xffff55, name : 'yellow'       },
	{ int : 0xffffff, name : 'white'        },
])

// The 64 colors of EGA, by index (rgbRGB bits: uppercase 0xaa, lowercase 0x55).
// The default 16 colors are the CGA palette
export const EGA = augment(Array.from({ length : 64 }, (_, i) => {
	const ch = (hi, lo) => (i & hi ? 0xaa : 0) + (i & lo ? 0x55 : 0)
	return { int : ch(4, 32) << 16 | ch(2, 16) << 8 | ch(1, 8), name : String(i) }
}))

// CSS named colors by level: CSS1 (16) to CSS4 (148)
export const CSS1 = css(1)
export const CSS2 = css(2)
export const CSS3 = css(3)
export const CSS4 = css(4)

function css(level) {
	const out = {}
	for (const [name, [int, l]] of Object.entries(CSS_COLORS)) {
		if (l <= level) out[name] = augment([{ int, name }])[0]
	}
	return out
}

function augment(pal) {
	return pal.map(e => {
		const c = int2rgb(e.int)
		return { ...e, ...c, gray : rgb2gray(c), hex : rgb2hex(c), css : rgb2css(c) }
	})
}
