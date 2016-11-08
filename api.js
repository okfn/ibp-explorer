var fs = require('fs');
var Indaba = require('open-budget-indaba-client').default.Indaba;
var moment = require('moment');

function api_call (endpoint, callback) {
  var cache_file = './cache/'+endpoint+'.json';
  var should_get_from_cache = false;
  var should_update_cache = true;
  var cache_exists = fs.existsSync(cache_file);
  if (cache_exists) {
    should_update_cache = false;
    should_get_from_cache = true;
    var stat = fs.statSync(cache_file);
    var months = moment().diff(new Date(stat.mtime), 'months');
    if (months >= 6) {
      should_update_cache = true;
      should_get_from_cache = false;
    }
  }
  if (should_get_from_cache) {
    var data = fs.readFileSync(cache_file);
    var date = new Date(stat.mtime);
    callback(JSON.parse(data), date);
  } else {
    Indaba.getTrackerJSON().then( function (res) {
      if (should_update_cache) {
        fs.writeFileSync(cache_file, JSON.stringify(res));
      }
      callback(res, new Date());
    });
  }
}

module.exports = {
  call: api_call
};
