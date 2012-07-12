template = require 'views/templates/rankings'
application = require 'application'
util = require 'util'

module.exports = class RankingsView extends Backbone.View
  initialize: (@category,@region) ->
    console.log 'init', @category, @region
    @renderData = 
      groupings: application.groupings

  route: (category, region) ->
    if category
      category = 'category-'+category+'/'
    if region
      region = 'region-'+region+'/'
    '#rankings/'+category+region

  render: =>
    dom = $(template @renderData)
    @$el.append dom
    this

