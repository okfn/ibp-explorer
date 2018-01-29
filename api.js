const fs = require('fs')
const Indaba = require('ibp-explorer-data-client').default.Indaba
const Filters = require('ibp-explorer-data-client').default.Filters
const moment = require('moment')
const request = require('request')

if (!fs.existsSync('./cache')) {
  fs.mkdirSync('./cache')
}

function getNewToken() {
  const options = {
    uri: process.env.API_BASE + '/Users/login',
    method: 'POST',
    json: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    }
  }

  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body.id)
      } else {
        reject(error, response.statusCode)
      }
    })
  })
}

function checkTokenValidity() {
  Indaba.getCountries(Filters().limit(1)).then(res => {
    if (res.error) {
      console.log('Could not generate new API token, please verify username and password')
      return false
    }
    return true
  })
}

function api_call(endpoint, callback) {
  const cacheFile = './cache/' + endpoint + '.json'
  const cacheExists = fs.existsSync(cacheFile)
  let data = null
  let stat = null

  function _downloadTrackerJSON() {
    return new Promise(function (resolve, reject) {
      Indaba.getTrackerJSON().then(res => {
        fs.writeFileSync(cacheFile, JSON.stringify(res))
        resolve(res)
      }).catch((err, status) => {
        if (err) {
          reject(err)
        }
      })
    })
  }

  function getTrackerData(callback) {
    if (checkTokenValidity()) {
      data = _downloadTrackerJSON()
      callback(data)
    } else {
      getNewToken().then(token => {
        process.env.API_TOKEN = token
        _downloadTrackerJSON().then(d => {
          callback(d)
        }).catch(err => {
          console.log(err)
        })
      })
    }
  }

  if (cacheExists) {
    // Pre-load the data to check length
    data = JSON.parse(fs.readFileSync(cacheFile))
    stat = fs.statSync(cacheFile)
  }

  if (cacheExists) {
    if (data.length > 0) {
      const date = moment(stat.mtime)
      callback(data, date)
    } else {
      getTrackerData(callback)
    }
  } else {
    getTrackerData(callback)
  }
}

function getSearch() {
  return new Promise((resolve, reject) => {
    const cacheFile = './cache/searchdata.json'
    const cacheExists = fs.existsSync(cacheFile)
    let data = null

    function _downloadSearchJSON() {
      return new Promise((resolve_, reject_) => {
        Indaba.getSearchJSON().then(res => {
          fs.writeFileSync(cacheFile, JSON.stringify(res))
          resolve_(res)
        }).catch(err => {
          reject_(err)
        })
      })
    }

    function getSearchData() {
      if (checkTokenValidity()) {
        _downloadSearchJSON().then(d => {
          resolve(d)
        }).catch(err => {
          console.log(err)
        })
      } else {
        getNewToken().then(token => {
          process.env.API_TOKEN = token
          _downloadSearchJSON().then(d => {
            resolve(d)
          }).catch(err => {
            console.log(err)
          })
        })
      }
    }

    if (cacheExists) {
      data = JSON.stringify(fs.readFileSync(cacheFile))
    }

    if (cacheExists) {
      if (data.length > 1) {
        resolve(data)
      } else {
        getSearchData()
      }
    } else {
      getSearchData()
    }
  })
}

module.exports = {
  call: api_call,
  getSearch: getSearch
}
