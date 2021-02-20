/**
[header]
@author ertdfgcvb
@title  Donut
@desc   Ported from a1k0n’s donut demo.
https://www.a1k0n.net/2011/07/20/donut-math.html

This program writes directly into the frame buffer
in a sort of 'brute force' way:
theta and phi (below) must be small enough to fill
all the gaps.
*/

export const settings = { backgroundColor : 'whitesmoke' }

export function pre(context, cursor, buffer) {

	const TAU = Math.PI * 2

	const z = []
	const A = context.time * 0.0015
	const B = context.time * 0.0017

	const width  = context.cols
	const height = context.rows

	const centerX = width / 2
	const centerY = height / 2
	const scaleX  = 50
	const scaleY  = scaleX * context.metrics.aspect

	// Precompute sines and cosines of A and B
	const cA = Math.cos(A)
	const sA = Math.sin(A)
	const cB = Math.cos(B)
	const sB = Math.sin(B)

	// Clear the buffers
	const num = width * height
	for(let k=0; k<num; k++) {
		buffer[k].char = ' ' // char buffer
		z[k] = 0             // z buffer
	}

	// Theta (j) goes around the cross-sectional circle of a torus
	for(let j=0; j<TAU; j+=0.05) {

		// Precompute sines and cosines of theta
		const ct = Math.cos(j)
		const st = Math.sin(j)

		// Phi (i) goes around the center of revolution of a torus
		for(let i=0; i<TAU; i+=0.01) {

			// Precompute sines and cosines of phi
			const sp = Math.sin(i)
			const cp = Math.cos(i)

			// The x,y coordinate of the circle, before revolving
			const h = ct+2                // R1 + R2*cos(theta)
			const D = 1/(sp*h*sA+st*cA+5) // this is 1/z
			const t = sp*h*cA-st*sA

			// Final 3D (x,y,z) coordinate after rotations
			const x = 0 | (centerX + scaleX*D*(cp*h*cB-t*sB))
			const y = 0 | (centerY + scaleY*D*(cp*h*sB+t*cB))
			const o = x + width * y

			// Range 0..11 (8 * sqrt(2) = 11.3)
			const N = 0 | (8*((st*sA-sp*ct*cA)*cB-sp*ct*sA-st*cA-cp*ct*sB))
			if(y<height && y>=0 && x>=0 && x<width && D>z[o]) {
				z[o] = D
				buffer[o].char = '.,-~:;=!*#$@'[N > 0 ? N : 0]
			}
		}
	}
}

import { drawInfo } from '/src/modules/drawbox.js'
export function post(context, cursor, buffer) {
	drawInfo(context, cursor, buffer, {
		color : 'white', backgroundColor : 'royalblue', shadowStyle : 'gray'
	})
}
