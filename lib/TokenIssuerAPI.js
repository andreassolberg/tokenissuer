"use strict";

var 
	express   = require('express'),
	jwt = require('jsonwebtoken');






var TokenIssuerAPI = function(config) {

	this.config = config;
	this.init();
	this.setupRoute();
};

TokenIssuerAPI.prototype.init = function() {

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
		"subject": dataporten.userid
	};
	var token = jwt.sign(payload, this.config.sharedSecret, options);
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

	return this.router;

}

TokenIssuerAPI.prototype.getRoute = function() {
	return this.router;
}



exports.TokenIssuerAPI = TokenIssuerAPI;