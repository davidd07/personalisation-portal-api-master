'use strict'
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./server/serverless')
const binaryMimeTypes = [
	'application/octet-stream',
	'font/eot',
	'font/opentype',
	'font/otf',
	'image/jpeg',
	'image/png',
	'image/svg+xml'
]
const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
exports.handler = (event, context) => {
	console.log('EVENT', event)
	console.log('CONTEXT',context)
	return awsServerlessExpress.proxy(server, event, context)
}