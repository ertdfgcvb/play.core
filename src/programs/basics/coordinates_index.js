/**
[header]
@author ertdfgcvb
@title  Coordinates: index
@desc   Use of coord.index
*/

// Global variables have scope in the whole module.
const pattern = '| |.|,|:|;|x|K|Ñ|R|a|+|=|-|_'
// const pattern = '| |▁|▂|▃|▄|▅|▆|▇|▆|▅|▄|▃|▂|▁'

// Resize the browser window to modify the pattern.
export function main(coord, context, cursor, buffer) {
	const i = coord.index % pattern.length
	return pattern[i]
}
