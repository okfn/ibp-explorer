var fs = require('fs');
var Indaba = require('ibp-explorer-data-client').default.Indaba;
var Filters = require('ibp-explorer-data-client').default.Filters;
var moment = require('moment');
var request = require('request');

if (!fs.existsSync('./cache')) {
  fs.mkdirSync('./cache')
}

function getNewToken() {
  var options = {
    uri: process.env.API_BASE + '/Users/login',
    method: 'POST',
    json: {
      username: process.env.API_USERNAME,
      password: process.env.API_PASSWORD
    }
  };

  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve(body.id)
      } else {
        reject(error, response.statusCode)
      }
    });
  })
}

function checkTokenValidity() {
  Indaba.getCountries(Filters().limit(1)).then(function (res) {
    if (res.error) {
      console.log('Could not generate new API token, please verify username and password')
      return false
    } else {
      return true
    }
  })
}

function api_call (endpoint, callback) {
  var cache_file = './cache/'+endpoint+'.json';
  var cache_exists = fs.existsSync(cache_file);
  var data, stat = null

  function _downloadTrackerJSON() {
    return new Promise(function (resolve, reject) {
      Indaba.getTrackerJSON().then( function (res) {
        fs.writeFileSync(cache_file, JSON.stringify(res));
        resolve(res);
      }).catch(function (err, status) {
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
      getNewToken().then(function (token) {
        process.env.API_TOKEN = token
        _downloadTrackerJSON().then(function (data) {
          callback(data)
        }).catch(function (err) {
          console.log(err)
        })
      })
    }
  }

  if (cache_exists) {
    // Pre-load the data to check length
    data = JSON.parse(fs.readFileSync(cache_file));
    stat = fs.statSync(cache_file)
  }

  if (cache_exists) {
    if (data.length > 0) {
      var date = moment(stat.mtime);
      callback(data, date);
    } else {
      getTrackerData(callback)
    }
  } else {
    getTrackerData(callback)
  }
}

function getSearch() {
  return new Promise(function (resolve, reject) {
    var cache_file = './cache/searchdata.json'
    var cache_exists = fs.existsSync(cache_file)
    var data = null

    function _downloadSearchJSON() {
      return new Promise(function (resolve, reject) {
        Indaba.getSearchJSON().then(function (res) {
          fs.writeFileSync(cache_file, JSON.stringify(res))
          resolve(res)
        }).catch(function (err) {
          reject(err)
        })
      })
    }

    function getSearchData() {
      if (checkTokenValidity()) {
        _downloadSearchJSON().then(function (data) {
          resolve(data)
        }).catch(function (err) {
          console.log(err)
        })
      } else {
        getNewToken().then(function (token) {
          process.env.API_TOKEN = token
          _downloadSearchJSON().then(function (data) {
            resolve(data)
          }).catch(function (err) {
            console.log(err)
          })
        })
      }
    }

    if (cache_exists) {
      data = JSON.stringify(fs.readFileSync(cache_file))
    }

    if (cache_exists) {
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
};
