application = require 'application'
util = require 'util'

module.exports = class ProfileView extends Backbone.View
  id: 'profile-table'

  initialize: (@countryName,mode) ->
    if mode=='table'
      @template = require 'views/templates/profile_table'
    else if mode=='grid'
      @template = require 'views/templates/profile_grid'
    else throw mode+' is not a recognized mode.'
    @renderData = 
      countries: application.countries
    if not @countryName
      return
    # Populate @renderData
    query = application.answers.rows( (row)=>row.country==@countryName )
    if not query.length
      throw ('"'+@countryName+'" not in dataset.')
    row = query.rowByPosition(0)
    _.extend @renderData,
      country: row.country
      data: @getData(row,i) for i in [1..123] 
    @renderData.data_sorted = @renderData.data.slice(0)
    @renderData.data_sorted.sort( (a,b) -> 
      if a.answer.letter > b.answer.letter 
        return 1
      if a.answer.letter < b.answer.letter
        return -1
      return a.id - b.id
    )

  getData:  (row,i) ->
    id: i
    question: application.questions[i].question
    answer: util.answerDict(row,i)

  mouseout_stripe: (e) ->
    if not @stripe_text
      @stripe_text = $('.stripe-text')
    @stripe_text.hide()

  mouseover_stripe: (e) ->
    if not @stripe_text
      @stripe_text = $('.stripe-text')
    id = $(e.currentTarget).attr('data-id')
    answer = $(e.currentTarget).attr('data-answer')
    answerText = application.questions[id][answer]
    question = application.questions[id].question
    @stripe_text.show().html '<b>Question '+id+':</b> '+question+'<br/><br/><b>'+answer.toUpperCase()+':</b> '+answerText

  render: =>
    dom = @template @renderData
    @$el.append dom
    this

  post_render: =>
    $('.pie').peity('pie')
    $('.bar').peity('bar_multicolour', {colour: ['#faeac8', '#f8c175', '#f5854e', '#cb3727']} )
    $('.stripe').mouseover(@mouseover_stripe)
    $('.country-stripes').mouseout(@mouseout_stripe)



