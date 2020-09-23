/**
@author No1
@title  Pyramids
@desc   Resize the window to modify the pattern
[header]
*/

const chars = '▁▂▃▄▅▆▇█▇▆▅▄▃▂▁ '.split('')

export function main(coord){
	const i = coord.index % chars.length
	return chars[i]
}
