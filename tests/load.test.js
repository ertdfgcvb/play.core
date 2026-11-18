import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import Load from '../src/modules/load.js'

test('text and json, errors reject', async () => {
	const server = createServer((req, res) => {
		if (req.url == '/a.json') return res.end('{"x":1}')
		if (req.url == '/a.txt') return res.end('abc')
		res.statusCode = 404
		res.end('not found')
	})
	await new Promise(r => server.listen(0, '127.0.0.1', r))
	const base = 'http://127.0.0.1:' + server.address().port
	assert.deepEqual(await Load.json(base + '/a.json'), { x : 1 })
	assert.equal(await Load.text(base + '/a.txt'), 'abc')
	await assert.rejects(Load.text(base + '/missing'), /404/)
	server.close()
})
