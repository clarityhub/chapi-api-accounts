#!/bin/sh

cd "$(dirname "$0")"
set -e

cd ../../

echo "Build swagger documentation..."

npm run docs:build