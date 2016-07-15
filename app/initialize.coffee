#Router = require('router')
Initialize = require('initialize.js')

'''loadDataset = ->
    assert(_EXPLORER_DATASET!=null, 'Failed to load dataset.')
    # 2015 survey dataset
    # Assign an ID to all groupings
    id = 0
    for x in _EXPLORER_DATASET.groupings
        for y in x.entries
            y.group_id = id++
    # Assign group IDs to all questions
    id = 0
    for qnum, qdata of _EXPLORER_DATASET.question
        qdata.groups = []
        # Tag the question with a list of parent groups
        for category in _EXPLORER_DATASET.groupings
            for group in category.entries
                if group.qs.contains qnum
                    qdata.groups.push ('group-'+group.group_id)
    # Create an 'Entire World' region
    entire_world =
        name: 'Entire World'
        contains: []
    for country in _EXPLORER_DATASET.country
        entire_world.contains.push country.alpha2
    _EXPLORER_DATASET.regions.unshift entire_world
    # Attach a region_index to each region
    for index of _EXPLORER_DATASET.regions
        _EXPLORER_DATASET.regions[index].region_index = parseInt index

    # Pre-2015 survey dataset
    # Assign an ID to all groupings
    id = 0
    for x in _EXPLORER_DATASET.groupings_old
        for y in x.entries
            y.group_id = id++
    # Assign group IDs to all questions
    id = 0
    for qnum, qdata of _EXPLORER_DATASET.question_old
        qdata.groups = []
        # Tag the question with a list of parent groups
        for category in _EXPLORER_DATASET.groupings_old
            for group in category.entries
                if group.qs.contains qnum
                    qdata.groups.push ('group-'+group.group_id)
    # Create an 'Entire World' region
    entire_world =
        name: 'Entire World'
        contains: []
    for country in _EXPLORER_DATASET.country_old
        entire_world.contains.push country.alpha2
    _EXPLORER_DATASET.regions_old.unshift entire_world
    # Attach a region_index to each region
    for index of _EXPLORER_DATASET.regions_old
        _EXPLORER_DATASET.regions_old[index].region_index = parseInt index

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
    Backbone.history.start()'''