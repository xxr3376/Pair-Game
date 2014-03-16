define ->
  type =
    _uniqId: 10000,
    createEnum: (values) ->
      result = {}
      for t in values
        result[t] = ++@._uniqId
      return result
  return type
