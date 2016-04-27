"use strict";

var 
	express    = require('express'),
	bodyParser = require('body-parser'),
	config = require('config');


var FeideConnectAPI = require('feideconnectapi').FeideConnectAPI;
var app		= express();
var env 	= process.argv[2] || process.env.NODE_ENV || 'production';

var API 	= require('./lib/TokenIssuerAPI').TokenIssuerAPI;


var fc = new FeideConnectAPI({
    "password": config.get('feideconnect.key')
});




app.set('json spaces', 2);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000; // set our port


var A = new API({
    "sharedSecret": config.get('sharedSecret')
});

var fakeMiddleware = function(req, res, next) {
	req.headers.authorization = 'Basic ' + (new Buffer("feideconnect:" + config.get('feideconnect.key')).toString('base64'));
	req.headers['x-feideconnect-userid'] = '76a7a061-3c55-430d-8ee0-6f82ec42501f';
	req.headers['x-feideconnect-userid-sec'] = 'feide:andreas@uninett.no,feide:andreas2@uninett.no';
	req.headers['x-feideconnect-clientid'] = '610cbba7-3985-45ae-bc9f-0db0e36f71ad';
	next();
};

if (env === 'development') {
	console.log("Running in development mode with fake authentication middleware...")
	app.use('/api', fc.cors(), fakeMiddleware, fc.setup(), fc.policy({"requireUser": true}), A.getRoute());	
} else {
	app.use('/api', fc.cors(), fc.setup(), fc.policy({"requireUser": true}), A.getRoute());	
}



app.listen(port);
console.log('Magic happens on port ' + port);
