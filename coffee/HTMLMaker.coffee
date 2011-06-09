
class HTMLMaker
  constructor: (doc) ->
    this.doc = doc or document

    return

  html: (node_name, children) ->
    self = this
    node = null
    children = children or []
    unless children instanceof Array
      children = [children]
    node_name.replace(/^(@|attribute:)?(.+)$/, (_, prefix, name) ->
      if prefix
        node = self.attribute(name, children[0])
      else
        node = self.element(name, children)
      return
    )
    return node

  element: (name, children) ->
    node = this.doc.createElement(name)
    for child in children
      if typeof child is 'string'
        child = this.doc.createTextNode(child)
      switch child.nodeType
        when 1
          node.appendChild(child)
        when 2
          node.setAttributeNode(child)
        when 3
          node.appendChild(child)
    return node

  attribute: (name, value) ->
    node = this.doc.createAttribute(name)
    node.value = value
    return node
