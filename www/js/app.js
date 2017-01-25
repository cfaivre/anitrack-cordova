
var app = {

  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function() {
    this.displayContent('events');
  },

  clickedTab: function(el) {
    var display = el.getAttribute('display');
    this.displayContent(display);
  },

  displayContent: function(display) {
    var displays = document.querySelectorAll('#content > div');
    var i = displays.length;
    var selected = null;
    while (i--) {
      if (displays[i].getAttribute('display') === display) {
        displays[i].classList.add('selected');
        selected = displays[i];
      } else {
        displays[i].classList.remove('selected');
      }
    }
    this.component[display] && this.component[display].render(selected);
  }

};

app.component = {};

app.component.events = {

  element: null,

  template: null,

  render: function(el) {
    this.default(el);
    this.fetchEvents(this.createElements.bind(this));
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').cloneNode(true);
    this.element.innerHTML = '';
  },

  fetchEvents: function(callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        callback(result);
      }
    };
    xhttp.open("GET", "http://anitrack-api.faivre.co.za/event/view/all", true);
    xhttp.send();
  },

  createElements: function(result) {
    var data = result.data;
    for (var i = 0; i < data.length; i++) {
      var obj = data[i];
      var node = this.template.cloneNode(true);
      var databindings = node.querySelectorAll('*');
      databindings.forEach(function(el) {
        if (el.hasAttribute('attr')) {
          var key = el.getAttribute('attr');
          el.setAttribute(key, obj[key]);
        }
        if (el.hasAttribute('content')) {
          var key = el.getAttribute('content');
          el.innerHTML = obj[key];
        }
      });
      node.classList.remove('template');
      this.element.appendChild(node);
    }
  }

};

app.component.animals = {

  element: null,

  template: null,

  render: function(el) {
    this.default(el);
    this.fetchAnimals(this.createElements.bind(this));
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').cloneNode(true);
    this.element.innerHTML = '';
  },

  fetchAnimals: function(callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        callback(result);
      }
    };
    xhttp.open("GET", "http://anitrack-api.faivre.co.za/animal/view/all", true);
    xhttp.send();
  },

  createElements: function(result) {
    var data = result;
    for (var i = 0; i < data.length; i++) {
      var obj = data[i];
      var node = this.template.cloneNode(true);
      var databindings = node.querySelectorAll('*');
      databindings.forEach(function(el) {
        if (el.hasAttribute('attr')) {
          var key = el.getAttribute('attr');
          el.setAttribute(key, obj[key]);
        }
        if (el.hasAttribute('content')) {
          var key = el.getAttribute('content');
          el.innerHTML = obj[key];
        }
      });
      node.classList.remove('template');
      this.element.appendChild(node);
    }
  }

};

app.initialize();