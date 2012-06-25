template = require 'views/templates/country'
data = require 'data'

module.exports = class CountryView extends Backbone.View
  initialize: (@countryName) ->
    if not data[@countryName]?
      throw ('"'+@countryName+'" not in dataset.')

  render: =>
    # console.debug "Rendering #{@constructor.name}"
    renderData = {
      country: @countryName
      data: data[@countryName]
    }
    @$el.html template renderData
    this
