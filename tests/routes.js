'use strict'

import _ from 'underscore'
import jsdom from 'jsdom'
import jQuery from 'jquery'
import {expect} from 'chai'


const jsdomConfig = {
  url: "http://localhost:3000/"
  , scripts: [jQuery]
  , features: {
    FetchExternalResources: ['script']
    , ProcessExternalResources: ['script']
    , MutationEvents: '2.0'
    , SkipExternalResources: false
  }
}

const routes = [
  '#home'
  , '#map'
  , '#rankings'
  , '#profile'
  // TODO fix test for route #timeline - jsdom can't load #timeline in 5 minutes
  //, '#timeline'
  , 'availability'
  , '#participation'
  , '#download'
]

describe('routes', function () {
  this.timeout(50000);
  _.forEach(routes, (route) => {
    it(`${route}`, (done) => {
      let config = _.extend({}, jsdomConfig),
          children
      config.url = config.url + route
      config.done = (err, window) => {
        const $ = jQuery(window)
        if (route.charAt(0) === '#') {
          children = $('#explorer').children().length
        } else {
          children = $('#tracker').children().length
        }
        window.close()
        try {
          expect(children).to.be.above(0)
          done()
        }
        catch(e) {
          done(new Error(`No content populated for route ${route}`))
        }
      }
      jsdom.env(config)
    })
  })
})
