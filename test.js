'use strict'

const specs = require('./specs.json')
const chai = require('chai')
const expect = require('chai').expect

chai.use(require('chai-http'))

const serverDomain = specs.server_domain
const listTest = specs.list_test
const dataTest = specs.test_data
// const access_token = specs.auth.access_token
var access_token = ""

function test (o) {
	const headers = o.headers
	const req = o.req
	const myit = o.it
	const timeout = o.timeout
	const mydescribe = o.describe
	const endpoint = o.endpoint
	const type = o.type
	const data = o.data
	const query = o.query
	const expects = o.expects
	const prints = o.prints
	describe(mydescribe, function () {
		this.timeout(timeout)
		it(myit, function () {
			let chaiReq = chai.request(serverDomain)
			if (type === 'POST') {
				chaiReq = chaiReq.post(endpoint)
			} else if (type === 'PUT') {
				chaiReq = chaiReq.put(endpoint)
			} else if (type === 'DELETE') {
				chaiReq = chaiReq.delete(endpoint)
			} else {
				chaiReq = chaiReq.get(endpoint)
			}

			if (headers) {
				for (let key in headers) {
					const header = headers[key].replace('<access_token>', access_token)
					chaiReq = chaiReq.set(key, header)
				}
			}

			if (data) {
				chaiReq = chaiReq.send(data)
			}
			if (query) {
				chaiReq = chaiReq.query(query)
			}
			return chaiReq
				.then(function (res) {
					for (let i in expects) {
						eval('expect' + expects[i])
					}
					for (let i in prints) {
						if (prints[i] === 'res.body.data.token') {
							access_token = eval(prints[i])
						}
						eval('console.log(' + prints[i] + ')')
					}
				})
				.catch(function (err) {
					throw err
				})
		})
	})
}

for (let index in listTest) {
	const x = dataTest[listTest[index]]
	let data = {}
	data.describe = x.describe
	data.timeout = x.timeout
	data.headers = x.headers
	for (let index in x.test) {
		data.it = x.test[index].it
		data.req = x.test[index].request
		data.endpoint = data.req.endpoint
		data.type = data.req.type
		data.data = data.req.data
		data.prints = data.req.prints
		const query = data.req.query
		if (query.length > 0) {
			for (let iQ in query) {
				data.expects = data.req.expects[iQ] // sesuai dengan urutan array
				data.query = query[iQ]
				test(data)
				// console.log(data)
			}
		} else {
			// console.log(data)
			test(data)
		}
	}
}
// process.exit(0)