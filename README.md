# TokenIssuer JWT MicroService for use with Dataporten

Add `config/default.json`:

	{
		"feideconnect": {
			"key": "lsdkfjlsdkfj-sdfdsf-sdfsdf-sdfsdf"
		},
		"sharedSecret": "blah"
	}

Test with:




	JWT_PRIVATE_KEY_FILE=/Users/andreas/wc/fc/ti/var/private.pem NODE_ENV=development npm start

	JWT_PUBLIC_KEY_FILE=/Users/andreas/wc/fc/ti/var/public.pem JWT_PRIVATE_KEY_FILE=/Users/andreas/wc/fc/ti/var/private.pem NODE_ENV=development npm start | bunyan -L


Environment variables

```
NODE_ENV=development
NODE_ENV=production
PORT=2234
JWT_SECRET=blah
DATAPORTEN_KEY=123
```

Get an token:

	clear; curl -i http://localhost:3000/api/




## Deploy on kubernetes

```
kubectl create -f etc/secrets.yaml
kubectl create -f etc/deployment.json
kubectl create -f etc/service.json
```

# Generate keypair

```
openssl genrsa -out private.pem 1024
openssl rsa -in private.pem -pubout > public.pem
```
