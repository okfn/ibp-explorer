Router = require('router')

loadDataset = ->
    assert(_EXPLORER_DATASET!=null, 'Failed to load dataset.')
    g = _EXPLORER_DATASET.groupings
    assert(g[0].by=="General", 'Unexpected _EXPLORER_DATASET structure.')
    # Insert a couple of extra groupings
    g[0].entries.push
        title: '(Select all)'
        qs: [0..125]
    g[0].entries.push
        title: '(Clear all)'
        qs: []
    # Assign an ID to all groupings
    id = 0
    for x in g
        for y in x.entries
            y.group_id = id++

initJsPlumb = ->
    color = '#aaa'
    jsPlumb.importDefaults
        Anchors :  [ 'RightMiddle', 'LeftMiddle' ]
        PaintStyle : { strokeStyle:color, lineWidth:2 }
        Endpoint : 'Blank'
        EndpointStyle : { radius:9, fillStyle:color }
        Connector : [ "Bezier", {curviness: 30} ]
        #DragOptions : { cursor: "pointer", zIndex:2000 },
        #HoverPaintStyle : {strokeStyle:"#ec9f2e" },
        #EndpointHoverStyle : {fillStyle:"#ec9f2e" },			
      arrowCommon = { foldback:0.8, fillStyle:color, width:9, length: 10 }
      jsPlumb._custom_overlay = [
        [ "Arrow", { location:0.5 }, arrowCommon ]
      ]

$ ->
    initJsPlumb()
    loadDataset()
    router = new Router()
    Backbone.history.start()
