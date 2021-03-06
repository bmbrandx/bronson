# Bronson Core
#
# @author Eric Clifford
# @version 0.0.1
#
Core = Bronson.Core = 
  events: {}
  modules: {}

  # Publish an event to it's subscribers
  # @param event [String] the event to publish to
  #
  # @example
  #   Bronson.Core.publish 'TestEvent'
  #
  publish: (event) ->
    # Verify our input parameters
    if not event?
      throw new Error "Bronson.Core#publish: event must be defined"

    if typeof event isnt "string"
      throw new Error "Bronson.Core#publish: event must be a string" 

    # Verify that the event exists
    if !@events[event]
      return true

    # Get all subscribers to this event
    subscribers = @events[event].slice()

    # Get the arguments
    args = [].slice.call(arguments, 1)

    # Call the callback method on all subscribers
    for subscriber in subscribers
      subscriber.callback.apply this, args

  # Subscribe a module to an event
  #
  # @param subscriber [String] The module to subscribe
  # @param event [String] The event to listen on
  # @param callback [Function] the method to invoke 
  #
  # @example
  #   Bronson.Core.subscribe 'TestModule', 'TestEvent', ->
  #     console.log 'Event has been triggered'
  #
  subscribe: (subscriber, event, callback) -> 
    # Verify our input parameters
    if not subscriber? || typeof subscriber isnt "string"
      throw new Error "Bronson.Core#subscribe: must supply a valid subscriber"
   
    if not event? || typeof event isnt "string"
      throw new Error "Bronson.Core#subscribe: must supply a valid event"

    if callback? and typeof callback isnt "function"
      throw new Error "Bronson.Core#subscribe: callback must be a function"   

    # Create the event if it doesn't exist otherwise select it
    @events[event] = (if (not @events[event]) then [] else @events[event])

    # Push the event
    @events[event].push 
      subscriber: subscriber
      callback: callback

  # Unsubscribe a subscriber from a event
  # @param subscriber [String] The module to subscribe
  # @param event [String] The event to listen on
  # 
  # @example
  #   Bronson.Core.unsubscribe 'TestModule', 'TestEvent', ->
  #     console.log 'Module succesfully unsubscribed'
  #
  unsubscribe: (subscriber, event) ->
    for item, i in @events[event]
      if item.subscriber == subscriber
        @events[event].splice i, 1

  # Unsubscribe subscriber from all events
  # @param subscriber [String] The module to unsubscribe
  #
  # @example
  #   Bronson.Core.unsubscribeAll 'TestModule'
  #
  unsubscribeAll: (subscriber) ->
    for event of @events
      if @events.hasOwnProperty(event) 
        # Iterate through events and remove subscribers
        for subscriber, y in @events[event]
          if subscriber == subscriber
            @events[event].splice y, 1
        # If event is empty delete it
        if @events[event].length == 0
          delete @events[event]  
   
  # Load a module
  #
  # @param moduleId [String] the AMD module to load(alias or relative path)
  # @param autostart [Boolean] whether or not to autostart the module
  # @param obj... [Object] the optional configuration object
  # @param callback [Function] the callback
  #
  # @todo
  #   - change splat optional parameter to more terse optional argument as outlined
  #     here https://github.com/jashkenas/coffee-script/issues/1091
  #   - We need to renable to check to verify that a module has a dispose/init method for efficent
  #     garbage collection
  #
  # @example
  #   Bronson.Core.createModule 'TestModule', {foo: 'bar'}, ->
  #     console.log 'module has been created'
  #
  loadModule: (module, obj..., callback, autostart) ->  
    # Verify the input paramaters
    if not module?
      throw new Error "Bronson.Core#createModule: module must be defined"

    if typeof module isnt 'string'
      throw new Error "Bronson.Core#createModule: module must be a string"

    if autostart? and typeof autostart isnt 'boolean'
      throw new Error "Bronson.Core#createModule: autostart must be a valid boolean"

    obj = obj[0]

    # Load the module through RequireJS
    require ['module', module], (Module, LoadedModule) =>
      try 
        _module = new LoadedModule(obj)
        _module.id = Module.id

        # Create the module if it doesn't exist otherwise select it
        @modules[module] = (if (not @modules[module]) then [] else @modules[module])

        # Store the loaded module
        @modules[module].push
          id: _module.id 
          timeStamp: new Date()
          load: _module.load
          start: _module.start
          stop: _module.stop
          unload: _module.unload

        # State the module if specified
        _module.start() if autostart

        callback(_module)
      catch e 
        throw new Error "Bronson.Core#createModule: #{e}"

  # Stop all modues
  #
  # @example
  #   Bronson.Core.stopAllModules()
  #
  unloadAllModules: () ->
    for id of modules
      @unloadModule id
    callback()

  # Stop module
  #
  # @example
  #   Bronson.Core.stopModule 'TestModule'
  #
  unloadModule: (id) ->
    # Validate input parameters
    if not id? || typeof id isnt "string"
      throw new Error "Bronson.Core#stopModule: id must be valid"

    # if not @modules[module]?
    #   throw new Error "Bronson.Core#stopModule: that module is not loaded"

    try 
      #require.undef(module) 
      #delete @modules[module]
      #if @modules[
      #@unsubscribeAll module

      for module of @modules
        if @modules.hasOwnProperty(module) 
          for instance, y in @modules[module]
            if instance.id == id
              instance.unload()
              delete @modules[module][y] 

      if @modules[module].length == 0
        require.undef module

    catch e
      throw new Error "Bronson.Core#stopModule: #{e}"

  # startModule
  # A module by default may not be started and may need done so manually
  #
  # @param @id [string] The RequireJS id of the loaded module instance
  #
  # @example
  #   Bronson.Core.startModule 'TestModule'
  #
  startModule: (id) ->
    for module of @modules
      if @modules.hasOwnProperty(module) 
        for instance, y in @modules[module]
          if instance.id == id
            instance.start()

  # stopModule
  # A module may be stopped manually
  # 
  # param @id [string] The RequireJS id of the loaded module instance
  #
  stopModule: (id) ->
    for module of @modules
      if @modules.hasOwnProperty(module) 
        for instance, y in @modules[module]
          if instance.id == id
            instance.stop()




