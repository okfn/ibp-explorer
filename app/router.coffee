GithubView = require 'views/page_github'
PersonView = require 'views/page_people'
ProjectPage = require 'views/page_project'
MailmanView = require 'views/page_mailman'
TwitterView = require 'views/page_twitter'

# Function to consistently target the main div
content = -> $('#content')
# Generator of singleton view pages
singletons =
    githubView:  -> return @_github = @_github or new GithubView()
    personView:  -> return @_person = @_person or new PersonView()
    projectPage: -> return @_project = @_project or new ProjectPage()
    mailmanView: -> return @_mailman = @_mailman or new MailmanView()
    twitterView: -> return @_twitter = @_twitter or new TwitterView()

module.exports = class Router extends Backbone.Router
    routes:
        '': 'hello'
    hello: ->
      content().html '<iframe width="900" height="460" scrolling="no" frameborder="no" src="https://www.google.com/fusiontables/embedviz?viz=MAP&amp;q=select+col0%3E%3E1+from+1VHNhuYeDjeOfaz0nOr8cB3e3Ch1K41SO0D89MWU&amp;h=false&amp;lat=56.984365424637964&amp;lng=-290.390625&amp;z=2&amp;t=1&amp;l=col0%3E%3E1&amp;y=2&amp;tmplt=-1"></iframe>'

###
        'person': 'person'
        'project': 'project'
        'project/:projectName': 'project'
        'github': 'github'
        'github/:graphmode': 'github'
        'mailman': 'mailman'
        'twitter': 'twitter'

    initialize: ->
        # Trigger nav updates
        @on 'all', (trigger) =>
            location = (window.location.hash.slice(1))
            trigger = trigger.split(':')
            if trigger[0]=='route'
              $('.navbar .nav li').removeClass 'active'
              active = $('.navbar .nav li[action="'+location+'"]')
              active.add( active.parents('.dropdown') ).addClass 'active'

    setCurrent: (view) =>
        if not (view==@currentView)
            @currentView = view
            view.renderPage content()

    ## Router Paths
    ## ------------
    #
    person: ->
        @setCurrent singletons.personView()
    project: (projectName='okfn') ->
        view = singletons.projectPage()
        if not view==@currentView
            @currentView = view
        view.renderPage content(), projectName
    github: (graphMode='watchers') ->
        @setCurrent singletons.githubView()
        singletons.githubView().showGraph graphMode
    mailman: ->
        @setCurrent singletons.mailmanView()
    twitter: ->
        @setCurrent singletons.twitterView()
    recline: ->
        @setCurrent singletons.reclineView()
###
