template = require 'views/templates/country'
sidebar_template = require 'views/templates/country_sidebar'
application = require 'application'

answerDict = (row, answerIndex) ->
  id: answerIndex
  question: application.questions[answerIndex].question
  letter: row['l'+answerIndex]
  number: row['n'+answerIndex]

module.exports = class CountryView extends Backbone.View
  id: 'view-country'
  initialize: (@countryName) ->
    if not @countryName
      @renderData = 
        country: '<em>(none)</em>'
    else 
      query = application.answers.rows( (row)=>row.country==@countryName )
      if not query.length
        throw ('"'+@countryName+'" not in dataset.')
      row = query.rowByPosition(0)
      @renderData = 
        country: row.country
        answers: answerdict(row,i) for i in [1..123] 

  render: =>
    dom = $(template(@renderData))
    @$el.append dom
    this

  sidebar: =>
    sidebarData = 
      countries: application.answers.column('country').data
    sidebar_template(sidebarData) 

