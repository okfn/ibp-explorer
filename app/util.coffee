module.exports = 
    sortFunction: (a,b) ->
        x = b.score - a.score 
        if not x
            return a.country.localeCompare b.country
        return x

    sortFunctionByName: (a,b) ->
        x = a.country.localeCompare b.country
        if not x
            x = b.score - a.score 
        return x
