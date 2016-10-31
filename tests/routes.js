'use strict'

import _ from 'underscore'
import jsdom from 'jsdom'
import jQuery from 'jquery'
import {expect} from 'chai'

const jsdomConfig = {
  url: "http://localhost:8080/"
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
  , '#timeline'
  , '#rankings'
  , '#profile'
  // TODO fix testing when using fetch and iframe
  //, '#availability'
  , '#participation'
  , '#download'
  , '#search'
]

describe('Test route', function () {
  this.timeout(35000);
  _.forEach(routes, (route) => {
    it(`${route}`, (done) => {
      let config = _.extend({}, jsdomConfig)
      config.url = config.url + route
      config.done = (err, window) => {
        const $ = jQuery(window)
        const children = $('#explorer').children().length
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
