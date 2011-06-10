var PhotosViewer;
PhotosViewer = (function() {
  var self;
  self = null;
  function PhotosViewer() {
    self = this;
    self.username = null;
    self.page = null;
    self.result = document.getElementById('result');
    self.html_maker = new HTMLMaker(document);
    self.uri_rules = new URIRules();
    self.uri_rules.set('/', function() {
      self.init();
      return 'tumblr photos viewer';
    }).set('/(\\w+)(?:\\?page=(\\d+))?', function(_, username, page) {
      self.username = username;
      self.page = (page || 1) * 1;
      self.request_tumblr(self.username, self.page);
      return "" + self.page + " > " + self.username + " > tumblr photos viewer";
    });
    self.uri_rules.http404 = function() {
      self.output_result('404 Not found.');
    };
    self.add_event();
    return;
  }
  PhotosViewer.prototype.add_event = function() {
    document.addEventListener('DOMContentLoaded', self.loaded, false);
  };
  PhotosViewer.prototype.loaded = function() {
    var form, pathname, text_field;
    pathname = location.pathname + (location.search || '');
    self.change(pathname);
    form = document.getElementsByTagName('form').item(0);
    text_field = document.getElementById('tumblr_username');
    if (self.username) {
      text_field.value = self.username;
    }
    form.onsubmit = function() {
      window.removeEventListener('scroll', self.scroll, false);
      text_field.blur();
      self.username = text_field.value;
      self.init();
      self.change(self.get_uri(self.username));
      return false;
    };
  };
  PhotosViewer.prototype.init = function() {
    while (self.result.hasChildNodes()) {
      self.result.removeChild(self.result.firstChild);
    }
  };
  PhotosViewer.prototype.request_tumblr = function(username, page) {
    var tumblr;
    tumblr = new Tumblr(username);
    tumblr.page = page || 1;
    tumblr.type = 'photo';
    tumblr.num = 10;
    tumblr.callback = function(json) {
      self.output_result(json.posts);
      return window.addEventListener('scroll', self.scroll, false);
    };
    tumblr.send_request();
  };
  PhotosViewer.prototype.output_result = function(arg) {
    var h, node;
    h = self.html_maker;
    switch (typeof arg) {
      case 'object':
        self.output_result_for_posts(arg);
        break;
      case 'string':
        node = h.html('p', arg);
        self.result.appendChild(node);
    }
  };
  PhotosViewer.prototype.output_result_for_posts = function(posts) {
    var h, i, photo, post, section, title, _len;
    h = self.html_maker;
    for (i = 0, _len = posts.length; i < _len; i++) {
      post = posts[i];
      section = document.getElementById('_template').cloneNode(true);
      section.removeAttribute('id');
      title = section.getElementsByClassName('title').item(0);
      title.appendChild(h.html('a', [h.html('@href', post['url']), post['url']]));
      photo = section.getElementsByClassName('photo').item(0);
      photo.appendChild(h.html('img', [h.html('@src', post['photo-url-1280']), h.html('@alt', ' ')]));
      section.addEventListener('click', function() {
        var next_section;
        if (next_section = this.nextElementSibling) {
          scroll(0, next_section.offsetTop);
        }
      }, false);
      self.result.appendChild(section);
    }
  };
  PhotosViewer.prototype.scroll = function() {
    var root_node;
    root_node = document.lastChild;
    if (root_node.offsetHeight - window.innerHeight - window.scrollY >= 200) {
      return;
    }
    window.removeEventListener('scroll', arguments.callee);
    self.change(self.get_uri(self.username, self.page + 1));
  };
  PhotosViewer.prototype.change = function(uri) {
    self.uri_rules.change(uri);
  };
  PhotosViewer.prototype.get_uri = function(username, page) {
    var uri;
    uri = '/';
    if (username) {
      uri += username;
    }
    if (page) {
      uri += '?page=' + page;
    }
    return uri;
  };
  return PhotosViewer;
})();