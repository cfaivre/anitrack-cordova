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
  window.onpopstate = function(event) {
    if (event.state && 'display' in event.state) {
      app.displayContent(event.state.display);
    }
  };
}());

var app = {

  selectedDisplay: null,

  initialize: function() {
    if ('cordova' in window) {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    } else {
      document.addEventListener('DOMContentLoaded', this.onDeviceReady.bind(this), false);
    };
  },

  onDeviceReady: function() {
    this.displayContent('events');
    this.detectIOS();
  },

  detectIOS: function() {
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (iOS) {
      var app = document.querySelector('#app');
      app.setAttribute('iOS', true);
    }
  },

  clickedTab: function(el) {
    var display = el.getAttribute('display');
    this.displayContent(display);
  },

  clickedAnimal: function(el) {
    var id = el.getAttribute('_id') || el.getAttribute('id');
    id && id !== '' && this.displayContent('animal_details', [id]);
  },

  clickedEvent: function(el) {
    var id = el.getAttribute('_id') || el.getAttribute('id');;
    id && id !== '' && this.displayContent('event_details', [id]);
  },

  clickedTitle: function(el) {
    window.history.back();
  },

  clickedFab: function(el) {
    var display = el.getAttribute('display');
    this.displayContent('scan');
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
    this.selectedDisplay = selected;
    if (this.component[display]) {
      args = args || [];
      args.unshift(selected);
      var component = this.component[display];
      component.render.apply(component, args);
    }
    window.history.pushState({ display: display }, display, display);
  },

  selectTab: function(display) {
    var tabs = document.querySelectorAll('#tabs > li');
    var index = tabs.length;
    var selected = null;
    while (index--) {
      if (tabs[index].getAttribute('display') === display) {
        tabs[index].classList.add('selected');
        selected = tabs[index];
      } else {
        tabs[index].classList.remove('selected');
      }
    }
  },

  animateSelectionBar: function(selected) {
    var bar = document.querySelector('#tabs > .selection-bar');
    var tabs = document.querySelector('#tabs');
    var selectedRect = selected.getBoundingClientRect();
    var selectedWidth = selected.offsetWidth;
    var selectedLeft = selectedRect.left;
    var tabsRect = tabs.getBoundingClientRect();
    var tabsWidth = tabs.offsetWidth;
    var tabsLeft = tabsRect.left;
    var start = selectedLeft - tabsLeft;
    var width = selectedWidth / tabsWidth;
    var transform = 'translateX('+start+'px) scaleX('+width+');';
    bar.setAttribute('style', 'transform: ' + transform);
  },

  debug: function() {
    if (navigator.notification && navigator.notification.alert) {
      navigator.notification.alert(Array.prototype.slice.call(arguments).join(' '));
    } else {
      console.log(arguments[1] ? arguments : arguments[0]);
    }
  },

  toast: function(type, msg) {
    toastr[type](msg);
  },

  fadeIn: function(element) {
    setTimeout(function() {
      $(element).fadeIn();
    }.bind(this), 1);
  },

  fetch: function(type, url, body, callback) {
    var xhttp = new XMLHttpRequest();
    xhttp.timeout = 10000;
    body = body ? JSON.stringify(body) : null;
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        try {
          var result = JSON.parse(this.responseText);
          callback(result);
        } catch(e) {
          app.toast('error', 'Bad response from server.');
          console.error(e);
        }
      } else if (this.readyState === 4) {
        if (this.status === 0) {
          app.toast('error', 'Offline. Enable device 3G or wifi.');
        } else {
          app.toast('error', 'Error fetching data from server.');
        }
      }
    };
    xhttp.open(type, url, true);
    xhttp.send(body);
  },

  loading: function(isLoading) {
    var spinner = document.querySelector('#spinner');
    if (isLoading) {
      spinner.classList.add('active');
    } else {
      spinner.classList.remove('active');
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
    app.fadeIn(this.element);
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    el.querySelector('.template') && this.element.removeChild(el.querySelector('.template'));
    this.element.querySelector('.list').innerHTML = '';
  },

  fetchEvents: function(callback) {
    app.loading(true);
    app.fetch("GET", "http://anitrack-api.faivre.co.za/event/view/all", null, callback);
  },

  createElements: function(result) {
    app.loading(false);
    var data = result.data;
    data = data.reverse();
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
    app.fadeIn(this.element);
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    this.element.querySelector('.list').innerHTML = '';
    el.querySelector('.template') && this.element.removeChild(el.querySelector('.template'));
  },

  fetchEvent: function(id, callback) {
    app.loading(true);
    app.fetch("GET", "http://anitrack-api.faivre.co.za/event/view/" + id, null, callback);
  },

  displayDetails: function(result) {
    app.loading(false);
    var data = this.parseDetails(result.data);
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
    var animals = data.animals;
    for (var i = 0; i < animals.length; i++) {
      var obj = this.parseAnimal(animals[i]);
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

  parseDetails: function(obj) {
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

  parseAnimal: function(tag) {
    return {
      tag_number: tag,
      tag: this.parseTag(tag)
    }
  },

  parseTag: function(tag) {
    var parts = tag.split(',');
    return parts[1] + ' ' + parts[2];
  },

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
    app.fadeIn(this.element);
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    el.querySelector('.template') && this.element.removeChild(el.querySelector('.template'));
    this.element.querySelector('.list').innerHTML = '';
  },

  fetchAnimals: function(callback) {
    app.loading(true);
    app.fetch("GET", "http://anitrack-api.faivre.co.za/animal/view/all", null, callback);
  },

  createElements: function(result) {
    app.loading(false);
    var data = result.data;
    data = data.reverse();
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
    app.fadeIn(this.element);
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    el.querySelector('.template') && this.element.removeChild(el.querySelector('.template'));
    this.element.querySelector('.list').innerHTML = '';
  },

  fetchAnimal: function(id, callback) {
    app.loading(true);
    app.fetch("GET", "http://anitrack-api.faivre.co.za/animal/view?id=" + id, null, callback);
  },

  displayDetails: function(result) {
    app.loading(false);
    var data = this.parseDetails(result.data);
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

  parseDetails: function(obj) {
    var parsed = {
      status: 'Unknown'
    };
    for (var key in obj) {
      parsed[key] = (!!obj[key] && obj[key] !== '') ? obj[key] : parsed[key] || null;
    }
    parsed.tag = this.parseTag(obj.tag_number);
    return parsed;
  },

  parseTag: function(tag) {
    var parts = tag.split(',');
    return parts[1] + ' ' + parts[2];
  },

  createListElements: function(data) {
    var events = data.life_events;
    for (var i = 0; i < events.length; i++) {
      var obj = this.parseEvent(events[i]);
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

  parseEvent: function(data) {
    var parsed = data;
    parsed.created_at = printDate(new Date(parsed.created_at));
    return parsed;
  },

};

app.component.scan = {

  element: null,

  template: null,

  animals: [],

  render: function(el) {
    this.default(el);
    this.ready();
    this.focus();
  },

  ready: function() {
    this.element.classList.add('selected');
  },

  default: function(el) {
    this.element = this.element || el;
    this.template = this.template || el.querySelector('.template').clone();
    el.querySelector('.template') && this.element.removeChild(el.querySelector('.template'));
    this.element.querySelector('.input-title').value = '';
    this.element.querySelector('.input-description').value = '';
    this.element.querySelector('.list').innerHTML = '';
    this.animals = [];
    var scanButton = this.element.querySelector('.scan-button');
    scanButton.onclick = this.openScanner.bind(this);
    var submitButton = this.element.querySelector('.submit-button');
    submitButton.onclick = this.submit.bind(this);
  },

  focus: function() {
    // var input = this.element.querySelector('.input-title');
    // $(input).focus();
  },

  submit: function() {
    var title = this.element.querySelector('.input-title').value;
    var description = this.element.querySelector('.input-description').value;
    var animals = this.animals;
    if (!title || title === '') {
      return app.toast('warning', 'Please enter a title.');
    }
    if (!description || description === '') {
      return app.toast('warning', 'Please enter a description.');
    }
    if (!animals || animals.length === 0) {
      return app.toast('warning', 'Please scan an animal.');
    }
    var body = {
      animals: animals,
      description: description,
      jobtype: title
    };
    app.fetch('POST', 'http://anitrack-api.faivre.co.za/event/create', body, this.onSubmition.bind(this));
  },

  onSubmition: function() {
    window.history.back();
  },

  addAnimal: function(tagNumber) {
    if (!tagNumber) {
      app.toast('warning', 'Unknown scan result.');
      return;
    }
    var obj = {
      tag: this.parseTag(tagNumber),
      tag_number: tagNumber
    };
    this.animals.push(tagNumber);
    var row = this.template.clone();
    var databindings = row.querySelectorAll('*');
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
    row.classList.remove('template');
    this.element.querySelector('.list').appendChild(row);
  },

  parseTag: function(tag) {
    var parts = tag.split(',');
    return parts[1] + ' ' + parts[2];
  },

  openScanner: function() {
    if (!window.cordova) {
      var number = Math.random().toString(10).substring(7).slice(-5);
      var code = Math.random().toString(36).substring(7).slice(-10);
      return this.addAnimal('za'+code+',A12,'+number);
    }
    var scan = cordova.plugins.barcodeScanner.scan;
    var vibrate = navigator.vibrate;
    var options = {
      showFlipCameraButton : true,
      showTorchButton : true,
      resultDisplayDuration: 1,
      prompt : "Place a tag inside the scan area",
      formats : ["DATA_MATRIX","QR_CODE"]
    };
    scan(function(result) {
      if (result.cancelled) return;
      this.addAnimal(result.text);
      vibrate(300);
    }.bind(this), function(error) {
      this.toast('error', 'Unknown scan result.');
    }.bind(app), options);
  }

};

app.initialize();