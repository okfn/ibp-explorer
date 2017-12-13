# Open Budget Survey Explorer

[![Build Status](https://travis-ci.org/okfn/ibp-explorer.svg?branch=master)](https://travis-ci.org/okfn/ibp-explorer)
[![Coverage Status](https://coveralls.io/repos/github/okfn/ibp-explorer/badge.svg?branch=master)](https://coveralls.io/github/okfn/ibp-explorer?branch=master)
[![Issues](https://img.shields.io/badge/issue-tracker-orange.svg)](https://github.com/okfn/ibp-explorer/issues)

* Live version: http://survey.internationalbudget.org

Developed in collaboration between the [International Budget Partnership](http://internationalbudget.org) and the [Open Knowledge Foundation](http://okfn.org). Written by [Tom Rees](http://github.com/zephod), [Hélène Durand](http://github.com/hdurand), [Tryggvi Björgvinsson](http://github.com/trickvi), and [Damjan Velickovski](https://github.com/dumyan).

## Introduction

This codebase contains two applications which function together from the end-
user perspective. The two applications are *explorer* and *tracker*. They are
logically separated in the code and served together through a central express
[Node app](http://nodejs.org), on different routes (see `/app.js` for details).

### Explorer

*Explorer* is the biggest part of the web application, representing most of the
endpoints, and is served from the root route - `/`.

The *explorer* application is a static [backbone](https://backbonejs.org) app
(served through express), built using [webpack](https://webpack.github.io/). Its data is built up from static files stored in the `./data` directory. See [below](#updating-the-explorer-data) for more details.

### Tracker

The *Tracker* app is concerned with the 'Document Availability' page and is served from the `/availability` route. It is an [express](https://expressjs.com/) app. Its data is retrieved during runtime from an external API using the separate [ibp-explorer-data-client](https://github.com/okfn/ibp-explorer-data-client) app.

### Questionnaire Review

In addition to the *explorer* and *tracker* applications, there's another small static app to serve the questionnaire review pages.

A page for each country in the survey is built, with questions and answers from the survey questionnaire, for ease of review. These can be accessed with a username and password at `/questionnaires`. These pages are built, each time the app is deployed, from data defined in a .csv file hosted on Google Sheets.

The questionnaire data spreadsheet id, and the username and password are set as env vars as defined below.

The static pages are built using [Metalsmith](http://www.metalsmith.io/) into `/_build-questionnaires` and served as a static site from the central express app.


## Installation and Deployment

To run locally:

* Clone this repository. 
* Install [Node.js](http://nodejs.org).
* Set the environment variables needed for [ibp-explorer-data-client](https://github.com/okfn/ibp-explorer-data-client) in `.env`.
* Run `npm install` in the root directory of this repo to install dependencies.
* Run `npm run build:dev` to bundle the front-end for the explorer, build the tracker, and a small sample of the questionnaire pages. If you want to watch for code changes use `npm run build:dev:watch`. This will also start the server.
  * Run `npm run build:dev:tracker` or `npm run build:dev:tracker:watch` to do the same **only** for the tracker.
  * Run `npm run build:dev:explorer` or `npm run build:dev:explorer:watch` to do the same **only** for the explorer.
  * Run `npm run build:questionnaires:dev` to build only the questionnaires.
* Run `npm run start` to start the node server.
* Point your browser at http://localhost:3000

To deploy:

* Get the above working.
* Kill any running processes from `ibp-explorer`.
* Set production `PORT`
* Run `npm run build:prod`. This will build a minified version of the tracker, explorer, and all the questionnaire review pages.

### Environment variables:

* `PORT` - port on which the server will listen. Default is 3000.
* `TRACKER_LAST_UPDATE` - date to be displayed on the Availability page when the last API update occurred

You will need to set additional environment variables needed by [ibp-explorer-data-client](https://github.com/okfn/ibp-explorer-data-client)

* For calls to Indaba API
  * `API_BASE` - Base URL for the API
  * `API_USERNAME` - Username for the API
  * `API_PASSWORD` - Password for the API
* Google Drive files/folders 
  * `SERVICE_CREDENTIALS` - Google Service JSON token. You can do ``export SERVICE_CREDENTIALS=`cat <path_to_credentials.json>` ``
  * `DRIVE_ROOT` - Which gdrive folder serves as root when searching for documents
* AWS S3 storage
  * `AWS_ACCESS_KEY_ID` - Your access key
  * `AWS_SECRET_ACCESS_KEY` - Your secret access key
  * `AWS_REGION` - Region where the bucket is
  * `AWS_BUCKET` - Name of the bucket where to store snapshots
* Google Drive Library reindexing
  * `DRIVE_ROOT` - ID of the root where the documents should be searched
  * `SPREADSHEET_ID` - ID of the spreadsheet where the found documents should be written
* Questionnaire
  * `QUESTIONNAIRE_AUTH` - username and password used to restricted access to questionnaire urls, in the form `username:password`.
  * `QUESTIONNAIRE_SPREADSHEET_ID` - Google Sheets spreadsheet ID representing the questionnaire data source.

To test:

* Run webpack-dev-server with `npm run start`
* Run `npm run test`

### Updating the explorer data

All the data lives in the `./data` folder, along with a Python tool to Extract-Transform-Load it through a complicated data-massage. Outputs are:

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


### Updating the tracker translations

* `npm run extract-pot` to extract all the strings for translations into a .pot file
* `npm run merge-po` to merge the new strings for translation into the existing po files
* Update the translations in the .po files
* `npm run compile-json` to compile the .po files to json message files which the app uses
