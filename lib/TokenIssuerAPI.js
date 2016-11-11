"use strict";

var
	express   = require('express'),
	jwt = require('jsonwebtoken'),
	request = require('request'),
	fs = require('fs')
var pem2jwk = require('pem-jwk').pem2jwk
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

TokenIssuerAPI.prototype.getTestToken = function() {

	var x = {
		useridsec: ['feide:andreas@uninett.no'],
		scopes: [],
		userid: "d4fe622f-6958-4cd3-b68a-857a8f8a2439",
		clientid: "e4576831-4acb-417c-b82d-054318f6c8b7",
		accessToken: "b39a75d0-d5e0-482e-a47c-6bfa015286d7"
	}

	return this.getToken(x)

}

TokenIssuerAPI.prototype.getOIConfig = function() {
	var c = {
    "issuer": this.config.get('jwt.issuer'),
    "authorization_endpoint": "https://auth.dataporten.no/oauth/authorization",
    "token_endpoint": "https://auth.dataporten.no/oauth/token",
    "token_endpoint_auth_methods_supported": [
        "client_secret_basic",
        "client_secret_post"
    ],
    "token_endpoint_auth_signing_alg_values_supported": [
        "RS256"
    ],
    "userinfo_endpoint": "https://auth.dataporten.no/openid/userinfo",
    "ui_locales_supported": [
        "en",
        "no",
        "nb",
        "nn"
    ],
    "service_documentation": "https://docs.dataporten.no",
    "jwks_uri": this.config.get('jwt.issuer') + "openid/jwks",
    "response_types_supported": [
        "code",
        "id_token token"
    ],
    "subject_types_supported": [
        "public"
    ],
    "id_token_signing_alg_values_supported": [
        "RS256"
    ]
	}
	return c
}


TokenIssuerAPI.prototype.getJWKS = function() {
	var cert = fs.readFileSync(this.config.get('jwt.publicKeyFile'), "utf8")
	var jwks = pem2jwk(cert)
	jwks.kid = this.config.get('jwt.kid')
	jwks.x5c = cert
	return jwks
}

TokenIssuerAPI.prototype.getToken = function(dataporten) {

	var that = this
	var payload = {
		"userid-sec": dataporten.useridsec,
		"scopes": dataporten.scopes
	}
	var options = {
		"issuer": this.config.get('jwt.issuer'),
		"subject": dataporten.userid,
		"expiresIn": this.config.get('jwt.expiresIn'),
		"kid": this.config.get('jwt.publicKeyFile')
	}

	if (this.config.get('jwt.audience')) {
		options.audience = dataporten.clientid;
	}
	this.log.error("YAY", this.config.get('jwt.accessToken'))
	if (this.config.get('jwt.accessToken')) {
		payload.accesstoken = dataporten.accesstoken;
	}
	that.log.debug("token is", dataporten.accesstoken )


	return Promise.resolve()
		.then(() => {

			that.log.debug("Step 1", payload)

			if (that.config.get('jwt.groups') && dataporten.accesstoken) {
				that.log.debug("About to get groups", "using token " + dataporten.accesstoken )
				return that.getGroups(dataporten.accesstoken)
					.then((groups) => {
						that.log.debug("got groups", groups)
						payload.groups = groups;
					})
			}

		}).then((data) => {


			options.algorithm = "RS256"

			that.log.debug("Issuing a new token", payload)
			that.log.debug("Issuing a new token", {
				payLoad: payload,
				options: options,
				token: token,
				tokenFull: jwt.decode(token)
			});
			// var token = jwt.sign(payload, this.config.get('jwt.sharedSecret'), options);

			var pkey = null;
			if (this.config.get('jwt.privateKeyFile')) {
				pkey = fs.readFileSync(this.config.get('jwt.privateKeyFile'))
			} else if (this.config.get('jwt.privateKey')) {
				pkey = this.config.get('jwt.privateKey')
			} else {
				throw new Error("Could not find private key")
			}
			// console.log("Key", pkey)

			var token = jwt.sign(payload, pkey, options)

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

			console.log("REQUEST", JSON.stringify(req.headers, undefined, 2))
			var data = {}
			data.jwt = that.getToken(req.dataporten)
				.then((data) => {
						res.json(data)
				})
				.catch((err) => {
					res.json({})
				})

		});
	this.router.route('/public')
		.get((req, res) => {

			var cert = fs.readFileSync(this.config.get('jwt.publicKeyFile'))
			res.header("Content-Type", "text/plain")
			res.send(cert)

		})

	this.log.debug("TokenIssuerAPI route is setup.");

	return this.router;

}

TokenIssuerAPI.prototype.getRoute = function() {
	return this.router;
}



exports.TokenIssuerAPI = TokenIssuerAPI;
