/**
@author ertdfgcvb
@title  Desktop
@desc   Demos running in multiple windows
*/

import { Desktop } from '@ertdfgcvb/play/window.js'

// From the path of the modules: in the editor the program runs from a blob URL
const example = name => new URL('../programs/' + name + '.js', import.meta.resolve('@ertdfgcvb/play/window.js'))
const desk = new Desktop({ shadow : 0.2, paddingX : 0, paddingY : 0 })

// Modules to load and run in windows on the desktop
const windows = [
	['basics/10print',                { color : 'black', backgroundColor : 'gold' }],
	['demos/chromaspiral',            { color : 'black', backgroundColor : 'white' }],
	['contributed/equal_tea_talk',    { color : 'white', backgroundColor : 'royalblue' }],
	['contributed/stacked_sin_waves', { color : 'black', backgroundColor : 'lightpink' }],
	['sdf/balls',                     { color : 'white', backgroundColor : 'seagreen' }],
]

// Sizing and positioning the windows on the desktop
windows.forEach(([name, style], i) => {
	desk.open({
		x       : 4 + i * 6,
		y       : 2 + i * 3,
		width   : 68,
		height  : 24,
		title   : name.split('/')[1],
		content : example(name),
		...style
	})
})

export function main(coord) {
	// Background pattern for the desktop
	return (coord.x + coord.y) % 2 ? '·' : ' '
}

export function post(context) {
	// All the windows are drawn in the Desktop class,
	// so we just need to call its update method here
	desk.update(context)
}
