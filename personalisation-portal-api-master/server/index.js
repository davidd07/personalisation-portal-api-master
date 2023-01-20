const express = require('express');
const initMiddleware = require('./middleware');
const config = require('./config');

const server = express();

initMiddleware({
	server,
	config
});

const hostname = server.get('hostname');
const port = server.get('port');

server.listen(port, function  () {
	console.log('Server listening on - http://' + hostname + ':' + port);
});
