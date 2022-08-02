#!/bin/sh

cd "$(dirname "$0")"
set -e

. variables/$ENVIRONMENT.sh

cd ../../

# copy env.template.yml to env.${ENVIRONMENT}.yml
# cp ./config/env.template.yml ./config/env.${ENVIRONMENT}.yml

echo "Setting up credentials..."

serverless config credentials --stage $ENVIRONMENT \
    --provider aws \
    --key $AWS_ACCESS_KEY_ID \
    --secret $AWS_SECRET_ACCESS_KEY \
    --profile serverless-deployer

echo "Deploying..."

# Uncomment once domain creation is fixed
# serverless create_domain --aws-profile serverless-deployer --stage $ENVIRONMENT --region $AWS_DEFAULT_REGION
serverless deploy --aws-profile serverless-deployer --stage $ENVIRONMENT --region $AWS_DEFAULT_REGION

# Uncomment if there are migrations
# serverless invoke --aws-profile serverless-deployer --stage $ENVIRONMENT --region $AWS_DEFAULT_REGION --function up
