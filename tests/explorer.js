const _ = require('underscore')
const fs = require('fs')
const assert = require('chai').assert
const Promise = require('bluebird')

const util = require('../explorer/util')

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable no-console */

// make promise version of fs.readFile()
fs.readFileAsync = function (filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, 'utf8', function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// Test app dataset can be munged and returns as expected
describe('Explorer dataset', function () {
  describe('mungeExplorerDataset', function () {
    let mungedDataset
    let expectedDataset
    before(function (done) {
      // load ibp_dataset.js
      fs.readFileAsync(`${__dirname}/../vendor/ibp_dataset.js`)
      .then(function (d) {
        let explorerData = d
        // remove proceeding var definition
        explorerData = explorerData.replace(/^window\._EXPLORER_DATASET = /, '')
        // remove trailing ';'
        explorerData = explorerData.replace(/;\n+$/, '')
        // load file data as json
        const explorerJSON = JSON.parse(explorerData)
        // munge it with mungeExplorerDataset()
        mungedDataset = util.mungeExplorerDataset(explorerJSON)
        delete mungedDataset.forYear
        return mungedDataset
      })
      .then(function () {
        // load expected data
        return fs.readFileAsync(`${__dirname}/data/expected_explorer_dataset.json`)
      })
      .then(function (exd) {
        expectedDataset = JSON.parse(exd)
        done()
      })
    })

    it('should have expected keys', function (done) {
      assert.sameMembers(_.keys(mungedDataset), _.keys(expectedDataset))
      done()
    })

    it('should match for each item against expected data', function (done) {
      _.each(mungedDataset, function (v, k) {
        assert.deepEqual(v, expectedDataset[k], `Data object not as expected for key "${k}"`)
      })
      done()
    })
  })
})
