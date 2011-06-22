var HTMLMaker, HTTPRequest, Tumblr, URIRules;
var __indexOf = Array.prototype.indexOf || function(item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (this[i] === item) return i;
  }
  return -1;
};
HTTPRequest = (function() {
  function HTTPRequest() {
    this.node_http = typeof require !== "undefined" && require !== null ? require('http') : null;
    this.method = 'GET';
    this.uri = null;
    this.timeout = 0;
    this.ontimeout = function() {};
    this.status = null;
    this.readyState = 0;
    this.onreadystatechange = function() {};
    this.responseText = null;
    this.responseXML = null;
    this.responseJSON = null;
    return;
  }
  HTTPRequest.prototype.open = function(method, uri) {
    this.method = method;
    this.uri = uri;
    this.ready_state_change(1);
  };
  HTTPRequest.prototype.send = function() {
    var callback, self;
    self = this;
    callback = function(json) {
      self.status = 200;
      self.responseJSON = json;
      self.ready_state_change(4);
    };
    this.ready_state_change(2);
    this[(this.node_http ? 'http' : 'jsonp') + '_request'](callback);
  };
  HTTPRequest.prototype.ready_state_change = function(ready_state) {
    this.readyState = ready_state;
    this.onreadystatechange();
  };
  HTTPRequest.prototype.http_request = function(callback) {
    var req, self, uri;
    self = this;
    uri = require('url').parse(this.uri);
    req = node_http.request({
      host: uri.hostname,
      port: uri.port,
      path: uri.pathname + (uri.search || ''),
      method: self.method
    }, function(res) {
      var data;
      data = '';
      res.setEncoding('utf-8');
      return res.on('data', function(chunk) {
        data += chunk;
      }).on('end', function() {
        data.replace(/\{[\w\W]+\}/, function(json) {
          callback(JSON.parse(json));
        });
      });
    });
    req.end();
  };
  HTTPRequest.prototype.jsonp_request = function(callback) {
    var func_name, script_elem, self, timeout_id, uri;
    self = this;
    func_name = '______calback_' + (new Date()).getTime();
    uri = this.uri + (__indexOf.call(this.uri, '?') >= 0 ? '&' : '?') + 'callback=' + func_name;
    if (this.timeout) {
      timeout_id = window.setTimeout(function() {
        self.ontimeout();
        delete window[func_name];
      }, this.timeout);
    }
    window[func_name] = function(json) {
      callback(json);
      delete window[func_name];
      if (self.timeout) {
        window.clearTimeout(timeout_id);
      }
    };
    script_elem = document.createElement('script');
    script_elem.setAttribute('type', 'application/javascript');
    script_elem.setAttribute('src', uri);
    document.getElementsByTagName('body').item(0).appendChild(script_elem);
  };
  return HTTPRequest;
})();
HTMLMaker = (function() {
  function HTMLMaker(doc) {
    this.doc = doc || document;
    return;
  }
  HTMLMaker.prototype.html = function(node_name, children) {
    var node, self;
    self = this;
    node = null;
    children = children || [];
    if (!(children instanceof Array)) {
      children = [children];
    }
    node_name.replace(/^(@|attribute:)?(.+)$/, function(_, prefix, name) {
      if (prefix) {
        node = self.attribute(name, children[0]);
      } else {
        node = self.element(name, children);
      }
    });
    return node;
  };
  HTMLMaker.prototype.element = function(name, children) {
    var child, node, _i, _len;
    node = this.doc.createElement(name);
    for (_i = 0, _len = children.length; _i < _len; _i++) {
      child = children[_i];
      if (typeof child === 'string') {
        child = this.doc.createTextNode(child);
      }
      switch (child.nodeType) {
        case 1:
          node.appendChild(child);
          break;
        case 2:
          node.setAttributeNode(child);
          break;
        case 3:
          node.appendChild(child);
      }
    }
    return node;
  };
  HTMLMaker.prototype.attribute = function(name, value) {
    var node;
    node = this.doc.createAttribute(name);
    node.value = value;
    return node;
  };
  return HTMLMaker;
})();
URIRules = (function() {
  function URIRules(base_path) {
    this.base_path = base_path || '/';
    this.path_rules = [];
    this.http404 = function() {
      var root_node;
      root_node = document.getElementsByTagName('html').item(0);
      root_node.textContent = '404 not found.';
    };
    return;
  }
  URIRules.prototype.set = function(path_rule, func) {
    var re;
    path_rule = this.get_fullpath(path_rule);
    path_rule = path_rule.replace(/\//g, '\\/');
    re = new RegExp("^" + path_rule + "$");
    this.path_rules.push([re, func]);
    return this;
  };
  URIRules.prototype.change = function(path) {
    var func, re, res, title, _i, _len, _ref, _ref2;
    path = this.get_fullpath(path);
    if (window.history.pushState != null) {
      window.history.pushState({}, null, path);
    }
    _ref = this.path_rules;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], re = _ref2[0], func = _ref2[1];
      res = re.exec(path);
      if (res) {
        title = func.apply(this, res);
        document.getElementsByTagName('title').item(0).textContent = title;
        return path;
      }
    }
    this.http404();
    return path;
  };
  URIRules.prototype.get_fullpath = function(path) {
    var ary, s, _i, _len, _ref;
    ary = [''];
    _ref = this.base_path.split('/').concat(path.split('/'));
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      s = _ref[_i];
      if (s) {
        ary.push(s);
      }
    }
    return ary.join('/');
  };
  return URIRules;
})();
Tumblr = (function() {
  function Tumblr(username, page) {
    this.username = username || '';
    this.page = page || 1;
    this.type = '';
    this.num = 100;
    this.callback = null;
    this.timeout = 0;
    this.ontimeout = function() {};
    return;
  }
  Tumblr.prototype.send_request = function() {
    var callback, req, self, start, uri;
    if (!(this.username && this.callback)) {
      return;
    }
    self = this;
    start = this.page * this.num - this.num;
    uri = this.api_uri(start);
    callback = function(json) {
      self.callback(json);
      delete self.callback;
    };
    req = new HTTPRequest();
    req.onreadystatechange = function() {
      var json;
      if (!(req.readyState === 4 && req.status === 200)) {
        return;
      }
      json = req.responseJSON;
      callback(json);
    };
    req.open('GET', uri);
    if (this.timeout) {
      req.timeout = this.timeout;
      req.ontimeout = this.ontimeout;
    }
    req.send(null);
  };
  Tumblr.prototype.api_uri = function(start) {
    var name, query, uri, value;
    uri = "http://" + this.username + ".tumblr.com/api/read/json?";
    query = {
      'type': this.type,
      'start': start,
      'num': this.num
    };
    uri += ((function() {
      var _results;
      _results = [];
      for (name in query) {
        value = query[name];
        _results.push("" + name + "=" + value);
      }
      return _results;
    })()).join('&');
    return uri;
  };
  return Tumblr;
})();
