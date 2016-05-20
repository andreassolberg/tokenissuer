"use strict";

var 
	express   = require('express'),
	jwt = require('jsonwebtoken');

var bunyan = require('bunyan');



var TokenIssuerAPI = function(config) {

	this.config = config;
	this.init();
	this.setupRoute();
};

TokenIssuerAPI.prototype.init = function() {
	var that = this;
	this.log = bunyan.createLogger({
		"name": "TokenIssuer",
		"level": that.config.get('logging.level')
	});
}

TokenIssuerAPI.prototype.sendNotFound = function(res) {
	res.status(404).json({
		"message": "Did not found object"
	});
}

TokenIssuerAPI.prototype.getToken = function(dataporten) {


	var payload = {
		"userid-sec": dataporten.useridsec,
		"scopes": dataporten.scopes
	};
	var options = {
		"issuer": "https://auth.dataporten.no",
		"subject": dataporten.userid,
		"expiresIn": this.config.get('jwt.expiresIn')
	};

	if (this.config.get('jwt.audience')) {
		options.audience = dataporten.clientid;
	}
	if (this.config.get('jwt.accessToken')) {
		payload.accesstoken = dataporten.accesstoken;
	}
	if (this.config.get('jwt.groups')) {
		options.audience = dataporten.clientid;
	}

	var token = jwt.sign(payload, this.config.get('jwt.sharedSecret'), options);

	this.log.debug("Issuing a new token", {
		payLoad: payload,
		options: options,
		token: token,
		tokenFull: jwt.decode(token)
	});
	return token;
}

TokenIssuerAPI.prototype.setupRoute = function() {

	var that = this;

	this.router = express.Router();
	this.router.route('/')
	.get(function(req, res) {
		// console.log(req.feideconnect);
		var data = {};
		data.jwt = that.getToken(req.feideconnect);
		res.json(data);
		
	});

	this.log.debug("TokenIssuerAPI route is setup.");

	return this.router;

}

TokenIssuerAPI.prototype.getRoute = function() {
	return this.router;
}



exports.TokenIssuerAPI = TokenIssuerAPI;