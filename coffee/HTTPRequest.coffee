
class HTTPRequest
  constructor: ->
    this.node_http = if require? then require('http') else null
    this.method = 'GET'
    this.uri = null
    this.status = null
    this.readyState = 0
    this.onreadystatechange = ->
      return
    this.responseText = null
    this.responseXML = null
    this.responseJSON = null

    return

  open: (method, uri) ->
    this.method = method
    this.uri = uri
    this.ready_state_change(1)

    return

  send: () ->
    self = this
    callback = (json) ->
      self.status = 200
      self.responseJSON = json
      self.ready_state_change(4)
      return

    this.ready_state_change(2)
    this[(if this.node_http then 'http' else 'jsonp') + '_request'](callback)

    return

  ready_state_change: (ready_state) ->
    this.readyState = ready_state
    this.onreadystatechange()

    return

  http_request: (callback) ->
    self = this
    uri = require('url').parse(this.uri)
    req = node_http.request({
      host: uri.hostname
      port: uri.port
      path: uri.pathname + (uri.search or '')
      method: self.method
    }, (res) ->
      data = ''
      res.setEncoding('utf-8')
      res.on('data', (chunk) ->
        data += chunk
        return
      ).on('end', ->
        data.replace(/\{[\w\W]+\}/, (json) ->
          callback(JSON.parse(json))
          return
        )
        return
      )
    )
    req.end()

    return

  jsonp_request: (callback) ->
    func_name = '______calback_' + (new Date()).getTime()
    uri = this.uri + (if '?' in this.uri then '&' else '?') + 'callback=' + func_name
    window[func_name] = (json) ->
      callback(json)
      delete window[func_name]
      return

    script_elem = document.createElement('script')
    script_elem.setAttribute('type', 'application/javascript')
    script_elem.setAttribute('src', uri)
    document.getElementsByTagName('body').item(0).appendChild(script_elem)

    return
