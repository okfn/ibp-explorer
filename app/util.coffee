module.exports = 
    sortFunction: (a,b) ->
        x = b.score - a.score 
        if not x
            return a.country.localeCompare b.country
        return x
