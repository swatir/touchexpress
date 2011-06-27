if(!this.JSON)this.JSON={};
(function(){function k(a){return a<10?"0"+a:a}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+k(this.getUTCMonth()+1)+"-"+k(this.getUTCDate())+"T"+k(this.getUTCHours())+":"+k(this.getUTCMinutes())+":"+k(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var n=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,o=
/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,f,l,q={"\u0008":"\\b","\t":"\\t","\n":"\\n","\u000c":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},i;function p(a){o.lastIndex=0;return o.test(a)?'"'+a.replace(o,function(c){var d=q[c];return typeof d==="string"?d:"\\u"+("0000"+c.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function m(a,c){var d,g,j=f,e,b=c[a];if(b&&typeof b==="object"&&typeof b.toJSON==="function")b=b.toJSON(a);
if(typeof i==="function")b=i.call(c,a,b);switch(typeof b){case "string":return p(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);case "object":if(!b)return"null";f+=l;e=[];if(Object.prototype.toString.apply(b)==="[object Array]"){g=b.length;for(a=0;a<g;a+=1)e[a]=m(a,b)||"null";c=e.length===0?"[]":f?"[\n"+f+e.join(",\n"+f)+"\n"+j+"]":"["+e.join(",")+"]";f=j;return c}if(i&&typeof i==="object"){g=i.length;for(a=0;a<g;a+=1){d=i[a];if(typeof d==="string")if(c=
m(d,b))e.push(p(d)+(f?": ":":")+c)}}else for(d in b)if(Object.hasOwnProperty.call(b,d))if(c=m(d,b))e.push(p(d)+(f?": ":":")+c);c=e.length===0?"{}":f?"{\n"+f+e.join(",\n"+f)+"\n"+j+"}":"{"+e.join(",")+"}";f=j;return c}}if(typeof JSON.stringify!=="function")JSON.stringify=function(a,c,d){var g;l=f="";if(typeof d==="number")for(g=0;g<d;g+=1)l+=" ";else if(typeof d==="string")l=d;if((i=c)&&typeof c!=="function"&&(typeof c!=="object"||typeof c.length!=="number"))throw new Error("JSON.stringify");return m("",
{"":a})};if(typeof JSON.parse!=="function")JSON.parse=function(a,c){function d(g,j){var e,b,h=g[j];if(h&&typeof h==="object")for(e in h)if(Object.hasOwnProperty.call(h,e)){b=d(h,e);if(b!==undefined)h[e]=b;else delete h[e]}return c.call(g,j,h)}a=String(a);n.lastIndex=0;if(n.test(a))a=a.replace(n,function(g){return"\\u"+("0000"+g.charCodeAt(0).toString(16)).slice(-4)});if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){a=eval("("+a+")");return typeof c==="function"?d({"":a},""):a}throw new SyntaxError("JSON.parse");}})();
(function($) {

  var prefix = "offline.jquery:",
    mostRecent = null,
    requesting = {};

  // Allow the user to explicitly turn off localStorage
  // before loading this plugin
  if (typeof $.support.localStorage === "undefined") {
    $.support.localStorage = !!window.localStorage;
  }

  // modified getJSON which uses ifModified: true
  function getJSON(url, data, fn) {
    if (jQuery.isFunction(data)) {
      fn = data;
      data = null;
    }

    requestingKey = url + "?" + data;
    if (requestingKey[requestingKey]) {
      return false;
    }

    requesting[requestingKey] = true;
    
    return jQuery.ajax({
      type: "GET",
      url: url,
      data: data,
      beforeSend : function (xhr) {
        xhr.setRequestHeader('X-GrouponToken', 'c8aed6be044399bc73161a0e12e46d92546fc16a');
      },
      success: function(data, text) {
        requesting[requestingKey] = false;
        fn(data, text);
      },
      ifModified: true
    });
  }
  

  if ($.support.localStorage) {
    // If localStorage is available, define jQuery.retrieveJSON
    // and jQuery.clearJSON to operate in terms of the offline
    // cache
    // If the user comes online, run the most recent request
    // that was queued due to the user being offline
    $(window).bind("online", function() {
      if (mostRecent) {
        mostRecent();
      }
    });

    // If the user goes offline, hide any loading bar
    // the user may have created
    $(window).bind("offline", function() {
      jQuery.event.trigger("ajaxStop");
    });

    $.retrieveJSON = function(url, data, fn) {
      // allow jQuery.retrieveJSON(url, fn)
      if ($.isFunction(data)) {
        fn = data;
        data = {};
      }

      // remember when this request started so we can report
      // the time when a follow-up Ajax request completes.
      // this is especially important when the user comes
      // back online, since retrieveDate may be minutes,
      // hours or even days before the Ajax request finally
      // completes
      var retrieveDate = new Date;

      // get a String value for the data passed in, and then
      // use it to calculate a cache key
      var param = $.param(data),
          key   = prefix + url + ":" + param,
          text  = localStorage[key],
          date  = localStorage[key + ":date"];

      date = new Date( Date.parse(date) );

      // create a function that will make an Ajax request and
      // store the result in the cache. This function will be
      // deferred until later if the user is offline
      function getData() {
        getJSON(url, param, function(json, status) {
          localStorage[key] = JSON.stringify(json);
          localStorage[key + ":date"] = new Date;

          // If this is a follow-up request, create an object
          // containing both the original time of the cached
          // data and the time that the data was originally
          // retrieved from the cache. With this information,
          // users of jQuery Offline can provide the user
          // with improved feedback if the lag is large
          var data = text && { cachedAt: date, retrievedAt: retrieveDate };
          fn(json, status, data);
        });
      }

      // If there is anything in the cache, call the callback
      // right away, with the "cached" status string
      if( text ) {
        var response = fn( $.parseJSON(text), "cached", { cachedAt: date } );
        if( response === false ) return false;
      }

      // If the user is online, make the Ajax request right away;
      // otherwise, make it the most recent callback so it will
      // get triggered when the user comes online
      if (window.navigator.onLine) {
        getData();
      } else {
        mostRecent = getData;
      }

      return true;
    };

    // jQuery.clearJSON is simply a wrapper around deleting the
    // localStorage for a URL/data pair
    $.clearJSON = function(url, data) {
      var param = $.param(data || {});
      delete localStorage[prefix + url + ":" + param];
      delete localStorage[prefix + url + ":" + param + "date"];
    };
  } else {
    // If localStorage is unavailable, just make all requests
    // regular Ajax requests.
    $.retrieveJSON = getJSON;
    $.clearJSON = $.noop;
  }

})(jQuery);

var Cycle = function(){
    var cycles, that, thru, reset;

    cycles = {};
    that = {};

    thru = function(){
        var values, i, cycle, options, name, nextValue;

        values = Array.prototype.slice.call(arguments);
        options = typeof(values.slice(-1)[0]) === 'object' ? values.pop() : {};

        name = options['name'] || 'default';

        if(!cycles[name]) {
            cycles[name] = {
              values: values,
              index: 0
            };
        }
        cycle = cycles[name];
        nextValue = cycle.values[cycle.index];
        cycle.index = (cycle.index === cycle.values.length -1) ? 0 : (cycle.index +1);
        return nextValue;
    };
    that.thru = thru;

    reset = function(name) {
        if(cycles[name]) {
            cycles[name].index = 0;
        }
    };
    that.reset = reset;

    return that;
}();


//     Backbone.js 0.3.3
//     (c) 2010 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://documentcloud.github.com/backbone

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object.
  var root = this;
  
  // Save the previous value of the `Backbone` variable.
  var previousBackbone = root.Backbone;
  
  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.3.3';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore')._;

  // For Backbone's purposes, either jQuery or Zepto owns the `$` variable.
  var $ = root.jQuery || root.Zepto;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };
  
  // Turn on `emulateHTTP` to use support legacy HTTP servers. Setting this option will
  // fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and set a
  // `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may `bind` or `unbind` a callback function to an event;
  // `trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.bind('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  Backbone.Events = {

    // Bind an event, specified by a string name, `ev`, to a `callback` function.
    // Passing `"all"` will bind the callback to all events fired.
    bind : function(ev, callback) {
      var calls = this._callbacks || (this._callbacks = {});
      var list  = this._callbacks[ev] || (this._callbacks[ev] = []);
      list.push(callback);
      return this;
    },

    // Remove one or many callbacks. If `callback` is null, removes all
    // callbacks for the event. If `ev` is null, removes all bound callbacks
    // for all events.
    unbind : function(ev, callback) {
      var calls;
      if (!ev) {
        this._callbacks = {};
      } else if (calls == this._callbacks) {
        if (!callback) {
          calls[ev] = [];
        } else {
          var list = calls[ev];
          if (!list) return this;
          for (var i = 0, l = list.length; i < l; i++) {
            if (callback === list[i]) {
              list.splice(i, 1);
              break;
            }
          }
        }
      }
      return this;
    },

    // Trigger an event, firing all bound callbacks. Callbacks are passed the
    // same arguments as `trigger` is, apart from the event name.
    // Listening for `"all"` passes the true event name as the first argument.
    trigger : function(ev) {
      var list, calls, i, l;
      if (!(calls = this._callbacks)) return this;
      if (calls[ev]) {
        list = calls[ev].slice(0);
        for (i = 0, l = list.length; i < l; i++) {
          list[i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
      }
      if (calls['all']) {
        list = calls['all'].slice(0);
        for (i = 0, l = list.length; i < l; i++) {
          list[i].apply(this, arguments);
        }
      }
      return this;
    }

  };

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    defaults = this.defaults;
    if (defaults) {
      if (_.isFunction(defaults)) defaults = defaults();
      attributes = _.extend({}, defaults, attributes);
    }
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.set(attributes, {silent : true});
    this._changed = false;
    this._previousAttributes = _.clone(this.attributes);
    if (options && options.collection) this.collection = options.collection;
    this.initialize(attributes, options);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Backbone.Model.prototype, Backbone.Events, {

    // A snapshot of the model's previous attributes, taken immediately
    // after the last `"change"` event was fired.
    _previousAttributes : null,

    // Has the item been changed since the last `"change"` event?
    _changed : false,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute : 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Return a copy of the model's `attributes` object.
    toJSON : function() {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get : function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape : function(attr) {
      var html;
      html = this._escapedAttributes[attr];
      if (html) return html;
      var val = this.attributes[attr];
      return this._escapedAttributes[attr] = escapeHTML(val === null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has : function(attr) {
      return this.attributes[attr] !== null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless you
    // choose to silence it.
    set : function(attrs, options) {

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs.attributes) attrs = attrs.attributes;
      var now = this.attributes, escaped = this._escapedAttributes;

      // Run validation.
      if (!options.silent && this.validate && !this._performValidation(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // Update attributes.
      for (var attr in attrs) {
        var val = attrs[attr];
        if (!_.isEqual(now[attr], val)) {
          now[attr] = val;
          delete escaped[attr];
          this._changed = true;
          if (!options.silent) this.trigger('change:' + attr, this, val, options);
        }
      }

      // Fire the `"change"` event, if the model has been changed.
      if (!options.silent && this._changed) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset : function(attr, options) {
      if (!(attr in this.attributes)) return this;
      options || (options = {});
      var value = this.attributes[attr];

      // Run validation.
      var validObj = {};
      validObj[attr] = 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      // Remove the attribute.
      delete this.attributes[attr];
      delete this._escapedAttributes[attr];
      if (attr == this.idAttribute) delete this.id;
      this._changed = true;
      if (!options.silent) {
        this.trigger('change:' + attr, this, 0, options);
        this.change(options);
      }
      return this;
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear : function(options) {
      options || (options = {});
      var old = this.attributes;

      // Run validation.
      var validObj = {};
      for (attr in old) validObj[attr] = 0;
      if (!options.silent && this.validate && !this._performValidation(validObj, options)) return false;

      this.attributes = {};
      this._escapedAttributes = {};
      this._changed = true;
      if (!options.silent) {
        for (attr in old) {
          this.trigger('change:' + attr, this, 0, options);
        }
        this.change(options);
      }
      return this;
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch : function(options) {
      options || (options = {});
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp), options)) return false;
        if (success) success(model, resp);
        return true;
      };
      options.error = wrapError(options.error, model, options);
      (this.sync || Backbone.sync).call(this, 'read', this, options);
      return this;
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save : function(attrs, options) {
      options || (options = {});
      if (attrs && !this.set(attrs, options)) return false;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp), options)) return false;
        if (success) success(model, resp);
        return true;
      };
      options.error = wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      (this.sync || Backbone.sync).call(this, method, this, options);
      return this;
    },

    // Destroy this model on the server. Upon success, the model is removed
    // from its collection, if it has one.
    destroy : function(options) {
      options || (options = {});
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        model.trigger('destroy', model, model.collection, options);
        if (success) success(model, resp);
      };
      options.error = wrapError(options.error, model, options);
      (this.sync || Backbone.sync).call(this, 'delete', this, options);
      return this;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url : function() {
      var base = getUrl(this.collection) || this.urlRoot || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse : function(resp) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone : function() {
      return new this.constructor(this);
    },

    // A model is new if it has never been saved to the server, and has a negative
    // ID.
    isNew : function() {
      return !this.id;
    },

    // Call this method to manually fire a `change` event for this model.
    // Calling this will cause all objects observing the model to update.
    change : function(options) {
      this.trigger('change', this, options);
      this._previousAttributes = _.clone(this.attributes);
      this._changed = false;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged : function(attr) {
      if (attr) return this._previousAttributes[attr] != this.attributes[attr];
      return this._changed;
    },

    // Return an object containing all the attributes that have changed, or false
    // if there are no changed attributes. Useful for determining what parts of a
    // view need to be updated and/or what attributes need to be persisted to
    // the server.
    changedAttributes : function(now) {
      now || (now = this.attributes);
      var old = this._previousAttributes;
      var changed = false;
      for (var attr in now) {
        if (!_.isEqual(old[attr], now[attr])) {
          changed = changed || {};
          changed[attr] = now[attr];
        }
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous : function(attr) {
      if (!attr || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes : function() {
      return _.clone(this._previousAttributes);
    },

    // Run validation against a set of incoming attributes, returning `true`
    // if all is well. If a specific `error` callback has been passed,
    // call that instead of firing the general `"error"` event.
    _performValidation : function(attrs, options) {
      var error = this.validate(attrs);
      if (error) {
        if (options.error) {
          options.error(this, error);
        } else {
          this.trigger('error', this, error, options);
        }
        return false;
      }
      return true;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.comparator) {
      this.comparator = options.comparator;
      delete options.comparator;
    }
    _.bindAll(this, '_onModelEvent', '_removeReference');
    this._reset();
    if (models) this.refresh(models, {silent: true});
    this.initialize(models, options);
  };

  // Define the Collection's inheritable methods.
  _.extend(Backbone.Collection.prototype, Backbone.Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model : Backbone.Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON : function() {
      return this.map(function(model){ return model.toJSON(); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `added` event for every new model.
    add : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._add(models[i], options);
        }
      } else {
        this._add(models, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `removed` event for every model removed.
    remove : function(models, options) {
      if (_.isArray(models)) {
        for (var i = 0, l = models.length; i < l; i++) {
          this._remove(models[i], options);
        }
      } else {
        this._remove(models, options);
      }
      return this;
    },

    // Get a model from the set by id.
    get : function(id) {
      if (id === null) return null;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid : function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Force the collection to re-sort itself. You don't need to call this under normal
    // circumstances, as the set will maintain sort order as each item is added.
    sort : function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      this.models = this.sortBy(this.comparator);
      if (!options.silent) this.trigger('refresh', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck : function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can refresh the entire set with a new list of models, without firing
    // any `added` or `removed` events. Fires `refresh` when finished.
    refresh : function(models, options) {
      models  || (models = []);
      options || (options = {});
      this.each(this._removeReference);
      this._reset();
      this.add(models, {silent: true});
      if (!options.silent) this.trigger('refresh', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, refreshing the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of refreshing.
    fetch : function(options) {
      options || (options = {});
      var collection = this;
      var success = options.success;
      options.success = function(resp) {
        collection[options.add ? 'add' : 'refresh'](collection.parse(resp), options);
        if (success) success(collection, resp);
      };
      options.error = wrapError(options.error, collection, options);
      (this.sync || Backbone.sync).call(this, 'read', this, options);
      return this;
    },

    // Create a new instance of a model in this collection. After the model
    // has been created on the server, it will be added to the collection.
    create : function(model, options) {
      var coll = this;
      options || (options = {});
      if (!(model instanceof Backbone.Model)) {
        var attrs = model;
        model = new this.model(null, {collection: coll});
        if (!model.set(attrs)) return false;
      } else {
        model.collection = coll;
      }
      var success = options.success;
      options.success = function(nextModel, resp) {
        coll.add(nextModel);
        if (success) success(nextModel, resp);
      };
      return model.save(null, options);
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse : function(resp) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is refreshed.
    _reset : function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Internal implementation of adding a single model to the set, updating
    // hash indexes for `id` and `cid` lookups.
    _add : function(model, options) {
      options || (options = {});
      if (!(model instanceof Backbone.Model)) {
        model = new this.model(model, {collection: this});
      }
      var already = this.getByCid(model);
      if (already) throw new Error(["Can't add the same model to a set twice", already.id]);
      this._byId[model.id] = model;
      this._byCid[model.cid] = model;
      if (!model.collection) {
        model.collection = this;
      }
      var index = this.comparator ? this.sortedIndex(model, this.comparator) : this.length;
      this.models.splice(index, 0, model);
      model.bind('all', this._onModelEvent);
      this.length++;
      if (!options.silent) model.trigger('add', model, this, options);
      return model;
    },

    // Internal implementation of removing a single model from the set, updating
    // hash indexes for `id` and `cid` lookups.
    _remove : function(model, options) {
      options || (options = {});
      model = this.getByCid(model) || this.get(model);
      if (!model) return null;
      delete this._byId[model.id];
      delete this._byCid[model.cid];
      this.models.splice(this.indexOf(model), 1);
      this.length--;
      if (!options.silent) model.trigger('remove', model, this, options);
      this._removeReference(model);
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference : function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.unbind('all', this._onModelEvent);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent : function(ev, model, collection, options) {
      if ((ev == 'add' || ev == 'remove') && collection != this) return;
      if (ev == 'destroy') {
        this._remove(model, options);
      }
      if (ev === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
    'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
    'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
    'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Backbone.Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Controller
  // -------------------

  // Controllers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  Backbone.Controller = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize(options);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:([\w\d]+)/g;
  var splatParam    = /\*([\w\d]+)/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Controller** properties and methods.
  _.extend(Backbone.Controller.prototype, Backbone.Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route : function(route, name, callback) {
      Backbone.history || (Backbone.history = new Backbone.History);
      var regexRoute;
      if (!_.isRegExp(route))  
        regexRoute = this._routeToRegExp(route);
      else
        regexRoute = route;
      Backbone.history.route(regexRoute, _.bind(function(fragment) {
        var args = [this._extractParameters(regexRoute, fragment, route)];
        callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
      }, this));
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history,
    // without triggering routes.
    saveLocation : function(fragment) {
      Backbone.history.saveLocation(fragment);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes : function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location fragment.
    _routeToRegExp : function(route) {
      route = route.replace(escapeRegExp, "\\$&")
                   .replace(namedParam, "([^\/]*)")
                   .replace(splatParam, "(.*?)");
      return new RegExp('^' + route + '$');
    },

    //extension match routes with query params
    _routeToRegExp : function (d) {
      var e = d.route ? d.route : d;
      var a = /:([\w\d]+)/g;
      d = d.params !== undefined ? d.params : true;
      var f = e.replace(a, "([^/]*)");

      if (splatParam.test(f))
        f = f.replace(splatParam, "(.*?)");

      if (d) {
        f = f.replace(a, "([^/\\?]*)");
        e = "[\\S]+";
        if (_.isArray(d)) e = "(" + d.join("|") + ")";
        f += "(\\?(" + e + "=[\\S]+)?(&" + e + "=[\\S]+)*&?)?";
      }
      return new RegExp("^" + f + "$");
    },
    

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters : function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL hashes. If the
  // browser does not support `onhashchange`, falls back to polling.
  Backbone.History = function() {
    this.handlers = [];
    this.fragment = this.getFragment();
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning hashes.
  var hashStrip = /^#*/;

  // Has the history handling already been started?
  var historyStarted = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(Backbone.History.prototype, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Get the cross-browser normalized URL fragment.
    getFragment : function(loc) {
      var hash = (loc || window.location).hash.replace(hashStrip, '');
      if($.browser.msie && $.browser.version <= 6)
        hash = hash + (loc || window.location).search;
      return hash;
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start : function() {
      if (historyStarted) throw new Error("Backbone.history has already been started");
      var docMode = document.documentMode;
      var oldIE = ($.browser.msie && (!docMode || docMode <= 7));
      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.iframe.document.open().close(); 
        this.iframe.location.hash = window.location.hash;
      }
      if ('onhashchange' in window && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else {
        setInterval(this.checkUrl, this.interval);
      }
      historyStarted = true;
      return this.loadUrl();
    },

    // Add a route to be tested when the hash changes. Routes added later may
    // override previous routes.
    route : function(route, callback) {
      this.handlers.unshift({route : route, callback : callback});
    },

    //extension: new routes don't override older routes
    route : function(route, callback) {
      this.handlers.push({route : route, callback : callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl : function() {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) {
        current = this.getFragment(this.iframe.location);
      }
      if (current == this.fragment ||
          current == decodeURIComponent(this.fragment)) return false;
      if (this.iframe) {
        window.location.hash = this.iframe.location.hash = current;
      }
      this.loadUrl();
      return true;
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl : function() {
      var fragment = this.fragment = this.getFragment();
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history. You are responsible for properly
    // URL-encoding the fragment in advance. This does not trigger
    // a `hashchange` event.
    saveLocation : function(fragment) {
      fragment = (fragment || '').replace(hashStrip, '');
      if (this.fragment == fragment) return;
      window.location.hash = this.fragment = fragment;
      if (this.iframe && (fragment != this.getFragment(this.iframe.location))) {
        this.iframe.document.open().close();
        this.iframe.location.hash = fragment;
      }
    }

  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.delegateEvents();
    this.initKeyBindings();
    this.initialize(options);
  };

  // Element lookup, scoped to DOM elements within the current view.
  // This should be prefered to global lookups, if you're dealing with
  // a specific view.
  var selectorDelegate = function(selector) {
    return $(selector, this.el);
  };

  // Cached regex to split keys for `delegate`.
  var eventSplitter = /^([\w-]+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(Backbone.View.prototype, Backbone.Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName : 'div',

    // Attach the `selectorDelegate` function as the `$` property.
    $       : selectorDelegate,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render : function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove : function() {
      $(this.el).remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make : function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Set callbacks, where `this.callbacks` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents : function(events) {
      if (!(events || (events = this.events))) return;
      $(this.el).unbind('.delegateEvents' + this.cid);
      for (var key in events) {
        var methodName = events[key];
        var match = key.match(eventSplitter);
        var eventName = match[1], selector = match[2];
        var method = _.bind(this[methodName], this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          $(this.el).bind(eventName, method);
        } else {
          $(this.el).delegate(selector, eventName, method);
        }
      }
    },

    initKeyBindings: function() {
      if(!this.keyBindings) return;
      var bindings = {};
      for(var key in this.keyBindings) {
        bindings[key] = this.keyBindings[key].bind(this);
      }
      KeyBindings.add(bindings);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure : function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` proeprties.
    _ensureElement : function() {
      if (!this.el) {
        var attrs = this.attributes || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.el = this.make(this.tagName, attrs);
      } else if (_.isString(this.el)) {
        this.el = $(this.el).get(0);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Backbone.Model.extend = Backbone.Collection.extend =
    Backbone.Controller.extend = Backbone.View.extend = extend;

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, uses makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded` instead of
  // `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default JSON-request options.
    var params = _.extend({
      type:         type,
      contentType:  'application/json',
      dataType:     'json',
      processData:  false
    }, options);

    // Ensure that we have a URL.
    if (!params.url) {
      params.url = getUrl(model) || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!params.data && model && (method == 'create' || method == 'update')) {
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.processData = true;
      params.data        = params.data ? {model : params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Make the request.
    return $.ajax(params);
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call `super()`.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a URL from a Model or Collection as a property
  // or as a function.
  var getUrl = function(object) {
    if (!(object && object.url)) return null;
    return _.isFunction(object.url) ? object.url() : object.url;
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error("A 'url' property or function must be specified");
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(onError, model, options) {
    return function(resp) {
      if (onError) {
        onError(model, resp, options);
      } else {
        model.trigger('error', model, resp, options);
      }
    };
  };

  // Helper function to escape a string for HTML rendering.
  var escapeHTML = function(string) {
    return string.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

}).call(this);


//extension: parse query params and named params into hash
Backbone.Controller.prototype._extractParameters = function (route, path, oroute) {
  var query = path.indexOf("?"), queryParams = {}, rint = /^\d+$/;
  if (query > -1) {
    var params = path.substr(query + 1).split("&");
    path = path.substr(0, query);
    _.each(params, function(param) {
      param = param.split("=");
      queryParams[param[0]] = param[1];
    });
  }

  var namedParamKeys = oroute.match(/:[^\/]+/gi); 
  if (!namedParamKeys) return queryParams;
  var namedParams = route.exec(path).slice(1);
  _.each(namedParamKeys, function (param, i) {
    if (rint.test(namedParams[i])) namedParams[i] = parseInt(namedParams[i], 10);
    queryParams[param.substr(1)] = namedParams[i];
  });
  
  return queryParams;
};

Backbone.cache = {
  version: Math.random()
};

Backbone.sync = (function(original) {
  return function(method, model, options) {
    Backbone._cache = Backbone._cache || {};

    var key = options.url || _.isFunction(model.url) ? model.url() : model.url;

    if(method == 'read') {
      if (Backbone._cache[key] && Backbone._cache[key].version == Backbone.cache.version){
        var currentTime = new Date();
        if (!Backbone._cache[key].expiresAt || Backbone._cache[key].expiresAt > currentTime){
          return options.success.call(this, Backbone._cache[key].response);
        }
      }

      return original.call(this, method, model, options).success(function(response) {
        var now = new Date();
        now.setSeconds(now.getSeconds() + model.EXPIRE_URL_CACHE || 0);

        Backbone._cache[key] = {
          version: Backbone.cache.version,
          response: response,
          expiresAt: model.EXPIRE_URL_CACHE ? now : null
        };
      });
    } else {
      return original.call(this, method, model, options);
    }

    return original.call(this, method, model, options);
  };
})(Backbone.sync);

Groupon.Models = Groupon.Models || {};
Groupon.Collections = Groupon.Collections || {};
Groupon.Views = Groupon.Views || {};

/*
  mustache.js â€” Logic-less templates in JavaScript

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line != "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w_-]+) ?([\\w]+=[\\w]+)?"
        + this.ctag);
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message: "This implementation of mustache doesn't understand the '"
            + pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    /*
      Tries to find a partial in the cuurent scope and render it
    */
    render_partial: function(name, context, partials) {
      name = this.trim(name);
      if(!partials || !partials[name]) {
        throw({message: "unknown_partial '" + name + "'"});
      }
      if(typeof(context[name]) != "object") {
        return this.render(partials[name], context, partials, true);
      }
      return this.render(partials[name], context[name], partials, true);
    },

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\\s*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length == 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\/#\^]+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var lines = template.split("\n");
       for (var i=0; i < lines.length; i++) {
         lines[i] = lines[i].replace(regex, function(match, operator, name) {
           switch(operator) {
             case "!": // ignore comments
               return "";
             case "=": // set new delimiters, rebuild the replace regexp
               that.set_delimiters(name);
               regex = new_regex();
               return "";
             case ">": // render partial
               return that.render_partial(name, context, partials);
             case "{": // the triple mustache is unescaped
               return that.find(name, context);
             default: // escape the value
               return that.escape(that.find(name, context));
           }
         }, this);
         if(!in_recursion) {
           this.send(lines[i]);
         }
       }

       if(in_recursion) {
         return lines.join("\n");
       }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
    return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      if(is_kinda_truthy(context[name])) {
        var value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        var value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      return ((s == null) ? "" : s).toString().replace(/&(?!\w+;)|["<>\\]/g, function(s) {
        switch(s) {
          case "&": return "&amp;";
          case "\\": return "\\\\";;
          case '"': return '\"';;
          case "<": return "&lt;";
          case ">": return "&gt;";
          default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else if(this.pragmas["IMPLICIT-ITERATOR"]) {
        var iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator || ".";
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i=0;i<l;i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.0-dev",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
      var renderer = new Renderer();
      if(send_fun) {
        renderer.send = send_fun;
      }
      renderer.render(template, view, partials);
      if(!send_fun) {
        return renderer.buffer.join("\n");
      }
    }
  });
}();

Groupon.Models.Division = Backbone.Model.extend({
  initialize: function() {
    for(var attr in this.attributes) {
      if(!this[attr])
        this[attr] = this.attributes[attr];
    }
  },

  divisionPath: function() {
    return '/' + this.get('id');
  },

  areaDivisionPath: function(area) {
    return '/' + this.get('id') + '/area/' + area.id;
  },

  htmlTitle: function(area) {
    area = area || null;
    var title = this.get('id');
    if(area)
      title += ':' + area.id;

    return title;
  },

  cssClasses: function() {
    classes = '';

    if(
      Groupon.TouchData.Division && 
      Groupon.TouchData.Division == this.get('id') &&
      (Groupon.TouchData.Area.blank() || this.get('id') == Groupon.TouchData.Area)
    ) {
      classes += ' current';
    }
    classes += Cycle.thru(' grey', '', {name: 'zebra'});
    return classes;
  },

  areas: function() {
    var that = this;
    var areas =  _.map(this.attributes.areas, function(area, i) {
      area.ifAreaNameDifferent = area.name != that.name;
      area.divisionName = that.name;
      if(area.ifAreaNameDifferent)
        area.cssClasses = that.cssClasses.call(that);
      area.htmlTitle = that.htmlTitle.call(that, area);
      area.areaDivisionPath = that.areaDivisionPath.call(that, area);
      return area;
    });
    return areas;
  }

});

Groupon.Collections.Divisions = Backbone.Collection.extend({
  model: Groupon.Models.Division,

  url: 'http://api.groupon.com/v1/divisions.json?callback=?&show_areas=true',

  parse: function(response) {
    return response.divisions;
  },

  initialize: function() {
  }
});

        Groupon = Groupon || {};
        Groupon.MustacheTemplates = Groupon.MustacheTemplates || {};
        Groupon.MustacheTemplates['touch/application/_division_drawer'] = "<div id='locations-div' class='sub-page {{# loading }} loading {{/ loading }}'>\n  <div class='header'>\n    <a href='#main' class='back' data-ajax='false'></a>\n    <h2>Choose Your City</h2>\n  </div>\n\n  {{^ loading }}\n    <ul>\n      {{# divisions }}\n      <li>\n        <a href='{{ divisionPath }}' class='{{ cssClasses }}' title='{{ htmlTitle }}' data-ajax='false'>\n          {{ name }}\n          <span></span>\n        </a>\n      </li>\n        \n      {{# areas }}\n        {{# ifAreaNameDifferent }}\n          <li>\n            <a href='{{ areaDivisionPath }}' class='{{ cssClasses }}' title='{{ htmlTitle }}'>\n              {{ divisionName }} - {{ name }}\n              <span></span>\n            </a>\n          </li>\n        {{/ ifAreaNameDifferent }}\n      {{/ areas }}\n      {{/ divisions }}\n    </ul>\n  {{/ loading }}\n</div>\n\n";

/*
Copyright (c) 2010, Groupon. All rights reserved.
Author: Swati Raju
version: 1.0.0
*/
  /**
  * Groupon Touch Deals
  *
  * @module Deals
  * @title Deals
  * @namespace Groupon.Touch
  * @requires jQuery
  */
Groupon.Touch.Deals = function() {
  var periods = ["day", "hr", "min"];
  var lengths = ["86400","3600","60"];
  var numOfIntervalsToShow = 3;
  var dealsFlag = false;
  /**
  * Handle Page load
  *
  * @method handlePageLoad
  * @param
  * @returns
  */
  var handlePageLoad = function(){
    if ($("#now-new-badge")){ 
      $("#now-new-badge").one('webkitAnimationEnd', function(){
        $("#now-new-badge").setStyle('right', '3px');
      });
      $("#now-new-badge").addClass('show-badge'); 
    }
  }
  /**
  * Update deal time
  *
  * @method updateDealTime
  * @param
  * @returns
  */
  var updateDealTime = function(container){
    var deadline = Date.parse(Groupon.TouchData.deadline);
    var now = new Date().getTime();
    var difference = (deadline - now)/1000;
    var timeIntervalsArray = [];
    var storeIfZero = false;
    var content = "";
    for(var j = 0; j < periods.length; j++) {
      if(Math.ceil(difference) >= lengths[j]){
        storeIfZero = true;
        var remainingTimeForInterval = Math.floor(difference / lengths[j]);     
        if (remainingTimeForInterval > 1){ content += (remainingTimeForInterval + " " + periods[j] + "s"); } 
        else { content +=  (remainingTimeForInterval + " " + periods[j]); }
        difference = difference % lengths[j];
      }
      else if(storeIfZero) { content += "0 " + periods[j] + "s"; }
      if (j != periods.length - 1 && content != ""){ content += ", "; }
    }
    if (content){ content += " left to buy!"} 
    (container || $("#remaining_time")).html(content);
  }
  /**
  * Update number sold
  *
  * @method updateSold
  * @param
  * @returns
  */
  var updateSold = function(){
    $.ajax({ 
      url: '/deals/' + Groupon.TouchData.permalink + '/deal_status.json', 
      success: function(data){
          if (data && data.number_sold_container){ $("#num_sold_cont").html(data.number_sold_container); }
      }
    });
  }
  /**
  * Handle Location Change
  *
  * @method locationChange
  * @param
  * @returns
  */
  var handleLocationChange = function(e, obj, orginiale){
    Groupon.Touch.Base.setLocation(obj.title);
    document.location = obj.href;
  }
  /**
  * Handle Show /Hide Details
  *
  * @method showDetails Toggle
  * @param
  * @returns
  */
  var showDetailsToggle = function(e){
    if (e.data.reverse){
      Groupon.Touch.Base.animatePages($("#details"), $("#main"), "slide", e.data.reverse);
    } else {
      Groupon.Touch.Base.animatePages($("#main"),  $("#details"), "slide", e.data.reverse);
    }
  }
  /**
   * Handle Show Additional Deals
   *
   * @method handleShowAddDeals
   * @param
   * @returns
   */
   var handleShowAddDeals = function(e){ 
     if (e.data.reverse){
       Groupon.Touch.Base.animatePages($("#more-deals"), $("#main"), "slide", e.data.reverse);
     } else {
       Groupon.Touch.Base.animatePages($("#main"),  $("#more-deals"), "slide", e.data.reverse);
     }
   }
   /**
    * Show Multi Deals
    *
    * @method showsMultideal
    * @param
    * @returns
    */
    var showMultideals = function(e){ 
      e.preventDefault();
      if (e.data.reverse){
        var returnScreen = $("#main");
        if (dealsFlag){ returnScreen = $("#details"); }
        Groupon.Touch.Base.animatePages($("#multi-deals"), returnScreen, "slideup", e.data.reverse);
      } else {
        dealsFlag = (this.id == "d-buy") ? true : false; 
        Groupon.Touch.Base.animatePages($(".current"),  $("#multi-deals"), "slideup", e.data.reverse);
      }
    }
  /**
  * Load Additional Deals
  *
  * @method loadAdditionalDeals
  * @param
  * @returns
  */
  var loadAdditionalDeals = function(){ 
    /*var url = "/" + Groupon.TouchData.Division + "/api/v1/deals.json";
    $.clearJSON(url, callback);
    
    //handle swipe
    var callback = function(json, status) {
      var deals = json.deals;
      var content = "";
      var grey = true;
      for (var d in deals){
        if (!deals.hasOwnProperty(d)){ continue; }
        if (Groupon.TouchData.permalink == deals[d].id){ continue; }
        var cls = (grey) ? "grey" : "";
        grey = !grey;
        content += "<li class='" + cls + "'>"
        content += "<a href='/deals/" + deals[d].id + "'>";
        content += "<div class='l'><img src='" + deals[d].medium_image_url + "'/></div>";
        var area = deals[d].division_name;
        if (deals[d].areas && deals[d].areas.length){
          var permalink = deals[d].areas[0];
          var tokens = permalink.split("-");
          area = "";
          for(t in tokens){
            if (!tokens.hasOwnProperty(t)){ continue; }
            area += tokens[t].charAt(0).toUpperCase() + tokens[t].substring(1) + " ";
          }
        }
        content += "<div class='r'><h3>" + area + "</h3>";
        content += "<span>" + deals[d].title + "</span></div><div class='clr'></div>";
        content += "</a></li>";
      }
      if (content){ 
        content = "<ul class='d-list'>" + content + "</ul>"; 
        $("#more").css('visibility', 'visible');
        $("#more-deals-bd").html(content);
      } else { $("#more").css('visibility', 'hidden'); }
    };
    //SR-PROD: change
    $.retrieveJSON(url, callback);*/
    $("#more").css('visibility', 'visible');
    
  }
  return{
    /**
    * init page
    *
    * @method init
    * @param
    * @returns
    */
    updateDealTime : updateDealTime,

    init: function() {
      $(window).bind("load", handlePageLoad);
      if (Groupon.TouchData.deadline){
        updateDealTime();
        setInterval(updateDealTime, 60000);
      }
      if (Groupon.TouchData.permalink){ setInterval(updateSold, 180000); }
      $('#locations-div').bind('locationChange', handleLocationChange);
      if ($('#details')){
        $('#show-details').bind('click', {reverse: false}, showDetailsToggle);
        $('#details-back').bind('click', {reverse: true}, showDetailsToggle);
      }
      if ($("#more") && Groupon.TouchData.Division){
        loadAdditionalDeals();
        $("#more").bind("click", {reverse: false}, handleShowAddDeals);
        $('#more-back').bind('click', {reverse: true}, handleShowAddDeals);
      }
      if ($(".multi-buy") && $("#multi-deals")){ 
        $(".multi-buy").bind("click", {reverse: false }, showMultideals); 
        $("#multi-cancel").bind("click", {reverse: true}, showMultideals);
      }
      //hack
      if ($("#fix1")){ $("#fix1").html($("#fix1").text()); }
      if ($("#fix2")){ $("#fix2").html($("#fix2").text()); }
    }
  };
}();
Groupon.Touch.Deals.init();