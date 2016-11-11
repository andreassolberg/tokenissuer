"use strict";

var
	config = require('config')

var bunyanRequest = require('bunyan-request');
var API 	= require('./lib/TokenIssuerAPI').TokenIssuerAPI;

var A = new API(config);
var requestLogger = bunyanRequest({
	logger: A.log,
	headerName: "x-request-id"
})

A.getTestToken()
	.then((token) => {
		console.log("Token", token)
	})
