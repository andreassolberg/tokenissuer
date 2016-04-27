# TokenIssuer JWT MicroService for use with Dataporten

Add `config/default.json`:

	{
		"feideconnect": {
			"key": "lsdkfjlsdkfj-sdfdsf-sdfsdf-sdfsdf"
		},
		"sharedSecret": "blah"
	}

Test with:

	NODE_ENV=development npm start


Get an token:

	clear; curl -i http://localhost:3000/api/

	