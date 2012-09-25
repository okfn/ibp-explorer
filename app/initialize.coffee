Router = require('router')

$ ->
  assert(_EXPLORER_DATASET!=null, 'Failed to load dataset.')
  router = new Router()
  Backbone.history.start()
