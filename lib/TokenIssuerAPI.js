"use strict";

var
	express   = require('express'),
	jwt = require('jsonwebtoken'),
	request = require('request')

var bunyan = require('bunyan')



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

TokenIssuerAPI.prototype.getToken = function(dataporten, accessToken) {

	var that = this
	var payload = {
		"userid-sec": dataporten.useridsec,
		"scopes": dataporten.scopes
	}
	var options = {
		"issuer": "https://auth.dataporten.no",
		"subject": dataporten.userid,
		"expiresIn": this.config.get('jwt.expiresIn')
	}

	if (this.config.get('jwt.audience')) {
		options.audience = dataporten.clientid;
	}
	this.log.error("YAY", this.config.get('jwt.accessToken'))
	if (this.config.get('jwt.accessToken')) {
		payload.accesstoken = dataporten.accesstoken;
	}


	return Promise.resolve()
		.then(() => {

			that.log.debug("Step 1", payload)

			if (that.config.get('jwt.groups')) {
				that.log.debug("About to get groups")
				return that.getGroups(dataporten.accesstoken)
					.then((groups) => {
						that.log.debug("got groups", groups)
						payload.groups = groups;
					})
			}

		}).then((data) => {
			that.log.debug("Issuing a new token", payload)
			that.log.debug("Issuing a new token", {
				payLoad: payload,
				options: options,
				token: token,
				tokenFull: jwt.decode(token)
			});
			var token = jwt.sign(payload, this.config.get('jwt.sharedSecret'), options);
			return token
		}).catch((err) => {
			console.error("--- ERROR", err)
		})


}

TokenIssuerAPI.prototype.getGroups = function(accessToken) {
	var that = this;
	return new Promise(function(resolve, reject) {

		var endpoint = 'https://groups-api.dataporten.no/groups/me/groups'
		var opts = {
			"json": true,
			"method": "GET",
			"auth": {
				"bearer": accessToken
			},
			"headers": {
				'User-Agent': 'tokenissuer v/1.0.0'
			}
		};

		request(endpoint, opts, function (error, response, body) {
			if (error) {
				return reject(error);
			}
			if (response.statusCode < 200 || response.statusCode > 299) {
				console.log(JSON.stringify(response, undefined, 2));
				console.log(body);
				return reject("Error. Status code " + response.statusCode);

			}

			var gids = body.map((item) => {
				return item.id
			})
			// console.log(JSON.stringify(body, undefined, 2))
			// console.log(JSON.stringify(gids, undefined, 2))
			resolve(gids);
		});
	})
	.catch(function(err) {
		console.error("ERROR");
		console.error(err);
	});

}

TokenIssuerAPI.prototype.setupRoute = function() {

	var that = this;

	this.router = express.Router();
	this.router.route('/')
		.get(function(req, res) {
			// console.log(req.feideconnect)
			var data = {}
			data.jwt = that.getToken(req.dataporten)
				.then((data) => {
						res.json(data)
				})
				.catch((err) => {
					res.json({})
				})

		});

	this.log.debug("TokenIssuerAPI route is setup.");

	return this.router;

}

TokenIssuerAPI.prototype.getRoute = function() {
	return this.router;
}



exports.TokenIssuerAPI = TokenIssuerAPI;
