template = require 'views/templates/rankings'
application = require 'application'
util = require 'util'

module.exports = class RankingsView extends Backbone.View
  initialize: (@category,@region) ->
    @renderData = 
      groupings: application.groupings
      regions: application.regions
      data: @generateData()
    # Used to render the template
    Handlebars.registerHelper 'category_selected', (category) =>
      if category==@category then 'selected' else ''
    Handlebars.registerHelper 'region_selected', (region) =>
      if region==@region then 'selected' else ''
  
  generateData: ->
    out = []
    region = _.filter(application.regions, ( (o)=>o.id==@region ))[0]
    questions = application.groupingsMap[@category]

    getRow = (country) ->
      query = application.answers.rows( (row)=>row.country==country)
      row = query.rowByPosition(0)
      data = []
      score = 0
      for i in questions
        d = util.answerDict(row,i)
        score += d.number
        data.push
          id: i
          answer: d
      data.sort(util.answerComparator)
      country: country+' ('+score+')'
      answers: data
      score: score
    (getRow c for c in region.entries).sort( (a,b)->b.score-a.score )
  
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

  click_choose_group: (event) =>
    category = $(event.target).val()
    Backbone.history.navigate( @route(category,@region), {trigger: true})

  click_choose_region: (event) =>
    region = $(event.target).val()
    Backbone.history.navigate( @route(@category,region), {trigger: true})

  killStripe: ->
    if not @stripe_text
      @stripe_text = $('.rankings-tooltip')
    @stripe_text.hide()

  mouseout_stripe: (e) =>
    if not @timer
      @timer = setTimeout(@killStripe, 100)

  mouseover_stripe: (e) ->
    t = $(e.target)
    if not @stripe_text
      @stripe_text = $('.rankings-tooltip')
    id = t.attr('data-id')
    answer = t.attr('data-answer')
    if id and answer
      if @timer
        window.clearTimeout @timer
        @timer = null
      answerText = application.questions[id][answer]
      question = application.questions[id].question
      @stripe_text.show()
      @stripe_text.html '<b>Question '+id+':</b> '+question+'<br/><br/><b>'+answer.toUpperCase()+':</b> '+answerText
      offset = t.offset()
      offset.left += 6
      offset.top += 25
      @stripe_text.css offset


  post_render: =>
    @$el.find('#compare-choose-group').change(@click_choose_group).chosen()
    @$el.find('#compare-choose-region').change(@click_choose_region).chosen()
    $('.rankings-table').mouseover(@mouseover_stripe)
    $('.rankings-table').mouseout(@mouseout_stripe)
    $('.rankings-tooltip').mouseover(@killstripe)

