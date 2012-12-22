#!/bin/bash

echo 'Cleaning output directory...'
rm -rf _build/* # Note this leaves _build/.git intact

echo 'Building minified uglified web-app...'
brunch build --minify

echo 'Git commit...'
cd _build
git commit -a -m "Redeploying"

echo 'Push...'
git push live master
