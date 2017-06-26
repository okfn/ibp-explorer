'use strict'

import _ from 'underscore'
import _s from 'underscore.string'

import OBSRouter from './router.js'

import './assets/index.html'
import './views/styles/main.less'

// Filter out countries in this list from _EXPLORER_DATASET
const COUNTRY_EXCLUDE_LIST = [
  ['BF', '2006']
  , ['BO', '2006']
  , ['BW', '2006']
  , ['CM', '2006']
  , ['DZ', '2006']
  , ['EC', '2006']
  , ['HN', '2006']
  , ['KE', '2006']
  , ['KR', '2006']
  , ['KZ', '2006']
  , ['MW', '2006']
  , ['NI', '2006']
  , ['PE', '2006']
  , ['PK', '2006']
  , ['PL', '2006']
  , ['SI', '2006']
  , ['TD', '2006']
  , ['TZ', '2006']
  , ['ZM', '2006']
  , ['BF', '2008']
  , ['BW', '2008']
  , ['EC', '2008']
  , ['KE', '2008']
  , ['NI', '2008']
  , ['SD', '2008']
  , ['TD', '2008']
  , ['ZM', '2008']
  , ['SD', '2010']
]

const loadDataset = function () {
  assert(_EXPLORER_DATASET !== null, 'Failed to load dataset.')

    // Store excluded countries
  _EXPLORER_DATASET.excluded_country = []
  _EXPLORER_DATASET.excluded_country_old = []

  const pruneCountry = function (countryList, excludedCountryList, excluded, year) {
    /*
    Remove `db_${year}` from the passed `excluded` country. If no `db_${year}`
    properties are left, remove the country. Excluded country data is added to
    an `_excluded_country[_old]` array, so pages have access to it if necessary
    (e.g. availabilityHistorical.js uses it).
    */

    const country = _.find(countryList, c => c.alpha2 === excluded)
    if (country[`db_${year}`] !== undefined) {
      let excludedCountry = _.find(excludedCountryList, c => c.alpha2 === excluded)
      if (!excludedCountry) {
        excludedCountry = {
          alpha2: country.alpha2
          , name: country.name
        }
        excludedCountryList.push(excludedCountry)
      }
      excludedCountry[`db_${year}`] = _.clone(country[`db_${year}`])
      delete country[`db_${year}`]
    }

    const countryKeys = _.keys(country)
    if (!_.some(countryKeys, k => _s.startsWith(k, 'db_'))) {
      countryList = _.reject(countryList, c => c.alpha2 === excluded)
    }

    return countryList
  }

  // Remove excluded country/years from `country_old`
  _.each(COUNTRY_EXCLUDE_LIST, excluded => {
    _EXPLORER_DATASET.country
      = pruneCountry(_EXPLORER_DATASET.country, _EXPLORER_DATASET.excluded_country,
                     excluded[0], excluded[1])
    _EXPLORER_DATASET.country_old
      = pruneCountry(_EXPLORER_DATASET.country_old, _EXPLORER_DATASET.excluded_country_old,
                     excluded[0], excluded[1])
  })

  // 2015 survey dataset
  // Assign an ID to all groupings
  let id = 0
  _.forEach(_EXPLORER_DATASET.groupings, (x) => {
    _.forEach(x.entries, (y) => {
      y.group_id = id++
    })
  })
  id = 0
  _.forEach(_EXPLORER_DATASET.question, (qdata, qnum) => {
    qdata.groups = []
    // Tag the question with a list of parent groups
    _.forEach(_EXPLORER_DATASET.groupings, (category) => {
      _.forEach(category.entries, (group) => {
        if (_.contains(group.qs, qnum)) {
          qdata.groups.push('group-'+group.group_id)
        }
      })
    })
  })
  // Create an 'Entire World' region
  let entire_world = {
    name: 'Entire World',
    contains: []
  }
  _.forEach(_EXPLORER_DATASET.country, (country) => {
    entire_world.contains.push(country.alpha2)
  })
  _EXPLORER_DATASET.regions.unshift(entire_world)
  // Attach a region_index to each region
  _.forEach(_EXPLORER_DATASET.regions, (element, index) => {
    element.region_index = parseInt(index)
  })

  // Pre-2015 survey dataset
  // Assign an ID to all groupings
  id = 0
  _.forEach(_EXPLORER_DATASET.groupings_old, (x) => {
    _.forEach(x.entries, (y) => {
      y.group_id = id++
    })
  })
  // Assign group IDs to all questions
  id = 0
  _.forEach(_EXPLORER_DATASET.question_old, (qdata, qnum) => {
    qdata.groups = []
    // Tag the question with a list of parent groups
    _.forEach(_EXPLORER_DATASET.groupings_old, (category) => {
      _.forEach(category.entries, (group) => {
        if (_.contains(group.qs, qnum)) {
          qdata.groups.push('group-'+group.group_id)
        }
      })
    })
  })
  // Create an 'Entire World' region
  entire_world = {
    name: 'Entire World'
    , contains: []
  }
  _.forEach(_EXPLORER_DATASET.country_old, (country) => {
    entire_world.contains.push(country.alpha2)
  })
  _EXPLORER_DATASET.regions_old.unshift(entire_world)
  // Attach a region_index to each region
  _.forEach(_EXPLORER_DATASET.regions_old, (element, index) => {
    element.region_index = parseInt(index)
  })
}

const initJsPlumb = function() {
  let color = '#aaa'
  jsPlumb.importDefaults({
    Anchors: ['RightMiddle', 'LeftMiddle']
    , PaintStyle: {
      strokeStyle: color
      , lineWidth: 2
    }
    , Endpoint: 'Blank'
    , EndpointStyle: {
      radius: 9
      , fillStyle: color
    }
    , Connector: [
      'Bezier', {
        curviness: 30
      }
    ]
  })
  let arrowCommon = {
    foldback: 0.8
    , fillStyle: color
    , width: 9
    , length: 10
  }
  jsPlumb._custom_overlay = [
    ['Arrow', { location: 0.5 }, arrowCommon]
  ]
}

//Custom handlebars helper for equals
Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a === b)
    return opts.fn(this);
  else
    return opts.inverse(this);
});

$(function() {
  initJsPlumb()
  loadDataset()
  window.router = new OBSRouter()
  Backbone.history.start()
})
