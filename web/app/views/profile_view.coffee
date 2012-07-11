template = require 'views/templates/profile'
application = require 'application'

module.exports = class ProfileView extends Backbone.View
  template: template
  id: 'profile-table'

  answerDict: (row, answerIndex) ->
    letter = row['l'+answerIndex]
    letter_processed = letter.toUpperCase()
    if letter_processed=='E'
      letter_processed = 'n/a'
    number = row['n'+answerIndex]
    id: answerIndex
    question: application.questions[answerIndex].question
    letter: letter
    letter_processed: letter_processed
    render_pie_chart: number>=0
    number: number

  initialize: (@countryName) ->
    if not @countryName
      @renderData = 
        country: '<span style="font-weight: normal; font-style: italic;">(select a country)</span>'
        countries: application.answers.column('country').data
    else 
      query = application.answers.rows( (row)=>row.country==@countryName )
      if not query.length
        throw ('"'+@countryName+'" not in dataset.')
      row = query.rowByPosition(0)
      @renderData = 
        country: row.country
        answers: @answerDict(row,i) for i in [1..123] 
        countries: application.answers.column('country').data

  render: =>
    dom = template @renderData
    @$el.append dom
    this

  post_render: =>
    $('.pie').peity('pie')

