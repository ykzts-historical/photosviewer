
class Tumblr
  constructor: (username, page) ->
    this.username = username or ''
    this.page = page or 1
    this.type = ''
    this.num = 100
    this.callback = null

    return


  send_request: ->
    return unless this.username and this.callback
    self = this
    start = this.page * this.num - this.num
    uri = this.api_uri(start)
    callback = (json) ->
      self.callback(json)
      delete self.callback
      return

    req = new HTTPRequest()
    req.onreadystatechange = ->
      return unless req.readyState is 4 and req.status is 200
      json = req.responseJSON
      callback(json)
      return
    req.open('GET', uri)
    req.send(null)

    return

  api_uri: (start) ->
    uri = "http://#{this.username}.tumblr.com/api/read/json?"
    query = {
      'type': this.type
      'start': start
      'num': this.num
    }

    uri += ("#{name}=#{value}" for name, value of query).join('&')
    return uri
