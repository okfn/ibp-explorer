template_page = require 'views/templates/page/query'
template_report = require 'views/templates/report'

module.exports = class ProjectPage extends Backbone.View
    clickExpand: (e) ->
        e.preventDefault()
        $(e.currentTarget).parents('.text').first().trigger 'destroy'
        return false

    groups_flat: ->
        out = []

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
        el = $(e.srcElement)
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

    updateReport: =>
        data = []
        questionSet = @questionSet()
        if questionSet.length == 0
            $('#report').html '(no questions selected)'
            return
        getScore = (country) ->
            acc = 0
            count = 0
            for x in questionSet
                n = country.score[x]
                if n >= 0
                    acc += n
                    count++
            return Math.round( acc / count )
        for x in _EXPLORER_DATASET.country
            data.push 
                country: x.alpha2
                score: getScore x
        data.sort (a,b)->b.score-a.score

        $('#report').html template_report data

    renderPage: (target) =>
        groups = _EXPLORER_DATASET.groupings
        groups_flat = []
        id = 0
        for x in groups
            for y in x.entries
                groups_flat.push y
                y.group_id = id++
        renderData = 
            country: _EXPLORER_DATASET.country
            groupings0: groups.slice(0,2)
            groupings1: groups.slice(2,4)
            groupings2: groups.slice(4,6)
            question: []
        id = 0
        for qnum, qdata of _EXPLORER_DATASET.question
            qnum = parseInt(qnum)
            q = _.extend {
                in_index: _EXPLORER_DATASET.questions_in_index.contains qnum
                groups: []
            }, qdata
            # Tag the question with a list of parent groups
            for x in groups_flat
                if x.qs.contains qnum
                    q.groups.push ('group-'+x.group_id)
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
        @updateReport()


