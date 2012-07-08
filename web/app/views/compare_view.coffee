template = require 'views/templates/compare'
application = require 'application'

# TODO this is violating DRY...
answerDict = (row, answerIndex) ->
  id: answerIndex
  question: application.questions[answerIndex].question
  letter: row['l'+answerIndex]
  number: row['n'+answerIndex]

module.exports = class CompareView extends Backbone.View
  initialize: (@countries) ->
    data = []
    all_answers = (@lookup_row c for c in @countries)
    for i in [1..application.questions.length-1]
        answers = (row['l'+i] for row in all_answers)
        data.push
          id: i
          question: application.questions[i].question
          answers: answers
    @renderData = 
      countries: @countries
      title: @countries.join(', ')
      view_without: (@view_without c for c in @countries)
      data: data

  lookup_row: (country) =>
    query = application.answers.rows( (row)=>row.country==country )
    if not query.length
      throw ('"'+country+'" not in dataset.')
    query.rowByPosition(0)

  view_without: (withoutMe) =>
    filtered = _.without @countries, withoutMe
    name: withoutMe
    link: '#compare/'+filtered.join('/')

  view_with: (withMe) =>
    a = @countries.slice(0)
    a.push withMe
    return a

  render: =>
    dom = $(template(@renderData))
    @$el.append dom
    this
  

