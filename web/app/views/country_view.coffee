# TODO these could be combined into a single template, given HBS' power
template = require 'views/templates/country'
template_row = require 'views/templates/country_row'
application = require 'application'

module.exports = class CountryView extends Backbone.View
  initialize: (@countryName) ->
    query = application.answers.rows( (row)=>row.country==@countryName )
    if not query.length
      throw ('"'+@countryName+'" not in dataset.')
    @row = query.rowByPosition(0)

  render: =>
    # console.debug "Rendering #{@constructor.name}"
    dom = $(template(@row))
    @$el.append dom

    # Append data dump to the DOM
    table = dom.find('tbody')
    for i in [1..123]
      table.append $(template_row
        id: i
        text: application.questions[i].question
        answer_number: @row['n'+i]
        answer_letter: @row['l'+i]
      )

    this
