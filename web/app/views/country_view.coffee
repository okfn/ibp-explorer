# TODO these could be combined into a single template, given HBS' power
template = require 'views/templates/country'
template_row = require 'views/templates/country_row'
application = require 'application'

module.exports = class CountryView extends Backbone.View
  initialize: (@countryName) ->
    @query = application.data.rows( (row)=>row.country==@countryName )
    if not @query.length
      throw ('"'+@countryName+'" not in dataset.')

  render: =>
    # console.debug "Rendering #{@constructor.name}"
    row = @query.rowByPosition(0)
    dom = $(template(row))
    @$el.append dom

    # Append data dump to the DOM
    table = dom.find('tbody')
    for i in [0..122]
      table.append $(template_row
        id: i+1
        text: application.questions[i].question
        answer: row['q'+i]
      )

    this
