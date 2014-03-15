define ->
  getURLParameters = (url) ->
    params = {}
    url = url.split('?').pop().split('&')
    for item in url
      tmp = item.split('=')
      params[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1])
    return params
  return getURLParameters
