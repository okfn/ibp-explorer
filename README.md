# Open Budget Survey Explorer

[![Build Status](https://travis-ci.org/okfn/ibp-explorer.svg?branch=master)](https://travis-ci.org/okfn/ibp-explorer)
[![Coverage Status](https://coveralls.io/repos/github/okfn/ibp-explorer/badge.svg?branch=master)](https://coveralls.io/github/okfn/ibp-explorer?branch=master)
[![Issues](https://img.shields.io/badge/issue-tracker-orange.svg)](https://github.com/okfn/ibp-explorer/issues)

* Live version: http://survey.internationalbudget.org

Developed in collaboration between the [International Budget Partnership](http://internationalbudget.org) and the [Open Knowledge Foundation](http://okfn.org). Written by [Tom Rees](http://github.com/zephod), [Hélène Durand](http://github.com/hdurand), [Tryggvi Björgvinsson](http://github.com/trickvi), and [Damjan Velickovski](https://github.com/dumyan).

## Setup & Deployment

This is a web application developed using [Brunch](http://brunch.io). To run locally:

* Clone this repository. 
* Install [Node.js](http://nodejs.org).
* Run `npm install` in the root directory of this repo to install dependencies.
* Run `npm run start` to compile the app and run a webpack-dev-server web server
* Point your browser at http://localhost:8080.

To deploy:

* Get the above working.
* Kill the `webpack-dev-server`.
* Run `npm run build:production`.
* Deploy `./_build` folder to your web server.

Environment variables:

* TRACKER_URL - needed for the "Document Availability" page which is iframe-ed open-budgeg-survey-tracker.

To test:

* Run webpack-dev-server with `npm run start`
* Run `npm run test`

## Updating the data

All the data lives in the `./data` folder, along with a Pythin tool to Extract-Transform-Load it through a complicated data-massage. Outputs are:

* `./vendor/ibp_dataset.js` which is used by the javascript datatool.
* `./app/assets/downloads/` which is filled with downloadable files.

To update the data:

* Modify the Excel files in the `./data` folder.

To get those changes processed by the tool:

* Get Python set up on your system.
* Install [Pip](http://pypi.python.org/pypi/pip), the Python package manager.
* `pip install openpyxl`
* `pip install unicodecsv`
* `pip install xlrd`
* You're all set up. Run `python etl.py` to update the tool.
* Run the tool locally to prove it works. 
* Follow the above deployment instructions to get it ready for a live server.
