'use strict'
import Router from 'router.js'

const loadDataset = function () {
  assert(_EXPLORER_DATASET !== null, 'Failed to load dataset.');
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
        if (group.qs.contains(qnum)) {
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
        if (group.qs.contains(qnum)) {
          qdata.groups.push('group-'+group.group_id)
        }
      })
    })
  })
  // Create an 'Entire World' region
  entire_world = {
    name: 'Entire World',
    contains: []
  }
  _.forEach(_EXPLORER_DATASET.country_old, (country) => {
    entire_world.contains.push(country.alpha2)
  })
  _EXPLORER_DATASET.regions_old.unshift(entire_world)
  // Attach a region_index to each region
  _.forEach(_EXPLORER_DATASET.regions_old, (element, index) => {
    element.region_index = parseInt(index)
  })
};

const initJsPlumb = function() {
  let color = '#aaa'
  jsPlumb.importDefaults({
    Anchors: ['RightMiddle', 'LeftMiddle'],
    PaintStyle: {
      strokeStyle: color,
      lineWidth: 2
    },
    Endpoint: 'Blank',
    EndpointStyle: {
      radius: 9,
      fillStyle: color
    },
    Connector: [
      "Bezier", {
        curviness: 30
      }
    ]
  })
  let arrowCommon = {
    foldback: 0.8,
    fillStyle: color,
    width: 9,
    length: 10
  }
  jsPlumb._custom_overlay = [
    [ "Arrow", { location: 0.5 }, arrowCommon]
  ]
};

$(function() {
  initJsPlumb();
  loadDataset();
  let router = new Router();
  Backbone.history.start();
});