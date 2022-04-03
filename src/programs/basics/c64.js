/**
[header]
@author ertdfgcvb
@title  C64
@desc   10 PRINT CHR$(205.5+RND(1)); : GOTO 10
See also:
https://10print.org/10_PRINT_121114.pdf
*/

// Run the program only once
export const settings = {
	once : true
}

export function main() {
	return Math.random() < 0.5 ? '╱' : '╲'
}
