#!/bin/bash

docker build ./fixtures/docker/local -t clarityhub-api-accounts

docker run \
    -it \
    --rm \
    --publish 8000:8000 \
    --publish 4000:4000 \
    --network=clarityhub-network \
    --mount src="$(pwd)",target=/server,type=bind \
    --network-alias clarityhub-api-accounts \
    --name clarityhub-api-accounts \
    clarityhub-api-accounts