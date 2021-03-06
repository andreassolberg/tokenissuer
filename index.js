"use strict";

var
	express    = require('express'),
	bodyParser = require('body-parser'),
	config = require('config');

var bunyanRequest = require('bunyan-request');
var DataportenAPI = require('dataportenapi').DataportenAPI;
var app		= express();

var API 	= require('./lib/TokenIssuerAPI').TokenIssuerAPI;

var fc = new DataportenAPI({
    "password": config.get('dataporten.key')
});

// console.log("Dataporten key", config.get('dataporten.key'));

app.set('json spaces', 2);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var A = new API(config);
var requestLogger = bunyanRequest({
	logger: A.log,
	headerName: 'x-request-id'
});


var fakeMiddleware = function(req, res, next) {
	req.headers.authorization = 'Basic ' + (new Buffer("dataporten:" + config.get('dataporten.key')).toString('base64'));
	req.headers['x-dataporten-userid'] = '76a7a061-3c55-430d-8ee0-6f82ec42501f';
	req.headers['x-dataporten-userid-sec'] = 'feide:andreas@uninett.no,feide:andreas2@uninett.no';
	req.headers['x-dataporten-clientid'] = '610cbba7-3985-45ae-bc9f-0db0e36f71ad';
	req.headers['x-dataporten-token'] = 'xxx';
	next();
};

console.log("ENVIRONEMNT VARIABELES");
console.log(process.env);
console.log("Config fakeMiddleware", config.get('fakeMiddleware'));


if (config.get('fakeMiddleware')) {
	console.log("Running in development mode with fake authentication middleware...");
	app.use('/api', fc.cors(), fakeMiddleware, fc.setup(), requestLogger, fc.policy({"requireUser": true}), A.getRoute());
} else {
	app.use('/api', fc.cors(), fc.setup(), requestLogger, fc.policy({"requireUser": true}), A.getRoute());
}


app.get('/', function(req, res) {
	res.send('OK!');
})
app.get('/.well-known/openid-configuration', (req, res) => {
	res.send(A.getOIConfig())
})
app.get('/openid/jwks', (req, res) => {
	var jwk = A.getJWKS()
	var d = {
		"keys": [jwk]
	}
	res.send(d)
})

var port = config.get('http.port');

app.listen(port);
console.log('Magic happens on port ' + port);
