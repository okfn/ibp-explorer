'use strict'

import OBSRouter from './router.js'

import './assets/index.html'
import './views/styles/main.less'
import * as util from './util.js'


const loadDataset = function () {
  assert(_EXPLORER_DATASET !== null, 'Failed to load dataset.')

  _EXPLORER_DATASET = util.mungeExplorerDataset(_EXPLORER_DATASET)
}

const initJsPlumb = function () {
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

// Custom handlebars helper for equals
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  if (a === b) {
    return opts.fn(this)
  } else {
    return opts.inverse(this)
  }
})

$(function () {
  initJsPlumb()
  loadDataset()
  window.router = new OBSRouter()
  Backbone.history.start()
})
