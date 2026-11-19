# play.core

Core of the [ASCII Playground](https://play.ertdfgcvb.xyz): the program runner, the renderers and the modules.

> **v2** is a rewrite of the runner, with breaking changes in the API (see [Changes](#changes)).
> v1 is archived on the [`v1`](https://github.com/ertdfgcvb/play.core/tree/v1) branch (tag `v1.1`).
> Programs saved on the playground with v1 keep running with the v1 runner.

## About

[This playground](https://play.ertdfgcvb.xyz) is an attempt of a browser-based live-code environment with text-only output.\
It is born from the joy and pleasure ASCII, ANSI and in general text-based art can give and it is an homage to all the artists, poets and designers which used and use text as their medium.\
From the design perspective it is also an exercise in reduction: there is almost no interface, just a preview window, a code editor and a console; margins are removed as well and line numbers can be hidden.\
All the possible interactions are handled by a few hotkeys and a console with a handful of commands (`man` lists them); feedback is given in the console as well.\
The API follows a similar philosophy: the problem is not complex (the whole program is basically a loop) and the exposed features are just the essential ones. Eventually some extra functionality can be imported through ES6 modules (see [Modules](#modules)).\
Finally, programs can be saved in the browser’s local storage (the Local Storage Directory, command `lsd`) or uploaded to this playground and shared through a permalink. In favour of a frictionless experience no credentials are asked and no account is needed to store a program on the server.\
Programs can also be written together with an AI agent: [llms.txt](https://play.ertdfgcvb.xyz/llms.txt) describes the API for language models (the command `llm` shows how).\
The project will stay up until it breaks.

## Background

The API is inspired by GLSL programming/rasterisation: instead of thinking in geometric primitives painted on a canvas this approach enforces to write a single function which will be invoked against each cell, an approach not so different from fragment shaders.\
If the number of “fragment” operations is low common shader techniques can be used even in (comparably slow) JavaScript: a maximised browser window on a typical laptop screen holds about 5-8000 monospaced characters. Even a low performing computer can do enough computation on this amount of characters, at 30 frames per second.\
By default the output is rendered as text inside a DOM element; a canvas renderer is available as well (WebGL and terminal renderers are planned).

## Install

Browser, with an import map (no build step):

```html
<script type="importmap">
{
	"imports": {
		"@ertdfgcvb/play"  : "https://cdn.jsdelivr.net/npm/@ertdfgcvb/play/src/run.js",
		"@ertdfgcvb/play/" : "https://cdn.jsdelivr.net/npm/@ertdfgcvb/play/src/modules/"
	}
}
</script>
```

Node or bundlers:

```
npm install @ertdfgcvb/play
```

## Programs

Programs are ES6 modules. All code is sealed inside the module and there are no globals.
External modules can be imported, also with top-level `await`: the runner starts once the module is loaded.
A program can export three optional functions:

- `pre(context)` is called *once per frame*, before `main`;
  it can be used to prepare data (for example bitmaps, webcam data or simulations).
- `main(coord, context)` is called *once per cell*;
  it returns a single character, or an object (see [the return value](#the-return-value-of-main)).
- `post(context)` is called *once per frame*, after `main`, just before rendering;
  it can be used to draw over the buffer (for example a window overlay).

Plus the event handlers `pointerMove`, `pointerDown`, `pointerUp`, `keyDown` and `keyUp`, called with `(context, event)` at the start of a frame.

Smallest program possible (with an output):

```js
export function main() {
	return '?'
}
```

Cell coordinates:

```js
export function main(coord) {
	return String.fromCharCode((coord.y + coord.x) % 32 + 65)
}
```

Timing:

```js
export function main(coord, context) {
	const f = context.frame
	return String.fromCharCode((coord.y + coord.x + f) % 32 + 65)
}
```

A density map:

```js
const density = 'ABCxyz '

export function main(coord, { time }) {
	const t = time * 0.0001
	const { x, y } = coord
	const o = Math.sin(y * Math.sin(t) * 0.2 + x * 0.04 + t) * 20
	const i = Math.round(Math.abs(x + y + o)) % density.length
	return density[i]
}
```

Loading before the start, with top-level `await`:

```js
import { Pixels, loadImage } from '@ertdfgcvb/play/pixels.js'

const img = await loadImage('photo.png')
const px = new Pixels()

export function pre({ cols, rows, metrics }) {
	px.resize(cols, rows).cover(img, metrics.aspect)
}

export function main(coord) {
	return px.data[coord.index].gray > 0.5 ? '#' : ' '
}
```

### Signatures

```js
function pre (       context) {} // every frame
function main(coord, context) {} // every cell, returns the cell content
function post(       context) {} // every frame

function pointerDown(context, event) {} // also pointerMove, pointerUp, keyDown, keyUp
```

`coord` holds the coordinates of the cell; the same object is reused for every cell.

```js
const coord = {
	x,      // column of the cell (starting top left)
	y,      // row of the cell
	index,  // index of the cell: x + y * cols
}
```

`context` holds everything about the current frame.
It is frozen: a new one is created each frame. `buffer` and `data` are mutable.

```js
const context = {
	frame,          // frame number, starts at 0
	time,           // time in ms, pauses excluded
	dt,             // ms since the previous frame
	cols,           // number of columns
	rows,           // number of rows
	width,          // width of the output element (px)
	height,         // height of the output element (px)
	metrics : {
		cellWidth,  // width of a cell (px, fractional)
		lineHeight, // height of a cell (px)
		aspect,     // cellWidth / lineHeight
		fontFamily, // CSS string
		fontSize,   // px
	},
	cursor,         // pointer, see below
	keys,           // Set of the keys currently pressed (event.key)
	buffer,         // the cells, see below
	data,           // the data object passed to run()
	settings,       // the resolved settings
	fps,            // measured frame rate
}
```

The font is defined via CSS; a monospaced font is assumed but not mandatory.
The aspect ratio of a cell (`metrics.aspect`) allows to correct the geometry of the rendered images.

`cursor` is the pointer position in cells. `x` and `y` are fractional, for greater precision.

```js
const cursor = {
	x,          // column of the cell hovered
	y,          // row of the cell hovered
	pressed,    // pointer is pressed (boolean)
	prev : {    // cursor of the previous frame
		x,
		y,
		pressed,
	},
}
```

Events carry the pointer in cells as well:

```js
const event = { type, x, y, key, code, button, repeat }
```

### The return value of main()

`main()` returns a single char, or an object with the following fields:

```js
const out = {
	char,            // the char to be rendered
	color,           // the foreground color (CSS string)
	backgroundColor, // the background color (CSS string)
	fontWeight,      // the font weight (CSS value)
}
```

Missing fields keep the default.
Returning nothing (`undefined`, `null`, `''`) leaves the cell as it is, for example as drawn in `pre()`.

### The buffer

`context.buffer` holds the cells: `{ char, color, backgroundColor, fontWeight }`, plus `width`, `height` and `data` (the flat array).
It can be drawn in `pre()` and (especially) in `post()`.
Writes are merged into the cells: a value is a char or a partial cell.

```js
export function post({ buffer }) {
	buffer.set(2, 1, 'A')
	buffer.set(3, 1, { char : 'B', color : 'red' })
	buffer.fillRect(2, 3, 10, 2, { backgroundColor : 'royalblue' })
	const c = buffer.get(2, 1) // { char : 'A', ... }
}
```

With a `main()` the buffer is cleared at the start of each frame, before `pre()`.
Without a `main()`, or with `settings.clear : false`, the buffer persists from one frame to the next.

### Data

Data lives in module variables. Arrays sized to the output are reset when the size changes:

```js
const heat = []

export function pre({ cols, rows }) {
	if (heat.length != cols * rows) {
		heat.length = cols * rows
		heat.fill(0)
	}
	// ...
}

export function main(coord) {
	return heat[coord.index] > 0.5 ? '#' : ' '
}
```

A module is evaluated once per page: the same program running twice shares its module variables, unless it is passed to `run()` as a URL (see [Running](#running)).
A program that keeps its state in the buffer sets `clear : false` and reads `context.buffer.data`.

## Settings

A program can export a `settings` object; options passed to `run()` override it.
Order of precedence: defaults < `program.settings` < `run()` options.

```js
export const settings = {
	element         : null,   // target element, created if missing
	renderer        : 'dom',  // 'dom', 'canvas', null (headless), or a renderer function
	cols            : 0,      // number of columns, 0 is 'auto'
	rows            : 0,      // number of rows, 0 is 'auto'
	fps             : 30,     // fps capping, 0 is uncapped (vsync)
	once            : false,  // render a single frame
	autoStart       : true,   // start the loop when run() is called
	pauseOffscreen  : true,   // pause while the element is out of view
	allowSelect     : false,  // allows selection of the rendered element
	clear           : true,   // clears the buffer each frame (with main)
	startTime       : 0,      // initial time (ms)
	startFrame      : 0,      // initial frame
	data            : null,   // object available as context.data

	// CSS settings for the output element (override the document CSS)
	backgroundColor : '',
	color           : '',
	fontFamily      : '',
	fontSize        : '',
	fontWeight      : '',
	letterSpacing   : '',
	lineHeight      : '',
	textAlign       : '',
}
```

## Running

```js
import { run } from '@ertdfgcvb/play'
import * as program from './program.js'

const h = await run(program, { element : document.querySelector('pre'), fps : 60 })
```

`run()` resolves after the first frame (or right away with `autoStart : false`) and rejects on errors in the first frame.
It returns a handle:

```js
h.start()             // start or resume the loop
h.pause()
h.stop()              // for good: removes listeners, disposes the renderer
h.step(n)             // render n frames right away (fixed dt)
h.text()              // the current frame as plain text
h.snapshot(format)    // Promise<Blob>, see below
h.onerror = e => {}   // errors after the first frame; the instance stops
h.context             // the last context
h.buffer
h.element
h.state               // 'idle', 'running', 'paused', 'stopped'
h.program             // the program module
```

Multiple instances can run on the same page, with a single loop.

```html
<pre id="a"></pre>
<canvas id="b"></canvas>

<script type="module">
	import { run } from '@ertdfgcvb/play'
	import * as flame from './flame.js'
	import * as cursor from './cursor.js'

	await run(flame, { element : document.querySelector('#a') })
	await run(cursor, { element : document.querySelector('#b'), renderer : 'canvas' })
</script>
```

A program can also be passed as a URL (relative to the page, or to the working directory in Node).
Each run then imports its own copy of the module: module variables are not shared between runs.
With a module object (as above) the same program running twice shares its module variables.

```js
await run('./flame.js', { element : document.querySelector('#a') })
await run('./flame.js', { element : document.querySelector('#b') }) // independent
```

Headless (Node, tests): no output, the frames are read from the handle.

```js
const h = await run(program, { renderer : null, cols : 80, rows : 24, autoStart : false })
h.step(10)
console.log(h.text())
```

## Renderers

| Renderer   | Element               | Snapshots              |
|------------|-----------------------|------------------------|
| `'dom'`    | any text element, `<pre>` by default | `txt`, `html`, `png` |
| `'canvas'` | `<canvas>`, or any element (a canvas is created inside) | `txt`, `png` |
| `null`     | none (headless)       | `txt`                  |

A renderer is a function `(element, settings)` returning (or resolving to) an object:

```js
{
	element,          // the output element, also the pointer target
	measure(),        // { cols, rows, width, height, metrics }
	render(context, buffer),
	snapshot(format), // optional, Promise<Blob>
	dispose(),
}
```

## Modules

Optional tools, imported from `@ertdfgcvb/play/<name>.js`. The list is also in [`modules.json`](src/modules/modules.json); the functions are documented in the [modules](src/modules) themselves.

| Module | |
|--------|-|
| `block.js`    | Blocks of text and art, written into the buffer |
| `camera.js`   | Webcam as a video element (async) |
| `color.js`    | Color conversions, CSS color parsing, mixing and palette matching |
| `grid.js`     | 2D grid with sampling, wrapping and transforms |
| `num.js`      | GLSL scalar functions and numeric helpers |
| `palettes.js` | The C64, CGA and EGA palettes and the CSS named colors |
| `pixels.js`   | Pixels of a video, image or canvas at grid size; `loadImage()` |
| `sort.js`     | Sorts chars by ink coverage in a given font (async) |
| `text.js`     | String tools: dedent, measure, wrap, align, truncate |
| `vec2.js`, `vec3.js` | Vector functions, GLSL style |
| `window.js`   | Boxes, panels with title and text, Desktop (window manager), debug info text |

Functions are named exports, classes (`Grid`, `Pixels`, `Desktop`) are used with `new`.
`camera.js` also has a default export: `import Camera from '@ertdfgcvb/play/camera.js'`.

Shader ports: `num.js`, `vec2.js` and `vec3.js` follow GLSL names and semantics (`mod` is floored, `vec2(1)` fills all the components, `mul(v, 2)` takes a number).
The rest maps to `Math`:

```js
const { abs, floor, sin, cos, min, max, pow } = Math
```

Text and art (`block.js`): a block is a `Grid` of chars, indented template literals are dedented, spaces are transparent (`null`).

```js
import { block, write } from '@ertdfgcvb/play/block.js'

const art = block(`
	╔══╦══╗ ┌──┬──┐ ╭──┬──╮ ┏━━┳━━┓
	║┌─╨─┐║ │╔═╧═╗│ │╒═╪═╕│ ┃┌─╂─┐┃
	║│╲ ╱│║ │║╲╲╲║│ ││ │ ││ ┃│ ╿ │┃
	╠╡ ╳ ╞╣ ├╢╱╱╱╟┤ ├┼─┼─┼┤ ┣┿╾┼╼┿┫
	║│╱ ╲│║ │║╲╲╲║│ ││ │ ││ ┃│ ╽ │┃
	║└─╥─┘║ │╚═╤═╝│ │╘═╪═╛│ ┃└─╂─┘┃
	╚══╩══╝ └──┴──┘ ╰──┴──╯ ┗━━┻━━┛
`)

export function main(coord, { frame }) {
	return art.get(coord.x - 4, coord.y - 2) ?? '.:'[(coord.x + coord.y + frame) % 2]
}

export function post(context) {
	write(context, 'frame ' + context.frame, 2, 0, { color : 'red' })
}
```

Windows (`window.js`): draggable, closable, with a style of their own. The content is text, a block, a function of `context`, or a program running inside the window.

```js
import { Desktop } from '@ertdfgcvb/play/window.js'

const desk = new Desktop({ shadow : 'gray' })
desk.info()
desk.open({ x : 30, y : 4, title : 'note', backgroundColor : 'tomato', content : 'Drag me' })
desk.open({ x : 4, y : 12, width : 40, height : 12, title : 'flame', content : new URL('./flame.js', import.meta.url) })

export function post(context) {
	desk.update(context)
}
```

Images and camera (`pixels.js`): chained steps, then the pixels `{ r, g, b, a, gray }` per cell.

```js
import Camera from '@ertdfgcvb/play/camera.js'
import { Pixels } from '@ertdfgcvb/play/pixels.js'

const cam = await Camera.init()
const px = new Pixels()

export function pre({ cols, rows, metrics }) {
	px.resize(cols, rows).cover(cam, metrics.aspect).flipX().normalize()
}

export function main(coord) {
	return ' .:-=+*#%@'[Math.floor(px.data[coord.index].gray * 9)]
}
```

## Examples

The examples are in [`src/programs`](src/programs).
[`pages/directory.html`](pages/directory.html) links all of them, [`pages/run.html`](pages/run.html) runs one: `run.html?demos/plasma`.
[`pages/single.html`](pages/single.html) and [`pages/multi.html`](pages/multi.html) show how to embed one or more programs.

## Repository

```
src/run.js        the runner
src/core/         buffer, input, scheduler, styles
src/renderers/    dom, canvas
src/modules/      the modules
src/programs/     the examples
pages/            browser pages (directory, run, embedding, desktop, font, benchmarks)
test/             unit tests: npm test
tools/            npm run list: regenerates pages/directory.html and src/programs/programs.json
```

## Notes

### Performance

The DOM renderer writes the buffer by row, and only the rows that changed. Frequent *horizontal* changes in weight, color or background will slow down the rendering considerably: each change in style wraps the characters in an inline `<span>`, augmenting the complexity of the DOM tree.
The canvas renderer is faster for programs with many style changes.

### Fonts

The playground uses two fonts: Simple Console (a custom version of LL Simple) and Riforma Mono, both © [Norm](https://norm.to) / [Lineto](https://lineto.com).
They are proprietary, licensed to ertdfgcvb.xyz, and not part of this repository: the pages load them from `css/` (not included) and fall back to the default monospace font.
Any monospaced font works; the metrics are measured at runtime.

### Browsers

During v1 development five bugs have been submitted to WebKit (status as of November 2026):

- [217047](https://bugs.webkit.org/show_bug.cgi?id=217047): `document.fonts.ready` is resolved too quickly in first run of module. Open.
- [218275](https://bugs.webkit.org/show_bug.cgi?id=218275): Web Inspector: error line number missing when code is a module. Open.
- [218284](https://bugs.webkit.org/show_bug.cgi?id=218284): Error event not captured when error originates in module. Fixed (2022).
- [225695](https://bugs.webkit.org/show_bug.cgi?id=225695): Fractional CSS line-height value translates to rounded (floored) element height. Open.
- [240213](https://bugs.webkit.org/show_bug.cgi?id=240213): `measureText()` returns TextMetrics with rounded values for the bounding box. Fixed (2025).

v2 avoids the open font and metrics issues: the used font face is loaded explicitly and the cell size is measured on a block of text instead of the computed line-height.

## Changes

### 2.0

| v1 | v2 |
|----|----|
| `main(coord, context, cursor, buffer, data)` | `main(coord, context)` |
| `pre(context, cursor, buffer, data)`, `post(...)` | `pre(context)`, `post(context)` |
| `boot()` | removed: top-level `await` in the module |
| `run()` returns a promise | `run()` is async and returns a handle |
| `context.runtime.fps` | `context.fps` |
| `cursor.p` | `cursor.prev` |
| buffer: array of cells | `buffer.get()`, `buffer.set()`: writes are merged |
| `renderer : 'text'` | `renderer : 'dom'` |
| `restoreState` | `startTime`, `startFrame` |
| `canvasSize`, `canvasOffset` | removed: the canvas follows its CSS size |
| program settings override run() settings | run() options override program settings |
| `calcMetrics()`, `copyContent()` | removed: `context.metrics`, `h.text()` |
| first frame is 1 | first frame is 0 |
| `/src/modules/...` imports | `@ertdfgcvb/play/...` (import map or npm) |
| `drawBox()`, `drawInfo()` (drawbox.js) | `panel()`, `Desktop`, `desk.info()` (window.js) |
| `buffer.js`, `string.js` | `block.js` (`block()`, `write()`), `text.js` |
| `canvas.js`, `image.js` | `pixels.js`: `px.resize(w, h).cover(src, aspect)...`, `loadImage()` |
| `mirrorX()`, `writeTo(data)` | `flipX()`, `px.data` |
| `load.js` | `loadImage()`, `fetch()` |
| `Camera.init()` returns a video at once | `await Camera.init()`: resolves when the camera plays |
| `sort()` | `await sort()`: waits for the font |
| vec2 / vec3: `norm`, `dist`, `addN`, `mulN`... | `normalize`, `distance`, `add`, `mul`... (a number as second argument) |
| num: `mod()` is `%` | `mod()` is floored, as GLSL |
| palettes in `color.js`, `v` for gray | `palettes.js`, `gray` |
| `sdf.js`, `exportframe.js`, `filedownload.js` | removed (frames: `h.step()` and `h.snapshot()`) |
| `fps` is a cap only | `fps : 0` is uncapped (vsync) |

Also: one loop for all instances, pause when offscreen, headless mode, snapshots, key events, programs as URLs, programs inside windows, HTML escaping in the DOM renderer, faster canvas renderer, better metrics.

## Contributors

An incomplete list of enthusiasts and testers which contributed with invaluable help, feedback and ideas:
Alex Miller, iamelizasj, masshuudojo, Maxwell Neely-Cohen, nkint, raurir, Romain Cazier, xpktro, zspotter.

## License

[Apache License 2.0](LICENSE)

Winter, 2020
