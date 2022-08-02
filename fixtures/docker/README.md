# Docker registry

The Docker Registry is used to maintain Docker Images used by Gitlab CI.

These Docker containers are added to the registry so that
they are easily accessible by the Gitlab runner.

You need to log into the registry in order to upload the images:

```
docker login registry.gitlab.com
```

## serverless Container

The deploy container has **serverless** and **aws-cli**

```sh
cd serverless

docker build -t registry.gitlab.com/clarityhub/clarityhub-api-accounts/serverless .
docker push registry.gitlab.com/clarityhub/clarityhub-api-accounts/serverless
```

## local Container

The local container is made for local development and should NOT be pushed to the registry.