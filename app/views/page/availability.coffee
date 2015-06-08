template_page = require 'views/templates/page/availability'
template_row = require 'views/templates/availability_row'

reportGenerator = require 'views/reportgenerator'

module.exports = class ProjectPage extends Backbone.View

    regionId: 0

    ##################
    ## Public methods
    ##################
    initialize: ->
        

    renderPage: (target) =>
        @$el.html template_page()
        target.html @$el
        $('#year-toggles button').click @_yearToggle
        $('button[data-year="2015"]').click()
        $('.av-region-toggler').click(@clickregion)


    ##################
    ## Private methods
    ##################
    _yearToggle: (e) =>
        target = $(e.delegateTarget)
        $('#year-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        @_repaint()

    _findScore: (dataset,country,year) ->
        for x in dataset
            if x.alpha2==country
                return x[year]
        assert false, 'couldnt find country: '+country

    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) =>
        tbody = $('#availability tbody')
        tbody.empty()
        countriesIncluded = _EXPLORER_DATASET.regions[ @regionId ].contains
        for row in _EXPLORER_DATASET.availability
            key = 'db_'+@year
            if not (key of row) then continue
            if not (row[key].alpha2 in countriesIncluded) then continue
            obj = row[key]
            obj.score = @_findScore dataset,row[key].alpha2,@year
            tbody.append template_row obj
        
     clickregion: (e) =>
         e.preventDefault()
         target = $(e.delegateTarget)
         id = target.attr('id')
         id_num = parseInt(id.substr('7'))
         @regionId = id_num
         @_repaint()
         $('.av-region-toggler').removeClass('active')
         target.addClass('active')
         return false

