template_page = require 'views/templates/page/rankings'
template_ranking_column = require 'views/templates/ranking_column'

reportGenerator = require 'views/reportgenerator'

module.exports = class RankingsPage extends Backbone.View

    ##################
    ## Public methods
    ##################
    renderPage: (target) =>
        # Write to DOM
        @$el.html template_page()
        target.html @$el
        # Bind to on-page elements
        $('#ranking-toggle-button').toggleButtons
            onChange: @_onRankingViewChange
            width: 160
            style:
                disabled: 'primary'
            label: 
                enabled: "Ranking"
                disabled: "Score"
        reportGenerator.bind 'update', @_updateReport
        reportGenerator.bind 'resize', @_redrawJsPlumb
        @_updateReport()

    ##################
    ## Private methods
    ##################
    _onRankingViewChange: (el,@showRankings=true) =>
        if @showRankings
            $('.ranking-cell-score').hide()
            $('.ranking-cell-rank').show()
        else
            $('.ranking-cell-rank').hide()
            $('.ranking-cell-score').show()

    _calculateScore: (db, questionSet) ->
        acc = 0
        count = 0
        for x in questionSet
            if db[x] >= 0
                acc += db[x]
                count++
        return Math.round( acc / count )

    _buildRankingTable: (year, questionSet) =>
        # Basic dataset
        out = []
        for country in _EXPLORER_DATASET.country
            if not (('db_'+year) of country) then continue
            score = @_calculateScore country['db_'+year], questionSet
            out.push 
                country: country.name
                alpha2: country.alpha2
                score: score
        out.sort @_sortFunction
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
            x.ranking = rank
        # Append an equals sign where scores are neck-and-neck
        for x in out
            if x.score in tag_duplicates
                x.ranking = '= '+x.ranking
        return out

    _sortFunction: (a,b) ->
        x = b.score - a.score 
        if not x
            return a.country.localeCompare b.country
        return x

    _updateReport: =>
        questionSet = reportGenerator.questionSet()
        if questionSet.length == 0
            $('#ranking-columns').html '(no questions selected)'
            return
        # Render
        $('#ranking-columns').empty()
        for year in [2006,2008,2010,2012]
            $('#ranking-columns').append $( 
                template_ranking_column
                    year: year
                    data: @_buildRankingTable(year, questionSet)
            )
        $('.rankings-table tr').bind 'mouseover', @_mouseoverRanking
        # Pre-select the top-most entrant in the latest results
        $('#ranking-column-2012 tbody tr:first-child').trigger 'mouseover'
        @_onRankingViewChange null,@showRankings

    _mouseoverRanking: (e) =>
        el = $(e.delegateTarget)
        alpha2 = el.attr('data-alpha2')
        if not alpha2 then return
        @_redrawJsPlumb alpha2

    _redrawJsPlumb: (alpha2=null) =>
        if alpha2 then @mouseoverAlpha2 = alpha2
        @$el.find('.rankings-table tr.hover').removeClass 'hover'
        els = @$el.find('.ranking-row-'+@mouseoverAlpha2)
        els.addClass 'hover'
        jsPlumb.deleteEveryEndpoint()
        for x in [0...els.length-1]
            jsPlumb.connect {source: els[x], target: els[x+1], overlays: jsPlumb._custom_overlay}

        

