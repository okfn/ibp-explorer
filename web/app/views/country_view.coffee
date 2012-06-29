template = require 'views/templates/country'
application = require 'application'

answerDict = (row, answerIndex) ->
  id: answerIndex
  question: application.questions[answerIndex].question
  letter: row['l'+answerIndex]
  number: row['n'+answerIndex]

module.exports = class CountryView extends Backbone.View
  initialize: (@countryName) ->
    query = application.answers.rows( (row)=>row.country==@countryName )
    if not query.length
      throw ('"'+@countryName+'" not in dataset.')
    row = query.rowByPosition(0)
    @renderData = { 
      country: row.country
      answers: answerDict(row,i) for i in [1..123] 
    }

  render: =>
    dom = $(template(@renderData))
    @$el.append dom
    this
