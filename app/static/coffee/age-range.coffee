define ["util/type", "helper/events", "status-bar", "jquery", "tpl!./age-range"], (type, Events, statusBar, $, rangeTemplate) ->
  class AgeRange
    Events.mixin AgeRange
    @Events = type.createEnum(["USER_DONE"])

    constructor: (options) ->
      {@config} = options
      @options = options || {}
      @result = null
      @list = ['lower', 'upper']

      @el = document.createElement 'div'
      @el.className = 'age-range'
      @el.style.display = 'none'
      if @options.noModify
        @config.upper = false
        @config.lower = false
      @el.innerHTML = rangeTemplate(@config)
      document.body.appendChild @el

      @form =
        upper: @el.querySelector '.upper'
        lower: @el.querySelector '.lower'
        form: @el.querySelector 'form'
      @form.form.onsubmit = (e) =>
        e.preventDefault()
        if !@options.noModify
          @validate()
        return false
    show: (previousResult) ->
      @result = previousResult || {}
      @form.upper.value = 100
      @form.lower.value = 0
      if @result.age_range
        for key in @list
          if @result.age_range[key]
            @form[key].value = @result.age_range[key]
      @el.style.display = 'block'
      for key in @list
        if @config[key]
          @form[key].focus()
          break
    hide: ->
      @el.style.display = 'none'
    validate: =>
      if not @result.age_range
        @result['age_range'] = {}
      for key in @list
        if @config[key]
          if isNaN @form[key].value
            return
          @result.age_range[key] = parseInt @form[key].value
      if @result.age_range.lower > @result.age_range.upper
        alert '年龄上限需要高于下限'
        return
      @trigger AgeRange.Events.USER_DONE, @getResult()
      return
    getResult: ->
      return @result
  return AgeRange
