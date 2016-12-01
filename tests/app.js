var assert = require('assert');
var app = require('../app');

describe('app', function () {
  it('should export the app', function () {
    assert.notEqual(app, undefined);
  });
});
