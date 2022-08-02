# Clarity Hub Accounts API

## Prerequisites

Make sure you have CHAPI API Gateway installed and running.

## 🚀 Getting Started

Make sure you have Docker installed and running

```bash
sh ./start
```

You can now access the following:

* DynamoDB Shell: http://localhost:8000/shell/
* API: `GET https://api.clarityhub.app/accounts/health`

## Serverless Resources

### Cognito User Pools

This serverless deployment will create user pools. In order to re-use these pools for authorization in other serverless deployments, the following can be used as the authorizor:

```yml
authorizer:
    type: COGNITO_USER_POOLS
    authorizerId: '???'
```

Where `???` is some ARN that we will figure out in the future.

## API

See `https://api.clarityhub.app/accounts/swagger` for the Swagger API.
