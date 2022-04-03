/**
[header]
@author ertdfgcvb
@title  C64
@desc   10 PRINT CHR$(205.5+RND(1)); : GOTO 10
See also:
https://10print.org
*/

// Run the program only once
export const settings = {
	once : true
}

export function main() {
	// Also try: ╩ ╦ or ▄ ░
	// or any combination from
	// https://play.ertdfgcvb.xyz/abc.html#font:characterset
	return Math.random() < 0.5 ? '╱' : '╲'
}
