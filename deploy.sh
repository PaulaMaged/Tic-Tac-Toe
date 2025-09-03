#!/bin/bash
set -e

cd "$(git rev-parse --show-toplevel)"

npm run sass:build
cd site/
git rm -rf .
cp -r ../public/* .
git add --all
git commit -m "Deploy"
git push
cd ../

echo "Deploy Completed✅"