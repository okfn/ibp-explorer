util = require 'util'
# The application bootstrapper.
Application =
  initialize: (rawdata) ->
    HomeView = require 'views/home_view'
    Router = require 'router'

    @questions = rawdata.questions

    @answers = new Miso.Dataset({
      data: rawdata.answers
    })
    @answers.fetch()

    @groupings = rawdata.groupings
    # Add in a global grouping
    @groupings.unshift 
      by: 'All'
      entries: [
        title: 'Show All Questions'
        qs: [1..123]
      ]
    @groupingsMap = @generateGroupingsMap @groupings

    @countries = (@get_country(row) for row in rawdata.answers )

    @regions = @getRegions rawdata.regions

    # Static view components
    @homeView = new HomeView()

    # Instantiate the router
    @router = new Router()
    # Freeze the object
    Object.freeze? this
    window.t = rawdata.answers[0]

  get_country: (row) ->
    values = _.values(row)
    count = (countMe) -> (a,e) -> a+(e==countMe)
    name: row.country
    count_a: _.reduce(values, count('a'), 0 )
    count_b: _.reduce(values, count('b'), 0 )
    count_c: _.reduce(values, count('c'), 0 )
    count_d: _.reduce(values, count('d'), 0 )
    count_e: _.reduce(values, count('e'), 0 )

  generateGroupingsMap: (groupings) ->
    out = {}
    _.each groupings, (group) =>
      _.each group.entries, (entry) =>
        if entry.title=='Show All Questions'
          entry.id = ''
        else 
          entry.id = util.stringToUrl(entry.title)
          # Deduplication hack
          while out[entry.id]
            entry.id += '_'
        out[entry.id] = entry.qs
    out

  getRegions: (raw) ->
    out = []
    filterList = (list) =>
      valid_countries = (c.name for c in @countries)
      _.filter list, (country) =>
        if not _.contains valid_countries, country
          console.warn('Warning: '+country+' listed in regions but not in dataset.')
          return false
        return true

    $.each raw, (k,v) ->
      out.push
        title: k
        entries: filterList(v)
        id: util.stringToUrl(k)
    # Pop a list of 'all regions' on the front
    out.unshift 
      title: 'All Regions'
      id: ''
      entries: _.reduce(out, ((l,o)->l.concat(o.entries)),[]).sort()
    return out


module.exports = Application
