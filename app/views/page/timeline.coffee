template_page = require 'views/templates/page/timeline'
template_timeline_column = require 'views/templates/timeline_column'
template_timeline_column_abbr = require 'views/templates/timeline_column_abbr'
util = require 'util'

reportGenerator = require 'views/reportgenerator'

module.exports = class TimelinePage extends Backbone.View

    ##################
    ## Public methods
    ##################
    initialize: =>
        @_initializeReport()

    renderPage: (target) =>
        collapsed = false
        if $('#accordion2 .accordion-toggle').hasClass 'collapsed'
            collapsed = true
        reportGenerator.update('2015', collapsed, true)
        $(window).scrollTop(0)
        # Write to DOM
        @$el.html template_page()
        target.html @$el
        # Bind to on-page elements
        $('input[name="timeline"]').bind 'change', @_onToggleMode
        @_updateReport()

    ##################
    ## Private methods
    ##################
    _initializeReport: =>
        reportGenerator.update('2015', false, true)
        lastReport =
            dataset: reportGenerator.dataset
            region: reportGenerator.region
            dataset_unrounded: reportGenerator.dataset_unrounded
        reportGenerator.update('2006', false, true)
        oldReport =
            dataset: reportGenerator.dataset
            dataset_unrounded: reportGenerator.dataset_unrounded
        @timelineReport =
            dataset: []
            region: lastReport.region
            dataset_unrounded: []
        for country_last in lastReport.dataset_unrounded
            for country_old in oldReport.dataset_unrounded
                if country_last.alpha2 == country_old.alpha2
                    obj =
                        alpha2: country_last.alpha2
                        country: country_last.country
                    if '2006' of country_old
                        obj['2006'] = country_old['2006']
                    if '2008' of country_old
                        obj['2008'] = country_old['2008']
                    if '2010' of country_old
                        obj['2010'] = country_old['2010']
                    if '2012' of country_old
                        obj['2012'] = country_old['2012']
                    obj['2015'] = country_last['2015']
                    @timelineReport.dataset_unrounded.push(obj)
        for country_last in lastReport.dataset
            for country_old in oldReport.dataset
                if country_last.alpha2 == country_old.alpha2
                    obj =
                        alpha2: country_last.alpha2
                        country: country_last.country
                    if '2006' of country_old
                        obj['2006'] = country_old['2006']
                    if '2008' of country_old
                        obj['2008'] = country_old['2008']
                    if '2010' of country_old
                        obj['2010'] = country_old['2010']
                    if '2012' of country_old
                        obj['2012'] = country_old['2012']
                    obj['2015'] = country_last['2015']
                    @timelineReport.dataset.push(obj)

    _onToggleMode: (showRank=true) =>
        value = $('input[name="timeline"]:checked').val()
        assert value in ['rankings','scores']
        if value=='rankings'
            $('.timeline-cell-score').hide()
            $('.timeline-cell-rank').show()
        else
            $('.timeline-cell-rank').hide()
            $('.timeline-cell-score').show()

    _buildRankingTable: (year, dataset, selected_countries) =>
        # Basic dataset
        out = []
        for country,obj of dataset
            if not (year of obj) then continue
            if not (obj.alpha2 in selected_countries) then continue
            obj.score = obj[year]
            out.push obj
        out.sort util.sortFunction
        # Add 'rank' field
        rank = 0
        latest = 999
        n = 0
        tag_duplicates = []
        for x in out
            n += 1
            if x.score < latest
                latest = x.score
                rank = n
            else
                tag_duplicates.push x.score
            x.rank = rank
        # Append an equals sign where scores are neck-and-neck
        for x in out
            if x.score < 0
                x.rank = 'N/A'
                x.score = 'N/A'
            if x.score in tag_duplicates
                x.rank = '= '+x.rank
            # Round off the raw score we've used here
            x.score = Math.round(x.score)
        return out

    _updateReport: (dataset=@timelineReport.dataset, region=@timelineReport.region, dataset_unrounded=@timelineReport.dataset_unrounded) =>
        target = $('#timeline-columns')
        if target.length==0 then return
        # PreRender
        html = ''
        selected_countries = []
        for reg in region
            for contained in _EXPLORER_DATASET.regions[reg].contains
                selected_countries.push(contained)
        for year in [2006,2008,2010,2012]
            html += template_timeline_column_abbr
                year: year
                data: @_buildRankingTable(year, dataset_unrounded, selected_countries)
        html += template_timeline_column
            year: 2015
            data: @_buildRankingTable(2015, dataset_unrounded, selected_countries)
        # Large DOM rebuild here. Trigger a single reflow.
        target.html html
        target.find('tr').bind 'mouseover', @_mouseoverRanking
        # Pre-select the top-most entrant in the latest results
        if not @mouseoverAlpha2
            @mouseoverAlpha2 = $('#timeline-column-2015 tbody tr:first-child').attr 'data-alpha2'
        @_redrawJsPlumb()
        # Show ranks or scores as appropriate
        @_onToggleMode()

    _mouseoverRanking: (e) =>
        el = $(e.delegateTarget)
        alpha2 = el.attr('data-alpha2')
        if alpha2 and not (alpha2==@mouseoverAlpha2)
            @_redrawJsPlumb alpha2

    _redrawJsPlumb: (alpha2=null) =>
        if alpha2 then @mouseoverAlpha2 = alpha2
        $('.hover').removeClass 'hover'
        els = $('.timeline-row-'+@mouseoverAlpha2)
        if not els.length then return
        els.addClass 'hover'
        jsPlumb.deleteEveryEndpoint()
        # This is expensive, so hold off until the mouse has settled for a few ms
        if @timeout then clearTimeout @timeout
        @timeout = setTimeout( ->
            for x in [0...els.length-1]
                jsPlumb.connect {source: els[x], target: els[x+1], overlays: jsPlumb._custom_overlay}
            @timeout = null
        , 50)
