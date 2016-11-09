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


Environment variables


	NODE_ENV=development
	NODE_ENV=production
	PORT=2234 
	JWT_SECRET=blah 
	DATAPORTEN_KEY=123 


Get an token:

	clear; curl -i http://localhost:3000/api/




## Deploy on kubernetes

	kubectl create -f etc/secrets.yaml
	kubectl create -f etc/deployment.json 
	kubectl create -f etc/service.json