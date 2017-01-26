(function() {
  Element.prototype.clone = function() {
    if ('cloneNode' in Element.prototype) {
      return this.cloneNode(true);
    } else {
      return $(this).clone()[0];
    }
  }
  window.printDate = function(date) {
    var day = date.getDate();
    day = day < 10 ? '0' + day : day;
    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    var year = date.getFullYear();
    return year+'-'+month+'-'+day;
  };
}());

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

  clickedEvent: function(el) {
    var id = el.getAttribute('_id');
    this.displayContent('event_details', [id]);
  },

  displayContent: function(display, args) {
    this.selectTab(display);
    var content = document.querySelector('#content');
    var displays = document.querySelectorAll('#content > div');
    var i = displays.length;
    var selected = null;
    while (i--) {
      if (displays[i].getAttribute('display') === display) {
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
  },

  selectTab: function(display) {
    var tabs = document.querySelectorAll('#tabs > li');
    var index = tabs.length;
    while (index--) {
      if (tabs[index].getAttribute('display') === display) {
        tabs[index].classList.add('selected');
      } else {
        tabs[index].classList.remove('selected');
      }
    }
  },

  debug: function() {
    if (navigator.notification && navigator.notification.alert) {
      navigator.notification.alert(Array.prototype.slice.call(arguments).join(' '));
    } else {
      console.log(arguments[1] ? arguments : arguments[0]);
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

  ready: function() {
    this.element.classList.add('selected');
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    el.querySelector('.template') && this.element.removeChild(el.querySelector('.template'));
    this.element.querySelector('.list').innerHTML = '';
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
      var obj = this.parseObject(data[i]);
      var node = this.template.clone();
      var databindings = node.querySelectorAll('*');
      databindings = Array.prototype.slice.call(databindings);
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
      this.element.querySelector('.list').appendChild(node);
    }
    this.ready();
  },

  parseObject: function(obj) {
    var parsed = {
      description: 'No description',
      status: 'In progress'
    };
    for (var key in obj) {
      parsed[key] = (!!obj[key] && obj[key] !== '') ? obj[key] : parsed[key] || null;
    }
    parsed.created_at = printDate(new Date(parsed.created_at));
    return parsed;
  },

};

app.component.event_details = {

  element: null,

  template: null,

  render: function(el, id) {
    this.default(el);
    this.fetchEvent(id, this.displayDetails.bind(this));
  },

  ready: function() {
    this.element.classList.add('selected');
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    this.element.querySelector('.list').innerHTML = '';
  },

  fetchEvent: function(id, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var result = JSON.parse(this.responseText);
        callback(result);
      }
    };
    xhttp.open("GET", "http://anitrack-api.faivre.co.za/event/view/" + id, true);
    xhttp.send();
  },

  displayDetails: function(result) {
    console.log(result);
    var data = result.data;
    var databindings = this.element.querySelectorAll('.details *');
    databindings = Array.prototype.slice.call(databindings);
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
    console.log(data);
    var events = data.animals;
    for (var i = 0; i < events.length; i++) {
      var obj = events[i];
      var node = this.template.clone();
      var databindings = node.querySelectorAll('*');
      databindings = Array.prototype.slice.call(databindings);
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
      this.element.querySelector('.list').appendChild(node);
    }
    this.ready();
  }

};

app.component.animals = {

  element: null,

  template: null,

  render: function(el) {
    this.default(el);
    this.fetchAnimals(this.createElements.bind(this));
  },

  ready: function() {
    this.element.classList.add('selected');
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    el.querySelector('.template') && this.element.removeChild(el.querySelector('.template'));
    this.element.querySelector('.list').innerHTML = '';
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
      var obj = this.parseObject(data[i]);
      var node = this.template.clone();
      var databindings = node.querySelectorAll('*');
      databindings = Array.prototype.slice.call(databindings);
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
      this.element.querySelector('.list').appendChild(node);
    }
    this.ready();
  },

  parseObject: function(obj) {
    var parsed = {
      status: 'Unknown'
    };
    for (var key in obj) {
      parsed[key] = (!!obj[key] && obj[key] !== '') ? obj[key] : parsed[key] || null;
    }
    parsed.created_at = printDate(new Date(parsed.created_at));
    parsed.tag = this.parseTag(obj.tag_number);
    return parsed;
  },

  parseTag: function(tag) {
    var parts = tag.split(',');
    return parts[1] + ' ' + parts[2];
  },

};

app.component.animal_details = {

  element: null,

  template: null,

  render: function(el, id) {
    this.default(el);
    this.fetchAnimal(id, this.displayDetails.bind(this));
  },

  ready: function() {
    this.element.classList.add('selected');
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
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
    databindings = Array.prototype.slice.call(databindings);
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
      var node = this.template.clone();
      var databindings = node.querySelectorAll('*');
      databindings = Array.prototype.slice.call(databindings);
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
      this.element.querySelector('.list').appendChild(node);
    }
    this.ready();
  }

};

app.initialize();