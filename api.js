var fs = require('fs');
var Indaba = require('ibp-explorer-data-client').default.Indaba;
var moment = require('moment');

var downloading_search_cache = false

if (!fs.existsSync('./cache')) {
  fs.mkdirSync('./cache')
}

function api_call (endpoint, callback) {
  var cache_file = './cache/'+endpoint+'.json';
  var should_update_cache = true;
  var cache_exists = fs.existsSync(cache_file);

  if (cache_exists) {
    should_update_cache = false;
    var stat = fs.statSync(cache_file);
    var months = moment().diff(moment(stat.mtime), 'months');
    var data = fs.readFileSync(cache_file);
    var date = moment(stat.mtime);

    callback(JSON.parse(data), date);
  } else {
    Indaba.getTrackerJSON().then( function (res) {
      if (should_update_cache) {
        fs.writeFileSync(cache_file, JSON.stringify(res));
      }
      callback(res);
    });
  }
}

function getSearch() {
  return new Promise(function (resolve, reject) {
    var cache_file = './cache/searchdata.json'
    var cache_exists = fs.existsSync(cache_file)
    if (cache_exists) {
      var stat = fs.statSync(cache_file)
      var days = moment().diff(moment(stat.mtime), 'days')
      if (days > 1 && !downloading_search_cache) {
        downloading_search_cache = true
        Indaba.getSearchJSON().then(function (res) {
          fs.writeFileSync(cache_file, JSON.stringify(res))
        })
      }
      var data = fs.readFileSync(cache_file)
      resolve(JSON.parse(data))
    } else {
      Indaba.getSearchJSON().then(function (res) {
        resolve(res)
        fs.writeFileSync(cache_file, JSON.stringify(res))
      })
    }
  })
}

module.exports = {
  call: api_call,
  getSearch: getSearch
};
