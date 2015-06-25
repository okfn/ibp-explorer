template_page = require 'views/templates/page/availability'
template_row = require 'views/templates/availability_row'

reportGenerator = require 'views/reportgenerator'

module.exports = class ProjectPage extends Backbone.View

    regionId: [0]

    ##################
    ## Public methods
    ##################
    initialize: ->
        

    renderPage: (target) =>
        reportGenerator.update('2015', false)
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
        lastYear = $('#year-toggles button.active').attr('data-year')
        currentYear = target.attr('data-year')
        newReport = (lastYear == '2015' || currentYear == '2015')
        $('#year-toggles button').removeClass 'active'
        target.addClass 'active'
        @year = $(e.delegateTarget).attr('data-year')
        if newReport
            reportGenerator.update(@year, false)
        @_repaint()

    _findScore: (dataset,country,year) ->
        for x in dataset
            if x.alpha2==country
                return x[year]
        assert false, 'couldnt find country: '+country

    _repaint: (dataset=reportGenerator.dataset, questionSet=reportGenerator.questionSet, region=reportGenerator.region) =>
        tbody = $('#availability tbody')
        tbody.empty()
        if @year != '2015'
            datasetRegions = _EXPLORER_DATASET.regions_old
            datasetAv = _EXPLORER_DATASET.availability_old
        else
            datasetRegions = _EXPLORER_DATASET.regions
            datasetAv = _EXPLORER_DATASET.availability
        countriesIncluded = []
        for reg in @regionId
            for contained in datasetRegions[reg].contains
                countriesIncluded.push(contained)
        for row in datasetAv
            key = 'db_'+@year
            if not (key of row) then continue
            if not (row[key].alpha2 in countriesIncluded) then continue
            obj = row[key]
            obj.score = @_findScore dataset,row[key].alpha2,@year
            tbody.append template_row obj
        
    clickregion: (e) =>
        e.preventDefault()
        target = $(e.delegateTarget)
        selected = parseInt target.attr('id').replace('region-','')
        if selected == 0
           @regionId = [0]
           @$el.find('.av-region-toggler').removeClass 'active'
           target.addClass 'active'
        else
            if target.hasClass 'active'
                target.removeClass 'active'
                index = @regionId.indexOf(selected)
                if index >= 0
                    @regionId.splice(index, 1)
                if @regionId.length == 0
                    @regionId.push(0)
                    @$el.find('#region-0.av-region-toggler').addClass 'active'
            else
                if @$el.find('#region-0.av-region-toggler').hasClass 'active'
                    @$el.find('#region-0.av-region-toggler').removeClass 'active'
                    index = @regionId.indexOf(0)
                    if index >= 0
                        @regionId.splice(index, 1)
                @regionId.push(selected)
                target.addClass 'active'
        @_repaint()
        return false
