'use strict';

const express = require('express');
const initMiddleware = require('./middleware');
const config = require('./config');

const server = express();

initMiddleware({
	server,
	config
});

module.exports = server;