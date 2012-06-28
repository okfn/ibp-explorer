template = require 'views/templates/country'
application = require 'application'

module.exports = class CountryView extends Backbone.View
  initialize: (@countryName) ->
    @query = application.data.rows( (row)=>row.country==@countryName )
    if not @query.length
      throw ('"'+@countryName+'" not in dataset.')

  render: =>
    # console.debug "Rendering #{@constructor.name}"
    renderData = @query.rowByPosition(0)
    @$el.html template renderData
    this
