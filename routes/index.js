var fs = require('fs');
var path = require('path');
var express = require('express');
var moment = require('moment');
var api = require('./../api.js');
var _ = require('underscore');
var router = express.Router();

var docs = [
  {
    "title": "Pre-Budget Statement",
    "description": "The purpose of the Pre-Budget Statement is to disclose the parameters of the Executive's Budget Proposal. It outlines the government's macroeconomic assumptions as well as anticipated total revenue and expenditures, and it sets out the debt that will be incurred during the upcoming budget year. The Pre-Budget Statement should be available no less than one month prior to the introduction of the Executive's Budget Proposal. If the Pre-Budget Statement is published less than a month before the Executive's Budget Proposal is submitted to the legislature, it is considered to be 'not publicly available'."
  },
  {
    "title": "Executive's Budget Proposal",
    "description": "The nature of the Executive's Budget Proposal varies from country to country. Sometimes it is a single document, sometimes multiple documents. The Executive's Budget Proposal is the document or documents that the executive submits to the legislature for its approval. It details expected government revenue and the sources of that revenue, as well as allocations to be made to all ministries, and to subnational governments in countries where the national government provides funding to the latter. The Executive's Budget Proposal should be made publicly available when it is first presented to the legislature, or, at a minimum, before the legislature approves it."
  },
  {
    "title": "Enacted Budget",
    "description": "The Enacted Budget is the budget that has been passed into law by the legislature. Unlike most budget documents, the Enacted Budget should be available from the committee within the legislature that deals with the budget, although the Ministry of Finance or other body that houses the executive's budget documents may also have a copy of the Enacted Budget. The Enacted Budget must be released to the public no later than three months after the legislature has approved it."
  },
  {
    "title": "Citizens Budget",
    "description": "A Citizens Budget is a version of the Executive's Budget Proposal, the Enacted Budget, or any other budget document that is simpler and less technical than the full document. It is normally shorter than the document on which it is based and is specifically designed to convey the key information in the particular document to the general public. A Citizens Budget should be available at the same time that the underlying document is made available. For example, if the Citizens Budget is a simplified version of the Executive's Budget Proposal, it should be released at the same time as the Executive's Budget Proposal."
  },
  {
    "title": "In-Year Report",
    "description": "These may be issued on a quarterly or monthly basis. They may be in the form of a consolidated report for the entire government or multiple reports from different agencies. In-Year Reports should be issued no later than three months after the end of the reporting period. If the report is issued after this date, it is considered as 'not publicly available'."
  },
  {
    "title": "Mid-Year Review",
    "description": "The Mid-Year Review contains a comprehensive update on the implementation of the budget as of the middle of the fiscal year, including a review of economic assumptions underlying the budget, and an updated forecast of the budget outcome for the fiscal year. The Mid-Year Review should be available no later than three months after the end of the first six months of the fiscal year."
  },
  {
    "title": "Year-End Report",
    "description": "Generally the Year-End Report is issued as a single, consolidated report for the entire government, but individual ministries may issue separate Year-End Reports. The Year-End Report should be released no later than one year after the end of the fiscal year. The Year-End Report is 'not publicly available' if issued later than one year after the end of the fiscal year it reports on."
  },
  {
    "title": "Audit Report",
    "description": "The Audit Report is issued by the country's supreme audit institution (SAI). It attests to the soundness and completeness of the government's year-end accounts. Unlike most other budget documents, the Audit Report is housed with the SAI. To be considered 'publicly available' the Audit Report must be published within 18 months after the end of the fiscal year to which it relates. The Audit Report would be 'not publicly available' if it is issued after that 18 month period."
  }
];

var country_override = {
    "Philippines": {
        "date": new Date(2015, 3, 30),
	"message": "The availability status of the Philippines’ budget documents stopped being tracked on April 30, 2015. Historical information and published budget documents are available through this website, till that point.",
	"value": [{
          "state": "discontinued",
          "popup": "The Philippines’ budget documents stopped being tracked on April 30, 2015"
	}]
    }
};

var last_update = new Date(2016, 3, 30)

router.get('/country/:country/embed', function (req, res) {
  api.call('countries', function (countries) {
    var country = {};
    for (var i in countries) {
      if (countries[i].country == req.params.country) {
        country = countries[i];
        break;
      }
    }
    country.snapshots = _.sortBy(country.snapshots, function(obj) {
	return -obj.date;
    });

    // Override country if needed (e.g. discontinued countries)
    if (country.country in country_override) {
	var documents = _.indexBy(_.pluck(docs, 'title'));
        documents = _.mapObject(documents, function(value){
          return country_override[country.country].value;
        });
	var this_year = ''+(new Date).getFullYear();
        var overwritten = {};
        overwritten[this_year] = documents;
	country.snapshots = _.map(country.snapshots, function(obj) {
            if (new Date(obj.date) > country_override[country.country].date) {
		obj.snapshot = overwritten;
	    }
	    return obj;
	});
        country.message = country_override[country.country].message;
    }

    res.render('country_embed', {
      'docs': docs,
      'country': country,
      'EXPLORER_URL': process.env.EXPLORER_URL
    });
  });
});


router.get('/status/:country/embed', function (req, res) {
  api.call('countries', function (countries) {
    var country = {};
    for (var i in countries) {
      if (countries[i].country == req.params.country) {
        country = countries[i];
        break;
      }
    }

    // Override country if needed (e.g. discontinued countries)
    if (country.country in country_override) {
      var documents = _.indexBy(_.pluck(docs, 'title'));
      documents = _.mapObject(documents, function(value){
        return country_override[country.country].value;
      });
      var this_year = ''+(new Date).getFullYear();
      country.documents = {};
      country.documents[this_year] = documents;
      country.message = country_override[country.country].message;
    }

    res.render('status_embed', {
      'docs': docs,
      'country': country,
      'EXPLORER_URL': process.env.EXPLORER_URL
    });
  });
});

router.get('/datagathering', function (req, res) {
  res.render('gathering', {});
});

router.get('/publications', function (req, res) {
  res.render('publications', {});
});

router.get('/press', function (req, res) {
  res.render('press', {});
});

router.get('/about', function (req, res) {
  res.render('about', {});
});

router.get('/data.csv', function (req, res) {
    // Generate header row
    var csv = "";
    var headers = ['country','code','month','year'];
    for (var i in docs) {
	headers.push(docs[i].title);
    }
    csv += headers.join(',')+'\n';

    api.call('countries', function(countries) {
	for (var c in countries) {
	    var country = countries[c];
	    var snapshots = countries[c].snapshots;
	    for (var s in snapshots) {
		var data = [];
		data.push(country.country);
		data.push(country.code);
		var snapshot = snapshots[s];
		var date = moment(snapshot.date);

                //Override countries (e.g. discontinued countries)
                if (country.country in country_override) {
		  var documents = _.indexBy(_.pluck(docs, 'title'));
                  documents = _.mapObject(documents, function(value){
                    return country_override[country.country].value;
                  });
                  var this_year = ''+(new Date).getFullYear();
                  var overwritten = {};
                  overwritten[this_year] = documents;
		  if (date > moment(country_override[country.country].date)) {
		    snapshot.snapshot = overwritten;
                  }
                }

		data.push(date.month()+1);  // Months in js start from 0
		data.push(date.year());
		for (var d in docs) {
		    var doc = docs[d];
		    var cell = undefined;
		    var years = Object.keys(snapshot.snapshot).sort().reverse()
		    for (var y in years) {
			var year_data = snapshot.snapshot[years[y]];
			if (cell === undefined) {
			    if (doc.title in year_data) {
				var year_docs = year_data[doc.title];
				cell = year_docs[year_docs.length-1];
			    }
			}
		    }
		    if (cell) {
			data.push(cell.state);
		    }
		    else {
			data.push('not produced');
		    }
		}
		csv += data.join(',')+'\n';
	    }
	}
	res.charset = 'utf-8';
	res.set('Content-Type', 'text/csv');
	res.send(csv);
    });
});

router.get('/updates/:update', function (req, res) {
    var locale = "";
    if (!req.lang) { locale = "en"; }
    else { locale = req.lang; }
    res.render('updates/'+locale+'/'+req.params.update, {}, function(err, html) {
	if (err) {
	    console.log(err);
	    res.status(404).send('Not found');
	}
	else {
	    res.send(html)
	}
    });
});

router.get('/locale/:locale', function (req, res) {
    res.cookie('obstracker_language', req.params.locale, { maxAge: 900000 })
    res.redirect('/availability');
});

router.get('/locale/:locale/embed', function (req, res) {
    res.cookie('obstracker_language', req.params.locale, { maxAge: 900000 })
    res.redirect('/availability');
});


router.get('/', function (req, res) {
  api.call('countries', function (countries) {
    //Override countries (e.g. discontinued countries)
    countries = _.map(countries, function(obj) {
      if (obj.country in country_override) {
        var documents = _.indexBy(_.pluck(docs, 'title'));
        documents = _.mapObject(documents, function(value){
          return country_override[obj.country].value;
        });
        obj.documents = {}
        obj.documents[''+last_update.getFullYear()] = documents;
      }
      return obj;
    });

    res.render('index_embed', {
      'docs': docs,
      'countries': countries,
      'last_update': last_update
    });
  });
});

module.exports = router;
