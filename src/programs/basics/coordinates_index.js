/**
@author ertdfgcvb
@title  Coordinates: index
@desc   Use of coord.index
[header]
*/

// Global variables have scope in the whole module.
const pattern = '|▁|▂|▃|▄|▅|▆|▇|▆|▅|▄|▃|▂'

// Resize the browser window to modify the pattern.
export function main(coord, context) {
	const i = coord.index % pattern.length
	return pattern[i]
}
