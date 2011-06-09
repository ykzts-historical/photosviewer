
class URIRules
  constructor: (base_path) ->
    this.base_path = base_path or '/'
    this.path_rules = []
    this.http404 = ->
      root_node = document.getElementsByTagName('html').item(0)
      root_node.textContent = '404 not found.'
      return

    return

  set: (path_rule, func) ->
    path_rule = this.get_fullpath(path_rule)
    #path_rule = path_rule.replace(/\%s/g, '(\\w+)')
    path_rule = path_rule.replace(/\//g, '\\/')
    #path_rule = path_rule.replace(/\?/g, '\\?')
    re = new RegExp("^#{path_rule}$")
    this.path_rules.push([re, func])

    return this

  change: (path) ->
    path = this.get_fullpath(path)
    window.history.pushState({}, null, path) if window.history.pushState?
    for [re, func] in this.path_rules
      res = re.exec(path)
      if res
        title = func.apply(this, res)
        document.getElementsByTagName('title').item(0).textContent = title
        return path
    this.http404()

    return path

  get_fullpath: (path) ->
    ary = ['']
    for s in this.base_path.split('/').concat(path.split('/'))
      ary.push(s) if s
    return ary.join('/')
