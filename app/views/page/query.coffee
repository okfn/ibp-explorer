template_page = require 'views/templates/page/query'
template_report = require 'views/templates/report'

module.exports = class ProjectPage extends Backbone.View
    clickExpand: (e) ->
        e.preventDefault()
        $(e.currentTarget).parents('.text').first().trigger 'destroy'
        return false

    hoverGroupToggle: (e) =>
        el = $(e.srcElement)
        group = el.attr('id')
        $('.toggle-boxes .'+group).addClass 'hover'

    clickGroupToggle: (e) =>
        e.preventDefault()
        el = $(e.srcElement)
        group = el.attr('id')
        $('.toggle-boxes .toggle-box').removeClass 'select'
        $('.toggle-boxes .'+group).addClass 'select'
        @updateReport()
        return false

    clickBoxToggle: (e) =>
        e.preventDefault()
        el = $(e.srcElement)
        if el.hasClass 'select'
            el.removeClass 'select'
        else
            el.addClass 'select'
        @updateReport()
        return false

    showQuestion: (e) ->
        el = $(e.delegateTarget)
        id = el.attr('id')
        assert id.substr(0,7) is 'toggle-'
        id = parseInt id.substr(7)
        q_box = $('#question-view')
        q_box.html 'question '+id
        q_box.show()

    hideQuestion: (e) ->
        q_box = $('#question-view')
        q_box.hide()

    questionSet: ->
        el = $('.toggle-box.select')
        out = []
        if el.length==0
            return out
        for e in el
            out.push parseInt $(e).attr('id').substr(7)
        return out

    mouseoverRanking: (alpha2) ->
        els = $('.ranking-row-'+alpha2)
        $('.rankings-table tr').removeClass 'hover'
        els.addClass 'hover'
        jsPlumb.deleteEveryEndpoint()
        jsPlumb.connect {source: els[0], target: els[1], overlays: jsPlumb._custom_overlay}
        jsPlumb.connect {source: els[1], target: els[2], overlays: jsPlumb._custom_overlay}

    updateReport: =>
        questionSet = @questionSet()
        if questionSet.length == 0
            $('#report').html '(no questions selected)'
            return
        getScore = (db) ->
            if db is undefined
                return -1
            acc = 0
            count = 0
            for x in questionSet
                if db[x] >= 0
                    acc += db[x]
                    count++
            return Math.round( acc / count )
        getAllScores = (country) ->
            country: country.name
            alpha2: country.alpha2
            score_2006: getScore country.db_2006
            score_2008: getScore country.db_2008
            score_2010: getScore country.db_2010
        countryComparator = (a,b) ->
            x = b.score - a.score
            if x==0 
                if b.alpha2 > a.alpha2 then return 1
                if b.alpha2 < a.alpha2 then return -1
            return x
        scores = ( getAllScores(x) for x in _EXPLORER_DATASET.country )
        scores.sort countryComparator
        # Compute rankings
        rankings = {}
        for year in ['2006','2008','2010']
            out = ( { country: x.country, alpha2: x.alpha2, score: x['score_'+year] } for x in scores )
            out.sort countryComparator
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
            for x in out
                if x.score in tag_duplicates
                    x.ranking += ' ='
            rankings['r'+year] = out
        # Render
        $('#report').html template_report { scores:scores, rankings: rankings }
        $('.rankings-table tr').bind 'mouseover', (e) => 
            el = $(e.delegateTarget)
            alpha2 = el.attr('data-alpha2')
            if alpha2 then @mouseoverRanking alpha2
        # Pre-select the top-most entrant in the latest results
        preselect = $('#rankings-2010 tbody tr:first-child').attr('data-alpha2')
        console.log 'preselect ',preselect
        @mouseoverRanking preselect

    renderPage: (target) =>
        renderData = 
            country: _EXPLORER_DATASET.country
            groupings0: _EXPLORER_DATASET.groupings.slice(0,2)
            groupings1: _EXPLORER_DATASET.groupings.slice(2,4)
            groupings2: _EXPLORER_DATASET.groupings.slice(4,6)
            question: []
        id = 0
        for qnum, qdata of _EXPLORER_DATASET.question
            qnum = parseInt(qnum)
            q = _.extend {
                groups: []
            }, qdata
            # Tag the question with a list of parent groups
            for category in _EXPLORER_DATASET.groupings
                for group in category.entries
                    if group.qs.contains qnum
                        q.groups.push ('group-'+group.group_id)
            renderData.question.push q
        # Write to DOM
        @$el.html template_page renderData
        target.html @$el

        # Bind to DOM
        $('.question .text').each (i,el) =>
            el = $(el)
            el.dotdotdot {
                height: 60
                after: 'a.expand'
                ellipsis: '  '
                callback: (isTruncated) =>
                    expandLink = el.find('a.expand')
                    if isTruncated
                        expandLink.click @clickExpand
                    else
                        expandLink.remove()
            }
            el.bind 'destroy', (e) -> el.find('a.expand').remove()
        $('.group-toggler').bind 'mouseover', @hoverGroupToggle        
        $('.group-toggler').bind 'click', @clickGroupToggle
        $('.group-toggler').bind 'mouseout', (e) =>
            $('.toggle-boxes .toggle-box').removeClass 'hover'
        $('.toggle-box').bind 'click', @clickBoxToggle
        $('.toggle-box').bind 'mouseover', @showQuestion
        $('.toggle-box').bind 'mouseout', @hideQuestion
        # By default, display the Open Budget Index
        $('.toggle-boxes .group-0').addClass 'select'
        @updateReport()


