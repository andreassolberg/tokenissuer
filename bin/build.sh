#! /bin/bash

VERSION="1.1.6"
IMAGE="eu.gcr.io/turnkey-cocoa-720/dataporten-tokenissuer:$VERSION"


echo "Building $IMAGE"

#docker build -t andreassolberg/smedstua -t gcr.io/solberg-cluster/ .
docker build -t $IMAGE .
gcloud docker push $IMAGE

echo "Image ready $IMAGE"
echo "kubectl apply -f etc/deployment.json"


kubectl apply -f etc/deployment.json


#! /bin/bash

#docker build -t andreassolberg/smedstua -t gcr.io/solberg-cluster/ .
# docker build -t gcr.io/solberg-cluster/solberg-nuten:latest .
# gcloud docker push gcr.io/solberg-cluster/solberg-nuten:latest
# kubectl rolling-update solberg-nuten-rc-v1 --image=gcr.io/solberg-cluster/solberg-nuten:latest
