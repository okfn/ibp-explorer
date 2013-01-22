#!/bin/bash

mkdir -p _build

echo 'Cleaning output directory...'
rm -rf _build/* # Note this leaves _build/.git intact

echo 'Building minified uglified web-app...'
brunch build --minify

echo 'Git commit...'
cd _build
git add *
git commit -a -m "Redeploying"

echo 'Push...'
git push live gh-pages
