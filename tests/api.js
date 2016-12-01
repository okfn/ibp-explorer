var assert = require('assert');
var api = require('../api');

describe('api', function () {
  it('should export the api', function () {
    assert.notEqual(api, undefined);
  });
  it('should export the api.call', function () {
    assert.notEqual(api.call, undefined);
  });
});
