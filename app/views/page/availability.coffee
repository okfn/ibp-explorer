template_page = require 'views/templates/page/availability'
template_row = require 'views/templates/availability_row'

reportGenerator = require 'views/reportgenerator'

module.exports = class ProjectPage extends Backbone.View

    ##################
    ## Public methods
    ##################
    initialize: ->

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el
        $('#year-toggles button').click @_yearToggle
        $('button[data-year="2012"]').click()


    ##################
    ## Private methods
    ##################
    _yearToggle: (e) =>
        target = $(e.delegateTarget)
        $('#year-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        @_repaint()

    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) =>
        tbody = $('#availability tbody')
        tbody.empty()
        for row in _EXPLORER_DATASET.availability
            key = 'db_'+@year
            if not (key of row) then continue
            tbody.append template_row row[key]
        console.log @year
        

