'use strict'

function sortFunction(a, b) {
  let x = b.score - a.score
  if (!x) {
    return a.country.localeCompare(b.country)
  }
  return x
}

function sortFunctionByName(a, b) {
  let x = a.country.localeCompare(b.country)
  if (!x) {
    x = b.score - a.score
  }
  return x
}


export  {
  sortFunction,
  sortFunctionByName
}