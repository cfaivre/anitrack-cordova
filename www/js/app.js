
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

  clickedAnimal: function(el) {
    var id = el.getAttribute('_id');
    this.displayContent('animal_details', [id]);
  },

  displayContent: function(display, args) {
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
    if (this.component[display]) {
      args = args || [];
      args.unshift(selected);
      var component = this.component[display];
      component.render.apply(component, args);
    }
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

app.component.animal_details = {

  element: null,

  template: null,

  render: function(el, id) {
    this.default(el);
    this.fetchAnimal(id, this.displayDetails.bind(this));
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').cloneNode(true);
    this.element.querySelector('.list').innerHTML = '';
  },

  fetchAnimal: function(id, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        callback(result);
      }
    };
    xhttp.open("GET", "http://anitrack-api.faivre.co.za/animal/view?id=" + id, true);
    xhttp.send();
  },

  displayDetails: function(result) {
    var data = result.data;
    var databindings = this.element.querySelectorAll('.details *');
    databindings.forEach(function(el) {
      if (el.hasAttribute('attr')) {
        var key = el.getAttribute('attr');
        el.setAttribute(key, data[key]);
      }
      if (el.hasAttribute('content')) {
        var key = el.getAttribute('content');
        el.innerHTML = data[key];
      }
    });
    this.createListElements(data);
  },

  createListElements: function(data) {
    var events = data.life_events;
    for (var i = 0; i < events.length; i++) {
      var obj = events[i];
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
    }
    node.classList.remove('template');
    this.element.querySelector('.list').appendChild(node);
  }

};

app.initialize();