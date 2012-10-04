Router = require('router')

loadDataset = ->
    assert(_EXPLORER_DATASET!=null, 'Failed to load dataset.')
    # Assign an ID to all groupings
    id = 0
    for x in _EXPLORER_DATASET.groupings
        for y in x.entries
            y.group_id = id++
    # Assign group IDs to all questions
    id = 0
    for qnum, qdata of _EXPLORER_DATASET.question
        qnum = parseInt(qnum)
        qdata.groups = []
        # Tag the question with a list of parent groups
        for category in _EXPLORER_DATASET.groupings
            for group in category.entries
                if group.qs.contains qnum
                    qdata.groups.push ('group-'+group.group_id)

initJsPlumb = ->
    color = '#aaa'
    jsPlumb.importDefaults
        Anchors :  [ 'RightMiddle', 'LeftMiddle' ]
        PaintStyle : { strokeStyle:color, lineWidth:2 }
        Endpoint : 'Blank'
        EndpointStyle : { radius:9, fillStyle:color }
        Connector : [ "Bezier", {curviness: 30} ]
      arrowCommon = { foldback:0.8, fillStyle:color, width:9, length: 10 }
      jsPlumb._custom_overlay = [
        [ "Arrow", { location:0.5 }, arrowCommon ]
      ]

$ ->
    initJsPlumb()
    loadDataset()
    router = new Router()
    Backbone.history.start()
