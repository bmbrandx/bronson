(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  (function(root, factory) {
    if (typeof define === "function" && define.amd) {
      return define([], factory);
    } else {
      return root.Bronson = factory(root.b);
    }
  })(this, function() {
    var Api, Bronson, Core, Permissions, Util;
    Bronson = window.Bronson = {
      version: "0.0.1"
    };
    require.onError = function(err) {
      var failedId;
      if (err.requireType === 'timeout') {
        return console.error("Could not load module " + err.requireModules);
      } else {
        failedId = err.requireModules && err.requireModules[0];
        require.undef(failedId);
        throw err;
      }
    };
    requirejs.onResourceLoad = function(context, map, depArray) {};
    Api = Bronson.Api = {
      publish: function(event) {
        return Bronson.Core.publish(event, arguments[1]);
      },
      subscribe: function(subscriber, event, callback) {
        if (Permissions.validate(subscriber, event)) {
          return Bronson.Core.subscribe(subscriber, event, callback);
        } else {
          throw new Error("Bronson.Api#subscribe: Subscriber " + subscriber + " not allowed to listen on event " + event);
        }
      },
      unsubscribe: function(subscriber, event, callback) {
        return Bronson.Core.unsubscribe(subscriber, event, callback);
      },
      loadModule: function() {
        var autostart, callback, moduleId, obj, _i, _ref;
        moduleId = arguments[0], obj = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), callback = arguments[_i++], autostart = arguments[_i++];
        if (autostart == null) {
          autostart = true;
        }
        return (_ref = Bronson.Core).loadModule.apply(_ref, [moduleId, autostart].concat(__slice.call(obj), [callback]));
      },
      unloadAllModules: function() {
        return Bronson.Core.unloadAllModules();
      },
      unloadModule: function(moduleId, callback) {
        return Bronson.Core.unloadModule(moduleId, callback);
      },
      startModule: function(id) {
        return Bronson.Core.startModule(moduleId);
      },
      stopModule: function(id) {
        return Bronson.Core.stopModule(moduleId);
      },
      setPermissions: function(permissions) {
        return Bronson.Permissions.set(permissions);
      },
      getModulesInfo: function() {
        return Bronson.Core.modules;
      },
      getEventsInfo: function() {
        return Bronson.Core.events;
      }
    };
    Permissions = Bronson.Permissions = {
      enabled: false,
      rules: {},
      set: function(props) {
        return this.rules = Bronson.Util.extend(this.rules, props);
      },
      validate: function(subscriber, channel) {
        var test, _ref;
        if (!(subscriber != null) || typeof subscriber !== 'string') {
          throw new Error('Bronson.Permissions#validate: must provide a valid subscriber');
        }
        if (!(channel != null) || typeof channel !== 'string') {
          throw new Error('Bronson.Permissions#validate: must provide a valid channel');
        }
        if (this.enabled) {
          test = (_ref = this.rules[subscriber]) != null ? _ref[channel] : void 0;
          if (test === void 0) {
            return false;
          } else {
            return test;
          }
        } else {
          return true;
        }
      }
    };
    Core = Bronson.Core = {
      events: {},
      modules: {},
      publish: function(event) {
        var args, subscriber, subscribers, _i, _len, _results;
        if (!(event != null)) {
          throw new Error("Bronson.Core#publish: event must be defined");
        }
        if (typeof event !== "string") {
          throw new Error("Bronson.Core#publish: event must be a string");
        }
        if (!this.events[event]) {
          return true;
        }
        subscribers = this.events[event].slice();
        args = [].slice.call(arguments, 1);
        _results = [];
        for (_i = 0, _len = subscribers.length; _i < _len; _i++) {
          subscriber = subscribers[_i];
          _results.push(subscriber.callback.apply(this, args));
        }
        return _results;
      },
      subscribe: function(subscriber, event, callback) {
        if (!(subscriber != null) || typeof subscriber !== "string") {
          throw new Error("Bronson.Core#subscribe: must supply a valid subscriber");
        }
        if (!(event != null) || typeof event !== "string") {
          throw new Error("Bronson.Core#subscribe: must supply a valid event");
        }
        if ((callback != null) && typeof callback !== "function") {
          throw new Error("Bronson.Core#subscribe: callback must be a function");
        }
        this.events[event] = (!this.events[event] ? [] : this.events[event]);
        return this.events[event].push({
          subscriber: subscriber,
          callback: callback
        });
      },
      unsubscribe: function(subscriber, event) {
        var i, item, _i, _len, _ref, _results;
        _ref = this.events[event];
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          item = _ref[i];
          if (item.subscriber === subscriber) {
            _results.push(this.events[event].splice(i, 1));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      unsubscribeAll: function(subscriber) {
        var event, y, _i, _len, _ref, _results;
        _results = [];
        for (event in this.events) {
          if (this.events.hasOwnProperty(event)) {
            _ref = this.events[event];
            for (y = _i = 0, _len = _ref.length; _i < _len; y = ++_i) {
              subscriber = _ref[y];
              if (subscriber === subscriber) {
                this.events[event].splice(y, 1);
              }
            }
            if (this.events[event].length === 0) {
              _results.push(delete this.events[event]);
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      loadModule: function() {
        var autostart, callback, module, obj, _i,
          _this = this;
        module = arguments[0], obj = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), callback = arguments[_i++], autostart = arguments[_i++];
        if (!(module != null)) {
          throw new Error("Bronson.Core#createModule: module must be defined");
        }
        if (typeof module !== 'string') {
          throw new Error("Bronson.Core#createModule: module must be a string");
        }
        if ((autostart != null) && typeof autostart !== 'boolean') {
          throw new Error("Bronson.Core#createModule: autostart must be a valid boolean");
        }
        obj = obj[0];
        return require(['module', module], function(Module, LoadedModule) {
          var _module;
          try {
            _module = new LoadedModule(obj);
            _module.id = Module.id;
            _this.modules[module] = (!_this.modules[module] ? [] : _this.modules[module]);
            _this.modules[module].push({
              id: _module.id,
              timeStamp: new Date(),
              load: _module.load,
              start: _module.start,
              stop: _module.stop,
              unload: _module.unload
            });
            if (autostart) {
              _module.start();
            }
            return callback(_module);
          } catch (e) {
            throw new Error("Bronson.Core#createModule: " + e);
          }
        });
      },
      unloadAllModules: function() {
        var id;
        for (id in modules) {
          this.unloadModule(id);
        }
        return callback();
      },
      unloadModule: function(id) {
        var instance, module, y, _i, _len, _ref;
        if (!(id != null) || typeof id !== "string") {
          throw new Error("Bronson.Core#stopModule: id must be valid");
        }
        try {
          for (module in this.modules) {
            if (this.modules.hasOwnProperty(module)) {
              _ref = this.modules[module];
              for (y = _i = 0, _len = _ref.length; _i < _len; y = ++_i) {
                instance = _ref[y];
                if (instance.id === id) {
                  instance.unload();
                  delete this.modules[module][y];
                }
              }
            }
          }
          if (this.modules[module].length === 0) {
            return require.undef(module);
          }
        } catch (e) {
          throw new Error("Bronson.Core#stopModule: " + e);
        }
      },
      startModule: function(id) {
        var instance, module, y, _results;
        _results = [];
        for (module in this.modules) {
          if (this.modules.hasOwnProperty(module)) {
            _results.push((function() {
              var _i, _len, _ref, _results1;
              _ref = this.modules[module];
              _results1 = [];
              for (y = _i = 0, _len = _ref.length; _i < _len; y = ++_i) {
                instance = _ref[y];
                if (instance.id === id) {
                  _results1.push(instance.start());
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(this));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      stopModule: function(id) {
        var instance, module, y, _results;
        _results = [];
        for (module in this.modules) {
          if (this.modules.hasOwnProperty(module)) {
            _results.push((function() {
              var _i, _len, _ref, _results1;
              _ref = this.modules[module];
              _results1 = [];
              for (y = _i = 0, _len = _ref.length; _i < _len; y = ++_i) {
                instance = _ref[y];
                if (instance.id === id) {
                  _results1.push(instance.stop());
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
            }).call(this));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };
    Bronson.Module = (function() {

      Module.prototype.id = "";

      Module.prototype.disposed = false;

      function Module() {
        this.load.apply(this, arguments);
      }

      Module.prototype.load = function() {
        throw new Error("Bronson.Module#initialize: must override initialize");
      };

      Module.prototype.start = function() {
        throw new Error("Bronson.Module#start: must override start");
      };

      Module.prototype.stop = function() {
        throw new Error("Bronson.Module#stop: must override stop");
      };

      Module.prototype.unload = function() {
        var obj, prop;
        if (this.disposed) {
          return;
        }
        for (prop in this) {
          if (!__hasProp.call(this, prop)) continue;
          obj = this[prop];
          if (obj && typeof obj.dispose === 'function') {
            obj.dispose();
            delete this[prop];
          }
        }
        this.disposed = true;
        return typeof Object.freeze === "function" ? Object.freeze(this) : void 0;
      };

      return Module;

    })();
    Util = Bronson.Util = {
      extend: function() {
        var extenders, key, object, other, val, _i, _len;
        object = arguments[0], extenders = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!(object != null)) {
          return {};
        }
        for (_i = 0, _len = extenders.length; _i < _len; _i++) {
          other = extenders[_i];
          for (key in other) {
            if (!__hasProp.call(other, key)) continue;
            val = other[key];
            if (!(object[key] != null) || typeof val !== "object") {
              object[key] = val;
            } else {
              object[key] = this.extend(object[key], val);
            }
          }
        }
        return object;
      }
    };
    return Bronson;
  });

}).call(this);
