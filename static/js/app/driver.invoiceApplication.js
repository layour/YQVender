/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)

/*!
 * =====================================================
 * SUI Mobile - http://m.sui.taobao.org/
 *
 * =====================================================
 */
$.smVersion="0.6.2",+function(a){"use strict";var b={autoInit:!1,showPageLoadingIndicator:!0,router:!0,swipePanel:"left",swipePanelOnlyClose:!0};a.smConfig=a.extend(b,a.config)}(Zepto),+function(a){"use strict";a.compareVersion=function(a,b){var c=a.split("."),d=b.split(".");if(a===b)return 0;for(var e=0;e<c.length;e++){var f=parseInt(c[e]);if(!d[e])return 1;var g=parseInt(d[e]);if(g>f)return-1;if(f>g)return 1}return-1},a.getCurrentPage=function(){return a(".page-current")[0]||a(".page")[0]||document.body}}(Zepto),function(a){"use strict";function b(a,b){function c(a){if(a.target===this)for(b.call(this,a),d=0;d<e.length;d++)f.off(e[d],c)}var d,e=a,f=this;if(b)for(d=0;d<e.length;d++)f.on(e[d],c)}["width","height"].forEach(function(b){var c=b.replace(/./,function(a){return a[0].toUpperCase()});a.fn["outer"+c]=function(a){var c=this;if(c){var d=c[b](),e={width:["left","right"],height:["top","bottom"]};return e[b].forEach(function(b){a&&(d+=parseInt(c.css("margin-"+b),10))}),d}return null}}),a.support=function(){var a={touch:!!("ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch)};return a}(),a.touchEvents={start:a.support.touch?"touchstart":"mousedown",move:a.support.touch?"touchmove":"mousemove",end:a.support.touch?"touchend":"mouseup"},a.getTranslate=function(a,b){var c,d,e,f;return"undefined"==typeof b&&(b="x"),e=window.getComputedStyle(a,null),window.WebKitCSSMatrix?f=new WebKitCSSMatrix("none"===e.webkitTransform?"":e.webkitTransform):(f=e.MozTransform||e.transform||e.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),c=f.toString().split(",")),"x"===b&&(d=window.WebKitCSSMatrix?f.m41:16===c.length?parseFloat(c[12]):parseFloat(c[4])),"y"===b&&(d=window.WebKitCSSMatrix?f.m42:16===c.length?parseFloat(c[13]):parseFloat(c[5])),d||0},a.requestAnimationFrame=function(a){return requestAnimationFrame?requestAnimationFrame(a):webkitRequestAnimationFrame?webkitRequestAnimationFrame(a):mozRequestAnimationFrame?mozRequestAnimationFrame(a):setTimeout(a,1e3/60)},a.cancelAnimationFrame=function(a){return cancelAnimationFrame?cancelAnimationFrame(a):webkitCancelAnimationFrame?webkitCancelAnimationFrame(a):mozCancelAnimationFrame?mozCancelAnimationFrame(a):clearTimeout(a)},a.fn.dataset=function(){var b={},c=this[0].dataset;for(var d in c){var e=b[d]=c[d];"false"===e?b[d]=!1:"true"===e?b[d]=!0:parseFloat(e)===1*e&&(b[d]=1*e)}return a.extend({},b,this[0].__eleData)},a.fn.data=function(b,c){var d=a(this).dataset();if(!b)return d;if("undefined"==typeof c){var e=d[b],f=this[0].__eleData;return f&&b in f?f[b]:e}for(var g=0;g<this.length;g++){var h=this[g];b in d&&delete h.dataset[b],h.__eleData||(h.__eleData={}),h.__eleData[b]=c}return this},a.fn.animationEnd=function(a){return b.call(this,["webkitAnimationEnd","animationend"],a),this},a.fn.transitionEnd=function(a){return b.call(this,["webkitTransitionEnd","transitionend"],a),this},a.fn.transition=function(a){"string"!=typeof a&&(a+="ms");for(var b=0;b<this.length;b++){var c=this[b].style;c.webkitTransitionDuration=c.MozTransitionDuration=c.transitionDuration=a}return this},a.fn.transform=function(a){for(var b=0;b<this.length;b++){var c=this[b].style;c.webkitTransform=c.MozTransform=c.transform=a}return this},a.fn.prevAll=function(b){var c=[],d=this[0];if(!d)return a([]);for(;d.previousElementSibling;){var e=d.previousElementSibling;b?a(e).is(b)&&c.push(e):c.push(e),d=e}return a(c)},a.fn.nextAll=function(b){var c=[],d=this[0];if(!d)return a([]);for(;d.nextElementSibling;){var e=d.nextElementSibling;b?a(e).is(b)&&c.push(e):c.push(e),d=e}return a(c)},a.fn.show=function(){function a(a){var c,d;return b[a]||(c=document.createElement(a),document.body.appendChild(c),d=getComputedStyle(c,"").getPropertyValue("display"),c.parentNode.removeChild(c),"none"===d&&(d="block"),b[a]=d),b[a]}var b={};return this.each(function(){"none"===this.style.display&&(this.style.display=""),"none"===getComputedStyle(this,"").getPropertyValue("display"),this.style.display=a(this.nodeName)})}}(Zepto),function(a){"use strict";var b={},c=navigator.userAgent,d=c.match(/(Android);?[\s\/]+([\d.]+)?/),e=c.match(/(iPad).*OS\s([\d_]+)/),f=c.match(/(iPod)(.*OS\s([\d_]+))?/),g=!e&&c.match(/(iPhone\sOS)\s([\d_]+)/);if(b.ios=b.android=b.iphone=b.ipad=b.androidChrome=!1,d&&(b.os="android",b.osVersion=d[2],b.android=!0,b.androidChrome=c.toLowerCase().indexOf("chrome")>=0),(e||g||f)&&(b.os="ios",b.ios=!0),g&&!f&&(b.osVersion=g[2].replace(/_/g,"."),b.iphone=!0),e&&(b.osVersion=e[2].replace(/_/g,"."),b.ipad=!0),f&&(b.osVersion=f[3]?f[3].replace(/_/g,"."):null,b.iphone=!0),b.ios&&b.osVersion&&c.indexOf("Version/")>=0&&"10"===b.osVersion.split(".")[0]&&(b.osVersion=c.toLowerCase().split("version/")[1].split(" ")[0]),b.webView=(g||e||f)&&c.match(/.*AppleWebKit(?!.*Safari)/i),b.os&&"ios"===b.os){var h=b.osVersion.split(".");b.minimalUi=!b.webView&&(f||g)&&(1*h[0]===7?1*h[1]>=1:1*h[0]>7)&&a('meta[name="viewport"]').length>0&&a('meta[name="viewport"]').attr("content").indexOf("minimal-ui")>=0}var i=a(window).width(),j=a(window).height();b.statusBar=!1,b.webView&&i*j===screen.width*screen.height?b.statusBar=!0:b.statusBar=!1;var k=[];if(b.pixelRatio=window.devicePixelRatio||1,k.push("pixel-ratio-"+Math.floor(b.pixelRatio)),b.pixelRatio>=2&&k.push("retina"),b.os&&(k.push(b.os,b.os+"-"+b.osVersion.split(".")[0],b.os+"-"+b.osVersion.replace(/\./g,"-")),"ios"===b.os))for(var l=parseInt(b.osVersion.split(".")[0],10),m=l-1;m>=6;m--)k.push("ios-gt-"+m);b.statusBar?k.push("with-statusbar-overlay"):a("html").removeClass("with-statusbar-overlay"),k.length>0&&a("html").addClass(k.join(" ")),b.isWeixin=/MicroMessenger/i.test(c),a.device=b}(Zepto),function(){"use strict";function a(b,d){function e(a,b){return function(){return a.apply(b,arguments)}}var f;if(d=d||{},this.trackingClick=!1,this.trackingClickStart=0,this.targetElement=null,this.touchStartX=0,this.touchStartY=0,this.lastTouchIdentifier=0,this.touchBoundary=d.touchBoundary||10,this.layer=b,this.tapDelay=d.tapDelay||200,this.tapTimeout=d.tapTimeout||700,!a.notNeeded(b)){for(var g=["onMouse","onClick","onTouchStart","onTouchMove","onTouchEnd","onTouchCancel"],h=this,i=0,j=g.length;j>i;i++)h[g[i]]=e(h[g[i]],h);c&&(b.addEventListener("mouseover",this.onMouse,!0),b.addEventListener("mousedown",this.onMouse,!0),b.addEventListener("mouseup",this.onMouse,!0)),b.addEventListener("click",this.onClick,!0),b.addEventListener("touchstart",this.onTouchStart,!1),b.addEventListener("touchmove",this.onTouchMove,!1),b.addEventListener("touchend",this.onTouchEnd,!1),b.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(b.removeEventListener=function(a,c,d){var e=Node.prototype.removeEventListener;"click"===a?e.call(b,a,c.hijacked||c,d):e.call(b,a,c,d)},b.addEventListener=function(a,c,d){var e=Node.prototype.addEventListener;"click"===a?e.call(b,a,c.hijacked||(c.hijacked=function(a){a.propagationStopped||c(a)}),d):e.call(b,a,c,d)}),"function"==typeof b.onclick&&(f=b.onclick,b.addEventListener("click",function(a){f(a)},!1),b.onclick=null)}}var b=navigator.userAgent.indexOf("Windows Phone")>=0,c=navigator.userAgent.indexOf("Android")>0&&!b,d=/iP(ad|hone|od)/.test(navigator.userAgent)&&!b,e=d&&/OS 4_\d(_\d)?/.test(navigator.userAgent),f=d&&/OS [6-7]_\d/.test(navigator.userAgent),g=navigator.userAgent.indexOf("BB10")>0,h=!1;a.prototype.needsClick=function(a){for(var b=a;b&&"BODY"!==b.tagName.toUpperCase();){if("LABEL"===b.tagName.toUpperCase()&&(h=!0,/\bneedsclick\b/.test(b.className)))return!0;b=b.parentNode}switch(a.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(a.disabled)return!0;break;case"input":if(d&&"file"===a.type||a.disabled)return!0;break;case"label":case"iframe":case"video":return!0}return/\bneedsclick\b/.test(a.className)},a.prototype.needsFocus=function(a){switch(a.nodeName.toLowerCase()){case"textarea":return!0;case"select":return!c;case"input":switch(a.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return!1}return!a.disabled&&!a.readOnly;default:return/\bneedsfocus\b/.test(a.className)}},a.prototype.sendClick=function(a,b){var c,d;document.activeElement&&document.activeElement!==a&&document.activeElement.blur(),d=b.changedTouches[0],c=document.createEvent("MouseEvents"),c.initMouseEvent(this.determineEventType(a),!0,!0,window,1,d.screenX,d.screenY,d.clientX,d.clientY,!1,!1,!1,!1,0,null),c.forwardedTouchEvent=!0,a.dispatchEvent(c)},a.prototype.determineEventType=function(a){return c&&"select"===a.tagName.toLowerCase()?"mousedown":"click"},a.prototype.focus=function(a){var b,c=["date","time","month","number","email"];d&&a.setSelectionRange&&-1===c.indexOf(a.type)?(b=a.value.length,a.setSelectionRange(b,b)):a.focus()},a.prototype.updateScrollParent=function(a){var b,c;if(b=a.fastClickScrollParent,!b||!b.contains(a)){c=a;do{if(c.scrollHeight>c.offsetHeight){b=c,a.fastClickScrollParent=c;break}c=c.parentElement}while(c)}b&&(b.fastClickLastScrollTop=b.scrollTop)},a.prototype.getTargetElementFromEventTarget=function(a){return a.nodeType===Node.TEXT_NODE?a.parentNode:a},a.prototype.onTouchStart=function(a){var b,c,f;if(a.targetTouches.length>1)return!0;if(b=this.getTargetElementFromEventTarget(a.target),c=a.targetTouches[0],d){if(f=window.getSelection(),f.rangeCount&&!f.isCollapsed)return!0;if(!e){if(c.identifier&&c.identifier===this.lastTouchIdentifier)return a.preventDefault(),!1;this.lastTouchIdentifier=c.identifier,this.updateScrollParent(b)}}return this.trackingClick=!0,this.trackingClickStart=a.timeStamp,this.targetElement=b,this.touchStartX=c.pageX,this.touchStartY=c.pageY,a.timeStamp-this.lastClickTime<this.tapDelay&&a.preventDefault(),!0},a.prototype.touchHasMoved=function(a){var b=a.changedTouches[0],c=this.touchBoundary;return Math.abs(b.pageX-this.touchStartX)>c||Math.abs(b.pageY-this.touchStartY)>c?!0:!1},a.prototype.onTouchMove=function(a){return this.trackingClick?((this.targetElement!==this.getTargetElementFromEventTarget(a.target)||this.touchHasMoved(a))&&(this.trackingClick=!1,this.targetElement=null),!0):!0},a.prototype.findControl=function(a){return void 0!==a.control?a.control:a.htmlFor?document.getElementById(a.htmlFor):a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")},a.prototype.onTouchEnd=function(a){var b,g,h,i,j,k=this.targetElement;if(!this.trackingClick)return!0;if(a.timeStamp-this.lastClickTime<this.tapDelay)return this.cancelNextClick=!0,!0;if(a.timeStamp-this.trackingClickStart>this.tapTimeout)return!0;var l=["date","time","month"];if(-1!==l.indexOf(a.target.type))return!1;if(this.cancelNextClick=!1,this.lastClickTime=a.timeStamp,g=this.trackingClickStart,this.trackingClick=!1,this.trackingClickStart=0,f&&(j=a.changedTouches[0],k=document.elementFromPoint(j.pageX-window.pageXOffset,j.pageY-window.pageYOffset)||k,k.fastClickScrollParent=this.targetElement.fastClickScrollParent),h=k.tagName.toLowerCase(),"label"===h){if(b=this.findControl(k)){if(this.focus(k),c)return!1;k=b}}else if(this.needsFocus(k))return a.timeStamp-g>100||d&&window.top!==window&&"input"===h?(this.targetElement=null,!1):(this.focus(k),this.sendClick(k,a),d&&"select"===h||(this.targetElement=null,a.preventDefault()),!1);return d&&!e&&(i=k.fastClickScrollParent,i&&i.fastClickLastScrollTop!==i.scrollTop)?!0:(this.needsClick(k)||(a.preventDefault(),this.sendClick(k,a)),!1)},a.prototype.onTouchCancel=function(){this.trackingClick=!1,this.targetElement=null},a.prototype.onMouse=function(a){return this.targetElement?a.forwardedTouchEvent?!0:a.cancelable&&(!this.needsClick(this.targetElement)||this.cancelNextClick)?(a.stopImmediatePropagation?a.stopImmediatePropagation():a.propagationStopped=!0,a.stopPropagation(),h||a.preventDefault(),!1):!0:!0},a.prototype.onClick=function(a){var b;return this.trackingClick?(this.targetElement=null,this.trackingClick=!1,!0):"submit"===a.target.type&&0===a.detail?!0:(b=this.onMouse(a),b||(this.targetElement=null),b)},a.prototype.destroy=function(){var a=this.layer;c&&(a.removeEventListener("mouseover",this.onMouse,!0),a.removeEventListener("mousedown",this.onMouse,!0),a.removeEventListener("mouseup",this.onMouse,!0)),a.removeEventListener("click",this.onClick,!0),a.removeEventListener("touchstart",this.onTouchStart,!1),a.removeEventListener("touchmove",this.onTouchMove,!1),a.removeEventListener("touchend",this.onTouchEnd,!1),a.removeEventListener("touchcancel",this.onTouchCancel,!1)},a.notNeeded=function(a){var b,d,e,f;if("undefined"==typeof window.ontouchstart)return!0;if(d=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1]){if(!c)return!0;if(b=document.querySelector("meta[name=viewport]")){if(-1!==b.content.indexOf("user-scalable=no"))return!0;if(d>31&&document.documentElement.scrollWidth<=window.outerWidth)return!0}}if(g&&(e=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/),e[1]>=10&&e[2]>=3&&(b=document.querySelector("meta[name=viewport]")))){if(-1!==b.content.indexOf("user-scalable=no"))return!0;if(document.documentElement.scrollWidth<=window.outerWidth)return!0}return"none"===a.style.msTouchAction||"manipulation"===a.style.touchAction?!0:(f=+(/Firefox\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1],f>=27&&(b=document.querySelector("meta[name=viewport]"),b&&(-1!==b.content.indexOf("user-scalable=no")||document.documentElement.scrollWidth<=window.outerWidth))?!0:"none"===a.style.touchAction||"manipulation"===a.style.touchAction?!0:!1)},a.attach=function(b,c){return new a(b,c)},window.FastClick=a}(),+function(a){"use strict";function b(b){var c,e=a(this),f=(e.attr("href"),e.dataset());e.hasClass("open-popup")&&(c=f.popup?f.popup:".popup",a.popup(c)),e.hasClass("close-popup")&&(c=f.popup?f.popup:".popup.modal-in",a.closeModal(c)),e.hasClass("modal-overlay")&&(a(".modal.modal-in").length>0&&d.modalCloseByOutside&&a.closeModal(".modal.modal-in"),a(".actions-modal.modal-in").length>0&&d.actionsCloseByOutside&&a.closeModal(".actions-modal.modal-in")),e.hasClass("popup-overlay")&&a(".popup.modal-in").length>0&&d.popupCloseByOutside&&a.closeModal(".popup.modal-in")}var c=document.createElement("div");a.modalStack=[],a.modalStackClearQueue=function(){a.modalStack.length&&a.modalStack.shift()()},a.modal=function(b){b=b||{};var e="",f="";if(b.buttons&&b.buttons.length>0)for(var g=0;g<b.buttons.length;g++)f+='<span class="modal-button'+(b.buttons[g].bold?" modal-button-bold":"")+'">'+b.buttons[g].text+"</span>";var h=b.extraClass||"",i=b.title?'<div class="modal-title">'+b.title+"</div>":"",j=b.text?'<div class="modal-text">'+b.text+"</div>":"",k=b.afterText?b.afterText:"",l=b.buttons&&0!==b.buttons.length?"":"modal-no-buttons",m=b.verticalButtons?"modal-buttons-vertical":"";e='<div class="modal '+h+" "+l+'"><div class="modal-inner">'+(i+j+k)+'</div><div class="modal-buttons '+m+'">'+f+"</div></div>",c.innerHTML=e;var n=a(c).children();return a(d.modalContainer).append(n[0]),n.find(".modal-button").each(function(c,d){a(d).on("click",function(d){b.buttons[c].close!==!1&&a.closeModal(n),b.buttons[c].onClick&&b.buttons[c].onClick(n,d),b.onClick&&b.onClick(n,c)})}),a.openModal(n),n[0]},a.alert=function(b,c,e){return"function"==typeof c&&(e=arguments[1],c=void 0),a.modal({text:b||"",title:"undefined"==typeof c?d.modalTitle:c,buttons:[{text:d.modalButtonOk,bold:!0,onClick:e}]})},a.confirm=function(b,c,e,f){return"function"==typeof c&&(f=arguments[2],e=arguments[1],c=void 0),a.modal({text:b||"",title:"undefined"==typeof c?d.modalTitle:c,buttons:[{text:d.modalButtonCancel,onClick:f},{text:d.modalButtonOk,bold:!0,onClick:e}]})},a.prompt=function(b,c,e,f){return"function"==typeof c&&(f=arguments[2],e=arguments[1],c=void 0),a.modal({text:b||"",title:"undefined"==typeof c?d.modalTitle:c,afterText:'<input type="text" class="modal-text-input">',buttons:[{text:d.modalButtonCancel},{text:d.modalButtonOk,bold:!0}],onClick:function(b,c){0===c&&f&&f(a(b).find(".modal-text-input").val()),1===c&&e&&e(a(b).find(".modal-text-input").val())}})},a.modalLogin=function(b,c,e,f){return"function"==typeof c&&(f=arguments[2],e=arguments[1],c=void 0),a.modal({text:b||"",title:"undefined"==typeof c?d.modalTitle:c,afterText:'<input type="text" name="modal-username" placeholder="'+d.modalUsernamePlaceholder+'" class="modal-text-input modal-text-input-double"><input type="password" name="modal-password" placeholder="'+d.modalPasswordPlaceholder+'" class="modal-text-input modal-text-input-double">',buttons:[{text:d.modalButtonCancel},{text:d.modalButtonOk,bold:!0}],onClick:function(b,c){var d=a(b).find('.modal-text-input[name="modal-username"]').val(),g=a(b).find('.modal-text-input[name="modal-password"]').val();0===c&&f&&f(d,g),1===c&&e&&e(d,g)}})},a.modalPassword=function(b,c,e,f){return"function"==typeof c&&(f=arguments[2],e=arguments[1],c=void 0),a.modal({text:b||"",title:"undefined"==typeof c?d.modalTitle:c,afterText:'<input type="password" name="modal-password" placeholder="'+d.modalPasswordPlaceholder+'" class="modal-text-input">',buttons:[{text:d.modalButtonCancel},{text:d.modalButtonOk,bold:!0}],onClick:function(b,c){var d=a(b).find('.modal-text-input[name="modal-password"]').val();0===c&&f&&f(d),1===c&&e&&e(d)}})},a.showPreloader=function(b){return a.hidePreloader(),a.showPreloader.preloaderModal=a.modal({title:b||d.modalPreloaderTitle,text:'<div class="preloader"></div>'}),a.showPreloader.preloaderModal},a.hidePreloader=function(){a.showPreloader.preloaderModal&&a.closeModal(a.showPreloader.preloaderModal)},a.showIndicator=function(){a(".preloader-indicator-modal")[0]||a(d.modalContainer).append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>')},a.hideIndicator=function(){a(".preloader-indicator-overlay, .preloader-indicator-modal").remove()},a.actions=function(b){var e,f,g;b=b||[],b.length>0&&!a.isArray(b[0])&&(b=[b]);for(var h,i="",j=0;j<b.length;j++)for(var k=0;k<b[j].length;k++){0===k&&(i+='<div class="actions-modal-group">');var l=b[j][k],m=l.label?"actions-modal-label":"actions-modal-button";l.bold&&(m+=" actions-modal-button-bold"),l.color&&(m+=" color-"+l.color),l.bg&&(m+=" bg-"+l.bg),l.disabled&&(m+=" disabled"),i+='<span class="'+m+'">'+l.text+"</span>",k===b[j].length-1&&(i+="</div>")}h='<div class="actions-modal">'+i+"</div>",c.innerHTML=h,e=a(c).children(),a(d.modalContainer).append(e[0]),f=".actions-modal-group",g=".actions-modal-button";var n=e.find(f);return n.each(function(c,d){var f=c;a(d).children().each(function(c,d){var h,i=c,j=b[f][i];a(d).is(g)&&(h=a(d)),h&&h.on("click",function(b){j.close!==!1&&a.closeModal(e),j.onClick&&j.onClick(e,b)})})}),a.openModal(e),e[0]},a.popup=function(b,c){if("undefined"==typeof c&&(c=!0),"string"==typeof b&&b.indexOf("<")>=0){var e=document.createElement("div");if(e.innerHTML=b.trim(),!(e.childNodes.length>0))return!1;b=e.childNodes[0],c&&b.classList.add("remove-on-close"),a(d.modalContainer).append(b)}return b=a(b),0===b.length?!1:(b.show(),b.find(".content").scroller("refresh"),b.find("."+d.viewClass).length>0&&a.sizeNavbars(b.find("."+d.viewClass)[0]),a.openModal(b),b[0])},a.pickerModal=function(b,c){if("undefined"==typeof c&&(c=!0),"string"==typeof b&&b.indexOf("<")>=0){if(b=a(b),!(b.length>0))return!1;c&&b.addClass("remove-on-close"),a(d.modalContainer).append(b[0])}return b=a(b),0===b.length?!1:(b.show(),a.openModal(b),b[0])},a.loginScreen=function(b){return b||(b=".login-screen"),b=a(b),0===b.length?!1:(b.show(),b.find("."+d.viewClass).length>0&&a.sizeNavbars(b.find("."+d.viewClass)[0]),a.openModal(b),b[0])},a.toast=function(b,c,d){var e=a('<div class="modal toast '+(d||"")+'">'+b+"</div>").appendTo(document.body);a.openModal(e,function(){setTimeout(function(){a.closeModal(e)},c||2e3)})},a.openModal=function(b,c){b=a(b);var e=b.hasClass("modal"),f=!b.hasClass("toast");if(a(".modal.modal-in:not(.modal-out)").length&&d.modalStack&&e&&f)return void a.modalStack.push(function(){a.openModal(b,c)});var g=b.hasClass("popup"),h=b.hasClass("login-screen"),i=b.hasClass("picker-modal"),j=b.hasClass("toast");e&&(b.show(),b.css({marginTop:-Math.round(b.outerHeight()/2)+"px"})),j&&b.css({marginLeft:-Math.round(b.outerWidth()/2/1.185)+"px"});var k;h||i||j||(0!==a(".modal-overlay").length||g||a(d.modalContainer).append('<div class="modal-overlay"></div>'),0===a(".popup-overlay").length&&g&&a(d.modalContainer).append('<div class="popup-overlay"></div>'),k=a(g?".popup-overlay":".modal-overlay"));b[0].clientLeft;return b.trigger("open"),i&&a(d.modalContainer).addClass("with-picker-modal"),h||i||j||k.addClass("modal-overlay-visible"),b.removeClass("modal-out").addClass("modal-in").transitionEnd(function(a){b.hasClass("modal-out")?b.trigger("closed"):b.trigger("opened")}),"function"==typeof c&&c.call(this),!0},a.closeModal=function(b){if(b=a(b||".modal-in"),"undefined"==typeof b||0!==b.length){var c=b.hasClass("modal"),e=b.hasClass("popup"),f=b.hasClass("toast"),g=b.hasClass("login-screen"),h=b.hasClass("picker-modal"),i=b.hasClass("remove-on-close"),j=a(e?".popup-overlay":".modal-overlay");return e?b.length===a(".popup.modal-in").length&&j.removeClass("modal-overlay-visible"):h||f||j.removeClass("modal-overlay-visible"),b.trigger("close"),h&&(a(d.modalContainer).removeClass("with-picker-modal"),a(d.modalContainer).addClass("picker-modal-closing")),b.removeClass("modal-in").addClass("modal-out").transitionEnd(function(c){b.hasClass("modal-out")?b.trigger("closed"):b.trigger("opened"),h&&a(d.modalContainer).removeClass("picker-modal-closing"),e||g||h?(b.removeClass("modal-out").hide(),i&&b.length>0&&b.remove()):b.remove()}),c&&d.modalStack&&a.modalStackClearQueue(),!0}},a(document).on("click"," .modal-overlay, .popup-overlay, .close-popup, .open-popup, .close-picker",b);var d=a.modal.prototype.defaults={modalStack:!0,modalButtonOk:"确定",modalButtonCancel:"取消",modalPreloaderTitle:"加载中",modalContainer:document.body}}(Zepto),+function(a){"use strict";var b=!1,c=function(c){function d(a){a=new Date(a);var b=a.getFullYear(),c=a.getMonth(),d=c+1,e=a.getDate(),f=a.getDay();return h.params.dateFormat.replace(/yyyy/g,b).replace(/yy/g,(b+"").substring(2)).replace(/mm/g,10>d?"0"+d:d).replace(/m/g,d).replace(/MM/g,h.params.monthNames[c]).replace(/M/g,h.params.monthNamesShort[c]).replace(/dd/g,10>e?"0"+e:e).replace(/d/g,e).replace(/DD/g,h.params.dayNames[f]).replace(/D/g,h.params.dayNamesShort[f])}function e(b){if(b.preventDefault(),a.device.isWeixin&&a.device.android&&h.params.inputReadOnly&&(this.focus(),this.blur()),!h.opened&&(h.open(),h.params.scrollToInput)){var c=h.input.parents(".content");if(0===c.length)return;var d,e=parseInt(c.css("padding-top"),10),f=parseInt(c.css("padding-bottom"),10),g=c[0].offsetHeight-e-h.container.height(),i=c[0].scrollHeight-e-h.container.height(),j=h.input.offset().top-e+h.input[0].offsetHeight;if(j>g){var k=c.scrollTop()+j-g;k+g>i&&(d=k+g-i+f,g===i&&(d=h.container.height()),c.css({"padding-bottom":d+"px"})),c.scrollTop(k,300)}}}function f(b){h.input&&h.input.length>0?b.target!==h.input[0]&&0===a(b.target).parents(".picker-modal").length&&h.close():0===a(b.target).parents(".picker-modal").length&&h.close()}function g(){h.opened=!1,h.input&&h.input.length>0&&h.input.parents(".content").css({"padding-bottom":""}),h.params.onClose&&h.params.onClose(h),h.destroyCalendarEvents()}var h=this,i={monthNames:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],monthNamesShort:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],dayNames:["周日","周一","周二","周三","周四","周五","周六"],dayNamesShort:["周日","周一","周二","周三","周四","周五","周六"],firstDay:1,weekendDays:[0,6],multiple:!1,dateFormat:"yyyy-mm-dd",direction:"horizontal",minDate:null,maxDate:null,touchMove:!0,animate:!0,closeOnSelect:!0,monthPicker:!0,monthPickerTemplate:'<div class="picker-calendar-month-picker"><a href="#" class="link icon-only picker-calendar-prev-month"><i class="icon icon-prev"></i></a><div class="current-month-value"></div><a href="#" class="link icon-only picker-calendar-next-month"><i class="icon icon-next"></i></a></div>',yearPicker:!0,yearPickerTemplate:'<div class="picker-calendar-year-picker"><a href="#" class="link icon-only picker-calendar-prev-year"><i class="icon icon-prev"></i></a><span class="current-year-value"></span><a href="#" class="link icon-only picker-calendar-next-year"><i class="icon icon-next"></i></a></div>',weekHeader:!0,scrollToInput:!0,inputReadOnly:!0,toolbar:!0,toolbarCloseText:"Done",toolbarTemplate:'<div class="toolbar"><div class="toolbar-inner">{{monthPicker}}{{yearPicker}}</div></div>'};c=c||{};for(var j in i)"undefined"==typeof c[j]&&(c[j]=i[j]);h.params=c,h.initialized=!1,h.inline=h.params.container?!0:!1,h.isH="horizontal"===h.params.direction;var k=h.isH&&b?-1:1;return h.animating=!1,h.addValue=function(a){if(h.params.multiple){h.value||(h.value=[]);for(var b,c=0;c<h.value.length;c++)new Date(a).getTime()===new Date(h.value[c]).getTime()&&(b=c);"undefined"==typeof b?h.value.push(a):h.value.splice(b,1),h.updateValue()}else h.value=[a],h.updateValue()},h.setValue=function(a){h.value=a,h.updateValue()},h.updateValue=function(){h.wrapper.find(".picker-calendar-day-selected").removeClass("picker-calendar-day-selected");var b,c;for(b=0;b<h.value.length;b++){var e=new Date(h.value[b]);h.wrapper.find('.picker-calendar-day[data-date="'+e.getFullYear()+"-"+e.getMonth()+"-"+e.getDate()+'"]').addClass("picker-calendar-day-selected")}if(h.params.onChange&&h.params.onChange(h,h.value,h.value.map(d)),h.input&&h.input.length>0){if(h.params.formatValue)c=h.params.formatValue(h,h.value);else{for(c=[],b=0;b<h.value.length;b++)c.push(d(h.value[b]));c=c.join(", ")}a(h.input).val(c),a(h.input).trigger("change")}},h.initCalendarEvents=function(){function c(a){i||g||(g=!0,j=n="touchstart"===a.type?a.targetTouches[0].pageX:a.pageX,l=n="touchstart"===a.type?a.targetTouches[0].pageY:a.pageY,o=(new Date).getTime(),u=0,x=!0,w=void 0,q=r=h.monthsTranslate)}function d(a){if(g){if(m="touchmove"===a.type?a.targetTouches[0].pageX:a.pageX,n="touchmove"===a.type?a.targetTouches[0].pageY:a.pageY,"undefined"==typeof w&&(w=!!(w||Math.abs(n-l)>Math.abs(m-j))),h.isH&&w)return void(g=!1);if(a.preventDefault(),h.animating)return void(g=!1);x=!1,i||(i=!0,s=h.wrapper[0].offsetWidth,t=h.wrapper[0].offsetHeight,h.wrapper.transition(0)),a.preventDefault(),v=h.isH?m-j:n-l,u=v/(h.isH?s:t),r=100*(h.monthsTranslate*k+u),h.wrapper.transform("translate3d("+(h.isH?r:0)+"%, "+(h.isH?0:r)+"%, 0)")}}function e(a){return g&&i?(g=i=!1,p=(new Date).getTime(),300>p-o?Math.abs(v)<10?h.resetMonth():v>=10?b?h.nextMonth():h.prevMonth():b?h.prevMonth():h.nextMonth():-.5>=u?b?h.prevMonth():h.nextMonth():u>=.5?b?h.nextMonth():h.prevMonth():h.resetMonth(),void setTimeout(function(){x=!0},100)):void(g=i=!1)}function f(b){if(x){var c=a(b.target).parents(".picker-calendar-day");if(0===c.length&&a(b.target).hasClass("picker-calendar-day")&&(c=a(b.target)),0!==c.length&&(!c.hasClass("picker-calendar-day-selected")||h.params.multiple)&&!c.hasClass("picker-calendar-day-disabled")){c.hasClass("picker-calendar-day-next")&&h.nextMonth(),c.hasClass("picker-calendar-day-prev")&&h.prevMonth();var d=c.attr("data-year"),e=c.attr("data-month"),f=c.attr("data-day");h.params.onDayClick&&h.params.onDayClick(h,c[0],d,e,f),h.addValue(new Date(d,e,f).getTime()),h.params.closeOnSelect&&h.close()}}}var g,i,j,l,m,n,o,p,q,r,s,t,u,v,w,x=!0;h.container.find(".picker-calendar-prev-month").on("click",h.prevMonth),h.container.find(".picker-calendar-next-month").on("click",h.nextMonth),h.container.find(".picker-calendar-prev-year").on("click",h.prevYear),h.container.find(".picker-calendar-next-year").on("click",h.nextYear),h.wrapper.on("click",f),h.params.touchMove&&(h.wrapper.on(a.touchEvents.start,c),h.wrapper.on(a.touchEvents.move,d),h.wrapper.on(a.touchEvents.end,e)),h.container[0].f7DestroyCalendarEvents=function(){h.container.find(".picker-calendar-prev-month").off("click",h.prevMonth),h.container.find(".picker-calendar-next-month").off("click",h.nextMonth),h.container.find(".picker-calendar-prev-year").off("click",h.prevYear),h.container.find(".picker-calendar-next-year").off("click",h.nextYear),h.wrapper.off("click",f),h.params.touchMove&&(h.wrapper.off(a.touchEvents.start,c),h.wrapper.off(a.touchEvents.move,d),h.wrapper.off(a.touchEvents.end,e))}},h.destroyCalendarEvents=function(a){"f7DestroyCalendarEvents"in h.container[0]&&h.container[0].f7DestroyCalendarEvents()},h.daysInMonth=function(a){var b=new Date(a);return new Date(b.getFullYear(),b.getMonth()+1,0).getDate()},h.monthHTML=function(a,b){a=new Date(a);var c=a.getFullYear(),d=a.getMonth();a.getDate();"next"===b&&(a=11===d?new Date(c+1,0):new Date(c,d+1,1)),"prev"===b&&(a=0===d?new Date(c-1,11):new Date(c,d-1,1)),("next"===b||"prev"===b)&&(d=a.getMonth(),c=a.getFullYear());var e=h.daysInMonth(new Date(a.getFullYear(),a.getMonth()).getTime()-864e6),f=h.daysInMonth(a),g=new Date(a.getFullYear(),a.getMonth()).getDay();0===g&&(g=7);var i,j,k,l=[],m=6,n=7,o="",p=0+(h.params.firstDay-1),q=(new Date).setHours(0,0,0,0),r=h.params.minDate?new Date(h.params.minDate).getTime():null,s=h.params.maxDate?new Date(h.params.maxDate).getTime():null;if(h.value&&h.value.length)for(j=0;j<h.value.length;j++)l.push(new Date(h.value[j]).setHours(0,0,0,0));for(j=1;m>=j;j++){var t="";for(k=1;n>=k;k++){var u=k;p++;var v=p-g,w="";0>v?(v=e+v+1,w+=" picker-calendar-day-prev",i=new Date(0>d-1?c-1:c,0>d-1?11:d-1,v).getTime()):(v+=1,v>f?(v-=f,w+=" picker-calendar-day-next",i=new Date(d+1>11?c+1:c,d+1>11?0:d+1,v).getTime()):i=new Date(c,d,v).getTime()),i===q&&(w+=" picker-calendar-day-today"),l.indexOf(i)>=0&&(w+=" picker-calendar-day-selected"),h.params.weekendDays.indexOf(u-1)>=0&&(w+=" picker-calendar-day-weekend"),(r&&r>i||s&&i>s)&&(w+=" picker-calendar-day-disabled"),i=new Date(i);var x=i.getFullYear(),y=i.getMonth();t+='<div data-year="'+x+'" data-month="'+y+'" data-day="'+v+'" class="picker-calendar-day'+w+'" data-date="'+(x+"-"+y+"-"+v)+'"><span>'+v+"</span></div>"}o+='<div class="picker-calendar-row">'+t+"</div>"}return o='<div class="picker-calendar-month" data-year="'+c+'" data-month="'+d+'">'+o+"</div>"},h.animating=!1,h.updateCurrentMonthYear=function(a){"undefined"==typeof a?(h.currentMonth=parseInt(h.months.eq(1).attr("data-month"),10),h.currentYear=parseInt(h.months.eq(1).attr("data-year"),10)):(h.currentMonth=parseInt(h.months.eq("next"===a?h.months.length-1:0).attr("data-month"),10),h.currentYear=parseInt(h.months.eq("next"===a?h.months.length-1:0).attr("data-year"),10)),h.container.find(".current-month-value").text(h.params.monthNames[h.currentMonth]),h.container.find(".current-year-value").text(h.currentYear)},h.onMonthChangeStart=function(a){h.updateCurrentMonthYear(a),h.months.removeClass("picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next");var b="next"===a?h.months.length-1:0;h.months.eq(b).addClass("picker-calendar-month-current"),h.months.eq("next"===a?b-1:b+1).addClass("next"===a?"picker-calendar-month-prev":"picker-calendar-month-next"),h.params.onMonthYearChangeStart&&h.params.onMonthYearChangeStart(h,h.currentYear,h.currentMonth)},h.onMonthChangeEnd=function(a,b){h.animating=!1;var c,d,e;h.wrapper.find(".picker-calendar-month:not(.picker-calendar-month-prev):not(.picker-calendar-month-current):not(.picker-calendar-month-next)").remove(),"undefined"==typeof a&&(a="next",b=!0),b?(h.wrapper.find(".picker-calendar-month-next, .picker-calendar-month-prev").remove(),d=h.monthHTML(new Date(h.currentYear,h.currentMonth),"prev"),c=h.monthHTML(new Date(h.currentYear,h.currentMonth),"next")):e=h.monthHTML(new Date(h.currentYear,h.currentMonth),a),("next"===a||b)&&h.wrapper.append(e||c),("prev"===a||b)&&h.wrapper.prepend(e||d),h.months=h.wrapper.find(".picker-calendar-month"),h.setMonthsTranslate(h.monthsTranslate),h.params.onMonthAdd&&h.params.onMonthAdd(h,"next"===a?h.months.eq(h.months.length-1)[0]:h.months.eq(0)[0]),h.params.onMonthYearChangeEnd&&h.params.onMonthYearChangeEnd(h,h.currentYear,h.currentMonth);
},h.setMonthsTranslate=function(a){a=a||h.monthsTranslate||0,"undefined"==typeof h.monthsTranslate&&(h.monthsTranslate=a),h.months.removeClass("picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next");var b=100*-(a+1)*k,c=100*-a*k,d=100*-(a-1)*k;h.months.eq(0).transform("translate3d("+(h.isH?b:0)+"%, "+(h.isH?0:b)+"%, 0)").addClass("picker-calendar-month-prev"),h.months.eq(1).transform("translate3d("+(h.isH?c:0)+"%, "+(h.isH?0:c)+"%, 0)").addClass("picker-calendar-month-current"),h.months.eq(2).transform("translate3d("+(h.isH?d:0)+"%, "+(h.isH?0:d)+"%, 0)").addClass("picker-calendar-month-next")},h.nextMonth=function(b){("undefined"==typeof b||"object"==typeof b)&&(b="",h.params.animate||(b=0));var c=parseInt(h.months.eq(h.months.length-1).attr("data-month"),10),d=parseInt(h.months.eq(h.months.length-1).attr("data-year"),10),e=new Date(d,c),f=e.getTime(),g=h.animating?!1:!0;if(h.params.maxDate&&f>new Date(h.params.maxDate).getTime())return h.resetMonth();if(h.monthsTranslate--,c===h.currentMonth){var i=100*-h.monthsTranslate*k,j=a(h.monthHTML(f,"next")).transform("translate3d("+(h.isH?i:0)+"%, "+(h.isH?0:i)+"%, 0)").addClass("picker-calendar-month-next");h.wrapper.append(j[0]),h.months=h.wrapper.find(".picker-calendar-month"),h.params.onMonthAdd&&h.params.onMonthAdd(h,h.months.eq(h.months.length-1)[0])}h.animating=!0,h.onMonthChangeStart("next");var l=100*h.monthsTranslate*k;h.wrapper.transition(b).transform("translate3d("+(h.isH?l:0)+"%, "+(h.isH?0:l)+"%, 0)"),g&&h.wrapper.transitionEnd(function(){h.onMonthChangeEnd("next")}),h.params.animate||h.onMonthChangeEnd("next")},h.prevMonth=function(b){("undefined"==typeof b||"object"==typeof b)&&(b="",h.params.animate||(b=0));var c=parseInt(h.months.eq(0).attr("data-month"),10),d=parseInt(h.months.eq(0).attr("data-year"),10),e=new Date(d,c+1,-1),f=e.getTime(),g=h.animating?!1:!0;if(h.params.minDate&&f<new Date(h.params.minDate).getTime())return h.resetMonth();if(h.monthsTranslate++,c===h.currentMonth){var i=100*-h.monthsTranslate*k,j=a(h.monthHTML(f,"prev")).transform("translate3d("+(h.isH?i:0)+"%, "+(h.isH?0:i)+"%, 0)").addClass("picker-calendar-month-prev");h.wrapper.prepend(j[0]),h.months=h.wrapper.find(".picker-calendar-month"),h.params.onMonthAdd&&h.params.onMonthAdd(h,h.months.eq(0)[0])}h.animating=!0,h.onMonthChangeStart("prev");var l=100*h.monthsTranslate*k;h.wrapper.transition(b).transform("translate3d("+(h.isH?l:0)+"%, "+(h.isH?0:l)+"%, 0)"),g&&h.wrapper.transitionEnd(function(){h.onMonthChangeEnd("prev")}),h.params.animate||h.onMonthChangeEnd("prev")},h.resetMonth=function(a){"undefined"==typeof a&&(a="");var b=100*h.monthsTranslate*k;h.wrapper.transition(a).transform("translate3d("+(h.isH?b:0)+"%, "+(h.isH?0:b)+"%, 0)")},h.setYearMonth=function(a,b,c){"undefined"==typeof a&&(a=h.currentYear),"undefined"==typeof b&&(b=h.currentMonth),("undefined"==typeof c||"object"==typeof c)&&(c="",h.params.animate||(c=0));var d;if(d=a<h.currentYear?new Date(a,b+1,-1).getTime():new Date(a,b).getTime(),h.params.maxDate&&d>new Date(h.params.maxDate).getTime())return!1;if(h.params.minDate&&d<new Date(h.params.minDate).getTime())return!1;var e=new Date(h.currentYear,h.currentMonth).getTime(),f=d>e?"next":"prev",g=h.monthHTML(new Date(a,b));h.monthsTranslate=h.monthsTranslate||0;var i,j,l=h.monthsTranslate,m=h.animating?!1:!0;d>e?(h.monthsTranslate--,h.animating||h.months.eq(h.months.length-1).remove(),h.wrapper.append(g),h.months=h.wrapper.find(".picker-calendar-month"),i=100*-(l-1)*k,h.months.eq(h.months.length-1).transform("translate3d("+(h.isH?i:0)+"%, "+(h.isH?0:i)+"%, 0)").addClass("picker-calendar-month-next")):(h.monthsTranslate++,h.animating||h.months.eq(0).remove(),h.wrapper.prepend(g),h.months=h.wrapper.find(".picker-calendar-month"),i=100*-(l+1)*k,h.months.eq(0).transform("translate3d("+(h.isH?i:0)+"%, "+(h.isH?0:i)+"%, 0)").addClass("picker-calendar-month-prev")),h.params.onMonthAdd&&h.params.onMonthAdd(h,"next"===f?h.months.eq(h.months.length-1)[0]:h.months.eq(0)[0]),h.animating=!0,h.onMonthChangeStart(f),j=100*h.monthsTranslate*k,h.wrapper.transition(c).transform("translate3d("+(h.isH?j:0)+"%, "+(h.isH?0:j)+"%, 0)"),m&&h.wrapper.transitionEnd(function(){h.onMonthChangeEnd(f,!0)}),h.params.animate||h.onMonthChangeEnd(f)},h.nextYear=function(){h.setYearMonth(h.currentYear+1)},h.prevYear=function(){h.setYearMonth(h.currentYear-1)},h.layout=function(){var a,b="",c="",d=h.value&&h.value.length?h.value[0]:(new Date).setHours(0,0,0,0),e=h.monthHTML(d,"prev"),f=h.monthHTML(d),g=h.monthHTML(d,"next"),i='<div class="picker-calendar-months"><div class="picker-calendar-months-wrapper">'+(e+f+g)+"</div></div>",j="";if(h.params.weekHeader){for(a=0;7>a;a++){var k=a+h.params.firstDay>6?a-7+h.params.firstDay:a+h.params.firstDay,l=h.params.dayNamesShort[k];j+='<div class="picker-calendar-week-day '+(h.params.weekendDays.indexOf(k)>=0?"picker-calendar-week-day-weekend":"")+'"> '+l+"</div>"}j='<div class="picker-calendar-week-days">'+j+"</div>"}c="picker-modal picker-calendar "+(h.params.cssClass||"");var m=h.params.toolbar?h.params.toolbarTemplate.replace(/{{closeText}}/g,h.params.toolbarCloseText):"";h.params.toolbar&&(m=h.params.toolbarTemplate.replace(/{{closeText}}/g,h.params.toolbarCloseText).replace(/{{monthPicker}}/g,h.params.monthPicker?h.params.monthPickerTemplate:"").replace(/{{yearPicker}}/g,h.params.yearPicker?h.params.yearPickerTemplate:"")),b='<div class="'+c+'">'+m+'<div class="picker-modal-inner">'+j+i+"</div></div>",h.pickerHTML=b},h.params.input&&(h.input=a(h.params.input),h.input.length>0&&(h.params.inputReadOnly&&h.input.prop("readOnly",!0),h.inline||h.input.on("click",e))),h.inline||a("html").on("click",f),h.opened=!1,h.open=function(){var b=!1;h.opened||(h.value||h.params.value&&(h.value=h.params.value,b=!0),h.layout(),h.inline?(h.container=a(h.pickerHTML),h.container.addClass("picker-modal-inline"),a(h.params.container).append(h.container)):(h.container=a(a.pickerModal(h.pickerHTML)),a(h.container).on("close",function(){g()})),h.container[0].f7Calendar=h,h.wrapper=h.container.find(".picker-calendar-months-wrapper"),h.months=h.wrapper.find(".picker-calendar-month"),h.updateCurrentMonthYear(),h.monthsTranslate=0,h.setMonthsTranslate(),h.initCalendarEvents(),b&&h.updateValue()),h.opened=!0,h.initialized=!0,h.params.onMonthAdd&&h.months.each(function(){h.params.onMonthAdd(h,this)}),h.params.onOpen&&h.params.onOpen(h)},h.close=function(){h.opened&&!h.inline&&a.closeModal(h.container)},h.destroy=function(){h.close(),h.params.input&&h.input.length>0&&h.input.off("click",e),a("html").off("click",f)},h.inline&&h.open(),h};a.fn.calendar=function(b){return this.each(function(){var d=a(this);if(d[0]){var e={};"INPUT"===d[0].tagName.toUpperCase()?e.input=d:e.container=d,new c(a.extend(e,b))}})},a.initCalendar=function(b){var c=a(b?b:document.body);c.find("[data-toggle='date']").each(function(){a(this).calendar()})}}(Zepto),+function(a){"use strict";var b=function(b){function c(){if(g.opened)for(var a=0;a<g.cols.length;a++)g.cols[a].divider||(g.cols[a].calcSize(),g.cols[a].setValue(g.cols[a].value,0,!1))}function d(b){if(b.preventDefault(),a.device.isWeixin&&a.device.android&&g.params.inputReadOnly&&(this.focus(),this.blur()),!g.opened&&(g.open(),g.params.scrollToInput)){var c=g.input.parents(".content");if(0===c.length)return;var d,e=parseInt(c.css("padding-top"),10),f=parseInt(c.css("padding-bottom"),10),h=c[0].offsetHeight-e-g.container.height(),i=c[0].scrollHeight-e-g.container.height(),j=g.input.offset().top-e+g.input[0].offsetHeight;if(j>h){var k=c.scrollTop()+j-h;k+h>i&&(d=k+h-i+f,h===i&&(d=g.container.height()),c.css({"padding-bottom":d+"px"})),c.scrollTop(k,300)}}}function e(b){g.opened&&(g.input&&g.input.length>0?b.target!==g.input[0]&&0===a(b.target).parents(".picker-modal").length&&g.close():0===a(b.target).parents(".picker-modal").length&&g.close())}function f(){g.opened=!1,g.input&&g.input.length>0&&g.input.parents(".content").css({"padding-bottom":""}),g.params.onClose&&g.params.onClose(g),g.container.find(".picker-items-col").each(function(){g.destroyPickerCol(this)})}var g=this,h={updateValuesOnMomentum:!1,updateValuesOnTouchmove:!0,rotateEffect:!1,momentumRatio:7,freeMode:!1,scrollToInput:!0,inputReadOnly:!0,toolbar:!0,toolbarCloseText:"确定",toolbarTemplate:'<header class="bar bar-nav">                <button class="button button-link pull-right close-picker">确定</button>                <h1 class="title">请选择</h1>                </header>'};b=b||{};for(var i in h)"undefined"==typeof b[i]&&(b[i]=h[i]);g.params=b,g.cols=[],g.initialized=!1,g.inline=g.params.container?!0:!1;var j=a.device.ios||navigator.userAgent.toLowerCase().indexOf("safari")>=0&&navigator.userAgent.toLowerCase().indexOf("chrome")<0&&!a.device.android;return g.setValue=function(a,b){for(var c=0,d=0;d<g.cols.length;d++)g.cols[d]&&!g.cols[d].divider&&(g.cols[d].setValue(a[c],b),c++)},g.updateValue=function(){for(var b=[],c=[],d=0;d<g.cols.length;d++)g.cols[d].divider||(b.push(g.cols[d].value),c.push(g.cols[d].displayValue));b.indexOf(void 0)>=0||(g.value=b,g.displayValue=c,g.params.onChange&&g.params.onChange(g,g.value,g.displayValue),g.input&&g.input.length>0&&(a(g.input).val(g.params.formatValue?g.params.formatValue(g,g.value,g.displayValue):g.value.join(" ")),a(g.input).trigger("change")))},g.initPickerCol=function(b,c){function d(){s=a.requestAnimationFrame(function(){m.updateItems(void 0,void 0,0),d()})}function e(b){u||t||(b.preventDefault(),t=!0,v=w="touchstart"===b.type?b.targetTouches[0].pageY:b.pageY,x=(new Date).getTime(),F=!0,z=B=a.getTranslate(m.wrapper[0],"y"))}function f(b){if(t){b.preventDefault(),F=!1,w="touchmove"===b.type?b.targetTouches[0].pageY:b.pageY,u||(a.cancelAnimationFrame(s),u=!0,z=B=a.getTranslate(m.wrapper[0],"y"),m.wrapper.transition(0)),b.preventDefault();var c=w-v;B=z+c,A=void 0,q>B&&(B=q-Math.pow(q-B,.8),A="min"),B>r&&(B=r+Math.pow(B-r,.8),A="max"),m.wrapper.transform("translate3d(0,"+B+"px,0)"),m.updateItems(void 0,B,0,g.params.updateValuesOnTouchmove),D=B-C||B,E=(new Date).getTime(),C=B}}function h(b){if(!t||!u)return void(t=u=!1);t=u=!1,m.wrapper.transition(""),A&&("min"===A?m.wrapper.transform("translate3d(0,"+q+"px,0)"):m.wrapper.transform("translate3d(0,"+r+"px,0)")),y=(new Date).getTime();var c,e;y-x>300?e=B:(c=Math.abs(D/(y-E)),e=B+D*g.params.momentumRatio),e=Math.max(Math.min(e,r),q);var f=-Math.floor((e-r)/o);g.params.freeMode||(e=-f*o+r),m.wrapper.transform("translate3d(0,"+parseInt(e,10)+"px,0)"),m.updateItems(f,e,"",!0),g.params.updateValuesOnMomentum&&(d(),m.wrapper.transitionEnd(function(){a.cancelAnimationFrame(s)})),setTimeout(function(){F=!0},100)}function i(b){if(F){a.cancelAnimationFrame(s);var c=a(this).attr("data-picker-value");m.setValue(c)}}var k=a(b),l=k.index(),m=g.cols[l];if(!m.divider){m.container=k,m.wrapper=m.container.find(".picker-items-col-wrapper"),m.items=m.wrapper.find(".picker-item");var n,o,p,q,r;m.replaceValues=function(a,b){m.destroyEvents(),m.values=a,m.displayValues=b;var c=g.columnHTML(m,!0);m.wrapper.html(c),m.items=m.wrapper.find(".picker-item"),m.calcSize(),m.setValue(m.values[0],0,!0),m.initEvents()},m.calcSize=function(){g.params.rotateEffect&&(m.container.removeClass("picker-items-col-absolute"),m.width||m.container.css({width:""}));var b,c;b=0,c=m.container[0].offsetHeight,n=m.wrapper[0].offsetHeight,o=m.items[0].offsetHeight,p=o*m.items.length,q=c/2-p+o/2,r=c/2-o/2,m.width&&(b=m.width,parseInt(b,10)===b&&(b+="px"),m.container.css({width:b})),g.params.rotateEffect&&(m.width||(m.items.each(function(){var c=a(this);c.css({width:"auto"}),b=Math.max(b,c[0].offsetWidth),c.css({width:""})}),m.container.css({width:b+2+"px"})),m.container.addClass("picker-items-col-absolute"))},m.calcSize(),m.wrapper.transform("translate3d(0,"+r+"px,0)").transition(0);var s;m.setValue=function(b,c,e){"undefined"==typeof c&&(c="");var f=m.wrapper.find('.picker-item[data-picker-value="'+b+'"]').index();if("undefined"!=typeof f&&-1!==f){var h=-f*o+r;m.wrapper.transition(c),m.wrapper.transform("translate3d(0,"+h+"px,0)"),g.params.updateValuesOnMomentum&&m.activeIndex&&m.activeIndex!==f&&(a.cancelAnimationFrame(s),m.wrapper.transitionEnd(function(){a.cancelAnimationFrame(s)}),d()),m.updateItems(f,h,c,e)}},m.updateItems=function(b,c,d,e){"undefined"==typeof c&&(c=a.getTranslate(m.wrapper[0],"y")),"undefined"==typeof b&&(b=-Math.round((c-r)/o)),0>b&&(b=0),b>=m.items.length&&(b=m.items.length-1);var f=m.activeIndex;m.activeIndex=b,m.wrapper.find(".picker-selected").removeClass("picker-selected"),g.params.rotateEffect&&m.items.transition(d);var h=m.items.eq(b).addClass("picker-selected").transform("");if((e||"undefined"==typeof e)&&(m.value=h.attr("data-picker-value"),m.displayValue=m.displayValues?m.displayValues[b]:m.value,f!==b&&(m.onChange&&m.onChange(g,m.value,m.displayValue),g.updateValue())),g.params.rotateEffect){(c-(Math.floor((c-r)/o)*o+r))/o;m.items.each(function(){var b=a(this),d=b.index()*o,e=r-c,f=d-e,g=f/o,h=Math.ceil(m.height/o/2)+1,i=-18*g;i>180&&(i=180),-180>i&&(i=-180),Math.abs(g)>h?b.addClass("picker-item-far"):b.removeClass("picker-item-far"),b.transform("translate3d(0, "+(-c+r)+"px, "+(j?-110:0)+"px) rotateX("+i+"deg)")})}},c&&m.updateItems(0,r,0);var t,u,v,w,x,y,z,A,B,C,D,E,F=!0;m.initEvents=function(b){var c=b?"off":"on";m.container[c](a.touchEvents.start,e),m.container[c](a.touchEvents.move,f),m.container[c](a.touchEvents.end,h),m.items[c]("click",i)},m.destroyEvents=function(){m.initEvents(!0)},m.container[0].f7DestroyPickerCol=function(){m.destroyEvents()},m.initEvents()}},g.destroyPickerCol=function(b){b=a(b),"f7DestroyPickerCol"in b[0]&&b[0].f7DestroyPickerCol()},a(window).on("resize",c),g.columnHTML=function(a,b){var c="",d="";if(a.divider)d+='<div class="picker-items-col picker-items-col-divider '+(a.textAlign?"picker-items-col-"+a.textAlign:"")+" "+(a.cssClass||"")+'">'+a.content+"</div>";else{for(var e=0;e<a.values.length;e++)c+='<div class="picker-item" data-picker-value="'+a.values[e]+'">'+(a.displayValues?a.displayValues[e]:a.values[e])+"</div>";d+='<div class="picker-items-col '+(a.textAlign?"picker-items-col-"+a.textAlign:"")+" "+(a.cssClass||"")+'"><div class="picker-items-col-wrapper">'+c+"</div></div>"}return b?c:d},g.layout=function(){var a,b="",c="";g.cols=[];var d="";for(a=0;a<g.params.cols.length;a++){var e=g.params.cols[a];d+=g.columnHTML(g.params.cols[a]),g.cols.push(e)}c="picker-modal picker-columns "+(g.params.cssClass||"")+(g.params.rotateEffect?" picker-3d":""),b='<div class="'+c+'">'+(g.params.toolbar?g.params.toolbarTemplate.replace(/{{closeText}}/g,g.params.toolbarCloseText):"")+'<div class="picker-modal-inner picker-items">'+d+'<div class="picker-center-highlight"></div></div></div>',g.pickerHTML=b},g.params.input&&(g.input=a(g.params.input),g.input.length>0&&(g.params.inputReadOnly&&g.input.prop("readOnly",!0),g.inline||g.input.on("click",d))),g.inline||a("html").on("click",e),g.opened=!1,g.open=function(){g.opened||(g.layout(),g.inline?(g.container=a(g.pickerHTML),g.container.addClass("picker-modal-inline"),a(g.params.container).append(g.container),g.opened=!0):(g.container=a(a.pickerModal(g.pickerHTML)),a(g.container).one("opened",function(){g.opened=!0}).on("close",function(){f()})),g.container[0].f7Picker=g,g.container.find(".picker-items-col").each(function(){var a=!0;(!g.initialized&&g.params.value||g.initialized&&g.value)&&(a=!1),g.initPickerCol(this,a)}),g.initialized?g.value&&g.setValue(g.value,0):g.params.value&&g.setValue(g.params.value,0)),g.initialized=!0,g.params.onOpen&&g.params.onOpen(g)},g.close=function(){g.opened&&!g.inline&&a.closeModal(g.container)},g.destroy=function(){g.close(),g.params.input&&g.input.length>0&&g.input.off("click",d),a("html").off("click",e),a(window).off("resize",c)},g.inline&&g.open(),g};a(document).on("click",".close-picker",function(){var b=a(".picker-modal.modal-in");a.closeModal(b)}),a.fn.picker=function(c){var d=arguments;return this.each(function(){if(this){var e=a(this),f=e.data("picker");if(!f){var g=a.extend({input:this,value:e.val()?e.val().split(" "):""},c);f=new b(g),e.data("picker",f)}"string"==typeof c&&f[c].apply(f,Array.prototype.slice.call(d,1))}})}}(Zepto),+function(a){"use strict";var b=new Date,c=function(a){for(var b=[],c=1;(a||31)>=c;c++)b.push(10>c?"0"+c:c);return b},d=function(a,b){var d=new Date(b,parseInt(a)+1-1,1),e=new Date(d-1);return c(e.getDate())},e=function(a){return 10>a?"0"+a:a},f="01 02 03 04 05 06 07 08 09 10 11 12".split(" "),g=function(){for(var a=[],b=1950;2030>=b;b++)a.push(b);return a}(),h={rotateEffect:!1,value:[b.getFullYear(),e(b.getMonth()+1),e(b.getDate()),b.getHours(),e(b.getMinutes())],onChange:function(a,b,c){var e=d(a.cols[1].value,a.cols[0].value),f=a.cols[2].value;f>e.length&&(f=e.length),a.cols[2].setValue(f)},formatValue:function(a,b,c){return c[0]+"-"+b[1]+"-"+b[2]+" "+b[3]+":"+b[4]},cols:[{values:g},{values:f},{values:c()},{divider:!0,content:"  "},{values:function(){for(var a=[],b=0;23>=b;b++)a.push(b);return a}()},{divider:!0,content:":"},{values:function(){for(var a=[],b=0;59>=b;b++)a.push(10>b?"0"+b:b);return a}()}]};a.fn.datetimePicker=function(b){return this.each(function(){if(this){var c=a.extend(h,b);a(this).picker(c),b.value&&a(this).val(c.formatValue(c,c.value,c.value))}})}}(Zepto),+function(a){"use strict";function b(a,b){this.wrapper="string"==typeof a?document.querySelector(a):a,this.scroller=$(this.wrapper).find(".content-inner")[0],this.scrollerStyle=this.scroller&&this.scroller.style,this.options={resizeScrollbars:!0,mouseWheelSpeed:20,snapThreshold:.334,startX:0,startY:0,scrollY:!0,directionLockThreshold:5,momentum:!0,bounce:!0,bounceTime:600,bounceEasing:"",preventDefault:!0,preventDefaultException:{tagName:/^(INPUT|TEXTAREA|BUTTON|SELECT)$/},HWCompositing:!0,useTransition:!0,useTransform:!0,eventPassthrough:void 0};for(var c in b)this.options[c]=b[c];this.translateZ=this.options.HWCompositing&&f.hasPerspective?" translateZ(0)":"",this.options.useTransition=f.hasTransition&&this.options.useTransition,this.options.useTransform=f.hasTransform&&this.options.useTransform,this.options.eventPassthrough=this.options.eventPassthrough===!0?"vertical":this.options.eventPassthrough,this.options.preventDefault=!this.options.eventPassthrough&&this.options.preventDefault,this.options.scrollY="vertical"===this.options.eventPassthrough?!1:this.options.scrollY,this.options.scrollX="horizontal"===this.options.eventPassthrough?!1:this.options.scrollX,this.options.freeScroll=this.options.freeScroll&&!this.options.eventPassthrough,this.options.directionLockThreshold=this.options.eventPassthrough?0:this.options.directionLockThreshold,this.options.bounceEasing="string"==typeof this.options.bounceEasing?f.ease[this.options.bounceEasing]||f.ease.circular:this.options.bounceEasing,this.options.resizePolling=void 0===this.options.resizePolling?60:this.options.resizePolling,this.options.tap===!0&&(this.options.tap="tap"),"scale"===this.options.shrinkScrollbars&&(this.options.useTransition=!1),this.options.invertWheelDirection=this.options.invertWheelDirection?-1:1,3===this.options.probeType&&(this.options.useTransition=!1),this.x=0,this.y=0,this.directionX=0,this.directionY=0,this._events={},this._init(),this.refresh(),this.scrollTo(this.options.startX,this.options.startY),this.enable()}function c(a,b,c){var d=document.createElement("div"),e=document.createElement("div");return c===!0&&(d.style.cssText="position:absolute;z-index:9999",e.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px"),e.className="iScrollIndicator","h"===a?(c===!0&&(d.style.cssText+=";height:5px;left:2px;right:2px;bottom:0",e.style.height="100%"),d.className="iScrollHorizontalScrollbar"):(c===!0&&(d.style.cssText+=";width:5px;bottom:2px;top:2px;right:1px",e.style.width="100%"),d.className="iScrollVerticalScrollbar"),d.style.cssText+=";overflow:hidden",b||(d.style.pointerEvents="none"),d.appendChild(e),d}function d(b,c){this.wrapper="string"==typeof c.el?document.querySelector(c.el):c.el,this.wrapperStyle=this.wrapper.style,this.indicator=this.wrapper.children[0],this.indicatorStyle=this.indicator.style,this.scroller=b,this.options={listenX:!0,listenY:!0,interactive:!1,resize:!0,defaultScrollbars:!1,shrink:!1,fade:!1,speedRatioX:0,speedRatioY:0};for(var d in c)this.options[d]=c[d];this.sizeRatioX=1,this.sizeRatioY=1,this.maxPosX=0,this.maxPosY=0,this.options.interactive&&(this.options.disableTouch||(f.addEvent(this.indicator,"touchstart",this),f.addEvent(a,"touchend",this)),this.options.disablePointer||(f.addEvent(this.indicator,f.prefixPointerEvent("pointerdown"),this),f.addEvent(a,f.prefixPointerEvent("pointerup"),this)),this.options.disableMouse||(f.addEvent(this.indicator,"mousedown",this),f.addEvent(a,"mouseup",this))),this.options.fade&&(this.wrapperStyle[f.style.transform]=this.scroller.translateZ,this.wrapperStyle[f.style.transitionDuration]=f.isBadAndroid?"0.001s":"0ms",this.wrapperStyle.opacity="0")}var e=a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame||a.oRequestAnimationFrame||a.msRequestAnimationFrame||function(b){a.setTimeout(b,1e3/60)},f=function(){function b(a){return f===!1?!1:""===f?a:f+a.charAt(0).toUpperCase()+a.substr(1)}var c={},d=document.createElement("div").style,f=function(){for(var a,b=["t","webkitT","MozT","msT","OT"],c=0,e=b.length;e>c;c++)if(a=b[c]+"ransform",a in d)return b[c].substr(0,b[c].length-1);return!1}();c.getTime=Date.now||function(){return(new Date).getTime()},c.extend=function(a,b){for(var c in b)a[c]=b[c]},c.addEvent=function(a,b,c,d){a.addEventListener(b,c,!!d)},c.removeEvent=function(a,b,c,d){a.removeEventListener(b,c,!!d)},c.prefixPointerEvent=function(b){return a.MSPointerEvent?"MSPointer"+b.charAt(9).toUpperCase()+b.substr(10):b},c.momentum=function(a,b,c,d,f,g,h){function i(){+new Date-o>50&&(h._execEvent("scroll"),o=+new Date),+new Date-n<k&&e(i)}var j,k,l=a-b,m=Math.abs(l)/c;m/=2,m=m>1.5?1.5:m,g=void 0===g?6e-4:g,j=a+m*m/(2*g)*(0>l?-1:1),k=m/g,d>j?(j=f?d-f/2.5*(m/8):d,l=Math.abs(j-a),k=l/m):j>0&&(j=f?f/2.5*(m/8):0,l=Math.abs(a)+j,k=l/m);var n=+new Date,o=n;return e(i),{destination:Math.round(j),duration:k}};var g=b("transform");return c.extend(c,{hasTransform:g!==!1,hasPerspective:b("perspective")in d,hasTouch:"ontouchstart"in a,hasPointer:a.PointerEvent||a.MSPointerEvent,hasTransition:b("transition")in d}),c.isBadAndroid=/Android /.test(a.navigator.appVersion)&&!/Chrome\/\d/.test(a.navigator.appVersion)&&!1,c.extend(c.style={},{transform:g,transitionTimingFunction:b("transitionTimingFunction"),transitionDuration:b("transitionDuration"),transitionDelay:b("transitionDelay"),transformOrigin:b("transformOrigin")}),c.hasClass=function(a,b){var c=new RegExp("(^|\\s)"+b+"(\\s|$)");return c.test(a.className)},c.addClass=function(a,b){if(!c.hasClass(a,b)){var d=a.className.split(" ");d.push(b),a.className=d.join(" ")}},c.removeClass=function(a,b){if(c.hasClass(a,b)){var d=new RegExp("(^|\\s)"+b+"(\\s|$)","g");a.className=a.className.replace(d," ")}},c.offset=function(a){for(var b=-a.offsetLeft,c=-a.offsetTop;a=a.offsetParent;)b-=a.offsetLeft,c-=a.offsetTop;return{left:b,top:c}},c.preventDefaultException=function(a,b){for(var c in b)if(b[c].test(a[c]))return!0;return!1},c.extend(c.eventType={},{touchstart:1,touchmove:1,touchend:1,mousedown:2,mousemove:2,mouseup:2,pointerdown:3,pointermove:3,pointerup:3,MSPointerDown:3,MSPointerMove:3,MSPointerUp:3}),c.extend(c.ease={},{quadratic:{style:"cubic-bezier(0.25, 0.46, 0.45, 0.94)",fn:function(a){return a*(2-a)}},circular:{style:"cubic-bezier(0.1, 0.57, 0.1, 1)",fn:function(a){return Math.sqrt(1- --a*a)}},back:{style:"cubic-bezier(0.175, 0.885, 0.32, 1.275)",fn:function(a){var b=4;return(a-=1)*a*((b+1)*a+b)+1}},bounce:{style:"",fn:function(a){return(a/=1)<1/2.75?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375}},elastic:{style:"",fn:function(a){var b=.22,c=.4;return 0===a?0:1===a?1:c*Math.pow(2,-10*a)*Math.sin((a-b/4)*(2*Math.PI)/b)+1}}}),c.tap=function(a,b){var c=document.createEvent("Event");c.initEvent(b,!0,!0),c.pageX=a.pageX,c.pageY=a.pageY,a.target.dispatchEvent(c)},c.click=function(a){var b,c=a.target;/(SELECT|INPUT|TEXTAREA)/i.test(c.tagName)||(b=document.createEvent("MouseEvents"),b.initMouseEvent("click",!0,!0,a.view,1,c.screenX,c.screenY,c.clientX,c.clientY,a.ctrlKey,a.altKey,a.shiftKey,a.metaKey,0,null),b._constructed=!0,c.dispatchEvent(b))},c}();b.prototype={version:"5.1.3",_init:function(){this._initEvents(),(this.options.scrollbars||this.options.indicators)&&this._initIndicators(),this.options.mouseWheel&&this._initWheel(),this.options.snap&&this._initSnap(),this.options.keyBindings&&this._initKeys()},destroy:function(){this._initEvents(!0),this._execEvent("destroy")},_transitionEnd:function(a){a.target===this.scroller&&this.isInTransition&&(this._transitionTime(),this.resetPosition(this.options.bounceTime)||(this.isInTransition=!1,this._execEvent("scrollEnd")))},_start:function(a){if((1===f.eventType[a.type]||0===a.button)&&this.enabled&&(!this.initiated||f.eventType[a.type]===this.initiated)){!this.options.preventDefault||f.isBadAndroid||f.preventDefaultException(a.target,this.options.preventDefaultException)||a.preventDefault();var b,c=a.touches?a.touches[0]:a;this.initiated=f.eventType[a.type],this.moved=!1,this.distX=0,this.distY=0,this.directionX=0,this.directionY=0,this.directionLocked=0,this._transitionTime(),this.startTime=f.getTime(),this.options.useTransition&&this.isInTransition?(this.isInTransition=!1,b=this.getComputedPosition(),this._translate(Math.round(b.x),Math.round(b.y)),this._execEvent("scrollEnd")):!this.options.useTransition&&this.isAnimating&&(this.isAnimating=!1,this._execEvent("scrollEnd")),this.startX=this.x,this.startY=this.y,this.absStartX=this.x,this.absStartY=this.y,this.pointX=c.pageX,this.pointY=c.pageY,this._execEvent("beforeScrollStart")}},_move:function(a){if(this.enabled&&f.eventType[a.type]===this.initiated){this.options.preventDefault&&a.preventDefault();var b,c,d,e,g=a.touches?a.touches[0]:a,h=g.pageX-this.pointX,i=g.pageY-this.pointY,j=f.getTime();if(this.pointX=g.pageX,this.pointY=g.pageY,this.distX+=h,this.distY+=i,d=Math.abs(this.distX),e=Math.abs(this.distY),!(j-this.endTime>300&&10>d&&10>e)){if(this.directionLocked||this.options.freeScroll||(d>e+this.options.directionLockThreshold?this.directionLocked="h":e>=d+this.options.directionLockThreshold?this.directionLocked="v":this.directionLocked="n"),"h"===this.directionLocked){if("vertical"===this.options.eventPassthrough)a.preventDefault();else if("horizontal"===this.options.eventPassthrough)return void(this.initiated=!1);i=0}else if("v"===this.directionLocked){if("horizontal"===this.options.eventPassthrough)a.preventDefault();else if("vertical"===this.options.eventPassthrough)return void(this.initiated=!1);h=0}h=this.hasHorizontalScroll?h:0,i=this.hasVerticalScroll?i:0,b=this.x+h,c=this.y+i,(b>0||b<this.maxScrollX)&&(b=this.options.bounce?this.x+h/3:b>0?0:this.maxScrollX),(c>0||c<this.maxScrollY)&&(c=this.options.bounce?this.y+i/3:c>0?0:this.maxScrollY),this.directionX=h>0?-1:0>h?1:0,this.directionY=i>0?-1:0>i?1:0,this.moved||this._execEvent("scrollStart"),this.moved=!0,this._translate(b,c),j-this.startTime>300&&(this.startTime=j,this.startX=this.x,this.startY=this.y,1===this.options.probeType&&this._execEvent("scroll")),this.options.probeType>1&&this._execEvent("scroll")}}},_end:function(a){if(this.enabled&&f.eventType[a.type]===this.initiated){this.options.preventDefault&&!f.preventDefaultException(a.target,this.options.preventDefaultException)&&a.preventDefault();var b,c,d=f.getTime()-this.startTime,e=Math.round(this.x),g=Math.round(this.y),h=Math.abs(e-this.startX),i=Math.abs(g-this.startY),j=0,k="";if(this.isInTransition=0,this.initiated=0,this.endTime=f.getTime(),!this.resetPosition(this.options.bounceTime)){if(this.scrollTo(e,g),!this.moved)return this.options.tap&&f.tap(a,this.options.tap),this.options.click&&f.click(a),void this._execEvent("scrollCancel");if(this._events.flick&&200>d&&100>h&&100>i)return void this._execEvent("flick");if(this.options.momentum&&300>d&&(b=this.hasHorizontalScroll?f.momentum(this.x,this.startX,d,this.maxScrollX,this.options.bounce?this.wrapperWidth:0,this.options.deceleration,this):{destination:e,duration:0},c=this.hasVerticalScroll?f.momentum(this.y,this.startY,d,this.maxScrollY,this.options.bounce?this.wrapperHeight:0,this.options.deceleration,this):{destination:g,duration:0},e=b.destination,g=c.destination,j=Math.max(b.duration,c.duration),this.isInTransition=1),this.options.snap){var l=this._nearestSnap(e,g);this.currentPage=l,j=this.options.snapSpeed||Math.max(Math.max(Math.min(Math.abs(e-l.x),1e3),Math.min(Math.abs(g-l.y),1e3)),300),e=l.x,g=l.y,this.directionX=0,this.directionY=0,k=this.options.bounceEasing}return e!==this.x||g!==this.y?((e>0||e<this.maxScrollX||g>0||g<this.maxScrollY)&&(k=f.ease.quadratic),void this.scrollTo(e,g,j,k)):void this._execEvent("scrollEnd")}}},_resize:function(){var a=this;clearTimeout(this.resizeTimeout),this.resizeTimeout=setTimeout(function(){a.refresh()},this.options.resizePolling)},resetPosition:function(b){var c=this.x,d=this.y;if(b=b||0,!this.hasHorizontalScroll||this.x>0?c=0:this.x<this.maxScrollX&&(c=this.maxScrollX),!this.hasVerticalScroll||this.y>0?d=0:this.y<this.maxScrollY&&(d=this.maxScrollY),c===this.x&&d===this.y)return!1;if(this.options.ptr&&this.y>44&&-1*this.startY<$(a).height()&&!this.ptrLock){d=this.options.ptrOffset||44,this._execEvent("ptr"),this.ptrLock=!0;var e=this;setTimeout(function(){e.ptrLock=!1},500)}return this.scrollTo(c,d,b,this.options.bounceEasing),!0},disable:function(){this.enabled=!1},enable:function(){this.enabled=!0},refresh:function(){this.wrapperWidth=this.wrapper.clientWidth,this.wrapperHeight=this.wrapper.clientHeight,this.scrollerWidth=this.scroller.offsetWidth,this.scrollerHeight=this.scroller.offsetHeight,this.maxScrollX=this.wrapperWidth-this.scrollerWidth,this.maxScrollY=this.wrapperHeight-this.scrollerHeight,this.hasHorizontalScroll=this.options.scrollX&&this.maxScrollX<0,this.hasVerticalScroll=this.options.scrollY&&this.maxScrollY<0,this.hasHorizontalScroll||(this.maxScrollX=0,this.scrollerWidth=this.wrapperWidth),this.hasVerticalScroll||(this.maxScrollY=0,this.scrollerHeight=this.wrapperHeight),this.endTime=0,this.directionX=0,this.directionY=0,this.wrapperOffset=f.offset(this.wrapper),this._execEvent("refresh"),this.resetPosition()},on:function(a,b){this._events[a]||(this._events[a]=[]),this._events[a].push(b)},off:function(a,b){if(this._events[a]){var c=this._events[a].indexOf(b);c>-1&&this._events[a].splice(c,1)}},_execEvent:function(a){if(this._events[a]){var b=0,c=this._events[a].length;if(c)for(;c>b;b++)this._events[a][b].apply(this,[].slice.call(arguments,1))}},scrollBy:function(a,b,c,d){a=this.x+a,b=this.y+b,c=c||0,this.scrollTo(a,b,c,d)},scrollTo:function(a,b,c,d){d=d||f.ease.circular,this.isInTransition=this.options.useTransition&&c>0,!c||this.options.useTransition&&d.style?(this._transitionTimingFunction(d.style),this._transitionTime(c),this._translate(a,b)):this._animate(a,b,c,d.fn)},scrollToElement:function(a,b,c,d,e){if(a=a.nodeType?a:this.scroller.querySelector(a)){var g=f.offset(a);g.left-=this.wrapperOffset.left,g.top-=this.wrapperOffset.top,c===!0&&(c=Math.round(a.offsetWidth/2-this.wrapper.offsetWidth/2)),d===!0&&(d=Math.round(a.offsetHeight/2-this.wrapper.offsetHeight/2)),g.left-=c||0,g.top-=d||0,g.left=g.left>0?0:g.left<this.maxScrollX?this.maxScrollX:g.left,g.top=g.top>0?0:g.top<this.maxScrollY?this.maxScrollY:g.top,b=void 0===b||null===b||"auto"===b?Math.max(Math.abs(this.x-g.left),Math.abs(this.y-g.top)):b,this.scrollTo(g.left,g.top,b,e)}},_transitionTime:function(a){if(a=a||0,this.scrollerStyle[f.style.transitionDuration]=a+"ms",!a&&f.isBadAndroid&&(this.scrollerStyle[f.style.transitionDuration]="0.001s"),
this.indicators)for(var b=this.indicators.length;b--;)this.indicators[b].transitionTime(a)},_transitionTimingFunction:function(a){if(this.scrollerStyle[f.style.transitionTimingFunction]=a,this.indicators)for(var b=this.indicators.length;b--;)this.indicators[b].transitionTimingFunction(a)},_translate:function(a,b){if(this.options.useTransform?this.scrollerStyle[f.style.transform]="translate("+a+"px,"+b+"px)"+this.translateZ:(a=Math.round(a),b=Math.round(b),this.scrollerStyle.left=a+"px",this.scrollerStyle.top=b+"px"),this.x=a,this.y=b,this.indicators)for(var c=this.indicators.length;c--;)this.indicators[c].updatePosition()},_initEvents:function(b){var c=b?f.removeEvent:f.addEvent,d=this.options.bindToWrapper?this.wrapper:a;c(a,"orientationchange",this),c(a,"resize",this),this.options.click&&c(this.wrapper,"click",this,!0),this.options.disableMouse||(c(this.wrapper,"mousedown",this),c(d,"mousemove",this),c(d,"mousecancel",this),c(d,"mouseup",this)),f.hasPointer&&!this.options.disablePointer&&(c(this.wrapper,f.prefixPointerEvent("pointerdown"),this),c(d,f.prefixPointerEvent("pointermove"),this),c(d,f.prefixPointerEvent("pointercancel"),this),c(d,f.prefixPointerEvent("pointerup"),this)),f.hasTouch&&!this.options.disableTouch&&(c(this.wrapper,"touchstart",this),c(d,"touchmove",this),c(d,"touchcancel",this),c(d,"touchend",this)),c(this.scroller,"transitionend",this),c(this.scroller,"webkitTransitionEnd",this),c(this.scroller,"oTransitionEnd",this),c(this.scroller,"MSTransitionEnd",this)},getComputedPosition:function(){var b,c,d=a.getComputedStyle(this.scroller,null);return this.options.useTransform?(d=d[f.style.transform].split(")")[0].split(", "),b=+(d[12]||d[4]),c=+(d[13]||d[5])):(b=+d.left.replace(/[^-\d.]/g,""),c=+d.top.replace(/[^-\d.]/g,"")),{x:b,y:c}},_initIndicators:function(){function a(a){for(var b=h.indicators.length;b--;)a.call(h.indicators[b])}var b,e=this.options.interactiveScrollbars,f="string"!=typeof this.options.scrollbars,g=[],h=this;this.indicators=[],this.options.scrollbars&&(this.options.scrollY&&(b={el:c("v",e,this.options.scrollbars),interactive:e,defaultScrollbars:!0,customStyle:f,resize:this.options.resizeScrollbars,shrink:this.options.shrinkScrollbars,fade:this.options.fadeScrollbars,listenX:!1},this.wrapper.appendChild(b.el),g.push(b)),this.options.scrollX&&(b={el:c("h",e,this.options.scrollbars),interactive:e,defaultScrollbars:!0,customStyle:f,resize:this.options.resizeScrollbars,shrink:this.options.shrinkScrollbars,fade:this.options.fadeScrollbars,listenY:!1},this.wrapper.appendChild(b.el),g.push(b))),this.options.indicators&&(g=g.concat(this.options.indicators));for(var i=g.length;i--;)this.indicators.push(new d(this,g[i]));this.options.fadeScrollbars&&(this.on("scrollEnd",function(){a(function(){this.fade()})}),this.on("scrollCancel",function(){a(function(){this.fade()})}),this.on("scrollStart",function(){a(function(){this.fade(1)})}),this.on("beforeScrollStart",function(){a(function(){this.fade(1,!0)})})),this.on("refresh",function(){a(function(){this.refresh()})}),this.on("destroy",function(){a(function(){this.destroy()}),delete this.indicators})},_initWheel:function(){f.addEvent(this.wrapper,"wheel",this),f.addEvent(this.wrapper,"mousewheel",this),f.addEvent(this.wrapper,"DOMMouseScroll",this),this.on("destroy",function(){f.removeEvent(this.wrapper,"wheel",this),f.removeEvent(this.wrapper,"mousewheel",this),f.removeEvent(this.wrapper,"DOMMouseScroll",this)})},_wheel:function(a){if(this.enabled){a.preventDefault(),a.stopPropagation();var b,c,d,e,f=this;if(void 0===this.wheelTimeout&&f._execEvent("scrollStart"),clearTimeout(this.wheelTimeout),this.wheelTimeout=setTimeout(function(){f._execEvent("scrollEnd"),f.wheelTimeout=void 0},400),"deltaX"in a)1===a.deltaMode?(b=-a.deltaX*this.options.mouseWheelSpeed,c=-a.deltaY*this.options.mouseWheelSpeed):(b=-a.deltaX,c=-a.deltaY);else if("wheelDeltaX"in a)b=a.wheelDeltaX/120*this.options.mouseWheelSpeed,c=a.wheelDeltaY/120*this.options.mouseWheelSpeed;else if("wheelDelta"in a)b=c=a.wheelDelta/120*this.options.mouseWheelSpeed;else{if(!("detail"in a))return;b=c=-a.detail/3*this.options.mouseWheelSpeed}if(b*=this.options.invertWheelDirection,c*=this.options.invertWheelDirection,this.hasVerticalScroll||(b=c,c=0),this.options.snap)return d=this.currentPage.pageX,e=this.currentPage.pageY,b>0?d--:0>b&&d++,c>0?e--:0>c&&e++,void this.goToPage(d,e);d=this.x+Math.round(this.hasHorizontalScroll?b:0),e=this.y+Math.round(this.hasVerticalScroll?c:0),d>0?d=0:d<this.maxScrollX&&(d=this.maxScrollX),e>0?e=0:e<this.maxScrollY&&(e=this.maxScrollY),this.scrollTo(d,e,0),this._execEvent("scroll")}},_initSnap:function(){this.currentPage={},"string"==typeof this.options.snap&&(this.options.snap=this.scroller.querySelectorAll(this.options.snap)),this.on("refresh",function(){var a,b,c,d,e,f,g=0,h=0,i=0,j=this.options.snapStepX||this.wrapperWidth,k=this.options.snapStepY||this.wrapperHeight;if(this.pages=[],this.wrapperWidth&&this.wrapperHeight&&this.scrollerWidth&&this.scrollerHeight){if(this.options.snap===!0)for(c=Math.round(j/2),d=Math.round(k/2);i>-this.scrollerWidth;){for(this.pages[g]=[],a=0,e=0;e>-this.scrollerHeight;)this.pages[g][a]={x:Math.max(i,this.maxScrollX),y:Math.max(e,this.maxScrollY),width:j,height:k,cx:i-c,cy:e-d},e-=k,a++;i-=j,g++}else for(f=this.options.snap,a=f.length,b=-1;a>g;g++)(0===g||f[g].offsetLeft<=f[g-1].offsetLeft)&&(h=0,b++),this.pages[h]||(this.pages[h]=[]),i=Math.max(-f[g].offsetLeft,this.maxScrollX),e=Math.max(-f[g].offsetTop,this.maxScrollY),c=i-Math.round(f[g].offsetWidth/2),d=e-Math.round(f[g].offsetHeight/2),this.pages[h][b]={x:i,y:e,width:f[g].offsetWidth,height:f[g].offsetHeight,cx:c,cy:d},i>this.maxScrollX&&h++;this.goToPage(this.currentPage.pageX||0,this.currentPage.pageY||0,0),this.options.snapThreshold%1===0?(this.snapThresholdX=this.options.snapThreshold,this.snapThresholdY=this.options.snapThreshold):(this.snapThresholdX=Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width*this.options.snapThreshold),this.snapThresholdY=Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height*this.options.snapThreshold))}}),this.on("flick",function(){var a=this.options.snapSpeed||Math.max(Math.max(Math.min(Math.abs(this.x-this.startX),1e3),Math.min(Math.abs(this.y-this.startY),1e3)),300);this.goToPage(this.currentPage.pageX+this.directionX,this.currentPage.pageY+this.directionY,a)})},_nearestSnap:function(a,b){if(!this.pages.length)return{x:0,y:0,pageX:0,pageY:0};var c=0,d=this.pages.length,e=0;if(Math.abs(a-this.absStartX)<this.snapThresholdX&&Math.abs(b-this.absStartY)<this.snapThresholdY)return this.currentPage;for(a>0?a=0:a<this.maxScrollX&&(a=this.maxScrollX),b>0?b=0:b<this.maxScrollY&&(b=this.maxScrollY);d>c;c++)if(a>=this.pages[c][0].cx){a=this.pages[c][0].x;break}for(d=this.pages[c].length;d>e;e++)if(b>=this.pages[0][e].cy){b=this.pages[0][e].y;break}return c===this.currentPage.pageX&&(c+=this.directionX,0>c?c=0:c>=this.pages.length&&(c=this.pages.length-1),a=this.pages[c][0].x),e===this.currentPage.pageY&&(e+=this.directionY,0>e?e=0:e>=this.pages[0].length&&(e=this.pages[0].length-1),b=this.pages[0][e].y),{x:a,y:b,pageX:c,pageY:e}},goToPage:function(a,b,c,d){d=d||this.options.bounceEasing,a>=this.pages.length?a=this.pages.length-1:0>a&&(a=0),b>=this.pages[a].length?b=this.pages[a].length-1:0>b&&(b=0);var e=this.pages[a][b].x,f=this.pages[a][b].y;c=void 0===c?this.options.snapSpeed||Math.max(Math.max(Math.min(Math.abs(e-this.x),1e3),Math.min(Math.abs(f-this.y),1e3)),300):c,this.currentPage={x:e,y:f,pageX:a,pageY:b},this.scrollTo(e,f,c,d)},next:function(a,b){var c=this.currentPage.pageX,d=this.currentPage.pageY;c++,c>=this.pages.length&&this.hasVerticalScroll&&(c=0,d++),this.goToPage(c,d,a,b)},prev:function(a,b){var c=this.currentPage.pageX,d=this.currentPage.pageY;c--,0>c&&this.hasVerticalScroll&&(c=0,d--),this.goToPage(c,d,a,b)},_initKeys:function(){var b,c={pageUp:33,pageDown:34,end:35,home:36,left:37,up:38,right:39,down:40};if("object"==typeof this.options.keyBindings)for(b in this.options.keyBindings)"string"==typeof this.options.keyBindings[b]&&(this.options.keyBindings[b]=this.options.keyBindings[b].toUpperCase().charCodeAt(0));else this.options.keyBindings={};for(b in c)this.options.keyBindings[b]=this.options.keyBindings[b]||c[b];f.addEvent(a,"keydown",this),this.on("destroy",function(){f.removeEvent(a,"keydown",this)})},_key:function(a){if(this.enabled){var b,c=this.options.snap,d=c?this.currentPage.pageX:this.x,e=c?this.currentPage.pageY:this.y,g=f.getTime(),h=this.keyTime||0,i=.25;switch(this.options.useTransition&&this.isInTransition&&(b=this.getComputedPosition(),this._translate(Math.round(b.x),Math.round(b.y)),this.isInTransition=!1),this.keyAcceleration=200>g-h?Math.min(this.keyAcceleration+i,50):0,a.keyCode){case this.options.keyBindings.pageUp:this.hasHorizontalScroll&&!this.hasVerticalScroll?d+=c?1:this.wrapperWidth:e+=c?1:this.wrapperHeight;break;case this.options.keyBindings.pageDown:this.hasHorizontalScroll&&!this.hasVerticalScroll?d-=c?1:this.wrapperWidth:e-=c?1:this.wrapperHeight;break;case this.options.keyBindings.end:d=c?this.pages.length-1:this.maxScrollX,e=c?this.pages[0].length-1:this.maxScrollY;break;case this.options.keyBindings.home:d=0,e=0;break;case this.options.keyBindings.left:d+=c?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.up:e+=c?1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.right:d-=c?-1:5+this.keyAcceleration>>0;break;case this.options.keyBindings.down:e-=c?1:5+this.keyAcceleration>>0;break;default:return}if(c)return void this.goToPage(d,e);d>0?(d=0,this.keyAcceleration=0):d<this.maxScrollX&&(d=this.maxScrollX,this.keyAcceleration=0),e>0?(e=0,this.keyAcceleration=0):e<this.maxScrollY&&(e=this.maxScrollY,this.keyAcceleration=0),this.scrollTo(d,e,0),this.keyTime=g}},_animate:function(a,b,c,d){function g(){var m,n,o,p=f.getTime();return p>=l?(h.isAnimating=!1,h._translate(a,b),void(h.resetPosition(h.options.bounceTime)||h._execEvent("scrollEnd"))):(p=(p-k)/c,o=d(p),m=(a-i)*o+i,n=(b-j)*o+j,h._translate(m,n),h.isAnimating&&e(g),void(3===h.options.probeType&&h._execEvent("scroll")))}var h=this,i=this.x,j=this.y,k=f.getTime(),l=k+c;this.isAnimating=!0,g()},handleEvent:function(a){switch(a.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(a);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(a);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(a);break;case"orientationchange":case"resize":this._resize();break;case"transitionend":case"webkitTransitionEnd":case"oTransitionEnd":case"MSTransitionEnd":this._transitionEnd(a);break;case"wheel":case"DOMMouseScroll":case"mousewheel":this._wheel(a);break;case"keydown":this._key(a);break;case"click":a._constructed||(a.preventDefault(),a.stopPropagation())}}},d.prototype={handleEvent:function(a){switch(a.type){case"touchstart":case"pointerdown":case"MSPointerDown":case"mousedown":this._start(a);break;case"touchmove":case"pointermove":case"MSPointerMove":case"mousemove":this._move(a);break;case"touchend":case"pointerup":case"MSPointerUp":case"mouseup":case"touchcancel":case"pointercancel":case"MSPointerCancel":case"mousecancel":this._end(a)}},destroy:function(){this.options.interactive&&(f.removeEvent(this.indicator,"touchstart",this),f.removeEvent(this.indicator,f.prefixPointerEvent("pointerdown"),this),f.removeEvent(this.indicator,"mousedown",this),f.removeEvent(a,"touchmove",this),f.removeEvent(a,f.prefixPointerEvent("pointermove"),this),f.removeEvent(a,"mousemove",this),f.removeEvent(a,"touchend",this),f.removeEvent(a,f.prefixPointerEvent("pointerup"),this),f.removeEvent(a,"mouseup",this)),this.options.defaultScrollbars&&this.wrapper.parentNode.removeChild(this.wrapper)},_start:function(b){var c=b.touches?b.touches[0]:b;b.preventDefault(),b.stopPropagation(),this.transitionTime(),this.initiated=!0,this.moved=!1,this.lastPointX=c.pageX,this.lastPointY=c.pageY,this.startTime=f.getTime(),this.options.disableTouch||f.addEvent(a,"touchmove",this),this.options.disablePointer||f.addEvent(a,f.prefixPointerEvent("pointermove"),this),this.options.disableMouse||f.addEvent(a,"mousemove",this),this.scroller._execEvent("beforeScrollStart")},_move:function(a){var b,c,d,e,g=a.touches?a.touches[0]:a,h=f.getTime();this.moved||this.scroller._execEvent("scrollStart"),this.moved=!0,b=g.pageX-this.lastPointX,this.lastPointX=g.pageX,c=g.pageY-this.lastPointY,this.lastPointY=g.pageY,d=this.x+b,e=this.y+c,this._pos(d,e),1===this.scroller.options.probeType&&h-this.startTime>300?(this.startTime=h,this.scroller._execEvent("scroll")):this.scroller.options.probeType>1&&this.scroller._execEvent("scroll"),a.preventDefault(),a.stopPropagation()},_end:function(b){if(this.initiated){if(this.initiated=!1,b.preventDefault(),b.stopPropagation(),f.removeEvent(a,"touchmove",this),f.removeEvent(a,f.prefixPointerEvent("pointermove"),this),f.removeEvent(a,"mousemove",this),this.scroller.options.snap){var c=this.scroller._nearestSnap(this.scroller.x,this.scroller.y),d=this.options.snapSpeed||Math.max(Math.max(Math.min(Math.abs(this.scroller.x-c.x),1e3),Math.min(Math.abs(this.scroller.y-c.y),1e3)),300);(this.scroller.x!==c.x||this.scroller.y!==c.y)&&(this.scroller.directionX=0,this.scroller.directionY=0,this.scroller.currentPage=c,this.scroller.scrollTo(c.x,c.y,d,this.scroller.options.bounceEasing))}this.moved&&this.scroller._execEvent("scrollEnd")}},transitionTime:function(a){a=a||0,this.indicatorStyle[f.style.transitionDuration]=a+"ms",!a&&f.isBadAndroid&&(this.indicatorStyle[f.style.transitionDuration]="0.001s")},transitionTimingFunction:function(a){this.indicatorStyle[f.style.transitionTimingFunction]=a},refresh:function(){this.transitionTime(),this.options.listenX&&!this.options.listenY?this.indicatorStyle.display=this.scroller.hasHorizontalScroll?"block":"none":this.options.listenY&&!this.options.listenX?this.indicatorStyle.display=this.scroller.hasVerticalScroll?"block":"none":this.indicatorStyle.display=this.scroller.hasHorizontalScroll||this.scroller.hasVerticalScroll?"block":"none",this.scroller.hasHorizontalScroll&&this.scroller.hasVerticalScroll?(f.addClass(this.wrapper,"iScrollBothScrollbars"),f.removeClass(this.wrapper,"iScrollLoneScrollbar"),this.options.defaultScrollbars&&this.options.customStyle&&(this.options.listenX?this.wrapper.style.right="8px":this.wrapper.style.bottom="8px")):(f.removeClass(this.wrapper,"iScrollBothScrollbars"),f.addClass(this.wrapper,"iScrollLoneScrollbar"),this.options.defaultScrollbars&&this.options.customStyle&&(this.options.listenX?this.wrapper.style.right="2px":this.wrapper.style.bottom="2px")),this.options.listenX&&(this.wrapperWidth=this.wrapper.clientWidth,this.options.resize?(this.indicatorWidth=Math.max(Math.round(this.wrapperWidth*this.wrapperWidth/(this.scroller.scrollerWidth||this.wrapperWidth||1)),8),this.indicatorStyle.width=this.indicatorWidth+"px"):this.indicatorWidth=this.indicator.clientWidth,this.maxPosX=this.wrapperWidth-this.indicatorWidth,"clip"===this.options.shrink?(this.minBoundaryX=-this.indicatorWidth+8,this.maxBoundaryX=this.wrapperWidth-8):(this.minBoundaryX=0,this.maxBoundaryX=this.maxPosX),this.sizeRatioX=this.options.speedRatioX||this.scroller.maxScrollX&&this.maxPosX/this.scroller.maxScrollX),this.options.listenY&&(this.wrapperHeight=this.wrapper.clientHeight,this.options.resize?(this.indicatorHeight=Math.max(Math.round(this.wrapperHeight*this.wrapperHeight/(this.scroller.scrollerHeight||this.wrapperHeight||1)),8),this.indicatorStyle.height=this.indicatorHeight+"px"):this.indicatorHeight=this.indicator.clientHeight,this.maxPosY=this.wrapperHeight-this.indicatorHeight,"clip"===this.options.shrink?(this.minBoundaryY=-this.indicatorHeight+8,this.maxBoundaryY=this.wrapperHeight-8):(this.minBoundaryY=0,this.maxBoundaryY=this.maxPosY),this.maxPosY=this.wrapperHeight-this.indicatorHeight,this.sizeRatioY=this.options.speedRatioY||this.scroller.maxScrollY&&this.maxPosY/this.scroller.maxScrollY),this.updatePosition()},updatePosition:function(){var a=this.options.listenX&&Math.round(this.sizeRatioX*this.scroller.x)||0,b=this.options.listenY&&Math.round(this.sizeRatioY*this.scroller.y)||0;this.options.ignoreBoundaries||(a<this.minBoundaryX?("scale"===this.options.shrink&&(this.width=Math.max(this.indicatorWidth+a,8),this.indicatorStyle.width=this.width+"px"),a=this.minBoundaryX):a>this.maxBoundaryX?"scale"===this.options.shrink?(this.width=Math.max(this.indicatorWidth-(a-this.maxPosX),8),this.indicatorStyle.width=this.width+"px",a=this.maxPosX+this.indicatorWidth-this.width):a=this.maxBoundaryX:"scale"===this.options.shrink&&this.width!==this.indicatorWidth&&(this.width=this.indicatorWidth,this.indicatorStyle.width=this.width+"px"),b<this.minBoundaryY?("scale"===this.options.shrink&&(this.height=Math.max(this.indicatorHeight+3*b,8),this.indicatorStyle.height=this.height+"px"),b=this.minBoundaryY):b>this.maxBoundaryY?"scale"===this.options.shrink?(this.height=Math.max(this.indicatorHeight-3*(b-this.maxPosY),8),this.indicatorStyle.height=this.height+"px",b=this.maxPosY+this.indicatorHeight-this.height):b=this.maxBoundaryY:"scale"===this.options.shrink&&this.height!==this.indicatorHeight&&(this.height=this.indicatorHeight,this.indicatorStyle.height=this.height+"px")),this.x=a,this.y=b,this.scroller.options.useTransform?this.indicatorStyle[f.style.transform]="translate("+a+"px,"+b+"px)"+this.scroller.translateZ:(this.indicatorStyle.left=a+"px",this.indicatorStyle.top=b+"px")},_pos:function(a,b){0>a?a=0:a>this.maxPosX&&(a=this.maxPosX),0>b?b=0:b>this.maxPosY&&(b=this.maxPosY),a=this.options.listenX?Math.round(a/this.sizeRatioX):this.scroller.x,b=this.options.listenY?Math.round(b/this.sizeRatioY):this.scroller.y,this.scroller.scrollTo(a,b)},fade:function(a,b){if(!b||this.visible){clearTimeout(this.fadeTimeout),this.fadeTimeout=null;var c=a?250:500,d=a?0:300;a=a?"1":"0",this.wrapperStyle[f.style.transitionDuration]=c+"ms",this.fadeTimeout=setTimeout(function(a){this.wrapperStyle.opacity=a,this.visible=+a}.bind(this,a),d)}}},b.utils=f,a.IScroll=b}(window),+function(a){"use strict";function b(b){var c=Array.apply(null,arguments);c.shift();var e;return this.each(function(){var f=a(this),g=a.extend({},f.dataset(),"object"==typeof b&&b),h=f.data("scroller");return h||f.data("scroller",h=new d(this,g)),"string"==typeof b&&"function"==typeof h[b]&&(e=h[b].apply(h,c),void 0!==e)?!1:void 0}),void 0!==e?e:this}var c={scrollTop:a.fn.scrollTop,scrollLeft:a.fn.scrollLeft};!function(){a.extend(a.fn,{scrollTop:function(a,b){if(this.length){var d=this.data("scroller");return d&&d.scroller?d.scrollTop(a,b):c.scrollTop.apply(this,arguments)}}}),a.extend(a.fn,{scrollLeft:function(a,b){if(this.length){var d=this.data("scroller");return d&&d.scroller?d.scrollLeft(a,b):c.scrollLeft.apply(this,arguments)}}})}();var d=function(b,c){var d=this.$pageContent=a(b);this.options=a.extend({},this._defaults,c);var e=this.options.type,f="js"===e||"auto"===e&&a.device.android&&a.compareVersion("4.4.0",a.device.osVersion)>-1||"auto"===e&&a.device.ios&&a.compareVersion("6.0.0",a.device.osVersion)>-1;if(f){var g=d.find(".content-inner");if(!g[0]){var h=d.children();h.length<1?d.children().wrapAll('<div class="content-inner"></div>'):d.html('<div class="content-inner">'+d.html()+"</div>")}if(d.hasClass("pull-to-refresh-content")){var i=a(window).height()+(d.prev().hasClass(".bar")?1:61);d.find(".content-inner").css("min-height",i+"px")}var j=a(b).hasClass("pull-to-refresh-content"),k=0===d.find(".fixed-tab").length,l={probeType:1,mouseWheel:!0,click:a.device.androidChrome,useTransform:k,scrollX:!0};j&&(l.ptr=!0,l.ptrOffset=44),this.scroller=new IScroll(b,l),this._bindEventToDomWhenJs(),a.initPullToRefresh=a._pullToRefreshJSScroll.initPullToRefresh,a.pullToRefreshDone=a._pullToRefreshJSScroll.pullToRefreshDone,a.pullToRefreshTrigger=a._pullToRefreshJSScroll.pullToRefreshTrigger,a.destroyToRefresh=a._pullToRefreshJSScroll.destroyToRefresh,d.addClass("javascript-scroll"),k||d.find(".content-inner").css({width:"100%",position:"absolute"});var m=this.$pageContent[0].scrollTop;m&&(this.$pageContent[0].scrollTop=0,this.scrollTop(m))}else d.addClass("native-scroll")};d.prototype={_defaults:{type:"native"},_bindEventToDomWhenJs:function(){if(this.scroller){var a=this;this.scroller.on("scrollStart",function(){a.$pageContent.trigger("scrollstart")}),this.scroller.on("scroll",function(){a.$pageContent.trigger("scroll")}),this.scroller.on("scrollEnd",function(){a.$pageContent.trigger("scrollend")})}},scrollTop:function(a,b){return this.scroller?void 0===a?-1*this.scroller.getComputedPosition().y:(this.scroller.scrollTo(0,-1*a,b),this):this.$pageContent.scrollTop(a,b)},scrollLeft:function(a,b){return this.scroller?void 0===a?-1*this.scroller.getComputedPosition().x:(this.scroller.scrollTo(-1*a,0),this):this.$pageContent.scrollTop(a,b)},on:function(a,b){return this.scroller?this.scroller.on(a,function(){b.call(this.wrapper)}):this.$pageContent.on(a,b),this},off:function(a,b){return this.scroller?this.scroller.off(a,b):this.$pageContent.off(a,b),this},refresh:function(){return this.scroller&&this.scroller.refresh(),this},scrollHeight:function(){return this.scroller?this.scroller.scrollerHeight:this.$pageContent[0].scrollHeight}};var e=a.fn.scroller;a.fn.scroller=b,a.fn.scroller.Constructor=d,a.fn.scroller.noConflict=function(){return a.fn.scroller=e,this},a(function(){a('[data-toggle="scroller"]').scroller()}),a.refreshScroller=function(b){b?a(b).scroller("refresh"):a(".javascript-scroll").each(function(){a(this).scroller("refresh")})},a.initScroller=function(b){this.options=a.extend({},"object"==typeof b&&b),a('[data-toggle="scroller"],.content').scroller(b)},a.getScroller=function(b){return b=b.hasClass("content")?b:b.parents(".content"),b?a(b).data("scroller"):a(".content.javascript-scroll").data("scroller")},a.detectScrollerType=function(b){return b?a(b).data("scroller")&&a(b).data("scroller").scroller?"js":"native":void 0}}(Zepto),+function(a){"use strict";var b=function(b,c,d){var e=a(b);if(2===arguments.length&&"boolean"==typeof c&&(d=c),0===e.length)return!1;if(e.hasClass("active"))return d&&e.trigger("show"),!1;var f=e.parent(".tabs");if(0===f.length)return!1;var g=f.children(".tab.active").removeClass("active");if(e.addClass("active"),e.trigger("show"),c?c=a(c):(c=a("string"==typeof b?'.tab-link[href="'+b+'"]':'.tab-link[href="#'+e.attr("id")+'"]'),(!c||c&&0===c.length)&&a("[data-tab]").each(function(){e.is(a(this).attr("data-tab"))&&(c=a(this))})),0!==c.length){var h;if(g&&g.length>0){var i=g.attr("id");i&&(h=a('.tab-link[href="#'+i+'"]')),(!h||h&&0===h.length)&&a("[data-tab]").each(function(){g.is(a(this).attr("data-tab"))&&(h=a(this))})}return c&&c.length>0&&c.addClass("active"),h&&h.length>0&&h.removeClass("active"),c.trigger("active"),!0}},c=a.showTab;a.showTab=b,a.showTab.noConflict=function(){return a.showTab=c,this},a(document).on("click",".tab-link",function(c){c.preventDefault();var d=a(this);b(d.data("tab")||d.attr("href"),d)})}(Zepto),+function(a){"use strict";function b(b){var d=Array.apply(null,arguments);d.shift(),this.each(function(){var d=a(this),e=a.extend({},d.dataset(),"object"==typeof b&&b),f=d.data("fixedtab");f||d.data("fixedtab",f=new c(this,e))})}a.initFixedTab=function(){var b=a(".fixed-tab");0!==b.length&&a(".fixed-tab").fixedTab()};var c=function(b,c){var d=this.$pageContent=a(b),e=d.clone(),f=d[0].getBoundingClientRect().top;e.css("visibility","hidden"),this.options=a.extend({},this._defaults,{fixedTop:f,shadow:e,offset:0},c),this._bindEvents()};c.prototype={_defaults:{offset:0},_bindEvents:function(){this.$pageContent.parents(".content").on("scroll",this._scrollHandler.bind(this)),this.$pageContent.on("active",".tab-link",this._tabLinkHandler.bind(this))},_tabLinkHandler:function(b){var c=a(b.target).parents(".buttons-fixed").length>0,d=this.options.fixedTop,e=this.options.offset;a.refreshScroller(),c&&this.$pageContent.parents(".content").scrollTop(d-e)},_scrollHandler:function(b){var c=a(b.target),d=this.$pageContent,e=this.options.shadow,f=this.options.offset,g=this.options.fixedTop,h=c.scrollTop(),i=h>=g-f;i?(e.insertAfter(d),d.addClass("buttons-fixed").css("top",f)):(e.remove(),d.removeClass("buttons-fixed").css("top",0))}},a.fn.fixedTab=b,a.fn.fixedTab.Constructor=c,a(document).on("pageInit",function(){a.initFixedTab()})}(Zepto),+function(a){"use strict";var b=0,c=function(c){function d(){j.hasClass("refreshing")||(-1*i.scrollTop()>=44?j.removeClass("pull-down").addClass("pull-up"):j.removeClass("pull-up").addClass("pull-down"))}function e(){j.hasClass("refreshing")||(j.removeClass("pull-down pull-up"),j.addClass("refreshing transitioning"),j.trigger("refresh"),b=+new Date)}function f(){i.off("scroll",d),i.scroller.off("ptr",e)}var g=a(c);if(g.hasClass("pull-to-refresh-content")||(g=g.find(".pull-to-refresh-content")),g&&0!==g.length){var h=g.hasClass("content")?g:g.parents(".content"),i=a.getScroller(h[0]);if(i){var j=g;i.on("scroll",d),i.scroller.on("ptr",e),g[0].destroyPullToRefresh=f}}},d=function(c){if(c=a(c),0===c.length&&(c=a(".pull-to-refresh-content.refreshing")),0!==c.length){var d=+new Date-b,e=d>1e3?0:1e3-d,f=a.getScroller(c);setTimeout(function(){f.refresh(),c.removeClass("refreshing"),c.transitionEnd(function(){c.removeClass("transitioning")})},e)}},e=function(b){if(b=a(b),0===b.length&&(b=a(".pull-to-refresh-content")),!b.hasClass("refreshing")){b.addClass("refreshing");var c=a.getScroller(b);c.scrollTop(45,200),b.trigger("refresh")}},f=function(b){b=a(b);var c=b.hasClass("pull-to-refresh-content")?b:b.find(".pull-to-refresh-content");0!==c.length&&c[0].destroyPullToRefresh&&c[0].destroyPullToRefresh()};a._pullToRefreshJSScroll={initPullToRefresh:c,pullToRefreshDone:d,pullToRefreshTrigger:e,destroyPullToRefresh:f}}(Zepto),+function(a){"use strict";a.initPullToRefresh=function(b){function c(b){if(h){if(!a.device.android)return;if("targetTouches"in b&&b.targetTouches.length>1)return}i=!1,h=!0,j=void 0,p=void 0,s.x="touchstart"===b.type?b.targetTouches[0].pageX:b.pageX,s.y="touchstart"===b.type?b.targetTouches[0].pageY:b.pageY,l=(new Date).getTime(),m=a(this)}function d(b){if(h){var c="touchmove"===b.type?b.targetTouches[0].pageX:b.pageX,d="touchmove"===b.type?b.targetTouches[0].pageY:b.pageY;if("undefined"==typeof j&&(j=!!(j||Math.abs(d-s.y)>Math.abs(c-s.x))),!j)return void(h=!1);if(o=m[0].scrollTop,"undefined"==typeof p&&0!==o&&(p=!0),!i){if(m.removeClass("transitioning"),o>m[0].offsetHeight)return void(h=!1);r&&(q=m.attr("data-ptr-distance"),q.indexOf("%")>=0&&(q=m[0].offsetHeight*parseInt(q,10)/100)),v=m.hasClass("refreshing")?q:0,u=m[0].scrollHeight!==m[0].offsetHeight&&a.device.ios?!1:!0,u=!0}return i=!0,k=d-s.y,k>0&&0>=o||0>o?(a.device.ios&&parseInt(a.device.osVersion.split(".")[0],10)>7&&0===o&&!p&&(u=!0),u&&(b.preventDefault(),n=Math.pow(k,.85)+v,m.transform("translate3d(0,"+n+"px,0)")),u&&Math.pow(k,.85)>q||!u&&k>=2*q?(t=!0,m.addClass("pull-up").removeClass("pull-down")):(t=!1,m.removeClass("pull-up").addClass("pull-down")),void 0):(m.removeClass("pull-up pull-down"),void(t=!1))}}function e(){if(!h||!i)return h=!1,void(i=!1);if(n&&(m.addClass("transitioning"),n=0),m.transform(""),t){if(m.hasClass("refreshing"))return;m.addClass("refreshing"),m.trigger("refresh")}else m.removeClass("pull-down");h=!1,i=!1}function f(){g.off(a.touchEvents.start,c),g.off(a.touchEvents.move,d),g.off(a.touchEvents.end,e)}var g=a(b);if(g.hasClass("pull-to-refresh-content")||(g=g.find(".pull-to-refresh-content")),g&&0!==g.length){var h,i,j,k,l,m,n,o,p,q,r,s={},t=!1,u=!1,v=0;m=g,m.attr("data-ptr-distance")?r=!0:q=44,g.on(a.touchEvents.start,c),g.on(a.touchEvents.move,d),g.on(a.touchEvents.end,e),g[0].destroyPullToRefresh=f}},a.pullToRefreshDone=function(b){a(window).scrollTop(0),b=a(b),0===b.length&&(b=a(".pull-to-refresh-content.refreshing")),b.removeClass("refreshing").addClass("transitioning"),b.transitionEnd(function(){b.removeClass("transitioning pull-up pull-down")})},a.pullToRefreshTrigger=function(b){b=a(b),0===b.length&&(b=a(".pull-to-refresh-content")),b.hasClass("refreshing")||(b.addClass("transitioning refreshing"),b.trigger("refresh"))},a.destroyPullToRefresh=function(b){b=a(b);var c=b.hasClass("pull-to-refresh-content")?b:b.find(".pull-to-refresh-content");0!==c.length&&c[0].destroyPullToRefresh&&c[0].destroyPullToRefresh()}}(Zepto),+function(a){"use strict";function b(){var b,c=a(this),d=a.getScroller(c),e=d.scrollTop(),f=d.scrollHeight(),g=c[0].offsetHeight,h=c[0].getAttribute("data-distance"),i=c.find(".virtual-list"),j=c.hasClass("infinite-scroll-top");if(h||(h=50),"string"==typeof h&&h.indexOf("%")>=0&&(h=parseInt(h,10)/100*g),h>g&&(h=g),j)h>e&&c.trigger("infinite");else if(e+g>=f-h){if(i.length>0&&(b=i[0].f7VirtualList,b&&!b.reachEnd))return;c.trigger("infinite")}}a.attachInfiniteScroll=function(c){a.getScroller(c).on("scroll",b)},a.detachInfiniteScroll=function(c){a.getScroller(c).off("scroll",b)},a.initInfiniteScroll=function(b){function c(){a.detachInfiniteScroll(d),b.off("pageBeforeRemove",c)}b=a(b);var d=b.hasClass("infinite-scroll")?b:b.find(".infinite-scroll");0!==d.length&&(a.attachInfiniteScroll(d),b.forEach(function(b){if(a(b).hasClass("infinite-scroll-top")){var c=b.scrollHeight-b.clientHeight;a(b).scrollTop(c)}}),b.on("pageBeforeRemove",c))}}(Zepto),+function(a){"use strict";a(function(){a(document).on("focus",".searchbar input",function(b){var c=a(b.target);c.parents(".searchbar").addClass("searchbar-active")}),a(document).on("click",".searchbar-cancel",function(b){var c=a(b.target);c.parents(".searchbar").removeClass("searchbar-active")}),a(document).on("blur",".searchbar input",function(b){var c=a(b.target);c.parents(".searchbar").removeClass("searchbar-active")})})}(Zepto),+function(a){"use strict";a.allowPanelOpen=!0,a.openPanel=function(b){function c(){f.transitionEnd(function(d){d.target===f[0]?(b.hasClass("active")?b.trigger("opened"):b.trigger("closed"),a.allowPanelOpen=!0):c()})}if(!a.allowPanelOpen)return!1;("left"===b||"right"===b)&&(b=".panel-"+b),b=b?a(b):a(".panel").eq(0);var d=b.hasClass("panel-right")?"right":"left";if(0===b.length||b.hasClass("active"))return!1;a.closePanel(),a.allowPanelOpen=!1;var e=b.hasClass("panel-reveal")?"reveal":"cover";b.css({display:"block"}).addClass("active"),b.trigger("open");var f=(b[0].clientLeft,"reveal"===e?a(a.getCurrentPage()):b);return c(),a(document.body).addClass("with-panel-"+d+"-"+e),!0},a.closePanel=function(){var b=a(".panel.active");if(0===b.length)return!1;var c=b.hasClass("panel-reveal")?"reveal":"cover",d=b.hasClass("panel-left")?"left":"right";b.removeClass("active");var e="reveal"===c?a(".page"):b;b.trigger("close"),a.allowPanelOpen=!1,e.transitionEnd(function(){b.hasClass("active")||(b.css({display:""}),b.trigger("closed"),a("body").removeClass("panel-closing"),a.allowPanelOpen=!0)}),a("body").addClass("panel-closing").removeClass("with-panel-"+d+"-"+c)},a(document).on("click",".open-panel",function(b){var c=a(b.target).data("panel");a.openPanel(c)}),a(document).on("click",".close-panel, .panel-overlay",function(b){a.closePanel()}),a.initSwipePanels=function(){function b(b){if(a.allowPanelOpen&&(g||h)&&!m&&!(a(".modal-in, .photo-browser-in").length>0)&&(i||h||!(a(".panel.active").length>0)||e.hasClass("active"))){if(x.x="touchstart"===b.type?b.targetTouches[0].pageX:b.pageX,x.y="touchstart"===b.type?b.targetTouches[0].pageY:b.pageY,i||h){if(a(".panel.active").length>0)f=a(".panel.active").hasClass("panel-left")?"left":"right";else{if(h)return;f=g}if(!f)return}if(e=a(".panel.panel-"+f),e[0]){if(s=e.hasClass("active"),j&&!s){if("left"===f&&x.x>j)return;if("right"===f&&x.x<window.innerWidth-j)return}n=!1,m=!0,o=void 0,p=(new Date).getTime(),v=void 0}}}function c(b){if(m&&e[0]&&!b.f7PreventPanelSwipe){var c="touchmove"===b.type?b.targetTouches[0].pageX:b.pageX,d="touchmove"===b.type?b.targetTouches[0].pageY:b.pageY;
if("undefined"==typeof o&&(o=!!(o||Math.abs(d-x.y)>Math.abs(c-x.x))),o)return void(m=!1);if(!v&&(v=c>x.x?"to-right":"to-left","left"===f&&"to-left"===v&&!e.hasClass("active")||"right"===f&&"to-right"===v&&!e.hasClass("active")))return void(m=!1);if(l){var g=(new Date).getTime()-p;return 300>g&&("to-left"===v&&("right"===f&&a.openPanel(f),"left"===f&&e.hasClass("active")&&a.closePanel()),"to-right"===v&&("left"===f&&a.openPanel(f),"right"===f&&e.hasClass("active")&&a.closePanel())),m=!1,console.log(3),void(n=!1)}n||(u=e.hasClass("panel-cover")?"cover":"reveal",s||(e.show(),w.show()),t=e[0].offsetWidth,e.transition(0)),n=!0,b.preventDefault();var h=s?0:-k;"right"===f&&(h=-h),q=c-x.x+h,"right"===f?(r=q-(s?t:0),r>0&&(r=0),-t>r&&(r=-t)):(r=q+(s?t:0),0>r&&(r=0),r>t&&(r=t)),"reveal"===u?(y.transform("translate3d("+r+"px,0,0)").transition(0),w.transform("translate3d("+r+"px,0,0)")):e.transform("translate3d("+r+"px,0,0)").transition(0)}}function d(b){if(!m||!n)return m=!1,void(n=!1);m=!1,n=!1;var c,d=(new Date).getTime()-p,g=0===r||Math.abs(r)===t;if(c=s?r===-t?"reset":300>d&&Math.abs(r)>=0||d>=300&&Math.abs(r)<=t/2?"left"===f&&r===t?"reset":"swap":"reset":0===r?"reset":300>d&&Math.abs(r)>0||d>=300&&Math.abs(r)>=t/2?"swap":"reset","swap"===c&&(a.allowPanelOpen=!0,s?(a.closePanel(),g&&(e.css({display:""}),a("body").removeClass("panel-closing"))):a.openPanel(f),g&&(a.allowPanelOpen=!0)),"reset"===c)if(s)a.allowPanelOpen=!0,a.openPanel(f);else if(a.closePanel(),g)a.allowPanelOpen=!0,e.css({display:""});else{var h="reveal"===u?y:e;a("body").addClass("panel-closing"),h.transitionEnd(function(){a.allowPanelOpen=!0,e.css({display:""}),a("body").removeClass("panel-closing")})}"reveal"===u&&(y.transition(""),y.transform("")),e.transition("").transform(""),w.css({display:""}).transform("")}var e,f,g=a.smConfig.swipePanel,h=a.smConfig.swipePanelOnlyClose,i=!0,j=!1,k=2,l=!1;if(g||h){var m,n,o,p,q,r,s,t,u,v,w=a(".panel-overlay"),x={},y=a(".page");a(document).on(a.touchEvents.start,b),a(document).on(a.touchEvents.move,c),a(document).on(a.touchEvents.end,d)}},a.initSwipePanels()}(Zepto),+function(a){"use strict";function b(a){for(var b=["external","tab-link","open-popup","close-popup","open-panel","close-panel"],c=b.length-1;c>=0;c--)if(a.hasClass(b[c]))return!0;var d=a.get(0),e=d.getAttribute("href"),f=["http","https"];return/^(\w+):/.test(e)&&f.indexOf(RegExp.$1)<0?!0:d.hasAttribute("external")?!0:!1}function c(b){var c=a.smConfig.routerFilter;if(a.isFunction(c)){var d=c(b);if("boolean"==typeof d)return d}return!0}window.CustomEvent||(window.CustomEvent=function(a,b){b=b||{bubbles:!1,cancelable:!1,detail:void 0};var c=document.createEvent("CustomEvent");return c.initCustomEvent(a,b.bubbles,b.cancelable,b.detail),c},window.CustomEvent.prototype=window.Event.prototype);var d={pageLoadStart:"pageLoadStart",pageLoadCancel:"pageLoadCancel",pageLoadError:"pageLoadError",pageLoadComplete:"pageLoadComplete",pageAnimationStart:"pageAnimationStart",pageAnimationEnd:"pageAnimationEnd",beforePageRemove:"beforePageRemove",pageRemoved:"pageRemoved",beforePageSwitch:"beforePageSwitch",pageInit:"pageInitInternal"},e={getUrlFragment:function(a){var b=a.indexOf("#");return-1===b?"":a.slice(b+1)},getAbsoluteUrl:function(a){var b=document.createElement("a");b.setAttribute("href",a);var c=b.href;return b=null,c},getBaseUrl:function(a){var b=a.indexOf("#");return-1===b?a.slice(0):a.slice(0,b)},toUrlObject:function(a){var b=this.getAbsoluteUrl(a),c=this.getBaseUrl(b),d=this.getUrlFragment(a);return{base:c,full:b,original:a,fragment:d}},supportStorage:function(){var a="sm.router.storage.ability";try{return sessionStorage.setItem(a,a),sessionStorage.removeItem(a),!0}catch(b){return!1}}},f={sectionGroupClass:"page-group",curPageClass:"page-current",visiblePageClass:"page-visible",pageClass:"page"},g={leftToRight:"from-left-to-right",rightToLeft:"from-right-to-left"},h=window.history,i=function(){this.sessionNames={currentState:"sm.router.currentState",maxStateId:"sm.router.maxStateId"},this._init(),this.xhr=null,window.addEventListener("popstate",this._onPopState.bind(this))};i.prototype._init=function(){this.$view=a("body"),this.cache={};var b=a(document),c=location.href;this._saveDocumentIntoCache(b,c);var d,g,i=e.toUrlObject(c),j=b.find("."+f.pageClass),k=b.find("."+f.curPageClass),l=k.eq(0);if(i.fragment&&(g=b.find("#"+i.fragment)),g&&g.length?k=g.eq(0):k.length||(k=j.eq(0)),k.attr("id")||k.attr("id",this._generateRandomId()),l.length&&l.attr("id")!==k.attr("id")?(l.removeClass(f.curPageClass),k.addClass(f.curPageClass)):k.addClass(f.curPageClass),d=k.attr("id"),null===h.state){var m={id:this._getNextStateId(),url:e.toUrlObject(c),pageId:d};h.replaceState(m,"",c),this._saveAsCurrentState(m),this._incMaxStateId()}},i.prototype.load=function(b,c){void 0===c&&(c=!1),this._isTheSameDocument(location.href,b)?this._switchToSection(e.getUrlFragment(b)):(this._saveDocumentIntoCache(a(document),location.href),this._switchToDocument(b,c))},i.prototype.forward=function(){h.forward()},i.prototype.back=function(){h.back()},i.prototype.loadPage=i.prototype.load,i.prototype._switchToSection=function(b){if(b){var c=this._getCurrentSection(),d=a("#"+b);c!==d&&(this._animateSection(c,d,g.rightToLeft),this._pushNewState("#"+b,b))}},i.prototype._switchToDocument=function(a,b,c,d){var f=e.toUrlObject(a).base;b&&delete this.cache[f];var g=this.cache[f],h=this;g?this._doSwitchDocument(a,c,d):this._loadDocument(a,{success:function(b){try{h._parseDocument(a,b),h._doSwitchDocument(a,c,d)}catch(e){location.href=a}},error:function(){location.href=a}})},i.prototype._doSwitchDocument=function(b,c,g){"undefined"==typeof c&&(c=!0);var h,i=e.toUrlObject(b),j=this.$view.find("."+f.sectionGroupClass),k=a(a("<div></div>").append(this.cache[i.base].$content).html()),l=k.find("."+f.pageClass),m=k.find("."+f.curPageClass);i.fragment&&(h=k.find("#"+i.fragment)),h&&h.length?m=h.eq(0):m.length||(m=l.eq(0)),m.attr("id")||m.attr("id",this._generateRandomId());var n=this._getCurrentSection();n.trigger(d.beforePageSwitch,[n.attr("id"),n]),l.removeClass(f.curPageClass),m.addClass(f.curPageClass),this.$view.prepend(k),this._animateDocument(j,k,m,g),c&&this._pushNewState(b,m.attr("id"))},i.prototype._isTheSameDocument=function(a,b){return e.toUrlObject(a).base===e.toUrlObject(b).base},i.prototype._loadDocument=function(b,c){this.xhr&&this.xhr.readyState<4&&(this.xhr.onreadystatechange=function(){},this.xhr.abort(),this.dispatch(d.pageLoadCancel)),this.dispatch(d.pageLoadStart),c=c||{};var e=this;this.xhr=a.ajax({url:b,success:a.proxy(function(b,d,e){var f=a("<html></html>");f.append(b),c.success&&c.success.call(null,f,d,e)},this),error:function(a,b,f){c.error&&c.error.call(null,a,b,f),e.dispatch(d.pageLoadError)},complete:function(a,b){c.complete&&c.complete.call(null,a,b),e.dispatch(d.pageLoadComplete)}})},i.prototype._parseDocument=function(a,b){var c=b.find("."+f.sectionGroupClass);if(!c.length)throw new Error("missing router view mark: "+f.sectionGroupClass);this._saveDocumentIntoCache(b,a)},i.prototype._saveDocumentIntoCache=function(b,c){var d=e.toUrlObject(c).base,g=a(b);this.cache[d]={$doc:g,$content:g.find("."+f.sectionGroupClass)}},i.prototype._getLastState=function(){var a=sessionStorage.getItem(this.sessionNames.currentState);try{a=JSON.parse(a)}catch(b){a=null}return a},i.prototype._saveAsCurrentState=function(a){sessionStorage.setItem(this.sessionNames.currentState,JSON.stringify(a))},i.prototype._getNextStateId=function(){var a=sessionStorage.getItem(this.sessionNames.maxStateId);return a?parseInt(a,10)+1:1},i.prototype._incMaxStateId=function(){sessionStorage.setItem(this.sessionNames.maxStateId,this._getNextStateId())},i.prototype._animateDocument=function(b,c,e,g){var h=e.attr("id"),i=b.find("."+f.curPageClass);i.addClass(f.visiblePageClass).removeClass(f.curPageClass),e.trigger(d.pageAnimationStart,[h,e]),this._animateElement(b,c,g),b.animationEnd(function(){i.removeClass(f.visiblePageClass),a(window).trigger(d.beforePageRemove,[b]),b.remove(),a(window).trigger(d.pageRemoved)}),c.animationEnd(function(){e.trigger(d.pageAnimationEnd,[h,e]),e.trigger(d.pageInit,[h,e])})},i.prototype._animateSection=function(a,b,c){var e=b.attr("id");a.trigger(d.beforePageSwitch,[a.attr("id"),a]),a.removeClass(f.curPageClass),b.addClass(f.curPageClass),b.trigger(d.pageAnimationStart,[e,b]),this._animateElement(a,b,c),b.animationEnd(function(){b.trigger(d.pageAnimationEnd,[e,b]),b.trigger(d.pageInit,[e,b])})},i.prototype._animateElement=function(a,b,c){"undefined"==typeof c&&(c=g.rightToLeft);var d,e,f=["page-from-center-to-left","page-from-center-to-right","page-from-right-to-center","page-from-left-to-center"].join(" ");switch(c){case g.rightToLeft:d="page-from-center-to-left",e="page-from-right-to-center";break;case g.leftToRight:d="page-from-center-to-right",e="page-from-left-to-center";break;default:d="page-from-center-to-left",e="page-from-right-to-center"}a.removeClass(f).addClass(d),b.removeClass(f).addClass(e),a.animationEnd(function(){a.removeClass(f)}),b.animationEnd(function(){b.removeClass(f)})},i.prototype._getCurrentSection=function(){return this.$view.find("."+f.curPageClass).eq(0)},i.prototype._back=function(b,c){if(this._isTheSameDocument(b.url.full,c.url.full)){var d=a("#"+b.pageId);if(d.length){var e=this._getCurrentSection();this._animateSection(e,d,g.leftToRight),this._saveAsCurrentState(b)}else location.href=b.url.full}else this._saveDocumentIntoCache(a(document),c.url.full),this._switchToDocument(b.url.full,!1,!1,g.leftToRight),this._saveAsCurrentState(b)},i.prototype._forward=function(b,c){if(this._isTheSameDocument(b.url.full,c.url.full)){var d=a("#"+b.pageId);if(d.length){var e=this._getCurrentSection();this._animateSection(e,d,g.rightToLeft),this._saveAsCurrentState(b)}else location.href=b.url.full}else this._saveDocumentIntoCache(a(document),c.url.full),this._switchToDocument(b.url.full,!1,!1,g.rightToLeft),this._saveAsCurrentState(b)},i.prototype._onPopState=function(a){var b=a.state;if(b&&b.pageId){var c=this._getLastState();return c?void(b.id!==c.id&&(b.id<c.id?this._back(b,c):this._forward(b,c))):void(console.error&&console.error("Missing last state when backward or forward"))}},i.prototype._pushNewState=function(a,b){var c={id:this._getNextStateId(),pageId:b,url:e.toUrlObject(a)};h.pushState(c,"",a),this._saveAsCurrentState(c),this._incMaxStateId()},i.prototype._generateRandomId=function(){return"page-"+ +new Date},i.prototype.dispatch=function(a){var b=new CustomEvent(a,{bubbles:!0,cancelable:!0});window.dispatchEvent(b)},a(function(){if(a.smConfig.router&&e.supportStorage()){var d=a("."+f.pageClass);if(!d.length){var g="Disable router function because of no .page elements";return void(window.console&&window.console.warn&&console.warn(g))}var h=a.router=new i;a(document).on("click","a",function(d){var e=a(d.currentTarget),f=c(e);if(f&&!b(e))if(d.preventDefault(),e.hasClass("back"))h.back();else{var g=e.attr("href");if(!g||"#"===g)return;var i="true"===e.attr("data-no-cache");h.load(g,i)}})}})}(Zepto),+function(a){"use strict";a.lastPosition=function(b){function c(b,c){e.forEach(function(d,e){if(0!==a(d).length){var f=b,g=sessionStorage.getItem(f);c.find(d).scrollTop(parseInt(g))}})}function d(b,c){var d=b;e.forEach(function(b,e){0!==a(b).length&&sessionStorage.setItem(d,c.find(b).scrollTop())})}if(sessionStorage){var e=b.needMemoryClass||[];a(window).off("beforePageSwitch").on("beforePageSwitch",function(a,b,c){d(b,c)}),a(window).off("pageAnimationStart").on("pageAnimationStart",function(a,b,d){c(b,d)})}}}(Zepto),+function(a){"use strict";var b=function(){var b=a(".page-current");return b[0]||(b=a(".page").addClass("page-current")),b};a.initPage=function(c){var d=b();d[0]||(d=a(document.body));var e=d.hasClass("content")?d:d.find(".content");e.scroller(),a.initPullToRefresh(e),a.initInfiniteScroll(e),a.initCalendar(e),a.initSwiper&&a.initSwiper(e)},a.smConfig.showPageLoadingIndicator&&(a(window).on("pageLoadStart",function(){a.showIndicator()}),a(window).on("pageAnimationStart",function(){a.hideIndicator()}),a(window).on("pageLoadCancel",function(){a.hideIndicator()}),a(window).on("pageLoadComplete",function(){a.hideIndicator()}),a(window).on("pageLoadError",function(){a.hideIndicator(),a.toast("加载失败")})),a(window).on("pageAnimationStart",function(b,c,d){a.closeModal(),a.closePanel(),a("body").removeClass("panel-closing"),a.allowPanelOpen=!0}),a(window).on("pageInit",function(){a.hideIndicator(),a.lastPosition({needMemoryClass:[".content"]})}),window.addEventListener("pageshow",function(a){a.persisted&&location.reload()}),a.init=function(){var c=b(),d=c[0].id;a.initPage(),c.trigger("pageInit",[d,c])},a(function(){FastClick.attach(document.body),a.smConfig.autoInit&&a.init(),a(document).on("pageInitInternal",function(b,c,d){a.init()})})}(Zepto),+function(a){"use strict";if(a.device.ios){var b=function(a){var b,c;a=a||document.querySelector(a),a&&a.addEventListener("touchstart",function(d){b=d.touches[0].pageY,c=a.scrollTop,0>=c&&(a.scrollTop=1),c+a.offsetHeight>=a.scrollHeight&&(a.scrollTop=a.scrollHeight-a.offsetHeight-1)},!1)},c=function(){var c=a(".page-current").length>0?".page-current ":"",d=a(c+".content");new b(d[0])};a(document).on(a.touchEvents.move,".page-current .bar",function(){event.preventDefault()}),a(document).on("pageLoadComplete",function(){c()}),a(document).on("pageAnimationEnd",function(){c()}),c()}}(Zepto);/*!
 * =====================================================
 * SUI Mobile - http://m.sui.taobao.org/
 *
 * =====================================================
 */
/*===========================
Swiper
===========================*/
/* global WebKitCSSMatrix:true */
/* global Modernizr:true */
/* global DocumentTouch:true */
+function($){
    "use strict";
    var Swiper = function (container, params) {
        // if (!(this instanceof Swiper)) return new Swiper(container, params);
        var defaults = this.defaults;
        var initalVirtualTranslate = params && params.virtualTranslate;

        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
            else if (typeof params[def] === 'object') {
                for (var deepDef in defaults[def]) {
                    if (typeof params[def][deepDef] === 'undefined') {
                        params[def][deepDef] = defaults[def][deepDef];
                    }
                }
            }
        }

        // Swiper
        var s = this;

        // Params
        s.params = params;

        // Classname
        s.classNames = [];

        // Export it to Swiper instance
        s.$ = $;
        /*=========================
          Preparation - Define Container, Wrapper and Pagination
          ===========================*/
        s.container = $(container);
        if (s.container.length === 0) return;
        if (s.container.length > 1) {
            s.container.each(function () {
                new $.Swiper(this, params);
            });
            return;
        }

        // Save instance in container HTML Element and in data
        s.container[0].swiper = s;
        s.container.data('swiper', s);

        s.classNames.push('swiper-container-' + s.params.direction);

        if (s.params.freeMode) {
            s.classNames.push('swiper-container-free-mode');
        }
        if (!s.support.flexbox) {
            s.classNames.push('swiper-container-no-flexbox');
            s.params.slidesPerColumn = 1;
        }
        // Enable slides progress when required
        if (s.params.parallax || s.params.watchSlidesVisibility) {
            s.params.watchSlidesProgress = true;
        }
        // Coverflow / 3D
        if (['cube', 'coverflow'].indexOf(s.params.effect) >= 0) {
            if (s.support.transforms3d) {
                s.params.watchSlidesProgress = true;
                s.classNames.push('swiper-container-3d');
            }
            else {
                s.params.effect = 'slide';
            }
        }
        if (s.params.effect !== 'slide') {
            s.classNames.push('swiper-container-' + s.params.effect);
        }
        if (s.params.effect === 'cube') {
            s.params.resistanceRatio = 0;
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.centeredSlides = false;
            s.params.spaceBetween = 0;
            s.params.virtualTranslate = true;
            s.params.setWrapperSize = false;
        }
        if (s.params.effect === 'fade') {
            s.params.slidesPerView = 1;
            s.params.slidesPerColumn = 1;
            s.params.slidesPerGroup = 1;
            s.params.watchSlidesProgress = true;
            s.params.spaceBetween = 0;
            if (typeof initalVirtualTranslate === 'undefined') {
                s.params.virtualTranslate = true;
            }
        }

        // Grab Cursor
        if (s.params.grabCursor && s.support.touch) {
            s.params.grabCursor = false;
        }

        // Wrapper
        s.wrapper = s.container.children('.' + s.params.wrapperClass);

        // Pagination
        if (s.params.pagination) {
            s.paginationContainer = $(s.params.pagination);
            if (s.params.paginationClickable) {
                s.paginationContainer.addClass('swiper-pagination-clickable');
            }
        }

        // Is Horizontal
        function isH() {
            return s.params.direction === 'horizontal';
        }

        // RTL
        s.rtl = isH() && (s.container[0].dir.toLowerCase() === 'rtl' || s.container.css('direction') === 'rtl');
        if (s.rtl) {
            s.classNames.push('swiper-container-rtl');
        }

        // Wrong RTL support
        if (s.rtl) {
            s.wrongRTL = s.wrapper.css('display') === '-webkit-box';
        }

        // Columns
        if (s.params.slidesPerColumn > 1) {
            s.classNames.push('swiper-container-multirow');
        }

        // Check for Android
        if (s.device.android) {
            s.classNames.push('swiper-container-android');
        }

        // Add classes
        s.container.addClass(s.classNames.join(' '));

        // Translate
        s.translate = 0;

        // Progress
        s.progress = 0;

        // Velocity
        s.velocity = 0;

        // Locks, unlocks
        s.lockSwipeToNext = function () {
            s.params.allowSwipeToNext = false;
        };
        s.lockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = false;
        };
        s.lockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = false;
        };
        s.unlockSwipeToNext = function () {
            s.params.allowSwipeToNext = true;
        };
        s.unlockSwipeToPrev = function () {
            s.params.allowSwipeToPrev = true;
        };
        s.unlockSwipes = function () {
            s.params.allowSwipeToNext = s.params.allowSwipeToPrev = true;
        };


        /*=========================
          Set grab cursor
          ===========================*/
        if (s.params.grabCursor) {
            s.container[0].style.cursor = 'move';
            s.container[0].style.cursor = '-webkit-grab';
            s.container[0].style.cursor = '-moz-grab';
            s.container[0].style.cursor = 'grab';
        }
        /*=========================
          Update on Images Ready
          ===========================*/
        s.imagesToLoad = [];
        s.imagesLoaded = 0;

        s.loadImage = function (imgElement, src, checkForComplete, callback) {
            var image;
            function onReady () {
                if (callback) callback();
            }
            if (!imgElement.complete || !checkForComplete) {
                if (src) {
                    image = new Image();
                    image.onload = onReady;
                    image.onerror = onReady;
                    image.src = src;
                } else {
                    onReady();
                }

            } else {//image already loaded...
                onReady();
            }
        };
        s.preloadImages = function () {
            s.imagesToLoad = s.container.find('img');
            function _onReady() {
                if (typeof s === 'undefined' || s === null) return;
                if (s.imagesLoaded !== undefined) s.imagesLoaded++;
                if (s.imagesLoaded === s.imagesToLoad.length) {
                    if (s.params.updateOnImagesReady) s.update();
                    s.emit('onImagesReady', s);
                }
            }
            for (var i = 0; i < s.imagesToLoad.length; i++) {
                s.loadImage(s.imagesToLoad[i], (s.imagesToLoad[i].currentSrc || s.imagesToLoad[i].getAttribute('src')), true, _onReady);
            }
        };

        /*=========================
          Autoplay
          ===========================*/
        s.autoplayTimeoutId = undefined;
        s.autoplaying = false;
        s.autoplayPaused = false;
        function autoplay() {
            s.autoplayTimeoutId = setTimeout(function () {
                if (s.params.loop) {
                    s.fixLoop();
                    s._slideNext();
                }
                else {
                    if (!s.isEnd) {
                        s._slideNext();
                    }
                    else {
                        if (!params.autoplayStopOnLast) {
                            s._slideTo(0);
                        }
                        else {
                            s.stopAutoplay();
                        }
                    }
                }
            }, s.params.autoplay);
        }
        s.startAutoplay = function () {
            if (typeof s.autoplayTimeoutId !== 'undefined') return false;
            if (!s.params.autoplay) return false;
            if (s.autoplaying) return false;
            s.autoplaying = true;
            s.emit('onAutoplayStart', s);
            autoplay();
        };
        s.stopAutoplay = function () {
            if (!s.autoplayTimeoutId) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplaying = false;
            s.autoplayTimeoutId = undefined;
            s.emit('onAutoplayStop', s);
        };
        s.pauseAutoplay = function (speed) {
            if (s.autoplayPaused) return;
            if (s.autoplayTimeoutId) clearTimeout(s.autoplayTimeoutId);
            s.autoplayPaused = true;
            if (speed === 0) {
                s.autoplayPaused = false;
                autoplay();
            }
            else {
                s.wrapper.transitionEnd(function () {
                    s.autoplayPaused = false;
                    if (!s.autoplaying) {
                        s.stopAutoplay();
                    }
                    else {
                        autoplay();
                    }
                });
            }
        };
        /*=========================
          Min/Max Translate
          ===========================*/
        s.minTranslate = function () {
            return (-s.snapGrid[0]);
        };
        s.maxTranslate = function () {
            return (-s.snapGrid[s.snapGrid.length - 1]);
        };
        /*=========================
          Slider/slides sizes
          ===========================*/
        s.updateContainerSize = function () {
            s.width = s.container[0].clientWidth;
            s.height = s.container[0].clientHeight;
            s.size = isH() ? s.width : s.height;
        };

        s.updateSlidesSize = function () {
            s.slides = s.wrapper.children('.' + s.params.slideClass);
            s.snapGrid = [];
            s.slidesGrid = [];
            s.slidesSizesGrid = [];

            var spaceBetween = s.params.spaceBetween,
                slidePosition = 0,
                i,
                prevSlideSize = 0,
                index = 0;
            if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
                spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * s.size;
            }

            s.virtualSize = -spaceBetween;
            // reset margins
            if (s.rtl) s.slides.css({marginLeft: '', marginTop: ''});
            else s.slides.css({marginRight: '', marginBottom: ''});

            var slidesNumberEvenToRows;
            if (s.params.slidesPerColumn > 1) {
                if (Math.floor(s.slides.length / s.params.slidesPerColumn) === s.slides.length / s.params.slidesPerColumn) {
                    slidesNumberEvenToRows = s.slides.length;
                }
                else {
                    slidesNumberEvenToRows = Math.ceil(s.slides.length / s.params.slidesPerColumn) * s.params.slidesPerColumn;
                }
            }

            // Calc slides
            var slideSize;
            for (i = 0; i < s.slides.length; i++) {
                slideSize = 0;
                var slide = s.slides.eq(i);
                if (s.params.slidesPerColumn > 1) {
                    // Set slides order
                    var newSlideOrderIndex;
                    var column, row;
                    var slidesPerColumn = s.params.slidesPerColumn;
                    var slidesPerRow;
                    if (s.params.slidesPerColumnFill === 'column') {
                        column = Math.floor(i / slidesPerColumn);
                        row = i - column * slidesPerColumn;
                        newSlideOrderIndex = column + row * slidesNumberEvenToRows / slidesPerColumn;
                        slide
                            .css({
                                '-webkit-box-ordinal-group': newSlideOrderIndex,
                                '-moz-box-ordinal-group': newSlideOrderIndex,
                                '-ms-flex-order': newSlideOrderIndex,
                                '-webkit-order': newSlideOrderIndex,
                                'order': newSlideOrderIndex
                            });
                    }
                    else {
                        slidesPerRow = slidesNumberEvenToRows / slidesPerColumn;
                        row = Math.floor(i / slidesPerRow);
                        column = i - row * slidesPerRow;

                    }
                    slide
                        .css({
                            'margin-top': (row !== 0 && s.params.spaceBetween) && (s.params.spaceBetween + 'px')
                        })
                        .attr('data-swiper-column', column)
                        .attr('data-swiper-row', row);

                }
                if (slide.css('display') === 'none') continue;
                if (s.params.slidesPerView === 'auto') {
                    slideSize = isH() ? slide.outerWidth(true) : slide.outerHeight(true);
                }
                else {
                    slideSize = (s.size - (s.params.slidesPerView - 1) * spaceBetween) / s.params.slidesPerView;
                    if (isH()) {
                        s.slides[i].style.width = slideSize + 'px';
                    }
                    else {
                        s.slides[i].style.height = slideSize + 'px';
                    }
                }
                s.slides[i].swiperSlideSize = slideSize;
                s.slidesSizesGrid.push(slideSize);


                if (s.params.centeredSlides) {
                    slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                    if (i === 0) slidePosition = slidePosition - s.size / 2 - spaceBetween;
                    if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                }
                else {
                    if ((index) % s.params.slidesPerGroup === 0) s.snapGrid.push(slidePosition);
                    s.slidesGrid.push(slidePosition);
                    slidePosition = slidePosition + slideSize + spaceBetween;
                }

                s.virtualSize += slideSize + spaceBetween;

                prevSlideSize = slideSize;

                index ++;
            }
            s.virtualSize = Math.max(s.virtualSize, s.size);

            var newSlidesGrid;

            if (
                s.rtl && s.wrongRTL && (s.params.effect === 'slide' || s.params.effect === 'coverflow')) {
                s.wrapper.css({width: s.virtualSize + s.params.spaceBetween + 'px'});
            }
            if (!s.support.flexbox || s.params.setWrapperSize) {
                if (isH()) s.wrapper.css({width: s.virtualSize + s.params.spaceBetween + 'px'});
                else s.wrapper.css({height: s.virtualSize + s.params.spaceBetween + 'px'});
            }

            if (s.params.slidesPerColumn > 1) {
                s.virtualSize = (slideSize + s.params.spaceBetween) * slidesNumberEvenToRows;
                s.virtualSize = Math.ceil(s.virtualSize / s.params.slidesPerColumn) - s.params.spaceBetween;
                s.wrapper.css({width: s.virtualSize + s.params.spaceBetween + 'px'});
                if (s.params.centeredSlides) {
                    newSlidesGrid = [];
                    for (i = 0; i < s.snapGrid.length; i++) {
                        if (s.snapGrid[i] < s.virtualSize + s.snapGrid[0]) newSlidesGrid.push(s.snapGrid[i]);
                    }
                    s.snapGrid = newSlidesGrid;
                }
            }

            // Remove last grid elements depending on width
            if (!s.params.centeredSlides) {
                newSlidesGrid = [];
                for (i = 0; i < s.snapGrid.length; i++) {
                    if (s.snapGrid[i] <= s.virtualSize - s.size) {
                        newSlidesGrid.push(s.snapGrid[i]);
                    }
                }
                s.snapGrid = newSlidesGrid;
                if (Math.floor(s.virtualSize - s.size) > Math.floor(s.snapGrid[s.snapGrid.length - 1])) {
                    s.snapGrid.push(s.virtualSize - s.size);
                }
            }
            if (s.snapGrid.length === 0) s.snapGrid = [0];

            if (s.params.spaceBetween !== 0) {
                if (isH()) {
                    if (s.rtl) s.slides.css({marginLeft: spaceBetween + 'px'});
                    else s.slides.css({marginRight: spaceBetween + 'px'});
                }
                else s.slides.css({marginBottom: spaceBetween + 'px'});
            }
            if (s.params.watchSlidesProgress) {
                s.updateSlidesOffset();
            }
        };
        s.updateSlidesOffset = function () {
            for (var i = 0; i < s.slides.length; i++) {
                s.slides[i].swiperSlideOffset = isH() ? s.slides[i].offsetLeft : s.slides[i].offsetTop;
            }
        };

        /*=========================
          Slider/slides progress
          ===========================*/
        s.updateSlidesProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            if (s.slides.length === 0) return;
            if (typeof s.slides[0].swiperSlideOffset === 'undefined') s.updateSlidesOffset();

            var offsetCenter = s.params.centeredSlides ? -translate + s.size / 2 : -translate;
            if (s.rtl) offsetCenter = s.params.centeredSlides ? translate - s.size / 2 : translate;

            // Visible Slides
            s.slides.removeClass(s.params.slideVisibleClass);
            for (var i = 0; i < s.slides.length; i++) {
                var slide = s.slides[i];
                var slideCenterOffset = (s.params.centeredSlides === true) ? slide.swiperSlideSize / 2 : 0;
                var slideProgress = (offsetCenter - slide.swiperSlideOffset - slideCenterOffset) / (slide.swiperSlideSize + s.params.spaceBetween);
                if (s.params.watchSlidesVisibility) {
                    var slideBefore = -(offsetCenter - slide.swiperSlideOffset - slideCenterOffset);
                    var slideAfter = slideBefore + s.slidesSizesGrid[i];
                    var isVisible =
                        (slideBefore >= 0 && slideBefore < s.size) ||
                        (slideAfter > 0 && slideAfter <= s.size) ||
                        (slideBefore <= 0 && slideAfter >= s.size);
                    if (isVisible) {
                        s.slides.eq(i).addClass(s.params.slideVisibleClass);
                    }
                }
                slide.progress = s.rtl ? -slideProgress : slideProgress;
            }
        };
        s.updateProgress = function (translate) {
            if (typeof translate === 'undefined') {
                translate = s.translate || 0;
            }
            var translatesDiff = s.maxTranslate() - s.minTranslate();
            if (translatesDiff === 0) {
                s.progress = 0;
                s.isBeginning = s.isEnd = true;
            }
            else {
                s.progress = (translate - s.minTranslate()) / (translatesDiff);
                s.isBeginning = s.progress <= 0;
                s.isEnd = s.progress >= 1;
            }
            if (s.isBeginning) s.emit('onReachBeginning', s);
            if (s.isEnd) s.emit('onReachEnd', s);

            if (s.params.watchSlidesProgress) s.updateSlidesProgress(translate);
            s.emit('onProgress', s, s.progress);
        };
        s.updateActiveIndex = function () {
            var translate = s.rtl ? s.translate : -s.translate;
            var newActiveIndex, i, snapIndex;
            for (i = 0; i < s.slidesGrid.length; i ++) {
                if (typeof s.slidesGrid[i + 1] !== 'undefined') {
                    if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1] - (s.slidesGrid[i + 1] - s.slidesGrid[i]) / 2) {
                        newActiveIndex = i;
                    }
                    else if (translate >= s.slidesGrid[i] && translate < s.slidesGrid[i + 1]) {
                        newActiveIndex = i + 1;
                    }
                }
                else {
                    if (translate >= s.slidesGrid[i]) {
                        newActiveIndex = i;
                    }
                }
            }
            // Normalize slideIndex
            if (newActiveIndex < 0 || typeof newActiveIndex === 'undefined') newActiveIndex = 0;
            // for (i = 0; i < s.slidesGrid.length; i++) {
                // if (- translate >= s.slidesGrid[i]) {
                    // newActiveIndex = i;
                // }
            // }
            snapIndex = Math.floor(newActiveIndex / s.params.slidesPerGroup);
            if (snapIndex >= s.snapGrid.length) snapIndex = s.snapGrid.length - 1;

            if (newActiveIndex === s.activeIndex) {
                return;
            }
            s.snapIndex = snapIndex;
            s.previousIndex = s.activeIndex;
            s.activeIndex = newActiveIndex;
            s.updateClasses();
        };

        /*=========================
          Classes
          ===========================*/
        s.updateClasses = function () {
            s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
            var activeSlide = s.slides.eq(s.activeIndex);
            // Active classes
            activeSlide.addClass(s.params.slideActiveClass);
            activeSlide.next('.' + s.params.slideClass).addClass(s.params.slideNextClass);
            activeSlide.prev('.' + s.params.slideClass).addClass(s.params.slidePrevClass);

            // Pagination
            if (s.bullets && s.bullets.length > 0) {
                s.bullets.removeClass(s.params.bulletActiveClass);
                var bulletIndex;
                if (s.params.loop) {
                    bulletIndex = Math.ceil(s.activeIndex - s.loopedSlides)/s.params.slidesPerGroup;
                    if (bulletIndex > s.slides.length - 1 - s.loopedSlides * 2) {
                        bulletIndex = bulletIndex - (s.slides.length - s.loopedSlides * 2);
                    }
                    if (bulletIndex > s.bullets.length - 1) bulletIndex = bulletIndex - s.bullets.length;
                }
                else {
                    if (typeof s.snapIndex !== 'undefined') {
                        bulletIndex = s.snapIndex;
                    }
                    else {
                        bulletIndex = s.activeIndex || 0;
                    }
                }
                if (s.paginationContainer.length > 1) {
                    s.bullets.each(function () {
                        if ($(this).index() === bulletIndex) $(this).addClass(s.params.bulletActiveClass);
                    });
                }
                else {
                    s.bullets.eq(bulletIndex).addClass(s.params.bulletActiveClass);
                }
            }

            // Next/active buttons
            if (!s.params.loop) {
                if (s.params.prevButton) {
                    if (s.isBeginning) {
                        $(s.params.prevButton).addClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y) s.a11y.disable($(s.params.prevButton));
                    }
                    else {
                        $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y) s.a11y.enable($(s.params.prevButton));
                    }
                }
                if (s.params.nextButton) {
                    if (s.isEnd) {
                        $(s.params.nextButton).addClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y) s.a11y.disable($(s.params.nextButton));
                    }
                    else {
                        $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);
                        if (s.params.a11y && s.a11y) s.a11y.enable($(s.params.nextButton));
                    }
                }
            }
        };

        /*=========================
          Pagination
          ===========================*/
        s.updatePagination = function () {
            if (!s.params.pagination) return;
            if (s.paginationContainer && s.paginationContainer.length > 0) {
                var bulletsHTML = '';
                var numberOfBullets = s.params.loop ? Math.ceil((s.slides.length - s.loopedSlides * 2) / s.params.slidesPerGroup) : s.snapGrid.length;
                for (var i = 0; i < numberOfBullets; i++) {
                    if (s.params.paginationBulletRender) {
                        bulletsHTML += s.params.paginationBulletRender(i, s.params.bulletClass);
                    }
                    else {
                        bulletsHTML += '<span class="' + s.params.bulletClass + '"></span>';
                    }
                }
                s.paginationContainer.html(bulletsHTML);
                s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
            }
        };
        /*=========================
          Common update method
          ===========================*/
        s.update = function (updateTranslate) {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            s.updatePagination();
            s.updateClasses();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            function forceSetTranslate() {
                newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            if (updateTranslate) {
                var translated, newTranslate;
                if (s.params.freeMode) {
                    forceSetTranslate();
                }
                else {
                    if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                        translated = s.slideTo(s.slides.length - 1, 0, false, true);
                    }
                    else {
                        translated = s.slideTo(s.activeIndex, 0, false, true);
                    }
                    if (!translated) {
                        forceSetTranslate();
                    }
                }

            }
        };

        /*=========================
          Resize Handler
          ===========================*/
        s.onResize = function () {
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updateProgress();
            if (s.params.slidesPerView === 'auto' || s.params.freeMode) s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.freeMode) {
                var newTranslate = Math.min(Math.max(s.translate, s.maxTranslate()), s.minTranslate());
                s.setWrapperTranslate(newTranslate);
                s.updateActiveIndex();
                s.updateClasses();
            }
            else {
                s.updateClasses();
                if (s.params.slidesPerView === 'auto' && s.isEnd && !s.params.centeredSlides) {
                    s.slideTo(s.slides.length - 1, 0, false, true);
                }
                else {
                    s.slideTo(s.activeIndex, 0, false, true);
                }
            }

        };

        /*=========================
          Events
          ===========================*/

        //Define Touch Events
        var desktopEvents = ['mousedown', 'mousemove', 'mouseup'];
        if (window.navigator.pointerEnabled) desktopEvents = ['pointerdown', 'pointermove', 'pointerup'];
        else if (window.navigator.msPointerEnabled) desktopEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
        s.touchEvents = {
            start : s.support.touch || !s.params.simulateTouch  ? 'touchstart' : desktopEvents[0],
            move : s.support.touch || !s.params.simulateTouch ? 'touchmove' : desktopEvents[1],
            end : s.support.touch || !s.params.simulateTouch ? 'touchend' : desktopEvents[2]
        };


        // WP8 Touch Events Fix
        if (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) {
            (s.params.touchEventsTarget === 'container' ? s.container : s.wrapper).addClass('swiper-wp8-' + s.params.direction);
        }

        // Attach/detach events
        s.initEvents = function (detach) {
            var actionDom = detach ? 'off' : 'on';
            var action = detach ? 'removeEventListener' : 'addEventListener';
            var touchEventsTarget = s.params.touchEventsTarget === 'container' ? s.container[0] : s.wrapper[0];
            var target = s.support.touch ? touchEventsTarget : document;

            var moveCapture = s.params.nested ? true : false;

            //Touch Events
            if (s.browser.ie) {
                touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                target[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                target[action](s.touchEvents.end, s.onTouchEnd, false);
            }
            else {
                if (s.support.touch) {
                    touchEventsTarget[action](s.touchEvents.start, s.onTouchStart, false);
                    touchEventsTarget[action](s.touchEvents.move, s.onTouchMove, moveCapture);
                    touchEventsTarget[action](s.touchEvents.end, s.onTouchEnd, false);
                }
                if (params.simulateTouch && !s.device.ios && !s.device.android) {
                    touchEventsTarget[action]('mousedown', s.onTouchStart, false);
                    target[action]('mousemove', s.onTouchMove, moveCapture);
                    target[action]('mouseup', s.onTouchEnd, false);
                }
            }
            window[action]('resize', s.onResize);

            // Next, Prev, Index
            if (s.params.nextButton) {
                $(s.params.nextButton)[actionDom]('click', s.onClickNext);
                if (s.params.a11y && s.a11y) $(s.params.nextButton)[actionDom]('keydown', s.a11y.onEnterKey);
            }
            if (s.params.prevButton) {
                $(s.params.prevButton)[actionDom]('click', s.onClickPrev);
                if (s.params.a11y && s.a11y) $(s.params.prevButton)[actionDom]('keydown', s.a11y.onEnterKey);
            }
            if (s.params.pagination && s.params.paginationClickable) {
                $(s.paginationContainer)[actionDom]('click', '.' + s.params.bulletClass, s.onClickIndex);
            }

            // Prevent Links Clicks
            if (s.params.preventClicks || s.params.preventClicksPropagation) touchEventsTarget[action]('click', s.preventClicks, true);
        };
        s.attachEvents = function () {
            s.initEvents();
        };
        s.detachEvents = function () {
            s.initEvents(true);
        };

        /*=========================
          Handle Clicks
          ===========================*/
        // Prevent Clicks
        s.allowClick = true;
        s.preventClicks = function (e) {
            if (!s.allowClick) {
                if (s.params.preventClicks) e.preventDefault();
                if (s.params.preventClicksPropagation) {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                }
            }
        };
        // Clicks
        s.onClickNext = function (e) {
            e.preventDefault();
            s.slideNext();
        };
        s.onClickPrev = function (e) {
            e.preventDefault();
            s.slidePrev();
        };
        s.onClickIndex = function (e) {
            e.preventDefault();
            var index = $(this).index() * s.params.slidesPerGroup;
            if (s.params.loop) index = index + s.loopedSlides;
            s.slideTo(index);
        };

        /*=========================
          Handle Touches
          ===========================*/
        function findElementInEvent(e, selector) {
            var el = $(e.target);
            if (!el.is(selector)) {
                if (typeof selector === 'string') {
                    el = el.parents(selector);
                }
                else if (selector.nodeType) {
                    var found;
                    el.parents().each(function (index, _el) {
                        if (_el === selector) found = selector;
                    });
                    if (!found) return undefined;
                    else return selector;
                }
            }
            if (el.length === 0) {
                return undefined;
            }
            return el[0];
        }
        s.updateClickedSlide = function (e) {
            var slide = findElementInEvent(e, '.' + s.params.slideClass);
            if (slide) {
                s.clickedSlide = slide;
                s.clickedIndex = $(slide).index();
            }
            else {
                s.clickedSlide = undefined;
                s.clickedIndex = undefined;
                return;
            }
            if (s.params.slideToClickedSlide && s.clickedIndex !== undefined && s.clickedIndex !== s.activeIndex) {
                var slideToIndex = s.clickedIndex,
                    realIndex;
                if (s.params.loop) {
                    realIndex = $(s.clickedSlide).attr('data-swiper-slide-index');
                    if (slideToIndex > s.slides.length - s.params.slidesPerView) {
                        s.fixLoop();
                        slideToIndex = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]').eq(0).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else if (slideToIndex < s.params.slidesPerView - 1) {
                        s.fixLoop();
                        var duplicatedSlides = s.wrapper.children('.' + s.params.slideClass + '[data-swiper-slide-index="' + realIndex + '"]');
                        slideToIndex = duplicatedSlides.eq(duplicatedSlides.length - 1).index();
                        setTimeout(function () {
                            s.slideTo(slideToIndex);
                        }, 0);
                    }
                    else {
                        s.slideTo(slideToIndex);
                    }
                }
                else {
                    s.slideTo(slideToIndex);
                }
            }
        };

        var isTouched,
            isMoved,
            touchStartTime,
            isScrolling,
            currentTranslate,
            startTranslate,
            allowThresholdMove,
            // Form elements to match
            formElements = 'input, select, textarea, button',
            // Last click time
            lastClickTime = Date.now(), clickTimeout,
            //Velocities
            velocities = [],
            allowMomentumBounce;

        // Animating Flag
        s.animating = false;

        // Touches information
        s.touches = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            diff: 0
        };

        // Touch handlers
        var isTouchEvent, startMoving;
        s.onTouchStart = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            isTouchEvent = e.type === 'touchstart';
            if (!isTouchEvent && 'which' in e && e.which === 3) return;
            if (s.params.noSwiping && findElementInEvent(e, '.' + s.params.noSwipingClass)) {
                s.allowClick = true;
                return;
            }
            if (s.params.swipeHandler) {
                if (!findElementInEvent(e, s.params.swipeHandler)) return;
            }
            isTouched = true;
            isMoved = false;
            isScrolling = undefined;
            startMoving = undefined;
            s.touches.startX = s.touches.currentX = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.startY = s.touches.currentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            touchStartTime = Date.now();
            s.allowClick = true;
            s.updateContainerSize();
            s.swipeDirection = undefined;
            if (s.params.threshold > 0) allowThresholdMove = false;
            if (e.type !== 'touchstart') {
                var preventDefault = true;
                if ($(e.target).is(formElements)) preventDefault = false;
                if (document.activeElement && $(document.activeElement).is(formElements)) {
                    document.activeElement.blur();
                }
                if (preventDefault) {
                    e.preventDefault();
                }
            }
            s.emit('onTouchStart', s, e);
        };

        s.onTouchMove = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            if (isTouchEvent && e.type === 'mousemove') return;
            if (e.preventedByNestedSwiper) return;
            if (s.params.onlyExternal) {
                isMoved = true;
                s.allowClick = false;
                return;
            }
            if (isTouchEvent && document.activeElement) {
                if (e.target === document.activeElement && $(e.target).is(formElements)) {
                    isMoved = true;
                    s.allowClick = false;
                    return;
                }
            }

            s.emit('onTouchMove', s, e);

            if (e.targetTouches && e.targetTouches.length > 1) return;

            s.touches.currentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            s.touches.currentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

            if (typeof isScrolling === 'undefined') {
                var touchAngle = Math.atan2(Math.abs(s.touches.currentY - s.touches.startY), Math.abs(s.touches.currentX - s.touches.startX)) * 180 / Math.PI;
                isScrolling = isH() ? touchAngle > s.params.touchAngle : (90 - touchAngle > s.params.touchAngle);
            }
            if (isScrolling) {
                s.emit('onTouchMoveOpposite', s, e);
            }
            if (typeof startMoving === 'undefined' && s.browser.ieTouch) {
                if (s.touches.currentX !== s.touches.startX || s.touches.currentY !== s.touches.startY) {
                    startMoving = true;
                }
            }
            if (!isTouched) return;
            if (isScrolling)  {
                isTouched = false;
                return;
            }
            if (!startMoving && s.browser.ieTouch) {
                return;
            }
            s.allowClick = false;
            s.emit('onSliderMove', s, e);
            e.preventDefault();
            if (s.params.touchMoveStopPropagation && !s.params.nested) {
                e.stopPropagation();
            }

            if (!isMoved) {
                if (params.loop) {
                    s.fixLoop();
                }
                startTranslate = s.getWrapperTranslate();
                s.setWrapperTransition(0);
                if (s.animating) {
                    s.wrapper.trigger('webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd');
                }
                if (s.params.autoplay && s.autoplaying) {
                    if (s.params.autoplayDisableOnInteraction) {
                        s.stopAutoplay();
                    }
                    else {
                        s.pauseAutoplay();
                    }
                }
                allowMomentumBounce = false;
                //Grab Cursor
                if (s.params.grabCursor) {
                    s.container[0].style.cursor = 'move';
                    s.container[0].style.cursor = '-webkit-grabbing';
                    s.container[0].style.cursor = '-moz-grabbin';
                    s.container[0].style.cursor = 'grabbing';
                }
            }
            isMoved = true;

            var diff = s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;

            diff = diff * s.params.touchRatio;
            if (s.rtl) diff = -diff;

            s.swipeDirection = diff > 0 ? 'prev' : 'next';
            currentTranslate = diff + startTranslate;

            var disableParentSwiper = true;
            if ((diff > 0 && currentTranslate > s.minTranslate())) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.minTranslate() - 1 + Math.pow(-s.minTranslate() + startTranslate + diff, s.params.resistanceRatio);
            }
            else if (diff < 0 && currentTranslate < s.maxTranslate()) {
                disableParentSwiper = false;
                if (s.params.resistance) currentTranslate = s.maxTranslate() + 1 - Math.pow(s.maxTranslate() - startTranslate - diff, s.params.resistanceRatio);
            }

            if (disableParentSwiper) {
                e.preventedByNestedSwiper = true;
            }

            // Directions locks
            if (!s.params.allowSwipeToNext && s.swipeDirection === 'next' && currentTranslate < startTranslate) {
                currentTranslate = startTranslate;
            }
            if (!s.params.allowSwipeToPrev && s.swipeDirection === 'prev' && currentTranslate > startTranslate) {
                currentTranslate = startTranslate;
            }

            if (!s.params.followFinger) return;

            // Threshold
            if (s.params.threshold > 0) {
                if (Math.abs(diff) > s.params.threshold || allowThresholdMove) {
                    if (!allowThresholdMove) {
                        allowThresholdMove = true;
                        s.touches.startX = s.touches.currentX;
                        s.touches.startY = s.touches.currentY;
                        currentTranslate = startTranslate;
                        s.touches.diff = isH() ? s.touches.currentX - s.touches.startX : s.touches.currentY - s.touches.startY;
                        return;
                    }
                }
                else {
                    currentTranslate = startTranslate;
                    return;
                }
            }
            // Update active index in free mode
            if (s.params.freeMode || s.params.watchSlidesProgress) {
                s.updateActiveIndex();
            }
            if (s.params.freeMode) {
                //Velocity
                if (velocities.length === 0) {
                    velocities.push({
                        position: s.touches[isH() ? 'startX' : 'startY'],
                        time: touchStartTime
                    });
                }
                velocities.push({
                    position: s.touches[isH() ? 'currentX' : 'currentY'],
                    time: (new Date()).getTime()
                });
            }
            // Update progress
            s.updateProgress(currentTranslate);
            // Update translate
            s.setWrapperTranslate(currentTranslate);
        };
        s.onTouchEnd = function (e) {
            if (e.originalEvent) e = e.originalEvent;
            s.emit('onTouchEnd', s, e);
            if (!isTouched) return;
            //Return Grab Cursor
            if (s.params.grabCursor && isMoved && isTouched) {
                s.container[0].style.cursor = 'move';
                s.container[0].style.cursor = '-webkit-grab';
                s.container[0].style.cursor = '-moz-grab';
                s.container[0].style.cursor = 'grab';
            }

            // Time diff
            var touchEndTime = Date.now();
            var timeDiff = touchEndTime - touchStartTime;

            // Tap, doubleTap, Click
            if (s.allowClick) {
                s.updateClickedSlide(e);
                s.emit('onTap', s, e);
                if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(function () {
                        if (!s) return;
                        if (s.params.paginationHide && s.paginationContainer.length > 0 && !$(e.target).hasClass(s.params.bulletClass)) {
                            s.paginationContainer.toggleClass(s.params.paginationHiddenClass);
                        }
                        s.emit('onClick', s, e);
                    }, 300);

                }
                if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
                    if (clickTimeout) clearTimeout(clickTimeout);
                    s.emit('onDoubleTap', s, e);
                }
            }

            lastClickTime = Date.now();
            setTimeout(function () {
                if (s && s.allowClick) s.allowClick = true;
            }, 0);

            if (!isTouched || !isMoved || !s.swipeDirection || s.touches.diff === 0 || currentTranslate === startTranslate) {
                isTouched = isMoved = false;
                return;
            }
            isTouched = isMoved = false;

            var currentPos;
            if (s.params.followFinger) {
                currentPos = s.rtl ? s.translate : -s.translate;
            }
            else {
                currentPos = -currentTranslate;
            }
            if (s.params.freeMode) {
                if (currentPos < -s.minTranslate()) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                else if (currentPos > -s.maxTranslate()) {
                    s.slideTo(s.slides.length - 1);
                    return;
                }

                if (s.params.freeModeMomentum) {
                    if (velocities.length > 1) {
                        var lastMoveEvent = velocities.pop(), velocityEvent = velocities.pop();

                        var distance = lastMoveEvent.position - velocityEvent.position;
                        var time = lastMoveEvent.time - velocityEvent.time;
                        s.velocity = distance / time;
                        s.velocity = s.velocity / 2;
                        if (Math.abs(s.velocity) < 0.02) {
                            s.velocity = 0;
                        }
                        // this implies that the user stopped moving a finger then released.
                        // There would be no events with distance zero, so the last event is stale.
                        if (time > 150 || (new Date().getTime() - lastMoveEvent.time) > 300) {
                            s.velocity = 0;
                        }
                    } else {
                        s.velocity = 0;
                    }

                    velocities.length = 0;
                    var momentumDuration = 1000 * s.params.freeModeMomentumRatio;
                    var momentumDistance = s.velocity * momentumDuration;

                    var newPosition = s.translate + momentumDistance;
                    if (s.rtl) newPosition = - newPosition;
                    var doBounce = false;
                    var afterBouncePosition;
                    var bounceAmount = Math.abs(s.velocity) * 20 * s.params.freeModeMomentumBounceRatio;
                    if (newPosition < s.maxTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition + s.maxTranslate() < -bounceAmount) {
                                newPosition = s.maxTranslate() - bounceAmount;
                            }
                            afterBouncePosition = s.maxTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.maxTranslate();
                        }
                    }
                    if (newPosition > s.minTranslate()) {
                        if (s.params.freeModeMomentumBounce) {
                            if (newPosition - s.minTranslate() > bounceAmount) {
                                newPosition = s.minTranslate() + bounceAmount;
                            }
                            afterBouncePosition = s.minTranslate();
                            doBounce = true;
                            allowMomentumBounce = true;
                        }
                        else {
                            newPosition = s.minTranslate();
                        }
                    }
                    //Fix duration
                    if (s.velocity !== 0) {
                        if (s.rtl) {
                            momentumDuration = Math.abs((-newPosition - s.translate) / s.velocity);
                        }
                        else {
                            momentumDuration = Math.abs((newPosition - s.translate) / s.velocity);
                        }
                    }

                    if (s.params.freeModeMomentumBounce && doBounce) {
                        s.updateProgress(afterBouncePosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        s.animating = true;
                        s.wrapper.transitionEnd(function () {
                            if (!allowMomentumBounce) return;
                            s.emit('onMomentumBounce', s);

                            s.setWrapperTransition(s.params.speed);
                            s.setWrapperTranslate(afterBouncePosition);
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        });
                    } else if (s.velocity) {
                        s.updateProgress(newPosition);
                        s.setWrapperTransition(momentumDuration);
                        s.setWrapperTranslate(newPosition);
                        s.onTransitionStart();
                        if (!s.animating) {
                            s.animating = true;
                            s.wrapper.transitionEnd(function () {
                                s.onTransitionEnd();
                            });
                        }

                    } else {
                        s.updateProgress(newPosition);
                    }

                    s.updateActiveIndex();
                }
                if (!s.params.freeModeMomentum || timeDiff >= s.params.longSwipesMs) {
                    s.updateProgress();
                    s.updateActiveIndex();
                }
                return;
            }

            // Find current slide
            var i, stopIndex = 0, groupSize = s.slidesSizesGrid[0];
            for (i = 0; i < s.slidesGrid.length; i += s.params.slidesPerGroup) {
                if (typeof s.slidesGrid[i + s.params.slidesPerGroup] !== 'undefined') {
                    if (currentPos >= s.slidesGrid[i] && currentPos < s.slidesGrid[i + s.params.slidesPerGroup]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[i + s.params.slidesPerGroup] - s.slidesGrid[i];
                    }
                }
                else {
                    if (currentPos >= s.slidesGrid[i]) {
                        stopIndex = i;
                        groupSize = s.slidesGrid[s.slidesGrid.length - 1] - s.slidesGrid[s.slidesGrid.length - 2];
                    }
                }
            }

            // Find current slide size
            var ratio = (currentPos - s.slidesGrid[stopIndex]) / groupSize;

            if (timeDiff > s.params.longSwipesMs) {
                // Long touches
                if (!s.params.longSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    if (ratio >= s.params.longSwipesRatio) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);

                }
                if (s.swipeDirection === 'prev') {
                    if (ratio > (1 - s.params.longSwipesRatio)) s.slideTo(stopIndex + s.params.slidesPerGroup);
                    else s.slideTo(stopIndex);
                }
            }
            else {
                // Short swipes
                if (!s.params.shortSwipes) {
                    s.slideTo(s.activeIndex);
                    return;
                }
                if (s.swipeDirection === 'next') {
                    s.slideTo(stopIndex + s.params.slidesPerGroup);

                }
                if (s.swipeDirection === 'prev') {
                    s.slideTo(stopIndex);
                }
            }
        };
        /*=========================
          Transitions
          ===========================*/
        s._slideTo = function (slideIndex, speed) {
            return s.slideTo(slideIndex, speed, true, true);
        };
        s.slideTo = function (slideIndex, speed, runCallbacks, internal) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (typeof slideIndex === 'undefined') slideIndex = 0;
            if (slideIndex < 0) slideIndex = 0;
            s.snapIndex = Math.floor(slideIndex / s.params.slidesPerGroup);
            if (s.snapIndex >= s.snapGrid.length) s.snapIndex = s.snapGrid.length - 1;

            var translate = - s.snapGrid[s.snapIndex];

            // Stop autoplay

            if (s.params.autoplay && s.autoplaying) {
                if (internal || !s.params.autoplayDisableOnInteraction) {
                    s.pauseAutoplay(speed);
                }
                else {
                    s.stopAutoplay();
                }
            }
            // Update progress
            s.updateProgress(translate);

            // Normalize slideIndex
            for (var i = 0; i < s.slidesGrid.length; i++) {
                if (- translate >= s.slidesGrid[i]) {
                    slideIndex = i;
                }
            }

            if (typeof speed === 'undefined') speed = s.params.speed;
            s.previousIndex = s.activeIndex || 0;
            s.activeIndex = slideIndex;

            if (translate === s.translate) {
                s.updateClasses();
                return false;
            }
            s.onTransitionStart(runCallbacks);
            if (speed === 0) {
                s.setWrapperTransition(0);
                s.setWrapperTranslate(translate);
                s.onTransitionEnd(runCallbacks);
            }
            else {
                s.setWrapperTransition(speed);
                s.setWrapperTranslate(translate);
                if (!s.animating) {
                    s.animating = true;
                    s.wrapper.transitionEnd(function () {
                        s.onTransitionEnd(runCallbacks);
                    });
                }

            }
            s.updateClasses();
            return true;
        };

        s.onTransitionStart = function (runCallbacks) {
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (s.lazy) s.lazy.onTransitionStart();
            if (runCallbacks) {
                s.emit('onTransitionStart', s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit('onSlideChangeStart', s);
                }
            }
        };
        s.onTransitionEnd = function (runCallbacks) {
            s.animating = false;
            s.setWrapperTransition(0);
            if (typeof runCallbacks === 'undefined') runCallbacks = true;
            if (s.lazy) s.lazy.onTransitionEnd();
            if (runCallbacks) {
                s.emit('onTransitionEnd', s);
                if (s.activeIndex !== s.previousIndex) {
                    s.emit('onSlideChangeEnd', s);
                }
            }
            if (s.params.hashnav && s.hashnav) {
                s.hashnav.setHash();
            }

        };
        s.slideNext = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex + s.params.slidesPerGroup, speed, runCallbacks, internal);
        };
        s._slideNext = function (speed) {
            return s.slideNext(true, speed, true);
        };
        s.slidePrev = function (runCallbacks, speed, internal) {
            if (s.params.loop) {
                if (s.animating) return false;
                s.fixLoop();
                return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
            }
            else return s.slideTo(s.activeIndex - 1, speed, runCallbacks, internal);
        };
        s._slidePrev = function (speed) {
            return s.slidePrev(true, speed, true);
        };
        s.slideReset = function (runCallbacks, speed) {
            return s.slideTo(s.activeIndex, speed, runCallbacks);
        };

        /*=========================
          Translate/transition helpers
          ===========================*/
        s.setWrapperTransition = function (duration, byController) {
            s.wrapper.transition(duration);
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTransition(duration);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTransition(duration);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTransition(duration);
            }
            if (s.params.control && s.controller) {
                s.controller.setTransition(duration, byController);
            }
            s.emit('onSetTransition', s, duration);
        };
        s.setWrapperTranslate = function (translate, updateActiveIndex, byController) {
            var x = 0, y = 0, z = 0;
            if (isH()) {
                x = s.rtl ? -translate : translate;
            }
            else {
                y = translate;
            }
            if (!s.params.virtualTranslate) {
                if (s.support.transforms3d) s.wrapper.transform('translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)');
                else s.wrapper.transform('translate(' + x + 'px, ' + y + 'px)');
            }

            s.translate = isH() ? x : y;

            if (updateActiveIndex) s.updateActiveIndex();
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                s.effects[s.params.effect].setTranslate(s.translate);
            }
            if (s.params.parallax && s.parallax) {
                s.parallax.setTranslate(s.translate);
            }
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.setTranslate(s.translate);
            }
            if (s.params.control && s.controller) {
                s.controller.setTranslate(s.translate, byController);
            }
            s.emit('onSetTranslate', s, s.translate);
        };

        s.getTranslate = function (el, axis) {
            var matrix, curTransform, curStyle, transformMatrix;

            // automatic axis detection
            if (typeof axis === 'undefined') {
                axis = 'x';
            }

            if (s.params.virtualTranslate) {
                return s.rtl ? -s.translate : s.translate;
            }

            curStyle = window.getComputedStyle(el, null);
            if (window.WebKitCSSMatrix) {
                // Some old versions of Webkit choke when 'none' is passed; pass
                // empty string instead in this case
                transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
            }
            else {
                transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
                matrix = transformMatrix.toString().split(',');
            }

            if (axis === 'x') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m41;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[12]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[4]);
            }
            if (axis === 'y') {
                //Latest Chrome and webkits Fix
                if (window.WebKitCSSMatrix)
                    curTransform = transformMatrix.m42;
                //Crazy IE10 Matrix
                else if (matrix.length === 16)
                    curTransform = parseFloat(matrix[13]);
                //Normal Browsers
                else
                    curTransform = parseFloat(matrix[5]);
            }
            if (s.rtl && curTransform) curTransform = -curTransform;
            return curTransform || 0;
        };
        s.getWrapperTranslate = function (axis) {
            if (typeof axis === 'undefined') {
                axis = isH() ? 'x' : 'y';
            }
            return s.getTranslate(s.wrapper[0], axis);
        };

        /*=========================
          Observer
          ===========================*/
        s.observers = [];
        function initObserver(target, options) {
            options = options || {};
            // create an observer instance
            var ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            var observer = new ObserverFunc(function (mutations) {
                mutations.forEach(function (mutation) {
                    s.onResize();
                    s.emit('onObserverUpdate', s, mutation);
                });
            });

            observer.observe(target, {
                attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
                childList: typeof options.childList === 'undefined' ? true : options.childList,
                characterData: typeof options.characterData === 'undefined' ? true : options.characterData
            });

            s.observers.push(observer);
        }
        s.initObservers = function () {
            if (s.params.observeParents) {
                var containerParents = s.container.parents();
                for (var i = 0; i < containerParents.length; i++) {
                    initObserver(containerParents[i]);
                }
            }

            // Observe container
            initObserver(s.container[0], {childList: false});

            // Observe wrapper
            initObserver(s.wrapper[0], {attributes: false});
        };
        s.disconnectObservers = function () {
            for (var i = 0; i < s.observers.length; i++) {
                s.observers[i].disconnect();
            }
            s.observers = [];
        };
        /*=========================
          Loop
          ===========================*/
        // Create looped slides
        s.createLoop = function () {
            // Remove duplicated slides
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();

            var slides = s.wrapper.children('.' + s.params.slideClass);
            s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
            s.loopedSlides = s.loopedSlides + s.params.loopAdditionalSlides;
            if (s.loopedSlides > slides.length) {
                s.loopedSlides = slides.length;
            }

            var prependSlides = [], appendSlides = [], i;
            slides.each(function (index, el) {
                var slide = $(this);
                if (index < s.loopedSlides) appendSlides.push(el);
                if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
                slide.attr('data-swiper-slide-index', index);
            });
            for (i = 0; i < appendSlides.length; i++) {
                s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
            for (i = prependSlides.length - 1; i >= 0; i--) {
                s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass(s.params.slideDuplicateClass));
            }
        };
        s.destroyLoop = function () {
            s.wrapper.children('.' + s.params.slideClass + '.' + s.params.slideDuplicateClass).remove();
            s.slides.removeAttr('data-swiper-slide-index');
        };
        s.fixLoop = function () {
            var newIndex;
            //Fix For Negative Oversliding
            if (s.activeIndex < s.loopedSlides) {
                newIndex = s.slides.length - s.loopedSlides * 3 + s.activeIndex;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
            //Fix For Positive Oversliding
            else if ((s.params.slidesPerView === 'auto' && s.activeIndex >= s.loopedSlides * 2) || (s.activeIndex > s.slides.length - s.params.slidesPerView * 2)) {
                newIndex = -s.slides.length + s.activeIndex + s.loopedSlides;
                newIndex = newIndex + s.loopedSlides;
                s.slideTo(newIndex, 0, false, true);
            }
        };
        /*=========================
          Append/Prepend/Remove Slides
          ===========================*/
        s.appendSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.append(slides[i]);
                }
            }
            else {
                s.wrapper.append(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
        };
        s.prependSlide = function (slides) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex + 1;
            if (typeof slides === 'object' && slides.length) {
                for (var i = 0; i < slides.length; i++) {
                    if (slides[i]) s.wrapper.prepend(slides[i]);
                }
                newActiveIndex = s.activeIndex + slides.length;
            }
            else {
                s.wrapper.prepend(slides);
            }
            if (s.params.loop) {
                s.createLoop();
            }
            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeSlide = function (slidesIndexes) {
            if (s.params.loop) {
                s.destroyLoop();
            }
            var newActiveIndex = s.activeIndex,
                indexToRemove;
            if (typeof slidesIndexes === 'object' && slidesIndexes.length) {
                for (var i = 0; i < slidesIndexes.length; i++) {
                    indexToRemove = slidesIndexes[i];
                    if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                    if (indexToRemove < newActiveIndex) newActiveIndex--;
                }
                newActiveIndex = Math.max(newActiveIndex, 0);
            }
            else {
                indexToRemove = slidesIndexes;
                if (s.slides[indexToRemove]) s.slides.eq(indexToRemove).remove();
                if (indexToRemove < newActiveIndex) newActiveIndex--;
                newActiveIndex = Math.max(newActiveIndex, 0);
            }

            if (!(s.params.observer && s.support.observer)) {
                s.update(true);
            }
            s.slideTo(newActiveIndex, 0, false);
        };
        s.removeAllSlides = function () {
            var slidesIndexes = [];
            for (var i = 0; i < s.slides.length; i++) {
                slidesIndexes.push(i);
            }
            s.removeSlide(slidesIndexes);
        };


        /*=========================
          Effects
          ===========================*/
        s.effects = {
            fade: {
                fadeIndex: null,
                setTranslate: function () {
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var offset = slide[0].swiperSlideOffset;
                        var tx = -offset;
                        if (!s.params.virtualTranslate) tx = tx - s.translate;
                        var ty = 0;
                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }
                        var slideOpacity = s.params.fade.crossFade ?
                                Math.max(1 - Math.abs(slide[0].progress), 0) :
                                1 + Math.min(Math.max(slide[0].progress, -1), 0);
                        if (slideOpacity > 0 && slideOpacity < 1) {
                            s.effects.fade.fadeIndex = i;
                        }
                        slide
                            .css({
                                opacity: slideOpacity
                            })
                            .transform('translate3d(' + tx + 'px, ' + ty + 'px, 0px)');

                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration);
                    if (s.params.virtualTranslate && duration !== 0) {
                        var fadeIndex = s.effects.fade.fadeIndex !== null ? s.effects.fade.fadeIndex : s.activeIndex;
                        s.slides.eq(fadeIndex).transitionEnd(function () {
                            var triggerEvents = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'];
                            for (var i = 0; i < triggerEvents.length; i++) {
                                s.wrapper.trigger(triggerEvents[i]);
                            }
                        });
                    }
                }
            },
            cube: {
                setTranslate: function () {
                    var wrapperRotate = 0, cubeShadow;
                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow = s.wrapper.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.wrapper.append(cubeShadow);
                            }
                            cubeShadow.css({height: s.width + 'px'});
                        }
                        else {
                            cubeShadow = s.container.find('.swiper-cube-shadow');
                            if (cubeShadow.length === 0) {
                                cubeShadow = $('<div class="swiper-cube-shadow"></div>');
                                s.container.append(cubeShadow);
                            }
                        }
                    }
                    for (var i = 0; i < s.slides.length; i++) {
                        var slide = s.slides.eq(i);
                        var slideAngle = i * 90;
                        var round = Math.floor(slideAngle / 360);
                        if (s.rtl) {
                            slideAngle = -slideAngle;
                            round = Math.floor(-slideAngle / 360);
                        }
                        var progress = Math.max(Math.min(slide[0].progress, 1), -1);
                        var tx = 0, ty = 0, tz = 0;
                        if (i % 4 === 0) {
                            tx = - round * 4 * s.size;
                            tz = 0;
                        }
                        else if ((i - 1) % 4 === 0) {
                            tx = 0;
                            tz = - round * 4 * s.size;
                        }
                        else if ((i - 2) % 4 === 0) {
                            tx = s.size + round * 4 * s.size;
                            tz = s.size;
                        }
                        else if ((i - 3) % 4 === 0) {
                            tx = - s.size;
                            tz = 3 * s.size + s.size * 4 * round;
                        }
                        if (s.rtl) {
                            tx = -tx;
                        }

                        if (!isH()) {
                            ty = tx;
                            tx = 0;
                        }

                        var transform = 'rotateX(' + (isH() ? 0 : -slideAngle) + 'deg) rotateY(' + (isH() ? slideAngle : 0) + 'deg) translate3d(' + tx + 'px, ' + ty + 'px, ' + tz + 'px)';
                        if (progress <= 1 && progress > -1) {
                            wrapperRotate = i * 90 + progress * 90;
                            if (s.rtl) wrapperRotate = -i * 90 - progress * 90;
                        }
                        slide.transform(transform);
                        if (s.params.cube.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length) shadowBefore[0].style.opacity = -slide[0].progress;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = slide[0].progress;
                        }
                    }
                    s.wrapper.css({
                        '-webkit-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-moz-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        '-ms-transform-origin': '50% 50% -' + (s.size / 2) + 'px',
                        'transform-origin': '50% 50% -' + (s.size / 2) + 'px'
                    });

                    if (s.params.cube.shadow) {
                        if (isH()) {
                            cubeShadow.transform('translate3d(0px, ' + (s.width / 2 + s.params.cube.shadowOffset) + 'px, ' + (-s.width / 2) + 'px) rotateX(90deg) rotateZ(0deg) scale(' + (s.params.cube.shadowScale) + ')');
                        }
                        else {
                            var shadowAngle = Math.abs(wrapperRotate) - Math.floor(Math.abs(wrapperRotate) / 90) * 90;
                            var multiplier = 1.5 - (Math.sin(shadowAngle * 2 * Math.PI / 360) / 2 + Math.cos(shadowAngle * 2 * Math.PI / 360) / 2);
                            var scale1 = s.params.cube.shadowScale,
                                scale2 = s.params.cube.shadowScale / multiplier,
                                offset = s.params.cube.shadowOffset;
                            cubeShadow.transform('scale3d(' + scale1 + ', 1, ' + scale2 + ') translate3d(0px, ' + (s.height / 2 + offset) + 'px, ' + (-s.height / 2 / scale2) + 'px) rotateX(-90deg)');
                        }
                    }
                    var zFactor = (s.isSafari || s.isUiWebView) ? (-s.size / 2) : 0;
                    s.wrapper.transform('translate3d(0px,0,' + zFactor + 'px) rotateX(' + (isH() ? 0 : wrapperRotate) + 'deg) rotateY(' + (isH() ? -wrapperRotate : 0) + 'deg)');
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                    if (s.params.cube.shadow && !isH()) {
                        s.container.find('.swiper-cube-shadow').transition(duration);
                    }
                }
            },
            coverflow: {
                setTranslate: function () {
                    var transform = s.translate;
                    var center = isH() ? -transform + s.width / 2 : -transform + s.height / 2;
                    var rotate = isH() ? s.params.coverflow.rotate: -s.params.coverflow.rotate;
                    var translate = s.params.coverflow.depth;
                    //Each slide offset from center
                    for (var i = 0, length = s.slides.length; i < length; i++) {
                        var slide = s.slides.eq(i);
                        var slideSize = s.slidesSizesGrid[i];
                        var slideOffset = slide[0].swiperSlideOffset;
                        var offsetMultiplier = (center - slideOffset - slideSize / 2) / slideSize * s.params.coverflow.modifier;

                        var rotateY = isH() ? rotate * offsetMultiplier : 0;
                        var rotateX = isH() ? 0 : rotate * offsetMultiplier;
                        // var rotateZ = 0
                        var translateZ = -translate * Math.abs(offsetMultiplier);

                        var translateY = isH() ? 0 : s.params.coverflow.stretch * (offsetMultiplier);
                        var translateX = isH() ? s.params.coverflow.stretch * (offsetMultiplier) : 0;

                        //Fix for ultra small values
                        if (Math.abs(translateX) < 0.001) translateX = 0;
                        if (Math.abs(translateY) < 0.001) translateY = 0;
                        if (Math.abs(translateZ) < 0.001) translateZ = 0;
                        if (Math.abs(rotateY) < 0.001) rotateY = 0;
                        if (Math.abs(rotateX) < 0.001) rotateX = 0;

                        var slideTransform = 'translate3d(' + translateX + 'px,' + translateY + 'px,' + translateZ + 'px)  rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';

                        slide.transform(slideTransform);
                        slide[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                        if (s.params.coverflow.slideShadows) {
                            //Set shadows
                            var shadowBefore = isH() ? slide.find('.swiper-slide-shadow-left') : slide.find('.swiper-slide-shadow-top');
                            var shadowAfter = isH() ? slide.find('.swiper-slide-shadow-right') : slide.find('.swiper-slide-shadow-bottom');
                            if (shadowBefore.length === 0) {
                                shadowBefore = $('<div class="swiper-slide-shadow-' + (isH() ? 'left' : 'top') + '"></div>');
                                slide.append(shadowBefore);
                            }
                            if (shadowAfter.length === 0) {
                                shadowAfter = $('<div class="swiper-slide-shadow-' + (isH() ? 'right' : 'bottom') + '"></div>');
                                slide.append(shadowAfter);
                            }
                            if (shadowBefore.length) shadowBefore[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                            if (shadowAfter.length) shadowAfter[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
                        }
                    }

                    //Set correct perspective for IE10
                    if (s.browser.ie) {
                        var ws = s.wrapper[0].style;
                        ws.perspectiveOrigin = center + 'px 50%';
                    }
                },
                setTransition: function (duration) {
                    s.slides.transition(duration).find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').transition(duration);
                }
            }
        };

        /*=========================
          Images Lazy Loading
          ===========================*/
        s.lazy = {
            initialImageLoaded: false,
            loadImageInSlide: function (index) {
                if (typeof index === 'undefined') return;
                if (s.slides.length === 0) return;

                var slide = s.slides.eq(index);
                var img = slide.find('img.swiper-lazy:not(.swiper-lazy-loaded):not(.swiper-lazy-loading)');
                if (img.length === 0) return;

                img.each(function () {
                    var _img = $(this);
                    _img.addClass('swiper-lazy-loading');

                    var src = _img.attr('data-src');

                    s.loadImage(_img[0], src, false, function () {
                        _img.attr('src', src);
                        _img.removeAttr('data-src');
                        _img.addClass('swiper-lazy-loaded').removeClass('swiper-lazy-loading');
                        slide.find('.swiper-lazy-preloader, .preloader').remove();

                        s.emit('onLazyImageReady', s, slide[0], _img[0]);
                    });

                    s.emit('onLazyImageLoad', s, slide[0], _img[0]);
                });

            },
            load: function () {
                if (s.params.watchSlidesVisibility) {
                    s.wrapper.children('.' + s.params.slideVisibleClass).each(function () {
                        s.lazy.loadImageInSlide($(this).index());
                    });
                }
                else {
                    if (s.params.slidesPerView > 1) {
                        for (var i = s.activeIndex; i < s.activeIndex + s.params.slidesPerView ; i++) {
                            if (s.slides[i]) s.lazy.loadImageInSlide(i);
                        }
                    }
                    else {
                        s.lazy.loadImageInSlide(s.activeIndex);
                    }
                }
                if (s.params.lazyLoadingInPrevNext) {
                    var nextSlide = s.wrapper.children('.' + s.params.slideNextClass);
                    if (nextSlide.length > 0) s.lazy.loadImageInSlide(nextSlide.index());

                    var prevSlide = s.wrapper.children('.' + s.params.slidePrevClass);
                    if (prevSlide.length > 0) s.lazy.loadImageInSlide(prevSlide.index());
                }
            },
            onTransitionStart: function () {
                if (s.params.lazyLoading) {
                    if (s.params.lazyLoadingOnTransitionStart || (!s.params.lazyLoadingOnTransitionStart && !s.lazy.initialImageLoaded)) {
                        s.lazy.initialImageLoaded = true;
                        s.lazy.load();
                    }
                }
            },
            onTransitionEnd: function () {
                if (s.params.lazyLoading && !s.params.lazyLoadingOnTransitionStart) {
                    s.lazy.load();
                }
            }
        };


        /*=========================
          Scrollbar
          ===========================*/
        s.scrollbar = {
            set: function () {
                if (!s.params.scrollbar) return;
                var sb = s.scrollbar;
                sb.track = $(s.params.scrollbar);
                sb.drag = sb.track.find('.swiper-scrollbar-drag');
                if (sb.drag.length === 0) {
                    sb.drag = $('<div class="swiper-scrollbar-drag"></div>');
                    sb.track.append(sb.drag);
                }
                sb.drag[0].style.width = '';
                sb.drag[0].style.height = '';
                sb.trackSize = isH() ? sb.track[0].offsetWidth : sb.track[0].offsetHeight;

                sb.divider = s.size / s.virtualSize;
                sb.moveDivider = sb.divider * (sb.trackSize / s.size);
                sb.dragSize = sb.trackSize * sb.divider;

                if (isH()) {
                    sb.drag[0].style.width = sb.dragSize + 'px';
                }
                else {
                    sb.drag[0].style.height = sb.dragSize + 'px';
                }

                if (sb.divider >= 1) {
                    sb.track[0].style.display = 'none';
                }
                else {
                    sb.track[0].style.display = '';
                }
                if (s.params.scrollbarHide) {
                    sb.track[0].style.opacity = 0;
                }
            },
            setTranslate: function () {
                if (!s.params.scrollbar) return;
                var sb = s.scrollbar;
                var newPos;

                var newSize = sb.dragSize;
                newPos = (sb.trackSize - sb.dragSize) * s.progress;
                if (s.rtl && isH()) {
                    newPos = -newPos;
                    if (newPos > 0) {
                        newSize = sb.dragSize - newPos;
                        newPos = 0;
                    }
                    else if (-newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize + newPos;
                    }
                }
                else {
                    if (newPos < 0) {
                        newSize = sb.dragSize + newPos;
                        newPos = 0;
                    }
                    else if (newPos + sb.dragSize > sb.trackSize) {
                        newSize = sb.trackSize - newPos;
                    }
                }
                if (isH()) {
                    if (s.support.transforms3d) {
                        sb.drag.transform('translate3d(' + (newPos) + 'px, 0, 0)');
                    }
                    else {
                        sb.drag.transform('translateX(' + (newPos) + 'px)');
                    }
                    sb.drag[0].style.width = newSize + 'px';
                }
                else {
                    if (s.support.transforms3d) {
                        sb.drag.transform('translate3d(0px, ' + (newPos) + 'px, 0)');
                    }
                    else {
                        sb.drag.transform('translateY(' + (newPos) + 'px)');
                    }
                    sb.drag[0].style.height = newSize + 'px';
                }
                if (s.params.scrollbarHide) {
                    clearTimeout(sb.timeout);
                    sb.track[0].style.opacity = 1;
                    sb.timeout = setTimeout(function () {
                        sb.track[0].style.opacity = 0;
                        sb.track.transition(400);
                    }, 1000);
                }
            },
            setTransition: function (duration) {
                if (!s.params.scrollbar) return;
                s.scrollbar.drag.transition(duration);
            }
        };

        /*=========================
          Controller
          ===========================*/
        s.controller = {
            setTranslate: function (translate, byController) {
                var controlled = s.params.control;
                var multiplier, controlledTranslate;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            translate = controlled[i].rtl && controlled[i].params.direction === 'horizontal' ? -s.translate : s.translate;
                            multiplier = (controlled[i].maxTranslate() - controlled[i].minTranslate()) / (s.maxTranslate() - s.minTranslate());
                            controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled[i].minTranslate();
                            if (s.params.controlInverse) {
                                controlledTranslate = controlled[i].maxTranslate() - controlledTranslate;
                            }
                            controlled[i].updateProgress(controlledTranslate);
                            controlled[i].setWrapperTranslate(controlledTranslate, false, s);
                            controlled[i].updateActiveIndex();
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    translate = controlled.rtl && controlled.params.direction === 'horizontal' ? -s.translate : s.translate;
                    multiplier = (controlled.maxTranslate() - controlled.minTranslate()) / (s.maxTranslate() - s.minTranslate());
                    controlledTranslate = (translate - s.minTranslate()) * multiplier + controlled.minTranslate();
                    if (s.params.controlInverse) {
                        controlledTranslate = controlled.maxTranslate() - controlledTranslate;
                    }
                    controlled.updateProgress(controlledTranslate);
                    controlled.setWrapperTranslate(controlledTranslate, false, s);
                    controlled.updateActiveIndex();
                }
            },
            setTransition: function (duration, byController) {
                var controlled = s.params.control;
                if (s.isArray(controlled)) {
                    for (var i = 0; i < controlled.length; i++) {
                        if (controlled[i] !== byController && controlled[i] instanceof Swiper) {
                            controlled[i].setWrapperTransition(duration, s);
                        }
                    }
                }
                else if (controlled instanceof Swiper && byController !== controlled) {
                    controlled.setWrapperTransition(duration, s);
                }
            }
        };

        /*=========================
          Parallax
          ===========================*/
        function setParallaxTransform(el, progress) {
            el = $(el);
            var p, pX, pY;

            p = el.attr('data-swiper-parallax') || '0';
            pX = el.attr('data-swiper-parallax-x');
            pY = el.attr('data-swiper-parallax-y');
            if (pX || pY) {
                pX = pX || '0';
                pY = pY || '0';
            }
            else {
                if (isH()) {
                    pX = p;
                    pY = '0';
                }
                else {
                    pY = p;
                    pX = '0';
                }
            }
            if ((pX).indexOf('%') >= 0) {
                pX = parseInt(pX, 10) * progress + '%';
            }
            else {
                pX = pX * progress + 'px' ;
            }
            if ((pY).indexOf('%') >= 0) {
                pY = parseInt(pY, 10) * progress + '%';
            }
            else {
                pY = pY * progress + 'px' ;
            }
            el.transform('translate3d(' + pX + ', ' + pY + ',0px)');
        }
        s.parallax = {
            setTranslate: function () {
                s.container.children('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    setParallaxTransform(this, s.progress);

                });
                s.slides.each(function () {
                    var slide = $(this);
                    slide.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function () {
                        var progress = Math.min(Math.max(slide[0].progress, -1), 1);
                        setParallaxTransform(this, progress);
                    });
                });
            },
            setTransition: function (duration) {
                if (typeof duration === 'undefined') duration = s.params.speed;
                s.container.find('[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]').each(function(){
                    var el = $(this);
                    var parallaxDuration = parseInt(el.attr('data-swiper-parallax-duration'), 10) || duration;
                    if (duration === 0) parallaxDuration = 0;
                    el.transition(parallaxDuration);
                });
            }
        };


        /*=========================
          Plugins API. Collect all and init all plugins
          ===========================*/
        s._plugins = [];
        for (var plugin in s.plugins) {
            if(s.plugins.hasOwnProperty(plugin)){
                var p = s.plugins[plugin](s, s.params[plugin]);
                if (p) s._plugins.push(p);
            }
        }
        // Method to call all plugins event/method
        s.callPlugins = function (eventName) {
            for (var i = 0; i < s._plugins.length; i++) {
                if (eventName in s._plugins[i]) {
                    s._plugins[i][eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
        };

        /*=========================
          Events/Callbacks/Plugins Emitter
          ===========================*/
        function normalizeEventName (eventName) {
            if (eventName.indexOf('on') !== 0) {
                if (eventName[0] !== eventName[0].toUpperCase()) {
                    eventName = 'on' + eventName[0].toUpperCase() + eventName.substring(1);
                }
                else {
                    eventName = 'on' + eventName;
                }
            }
            return eventName;
        }
        s.emitterEventListeners = {

        };
        s.emit = function (eventName) {
            // Trigger callbacks
            if (s.params[eventName]) {
                s.params[eventName](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
            }
            var i;
            // 图片浏览器点击关闭后，swiper也关闭了，但会执行到此处
            if (!s) return;
            // Trigger events
            if (s.emitterEventListeners[eventName]) {
                for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                    s.emitterEventListeners[eventName][i](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
            // Trigger plugins
            if (s.callPlugins) s.callPlugins(eventName, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        };
        s.on = function (eventName, handler) {
            eventName = normalizeEventName(eventName);
            if (!s.emitterEventListeners[eventName]) s.emitterEventListeners[eventName] = [];
            s.emitterEventListeners[eventName].push(handler);
            return s;
        };
        s.off = function (eventName, handler) {
            var i;
            eventName = normalizeEventName(eventName);
            if (typeof handler === 'undefined') {
                // Remove all handlers for such event
                s.emitterEventListeners[eventName] = [];
                return s;
            }
            if (!s.emitterEventListeners[eventName] || s.emitterEventListeners[eventName].length === 0) return;
            for (i = 0; i < s.emitterEventListeners[eventName].length; i++) {
                if(s.emitterEventListeners[eventName][i] === handler) s.emitterEventListeners[eventName].splice(i, 1);
            }
            return s;
        };
        s.once = function (eventName, handler) {
            eventName = normalizeEventName(eventName);
            var _handler = function () {
                handler(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                s.off(eventName, _handler);
            };
            s.on(eventName, _handler);
            return s;
        };

        // Accessibility tools
        s.a11y = {
            makeFocusable: function ($el) {
                $el[0].tabIndex = '0';
                return $el;
            },
            addRole: function ($el, role) {
                $el.attr('role', role);
                return $el;
            },

            addLabel: function ($el, label) {
                $el.attr('aria-label', label);
                return $el;
            },

            disable: function ($el) {
                $el.attr('aria-disabled', true);
                return $el;
            },

            enable: function ($el) {
                $el.attr('aria-disabled', false);
                return $el;
            },

            onEnterKey: function (event) {
                if (event.keyCode !== 13) return;
                if ($(event.target).is(s.params.nextButton)) {
                    s.onClickNext(event);
                    if (s.isEnd) {
                        s.a11y.notify(s.params.lastSlideMsg);
                    }
                    else {
                        s.a11y.notify(s.params.nextSlideMsg);
                    }
                }
                else if ($(event.target).is(s.params.prevButton)) {
                    s.onClickPrev(event);
                    if (s.isBeginning) {
                        s.a11y.notify(s.params.firstSlideMsg);
                    }
                    else {
                        s.a11y.notify(s.params.prevSlideMsg);
                    }
                }
            },

            liveRegion: $('<span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>'),

            notify: function (message) {
                var notification = s.a11y.liveRegion;
                if (notification.length === 0) return;
                notification.html('');
                notification.html(message);
            },
            init: function () {
                // Setup accessibility
                if (s.params.nextButton) {
                    var nextButton = $(s.params.nextButton);
                    s.a11y.makeFocusable(nextButton);
                    s.a11y.addRole(nextButton, 'button');
                    s.a11y.addLabel(nextButton, s.params.nextSlideMsg);
                }
                if (s.params.prevButton) {
                    var prevButton = $(s.params.prevButton);
                    s.a11y.makeFocusable(prevButton);
                    s.a11y.addRole(prevButton, 'button');
                    s.a11y.addLabel(prevButton, s.params.prevSlideMsg);
                }

                $(s.container).append(s.a11y.liveRegion);
            },
            destroy: function () {
                if (s.a11y.liveRegion && s.a11y.liveRegion.length > 0) s.a11y.liveRegion.remove();
            }
        };


        /*=========================
          Init/Destroy
          ===========================*/
        s.init = function () {
            if (s.params.loop) s.createLoop();
            s.updateContainerSize();
            s.updateSlidesSize();
            s.updatePagination();
            if (s.params.scrollbar && s.scrollbar) {
                s.scrollbar.set();
            }
            if (s.params.effect !== 'slide' && s.effects[s.params.effect]) {
                if (!s.params.loop) s.updateProgress();
                s.effects[s.params.effect].setTranslate();
            }
            if (s.params.loop) {
                s.slideTo(s.params.initialSlide + s.loopedSlides, 0, s.params.runCallbacksOnInit);
            }
            else {
                s.slideTo(s.params.initialSlide, 0, s.params.runCallbacksOnInit);
                if (s.params.initialSlide === 0) {
                    if (s.parallax && s.params.parallax) s.parallax.setTranslate();
                    if (s.lazy && s.params.lazyLoading) s.lazy.load();
                }
            }
            s.attachEvents();
            if (s.params.observer && s.support.observer) {
                s.initObservers();
            }
            if (s.params.preloadImages && !s.params.lazyLoading) {
                s.preloadImages();
            }
            if (s.params.autoplay) {
                s.startAutoplay();
            }
            if (s.params.keyboardControl) {
                if (s.enableKeyboardControl) s.enableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.enableMousewheelControl) s.enableMousewheelControl();
            }
            if (s.params.hashnav) {
                if (s.hashnav) s.hashnav.init();
            }
            if (s.params.a11y && s.a11y) s.a11y.init();
            s.emit('onInit', s);
        };

        // Cleanup dynamic styles
        s.cleanupStyles = function () {
            // Container
            s.container.removeClass(s.classNames.join(' ')).removeAttr('style');

            // Wrapper
            s.wrapper.removeAttr('style');

            // Slides
            if (s.slides && s.slides.length) {
                s.slides
                    .removeClass([
                      s.params.slideVisibleClass,
                      s.params.slideActiveClass,
                      s.params.slideNextClass,
                      s.params.slidePrevClass
                    ].join(' '))
                    .removeAttr('style')
                    .removeAttr('data-swiper-column')
                    .removeAttr('data-swiper-row');
            }

            // Pagination/Bullets
            if (s.paginationContainer && s.paginationContainer.length) {
                s.paginationContainer.removeClass(s.params.paginationHiddenClass);
            }
            if (s.bullets && s.bullets.length) {
                s.bullets.removeClass(s.params.bulletActiveClass);
            }

            // Buttons
            if (s.params.prevButton) $(s.params.prevButton).removeClass(s.params.buttonDisabledClass);
            if (s.params.nextButton) $(s.params.nextButton).removeClass(s.params.buttonDisabledClass);

            // Scrollbar
            if (s.params.scrollbar && s.scrollbar) {
                if (s.scrollbar.track && s.scrollbar.track.length) s.scrollbar.track.removeAttr('style');
                if (s.scrollbar.drag && s.scrollbar.drag.length) s.scrollbar.drag.removeAttr('style');
            }
        };

        // Destroy
        s.destroy = function (deleteInstance, cleanupStyles) {
            // Detach evebts
            s.detachEvents();
            // Stop autoplay
            s.stopAutoplay();
            // Destroy loop
            if (s.params.loop) {
                s.destroyLoop();
            }
            // Cleanup styles
            if (cleanupStyles) {
                s.cleanupStyles();
            }
            // Disconnect observer
            s.disconnectObservers();
            // Disable keyboard/mousewheel
            if (s.params.keyboardControl) {
                if (s.disableKeyboardControl) s.disableKeyboardControl();
            }
            if (s.params.mousewheelControl) {
                if (s.disableMousewheelControl) s.disableMousewheelControl();
            }
            // Disable a11y
            if (s.params.a11y && s.a11y) s.a11y.destroy();
            // Destroy callback
            s.emit('onDestroy');
            // Delete instance
            if (deleteInstance !== false) s = null;
        };

        s.init();



        // Return swiper instance
        return s;
    };
    /*==================================================
        Prototype
    ====================================================*/
    Swiper.prototype = {
        defaults: {
            direction: 'horizontal',
            touchEventsTarget: 'container',
            initialSlide: 0,
            speed: 300,
            // autoplay
            autoplay: false,
            autoplayDisableOnInteraction: true,
            // Free mode
            freeMode: false,
            freeModeMomentum: true,
            freeModeMomentumRatio: 1,
            freeModeMomentumBounce: true,
            freeModeMomentumBounceRatio: 1,
            // Set wrapper width
            setWrapperSize: false,
            // Virtual Translate
            virtualTranslate: false,
            // Effects
            effect: 'slide', // 'slide' or 'fade' or 'cube' or 'coverflow'
            coverflow: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows : true
            },
            cube: {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94
            },
            fade: {
                crossFade: false
            },
            // Parallax
            parallax: false,
            // Scrollbar
            scrollbar: null,
            scrollbarHide: true,
            // Keyboard Mousewheel
            keyboardControl: false,
            mousewheelControl: false,
            mousewheelForceToAxis: false,
            // Hash Navigation
            hashnav: false,
            // Slides grid
            spaceBetween: 0,
            slidesPerView: 1,
            slidesPerColumn: 1,
            slidesPerColumnFill: 'column',
            slidesPerGroup: 1,
            centeredSlides: false,
            // Touches
            touchRatio: 1,
            touchAngle: 45,
            simulateTouch: true,
            shortSwipes: true,
            longSwipes: true,
            longSwipesRatio: 0.5,
            longSwipesMs: 300,
            followFinger: true,
            onlyExternal: false,
            threshold: 0,
            touchMoveStopPropagation: true,
            // Pagination
            pagination: null,
            paginationClickable: false,
            paginationHide: false,
            paginationBulletRender: null,
            // Resistance
            resistance: true,
            resistanceRatio: 0.85,
            // Next/prev buttons
            nextButton: null,
            prevButton: null,
            // Progress
            watchSlidesProgress: false,
            watchSlidesVisibility: false,
            // Cursor
            grabCursor: false,
            // Clicks
            preventClicks: true,
            preventClicksPropagation: true,
            slideToClickedSlide: false,
            // Lazy Loading
            lazyLoading: false,
            lazyLoadingInPrevNext: false,
            lazyLoadingOnTransitionStart: false,
            // Images
            preloadImages: true,
            updateOnImagesReady: true,
            // loop
            loop: false,
            loopAdditionalSlides: 0,
            loopedSlides: null,
            // Control
            control: undefined,
            controlInverse: false,
            // Swiping/no swiping
            allowSwipeToPrev: true,
            allowSwipeToNext: true,
            swipeHandler: null, //'.swipe-handler',
            noSwiping: true,
            noSwipingClass: 'swiper-no-swiping',
            // NS
            slideClass: 'swiper-slide',
            slideActiveClass: 'swiper-slide-active',
            slideVisibleClass: 'swiper-slide-visible',
            slideDuplicateClass: 'swiper-slide-duplicate',
            slideNextClass: 'swiper-slide-next',
            slidePrevClass: 'swiper-slide-prev',
            wrapperClass: 'swiper-wrapper',
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
            buttonDisabledClass: 'swiper-button-disabled',
            paginationHiddenClass: 'swiper-pagination-hidden',
            // Observer
            observer: false,
            observeParents: false,
            // Accessibility
            a11y: false,
            prevSlideMessage: 'Previous slide',
            nextSlideMessage: 'Next slide',
            firstSlideMessage: 'This is the first slide',
            lastSlideMessage: 'This is the last slide',
            // Callbacks
            runCallbacksOnInit: true,
            /*
            Callbacks:
            onInit: function (swiper)
            onDestroy: function (swiper)
            onClick: function (swiper, e)
            onTap: function (swiper, e)
            onDoubleTap: function (swiper, e)
            onSliderMove: function (swiper, e)
            onSlideChangeStart: function (swiper)
            onSlideChangeEnd: function (swiper)
            onTransitionStart: function (swiper)
            onTransitionEnd: function (swiper)
            onImagesReady: function (swiper)
            onProgress: function (swiper, progress)
            onTouchStart: function (swiper, e)
            onTouchMove: function (swiper, e)
            onTouchMoveOpposite: function (swiper, e)
            onTouchEnd: function (swiper, e)
            onReachBeginning: function (swiper)
            onReachEnd: function (swiper)
            onSetTransition: function (swiper, duration)
            onSetTranslate: function (swiper, translate)
            onAutoplayStart: function (swiper)
            onAutoplayStop: function (swiper),
            onLazyImageLoad: function (swiper, slide, image)
            onLazyImageReady: function (swiper, slide, image)
            */

        },
        isSafari: (function () {
            var ua = navigator.userAgent.toLowerCase();
            return (ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0);
        })(),
        isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),
        isArray: function (arr) {
            return Object.prototype.toString.apply(arr) === '[object Array]';
        },
        /*==================================================
        Browser
        ====================================================*/
        browser: {
            ie: window.navigator.pointerEnabled || window.navigator.msPointerEnabled,
            ieTouch: (window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 1) || (window.navigator.pointerEnabled && window.navigator.maxTouchPoints > 1),
        },
        /*==================================================
        Devices
        ====================================================*/
        device: (function () {
            var ua = navigator.userAgent;
            var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
            var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
            var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
            return {
                ios: ipad || iphone || ipad,
                android: android
            };
        })(),
        /*==================================================
        Feature Detection
        ====================================================*/
        support: {
            touch : (window.Modernizr && Modernizr.touch === true) || (function () {
                return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
            })(),

            transforms3d : (window.Modernizr && Modernizr.csstransforms3d === true) || (function () {
                var div = document.createElement('div').style;
                return ('webkitPerspective' in div || 'MozPerspective' in div || 'OPerspective' in div || 'MsPerspective' in div || 'perspective' in div);
            })(),

            flexbox: (function () {
                var div = document.createElement('div').style;
                var styles = ('alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient').split(' ');
                for (var i = 0; i < styles.length; i++) {
                    if (styles[i] in div) return true;
                }
            })(),

            observer: (function () {
                return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
            })()
        },
        /*==================================================
        Plugins
        ====================================================*/
        plugins: {}
    };
    $.Swiper = Swiper;
}(Zepto);

+function($){
    'use strict';
    $.Swiper.prototype.defaults.pagination = '.page-current .swiper-pagination';

    $.swiper = function (container, params) {
        return new $.Swiper(container, params);
    };
    $.fn.swiper = function (params) {
        return new $.Swiper(this, params);
    };
    $.initSwiper = function (pageContainer) {
        var page = $(pageContainer || document.body);
        var swipers = page.find('.swiper-container');
        if (swipers.length === 0) return;
        function destroySwiperOnRemove(slider) {
            function destroySwiper() {
                slider.destroy();
                page.off('pageBeforeRemove', destroySwiper);
            }
            page.on('pageBeforeRemove', destroySwiper);
        }
        for (var i = 0; i < swipers.length; i++) {
            var swiper = swipers.eq(i);
            var params;
            if (swiper.data('swiper')) {
                swiper.data("swiper").update(true);
                continue;
            }
            else {
                params = swiper.dataset();
            }
            var _slider = $.swiper(swiper[0], params);
            destroySwiperOnRemove(_slider);
        }
    };
    $.reinitSwiper = function (pageContainer) {
        var page = $(pageContainer || '.page-current');
        var sliders = page.find('.swiper-container');
        if (sliders.length === 0) return;
        for (var i = 0; i < sliders.length; i++) {
            var sliderInstance = sliders[0].swiper;
            if (sliderInstance) {
                sliderInstance.update(true);
            }
        }
    };

}(Zepto);

/*======================================================
************   Photo Browser   ************
======================================================*/
+function($){
    'use strict';
    var PhotoBrowser = function (params) {

        var pb = this, i;

        var defaults = this.defaults;

        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
        }

        pb.params = params;

        var navbarTemplate = pb.params.navbarTemplate ||
                            '<header class="bar bar-nav">' +
                              '<a class="icon icon-left pull-left photo-browser-close-link' + (pb.params.type === 'popup' ?  " close-popup" : "") + '"></a>' +
                              '<h1 class="title"><div class="center sliding"><span class="photo-browser-current"></span> <span class="photo-browser-of">' + pb.params.ofText + '</span> <span class="photo-browser-total"></span></div></h1>' +
                            '</header>';

        var toolbarTemplate = pb.params.toolbarTemplate ||
                            '<nav class="bar bar-tab">' +
                              '<a class="tab-item photo-browser-prev" href="#">' +
                                '<i class="icon icon-prev"></i>' +
                              '</a>' +
                              '<a class="tab-item photo-browser-next" href="#">' +
                                '<i class="icon icon-next"></i>' +
                              '</a>' +
                            '</nav>';

        var template = pb.params.template ||
                        '<div class="photo-browser photo-browser-' + pb.params.theme + '">' +
                            '{{navbar}}' +
                            '{{toolbar}}' +
                            '<div data-page="photo-browser-slides" class="content">' +
                                '{{captions}}' +
                                '<div class="photo-browser-swiper-container swiper-container">' +
                                    '<div class="photo-browser-swiper-wrapper swiper-wrapper">' +
                                        '{{photos}}' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';

        var photoTemplate = !pb.params.lazyLoading ?
            (pb.params.photoTemplate || '<div class="photo-browser-slide swiper-slide"><span class="photo-browser-zoom-container"><img src="{{url}}"></span></div>') :
            (pb.params.photoLazyTemplate || '<div class="photo-browser-slide photo-browser-slide-lazy swiper-slide"><div class="preloader' + (pb.params.theme === 'dark' ? ' preloader-white' : '') + '"></div><span class="photo-browser-zoom-container"><img data-src="{{url}}" class="swiper-lazy"></span></div>');

        var captionsTheme = pb.params.captionsTheme || pb.params.theme;
        var captionsTemplate = pb.params.captionsTemplate || '<div class="photo-browser-captions photo-browser-captions-' + captionsTheme + '">{{captions}}</div>';
        var captionTemplate = pb.params.captionTemplate || '<div class="photo-browser-caption" data-caption-index="{{captionIndex}}">{{caption}}</div>';

        var objectTemplate = pb.params.objectTemplate || '<div class="photo-browser-slide photo-browser-object-slide swiper-slide">{{html}}</div>';
        var photosHtml = '';
        var captionsHtml = '';
        for (i = 0; i < pb.params.photos.length; i ++) {
            var photo = pb.params.photos[i];
            var thisTemplate = '';

            //check if photo is a string or string-like object, for backwards compatibility
            if (typeof(photo) === 'string' || photo instanceof String) {

                //check if "photo" is html object
                if (photo.indexOf('<') >= 0 || photo.indexOf('>') >= 0) {
                    thisTemplate = objectTemplate.replace(/{{html}}/g, photo);
                } else {
                    thisTemplate = photoTemplate.replace(/{{url}}/g, photo);
                }

                //photo is a string, thus has no caption, so remove the caption template placeholder
                //otherwise check if photo is an object with a url property
            } else if (typeof(photo) === 'object') {

                //check if "photo" is html object
                if (photo.hasOwnProperty('html') && photo.html.length > 0) {
                    thisTemplate = objectTemplate.replace(/{{html}}/g, photo.html);
                } else if (photo.hasOwnProperty('url') && photo.url.length > 0) {
                    thisTemplate = photoTemplate.replace(/{{url}}/g, photo.url);
                }

                //check if photo has a caption
                if (photo.hasOwnProperty('caption') && photo.caption.length > 0) {
                    captionsHtml += captionTemplate.replace(/{{caption}}/g, photo.caption).replace(/{{captionIndex}}/g, i);
                } else {
                    thisTemplate = thisTemplate.replace(/{{caption}}/g, '');
                }
            }

            photosHtml += thisTemplate;

        }

        var htmlTemplate = template
                            .replace('{{navbar}}', (pb.params.navbar ? navbarTemplate : ''))
                            .replace('{{noNavbar}}', (pb.params.navbar ? '' : 'no-navbar'))
                            .replace('{{photos}}', photosHtml)
                            .replace('{{captions}}', captionsTemplate.replace(/{{captions}}/g, captionsHtml))
                            .replace('{{toolbar}}', (pb.params.toolbar ? toolbarTemplate : ''));

        pb.activeIndex = pb.params.initialSlide;
        pb.openIndex = pb.activeIndex;
        pb.opened = false;

        pb.open = function (index) {
            if (typeof index === 'undefined') index = pb.activeIndex;
            index = parseInt(index, 10);
            if (pb.opened && pb.swiper) {
                pb.swiper.slideTo(index);
                return;
            }
            pb.opened = true;
            pb.openIndex = index;
            // pb.initialLazyLoaded = false;
            if (pb.params.type === 'standalone') {
                $(pb.params.container).append(htmlTemplate);
            }
            if (pb.params.type === 'popup') {
                pb.popup = $.popup('<div class="popup photo-browser-popup">' + htmlTemplate + '</div>');
                $(pb.popup).on('closed', pb.onPopupClose);
            }
            if (pb.params.type === 'page') {
                $(document).on('pageBeforeInit', pb.onPageBeforeInit);
                $(document).on('pageBeforeRemove', pb.onPageBeforeRemove);
                if (!pb.params.view) pb.params.view = $.mainView;
                pb.params.view.loadContent(htmlTemplate);
                return;
            }
            pb.layout(pb.openIndex);
            if (pb.params.onOpen) {
                pb.params.onOpen(pb);
            }

        };
        pb.close = function () {
            pb.opened = false;
            if (!pb.swiperContainer || pb.swiperContainer.length === 0) {
                return;
            }
            if (pb.params.onClose) {
                pb.params.onClose(pb);
            }
            // Detach events
            pb.attachEvents(true);
            // Delete from DOM
            if (pb.params.type === 'standalone') {
                pb.container.removeClass('photo-browser-in').addClass('photo-browser-out').transitionEnd(function () {
                    pb.container.remove();
                });
            }
            // Destroy slider
            pb.swiper.destroy();
            // Delete references
            pb.swiper = pb.swiperContainer = pb.swiperWrapper = pb.slides = gestureSlide = gestureImg = gestureImgWrap = undefined;
        };

        pb.onPopupClose = function () {
            pb.close();
            $(pb.popup).off('pageBeforeInit', pb.onPopupClose);
        };
        pb.onPageBeforeInit = function (e) {
            if (e.detail.page.name === 'photo-browser-slides') {
                pb.layout(pb.openIndex);
            }
            $(document).off('pageBeforeInit', pb.onPageBeforeInit);
        };
        pb.onPageBeforeRemove = function (e) {
            if (e.detail.page.name === 'photo-browser-slides') {
                pb.close();
            }
            $(document).off('pageBeforeRemove', pb.onPageBeforeRemove);
        };

        pb.onSliderTransitionStart = function (swiper) {
            pb.activeIndex = swiper.activeIndex;

            var current = swiper.activeIndex + 1;
            var total = swiper.slides.length;
            if (pb.params.loop) {
                total = total - 2;
                current = current - swiper.loopedSlides;
                if (current < 1) current = total + current;
                if (current > total) current = current - total;
            }
            pb.container.find('.photo-browser-current').text(current);
            pb.container.find('.photo-browser-total').text(total);

            $('.photo-browser-prev, .photo-browser-next').removeClass('photo-browser-link-inactive');

            if (swiper.isBeginning && !pb.params.loop) {
                $('.photo-browser-prev').addClass('photo-browser-link-inactive');
            }
            if (swiper.isEnd && !pb.params.loop) {
                $('.photo-browser-next').addClass('photo-browser-link-inactive');
            }

            // Update captions
            if (pb.captions.length > 0) {
                pb.captionsContainer.find('.photo-browser-caption-active').removeClass('photo-browser-caption-active');
                var captionIndex = pb.params.loop ? swiper.slides.eq(swiper.activeIndex).attr('data-swiper-slide-index') : pb.activeIndex;
                pb.captionsContainer.find('[data-caption-index="' + captionIndex + '"]').addClass('photo-browser-caption-active');
            }


            // Stop Video
            var previousSlideVideo = swiper.slides.eq(swiper.previousIndex).find('video');
            if (previousSlideVideo.length > 0) {
                if ('pause' in previousSlideVideo[0]) previousSlideVideo[0].pause();
            }
            // Callback
            if (pb.params.onSlideChangeStart) pb.params.onSlideChangeStart(swiper);
        };
        pb.onSliderTransitionEnd = function (swiper) {
            // Reset zoom
            if (pb.params.zoom && gestureSlide && swiper.previousIndex !== swiper.activeIndex) {
                gestureImg.transform('translate3d(0,0,0) scale(1)');
                gestureImgWrap.transform('translate3d(0,0,0)');
                gestureSlide = gestureImg = gestureImgWrap = undefined;
                scale = currentScale = 1;
            }
            if (pb.params.onSlideChangeEnd) pb.params.onSlideChangeEnd(swiper);
        };

        pb.layout = function (index) {
            if (pb.params.type === 'page') {
                pb.container = $('.photo-browser-swiper-container').parents('.view');
            }
            else {
                pb.container = $('.photo-browser');
            }
            if (pb.params.type === 'standalone') {
                pb.container.addClass('photo-browser-in');
                // $.sizeNavbars(pb.container);
            }
            pb.swiperContainer = pb.container.find('.photo-browser-swiper-container');
            pb.swiperWrapper = pb.container.find('.photo-browser-swiper-wrapper');
            pb.slides = pb.container.find('.photo-browser-slide');
            pb.captionsContainer = pb.container.find('.photo-browser-captions');
            pb.captions = pb.container.find('.photo-browser-caption');

            var sliderSettings = {
                nextButton: pb.params.nextButton || '.photo-browser-next',
                prevButton: pb.params.prevButton || '.photo-browser-prev',
                indexButton: pb.params.indexButton,
                initialSlide: index,
                spaceBetween: pb.params.spaceBetween,
                speed: pb.params.speed,
                loop: pb.params.loop,
                lazyLoading: pb.params.lazyLoading,
                lazyLoadingInPrevNext: pb.params.lazyLoadingInPrevNext,
                lazyLoadingOnTransitionStart: pb.params.lazyLoadingOnTransitionStart,
                preloadImages: pb.params.lazyLoading ? false : true,
                onTap: function (swiper, e) {
                    if (pb.params.onTap) pb.params.onTap(swiper, e);
                },
                onClick: function (swiper, e) {
                    if (pb.params.exposition) pb.toggleExposition();
                    if (pb.params.onClick) pb.params.onClick(swiper, e);
                },
                onDoubleTap: function (swiper, e) {
                    pb.toggleZoom($(e.target).parents('.photo-browser-slide'));
                    if (pb.params.onDoubleTap) pb.params.onDoubleTap(swiper, e);
                },
                onTransitionStart: function (swiper) {
                    pb.onSliderTransitionStart(swiper);
                },
                onTransitionEnd: function (swiper) {
                    pb.onSliderTransitionEnd(swiper);
                },
                onLazyImageLoad: function (swiper, slide, img) {
                    if (pb.params.onLazyImageLoad) pb.params.onLazyImageLoad(pb, slide, img);
                },
                onLazyImageReady: function (swiper, slide, img) {
                    $(slide).removeClass('photo-browser-slide-lazy');
                    if (pb.params.onLazyImageReady) pb.params.onLazyImageReady(pb, slide, img);
                }
            };

            if (pb.params.swipeToClose && pb.params.type !== 'page') {
                sliderSettings.onTouchStart = pb.swipeCloseTouchStart;
                sliderSettings.onTouchMoveOpposite = pb.swipeCloseTouchMove;
                sliderSettings.onTouchEnd = pb.swipeCloseTouchEnd;
            }

            pb.swiper = $.swiper(pb.swiperContainer, sliderSettings);
            if (index === 0) {
                pb.onSliderTransitionStart(pb.swiper);
            }
            pb.attachEvents();
        };
        pb.attachEvents = function (detach) {
            var action = detach ? 'off' : 'on';
            // Slide between photos

            if (pb.params.zoom) {
                var target = pb.params.loop ? pb.swiper.slides : pb.slides;
                // Scale image
                target[action]('gesturestart', pb.onSlideGestureStart);
                target[action]('gesturechange', pb.onSlideGestureChange);
                target[action]('gestureend', pb.onSlideGestureEnd);
                // Move image
                target[action]('touchstart', pb.onSlideTouchStart);
                target[action]('touchmove', pb.onSlideTouchMove);
                target[action]('touchend', pb.onSlideTouchEnd);
            }
            pb.container.find('.photo-browser-close-link')[action]('click', pb.close);
        };

        // Expose
        pb.exposed = false;
        pb.toggleExposition = function () {
            if (pb.container) pb.container.toggleClass('photo-browser-exposed');
            if (pb.params.expositionHideCaptions) pb.captionsContainer.toggleClass('photo-browser-captions-exposed');
            pb.exposed = !pb.exposed;
        };
        pb.enableExposition = function () {
            if (pb.container) pb.container.addClass('photo-browser-exposed');
            if (pb.params.expositionHideCaptions) pb.captionsContainer.addClass('photo-browser-captions-exposed');
            pb.exposed = true;
        };
        pb.disableExposition = function () {
            if (pb.container) pb.container.removeClass('photo-browser-exposed');
            if (pb.params.expositionHideCaptions) pb.captionsContainer.removeClass('photo-browser-captions-exposed');
            pb.exposed = false;
        };

        // Gestures
        var gestureSlide, gestureImg, gestureImgWrap, scale = 1, currentScale = 1, isScaling = false;
        pb.onSlideGestureStart = function () {
            if (!gestureSlide) {
                gestureSlide = $(this);
                gestureImg = gestureSlide.find('img, svg, canvas');
                gestureImgWrap = gestureImg.parent('.photo-browser-zoom-container');
                if (gestureImgWrap.length === 0) {
                    gestureImg = undefined;
                    return;
                }
            }
            gestureImg.transition(0);
            isScaling = true;
        };
        pb.onSlideGestureChange = function (e) {
            if (!gestureImg || gestureImg.length === 0) return;
            scale = e.scale * currentScale;
            if (scale > pb.params.maxZoom) {
                scale = pb.params.maxZoom - 1 + Math.pow((scale - pb.params.maxZoom + 1), 0.5);
            }
            if (scale < pb.params.minZoom) {
                scale =  pb.params.minZoom + 1 - Math.pow((pb.params.minZoom - scale + 1), 0.5);
            }
            gestureImg.transform('translate3d(0,0,0) scale(' + scale + ')');
        };
        pb.onSlideGestureEnd = function () {
            if (!gestureImg || gestureImg.length === 0) return;
            scale = Math.max(Math.min(scale, pb.params.maxZoom), pb.params.minZoom);
            gestureImg.transition(pb.params.speed).transform('translate3d(0,0,0) scale(' + scale + ')');
            currentScale = scale;
            isScaling = false;
            if (scale === 1) gestureSlide = undefined;
        };
        pb.toggleZoom = function () {
            if (!gestureSlide) {
                gestureSlide = pb.swiper.slides.eq(pb.swiper.activeIndex);
                gestureImg = gestureSlide.find('img, svg, canvas');
                gestureImgWrap = gestureImg.parent('.photo-browser-zoom-container');
            }
            if (!gestureImg || gestureImg.length === 0) return;
            gestureImgWrap.transition(300).transform('translate3d(0,0,0)');
            if (scale && scale !== 1) {
                scale = currentScale = 1;
                gestureImg.transition(300).transform('translate3d(0,0,0) scale(1)');
                gestureSlide = undefined;
            }
            else {
                scale = currentScale = pb.params.maxZoom;
                gestureImg.transition(300).transform('translate3d(0,0,0) scale(' + scale + ')');
            }
        };

        var imageIsTouched, imageIsMoved, imageCurrentX, imageCurrentY, imageMinX, imageMinY, imageMaxX, imageMaxY, imageWidth, imageHeight, imageTouchesStart = {}, imageTouchesCurrent = {}, imageStartX, imageStartY, velocityPrevPositionX, velocityPrevTime, velocityX, velocityPrevPositionY, velocityY;

        pb.onSlideTouchStart = function (e) {
            if (!gestureImg || gestureImg.length === 0) return;
            if (imageIsTouched) return;
            if ($.device.os === 'android') e.preventDefault();
            imageIsTouched = true;
            imageTouchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            imageTouchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
        };
        pb.onSlideTouchMove = function (e) {
            if (!gestureImg || gestureImg.length === 0) return;
            pb.swiper.allowClick = false;
            if (!imageIsTouched || !gestureSlide) return;

            if (!imageIsMoved) {
                imageWidth = gestureImg[0].offsetWidth;
                imageHeight = gestureImg[0].offsetHeight;
                imageStartX = $.getTranslate(gestureImgWrap[0], 'x') || 0;
                imageStartY = $.getTranslate(gestureImgWrap[0], 'y') || 0;
                gestureImgWrap.transition(0);
            }
            // Define if we need image drag
            var scaledWidth = imageWidth * scale;
            var scaledHeight = imageHeight * scale;

            if (scaledWidth < pb.swiper.width && scaledHeight < pb.swiper.height) return;

            imageMinX = Math.min((pb.swiper.width / 2 - scaledWidth / 2), 0);
            imageMaxX = -imageMinX;
            imageMinY = Math.min((pb.swiper.height / 2 - scaledHeight / 2), 0);
            imageMaxY = -imageMinY;

            imageTouchesCurrent.x = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            imageTouchesCurrent.y = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

            if (!imageIsMoved && !isScaling) {
                if (
                    (Math.floor(imageMinX) === Math.floor(imageStartX) && imageTouchesCurrent.x < imageTouchesStart.x) ||
                    (Math.floor(imageMaxX) === Math.floor(imageStartX) && imageTouchesCurrent.x > imageTouchesStart.x)
                    ) {
                    imageIsTouched = false;
                    return;
                }
            }
            e.preventDefault();
            e.stopPropagation();
            imageIsMoved = true;
            imageCurrentX = imageTouchesCurrent.x - imageTouchesStart.x + imageStartX;
            imageCurrentY = imageTouchesCurrent.y - imageTouchesStart.y + imageStartY;

            if (imageCurrentX < imageMinX) {
                imageCurrentX =  imageMinX + 1 - Math.pow((imageMinX - imageCurrentX + 1), 0.8);
            }
            if (imageCurrentX > imageMaxX) {
                imageCurrentX = imageMaxX - 1 + Math.pow((imageCurrentX - imageMaxX + 1), 0.8);
            }

            if (imageCurrentY < imageMinY) {
                imageCurrentY =  imageMinY + 1 - Math.pow((imageMinY - imageCurrentY + 1), 0.8);
            }
            if (imageCurrentY > imageMaxY) {
                imageCurrentY = imageMaxY - 1 + Math.pow((imageCurrentY - imageMaxY + 1), 0.8);
            }

            //Velocity
            if (!velocityPrevPositionX) velocityPrevPositionX = imageTouchesCurrent.x;
            if (!velocityPrevPositionY) velocityPrevPositionY = imageTouchesCurrent.y;
            if (!velocityPrevTime) velocityPrevTime = Date.now();
            velocityX = (imageTouchesCurrent.x - velocityPrevPositionX) / (Date.now() - velocityPrevTime) / 2;
            velocityY = (imageTouchesCurrent.y - velocityPrevPositionY) / (Date.now() - velocityPrevTime) / 2;
            if (Math.abs(imageTouchesCurrent.x - velocityPrevPositionX) < 2) velocityX = 0;
            if (Math.abs(imageTouchesCurrent.y - velocityPrevPositionY) < 2) velocityY = 0;
            velocityPrevPositionX = imageTouchesCurrent.x;
            velocityPrevPositionY = imageTouchesCurrent.y;
            velocityPrevTime = Date.now();

            gestureImgWrap.transform('translate3d(' + imageCurrentX + 'px, ' + imageCurrentY + 'px,0)');
        };
        pb.onSlideTouchEnd = function () {
            if (!gestureImg || gestureImg.length === 0) return;
            if (!imageIsTouched || !imageIsMoved) {
                imageIsTouched = false;
                imageIsMoved = false;
                return;
            }
            imageIsTouched = false;
            imageIsMoved = false;
            var momentumDurationX = 300;
            var momentumDurationY = 300;
            var momentumDistanceX = velocityX * momentumDurationX;
            var newPositionX = imageCurrentX + momentumDistanceX;
            var momentumDistanceY = velocityY * momentumDurationY;
            var newPositionY = imageCurrentY + momentumDistanceY;

            //Fix duration
            if (velocityX !== 0) momentumDurationX = Math.abs((newPositionX - imageCurrentX) / velocityX);
            if (velocityY !== 0) momentumDurationY = Math.abs((newPositionY - imageCurrentY) / velocityY);
            var momentumDuration = Math.max(momentumDurationX, momentumDurationY);

            imageCurrentX = newPositionX;
            imageCurrentY = newPositionY;

            // Define if we need image drag
            var scaledWidth = imageWidth * scale;
            var scaledHeight = imageHeight * scale;
            imageMinX = Math.min((pb.swiper.width / 2 - scaledWidth / 2), 0);
            imageMaxX = -imageMinX;
            imageMinY = Math.min((pb.swiper.height / 2 - scaledHeight / 2), 0);
            imageMaxY = -imageMinY;
            imageCurrentX = Math.max(Math.min(imageCurrentX, imageMaxX), imageMinX);
            imageCurrentY = Math.max(Math.min(imageCurrentY, imageMaxY), imageMinY);

            gestureImgWrap.transition(momentumDuration).transform('translate3d(' + imageCurrentX + 'px, ' + imageCurrentY + 'px,0)');
        };

        // Swipe Up To Close
        var swipeToCloseIsTouched = false;
        var allowSwipeToClose = true;
        var swipeToCloseDiff, swipeToCloseStart, swipeToCloseCurrent, swipeToCloseStarted = false, swipeToCloseActiveSlide, swipeToCloseTimeStart;
        pb.swipeCloseTouchStart = function () {
            if (!allowSwipeToClose) return;
            swipeToCloseIsTouched = true;
        };
        pb.swipeCloseTouchMove = function (swiper, e) {
            if (!swipeToCloseIsTouched) return;
            if (!swipeToCloseStarted) {
                swipeToCloseStarted = true;
                swipeToCloseStart = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                swipeToCloseActiveSlide = pb.swiper.slides.eq(pb.swiper.activeIndex);
                swipeToCloseTimeStart = (new Date()).getTime();
            }
            e.preventDefault();
            swipeToCloseCurrent = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
            swipeToCloseDiff = swipeToCloseStart - swipeToCloseCurrent;
            var opacity = 1 - Math.abs(swipeToCloseDiff) / 300;
            swipeToCloseActiveSlide.transform('translate3d(0,' + (-swipeToCloseDiff) + 'px,0)');
            pb.swiper.container.css('opacity', opacity).transition(0);
        };
        pb.swipeCloseTouchEnd = function () {
            swipeToCloseIsTouched = false;
            if (!swipeToCloseStarted) {
                swipeToCloseStarted = false;
                return;
            }
            swipeToCloseStarted = false;
            allowSwipeToClose = false;
            var diff = Math.abs(swipeToCloseDiff);
            var timeDiff = (new Date()).getTime() - swipeToCloseTimeStart;
            if ((timeDiff < 300 && diff > 20) || (timeDiff >= 300 && diff > 100)) {
                setTimeout(function () {
                    if (pb.params.type === 'standalone') {
                        pb.close();
                    }
                    if (pb.params.type === 'popup') {
                        $.closeModal(pb.popup);
                    }
                    if (pb.params.onSwipeToClose) {
                        pb.params.onSwipeToClose(pb);
                    }
                    allowSwipeToClose = true;
                }, 0);
                return;
            }
            if (diff !== 0) {
                swipeToCloseActiveSlide.addClass('transitioning').transitionEnd(function () {
                    allowSwipeToClose = true;
                    swipeToCloseActiveSlide.removeClass('transitioning');
                });
            }
            else {
                allowSwipeToClose = true;
            }
            pb.swiper.container.css('opacity', '').transition('');
            swipeToCloseActiveSlide.transform('');
        };

        return pb;
    };

    PhotoBrowser.prototype = {
        defaults: {
            photos : [],
            container: 'body',
            initialSlide: 0,
            spaceBetween: 20,
            speed: 300,
            zoom: true,
            maxZoom: 3,
            minZoom: 1,
            exposition: true,
            expositionHideCaptions: false,
            type: 'standalone',
            navbar: true,
            toolbar: true,
            theme: 'light',
            swipeToClose: true,
            backLinkText: 'Close',
            ofText: 'of',
            loop: false,
            lazyLoading: false,
            lazyLoadingInPrevNext: false,
            lazyLoadingOnTransitionStart: false,
            /*
            Callbacks:
            onLazyImageLoad(pb, slide, img)
            onLazyImageReady(pb, slide, img)
            onOpen(pb)
            onClose(pb)
            onSlideChangeStart(swiper)
            onSlideChangeEnd(swiper)
            onTap(swiper, e)
            onClick(swiper, e)
            onDoubleTap(swiper, e)
            onSwipeToClose(pb)
            */
        }
    };

    $.photoBrowser = function (params) {
        $.extend(params, $.photoBrowser.prototype.defaults);
        return new PhotoBrowser(params);
    };

    $.photoBrowser.prototype = {
        defaults: {}
    };

}(Zepto);
/*!
 * =====================================================
 * SUI Mobile - http://m.sui.taobao.org/
 *
 * =====================================================
 */
// jshint ignore: start
+function($){

$.smConfig.rawCitiesData = [{"code": "11","name": "北京","sub": [{"code": "1101","name": "北京","sub": [{"code": "110101","name": "东城"}, {"code": "110102","name": "西城"}, {"code": "110105","name": "朝阳"}, {"code": "110106","name": "丰台"}, {"code": "110107","name": "石景山"}, {"code": "110108","name": "海淀"}, {"code": "110109","name": "门头沟"}, {"code": "110111","name": "房山"}, {"code": "110112","name": "通州"}, {"code": "110113","name": "顺义"}, {"code": "110114","name": "昌平"}, {"code": "110115","name": "大兴"}, {"code": "110116","name": "怀柔"}, {"code": "110117","name": "平谷"}, {"code": "110118","name": "密云"}, {"code": "110119","name": "延庆"}]}]}, {"code": "12","name": "天津","sub": [{"code": "1201","name": "天津","sub": [{"code": "120101","name": "和平"}, {"code": "120102","name": "河东"}, {"code": "120103","name": "河西"}, {"code": "120104","name": "南开"}, {"code": "120105","name": "河北"}, {"code": "120106","name": "红桥"}, {"code": "120110","name": "东丽"}, {"code": "120111","name": "西青"}, {"code": "120112","name": "津南"}, {"code": "120113","name": "北辰"}, {"code": "120114","name": "武清"}, {"code": "120115","name": "宝坻"}, {"code": "120116","name": "滨海"}, {"code": "120117","name": "宁河"}, {"code": "120118","name": "静海"}, {"code": "120119","name": "蓟州"}]}]}, {"code": "13","name": "河北","sub": [{"code": "1301","name": "石家庄","sub": [{"code": "130102","name": "长安"}, {"code": "130104","name": "桥西"}, {"code": "130105","name": "新华"}, {"code": "130107","name": "井陉矿"}, {"code": "130108","name": "裕华"}, {"code": "130109","name": "藁城"}, {"code": "130110","name": "鹿泉"}, {"code": "130111","name": "栾城"}, {"code": "130121","name": "井陉"}, {"code": "130123","name": "正定"}, {"code": "130125","name": "行唐"}, {"code": "130126","name": "灵寿"}, {"code": "130127","name": "高邑"}, {"code": "130128","name": "深泽"}, {"code": "130129","name": "赞皇"}, {"code": "130130","name": "无极"}, {"code": "130131","name": "平山"}, {"code": "130132","name": "元氏"}, {"code": "130133","name": "赵县"}, {"code": "130183","name": "晋州"}, {"code": "130184","name": "新乐"}]}, {"code": "1302","name": "唐山","sub": [{"code": "130202","name": "路南"}, {"code": "130203","name": "路北"}, {"code": "130204","name": "古冶"}, {"code": "130205","name": "开平"}, {"code": "130207","name": "丰南"}, {"code": "130208","name": "丰润"}, {"code": "130209","name": "曹妃甸"}, {"code": "130223","name": "滦县"}, {"code": "130224","name": "滦南"}, {"code": "130225","name": "乐亭"}, {"code": "130227","name": "迁西"}, {"code": "130229","name": "玉田"}, {"code": "130281","name": "遵化"}, {"code": "130283","name": "迁安"}]}, {"code": "1303","name": "秦皇岛","sub": [{"code": "130302","name": "海港"}, {"code": "130303","name": "山海关"}, {"code": "130304","name": "北戴河"}, {"code": "130306","name": "抚宁"}, {"code": "130321","name": "青龙"}, {"code": "130322","name": "昌黎"}, {"code": "130324","name": "卢龙"}]}, {"code": "1304","name": "邯郸","sub": [{"code": "130402","name": "邯山"}, {"code": "130403","name": "丛台"}, {"code": "130404","name": "复兴"}, {"code": "130406","name": "峰峰矿"}, {"code": "130421","name": "邯郸"}, {"code": "130423","name": "临漳"}, {"code": "130424","name": "成安"}, {"code": "130425","name": "大名"}, {"code": "130426","name": "涉县"}, {"code": "130427","name": "磁县"}, {"code": "130428","name": "肥乡"}, {"code": "130429","name": "永年"}, {"code": "130430","name": "邱县"}, {"code": "130431","name": "鸡泽"}, {"code": "130432","name": "广平"}, {"code": "130433","name": "馆陶"}, {"code": "130434","name": "魏县"}, {"code": "130435","name": "曲周"}, {"code": "130481","name": "武安"}]}, {"code": "1305","name": "邢台","sub": [{"code": "130502","name": "桥东"}, {"code": "130503","name": "桥西"}, {"code": "130521","name": "邢台"}, {"code": "130522","name": "临城"}, {"code": "130523","name": "内丘"}, {"code": "130524","name": "柏乡"}, {"code": "130525","name": "隆尧"}, {"code": "130526","name": "任县"}, {"code": "130527","name": "南和"}, {"code": "130528","name": "宁晋"}, {"code": "130529","name": "巨鹿"}, {"code": "130530","name": "新河"}, {"code": "130531","name": "广宗"}, {"code": "130532","name": "平乡"}, {"code": "130533","name": "威县"}, {"code": "130534","name": "清河"}, {"code": "130535","name": "临西"}, {"code": "130581","name": "南宫"}, {"code": "130582","name": "沙河"}]}, {"code": "1306","name": "保定","sub": [{"code": "130602","name": "竞秀"}, {"code": "130606","name": "莲池"}, {"code": "130607","name": "满城"}, {"code": "130608","name": "清苑"}, {"code": "130609","name": "徐水"}, {"code": "130623","name": "涞水"}, {"code": "130624","name": "阜平"}, {"code": "130626","name": "定兴"}, {"code": "130627","name": "唐县"}, {"code": "130628","name": "高阳"}, {"code": "130629","name": "容城"}, {"code": "130630","name": "涞源"}, {"code": "130631","name": "望都"}, {"code": "130632","name": "安新"}, {"code": "130633","name": "易县"}, {"code": "130634","name": "曲阳"}, {"code": "130635","name": "蠡县"}, {"code": "130636","name": "顺平"}, {"code": "130637","name": "博野"}, {"code": "130638","name": "雄县"}, {"code": "130681","name": "涿州"}, {"code": "130683","name": "安国"}, {"code": "130684","name": "高碑店"}]}, {"code": "1307","name": "张家口","sub": [{"code": "130702","name": "桥东"}, {"code": "130703","name": "桥西"}, {"code": "130705","name": "宣化"}, {"code": "130706","name": "下花园"}, {"code": "130708","name": "万全"}, {"code": "130709","name": "崇礼"}, {"code": "130722","name": "张北"}, {"code": "130723","name": "康保"}, {"code": "130724","name": "沽源"}, {"code": "130725","name": "尚义"}, {"code": "130726","name": "蔚县"}, {"code": "130727","name": "阳原"}, {"code": "130728","name": "怀安"}, {"code": "130730","name": "怀来"}, {"code": "130731","name": "涿鹿"}, {"code": "130732","name": "赤城"}]}, {"code": "1308","name": "承德","sub": [{"code": "130802","name": "双桥"}, {"code": "130803","name": "双滦"}, {"code": "130804","name": "鹰手营子矿"}, {"code": "130821","name": "承德"}, {"code": "130822","name": "兴隆"}, {"code": "130823","name": "平泉"}, {"code": "130824","name": "滦平"}, {"code": "130825","name": "隆化"}, {"code": "130826","name": "丰宁"}, {"code": "130827","name": "宽城"}, {"code": "130828","name": "围场"}]}, {"code": "1309","name": "沧州","sub": [{"code": "130902","name": "新华"}, {"code": "130903","name": "运河"}, {"code": "130921","name": "沧县"}, {"code": "130922","name": "青县"}, {"code": "130923","name": "东光"}, {"code": "130924","name": "海兴"}, {"code": "130925","name": "盐山"}, {"code": "130926","name": "肃宁"}, {"code": "130927","name": "南皮"}, {"code": "130928","name": "吴桥"}, {"code": "130929","name": "献县"}, {"code": "130930","name": "孟村"}, {"code": "130981","name": "泊头"}, {"code": "130982","name": "任丘"}, {"code": "130983","name": "黄骅"}, {"code": "130984","name": "河间"}]}, {"code": "1310","name": "廊坊","sub": [{"code": "131002","name": "安次"}, {"code": "131003","name": "广阳"}, {"code": "131022","name": "固安"}, {"code": "131023","name": "永清"}, {"code": "131024","name": "香河"}, {"code": "131025","name": "大城"}, {"code": "131026","name": "文安"}, {"code": "131028","name": "大厂"}, {"code": "131081","name": "霸州"}, {"code": "131082","name": "三河"}]}, {"code": "1311","name": "衡水","sub": [{"code": "131102","name": "桃城"}, {"code": "131103","name": "冀州"}, {"code": "131121","name": "枣强"}, {"code": "131122","name": "武邑"}, {"code": "131123","name": "武强"}, {"code": "131124","name": "饶阳"}, {"code": "131125","name": "安平"}, {"code": "131126","name": "故城"}, {"code": "131127","name": "景县"}, {"code": "131128","name": "阜城"}, {"code": "131182","name": "深州"}]}, {"code": "1390","name": "河北","sub": [{"code": "139001","name": "定州"}, {"code": "139002","name": "辛集"}]}]}, {"code": "14","name": "山西","sub": [{"code": "1401","name": "太原","sub": [{"code": "140105","name": "小店"}, {"code": "140106","name": "迎泽"}, {"code": "140107","name": "杏花岭"}, {"code": "140108","name": "尖草坪"}, {"code": "140109","name": "万柏林"}, {"code": "140110","name": "晋源"}, {"code": "140121","name": "清徐"}, {"code": "140122","name": "阳曲"}, {"code": "140123","name": "娄烦"}, {"code": "140181","name": "古交"}]}, {"code": "1402","name": "大同","sub": [{"code": "140202","name": "城区"}, {"code": "140203","name": "矿区"}, {"code": "140211","name": "南郊"}, {"code": "140212","name": "新荣"}, {"code": "140221","name": "阳高"}, {"code": "140222","name": "天镇"}, {"code": "140223","name": "广灵"}, {"code": "140224","name": "灵丘"}, {"code": "140225","name": "浑源"}, {"code": "140226","name": "左云"}, {"code": "140227","name": "大同"}]}, {"code": "1403","name": "阳泉","sub": [{"code": "140302","name": "城区"}, {"code": "140303","name": "矿区"}, {"code": "140311","name": "郊区"}, {"code": "140321","name": "平定"}, {"code": "140322","name": "盂县"}]}, {"code": "1404","name": "长治","sub": [{"code": "140402","name": "城区"}, {"code": "140411","name": "郊区"}, {"code": "140421","name": "长治"}, {"code": "140423","name": "襄垣"}, {"code": "140424","name": "屯留"}, {"code": "140425","name": "平顺"}, {"code": "140426","name": "黎城"}, {"code": "140427","name": "壶关"}, {"code": "140428","name": "长子"}, {"code": "140429","name": "武乡"}, {"code": "140430","name": "沁县"}, {"code": "140431","name": "沁源"}, {"code": "140481","name": "潞城"}]}, {"code": "1405","name": "晋城","sub": [{"code": "140502","name": "城区"}, {"code": "140521","name": "沁水"}, {"code": "140522","name": "阳城"}, {"code": "140524","name": "陵川"}, {"code": "140525","name": "泽州"}, {"code": "140581","name": "高平"}]}, {"code": "1406","name": "朔州","sub": [{"code": "140602","name": "朔城"}, {"code": "140603","name": "平鲁"}, {"code": "140621","name": "山阴"}, {"code": "140622","name": "应县"}, {"code": "140623","name": "右玉"}, {"code": "140624","name": "怀仁"}]}, {"code": "1407","name": "晋中","sub": [{"code": "140702","name": "榆次"}, {"code": "140721","name": "榆社"}, {"code": "140722","name": "左权"}, {"code": "140723","name": "和顺"}, {"code": "140724","name": "昔阳"}, {"code": "140725","name": "寿阳"}, {"code": "140726","name": "太谷"}, {"code": "140727","name": "祁县"}, {"code": "140728","name": "平遥"}, {"code": "140729","name": "灵石"}, {"code": "140781","name": "介休"}]}, {"code": "1408","name": "运城","sub": [{"code": "140802","name": "盐湖"}, {"code": "140821","name": "临猗"}, {"code": "140822","name": "万荣"}, {"code": "140823","name": "闻喜"}, {"code": "140824","name": "稷山"}, {"code": "140825","name": "新绛"}, {"code": "140826","name": "绛县"}, {"code": "140827","name": "垣曲"}, {"code": "140828","name": "夏县"}, {"code": "140829","name": "平陆"}, {"code": "140830","name": "芮城"}, {"code": "140881","name": "永济"}, {"code": "140882","name": "河津"}]}, {"code": "1409","name": "忻州","sub": [{"code": "140902","name": "忻府"}, {"code": "140921","name": "定襄"}, {"code": "140922","name": "五台"}, {"code": "140923","name": "代县"}, {"code": "140924","name": "繁峙"}, {"code": "140925","name": "宁武"}, {"code": "140926","name": "静乐"}, {"code": "140927","name": "神池"}, {"code": "140928","name": "五寨"}, {"code": "140929","name": "岢岚"}, {"code": "140930","name": "河曲"}, {"code": "140931","name": "保德"}, {"code": "140932","name": "偏关"}, {"code": "140981","name": "原平"}]}, {"code": "1410","name": "临汾","sub": [{"code": "141002","name": "尧都"}, {"code": "141021","name": "曲沃"}, {"code": "141022","name": "翼城"}, {"code": "141023","name": "襄汾"}, {"code": "141024","name": "洪洞"}, {"code": "141025","name": "古县"}, {"code": "141026","name": "安泽"}, {"code": "141027","name": "浮山"}, {"code": "141028","name": "吉县"}, {"code": "141029","name": "乡宁"}, {"code": "141030","name": "大宁"}, {"code": "141031","name": "隰县"}, {"code": "141032","name": "永和"}, {"code": "141033","name": "蒲县"}, {"code": "141034","name": "汾西"}, {"code": "141081","name": "侯马"}, {"code": "141082","name": "霍州"}]}, {"code": "1411","name": "吕梁","sub": [{"code": "141102","name": "离石"}, {"code": "141121","name": "文水"}, {"code": "141122","name": "交城"}, {"code": "141123","name": "兴县"}, {"code": "141124","name": "临县"}, {"code": "141125","name": "柳林"}, {"code": "141126","name": "石楼"}, {"code": "141127","name": "岚县"}, {"code": "141128","name": "方山"}, {"code": "141129","name": "中阳"}, {"code": "141130","name": "交口"}, {"code": "141181","name": "孝义"}, {"code": "141182","name": "汾阳"}]}]}, {"code": "15","name": "内蒙古","sub": [{"code": "1501","name": "呼和浩特","sub": [{"code": "150102","name": "新城"}, {"code": "150103","name": "回民"}, {"code": "150104","name": "玉泉"}, {"code": "150105","name": "赛罕"}, {"code": "150121","name": "土默特左旗"}, {"code": "150122","name": "托克托"}, {"code": "150123","name": "和林格尔"}, {"code": "150124","name": "清水河"}, {"code": "150125","name": "武川"}]}, {"code": "1502","name": "包头","sub": [{"code": "150202","name": "东河"}, {"code": "150203","name": "昆都仑"}, {"code": "150204","name": "青山"}, {"code": "150205","name": "石拐"}, {"code": "150206","name": "白云鄂博矿"}, {"code": "150207","name": "九原"}, {"code": "150221","name": "土默特右旗"}, {"code": "150222","name": "固阳"}, {"code": "150223","name": "达尔罕茂明安联合旗"}]}, {"code": "1503","name": "乌海","sub": [{"code": "150302","name": "海勃湾"}, {"code": "150303","name": "海南"}, {"code": "150304","name": "乌达"}]}, {"code": "1504","name": "赤峰","sub": [{"code": "150402","name": "红山"}, {"code": "150403","name": "元宝山"}, {"code": "150404","name": "松山"}, {"code": "150421","name": "阿鲁科尔沁旗"}, {"code": "150422","name": "巴林左旗"}, {"code": "150423","name": "巴林右旗"}, {"code": "150424","name": "林西"}, {"code": "150425","name": "克什克腾旗"}, {"code": "150426","name": "翁牛特旗"}, {"code": "150428","name": "喀喇沁旗"}, {"code": "150429","name": "宁城"}, {"code": "150430","name": "敖汉旗"}]}, {"code": "1505","name": "通辽","sub": [{"code": "150502","name": "科尔沁"}, {"code": "150521","name": "科尔沁左翼中旗"}, {"code": "150522","name": "科尔沁左翼后旗"}, {"code": "150523","name": "开鲁"}, {"code": "150524","name": "库伦旗"}, {"code": "150525","name": "奈曼旗"}, {"code": "150526","name": "扎鲁特旗"}, {"code": "150581","name": "霍林郭勒"}]}, {"code": "1506","name": "鄂尔多斯","sub": [{"code": "150602","name": "东胜"}, {"code": "150603","name": "康巴什"}, {"code": "150621","name": "达拉特旗"}, {"code": "150622","name": "准格尔旗"}, {"code": "150623","name": "鄂托克前旗"}, {"code": "150624","name": "鄂托克旗"}, {"code": "150625","name": "杭锦旗"}, {"code": "150626","name": "乌审旗"}, {"code": "150627","name": "伊金霍洛旗"}]}, {"code": "1507","name": "呼伦贝尔","sub": [{"code": "150702","name": "海拉尔"}, {"code": "150703","name": "扎赉诺尔"}, {"code": "150721","name": "阿荣旗"}, {"code": "150722","name": "莫力达瓦"}, {"code": "150723","name": "鄂伦春"}, {"code": "150724","name": "鄂温"}, {"code": "150725","name": "陈巴尔虎旗"}, {"code": "150726","name": "新巴尔虎左旗"}, {"code": "150727","name": "新巴尔虎右旗"}, {"code": "150781","name": "满洲里"}, {"code": "150782","name": "牙克石"}, {"code": "150783","name": "扎兰屯"}, {"code": "150784","name": "额尔古纳"}, {"code": "150785","name": "根河"}]}, {"code": "1508","name": "巴彦淖尔","sub": [{"code": "150802","name": "临河"}, {"code": "150821","name": "五原"}, {"code": "150822","name": "磴口"}, {"code": "150823","name": "乌拉特前旗"}, {"code": "150824","name": "乌拉特中旗"}, {"code": "150825","name": "乌拉特后旗"}, {"code": "150826","name": "杭锦后旗"}]}, {"code": "1509","name": "乌兰察布","sub": [{"code": "150902","name": "集宁"}, {"code": "150921","name": "卓资"}, {"code": "150922","name": "化德"}, {"code": "150923","name": "商都"}, {"code": "150924","name": "兴和"}, {"code": "150925","name": "凉城"}, {"code": "150926","name": "察哈尔右翼前旗"}, {"code": "150927","name": "察哈尔右翼中旗"}, {"code": "150928","name": "察哈尔右翼后旗"}, {"code": "150929","name": "四子王旗"}, {"code": "150981","name": "丰镇"}]}, {"code": "1522","name": "兴安盟","sub": [{"code": "152201","name": "乌兰浩特"}, {"code": "152202","name": "阿尔山"}, {"code": "152221","name": "科尔沁右翼前旗"}, {"code": "152222","name": "科尔沁右翼中旗"}, {"code": "152223","name": "扎赉特旗"}, {"code": "152224","name": "突泉"}]}, {"code": "1525","name": "锡林郭勒盟","sub": [{"code": "152501","name": "二连浩特"}, {"code": "152502","name": "锡林浩特"}, {"code": "152522","name": "阿巴嘎旗"}, {"code": "152523","name": "苏尼特左旗"}, {"code": "152524","name": "苏尼特右旗"}, {"code": "152525","name": "东乌珠穆沁旗"}, {"code": "152526","name": "西乌珠穆沁旗"}, {"code": "152527","name": "太仆寺旗"}, {"code": "152528","name": "镶黄旗"}, {"code": "152529","name": "正镶白旗"}, {"code": "152530","name": "正蓝旗"}, {"code": "152531","name": "多伦"}]}, {"code": "1529","name": "阿拉善盟","sub": [{"code": "152921","name": "阿拉善左旗"}, {"code": "152922","name": "阿拉善右旗"}, {"code": "152923","name": "额济纳旗"}]}]}, {"code": "21","name": "辽宁","sub": [{"code": "2101","name": "沈阳","sub": [{"code": "210102","name": "和平"}, {"code": "210103","name": "沈河"}, {"code": "210104","name": "大东"}, {"code": "210105","name": "皇姑"}, {"code": "210106","name": "铁西"}, {"code": "210111","name": "苏家屯"}, {"code": "210112","name": "浑南"}, {"code": "210113","name": "沈北新"}, {"code": "210114","name": "于洪"}, {"code": "210115","name": "辽中"}, {"code": "210123","name": "康平"}, {"code": "210124","name": "法库"}, {"code": "210181","name": "新民"}]}, {"code": "2102","name": "大连","sub": [{"code": "210202","name": "中山"}, {"code": "210203","name": "西岗"}, {"code": "210204","name": "沙河口"}, {"code": "210211","name": "甘井子"}, {"code": "210212","name": "旅顺口"}, {"code": "210213","name": "金州"}, {"code": "210214","name": "普兰店"}, {"code": "210224","name": "长海"}, {"code": "210281","name": "瓦房店"}, {"code": "210283","name": "庄河"}]}, {"code": "2103","name": "鞍山","sub": [{"code": "210302","name": "铁东"}, {"code": "210303","name": "铁西"}, {"code": "210304","name": "立山"}, {"code": "210311","name": "千山"}, {"code": "210321","name": "台安"}, {"code": "210323","name": "岫岩"}, {"code": "210381","name": "海城"}]}, {"code": "2104","name": "抚顺","sub": [{"code": "210402","name": "新抚"}, {"code": "210403","name": "东洲"}, {"code": "210404","name": "望花"}, {"code": "210411","name": "顺城"}, {"code": "210421","name": "抚顺"}, {"code": "210422","name": "新宾"}, {"code": "210423","name": "清原"}]}, {"code": "2105","name": "本溪","sub": [{"code": "210502","name": "平山"}, {"code": "210503","name": "溪湖"}, {"code": "210504","name": "明山"}, {"code": "210505","name": "南芬"}, {"code": "210521","name": "本溪"}, {"code": "210522","name": "桓仁"}]}, {"code": "2106","name": "丹东","sub": [{"code": "210602","name": "元宝"}, {"code": "210603","name": "振兴"}, {"code": "210604","name": "振安"}, {"code": "210624","name": "宽甸"}, {"code": "210681","name": "东港"}, {"code": "210682","name": "凤城"}]}, {"code": "2107","name": "锦州","sub": [{"code": "210702","name": "古塔"}, {"code": "210703","name": "凌河"}, {"code": "210711","name": "太和"}, {"code": "210726","name": "黑山"}, {"code": "210727","name": "义县"}, {"code": "210781","name": "凌海"}, {"code": "210782","name": "北镇"}]}, {"code": "2108","name": "营口","sub": [{"code": "210802","name": "站前"}, {"code": "210803","name": "西市"}, {"code": "210804","name": "鲅鱼圈"}, {"code": "210811","name": "老边"}, {"code": "210881","name": "盖州"}, {"code": "210882","name": "大石桥"}]}, {"code": "2109","name": "阜新","sub": [{"code": "210902","name": "海州"}, {"code": "210903","name": "新邱"}, {"code": "210904","name": "太平"}, {"code": "210905","name": "清河门"}, {"code": "210911","name": "细河"}, {"code": "210921","name": "阜新"}, {"code": "210922","name": "彰武"}]}, {"code": "2110","name": "辽阳","sub": [{"code": "211002","name": "白塔"}, {"code": "211003","name": "文圣"}, {"code": "211004","name": "宏伟"}, {"code": "211005","name": "弓长岭"}, {"code": "211011","name": "太子河"}, {"code": "211021","name": "辽阳"}, {"code": "211081","name": "灯塔"}]}, {"code": "2111","name": "盘锦","sub": [{"code": "211102","name": "双台子"}, {"code": "211103","name": "兴隆台"}, {"code": "211104","name": "大洼"}, {"code": "211122","name": "盘山"}]}, {"code": "2112","name": "铁岭","sub": [{"code": "211202","name": "银州"}, {"code": "211204","name": "清河"}, {"code": "211221","name": "铁岭"}, {"code": "211223","name": "西丰"}, {"code": "211224","name": "昌图"}, {"code": "211281","name": "调兵山"}, {"code": "211282","name": "开原"}]}, {"code": "2113","name": "朝阳","sub": [{"code": "211302","name": "双塔"}, {"code": "211303","name": "龙城"}, {"code": "211321","name": "朝阳"}, {"code": "211322","name": "建平"}, {"code": "211324","name": "喀喇沁左翼蒙古族自治"}, {"code": "211381","name": "北票"}, {"code": "211382","name": "凌源"}]}, {"code": "2114","name": "葫芦岛","sub": [{"code": "211402","name": "连山"}, {"code": "211403","name": "龙港"}, {"code": "211404","name": "南票"}, {"code": "211421","name": "绥中"}, {"code": "211422","name": "建昌"}, {"code": "211481","name": "兴城"}]}]}, {"code": "22","name": "吉林","sub": [{"code": "2201","name": "长春","sub": [{"code": "220102","name": "南关"}, {"code": "220103","name": "宽城"}, {"code": "220104","name": "朝阳"}, {"code": "220105","name": "二道"}, {"code": "220106","name": "绿园"}, {"code": "220112","name": "双阳"}, {"code": "220113","name": "九台"}, {"code": "220122","name": "农安"}, {"code": "220182","name": "榆树"}, {"code": "220183","name": "德惠"}]}, {"code": "2202","name": "吉林","sub": [{"code": "220202","name": "昌邑"}, {"code": "220203","name": "龙潭"}, {"code": "220204","name": "船营"}, {"code": "220211","name": "丰满"}, {"code": "220221","name": "永吉"}, {"code": "220281","name": "蛟河"}, {"code": "220282","name": "桦甸"}, {"code": "220283","name": "舒兰"}, {"code": "220284","name": "磐石"}]}, {"code": "2203","name": "四平","sub": [{"code": "220302","name": "铁西"}, {"code": "220303","name": "铁东"}, {"code": "220322","name": "梨树"}, {"code": "220323","name": "伊通"}, {"code": "220381","name": "公主岭"}, {"code": "220382","name": "双辽"}]}, {"code": "2204","name": "辽源","sub": [{"code": "220402","name": "龙山"}, {"code": "220403","name": "西安"}, {"code": "220421","name": "东丰"}, {"code": "220422","name": "东辽"}]}, {"code": "2205","name": "通化","sub": [{"code": "220502","name": "东昌"}, {"code": "220503","name": "二道江"}, {"code": "220521","name": "通化"}, {"code": "220523","name": "辉南"}, {"code": "220524","name": "柳河"}, {"code": "220581","name": "梅河口"}, {"code": "220582","name": "集安"}]}, {"code": "2206","name": "白山","sub": [{"code": "220602","name": "浑江"}, {"code": "220605","name": "江源"}, {"code": "220621","name": "抚松"}, {"code": "220622","name": "靖宇"}, {"code": "220623","name": "长白"}, {"code": "220681","name": "临江"}]}, {"code": "2207","name": "松原","sub": [{"code": "220702","name": "宁江"}, {"code": "220721","name": "前郭尔罗斯蒙古族自治"}, {"code": "220722","name": "长岭"}, {"code": "220723","name": "乾安"}, {"code": "220781","name": "扶余"}]}, {"code": "2208","name": "白城","sub": [{"code": "220802","name": "洮北"}, {"code": "220821","name": "镇赉"}, {"code": "220822","name": "通榆"}, {"code": "220881","name": "洮南"}, {"code": "220882","name": "大安"}]}, {"code": "2224","name": "延边","sub": [{"code": "222401","name": "延吉"}, {"code": "222402","name": "图们"}, {"code": "222403","name": "敦化"}, {"code": "222404","name": "珲春"}, {"code": "222405","name": "龙井"}, {"code": "222406","name": "和龙"}, {"code": "222424","name": "汪清"}, {"code": "222426","name": "安图"}]}]}, {"code": "23","name": "黑龙江","sub": [{"code": "2301","name": "哈尔滨","sub": [{"code": "230102","name": "道里"}, {"code": "230103","name": "南岗"}, {"code": "230104","name": "道外"}, {"code": "230108","name": "平房"}, {"code": "230109","name": "松北"}, {"code": "230110","name": "香坊"}, {"code": "230111","name": "呼兰"}, {"code": "230112","name": "阿城"}, {"code": "230113","name": "双城"}, {"code": "230123","name": "依兰"}, {"code": "230124","name": "方正"}, {"code": "230125","name": "宾县"}, {"code": "230126","name": "巴彦"}, {"code": "230127","name": "木兰"}, {"code": "230128","name": "通河"}, {"code": "230129","name": "延寿"}, {"code": "230183","name": "尚志"}, {"code": "230184","name": "五常"}]}, {"code": "2302","name": "齐齐哈尔","sub": [{"code": "230202","name": "龙沙"}, {"code": "230203","name": "建华"}, {"code": "230204","name": "铁锋"}, {"code": "230205","name": "昂昂溪"}, {"code": "230206","name": "富拉尔基"}, {"code": "230207","name": "碾子山"}, {"code": "230208","name": "梅里斯"}, {"code": "230221","name": "龙江"}, {"code": "230223","name": "依安"}, {"code": "230224","name": "泰来"}, {"code": "230225","name": "甘南"}, {"code": "230227","name": "富裕"}, {"code": "230229","name": "克山"}, {"code": "230230","name": "克东"}, {"code": "230231","name": "拜泉"}, {"code": "230281","name": "讷河"}]}, {"code": "2303","name": "鸡西","sub": [{"code": "230302","name": "鸡冠"}, {"code": "230303","name": "恒山"}, {"code": "230304","name": "滴道"}, {"code": "230305","name": "梨树"}, {"code": "230306","name": "城子河"}, {"code": "230307","name": "麻山"}, {"code": "230321","name": "鸡东"}, {"code": "230381","name": "虎林"}, {"code": "230382","name": "密山"}]}, {"code": "2304","name": "鹤岗","sub": [{"code": "230402","name": "向阳"}, {"code": "230403","name": "工农"}, {"code": "230404","name": "南山"}, {"code": "230405","name": "兴安"}, {"code": "230406","name": "东山"}, {"code": "230407","name": "兴山"}, {"code": "230421","name": "萝北"}, {"code": "230422","name": "绥滨"}]}, {"code": "2305","name": "双鸭山","sub": [{"code": "230502","name": "尖山"}, {"code": "230503","name": "岭东"}, {"code": "230505","name": "四方台"}, {"code": "230506","name": "宝山"}, {"code": "230521","name": "集贤"}, {"code": "230522","name": "友谊"}, {"code": "230523","name": "宝清"}, {"code": "230524","name": "饶河"}]}, {"code": "2306","name": "大庆","sub": [{"code": "230602","name": "萨尔图"}, {"code": "230603","name": "龙凤"}, {"code": "230604","name": "让胡路"}, {"code": "230605","name": "红岗"}, {"code": "230606","name": "大同"}, {"code": "230621","name": "肇州"}, {"code": "230622","name": "肇源"}, {"code": "230623","name": "林甸"}, {"code": "230624","name": "杜尔伯特蒙古族自治"}]}, {"code": "2307","name": "伊春","sub": [{"code": "230702","name": "伊春"}, {"code": "230703","name": "南岔"}, {"code": "230704","name": "友好"}, {"code": "230705","name": "西林"}, {"code": "230706","name": "翠峦"}, {"code": "230707","name": "新青"}, {"code": "230708","name": "美溪"}, {"code": "230709","name": "金山屯"}, {"code": "230710","name": "五营"}, {"code": "230711","name": "乌马河"}, {"code": "230712","name": "汤旺河"}, {"code": "230713","name": "带岭"}, {"code": "230714","name": "乌伊岭"}, {"code": "230715","name": "红星"}, {"code": "230716","name": "上甘岭"}, {"code": "230722","name": "嘉荫"}, {"code": "230781","name": "铁力"}]}, {"code": "2308","name": "佳木斯","sub": [{"code": "230803","name": "向阳"}, {"code": "230804","name": "前进"}, {"code": "230805","name": "东风"}, {"code": "230811","name": "郊区"}, {"code": "230822","name": "桦南"}, {"code": "230826","name": "桦川"}, {"code": "230828","name": "汤原"}, {"code": "230881","name": "同江"}, {"code": "230882","name": "富锦"}, {"code": "230883","name": "抚远"}]}, {"code": "2309","name": "七台河","sub": [{"code": "230902","name": "新兴"}, {"code": "230903","name": "桃山"}, {"code": "230904","name": "茄子河"}, {"code": "230921","name": "勃利"}]}, {"code": "2310","name": "牡丹江","sub": [{"code": "231002","name": "东安"}, {"code": "231003","name": "阳明"}, {"code": "231004","name": "爱民"}, {"code": "231005","name": "西安"}, {"code": "231025","name": "林口"}, {"code": "231081","name": "绥芬河"}, {"code": "231083","name": "海林"}, {"code": "231084","name": "宁安"}, {"code": "231085","name": "穆棱"}, {"code": "231086","name": "东宁"}]}, {"code": "2311","name": "黑河","sub": [{"code": "231102","name": "爱辉"}, {"code": "231121","name": "嫩江"}, {"code": "231123","name": "逊克"}, {"code": "231124","name": "孙吴"}, {"code": "231181","name": "北安"}, {"code": "231182","name": "五大连池"}]}, {"code": "2312","name": "绥化","sub": [{"code": "231202","name": "北林"}, {"code": "231221","name": "望奎"}, {"code": "231222","name": "兰西"}, {"code": "231223","name": "青冈"}, {"code": "231224","name": "庆安"}, {"code": "231225","name": "明水"}, {"code": "231226","name": "绥棱"}, {"code": "231281","name": "安达"}, {"code": "231282","name": "肇东"}, {"code": "231283","name": "海伦"}]}, {"code": "2327","name": "大兴安岭","sub": [{"code": "232721","name": "呼玛"}, {"code": "232722","name": "塔河"}, {"code": "232723","name": "漠河"}]}]}, {"code": "31","name": "上海","sub": [{"code": "3101","name": "上海","sub": [{"code": "310101","name": "黄浦"}, {"code": "310104","name": "徐汇"}, {"code": "310105","name": "长宁"}, {"code": "310106","name": "静安"}, {"code": "310107","name": "普陀"}, {"code": "310109","name": "虹口"}, {"code": "310110","name": "杨浦"}, {"code": "310112","name": "闵行"}, {"code": "310113","name": "宝山"}, {"code": "310114","name": "嘉定"}, {"code": "310115","name": "浦东"}, {"code": "310116","name": "金山"}, {"code": "310117","name": "松江"}, {"code": "310118","name": "青浦"}, {"code": "310120","name": "奉贤"}, {"code": "310151","name": "崇明"}]}]}, {"code": "32","name": "江苏","sub": [{"code": "3201","name": "南京","sub": [{"code": "320102","name": "玄武"}, {"code": "320104","name": "秦淮"}, {"code": "320105","name": "建邺"}, {"code": "320106","name": "鼓楼"}, {"code": "320111","name": "浦口"}, {"code": "320113","name": "栖霞"}, {"code": "320114","name": "雨花台"}, {"code": "320115","name": "江宁"}, {"code": "320116","name": "六合"}, {"code": "320117","name": "溧水"}, {"code": "320118","name": "高淳"}]}, {"code": "3202","name": "无锡","sub": [{"code": "320205","name": "锡山"}, {"code": "320206","name": "惠山"}, {"code": "320211","name": "滨湖"}, {"code": "320213","name": "梁溪"}, {"code": "320214","name": "新吴"}, {"code": "320281","name": "江阴"}, {"code": "320282","name": "宜兴"}]}, {"code": "3203","name": "徐州","sub": [{"code": "320302","name": "鼓楼"}, {"code": "320303","name": "云龙"}, {"code": "320305","name": "贾汪"}, {"code": "320311","name": "泉山"}, {"code": "320312","name": "铜山"}, {"code": "320321","name": "丰县"}, {"code": "320322","name": "沛县"}, {"code": "320324","name": "睢宁"}, {"code": "320381","name": "新沂"}, {"code": "320382","name": "邳州"}]}, {"code": "3204","name": "常州","sub": [{"code": "320402","name": "天宁"}, {"code": "320404","name": "钟楼"}, {"code": "320411","name": "新北"}, {"code": "320412","name": "武进"}, {"code": "320413","name": "金坛"}, {"code": "320481","name": "溧阳"}]}, {"code": "3205","name": "苏州","sub": [{"code": "320505","name": "虎丘"}, {"code": "320506","name": "吴中"}, {"code": "320507","name": "相城"}, {"code": "320508","name": "姑苏"}, {"code": "320509","name": "吴江"}, {"code": "320581","name": "常熟"}, {"code": "320582","name": "张家港"}, {"code": "320583","name": "昆山"}, {"code": "320585","name": "太仓"}]}, {"code": "3206","name": "南通","sub": [{"code": "320602","name": "崇川"}, {"code": "320611","name": "港闸"}, {"code": "320612","name": "通州"}, {"code": "320621","name": "海安"}, {"code": "320623","name": "如东"}, {"code": "320681","name": "启东"}, {"code": "320682","name": "如皋"}, {"code": "320684","name": "海门"}]}, {"code": "3207","name": "连云港","sub": [{"code": "320703","name": "连云"}, {"code": "320706","name": "海州"}, {"code": "320707","name": "赣榆"}, {"code": "320722","name": "东海"}, {"code": "320723","name": "灌云"}, {"code": "320724","name": "灌南"}]}, {"code": "3208","name": "淮安","sub": [{"code": "320803","name": "淮安"}, {"code": "320804","name": "淮阴"}, {"code": "320812","name": "清江浦"}, {"code": "320813","name": "洪泽"}, {"code": "320826","name": "涟水"}, {"code": "320830","name": "盱眙"}, {"code": "320831","name": "金湖"}]}, {"code": "3209","name": "盐城","sub": [{"code": "320902","name": "亭湖"}, {"code": "320903","name": "盐都"}, {"code": "320904","name": "大丰"}, {"code": "320921","name": "响水"}, {"code": "320922","name": "滨海"}, {"code": "320923","name": "阜宁"}, {"code": "320924","name": "射阳"}, {"code": "320925","name": "建湖"}, {"code": "320981","name": "东台"}]}, {"code": "3210","name": "扬州","sub": [{"code": "321002","name": "广陵"}, {"code": "321003","name": "邗江"}, {"code": "321012","name": "江都"}, {"code": "321023","name": "宝应"}, {"code": "321081","name": "仪征"}, {"code": "321084","name": "高邮"}]}, {"code": "3211","name": "镇江","sub": [{"code": "321102","name": "京口"}, {"code": "321111","name": "润州"}, {"code": "321112","name": "丹徒"}, {"code": "321181","name": "丹阳"}, {"code": "321182","name": "扬中"}, {"code": "321183","name": "句容"}]}, {"code": "3212","name": "泰州","sub": [{"code": "321202","name": "海陵"}, {"code": "321203","name": "高港"}, {"code": "321204","name": "姜堰"}, {"code": "321281","name": "兴化"}, {"code": "321282","name": "靖江"}, {"code": "321283","name": "泰兴"}]}, {"code": "3213","name": "宿迁","sub": [{"code": "321302","name": "宿城"}, {"code": "321311","name": "宿豫"}, {"code": "321322","name": "沭阳"}, {"code": "321323","name": "泗阳"}, {"code": "321324","name": "泗洪"}]}]}, {"code": "33","name": "浙江","sub": [{"code": "3301","name": "杭州","sub": [{"code": "330102","name": "上城"}, {"code": "330103","name": "下城"}, {"code": "330104","name": "江干"}, {"code": "330105","name": "拱墅"}, {"code": "330106","name": "西湖"}, {"code": "330108","name": "滨江"}, {"code": "330109","name": "萧山"}, {"code": "330110","name": "余杭"}, {"code": "330111","name": "富阳"}, {"code": "330122","name": "桐庐"}, {"code": "330127","name": "淳安"}, {"code": "330182","name": "建德"}, {"code": "330185","name": "临安"}]}, {"code": "3302","name": "宁波","sub": [{"code": "330203","name": "海曙"}, {"code": "330204","name": "江东"}, {"code": "330205","name": "江北"}, {"code": "330206","name": "北仑"}, {"code": "330211","name": "镇海"}, {"code": "330212","name": "鄞州"}, {"code": "330225","name": "象山"}, {"code": "330226","name": "宁海"}, {"code": "330281","name": "余姚"}, {"code": "330282","name": "慈溪"}, {"code": "330283","name": "奉化"}]}, {"code": "3303","name": "温州","sub": [{"code": "330302","name": "鹿城"}, {"code": "330303","name": "龙湾"}, {"code": "330304","name": "瓯海"}, {"code": "330305","name": "洞头"}, {"code": "330324","name": "永嘉"}, {"code": "330326","name": "平阳"}, {"code": "330327","name": "苍南"}, {"code": "330328","name": "文成"}, {"code": "330329","name": "泰顺"}, {"code": "330381","name": "瑞安"}, {"code": "330382","name": "乐清"}]}, {"code": "3304","name": "嘉兴","sub": [{"code": "330402","name": "南湖"}, {"code": "330411","name": "秀洲"}, {"code": "330421","name": "嘉善"}, {"code": "330424","name": "海盐"}, {"code": "330481","name": "海宁"}, {"code": "330482","name": "平湖"}, {"code": "330483","name": "桐乡"}]}, {"code": "3305","name": "湖州","sub": [{"code": "330502","name": "吴兴"}, {"code": "330503","name": "南浔"}, {"code": "330521","name": "德清"}, {"code": "330522","name": "长兴"}, {"code": "330523","name": "安吉"}]}, {"code": "3306","name": "绍兴","sub": [{"code": "330602","name": "越城"}, {"code": "330603","name": "柯桥"}, {"code": "330604","name": "上虞"}, {"code": "330624","name": "新昌"}, {"code": "330681","name": "诸暨"}, {"code": "330683","name": "嵊州"}]}, {"code": "3307","name": "金华","sub": [{"code": "330702","name": "婺城"}, {"code": "330703","name": "金东"}, {"code": "330723","name": "武义"}, {"code": "330726","name": "浦江"}, {"code": "330727","name": "磐安"}, {"code": "330781","name": "兰溪"}, {"code": "330782","name": "义乌"}, {"code": "330783","name": "东阳"}, {"code": "330784","name": "永康"}]}, {"code": "3308","name": "衢州","sub": [{"code": "330802","name": "柯城"}, {"code": "330803","name": "衢江"}, {"code": "330822","name": "常山"}, {"code": "330824","name": "开化"}, {"code": "330825","name": "龙游"}, {"code": "330881","name": "江山"}]}, {"code": "3309","name": "舟山","sub": [{"code": "330902","name": "定海"}, {"code": "330903","name": "普陀"}, {"code": "330921","name": "岱山"}, {"code": "330922","name": "嵊泗"}]}, {"code": "3310","name": "台州","sub": [{"code": "331002","name": "椒江"}, {"code": "331003","name": "黄岩"}, {"code": "331004","name": "路桥"}, {"code": "331021","name": "玉环"}, {"code": "331022","name": "三门"}, {"code": "331023","name": "天台"}, {"code": "331024","name": "仙居"}, {"code": "331081","name": "温岭"}, {"code": "331082","name": "临海"}]}, {"code": "3311","name": "丽水","sub": [{"code": "331102","name": "莲都"}, {"code": "331121","name": "青田"}, {"code": "331122","name": "缙云"}, {"code": "331123","name": "遂昌"}, {"code": "331124","name": "松阳"}, {"code": "331125","name": "云和"}, {"code": "331126","name": "庆元"}, {"code": "331127","name": "景宁"}, {"code": "331181","name": "龙泉"}]}]}, {"code": "34","name": "安徽","sub": [{"code": "3401","name": "合肥","sub": [{"code": "340102","name": "瑶海"}, {"code": "340103","name": "庐阳"}, {"code": "340104","name": "蜀山"}, {"code": "340111","name": "包河"}, {"code": "340121","name": "长丰"}, {"code": "340122","name": "肥东"}, {"code": "340123","name": "肥西"}, {"code": "340124","name": "庐江"}, {"code": "340181","name": "巢湖"}]}, {"code": "3402","name": "芜湖","sub": [{"code": "340202","name": "镜湖"}, {"code": "340203","name": "弋江"}, {"code": "340207","name": "鸠江"}, {"code": "340208","name": "三山"}, {"code": "340221","name": "芜湖"}, {"code": "340222","name": "繁昌"}, {"code": "340223","name": "南陵"}, {"code": "340225","name": "无为"}]}, {"code": "3403","name": "蚌埠","sub": [{"code": "340302","name": "龙子湖"}, {"code": "340303","name": "蚌山"}, {"code": "340304","name": "禹会"}, {"code": "340311","name": "淮上"}, {"code": "340321","name": "怀远"}, {"code": "340322","name": "五河"}, {"code": "340323","name": "固镇"}]}, {"code": "3404","name": "淮南","sub": [{"code": "340402","name": "大通"}, {"code": "340403","name": "田家庵"}, {"code": "340404","name": "谢家集"}, {"code": "340405","name": "八公山"}, {"code": "340406","name": "潘集"}, {"code": "340421","name": "凤台"}, {"code": "340422","name": "寿县"}]}, {"code": "3405","name": "马鞍山","sub": [{"code": "340503","name": "花山"}, {"code": "340504","name": "雨山"}, {"code": "340506","name": "博望"}, {"code": "340521","name": "当涂"}, {"code": "340522","name": "含山"}, {"code": "340523","name": "和县"}]}, {"code": "3406","name": "淮北","sub": [{"code": "340602","name": "杜集"}, {"code": "340603","name": "相山"}, {"code": "340604","name": "烈山"}, {"code": "340621","name": "濉溪"}]}, {"code": "3407","name": "铜陵","sub": [{"code": "340705","name": "铜官"}, {"code": "340706","name": "义安"}, {"code": "340711","name": "郊区"}, {"code": "340722","name": "枞阳"}]}, {"code": "3408","name": "安庆","sub": [{"code": "340802","name": "迎江"}, {"code": "340803","name": "大观"}, {"code": "340811","name": "宜秀"}, {"code": "340822","name": "怀宁"}, {"code": "340824","name": "潜山"}, {"code": "340825","name": "太湖"}, {"code": "340826","name": "宿松"}, {"code": "340827","name": "望江"}, {"code": "340828","name": "岳西"}, {"code": "340881","name": "桐城"}]}, {"code": "3410","name": "黄山","sub": [{"code": "341002","name": "屯溪"}, {"code": "341003","name": "黄山"}, {"code": "341004","name": "徽州"}, {"code": "341021","name": "歙县"}, {"code": "341022","name": "休宁"}, {"code": "341023","name": "黟县"}, {"code": "341024","name": "祁门"}]}, {"code": "3411","name": "滁州","sub": [{"code": "341102","name": "琅琊"}, {"code": "341103","name": "南谯"}, {"code": "341122","name": "来安"}, {"code": "341124","name": "全椒"}, {"code": "341125","name": "定远"}, {"code": "341126","name": "凤阳"}, {"code": "341181","name": "天长"}, {"code": "341182","name": "明光"}]}, {"code": "3412","name": "阜阳","sub": [{"code": "341202","name": "颍州"}, {"code": "341203","name": "颍东"}, {"code": "341204","name": "颍泉"}, {"code": "341221","name": "临泉"}, {"code": "341222","name": "太和"}, {"code": "341225","name": "阜南"}, {"code": "341226","name": "颍上"}, {"code": "341282","name": "界首"}]}, {"code": "3413","name": "宿州","sub": [{"code": "341302","name": "埇桥"}, {"code": "341321","name": "砀山"}, {"code": "341322","name": "萧县"}, {"code": "341323","name": "灵璧"}, {"code": "341324","name": "泗县"}]}, {"code": "3415","name": "六安","sub": [{"code": "341502","name": "金安"}, {"code": "341503","name": "裕安"}, {"code": "341504","name": "叶集"}, {"code": "341522","name": "霍邱"}, {"code": "341523","name": "舒城"}, {"code": "341524","name": "金寨"}, {"code": "341525","name": "霍山"}]}, {"code": "3416","name": "亳州","sub": [{"code": "341602","name": "谯城"}, {"code": "341621","name": "涡阳"}, {"code": "341622","name": "蒙城"}, {"code": "341623","name": "利辛"}]}, {"code": "3417","name": "池州","sub": [{"code": "341702","name": "贵池"}, {"code": "341721","name": "东至"}, {"code": "341722","name": "石台"}, {"code": "341723","name": "青阳"}]}, {"code": "3418","name": "宣城","sub": [{"code": "341802","name": "宣州"}, {"code": "341821","name": "郎溪"}, {"code": "341822","name": "广德"}, {"code": "341823","name": "泾县"}, {"code": "341824","name": "绩溪"}, {"code": "341825","name": "旌德"}, {"code": "341881","name": "宁国"}]}]}, {"code": "35","name": "福建","sub": [{"code": "3501","name": "福州","sub": [{"code": "350102","name": "鼓楼"}, {"code": "350103","name": "台江"}, {"code": "350104","name": "仓山"}, {"code": "350105","name": "马尾"}, {"code": "350111","name": "晋安"}, {"code": "350121","name": "闽侯"}, {"code": "350122","name": "连江"}, {"code": "350123","name": "罗源"}, {"code": "350124","name": "闽清"}, {"code": "350125","name": "永泰"}, {"code": "350128","name": "平潭"}, {"code": "350181","name": "福清"}, {"code": "350182","name": "长乐"}]}, {"code": "3502","name": "厦门","sub": [{"code": "350203","name": "思明"}, {"code": "350205","name": "海沧"}, {"code": "350206","name": "湖里"}, {"code": "350211","name": "集美"}, {"code": "350212","name": "同安"}, {"code": "350213","name": "翔安"}]}, {"code": "3503","name": "莆田","sub": [{"code": "350302","name": "城厢"}, {"code": "350303","name": "涵江"}, {"code": "350304","name": "荔城"}, {"code": "350305","name": "秀屿"}, {"code": "350322","name": "仙游"}]}, {"code": "3504","name": "三明","sub": [{"code": "350402","name": "梅列"}, {"code": "350403","name": "三元"}, {"code": "350421","name": "明溪"}, {"code": "350423","name": "清流"}, {"code": "350424","name": "宁化"}, {"code": "350425","name": "大田"}, {"code": "350426","name": "尤溪"}, {"code": "350427","name": "沙县"}, {"code": "350428","name": "将乐"}, {"code": "350429","name": "泰宁"}, {"code": "350430","name": "建宁"}, {"code": "350481","name": "永安"}]}, {"code": "3505","name": "泉州","sub": [{"code": "350502","name": "鲤城"}, {"code": "350503","name": "丰泽"}, {"code": "350504","name": "洛江"}, {"code": "350505","name": "泉港"}, {"code": "350521","name": "惠安"}, {"code": "350524","name": "安溪"}, {"code": "350525","name": "永春"}, {"code": "350526","name": "德化"}, {"code": "350527","name": "金门"}, {"code": "350581","name": "石狮"}, {"code": "350582","name": "晋江"}, {"code": "350583","name": "南安"}]}, {"code": "3506","name": "漳州","sub": [{"code": "350602","name": "芗城"}, {"code": "350603","name": "龙文"}, {"code": "350622","name": "云霄"}, {"code": "350623","name": "漳浦"}, {"code": "350624","name": "诏安"}, {"code": "350625","name": "长泰"}, {"code": "350626","name": "东山"}, {"code": "350627","name": "南靖"}, {"code": "350628","name": "平和"}, {"code": "350629","name": "华安"}, {"code": "350681","name": "龙海"}]}, {"code": "3507","name": "南平","sub": [{"code": "350702","name": "延平"}, {"code": "350703","name": "建阳"}, {"code": "350721","name": "顺昌"}, {"code": "350722","name": "浦城"}, {"code": "350723","name": "光泽"}, {"code": "350724","name": "松溪"}, {"code": "350725","name": "政和"}, {"code": "350781","name": "邵武"}, {"code": "350782","name": "武夷山"}, {"code": "350783","name": "建瓯"}]}, {"code": "3508","name": "龙岩","sub": [{"code": "350802","name": "新罗"}, {"code": "350803","name": "永定"}, {"code": "350821","name": "长汀"}, {"code": "350823","name": "上杭"}, {"code": "350824","name": "武平"}, {"code": "350825","name": "连城"}, {"code": "350881","name": "漳平"}]}, {"code": "3509","name": "宁德","sub": [{"code": "350902","name": "蕉城"}, {"code": "350921","name": "霞浦"}, {"code": "350922","name": "古田"}, {"code": "350923","name": "屏南"}, {"code": "350924","name": "寿宁"}, {"code": "350925","name": "周宁"}, {"code": "350926","name": "柘荣"}, {"code": "350981","name": "福安"}, {"code": "350982","name": "福鼎"}]}]}, {"code": "36","name": "江西","sub": [{"code": "3601","name": "南昌","sub": [{"code": "360102","name": "东湖"}, {"code": "360103","name": "西湖"}, {"code": "360104","name": "青云谱"}, {"code": "360105","name": "湾里"}, {"code": "360111","name": "青山湖"}, {"code": "360112","name": "新建"}, {"code": "360121","name": "南昌"}, {"code": "360123","name": "安义"}, {"code": "360124","name": "进贤"}]}, {"code": "3602","name": "景德镇","sub": [{"code": "360202","name": "昌江"}, {"code": "360203","name": "珠山"}, {"code": "360222","name": "浮梁"}, {"code": "360281","name": "乐平"}]}, {"code": "3603","name": "萍乡","sub": [{"code": "360302","name": "安源"}, {"code": "360313","name": "湘东"}, {"code": "360321","name": "莲花"}, {"code": "360322","name": "上栗"}, {"code": "360323","name": "芦溪"}]}, {"code": "3604","name": "九江","sub": [{"code": "360402","name": "濂溪"}, {"code": "360403","name": "浔阳"}, {"code": "360421","name": "九江"}, {"code": "360423","name": "武宁"}, {"code": "360424","name": "修水"}, {"code": "360425","name": "永修"}, {"code": "360426","name": "德安"}, {"code": "360428","name": "都昌"}, {"code": "360429","name": "湖口"}, {"code": "360430","name": "彭泽"}, {"code": "360481","name": "瑞昌"}, {"code": "360482","name": "共青城"}, {"code": "360483","name": "庐山"}]}, {"code": "3605","name": "新余","sub": [{"code": "360502","name": "渝水"}, {"code": "360521","name": "分宜"}]}, {"code": "3606","name": "鹰潭","sub": [{"code": "360602","name": "月湖"}, {"code": "360622","name": "余江"}, {"code": "360681","name": "贵溪"}]}, {"code": "3607","name": "赣州","sub": [{"code": "360702","name": "章贡"}, {"code": "360703","name": "南康"}, {"code": "360721","name": "赣县"}, {"code": "360722","name": "信丰"}, {"code": "360723","name": "大余"}, {"code": "360724","name": "上犹"}, {"code": "360725","name": "崇义"}, {"code": "360726","name": "安远"}, {"code": "360727","name": "龙南"}, {"code": "360728","name": "定南"}, {"code": "360729","name": "全南"}, {"code": "360730","name": "宁都"}, {"code": "360731","name": "于都"}, {"code": "360732","name": "兴国"}, {"code": "360733","name": "会昌"}, {"code": "360734","name": "寻乌"}, {"code": "360735","name": "石城"}, {"code": "360781","name": "瑞金"}]}, {"code": "3608","name": "吉安","sub": [{"code": "360802","name": "吉州"}, {"code": "360803","name": "青原"}, {"code": "360821","name": "吉安"}, {"code": "360822","name": "吉水"}, {"code": "360823","name": "峡江"}, {"code": "360824","name": "新干"}, {"code": "360825","name": "永丰"}, {"code": "360826","name": "泰和"}, {"code": "360827","name": "遂川"}, {"code": "360828","name": "万安"}, {"code": "360829","name": "安福"}, {"code": "360830","name": "永新"}, {"code": "360881","name": "井冈山"}]}, {"code": "3609","name": "宜春","sub": [{"code": "360902","name": "袁州"}, {"code": "360921","name": "奉新"}, {"code": "360922","name": "万载"}, {"code": "360923","name": "上高"}, {"code": "360924","name": "宜丰"}, {"code": "360925","name": "靖安"}, {"code": "360926","name": "铜鼓"}, {"code": "360981","name": "丰城"}, {"code": "360982","name": "樟树"}, {"code": "360983","name": "高安"}]}, {"code": "3610","name": "抚州","sub": [{"code": "361002","name": "临川"}, {"code": "361021","name": "南城"}, {"code": "361022","name": "黎川"}, {"code": "361023","name": "南丰"}, {"code": "361024","name": "崇仁"}, {"code": "361025","name": "乐安"}, {"code": "361026","name": "宜黄"}, {"code": "361027","name": "金溪"}, {"code": "361028","name": "资溪"}, {"code": "361029","name": "东乡"}, {"code": "361030","name": "广昌"}]}, {"code": "3611","name": "上饶","sub": [{"code": "361102","name": "信州"}, {"code": "361103","name": "广丰"}, {"code": "361121","name": "上饶"}, {"code": "361123","name": "玉山"}, {"code": "361124","name": "铅山"}, {"code": "361125","name": "横峰"}, {"code": "361126","name": "弋阳"}, {"code": "361127","name": "余干"}, {"code": "361128","name": "鄱阳"}, {"code": "361129","name": "万年"}, {"code": "361130","name": "婺源"}, {"code": "361181","name": "德兴"}]}]}, {"code": "37","name": "山东","sub": [{"code": "3701","name": "济南","sub": [{"code": "370102","name": "历下"}, {"code": "370103","name": "市中"}, {"code": "370104","name": "槐荫"}, {"code": "370105","name": "天桥"}, {"code": "370112","name": "历城"}, {"code": "370113","name": "长清"}, {"code": "370124","name": "平阴"}, {"code": "370125","name": "济阳"}, {"code": "370126","name": "商河"}, {"code": "370181","name": "章丘"}]}, {"code": "3702","name": "青岛","sub": [{"code": "370202","name": "市南"}, {"code": "370203","name": "市北"}, {"code": "370211","name": "黄岛"}, {"code": "370212","name": "崂山"}, {"code": "370213","name": "李沧"}, {"code": "370214","name": "城阳"}, {"code": "370281","name": "胶州"}, {"code": "370282","name": "即墨"}, {"code": "370283","name": "平度"}, {"code": "370285","name": "莱西"}]}, {"code": "3703","name": "淄博","sub": [{"code": "370302","name": "淄川"}, {"code": "370303","name": "张店"}, {"code": "370304","name": "博山"}, {"code": "370305","name": "临淄"}, {"code": "370306","name": "周村"}, {"code": "370321","name": "桓台"}, {"code": "370322","name": "高青"}, {"code": "370323","name": "沂源"}]}, {"code": "3704","name": "枣庄","sub": [{"code": "370402","name": "市中"}, {"code": "370403","name": "薛城"}, {"code": "370404","name": "峄城"}, {"code": "370405","name": "台儿庄"}, {"code": "370406","name": "山亭"}, {"code": "370481","name": "滕州"}]}, {"code": "3705","name": "东营","sub": [{"code": "370502","name": "东营"}, {"code": "370503","name": "河口"}, {"code": "370505","name": "垦利"}, {"code": "370522","name": "利津"}, {"code": "370523","name": "广饶"}]}, {"code": "3706","name": "烟台","sub": [{"code": "370602","name": "芝罘"}, {"code": "370611","name": "福山"}, {"code": "370612","name": "牟平"}, {"code": "370613","name": "莱山"}, {"code": "370634","name": "长岛"}, {"code": "370681","name": "龙口"}, {"code": "370682","name": "莱阳"}, {"code": "370683","name": "莱州"}, {"code": "370684","name": "蓬莱"}, {"code": "370685","name": "招远"}, {"code": "370686","name": "栖霞"}, {"code": "370687","name": "海阳"}]}, {"code": "3707","name": "潍坊","sub": [{"code": "370702","name": "潍城"}, {"code": "370703","name": "寒亭"}, {"code": "370704","name": "坊子"}, {"code": "370705","name": "奎文"}, {"code": "370724","name": "临朐"}, {"code": "370725","name": "昌乐"}, {"code": "370781","name": "青州"}, {"code": "370782","name": "诸城"}, {"code": "370783","name": "寿光"}, {"code": "370784","name": "安丘"}, {"code": "370785","name": "高密"}, {"code": "370786","name": "昌邑"}]}, {"code": "3708","name": "济宁","sub": [{"code": "370811","name": "任城"}, {"code": "370812","name": "兖州"}, {"code": "370826","name": "微山"}, {"code": "370827","name": "鱼台"}, {"code": "370828","name": "金乡"}, {"code": "370829","name": "嘉祥"}, {"code": "370830","name": "汶上"}, {"code": "370831","name": "泗水"}, {"code": "370832","name": "梁山"}, {"code": "370881","name": "曲阜"}, {"code": "370883","name": "邹城"}]}, {"code": "3709","name": "泰安","sub": [{"code": "370902","name": "泰山"}, {"code": "370911","name": "岱岳"}, {"code": "370921","name": "宁阳"}, {"code": "370923","name": "东平"}, {"code": "370982","name": "新泰"}, {"code": "370983","name": "肥城"}]}, {"code": "3710","name": "威海","sub": [{"code": "371002","name": "环翠"}, {"code": "371003","name": "文登"}, {"code": "371082","name": "荣成"}, {"code": "371083","name": "乳山"}]}, {"code": "3711","name": "日照","sub": [{"code": "371102","name": "东港"}, {"code": "371103","name": "岚山"}, {"code": "371121","name": "五莲"}, {"code": "371122","name": "莒县"}]}, {"code": "3712","name": "莱芜","sub": [{"code": "371202","name": "莱城"}, {"code": "371203","name": "钢城"}]}, {"code": "3713","name": "临沂","sub": [{"code": "371302","name": "兰山"}, {"code": "371311","name": "罗庄"}, {"code": "371312","name": "河东"}, {"code": "371321","name": "沂南"}, {"code": "371322","name": "郯城"}, {"code": "371323","name": "沂水"}, {"code": "371324","name": "兰陵"}, {"code": "371325","name": "费县"}, {"code": "371326","name": "平邑"}, {"code": "371327","name": "莒南"}, {"code": "371328","name": "蒙阴"}, {"code": "371329","name": "临沭"}]}, {"code": "3714","name": "德州","sub": [{"code": "371402","name": "德城"}, {"code": "371403","name": "陵城"}, {"code": "371422","name": "宁津"}, {"code": "371423","name": "庆云"}, {"code": "371424","name": "临邑"}, {"code": "371425","name": "齐河"}, {"code": "371426","name": "平原"}, {"code": "371427","name": "夏津"}, {"code": "371428","name": "武城"}, {"code": "371481","name": "乐陵"}, {"code": "371482","name": "禹城"}]}, {"code": "3715","name": "聊城","sub": [{"code": "371502","name": "东昌府"}, {"code": "371521","name": "阳谷"}, {"code": "371522","name": "莘县"}, {"code": "371523","name": "茌平"}, {"code": "371524","name": "东阿"}, {"code": "371525","name": "冠县"}, {"code": "371526","name": "高唐"}, {"code": "371581","name": "临清"}]}, {"code": "3716","name": "滨州","sub": [{"code": "371602","name": "滨城"}, {"code": "371603","name": "沾化"}, {"code": "371621","name": "惠民"}, {"code": "371622","name": "阳信"}, {"code": "371623","name": "无棣"}, {"code": "371625","name": "博兴"}, {"code": "371626","name": "邹平"}]}, {"code": "3717","name": "菏泽","sub": [{"code": "371702","name": "牡丹"}, {"code": "371703","name": "定陶"}, {"code": "371721","name": "曹县"}, {"code": "371722","name": "单县"}, {"code": "371723","name": "成武"}, {"code": "371724","name": "巨野"}, {"code": "371725","name": "郓城"}, {"code": "371726","name": "鄄城"}, {"code": "371728","name": "东明"}]}]}, {"code": "41","name": "河南","sub": [{"code": "4101","name": "郑州","sub": [{"code": "410102","name": "中原"}, {"code": "410103","name": "二七"}, {"code": "410104","name": "管城"}, {"code": "410105","name": "金水"}, {"code": "410106","name": "上街"}, {"code": "410108","name": "惠济"}, {"code": "410122","name": "中牟"}, {"code": "410181","name": "巩义"}, {"code": "410182","name": "荥阳"}, {"code": "410183","name": "新密"}, {"code": "410184","name": "新郑"}, {"code": "410185","name": "登封"}]}, {"code": "4102","name": "开封","sub": [{"code": "410202","name": "龙亭"}, {"code": "410203","name": "顺河"}, {"code": "410204","name": "鼓楼"}, {"code": "410205","name": "禹王台"}, {"code": "410211","name": "金明"}, {"code": "410212","name": "祥符"}, {"code": "410221","name": "杞县"}, {"code": "410222","name": "通许"}, {"code": "410223","name": "尉氏"}, {"code": "410225","name": "兰考"}]}, {"code": "4103","name": "洛阳","sub": [{"code": "410302","name": "老城"}, {"code": "410303","name": "西工"}, {"code": "410304","name": "瀍河"}, {"code": "410305","name": "涧西"}, {"code": "410306","name": "吉利"}, {"code": "410311","name": "洛龙"}, {"code": "410322","name": "孟津"}, {"code": "410323","name": "新安"}, {"code": "410324","name": "栾川"}, {"code": "410325","name": "嵩县"}, {"code": "410326","name": "汝阳"}, {"code": "410327","name": "宜阳"}, {"code": "410328","name": "洛宁"}, {"code": "410329","name": "伊川"}, {"code": "410381","name": "偃师"}]}, {"code": "4104","name": "平顶山","sub": [{"code": "410402","name": "新华"}, {"code": "410403","name": "卫东"}, {"code": "410404","name": "石龙"}, {"code": "410411","name": "湛河"}, {"code": "410421","name": "宝丰"}, {"code": "410422","name": "叶县"}, {"code": "410423","name": "鲁山"}, {"code": "410425","name": "郏县"}, {"code": "410481","name": "舞钢"}, {"code": "410482","name": "汝州"}]}, {"code": "4105","name": "安阳","sub": [{"code": "410502","name": "文峰"}, {"code": "410503","name": "北关"}, {"code": "410505","name": "殷都"}, {"code": "410506","name": "龙安"}, {"code": "410522","name": "安阳"}, {"code": "410523","name": "汤阴"}, {"code": "410526","name": "滑县"}, {"code": "410527","name": "内黄"}, {"code": "410581","name": "林州"}]}, {"code": "4106","name": "鹤壁","sub": [{"code": "410602","name": "鹤山"}, {"code": "410603","name": "山城"}, {"code": "410611","name": "淇滨"}, {"code": "410621","name": "浚县"}, {"code": "410622","name": "淇县"}]}, {"code": "4107","name": "新乡","sub": [{"code": "410702","name": "红旗"}, {"code": "410703","name": "卫滨"}, {"code": "410704","name": "凤泉"}, {"code": "410711","name": "牧野"}, {"code": "410721","name": "新乡"}, {"code": "410724","name": "获嘉"}, {"code": "410725","name": "原阳"}, {"code": "410726","name": "延津"}, {"code": "410727","name": "封丘"}, {"code": "410728","name": "长垣"}, {"code": "410781","name": "卫辉"}, {"code": "410782","name": "辉县"}]}, {"code": "4108","name": "焦作","sub": [{"code": "410802","name": "解放"}, {"code": "410803","name": "中站"}, {"code": "410804","name": "马村"}, {"code": "410811","name": "山阳"}, {"code": "410821","name": "修武"}, {"code": "410822","name": "博爱"}, {"code": "410823","name": "武陟"}, {"code": "410825","name": "温县"}, {"code": "410882","name": "沁阳"}, {"code": "410883","name": "孟州"}]}, {"code": "4109","name": "濮阳","sub": [{"code": "410902","name": "华龙"}, {"code": "410922","name": "清丰"}, {"code": "410923","name": "南乐"}, {"code": "410926","name": "范县"}, {"code": "410927","name": "台前"}, {"code": "410928","name": "濮阳"}]}, {"code": "4110","name": "许昌","sub": [{"code": "411002","name": "魏都"}, {"code": "411023","name": "许昌"}, {"code": "411024","name": "鄢陵"}, {"code": "411025","name": "襄城"}, {"code": "411081","name": "禹州"}, {"code": "411082","name": "长葛"}]}, {"code": "4111","name": "漯河","sub": [{"code": "411102","name": "源汇"}, {"code": "411103","name": "郾城"}, {"code": "411104","name": "召陵"}, {"code": "411121","name": "舞阳"}, {"code": "411122","name": "临颍"}]}, {"code": "4112","name": "三门峡","sub": [{"code": "411202","name": "湖滨"}, {"code": "411203","name": "陕州"}, {"code": "411221","name": "渑池"}, {"code": "411224","name": "卢氏"}, {"code": "411281","name": "义马"}, {"code": "411282","name": "灵宝"}]}, {"code": "4113","name": "南阳","sub": [{"code": "411302","name": "宛城"}, {"code": "411303","name": "卧龙"}, {"code": "411321","name": "南召"}, {"code": "411322","name": "方城"}, {"code": "411323","name": "西峡"}, {"code": "411324","name": "镇平"}, {"code": "411325","name": "内乡"}, {"code": "411326","name": "淅川"}, {"code": "411327","name": "社旗"}, {"code": "411328","name": "唐河"}, {"code": "411329","name": "新野"}, {"code": "411330","name": "桐柏"}, {"code": "411381","name": "邓州"}]}, {"code": "4114","name": "商丘","sub": [{"code": "411402","name": "梁园"}, {"code": "411403","name": "睢阳"}, {"code": "411421","name": "民权"}, {"code": "411422","name": "睢县"}, {"code": "411423","name": "宁陵"}, {"code": "411424","name": "柘城"}, {"code": "411425","name": "虞城"}, {"code": "411426","name": "夏邑"}, {"code": "411481","name": "永城"}]}, {"code": "4115","name": "信阳","sub": [{"code": "411502","name": "浉河"}, {"code": "411503","name": "平桥"}, {"code": "411521","name": "罗山"}, {"code": "411522","name": "光山"}, {"code": "411523","name": "新县"}, {"code": "411524","name": "商城"}, {"code": "411525","name": "固始"}, {"code": "411526","name": "潢川"}, {"code": "411527","name": "淮滨"}, {"code": "411528","name": "息县"}]}, {"code": "4116","name": "周口","sub": [{"code": "411602","name": "川汇"}, {"code": "411621","name": "扶沟"}, {"code": "411622","name": "西华"}, {"code": "411623","name": "商水"}, {"code": "411624","name": "沈丘"}, {"code": "411625","name": "郸城"}, {"code": "411626","name": "淮阳"}, {"code": "411627","name": "太康"}, {"code": "411628","name": "鹿邑"}, {"code": "411681","name": "项城"}]}, {"code": "4117","name": "驻马店","sub": [{"code": "411702","name": "驿城"}, {"code": "411721","name": "西平"}, {"code": "411722","name": "上蔡"}, {"code": "411723","name": "平舆"}, {"code": "411724","name": "正阳"}, {"code": "411725","name": "确山"}, {"code": "411726","name": "泌阳"}, {"code": "411727","name": "汝南"}, {"code": "411728","name": "遂平"}, {"code": "411729","name": "新蔡"}]}, {"code": "4190","name": "河南","sub": [{"code": "419001","name": "济源"}]}]}, {"code": "42","name": "湖北","sub": [{"code": "4201","name": "武汉","sub": [{"code": "420102","name": "江岸"}, {"code": "420103","name": "江汉"}, {"code": "420104","name": "硚口"}, {"code": "420105","name": "汉阳"}, {"code": "420106","name": "武昌"}, {"code": "420107","name": "青山"}, {"code": "420111","name": "洪山"}, {"code": "420112","name": "东西湖"}, {"code": "420113","name": "汉南"}, {"code": "420114","name": "蔡甸"}, {"code": "420115","name": "江夏"}, {"code": "420116","name": "黄陂"}, {"code": "420117","name": "新洲"}]}, {"code": "4202","name": "黄石","sub": [{"code": "420202","name": "黄石港"}, {"code": "420203","name": "西塞山"}, {"code": "420204","name": "下陆"}, {"code": "420205","name": "铁山"}, {"code": "420222","name": "阳新"}, {"code": "420281","name": "大冶"}]}, {"code": "4203","name": "十堰","sub": [{"code": "420302","name": "茅箭"}, {"code": "420303","name": "张湾"}, {"code": "420304","name": "郧阳"}, {"code": "420322","name": "郧西"}, {"code": "420323","name": "竹山"}, {"code": "420324","name": "竹溪"}, {"code": "420325","name": "房县"}, {"code": "420381","name": "丹江口"}]}, {"code": "4205","name": "宜昌","sub": [{"code": "420502","name": "西陵"}, {"code": "420503","name": "伍家岗"}, {"code": "420504","name": "点军"}, {"code": "420505","name": "猇亭"}, {"code": "420506","name": "夷陵"}, {"code": "420525","name": "远安"}, {"code": "420526","name": "兴山"}, {"code": "420527","name": "秭归"}, {"code": "420528","name": "长阳"}, {"code": "420529","name": "五峰"}, {"code": "420581","name": "宜都"}, {"code": "420582","name": "当阳"}, {"code": "420583","name": "枝江"}]}, {"code": "4206","name": "襄阳","sub": [{"code": "420602","name": "襄城"}, {"code": "420606","name": "樊城"}, {"code": "420607","name": "襄州"}, {"code": "420624","name": "南漳"}, {"code": "420625","name": "谷城"}, {"code": "420626","name": "保康"}, {"code": "420682","name": "老河口"}, {"code": "420683","name": "枣阳"}, {"code": "420684","name": "宜城"}]}, {"code": "4207","name": "鄂州","sub": [{"code": "420702","name": "梁子湖"}, {"code": "420703","name": "华容"}, {"code": "420704","name": "鄂城"}]}, {"code": "4208","name": "荆门","sub": [{"code": "420802","name": "东宝"}, {"code": "420804","name": "掇刀"}, {"code": "420821","name": "京山"}, {"code": "420822","name": "沙洋"}, {"code": "420881","name": "钟祥"}]}, {"code": "4209","name": "孝感","sub": [{"code": "420902","name": "孝南"}, {"code": "420921","name": "孝昌"}, {"code": "420922","name": "大悟"}, {"code": "420923","name": "云梦"}, {"code": "420981","name": "应城"}, {"code": "420982","name": "安陆"}, {"code": "420984","name": "汉川"}]}, {"code": "4210","name": "荆州","sub": [{"code": "421002","name": "沙市"}, {"code": "421003","name": "荆州"}, {"code": "421022","name": "公安"}, {"code": "421023","name": "监利"}, {"code": "421024","name": "江陵"}, {"code": "421081","name": "石首"}, {"code": "421083","name": "洪湖"}, {"code": "421087","name": "松滋"}]}, {"code": "4211","name": "黄冈","sub": [{"code": "421102","name": "黄州"}, {"code": "421121","name": "团风"}, {"code": "421122","name": "红安"}, {"code": "421123","name": "罗田"}, {"code": "421124","name": "英山"}, {"code": "421125","name": "浠水"}, {"code": "421126","name": "蕲春"}, {"code": "421127","name": "黄梅"}, {"code": "421181","name": "麻城"}, {"code": "421182","name": "武穴"}]}, {"code": "4212","name": "咸宁","sub": [{"code": "421202","name": "咸安"}, {"code": "421221","name": "嘉鱼"}, {"code": "421222","name": "通城"}, {"code": "421223","name": "崇阳"}, {"code": "421224","name": "通山"}, {"code": "421281","name": "赤壁"}]}, {"code": "4213","name": "随州","sub": [{"code": "421303","name": "曾都"}, {"code": "421321","name": "随县"}, {"code": "421381","name": "广水"}]}, {"code": "4228","name": "恩施土家族苗族自治州","sub": [{"code": "422801","name": "恩施"}, {"code": "422802","name": "利川"}, {"code": "422822","name": "建始"}, {"code": "422823","name": "巴东"}, {"code": "422825","name": "宣恩"}, {"code": "422826","name": "咸丰"}, {"code": "422827","name": "来凤"}, {"code": "422828","name": "鹤峰"}]}, {"code": "4290","name": "湖北","sub": [{"code": "429004","name": "仙桃"}, {"code": "429005","name": "潜江"}, {"code": "429006","name": "天门"}, {"code": "429021","name": "神农架"}]}]}, {"code": "43","name": "湖南","sub": [{"code": "4301","name": "长沙","sub": [{"code": "430102","name": "芙蓉"}, {"code": "430103","name": "天心"}, {"code": "430104","name": "岳麓"}, {"code": "430105","name": "开福"}, {"code": "430111","name": "雨花"}, {"code": "430112","name": "望城"}, {"code": "430121","name": "长沙"}, {"code": "430124","name": "宁乡"}, {"code": "430181","name": "浏阳"}]}, {"code": "4302","name": "株洲","sub": [{"code": "430202","name": "荷塘"}, {"code": "430203","name": "芦淞"}, {"code": "430204","name": "石峰"}, {"code": "430211","name": "天元"}, {"code": "430221","name": "株洲"}, {"code": "430223","name": "攸县"}, {"code": "430224","name": "茶陵"}, {"code": "430225","name": "炎陵"}, {"code": "430281","name": "醴陵"}]}, {"code": "4303","name": "湘潭","sub": [{"code": "430302","name": "雨湖"}, {"code": "430304","name": "岳塘"}, {"code": "430321","name": "湘潭"}, {"code": "430381","name": "湘乡"}, {"code": "430382","name": "韶山"}]}, {"code": "4304","name": "衡阳","sub": [{"code": "430405","name": "珠晖"}, {"code": "430406","name": "雁峰"}, {"code": "430407","name": "石鼓"}, {"code": "430408","name": "蒸湘"}, {"code": "430412","name": "南岳"}, {"code": "430421","name": "衡阳"}, {"code": "430422","name": "衡南"}, {"code": "430423","name": "衡山"}, {"code": "430424","name": "衡东"}, {"code": "430426","name": "祁东"}, {"code": "430481","name": "耒阳"}, {"code": "430482","name": "常宁"}]}, {"code": "4305","name": "邵阳","sub": [{"code": "430502","name": "双清"}, {"code": "430503","name": "大祥"}, {"code": "430511","name": "北塔"}, {"code": "430521","name": "邵东"}, {"code": "430522","name": "新邵"}, {"code": "430523","name": "邵阳"}, {"code": "430524","name": "隆回"}, {"code": "430525","name": "洞口"}, {"code": "430527","name": "绥宁"}, {"code": "430528","name": "新宁"}, {"code": "430529","name": "城步"}, {"code": "430581","name": "武冈"}]}, {"code": "4306","name": "岳阳","sub": [{"code": "430602","name": "岳阳楼"}, {"code": "430603","name": "云溪"}, {"code": "430611","name": "君山"}, {"code": "430621","name": "岳阳"}, {"code": "430623","name": "华容"}, {"code": "430624","name": "湘阴"}, {"code": "430626","name": "平江"}, {"code": "430681","name": "汨罗"}, {"code": "430682","name": "临湘"}]}, {"code": "4307","name": "常德","sub": [{"code": "430702","name": "武陵"}, {"code": "430703","name": "鼎城"}, {"code": "430721","name": "安乡"}, {"code": "430722","name": "汉寿"}, {"code": "430723","name": "澧县"}, {"code": "430724","name": "临澧"}, {"code": "430725","name": "桃源"}, {"code": "430726","name": "石门"}, {"code": "430781","name": "津市"}]}, {"code": "4308","name": "张家界","sub": [{"code": "430802","name": "永定"}, {"code": "430811","name": "武陵源"}, {"code": "430821","name": "慈利"}, {"code": "430822","name": "桑植"}]}, {"code": "4309","name": "益阳","sub": [{"code": "430902","name": "资阳"}, {"code": "430903","name": "赫山"}, {"code": "430921","name": "南县"}, {"code": "430922","name": "桃江"}, {"code": "430923","name": "安化"}, {"code": "430981","name": "沅江"}]}, {"code": "4310","name": "郴州","sub": [{"code": "431002","name": "北湖"}, {"code": "431003","name": "苏仙"}, {"code": "431021","name": "桂阳"}, {"code": "431022","name": "宜章"}, {"code": "431023","name": "永兴"}, {"code": "431024","name": "嘉禾"}, {"code": "431025","name": "临武"}, {"code": "431026","name": "汝城"}, {"code": "431027","name": "桂东"}, {"code": "431028","name": "安仁"}, {"code": "431081","name": "资兴"}]}, {"code": "4311","name": "永州","sub": [{"code": "431102","name": "零陵"}, {"code": "431103","name": "冷水滩"}, {"code": "431121","name": "祁阳"}, {"code": "431122","name": "东安"}, {"code": "431123","name": "双牌"}, {"code": "431124","name": "道县"}, {"code": "431125","name": "江永"}, {"code": "431126","name": "宁远"}, {"code": "431127","name": "蓝山"}, {"code": "431128","name": "新田"}, {"code": "431129","name": "江华"}]}, {"code": "4312","name": "怀化","sub": [{"code": "431202","name": "鹤城"}, {"code": "431221","name": "中方"}, {"code": "431222","name": "沅陵"}, {"code": "431223","name": "辰溪"}, {"code": "431224","name": "溆浦"}, {"code": "431225","name": "会同"}, {"code": "431226","name": "麻阳"}, {"code": "431227","name": "新晃"}, {"code": "431228","name": "芷江"}, {"code": "431229","name": "靖州"}, {"code": "431230","name": "通道"}, {"code": "431281","name": "洪江"}]}, {"code": "4313","name": "娄底","sub": [{"code": "431302","name": "娄星"}, {"code": "431321","name": "双峰"}, {"code": "431322","name": "新化"}, {"code": "431381","name": "冷水江"}, {"code": "431382","name": "涟源"}]}, {"code": "4331","name": "湘西土家族苗族自治州","sub": [{"code": "433101","name": "吉首"}, {"code": "433122","name": "泸溪"}, {"code": "433123","name": "凤凰"}, {"code": "433124","name": "花垣"}, {"code": "433125","name": "保靖"}, {"code": "433126","name": "古丈"}, {"code": "433127","name": "永顺"}, {"code": "433130","name": "龙山"}]}]}, {"code": "44","name": "广东","sub": [{"code": "4401","name": "广州","sub": [{"code": "440103","name": "荔湾"}, {"code": "440104","name": "越秀"}, {"code": "440105","name": "海珠"}, {"code": "440106","name": "天河"}, {"code": "440111","name": "白云"}, {"code": "440112","name": "黄埔"}, {"code": "440113","name": "番禺"}, {"code": "440114","name": "花都"}, {"code": "440115","name": "南沙"}, {"code": "440117","name": "从化"}, {"code": "440118","name": "增城"}]}, {"code": "4402","name": "韶关","sub": [{"code": "440203","name": "武江"}, {"code": "440204","name": "浈江"}, {"code": "440205","name": "曲江"}, {"code": "440222","name": "始兴"}, {"code": "440224","name": "仁化"}, {"code": "440229","name": "翁源"}, {"code": "440232","name": "乳源"}, {"code": "440233","name": "新丰"}, {"code": "440281","name": "乐昌"}, {"code": "440282","name": "南雄"}]}, {"code": "4403","name": "深圳","sub": [{"code": "440303","name": "罗湖"}, {"code": "440304","name": "福田"}, {"code": "440305","name": "南山"}, {"code": "440306","name": "宝安"}, {"code": "440307","name": "龙岗"}, {"code": "440308","name": "盐田"}]}, {"code": "4404","name": "珠海","sub": [{"code": "440402","name": "香洲"}, {"code": "440403","name": "斗门"}, {"code": "440404","name": "金湾"}]}, {"code": "4405","name": "汕头","sub": [{"code": "440507","name": "龙湖"}, {"code": "440511","name": "金平"}, {"code": "440512","name": "濠江"}, {"code": "440513","name": "潮阳"}, {"code": "440514","name": "潮南"}, {"code": "440515","name": "澄海"}, {"code": "440523","name": "南澳"}]}, {"code": "4406","name": "佛山","sub": [{"code": "440604","name": "禅城"}, {"code": "440605","name": "南海"}, {"code": "440606","name": "顺德"}, {"code": "440607","name": "三水"}, {"code": "440608","name": "高明"}]}, {"code": "4407","name": "江门","sub": [{"code": "440703","name": "蓬江"}, {"code": "440704","name": "江海"}, {"code": "440705","name": "新会"}, {"code": "440781","name": "台山"}, {"code": "440783","name": "开平"}, {"code": "440784","name": "鹤山"}, {"code": "440785","name": "恩平"}]}, {"code": "4408","name": "湛江","sub": [{"code": "440802","name": "赤坎"}, {"code": "440803","name": "霞山"}, {"code": "440804","name": "坡头"}, {"code": "440811","name": "麻章"}, {"code": "440823","name": "遂溪"}, {"code": "440825","name": "徐闻"}, {"code": "440881","name": "廉江"}, {"code": "440882","name": "雷州"}, {"code": "440883","name": "吴川"}]}, {"code": "4409","name": "茂名","sub": [{"code": "440902","name": "茂南"}, {"code": "440904","name": "电白"}, {"code": "440981","name": "高州"}, {"code": "440982","name": "化州"}, {"code": "440983","name": "信宜"}]}, {"code": "4412","name": "肇庆","sub": [{"code": "441202","name": "端州"}, {"code": "441203","name": "鼎湖"}, {"code": "441204","name": "高要"}, {"code": "441223","name": "广宁"}, {"code": "441224","name": "怀集"}, {"code": "441225","name": "封开"}, {"code": "441226","name": "德庆"}, {"code": "441284","name": "四会"}]}, {"code": "4413","name": "惠州","sub": [{"code": "441302","name": "惠城"}, {"code": "441303","name": "惠阳"}, {"code": "441322","name": "博罗"}, {"code": "441323","name": "惠东"}, {"code": "441324","name": "龙门"}]}, {"code": "4414","name": "梅州","sub": [{"code": "441402","name": "梅江"}, {"code": "441403","name": "梅县"}, {"code": "441422","name": "大埔"}, {"code": "441423","name": "丰顺"}, {"code": "441424","name": "五华"}, {"code": "441426","name": "平远"}, {"code": "441427","name": "蕉岭"}, {"code": "441481","name": "兴宁"}]}, {"code": "4415","name": "汕尾","sub": [{"code": "441502","name": "城区"}, {"code": "441521","name": "海丰"}, {"code": "441523","name": "陆河"}, {"code": "441581","name": "陆丰"}]}, {"code": "4416","name": "河源","sub": [{"code": "441602","name": "源城"}, {"code": "441621","name": "紫金"}, {"code": "441622","name": "龙川"}, {"code": "441623","name": "连平"}, {"code": "441624","name": "和平"}, {"code": "441625","name": "东源"}]}, {"code": "4417","name": "阳江","sub": [{"code": "441702","name": "江城"}, {"code": "441704","name": "阳东"}, {"code": "441721","name": "阳西"}, {"code": "441781","name": "阳春"}]}, {"code": "4418","name": "清远","sub": [{"code": "441802","name": "清城"}, {"code": "441803","name": "清新"}, {"code": "441821","name": "佛冈"}, {"code": "441823","name": "阳山"}, {"code": "441825","name": "连山"}, {"code": "441826","name": "连南"}, {"code": "441881","name": "英德"}, {"code": "441882","name": "连州"}]}, {"code": "4419","name": "东莞","sub": [{"code": "441900003","name": "东城"}, {"code": "441900004","name": "南城"}, {"code": "441900005","name": "万江"}, {"code": "441900006","name": "莞城"}, {"code": "441900101","name": "石碣镇"}, {"code": "441900102","name": "石龙镇"}, {"code": "441900103","name": "茶山镇"}, {"code": "441900104","name": "石排镇"}, {"code": "441900105","name": "企石镇"}, {"code": "441900106","name": "横沥镇"}, {"code": "441900107","name": "桥头镇"}, {"code": "441900108","name": "谢岗镇"}, {"code": "441900109","name": "东坑镇"}, {"code": "441900110","name": "常平镇"}, {"code": "441900111","name": "寮步镇"}, {"code": "441900112","name": "樟木头镇"}, {"code": "441900113","name": "大朗镇"}, {"code": "441900114","name": "黄江镇"}, {"code": "441900115","name": "清溪镇"}, {"code": "441900116","name": "塘厦镇"}, {"code": "441900117","name": "凤岗镇"}, {"code": "441900118","name": "大岭山镇"}, {"code": "441900119","name": "长安镇"}, {"code": "441900121","name": "虎门镇"}, {"code": "441900122","name": "厚街镇"}, {"code": "441900123","name": "沙田镇"}, {"code": "441900124","name": "道滘镇"}, {"code": "441900125","name": "洪梅镇"}, {"code": "441900126","name": "麻涌镇"}, {"code": "441900127","name": "望牛墩镇"}, {"code": "441900128","name": "中堂镇"}, {"code": "441900129","name": "高埗镇"}, {"code": "441900401","name": "松山湖管委会"}, {"code": "441900402","name": "虎门港管委会"}, {"code": "441900403","name": "东莞生态园"}]}, {"code": "4420","name": "中山","sub": [{"code": "442000001","name": "石岐街道"}, {"code": "442000002","name": "东区街道"}, {"code": "442000003","name": "火炬开发街道"}, {"code": "442000004","name": "西区街道"}, {"code": "442000005","name": "南区街道"}, {"code": "442000006","name": "五桂山街道"}, {"code": "442000100","name": "小榄镇"}, {"code": "442000101","name": "黄圃镇"}, {"code": "442000102","name": "民众镇"}, {"code": "442000103","name": "东凤镇"}, {"code": "442000104","name": "东升镇"}, {"code": "442000105","name": "古镇镇"}, {"code": "442000106","name": "沙溪镇"}, {"code": "442000107","name": "坦洲镇"}, {"code": "442000108","name": "港口镇"}, {"code": "442000109","name": "三角镇"}, {"code": "442000110","name": "横栏镇"}, {"code": "442000111","name": "南头镇"}, {"code": "442000112","name": "阜沙镇"}, {"code": "442000113","name": "南朗镇"}, {"code": "442000114","name": "三乡镇"}, {"code": "442000115","name": "板芙镇"}, {"code": "442000116","name": "大涌镇"}, {"code": "442000117","name": "神湾镇"}]}, {"code": "4451","name": "潮州","sub": [{"code": "445102","name": "湘桥"}, {"code": "445103","name": "潮安"}, {"code": "445122","name": "饶平"}]}, {"code": "4452","name": "揭阳","sub": [{"code": "445202","name": "榕城"}, {"code": "445203","name": "揭东"}, {"code": "445222","name": "揭西"}, {"code": "445224","name": "惠来"}, {"code": "445281","name": "普宁"}]}, {"code": "4453","name": "云浮","sub": [{"code": "445302","name": "云城"}, {"code": "445303","name": "云安"}, {"code": "445321","name": "新兴"}, {"code": "445322","name": "郁南"}, {"code": "445381","name": "罗定"}]}]}, {"code": "45","name": "广西","sub": [{"code": "4501","name": "南宁","sub": [{"code": "450102","name": "兴宁"}, {"code": "450103","name": "青秀"}, {"code": "450105","name": "江南"}, {"code": "450107","name": "西乡塘"}, {"code": "450108","name": "良庆"}, {"code": "450109","name": "邕宁"}, {"code": "450110","name": "武鸣"}, {"code": "450123","name": "隆安"}, {"code": "450124","name": "马山"}, {"code": "450125","name": "上林"}, {"code": "450126","name": "宾阳"}, {"code": "450127","name": "横县"}]}, {"code": "4502","name": "柳州","sub": [{"code": "450202","name": "城中"}, {"code": "450203","name": "鱼峰"}, {"code": "450204","name": "柳南"}, {"code": "450205","name": "柳北"}, {"code": "450206","name": "柳江"}, {"code": "450222","name": "柳城"}, {"code": "450223","name": "鹿寨"}, {"code": "450224","name": "融安"}, {"code": "450225","name": "融水"}, {"code": "450226","name": "三江"}]}, {"code": "4503","name": "桂林","sub": [{"code": "450302","name": "秀峰"}, {"code": "450303","name": "叠彩"}, {"code": "450304","name": "象山"}, {"code": "450305","name": "七星"}, {"code": "450311","name": "雁山"}, {"code": "450312","name": "临桂"}, {"code": "450321","name": "阳朔"}, {"code": "450323","name": "灵川"}, {"code": "450324","name": "全州"}, {"code": "450325","name": "兴安"}, {"code": "450326","name": "永福"}, {"code": "450327","name": "灌阳"}, {"code": "450328","name": "龙胜"}, {"code": "450329","name": "资源"}, {"code": "450330","name": "平乐"}, {"code": "450331","name": "荔浦"}, {"code": "450332","name": "恭城"}]}, {"code": "4504","name": "梧州","sub": [{"code": "450403","name": "万秀"}, {"code": "450405","name": "长洲"}, {"code": "450406","name": "龙圩"}, {"code": "450421","name": "苍梧"}, {"code": "450422","name": "藤县"}, {"code": "450423","name": "蒙山"}, {"code": "450481","name": "岑溪"}]}, {"code": "4505","name": "北海","sub": [{"code": "450502","name": "海城"}, {"code": "450503","name": "银海"}, {"code": "450512","name": "铁山港"}, {"code": "450521","name": "合浦"}]}, {"code": "4506","name": "防城港","sub": [{"code": "450602","name": "港口"}, {"code": "450603","name": "防城"}, {"code": "450621","name": "上思"}, {"code": "450681","name": "东兴"}]}, {"code": "4507","name": "钦州","sub": [{"code": "450702","name": "钦南"}, {"code": "450703","name": "钦北"}, {"code": "450721","name": "灵山"}, {"code": "450722","name": "浦北"}]}, {"code": "4508","name": "贵港","sub": [{"code": "450802","name": "港北"}, {"code": "450803","name": "港南"}, {"code": "450804","name": "覃塘"}, {"code": "450821","name": "平南"}, {"code": "450881","name": "桂平"}]}, {"code": "4509","name": "玉林","sub": [{"code": "450902","name": "玉州"}, {"code": "450903","name": "福绵"}, {"code": "450921","name": "容县"}, {"code": "450922","name": "陆川"}, {"code": "450923","name": "博白"}, {"code": "450924","name": "兴业"}, {"code": "450981","name": "北流"}]}, {"code": "4510","name": "百色","sub": [{"code": "451002","name": "右江"}, {"code": "451021","name": "田阳"}, {"code": "451022","name": "田东"}, {"code": "451023","name": "平果"}, {"code": "451024","name": "德保"}, {"code": "451026","name": "那坡"}, {"code": "451027","name": "凌云"}, {"code": "451028","name": "乐业"}, {"code": "451029","name": "田林"}, {"code": "451030","name": "西林"}, {"code": "451031","name": "隆林"}, {"code": "451081","name": "靖西"}]}, {"code": "4511","name": "贺州","sub": [{"code": "451102","name": "八步"}, {"code": "451103","name": "平桂"}, {"code": "451121","name": "昭平"}, {"code": "451122","name": "钟山"}, {"code": "451123","name": "富川"}]}, {"code": "4512","name": "河池","sub": [{"code": "451202","name": "金城江"}, {"code": "451221","name": "南丹"}, {"code": "451222","name": "天峨"}, {"code": "451223","name": "凤山"}, {"code": "451224","name": "东兰"}, {"code": "451225","name": "罗城"}, {"code": "451226","name": "环江毛南族自治"}, {"code": "451227","name": "巴马"}, {"code": "451228","name": "都安"}, {"code": "451229","name": "大化"}, {"code": "451281","name": "宜州"}]}, {"code": "4513","name": "来宾","sub": [{"code": "451302","name": "兴宾"}, {"code": "451321","name": "忻城"}, {"code": "451322","name": "象州"}, {"code": "451323","name": "武宣"}, {"code": "451324","name": "金秀"}, {"code": "451381","name": "合山"}]}, {"code": "4514","name": "崇左","sub": [{"code": "451402","name": "江州"}, {"code": "451421","name": "扶绥"}, {"code": "451422","name": "宁明"}, {"code": "451423","name": "龙州"}, {"code": "451424","name": "大新"}, {"code": "451425","name": "天等"}, {"code": "451481","name": "凭祥"}]}]}, {"code": "46","name": "海南","sub": [{"code": "4601","name": "海口","sub": [{"code": "460105","name": "秀英"}, {"code": "460106","name": "龙华"}, {"code": "460107","name": "琼山"}, {"code": "460108","name": "美兰"}]}, {"code": "4602","name": "三亚","sub": [{"code": "460201","name": "三亚"}, {"code": "460202","name": "海棠"}, {"code": "460203","name": "吉阳"}, {"code": "460204","name": "天涯"}, {"code": "460205","name": "崖州"}]}, {"code": "4603","name": "三沙","sub": [{"code": "460321","name": "西沙"}, {"code": "460322","name": "南沙"}, {"code": "460323","name": "中沙群岛的岛礁及其海域"}]}, {"code": "4604","name": "儋州","sub": [{"code": "460400100","name": "那大镇"}, {"code": "460400101","name": "和庆镇"}, {"code": "460400102","name": "南丰镇"}, {"code": "460400103","name": "大成镇"}, {"code": "460400104","name": "雅星镇"}, {"code": "460400105","name": "兰洋镇"}, {"code": "460400106","name": "光村镇"}, {"code": "460400107","name": "木棠镇"}, {"code": "460400108","name": "海头镇"}, {"code": "460400109","name": "峨蔓镇"}, {"code": "460400110","name": "三都镇"}, {"code": "460400111","name": "王五镇"}, {"code": "460400112","name": "白马井镇"}, {"code": "460400113","name": "中和镇"}, {"code": "460400114","name": "排浦镇"}, {"code": "460400115","name": "东成镇"}, {"code": "460400116","name": "新州镇"}, {"code": "460400400","name": "国营西培农场"}, {"code": "460400404","name": "国营西联农场"}, {"code": "460400405","name": "国营蓝洋农场"}, {"code": "460400407","name": "国营八一农场"}, {"code": "460400499","name": "洋浦"}, {"code": "460400500","name": "华南热作学院"}]}, {"code": "4690","name": "海南","sub": [{"code": "469001","name": "五指山"}, {"code": "469002","name": "琼海"}, {"code": "469005","name": "文昌"}, {"code": "469006","name": "万宁"}, {"code": "469007","name": "东方"}, {"code": "469021","name": "定安"}, {"code": "469022","name": "屯昌"}, {"code": "469023","name": "澄迈"}, {"code": "469024","name": "临高"}, {"code": "469025","name": "白沙"}, {"code": "469026","name": "昌江"}, {"code": "469027","name": "乐东"}, {"code": "469028","name": "陵水"}, {"code": "469029","name": "保亭"}, {"code": "469030","name": "琼中"}]}]}, {"code": "50","name": "重庆","sub": [{"code": "5001","name": "重庆","sub": [{"code": "500101","name": "万州"}, {"code": "500102","name": "涪陵"}, {"code": "500103","name": "渝中"}, {"code": "500104","name": "大渡口"}, {"code": "500105","name": "江北"}, {"code": "500106","name": "沙坪坝"}, {"code": "500107","name": "九龙坡"}, {"code": "500108","name": "南岸"}, {"code": "500109","name": "北碚"}, {"code": "500110","name": "綦江"}, {"code": "500111","name": "大足"}, {"code": "500112","name": "渝北"}, {"code": "500113","name": "巴南"}, {"code": "500114","name": "黔江"}, {"code": "500115","name": "长寿"}, {"code": "500116","name": "江津"}, {"code": "500117","name": "合川"}, {"code": "500118","name": "永川"}, {"code": "500119","name": "南川"}, {"code": "500120","name": "璧山"}, {"code": "500151","name": "铜梁"}, {"code": "500152","name": "潼南"}, {"code": "500153","name": "荣昌"}, {"code": "500154","name": "开州"}]}, {"code": "5002","name": "县","sub": [{"code": "500228","name": "梁平"}, {"code": "500229","name": "城口"}, {"code": "500230","name": "丰都"}, {"code": "500231","name": "垫江"}, {"code": "500232","name": "武隆"}, {"code": "500233","name": "忠县"}, {"code": "500235","name": "云阳"}, {"code": "500236","name": "奉节"}, {"code": "500237","name": "巫山"}, {"code": "500238","name": "巫溪"}, {"code": "500240","name": "石柱"}, {"code": "500241","name": "秀山"}, {"code": "500242","name": "酉阳"}, {"code": "500243","name": "彭水"}]}]}, {"code": "51","name": "四川","sub": [{"code": "5101","name": "成都","sub": [{"code": "510104","name": "锦江"}, {"code": "510105","name": "青羊"}, {"code": "510106","name": "金牛"}, {"code": "510107","name": "武侯"}, {"code": "510108","name": "成华"}, {"code": "510112","name": "龙泉驿"}, {"code": "510113","name": "青白江"}, {"code": "510114","name": "新都"}, {"code": "510115","name": "温江"}, {"code": "510116","name": "双流"}, {"code": "510121","name": "金堂"}, {"code": "510124","name": "郫县"}, {"code": "510129","name": "大邑"}, {"code": "510131","name": "蒲江"}, {"code": "510132","name": "新津"}, {"code": "510181","name": "都江堰"}, {"code": "510182","name": "彭州"}, {"code": "510183","name": "邛崃"}, {"code": "510184","name": "崇州"}, {"code": "510185","name": "简阳"}]}, {"code": "5103","name": "自贡","sub": [{"code": "510302","name": "自流井"}, {"code": "510303","name": "贡井"}, {"code": "510304","name": "大安"}, {"code": "510311","name": "沿滩"}, {"code": "510321","name": "荣县"}, {"code": "510322","name": "富顺"}]}, {"code": "5104","name": "攀枝花","sub": [{"code": "510402","name": "东区"}, {"code": "510403","name": "西区"}, {"code": "510411","name": "仁和"}, {"code": "510421","name": "米易"}, {"code": "510422","name": "盐边"}]}, {"code": "5105","name": "泸州","sub": [{"code": "510502","name": "江阳"}, {"code": "510503","name": "纳溪"}, {"code": "510504","name": "龙马潭"}, {"code": "510521","name": "泸县"}, {"code": "510522","name": "合江"}, {"code": "510524","name": "叙永"}, {"code": "510525","name": "古蔺"}]}, {"code": "5106","name": "德阳","sub": [{"code": "510603","name": "旌阳"}, {"code": "510623","name": "中江"}, {"code": "510626","name": "罗江"}, {"code": "510681","name": "广汉"}, {"code": "510682","name": "什邡"}, {"code": "510683","name": "绵竹"}]}, {"code": "5107","name": "绵阳","sub": [{"code": "510703","name": "涪城"}, {"code": "510704","name": "游仙"}, {"code": "510705","name": "安州"}, {"code": "510722","name": "三台"}, {"code": "510723","name": "盐亭"}, {"code": "510725","name": "梓潼"}, {"code": "510726","name": "北川"}, {"code": "510727","name": "平武"}, {"code": "510781","name": "江油"}]}, {"code": "5108","name": "广元","sub": [{"code": "510802","name": "利州"}, {"code": "510811","name": "昭化"}, {"code": "510812","name": "朝天"}, {"code": "510821","name": "旺苍"}, {"code": "510822","name": "青川"}, {"code": "510823","name": "剑阁"}, {"code": "510824","name": "苍溪"}]}, {"code": "5109","name": "遂宁","sub": [{"code": "510903","name": "船山"}, {"code": "510904","name": "安居"}, {"code": "510921","name": "蓬溪"}, {"code": "510922","name": "射洪"}, {"code": "510923","name": "大英"}]}, {"code": "5110","name": "内江","sub": [{"code": "511002","name": "市中"}, {"code": "511011","name": "东兴"}, {"code": "511024","name": "威远"}, {"code": "511025","name": "资中"}, {"code": "511028","name": "隆昌"}]}, {"code": "5111","name": "乐山","sub": [{"code": "511102","name": "市中"}, {"code": "511111","name": "沙湾"}, {"code": "511112","name": "五通桥"}, {"code": "511113","name": "金口河"}, {"code": "511123","name": "犍为"}, {"code": "511124","name": "井研"}, {"code": "511126","name": "夹江"}, {"code": "511129","name": "沐川"}, {"code": "511132","name": "峨边"}, {"code": "511133","name": "马边"}, {"code": "511181","name": "峨眉山"}]}, {"code": "5113","name": "南充","sub": [{"code": "511302","name": "顺庆"}, {"code": "511303","name": "高坪"}, {"code": "511304","name": "嘉陵"}, {"code": "511321","name": "南部"}, {"code": "511322","name": "营山"}, {"code": "511323","name": "蓬安"}, {"code": "511324","name": "仪陇"}, {"code": "511325","name": "西充"}, {"code": "511381","name": "阆中"}]}, {"code": "5114","name": "眉山","sub": [{"code": "511402","name": "东坡"}, {"code": "511403","name": "彭山"}, {"code": "511421","name": "仁寿"}, {"code": "511423","name": "洪雅"}, {"code": "511424","name": "丹棱"}, {"code": "511425","name": "青神"}]}, {"code": "5115","name": "宜宾","sub": [{"code": "511502","name": "翠屏"}, {"code": "511503","name": "南溪"}, {"code": "511521","name": "宜宾"}, {"code": "511523","name": "江安"}, {"code": "511524","name": "长宁"}, {"code": "511525","name": "高县"}, {"code": "511526","name": "珙县"}, {"code": "511527","name": "筠连"}, {"code": "511528","name": "兴文"}, {"code": "511529","name": "屏山"}]}, {"code": "5116","name": "广安","sub": [{"code": "511602","name": "广安"}, {"code": "511603","name": "前锋"}, {"code": "511621","name": "岳池"}, {"code": "511622","name": "武胜"}, {"code": "511623","name": "邻水"}, {"code": "511681","name": "华蓥"}]}, {"code": "5117","name": "达州","sub": [{"code": "511702","name": "通川"}, {"code": "511703","name": "达川"}, {"code": "511722","name": "宣汉"}, {"code": "511723","name": "开江"}, {"code": "511724","name": "大竹"}, {"code": "511725","name": "渠县"}, {"code": "511781","name": "万源"}]}, {"code": "5118","name": "雅安","sub": [{"code": "511802","name": "雨城"}, {"code": "511803","name": "名山"}, {"code": "511822","name": "荥经"}, {"code": "511823","name": "汉源"}, {"code": "511824","name": "石棉"}, {"code": "511825","name": "天全"}, {"code": "511826","name": "芦山"}, {"code": "511827","name": "宝兴"}]}, {"code": "5119","name": "巴中","sub": [{"code": "511902","name": "巴州"}, {"code": "511903","name": "恩阳"}, {"code": "511921","name": "通江"}, {"code": "511922","name": "南江"}, {"code": "511923","name": "平昌"}]}, {"code": "5120","name": "资阳","sub": [{"code": "512002","name": "雁江"}, {"code": "512021","name": "安岳"}, {"code": "512022","name": "乐至"}]}, {"code": "5132","name": "阿坝藏族羌族自治州","sub": [{"code": "513201","name": "马尔康"}, {"code": "513221","name": "汶川"}, {"code": "513222","name": "理县"}, {"code": "513223","name": "茂县"}, {"code": "513224","name": "松潘"}, {"code": "513225","name": "九寨沟"}, {"code": "513226","name": "金川"}, {"code": "513227","name": "小金"}, {"code": "513228","name": "黑水"}, {"code": "513230","name": "壤塘"}, {"code": "513231","name": "阿坝"}, {"code": "513232","name": "若尔盖"}, {"code": "513233","name": "红原"}]}, {"code": "5133","name": "甘孜","sub": [{"code": "513301","name": "康定"}, {"code": "513322","name": "泸定"}, {"code": "513323","name": "丹巴"}, {"code": "513324","name": "九龙"}, {"code": "513325","name": "雅江"}, {"code": "513326","name": "道孚"}, {"code": "513327","name": "炉霍"}, {"code": "513328","name": "甘孜"}, {"code": "513329","name": "新龙"}, {"code": "513330","name": "德格"}, {"code": "513331","name": "白玉"}, {"code": "513332","name": "石渠"}, {"code": "513333","name": "色达"}, {"code": "513334","name": "理塘"}, {"code": "513335","name": "巴塘"}, {"code": "513336","name": "乡城"}, {"code": "513337","name": "稻城"}, {"code": "513338","name": "得荣"}]}, {"code": "5134","name": "凉山","sub": [{"code": "513401","name": "西昌"}, {"code": "513422","name": "木里"}, {"code": "513423","name": "盐源"}, {"code": "513424","name": "德昌"}, {"code": "513425","name": "会理"}, {"code": "513426","name": "会东"}, {"code": "513427","name": "宁南"}, {"code": "513428","name": "普格"}, {"code": "513429","name": "布拖"}, {"code": "513430","name": "金阳"}, {"code": "513431","name": "昭觉"}, {"code": "513432","name": "喜德"}, {"code": "513433","name": "冕宁"}, {"code": "513434","name": "越西"}, {"code": "513435","name": "甘洛"}, {"code": "513436","name": "美姑"}, {"code": "513437","name": "雷波"}]}]}, {"code": "52","name": "贵州","sub": [{"code": "5201","name": "贵阳","sub": [{"code": "520102","name": "南明"}, {"code": "520103","name": "云岩"}, {"code": "520111","name": "花溪"}, {"code": "520112","name": "乌当"}, {"code": "520113","name": "白云"}, {"code": "520115","name": "观山湖"}, {"code": "520121","name": "开阳"}, {"code": "520122","name": "息烽"}, {"code": "520123","name": "修文"}, {"code": "520181","name": "清镇"}]}, {"code": "5202","name": "六盘水","sub": [{"code": "520201","name": "钟山"}, {"code": "520203","name": "六枝特"}, {"code": "520221","name": "水城"}, {"code": "520222","name": "盘县"}]}, {"code": "5203","name": "遵义","sub": [{"code": "520302","name": "红花岗"}, {"code": "520303","name": "汇川"}, {"code": "520304","name": "播州"}, {"code": "520322","name": "桐梓"}, {"code": "520323","name": "绥阳"}, {"code": "520324","name": "正安"}, {"code": "520325","name": "道真"}, {"code": "520326","name": "务川"}, {"code": "520327","name": "凤冈"}, {"code": "520328","name": "湄潭"}, {"code": "520329","name": "余庆"}, {"code": "520330","name": "习水"}, {"code": "520381","name": "赤水"}, {"code": "520382","name": "仁怀"}]}, {"code": "5204","name": "安顺","sub": [{"code": "520402","name": "西秀"}, {"code": "520403","name": "平坝"}, {"code": "520422","name": "普定"}, {"code": "520423","name": "镇宁"}, {"code": "520424","name": "关岭"}, {"code": "520425","name": "紫云"}]}, {"code": "5205","name": "毕节","sub": [{"code": "520502","name": "七星关"}, {"code": "520521","name": "大方"}, {"code": "520522","name": "黔西"}, {"code": "520523","name": "金沙"}, {"code": "520524","name": "织金"}, {"code": "520525","name": "纳雍"}, {"code": "520526","name": "威宁"}, {"code": "520527","name": "赫章"}]}, {"code": "5206","name": "铜仁","sub": [{"code": "520602","name": "碧江"}, {"code": "520603","name": "万山"}, {"code": "520621","name": "江口"}, {"code": "520622","name": "玉屏"}, {"code": "520623","name": "石阡"}, {"code": "520624","name": "思南"}, {"code": "520625","name": "印江"}, {"code": "520626","name": "德江"}, {"code": "520627","name": "沿河"}, {"code": "520628","name": "松桃"}]}, {"code": "5223","name": "黔西南布依族苗族自治州","sub": [{"code": "522301","name": "兴义"}, {"code": "522322","name": "兴仁"}, {"code": "522323","name": "普安"}, {"code": "522324","name": "晴隆"}, {"code": "522325","name": "贞丰"}, {"code": "522326","name": "望谟"}, {"code": "522327","name": "册亨"}, {"code": "522328","name": "安龙"}]}, {"code": "5226","name": "黔东南苗族侗族自治州","sub": [{"code": "522601","name": "凯里"}, {"code": "522622","name": "黄平"}, {"code": "522623","name": "施秉"}, {"code": "522624","name": "三穗"}, {"code": "522625","name": "镇远"}, {"code": "522626","name": "岑巩"}, {"code": "522627","name": "天柱"}, {"code": "522628","name": "锦屏"}, {"code": "522629","name": "剑河"}, {"code": "522630","name": "台江"}, {"code": "522631","name": "黎平"}, {"code": "522632","name": "榕江"}, {"code": "522633","name": "从江"}, {"code": "522634","name": "雷山"}, {"code": "522635","name": "麻江"}, {"code": "522636","name": "丹寨"}]}, {"code": "5227","name": "黔南布依族苗族自治州","sub": [{"code": "522701","name": "都匀"}, {"code": "522702","name": "福泉"}, {"code": "522722","name": "荔波"}, {"code": "522723","name": "贵定"}, {"code": "522725","name": "瓮安"}, {"code": "522726","name": "独山"}, {"code": "522727","name": "平塘"}, {"code": "522728","name": "罗甸"}, {"code": "522729","name": "长顺"}, {"code": "522730","name": "龙里"}, {"code": "522731","name": "惠水"}, {"code": "522732","name": "三都"}]}]}, {"code": "53","name": "云南","sub": [{"code": "5301","name": "昆明","sub": [{"code": "530102","name": "五华"}, {"code": "530103","name": "盘龙"}, {"code": "530111","name": "官渡"}, {"code": "530112","name": "西山"}, {"code": "530113","name": "东川"}, {"code": "530114","name": "呈贡"}, {"code": "530122","name": "晋宁"}, {"code": "530124","name": "富民"}, {"code": "530125","name": "宜良"}, {"code": "530126","name": "石林"}, {"code": "530127","name": "嵩明"}, {"code": "530128","name": "禄劝"}, {"code": "530129","name": "寻甸"}, {"code": "530181","name": "安宁"}]}, {"code": "5303","name": "曲靖","sub": [{"code": "530302","name": "麒麟"}, {"code": "530303","name": "沾益"}, {"code": "530321","name": "马龙"}, {"code": "530322","name": "陆良"}, {"code": "530323","name": "师宗"}, {"code": "530324","name": "罗平"}, {"code": "530325","name": "富源"}, {"code": "530326","name": "会泽"}, {"code": "530381","name": "宣威"}]}, {"code": "5304","name": "玉溪","sub": [{"code": "530402","name": "红塔"}, {"code": "530403","name": "江川"}, {"code": "530422","name": "澄江"}, {"code": "530423","name": "通海"}, {"code": "530424","name": "华宁"}, {"code": "530425","name": "易门"}, {"code": "530426","name": "峨山"}, {"code": "530427","name": "新平"}, {"code": "530428","name": "元江"}]}, {"code": "5305","name": "保山","sub": [{"code": "530502","name": "隆阳"}, {"code": "530521","name": "施甸"}, {"code": "530523","name": "龙陵"}, {"code": "530524","name": "昌宁"}, {"code": "530581","name": "腾冲"}]}, {"code": "5306","name": "昭通","sub": [{"code": "530602","name": "昭阳"}, {"code": "530621","name": "鲁甸"}, {"code": "530622","name": "巧家"}, {"code": "530623","name": "盐津"}, {"code": "530624","name": "大关"}, {"code": "530625","name": "永善"}, {"code": "530626","name": "绥江"}, {"code": "530627","name": "镇雄"}, {"code": "530628","name": "彝良"}, {"code": "530629","name": "威信"}, {"code": "530630","name": "水富"}]}, {"code": "5307","name": "丽江","sub": [{"code": "530702","name": "古城"}, {"code": "530721","name": "玉龙"}, {"code": "530722","name": "永胜"}, {"code": "530723","name": "华坪"}, {"code": "530724","name": "宁蒗"}]}, {"code": "5308","name": "普洱","sub": [{"code": "530802","name": "思茅"}, {"code": "530821","name": "宁洱"}, {"code": "530822","name": "墨江"}, {"code": "530823","name": "景东"}, {"code": "530824","name": "景谷"}, {"code": "530825","name": "镇沅"}, {"code": "530826","name": "江城"}, {"code": "530827","name": "孟连"}, {"code": "530828","name": "澜沧"}, {"code": "530829","name": "西盟"}]}, {"code": "5309","name": "临沧","sub": [{"code": "530902","name": "临翔"}, {"code": "530921","name": "凤庆"}, {"code": "530922","name": "云县"}, {"code": "530923","name": "永德"}, {"code": "530924","name": "镇康"}, {"code": "530925","name": "双江"}, {"code": "530926","name": "耿马"}, {"code": "530927","name": "沧源"}]}, {"code": "5323","name": "楚雄","sub": [{"code": "532301","name": "楚雄"}, {"code": "532322","name": "双柏"}, {"code": "532323","name": "牟定"}, {"code": "532324","name": "南华"}, {"code": "532325","name": "姚安"}, {"code": "532326","name": "大姚"}, {"code": "532327","name": "永仁"}, {"code": "532328","name": "元谋"}, {"code": "532329","name": "武定"}, {"code": "532331","name": "禄丰"}]}, {"code": "5325","name": "红河哈尼族彝族自治州","sub": [{"code": "532501","name": "个旧"}, {"code": "532502","name": "开远"}, {"code": "532503","name": "蒙自"}, {"code": "532504","name": "弥勒"}, {"code": "532523","name": "屏边"}, {"code": "532524","name": "建水"}, {"code": "532525","name": "石屏"}, {"code": "532527","name": "泸西"}, {"code": "532528","name": "元阳"}, {"code": "532529","name": "红河"}, {"code": "532530","name": "金平"}, {"code": "532531","name": "绿春"}, {"code": "532532","name": "河口"}]}, {"code": "5326","name": "文山壮族苗族自治州","sub": [{"code": "532601","name": "文山"}, {"code": "532622","name": "砚山"}, {"code": "532623","name": "西畴"}, {"code": "532624","name": "麻栗坡"}, {"code": "532625","name": "马关"}, {"code": "532626","name": "丘北"}, {"code": "532627","name": "广南"}, {"code": "532628","name": "富宁"}]}, {"code": "5328","name": "西双版纳傣族自治州","sub": [{"code": "532801","name": "景洪"}, {"code": "532822","name": "勐海"}, {"code": "532823","name": "勐腊"}]}, {"code": "5329","name": "大理","sub": [{"code": "532901","name": "大理"}, {"code": "532922","name": "漾濞"}, {"code": "532923","name": "祥云"}, {"code": "532924","name": "宾川"}, {"code": "532925","name": "弥渡"}, {"code": "532926","name": "南涧"}, {"code": "532927","name": "巍山"}, {"code": "532928","name": "永平"}, {"code": "532929","name": "云龙"}, {"code": "532930","name": "洱源"}, {"code": "532931","name": "剑川"}, {"code": "532932","name": "鹤庆"}]}, {"code": "5331","name": "德宏傣族景颇族自治州","sub": [{"code": "533102","name": "瑞丽"}, {"code": "533103","name": "芒市"}, {"code": "533122","name": "梁河"}, {"code": "533123","name": "盈江"}, {"code": "533124","name": "陇川"}]}, {"code": "5333","name": "怒江傈僳族自治州","sub": [{"code": "533301","name": "泸水"}, {"code": "533323","name": "福贡"}, {"code": "533324","name": "贡山"}, {"code": "533325","name": "兰坪"}]}, {"code": "5334","name": "迪庆","sub": [{"code": "533401","name": "香格里拉"}, {"code": "533422","name": "德钦"}, {"code": "533423","name": "维西"}]}]}, {"code": "54","name": "西藏","sub": [{"code": "5401","name": "拉萨","sub": [{"code": "540102","name": "城关"}, {"code": "540103","name": "堆龙德庆"}, {"code": "540121","name": "林周"}, {"code": "540122","name": "当雄"}, {"code": "540123","name": "尼木"}, {"code": "540124","name": "曲水"}, {"code": "540126","name": "达孜"}, {"code": "540127","name": "墨竹工卡"}]}, {"code": "5402","name": "日喀则","sub": [{"code": "540202","name": "桑珠孜"}, {"code": "540221","name": "南木林"}, {"code": "540222","name": "江孜"}, {"code": "540223","name": "定日"}, {"code": "540224","name": "萨迦"}, {"code": "540225","name": "拉孜"}, {"code": "540226","name": "昂仁"}, {"code": "540227","name": "谢通门"}, {"code": "540228","name": "白朗"}, {"code": "540229","name": "仁布"}, {"code": "540230","name": "康马"}, {"code": "540231","name": "定结"}, {"code": "540232","name": "仲巴"}, {"code": "540233","name": "亚东"}, {"code": "540234","name": "吉隆"}, {"code": "540235","name": "聂拉木"}, {"code": "540236","name": "萨嘎"}, {"code": "540237","name": "岗巴"}]}, {"code": "5403","name": "昌都","sub": [{"code": "540302","name": "卡若"}, {"code": "540321","name": "江达"}, {"code": "540322","name": "贡觉"}, {"code": "540323","name": "类乌齐"}, {"code": "540324","name": "丁青"}, {"code": "540325","name": "察雅"}, {"code": "540326","name": "八宿"}, {"code": "540327","name": "左贡"}, {"code": "540328","name": "芒康"}, {"code": "540329","name": "洛隆"}, {"code": "540330","name": "边坝"}]}, {"code": "5404","name": "林芝","sub": [{"code": "540402","name": "巴宜"}, {"code": "540421","name": "工布江达"}, {"code": "540422","name": "米林"}, {"code": "540423","name": "墨脱"}, {"code": "540424","name": "波密"}, {"code": "540425","name": "察隅"}, {"code": "540426","name": "朗县"}]}, {"code": "5405","name": "山南","sub": [{"code": "540502","name": "乃东"}, {"code": "540521","name": "扎囊"}, {"code": "540522","name": "贡嘎"}, {"code": "540523","name": "桑日"}, {"code": "540524","name": "琼结"}, {"code": "540525","name": "曲松"}, {"code": "540526","name": "措美"}, {"code": "540527","name": "洛扎"}, {"code": "540528","name": "加查"}, {"code": "540529","name": "隆子"}, {"code": "540530","name": "错那"}, {"code": "540531","name": "浪卡子"}]}, {"code": "5424","name": "那曲","sub": [{"code": "542421","name": "那曲"}, {"code": "542422","name": "嘉黎"}, {"code": "542423","name": "比如"}, {"code": "542424","name": "聂荣"}, {"code": "542425","name": "安多"}, {"code": "542426","name": "申扎"}, {"code": "542427","name": "索县"}, {"code": "542428","name": "班戈"}, {"code": "542429","name": "巴青"}, {"code": "542430","name": "尼玛"}, {"code": "542431","name": "双湖"}]}, {"code": "5425","name": "阿里","sub": [{"code": "542521","name": "普兰"}, {"code": "542522","name": "札达"}, {"code": "542523","name": "噶尔"}, {"code": "542524","name": "日土"}, {"code": "542525","name": "革吉"}, {"code": "542526","name": "改则"}, {"code": "542527","name": "措勤"}]}]}, {"code": "61","name": "陕西","sub": [{"code": "6101","name": "西安","sub": [{"code": "610102","name": "新城"}, {"code": "610103","name": "碑林"}, {"code": "610104","name": "莲湖"}, {"code": "610111","name": "灞桥"}, {"code": "610112","name": "未央"}, {"code": "610113","name": "雁塔"}, {"code": "610114","name": "阎良"}, {"code": "610115","name": "临潼"}, {"code": "610116","name": "长安"}, {"code": "610117","name": "高陵"}, {"code": "610122","name": "蓝田"}, {"code": "610124","name": "周至"}, {"code": "610125","name": "户县"}]}, {"code": "6102","name": "铜川","sub": [{"code": "610202","name": "王益"}, {"code": "610203","name": "印台"}, {"code": "610204","name": "耀州"}, {"code": "610222","name": "宜君"}]}, {"code": "6103","name": "宝鸡","sub": [{"code": "610302","name": "渭滨"}, {"code": "610303","name": "金台"}, {"code": "610304","name": "陈仓"}, {"code": "610322","name": "凤翔"}, {"code": "610323","name": "岐山"}, {"code": "610324","name": "扶风"}, {"code": "610326","name": "眉县"}, {"code": "610327","name": "陇县"}, {"code": "610328","name": "千阳"}, {"code": "610329","name": "麟游"}, {"code": "610330","name": "凤县"}, {"code": "610331","name": "太白"}]}, {"code": "6104","name": "咸阳","sub": [{"code": "610402","name": "秦都"}, {"code": "610403","name": "杨陵"}, {"code": "610404","name": "渭城"}, {"code": "610422","name": "三原"}, {"code": "610423","name": "泾阳"}, {"code": "610424","name": "乾县"}, {"code": "610425","name": "礼泉"}, {"code": "610426","name": "永寿"}, {"code": "610427","name": "彬县"}, {"code": "610428","name": "长武"}, {"code": "610429","name": "旬邑"}, {"code": "610430","name": "淳化"}, {"code": "610431","name": "武功"}, {"code": "610481","name": "兴平"}]}, {"code": "6105","name": "渭南","sub": [{"code": "610502","name": "临渭"}, {"code": "610503","name": "华州"}, {"code": "610522","name": "潼关"}, {"code": "610523","name": "大荔"}, {"code": "610524","name": "合阳"}, {"code": "610525","name": "澄城"}, {"code": "610526","name": "蒲城"}, {"code": "610527","name": "白水"}, {"code": "610528","name": "富平"}, {"code": "610581","name": "韩城"}, {"code": "610582","name": "华阴"}]}, {"code": "6106","name": "延安","sub": [{"code": "610602","name": "宝塔"}, {"code": "610603","name": "安塞"}, {"code": "610621","name": "延长"}, {"code": "610622","name": "延川"}, {"code": "610623","name": "子长"}, {"code": "610625","name": "志丹"}, {"code": "610626","name": "吴起"}, {"code": "610627","name": "甘泉"}, {"code": "610628","name": "富县"}, {"code": "610629","name": "洛川"}, {"code": "610630","name": "宜川"}, {"code": "610631","name": "黄龙"}, {"code": "610632","name": "黄陵"}]}, {"code": "6107","name": "汉中","sub": [{"code": "610702","name": "汉台"}, {"code": "610721","name": "南郑"}, {"code": "610722","name": "城固"}, {"code": "610723","name": "洋县"}, {"code": "610724","name": "西乡"}, {"code": "610725","name": "勉县"}, {"code": "610726","name": "宁强"}, {"code": "610727","name": "略阳"}, {"code": "610728","name": "镇巴"}, {"code": "610729","name": "留坝"}, {"code": "610730","name": "佛坪"}]}, {"code": "6108","name": "榆林","sub": [{"code": "610802","name": "榆阳"}, {"code": "610803","name": "横山"}, {"code": "610821","name": "神木"}, {"code": "610822","name": "府谷"}, {"code": "610824","name": "靖边"}, {"code": "610825","name": "定边"}, {"code": "610826","name": "绥德"}, {"code": "610827","name": "米脂"}, {"code": "610828","name": "佳县"}, {"code": "610829","name": "吴堡"}, {"code": "610830","name": "清涧"}, {"code": "610831","name": "子洲"}]}, {"code": "6109","name": "安康","sub": [{"code": "610902","name": "汉滨"}, {"code": "610921","name": "汉阴"}, {"code": "610922","name": "石泉"}, {"code": "610923","name": "宁陕"}, {"code": "610924","name": "紫阳"}, {"code": "610925","name": "岚皋"}, {"code": "610926","name": "平利"}, {"code": "610927","name": "镇坪"}, {"code": "610928","name": "旬阳"}, {"code": "610929","name": "白河"}]}, {"code": "6110","name": "商洛","sub": [{"code": "611002","name": "商州"}, {"code": "611021","name": "洛南"}, {"code": "611022","name": "丹凤"}, {"code": "611023","name": "商南"}, {"code": "611024","name": "山阳"}, {"code": "611025","name": "镇安"}, {"code": "611026","name": "柞水"}]}]}, {"code": "62","name": "甘肃","sub": [{"code": "6201","name": "兰州","sub": [{"code": "620102","name": "城关"}, {"code": "620103","name": "七里河"}, {"code": "620104","name": "西固"}, {"code": "620105","name": "安宁"}, {"code": "620111","name": "红古"}, {"code": "620121","name": "永登"}, {"code": "620122","name": "皋兰"}, {"code": "620123","name": "榆中"}]}, {"code": "6202","name": "嘉峪关","sub": [{"code": "620201100","name": "新城镇"}, {"code": "620201101","name": "峪泉镇"}, {"code": "620201102","name": "文殊镇"}, {"code": "620201401","name": "雄关"}, {"code": "620201402","name": "镜铁"}, {"code": "620201403","name": "长城"}]}, {"code": "6203","name": "金昌","sub": [{"code": "620302","name": "金川"}, {"code": "620321","name": "永昌"}]}, {"code": "6204","name": "白银","sub": [{"code": "620402","name": "白银"}, {"code": "620403","name": "平川"}, {"code": "620421","name": "靖远"}, {"code": "620422","name": "会宁"}, {"code": "620423","name": "景泰"}]}, {"code": "6205","name": "天水","sub": [{"code": "620502","name": "秦州"}, {"code": "620503","name": "麦积"}, {"code": "620521","name": "清水"}, {"code": "620522","name": "秦安"}, {"code": "620523","name": "甘谷"}, {"code": "620524","name": "武山"}, {"code": "620525","name": "张家川"}]}, {"code": "6206","name": "武威","sub": [{"code": "620602","name": "凉州"}, {"code": "620621","name": "民勤"}, {"code": "620622","name": "古浪"}, {"code": "620623","name": "天祝"}]}, {"code": "6207","name": "张掖","sub": [{"code": "620702","name": "甘州"}, {"code": "620721","name": "肃南裕"}, {"code": "620722","name": "民乐"}, {"code": "620723","name": "临泽"}, {"code": "620724","name": "高台"}, {"code": "620725","name": "山丹"}]}, {"code": "6208","name": "平凉","sub": [{"code": "620802","name": "崆峒"}, {"code": "620821","name": "泾川"}, {"code": "620822","name": "灵台"}, {"code": "620823","name": "崇信"}, {"code": "620824","name": "华亭"}, {"code": "620825","name": "庄浪"}, {"code": "620826","name": "静宁"}]}, {"code": "6209","name": "酒泉","sub": [{"code": "620902","name": "肃州"}, {"code": "620921","name": "金塔"}, {"code": "620922","name": "瓜州"}, {"code": "620923","name": "肃北"}, {"code": "620924","name": "阿克塞"}, {"code": "620981","name": "玉门"}, {"code": "620982","name": "敦煌"}]}, {"code": "6210","name": "庆阳","sub": [{"code": "621002","name": "西峰"}, {"code": "621021","name": "庆城"}, {"code": "621022","name": "环县"}, {"code": "621023","name": "华池"}, {"code": "621024","name": "合水"}, {"code": "621025","name": "正宁"}, {"code": "621026","name": "宁县"}, {"code": "621027","name": "镇原"}]}, {"code": "6211","name": "定西","sub": [{"code": "621102","name": "安定"}, {"code": "621121","name": "通渭"}, {"code": "621122","name": "陇西"}, {"code": "621123","name": "渭源"}, {"code": "621124","name": "临洮"}, {"code": "621125","name": "漳县"}, {"code": "621126","name": "岷县"}]}, {"code": "6212","name": "陇南","sub": [{"code": "621202","name": "武都"}, {"code": "621221","name": "成县"}, {"code": "621222","name": "文县"}, {"code": "621223","name": "宕昌"}, {"code": "621224","name": "康县"}, {"code": "621225","name": "西和"}, {"code": "621226","name": "礼县"}, {"code": "621227","name": "徽县"}, {"code": "621228","name": "两当"}]}, {"code": "6229","name": "临夏","sub": [{"code": "622901","name": "临夏"}, {"code": "622921","name": "临夏"}, {"code": "622922","name": "康乐"}, {"code": "622923","name": "永靖"}, {"code": "622924","name": "广河"}, {"code": "622925","name": "和政"}, {"code": "622926","name": "东乡"}, {"code": "622927","name": "积石山"}]}, {"code": "6230","name": "甘南","sub": [{"code": "623001","name": "合作"}, {"code": "623021","name": "临潭"}, {"code": "623022","name": "卓尼"}, {"code": "623023","name": "舟曲"}, {"code": "623024","name": "迭部"}, {"code": "623025","name": "玛曲"}, {"code": "623026","name": "碌曲"}, {"code": "623027","name": "夏河"}]}]}, {"code": "63","name": "青海","sub": [{"code": "6301","name": "西宁","sub": [{"code": "630102","name": "城东"}, {"code": "630103","name": "城中"}, {"code": "630104","name": "城西"}, {"code": "630105","name": "城北"}, {"code": "630121","name": "大通"}, {"code": "630122","name": "湟中"}, {"code": "630123","name": "湟源"}]}, {"code": "6302","name": "海东","sub": [{"code": "630202","name": "乐都"}, {"code": "630203","name": "平安"}, {"code": "630222","name": "民和"}, {"code": "630223","name": "互助"}, {"code": "630224","name": "化隆"}, {"code": "630225","name": "循化"}]}, {"code": "6322","name": "海北","sub": [{"code": "632221","name": "门源"}, {"code": "632222","name": "祁连"}, {"code": "632223","name": "海晏"}, {"code": "632224","name": "刚察"}]}, {"code": "6323","name": "黄南","sub": [{"code": "632321","name": "同仁"}, {"code": "632322","name": "尖扎"}, {"code": "632323","name": "泽库"}, {"code": "632324","name": "河南"}]}, {"code": "6325","name": "海南","sub": [{"code": "632521","name": "共和"}, {"code": "632522","name": "同德"}, {"code": "632523","name": "贵德"}, {"code": "632524","name": "兴海"}, {"code": "632525","name": "贵南"}]}, {"code": "6326","name": "果洛","sub": [{"code": "632621","name": "玛沁"}, {"code": "632622","name": "班玛"}, {"code": "632623","name": "甘德"}, {"code": "632624","name": "达日"}, {"code": "632625","name": "久治"}, {"code": "632626","name": "玛多"}]}, {"code": "6327","name": "玉树","sub": [{"code": "632701","name": "玉树"}, {"code": "632722","name": "杂多"}, {"code": "632723","name": "称多"}, {"code": "632724","name": "治多"}, {"code": "632725","name": "囊谦"}, {"code": "632726","name": "曲麻莱"}]}, {"code": "6328","name": "海西","sub": [{"code": "632801","name": "格尔木"}, {"code": "632802","name": "德令哈"}, {"code": "632821","name": "乌兰"}, {"code": "632822","name": "都兰"}, {"code": "632823","name": "天峻"}]}]}, {"code": "64","name": "宁夏","sub": [{"code": "6401","name": "银川","sub": [{"code": "640104","name": "兴庆"}, {"code": "640105","name": "西夏"}, {"code": "640106","name": "金凤"}, {"code": "640121","name": "永宁"}, {"code": "640122","name": "贺兰"}, {"code": "640181","name": "灵武"}]}, {"code": "6402","name": "石嘴山","sub": [{"code": "640202","name": "大武口"}, {"code": "640205","name": "惠农"}, {"code": "640221","name": "平罗"}]}, {"code": "6403","name": "吴忠","sub": [{"code": "640302","name": "利通"}, {"code": "640303","name": "红寺堡"}, {"code": "640323","name": "盐池"}, {"code": "640324","name": "同心"}, {"code": "640381","name": "青铜峡"}]}, {"code": "6404","name": "固原","sub": [{"code": "640402","name": "原州"}, {"code": "640422","name": "西吉"}, {"code": "640423","name": "隆德"}, {"code": "640424","name": "泾源"}, {"code": "640425","name": "彭阳"}]}, {"code": "6405","name": "中卫","sub": [{"code": "640502","name": "沙坡头"}, {"code": "640521","name": "中宁"}, {"code": "640522","name": "海原"}]}]}, {"code": "65","name": "新疆","sub": [{"code": "6501","name": "乌鲁木齐","sub": [{"code": "650102","name": "天山"}, {"code": "650103","name": "沙依巴克"}, {"code": "650104","name": "新市"}, {"code": "650105","name": "水磨沟"}, {"code": "650106","name": "头屯河"}, {"code": "650107","name": "达坂城"}, {"code": "650109","name": "米东"}, {"code": "650121","name": "乌鲁木齐"}]}, {"code": "6502","name": "克拉玛依","sub": [{"code": "650202","name": "独山子"}, {"code": "650203","name": "克拉玛依"}, {"code": "650204","name": "白碱滩"}, {"code": "650205","name": "乌尔禾"}]}, {"code": "6504","name": "吐鲁番","sub": [{"code": "650402","name": "高昌"}, {"code": "650421","name": "鄯善"}, {"code": "650422","name": "托克逊"}]}, {"code": "6505","name": "哈密","sub": [{"code": "650502","name": "伊州"}, {"code": "650521","name": "巴里"}, {"code": "650522","name": "伊吾"}]}, {"code": "6523","name": "昌吉","sub": [{"code": "652301","name": "昌吉"}, {"code": "652302","name": "阜康"}, {"code": "652323","name": "呼图壁"}, {"code": "652324","name": "玛纳斯"}, {"code": "652325","name": "奇台"}, {"code": "652327","name": "吉木萨尔"}, {"code": "652328","name": "木垒"}]}, {"code": "6527","name": "博尔塔拉","sub": [{"code": "652701","name": "博乐"}, {"code": "652702","name": "阿拉山口"}, {"code": "652722","name": "精河"}, {"code": "652723","name": "温泉"}]}, {"code": "6528","name": "巴音郭楞","sub": [{"code": "652801","name": "库尔勒"}, {"code": "652822","name": "轮台"}, {"code": "652823","name": "尉犁"}, {"code": "652824","name": "若羌"}, {"code": "652825","name": "且末"}, {"code": "652826","name": "焉耆"}, {"code": "652827","name": "和静"}, {"code": "652828","name": "和硕"}, {"code": "652829","name": "博湖"}]}, {"code": "6529","name": "阿克苏","sub": [{"code": "652901","name": "阿克苏"}, {"code": "652922","name": "温宿"}, {"code": "652923","name": "库车"}, {"code": "652924","name": "沙雅"}, {"code": "652925","name": "新和"}, {"code": "652926","name": "拜城"}, {"code": "652927","name": "乌什"}, {"code": "652928","name": "阿瓦提"}, {"code": "652929","name": "柯坪"}]}, {"code": "6530","name": "克孜勒","sub": [{"code": "653001","name": "阿图什"}, {"code": "653022","name": "阿克陶"}, {"code": "653023","name": "阿合奇"}, {"code": "653024","name": "乌恰"}]}, {"code": "6531","name": "喀什","sub": [{"code": "653101","name": "喀什"}, {"code": "653121","name": "疏附"}, {"code": "653122","name": "疏勒"}, {"code": "653123","name": "英吉沙"}, {"code": "653124","name": "泽普"}, {"code": "653125","name": "莎车"}, {"code": "653126","name": "叶城"}, {"code": "653127","name": "麦盖提"}, {"code": "653128","name": "岳普湖"}, {"code": "653129","name": "伽师"}, {"code": "653130","name": "巴楚"}, {"code": "653131","name": "塔什库尔干"}]}, {"code": "6532","name": "和田","sub": [{"code": "653201","name": "和田"}, {"code": "653221","name": "和田"}, {"code": "653222","name": "墨玉"}, {"code": "653223","name": "皮山"}, {"code": "653224","name": "洛浦"}, {"code": "653225","name": "策勒"}, {"code": "653226","name": "于田"}, {"code": "653227","name": "民丰"}]}, {"code": "6540","name": "伊犁","sub": [{"code": "654002","name": "伊宁"}, {"code": "654003","name": "奎屯"}, {"code": "654004","name": "霍尔果斯"}, {"code": "654021","name": "伊宁"}, {"code": "654022","name": "察布查尔"}, {"code": "654023","name": "霍城"}, {"code": "654024","name": "巩留"}, {"code": "654025","name": "新源"}, {"code": "654026","name": "昭苏"}, {"code": "654027","name": "特克斯"}, {"code": "654028","name": "尼勒克"}]}, {"code": "6542","name": "塔城","sub": [{"code": "654201","name": "塔城"}, {"code": "654202","name": "乌苏"}, {"code": "654221","name": "额敏"}, {"code": "654223","name": "沙湾"}, {"code": "654224","name": "托里"}, {"code": "654225","name": "裕民"}, {"code": "654226","name": "和布克赛尔"}]}, {"code": "6543","name": "阿勒泰","sub": [{"code": "654301","name": "阿勒泰"}, {"code": "654321","name": "布尔津"}, {"code": "654322","name": "富蕴"}, {"code": "654323","name": "福海"}, {"code": "654324","name": "哈巴河"}, {"code": "654325","name": "青河"}, {"code": "654326","name": "吉木乃"}]}, {"code": "6590","name": "新疆","sub": [{"code": "659001","name": "石河子"}, {"code": "659002","name": "阿拉尔"}, {"code": "659003","name": "图木舒克"}, {"code": "659004","name": "五家渠"}, {"code": "659006","name": "铁门关"}]}]}];

}(Zepto);
// jshint ignore: end

/* jshint unused:false*/

+ function($) {
    "use strict";
    var format = function(data) {
        var result = [];
        for(var i=0;i<data.length;i++) {
            var d = data[i];
            if(d.name === "请选择") continue;
            result.push(d.name);
        }
        if(result.length) return result;
        return [""];
    };

    var sub = function(data) {
        if(!data.sub) return [""];
        return format(data.sub);
    };

    var getCities = function(d) {
        for(var i=0;i< raw.length;i++) {
            if(raw[i].name === d) return sub(raw[i]);
        }
        return [""];
    };

    var getDistricts = function(p, c) {
        for(var i=0;i< raw.length;i++) {
            if(raw[i].name === p) {
                for(var j=0;j< raw[i].sub.length;j++) {
                    if(raw[i].sub[j].name === c) {
                        return sub(raw[i].sub[j]);
                    }
                }
            }
        }
        return [""];
    };

    var raw = $.smConfig.rawCitiesData;
    var provinces = raw.map(function(d) {
        return d.name;
    });
    var initCities = sub(raw[0]);

    var currentProvince = provinces[0];
    var currentCity = initCities[0];
    var initDistricts = getDistricts(currentProvince, currentCity);
    var currentDistrict = initDistricts[0];

    var t;
    var defaults = {

        cssClass: "city-picker",
        rotateEffect: false,  //为了性能

        onChange: function (picker, values, displayValues) {
            var newProvince = picker.cols[0].value;
            var newCity;
            if(newProvince !== currentProvince) {
                // 如果Province变化，节流以提高reRender性能
                clearTimeout(t);

                t = setTimeout(function(){
                    var newCities = getCities(newProvince);
                    newCity = newCities[0];
                    var newDistricts = getDistricts(newProvince, newCity);
                    picker.cols[1].replaceValues(newCities);
                    picker.cols[2].replaceValues(newDistricts);
                    currentProvince = newProvince;
                    currentCity = newCity;
                    picker.updateValue();
                }, 200);
                return;
            }
            newCity = picker.cols[1].value;
            if(newCity !== currentCity) {
                picker.cols[2].replaceValues(getDistricts(newProvince, newCity));
                currentCity = newCity;
                picker.updateValue();
            }
        },

        cols: [
        {
            textAlign: 'center',
            values: provinces,
            cssClass: "col-province"
        },
        {
            textAlign: 'center',
            values: initCities,
            cssClass: "col-city"
        },
        {
            textAlign: 'center',
            values: initDistricts,
            cssClass: "col-district"
        }
        ]
    };

    $.fn.cityPicker = function(params) {
        return this.each(function() {
            if(!this) return;
            var p = $.extend(defaults, params);
            //计算value
            if (p.value) {
                $(this).val(p.value.join(' '));
            } else {
                var val = $(this).val();
                val && (p.value = val.split(' '));
            }

            if (p.value) {
                //p.value = val.split(" ");
                if(p.value[0]) {
                    currentProvince = p.value[0];
                    p.cols[1].values = getCities(p.value[0]);
                }
                if(p.value[1]) {
                    currentCity = p.value[1];
                    p.cols[2].values = getDistricts(p.value[0], p.value[1]);
                } else {
                    p.cols[2].values = getDistricts(p.value[0], p.cols[1].values[0]);
                }
                !p.value[2] && (p.value[2] = '');
                currentDistrict = p.value[2];
            }
            $(this).picker(p);
        });
    };

}(Zepto);
(function defineMustache(global,factory){if(typeof exports==="object"&&exports&&typeof exports.nodeName!=="string"){factory(exports)}else if(typeof define==="function"&&define.amd){define(["exports"],factory)}else{global.Mustache={};factory(global.Mustache)}})(this,function mustacheFactory(mustache){var objectToString=Object.prototype.toString;var isArray=Array.isArray||function isArrayPolyfill(object){return objectToString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function typeStr(obj){return isArray(obj)?"array":typeof obj}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(obj,propName){return obj!=null&&typeof obj==="object"&&propName in obj}var regExpTest=RegExp.prototype.test;function testRegExp(re,string){return regExpTest.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(string){return String(string).replace(/[&<>"'`=\/]/g,function fromEntityMap(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tagsToCompile){if(typeof tagsToCompile==="string")tagsToCompile=tagsToCompile.split(spaceRe,2);if(!isArray(tagsToCompile)||tagsToCompile.length!==2)throw new Error("Invalid tags: "+tagsToCompile);openingTagRe=new RegExp(escapeRegExp(tagsToCompile[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tagsToCompile[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tagsToCompile[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length)}else{nonSpace=true}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n")stripSpace()}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);token=[type,value,start,scanner.pos];tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function scanUntil(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function push(view){return new Context(view,this)};Context.prototype.lookup=function lookup(name){var cache=this.cache;var value;if(cache.hasOwnProperty(name)){value=cache[name]}else{var context=this,names,index,lookupHit=false;while(context){if(name.indexOf(".")>0){value=context.view;names=name.split(".");index=0;while(value!=null&&index<names.length){if(index===names.length-1)lookupHit=hasProperty(value,names[index]);value=value[names[index++]]}}else{value=context.view[name];lookupHit=hasProperty(context.view,name)}if(lookupHit)break;context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.cache={}}Writer.prototype.clearCache=function clearCache(){this.cache={}};Writer.prototype.parse=function parse(template,tags){var cache=this.cache;var tokens=cache[template];if(tokens==null)tokens=cache[template]=parseTemplate(template,tags);return tokens};Writer.prototype.render=function render(template,view,partials){var tokens=this.parse(template);var context=view instanceof Context?view:new Context(view);return this.renderTokens(tokens,context,partials,template)};Writer.prototype.renderTokens=function renderTokens(tokens,context,partials,originalTemplate){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this.renderSection(token,context,partials,originalTemplate);else if(symbol==="^")value=this.renderInverted(token,context,partials,originalTemplate);else if(symbol===">")value=this.renderPartial(token,context,partials,originalTemplate);else if(symbol==="&")value=this.unescapedValue(token,context);else if(symbol==="name")value=this.escapedValue(token,context);else if(symbol==="text")value=this.rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype.renderSection=function renderSection(token,context,partials,originalTemplate){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate)}}else if(typeof value==="object"||typeof value==="string"||typeof value==="number"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate)}return buffer};Writer.prototype.renderInverted=function renderInverted(token,context,partials,originalTemplate){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate)};Writer.prototype.renderPartial=function renderPartial(token,context,partials){if(!partials)return;var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null)return this.renderTokens(this.parse(value),context,partials,value)};Writer.prototype.unescapedValue=function unescapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype.escapedValue=function escapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return mustache.escape(value)};Writer.prototype.rawValue=function rawValue(token){return token[1]};mustache.name="mustache.js";mustache.version="2.3.0";mustache.tags=["{{","}}"];var defaultWriter=new Writer;mustache.clearCache=function clearCache(){return defaultWriter.clearCache()};mustache.parse=function parse(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function render(template,view,partials){if(typeof template!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(template)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return defaultWriter.render(template,view,partials)};mustache.to_html=function to_html(template,view,partials,send){var result=mustache.render(template,view,partials);if(isFunction(send)){send(result)}else{return result}};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer;return mustache});
/**
 * Created by zhujinyu on 2018/2/6.
 */
var config = {
    // 路由功能开关过滤器，返回 false 表示当前点击链接不使用路由
    pageSize:10,
    postFee:0,
    bank_type: [
            {
                "name": "中国工商银行",
                "type": "ICB"
            },
            {
                "name": "中国农业银行",
                "type": "ABC"
            },
            {
                "name": "中国银行",
                "type": "BOC"
            },
            {
                "name": "中国建设银行",
                "type": "CCB"
            },
            {
                "name": "国家开发银行",
                "type": "CDB"
            },
            {
                "name": "中国进出口银行",
                "type": "EXIMB"
            },
            {
                "name": "中国农业发展银行",
                "type": "ADBC"
            },
            {
                "name": "交通银行",
                "type": "BOCOM"
            },
            {
                "name": "中信银行",
                "type": "CITIC"
            },
            {
                "name": "中国光大银行",
                "type": "CEB"
            },
            {
                "name": "华夏银行",
                "type": "HXB"
            },
            {
                "name": "中国民生银行",
                "type": "CMBC"
            },
            {
                "name": "广发银行",
                "type": "GDB"
            },
            {
                "name": "平安银行",
                "type": "SPAB"
            },
            {
                "name": "招商银行",
                "type": "CMB"
            },
            {
                "name": "兴业银行",
                "type": "CIB"
            },
            {
                "name": "上海浦东发展银行",
                "type": "SPDB"
            },
            {
                "name": "北京银行",
                "type": "BJB"
            },
            {
                "name": "天津银行",
                "type": "TIANJINB"
            },
            {
                "name": "河北银行",
                "type": "HEBEIB"
            },
            {
                "name": "唐山银行",
                "type": "TANGSHANB"
            },
            {
                "name": "秦皇岛银行",
                "type": "QHDB"
            },
            {
                "name": "邯郸银行",
                "type": "HDYH"
            },
            {
                "name": "邢台银行",
                "type": "XTYX"
            },
            {
                "name": "保定银行",
                "type": "BDYX"
            },
            {
                "name": "张家口银行",
                "type": "ZJKYX"
            },
            {
                "name": "承德银行",
                "type": "CDYX"
            },
            {
                "name": "沧州银行",
                "type": "CZYX"
            },
            {
                "name": "廊坊银行",
                "type": "LFYX"
            },
            {
                "name": "衡水银行",
                "type": "HSHUIYX"
            },
            {
                "name": "晋商银行",
                "type": "JSYX"
            },
            {
                "name": "大同银行",
                "type": "DTYX"
            },
            {
                "name": "阳泉市商业银行",
                "type": "YQSSYYX"
            },
            {
                "name": "长治银行",
                "type": "CZCCB"
            },
            {
                "name": "晋城银行",
                "type": "JCYX"
            },
            {
                "name": "晋中银行",
                "type": "JZYX"
            },
            {
                "name": "内蒙古银行",
                "type": "NMGYX"
            },
            {
                "name": "包商银行",
                "type": "BSB"
            },
            {
                "name": "乌海银行",
                "type": "WHYX"
            },
            {
                "name": "鄂尔多斯银行",
                "type": "EEDSYX"
            },
            {
                "name": "盛京银行",
                "type": "SJYX"
            },
            {
                "name": "大连银行",
                "type": "DLB"
            },
            {
                "name": "鞍山银行",
                "type": "ASYX"
            },
            {
                "name": "抚顺银行",
                "type": "FSYX"
            },
            {
                "name": "本溪市商业银行",
                "type": "BXSSYYX"
            },
            {
                "name": "丹东银行",
                "type": "DDYX"
            },
            {
                "name": "锦州银行",
                "type": "JZBANK"
            },
            {
                "name": "葫芦岛银行",
                "type": "HLDYX"
            },
            {
                "name": "营口银行",
                "type": "YKYX"
            },
            {
                "name": "营口沿海银行",
                "type": "YKYHYX"
            },
            {
                "name": "阜新银行",
                "type": "FXYX"
            },
            {
                "name": "辽阳银行",
                "type": "LYYX"
            },
            {
                "name": "盘锦银行",
                "type": "PJYX"
            },
            {
                "name": "铁岭银行",
                "type": "TLYX"
            },
            {
                "name": "朝阳银行",
                "type": "CYYX"
            },
            {
                "name": "吉林银行",
                "type": "JLYX"
            },
            {
                "name": "哈尔滨银行",
                "type": "HEBYX"
            },
            {
                "name": "龙江银行",
                "type": "LJYX"
            },
            {
                "name": "南京银行",
                "type": "NJYX"
            },
            {
                "name": "江苏银行",
                "type": "JSBANK"
            },
            {
                "name": "苏州银行",
                "type": "SZYX"
            },
            {
                "name": "江苏长江商业银行",
                "type": "JSZJSYYX"
            },
            {
                "name": "杭州银行",
                "type": "HANGZYX"
            },
            {
                "name": "宁波东海银行",
                "type": "NBDHYX"
            },
            {
                "name": "宁波银行",
                "type": "NBB"
            },
            {
                "name": "宁波通商银行",
                "type": "NBTSYX"
            },
            {
                "name": "温州银行",
                "type": "WZYX"
            },
            {
                "name": "嘉兴银行",
                "type": "JXBANK"
            },
            {
                "name": "湖州银行",
                "type": "HUZYX"
            },
            {
                "name": "绍兴银行",
                "type": "SXYX"
            },
            {
                "name": "金华银行",
                "type": "JHYX"
            },
            {
                "name": "浙江稠州商业银行",
                "type": "ZJCZSYYX"
            },
            {
                "name": "台州银行",
                "type": "TZYX"
            },
            {
                "name": "浙江泰隆商业银行",
                "type": "ZJTLSYYX"
            },
            {
                "name": "浙江民泰商业银行",
                "type": "ZJMTSYYX"
            },
            {
                "name": "福建海峡银行",
                "type": "FJHXYX"
            },
            {
                "name": "厦门银行",
                "type": "SMYX"
            },
            {
                "name": "泉州银行",
                "type": "QZYX"
            },
            {
                "name": "江西银行",
                "type": "JXYX"
            },
            {
                "name": "九江银行",
                "type": "JJYX"
            },
            {
                "name": "赣州银行",
                "type": "GZYX"
            },
            {
                "name": "上饶银行",
                "type": "SRYX"
            },
            {
                "name": "齐鲁银行",
                "type": "QLYX"
            },
            {
                "name": "青岛银行",
                "type": "QDYX"
            },
            {
                "name": "齐商银行",
                "type": "QSYX"
            },
            {
                "name": "枣庄银行",
                "type": "ZZYX"
            },
            {
                "name": "东营银行",
                "type": "DYCCB"
            },
            {
                "name": "烟台银行",
                "type": "YTYX"
            },
            {
                "name": "潍坊银行",
                "type": "WFYX"
            },
            {
                "name": "济宁银行",
                "type": "JNYX"
            },
            {
                "name": "泰安银行",
                "type": "TAYX"
            },
            {
                "name": "莱商银行",
                "type": "LSYX"
            },
            {
                "name": "威海市商业银行",
                "type": "WHSSYYX"
            },
            {
                "name": "德州银行",
                "type": "DZYX"
            },
            {
                "name": "临商银行",
                "type": "LSBANK"
            },
            {
                "name": "日照银行",
                "type": "RZYX"
            },
            {
                "name": "郑州银行",
                "type": "ZZBANK"
            },
            {
                "name": "中原银行",
                "type": "ZYYX"
            },
            {
                "name": "洛阳银行",
                "type": "LYBANK"
            },
            {
                "name": "平顶山银行",
                "type": "PDSYX"
            },
            {
                "name": "焦作中旅银行",
                "type": "JZZLYX"
            },
            {
                "name": "汉口银行",
                "type": "HKYX"
            },
            {
                "name": "湖北银行",
                "type": "HBYX"
            },
            {
                "name": "华融湘江银行",
                "type": "HRXJYX"
            },
            {
                "name": "长沙银行",
                "type": "CSCB"
            },
            {
                "name": "广州银行",
                "type": "GZCB"
            },
            {
                "name": "珠海华润银行",
                "type": "ZHHRYX"
            },
            {
                "name": "广东华兴银行",
                "type": "GDHXYX"
            },
            {
                "name": "广东南粤银行",
                "type": "GDNYYX"
            },
            {
                "name": "东莞银行",
                "type": "DGYX"
            },
            {
                "name": "广西北部湾银行",
                "type": "GXBBWYX"
            },
            {
                "name": "柳州银行",
                "type": "LZYX"
            },
            {
                "name": "桂林银行",
                "type": "GLYX"
            },
            {
                "name": "海南银行",
                "type": "HNYX"
            },
            {
                "name": "成都银行",
                "type": "CDBANK"
            },
            {
                "name": "重庆银行",
                "type": "CQB"
            },
            {
                "name": "自贡银行",
                "type": "ZGYX"
            },
            {
                "name": "攀枝花市商业银行",
                "type": "PZHSSYYX"
            },
            {
                "name": "泸州市商业银行",
                "type": "LZSSYYX"
            },
            {
                "name": "长城华西银行",
                "type": "ZCHXYX"
            },
            {
                "name": "绵阳市商业银行",
                "type": "MYSSYYX"
            },
            {
                "name": "遂宁银行",
                "type": "SNYX"
            },
            {
                "name": "乐山市商业银行",
                "type": "LSSSYYX"
            },
            {
                "name": "宜宾市商业银行",
                "type": "YBSSYYX"
            },
            {
                "name": "四川天府银行",
                "type": "SCTFYX"
            },
            {
                "name": "达州银行",
                "type": "DZBANK"
            },
            {
                "name": "雅安市商业银行",
                "type": "YASSYYX"
            },
            {
                "name": "凉山州商业银行",
                "type": "LSZSYYX"
            },
            {
                "name": "贵阳银行",
                "type": "GYYX"
            },
            {
                "name": "贵州银行",
                "type": "GZBANK"
            },
            {
                "name": "富滇银行",
                "type": "FDYX"
            },
            {
                "name": "曲靖市商业银行",
                "type": "QJSSYYX"
            },
            {
                "name": "云南红塔银行",
                "type": "YNHTYX"
            },
            {
                "name": "西藏银行",
                "type": "XZBC"
            },
            {
                "name": "西安银行",
                "type": "XAYX"
            },
            {
                "name": "长安银行",
                "type": "ZAYX"
            },
            {
                "name": "兰州银行",
                "type": "LZCB"
            },
            {
                "name": "甘肃银行",
                "type": "GSYX"
            },
            {
                "name": "青海银行",
                "type": "QHYX"
            },
            {
                "name": "宁夏银行",
                "type": "NXYX"
            },
            {
                "name": "石嘴山银行",
                "type": "SZSYX"
            },
            {
                "name": "乌鲁木齐银行",
                "type": "WLMQYX"
            },
            {
                "name": "新疆银行",
                "type": "XJYX"
            },
            {
                "name": "昆仑银行",
                "type": "KLYX"
            },
            {
                "name": "哈密市商业银行",
                "type": "HMSSYYX"
            },
            {
                "name": "库尔勒银行",
                "type": "KELYX"
            },
            {
                "name": "新疆汇和银行",
                "type": "XJHHYX"
            },
            {
                "name": "天津滨海农村商业银行",
                "type": "TJBHNCSYYX"
            },
            {
                "name": "大连农村商业银行",
                "type": "DLNCSYYX"
            },
            {
                "name": "无锡农村商业银行",
                "type": "WXNCSYYX"
            },
            {
                "name": "江苏江阴农村商业银行",
                "type": "JSJYNCSYYX"
            },
            {
                "name": "江苏江南农村商业银行",
                "type": "JSJNNCSYYX"
            },
            {
                "name": "太仓农村商业银行",
                "type": "TCNCSYYX"
            },
            {
                "name": "昆山农村商业银行",
                "type": "KSNCSYYX"
            },
            {
                "name": "吴江农村商业银行",
                "type": "WJNCSYYX"
            },
            {
                "name": "江苏常熟农村商业银行",
                "type": "JSCSNCSYYX"
            },
            {
                "name": "张家港农村商业银行",
                "type": "ZJGNCSYYX"
            },
            {
                "name": "广州农村商业银行",
                "type": "GZNCSYYX"
            },
            {
                "name": "广东顺德农村商业银行",
                "type": "GDSDNCSYYX"
            },
            {
                "name": "海口联合农村商业银行",
                "type": "HKLHNCSYYX"
            },
            {
                "name": "成都农商银行",
                "type": "CDRCB"
            },
            {
                "name": "重庆农村商业银行",
                "type": "CRCB"
            },
            {
                "name": "恒丰银行",
                "type": "HFYX"
            },
            {
                "name": "浙商银行",
                "type": "ZSYX"
            },
            {
                "name": "天津农村商业银行",
                "type": "TJNCSYYX"
            },
            {
                "name": "渤海银行",
                "type": "BHYX"
            },
            {
                "name": "徽商银行",
                "type": "HSHANGYX"
            },
            {
                "name": "重庆三峡银行",
                "type": "ZQSXYX"
            },
            {
                "name": "上海农商银行",
                "type": "SHNSYX"
            },
            {
                "name": "上海银行",
                "type": "SHB"
            },
            {
                "name": "北京农村商业银行",
                "type": "BJNCSYYX"
            },
            {
                "name": "河北省农村信用社",
                "type": "HEBEISNCXYS"
            },
            {
                "name": "山西省农村信用社",
                "type": "SHANXISNCXYS"
            },
            {
                "name": "内蒙古自治区农村信用社",
                "type": "NMGZZQNCXYS"
            },
            {
                "name": "辽宁省农村信用社",
                "type": "LNSNCXYS"
            },
            {
                "name": "吉林省农村信用社",
                "type": "JLSNCXYS"
            },
            {
                "name": "黑龙江省农村信用社",
                "type": "HLJSNCXYS"
            },
            {
                "name": "江苏省农村信用社",
                "type": "JSSNCXYS"
            },
            {
                "name": "浙江省农村信用社",
                "type": "ZJSNCXYS"
            },
            {
                "name": "宁波鄞州农村商业银行",
                "type": "NBYZNCSYYX"
            },
            {
                "name": "安徽省农村信用社",
                "type": "AHSNCXYS"
            },
            {
                "name": "福建省农村信用社",
                "type": "FJSNCXYS"
            },
            {
                "name": "江西省农村信用社",
                "type": "JXSNCXYS"
            },
            {
                "name": "山东省农村信用社",
                "type": "SDSNCXYS"
            },
            {
                "name": "河南省农村信用社",
                "type": "HENANSNCXYS"
            },
            {
                "name": "湖北省农村信用社",
                "type": "HUBEISNCXYS"
            },
            {
                "name": "武汉农村商业银行",
                "type": "WHNCSYYX"
            },
            {
                "name": "湖南省农村信用社",
                "type": "HUNANSNCXYS"
            },
            {
                "name": "广东省农村信用社",
                "type": "GDSNCXYS"
            },
            {
                "name": "深圳农村商业银行",
                "type": "SZNCSYYX"
            },
            {
                "name": "东莞农村商业银行",
                "type": "DGNCSYYX"
            },
            {
                "name": "广西壮族自治区农村信用社",
                "type": "GXZZZZQNCXYS"
            },
            {
                "name": "海南省农村信用社",
                "type": "HAINANSNCXYS"
            },
            {
                "name": "四川省农村信用社",
                "type": "SCSNCXYS"
            },
            {
                "name": "贵州省农村信用社",
                "type": "GZSNCXYS"
            },
            {
                "name": "云南省农村信用社",
                "type": "YNSNCXYS"
            },
            {
                "name": "陕西省农村信用社",
                "type": "SXSNCXYS"
            },
            {
                "name": "兰州农村商业银行",
                "type": "GSRCU"
            },
            {
                "name": "青海省农村信用社",
                "type": "QHSNCXYS"
            },
            {
                "name": "宁夏黄河农村商业银行",
                "type": "NXHHNCSYYX"
            },
            {
                "name": "新疆维吾尔自治区农村信用社",
                "type": "XJWWEZZQNCXYS"
            },
            {
                "name": "中国邮政储蓄银行",
                "type": "PSBC"
            },
            {
                "name": "汇丰银行",
                "type": "HSBC"
            },
            {
                "name": "东亚银行",
                "type": "BEA"
            },
            {
                "name": "南洋商业银行",
                "type": "NYSYYX"
            },
            {
                "name": "恒生银行",
                "type": "HSHENGYX"
            },
            {
                "name": "集友银行",
                "type": "JYYX"
            },
            {
                "name": "创兴银行",
                "type": "CXYX"
            },
            {
                "name": "永隆银行",
                "type": "YLBANK"
            },
            {
                "name": "大新银行",
                "type": "DXYX"
            },
            {
                "name": "中信银行",
                "type": "ZXYX"
            },
            {
                "name": "合作金库商业银行",
                "type": "HZJKSYYX"
            },
            {
                "name": "第一商业银行",
                "type": "DYSYYX"
            },
            {
                "name": "花旗银行",
                "type": "HQYX"
            },
            {
                "name": "美国银行",
                "type": "MGYX"
            },
            {
                "name": "摩根大通银行",
                "type": "MGDTYX"
            },
            {
                "name": "三菱东京日联银行",
                "type": "SLDJRLYX"
            },
            {
                "name": "三井住友银行",
                "type": "SJZYYX"
            },
            {
                "name": "瑞穗银行",
                "type": "RSYX"
            },
            {
                "name": "友利银行",
                "type": "YLYX"
            },
            {
                "name": "韩国产业银行",
                "type": "HGCYYX"
            },
            {
                "name": "新韩银行",
                "type": "XHYX"
            },
            {
                "name": "企业银行",
                "type": "QYYX"
            },
            {
                "name": "韩亚银行",
                "type": "HYYX"
            },
            {
                "name": "国民银行",
                "type": "GMYX"
            },
            {
                "name": "永丰银行",
                "type": "YFYX"
            },
            {
                "name": "首都银行",
                "type": "SDYX"
            },
            {
                "name": "华侨永亨银行",
                "type": "HQYHYX"
            },
            {
                "name": "大华银行",
                "type": "DHYX"
            },
            {
                "name": "星展银行",
                "type": "XZYX"
            },
            {
                "name": "盘谷银行",
                "type": "PGYX"
            },
            {
                "name": "渣打银行",
                "type": "ZDYX"
            },
            {
                "name": "法国兴业银行",
                "type": "FGXYYX"
            },
            {
                "name": "德意志银行",
                "type": "DYZYX"
            },
            {
                "name": "德国商业银行",
                "type": "DGSYYX"
            },
            {
                "name": "中德住房储蓄银行",
                "type": "ZDZFCXYX"
            },
            {
                "name": "瑞士银行",
                "type": "UBS"
            },
            {
                "name": "蒙特利尔银行",
                "type": "MTLEYX"
            },
            {
                "name": "澳大利亚和新西兰银行",
                "type": "ADLYHXXLYX"
            },
            {
                "name": "摩根士丹利国际银行",
                "type": "MGSDLGJYX"
            },
            {
                "name": "华美银行",
                "type": "HMYX"
            },
            {
                "name": "厦门国际银行",
                "type": "SMGJYX"
            },
            {
                "name": "法国巴黎银行",
                "type": "FGBLYX"
            },
            {
                "name": "富邦华一银行",
                "type": "FBHYYX"
            },
            {
                "name": "(澳门地区)中国银行",
                "type": "(AMDQ)ZGYX"
            },
            {
                "name": "(香港地区)中国银行",
                "type": "(XGDQ)ZGYX"
            }
        ],
    vender_resource: [
        {
            "name": "汽油",
            "id": 1,
            "subclass":[
                {"type":"Q89","name":"89#汽油","consumCategory":"1"},
                {"type":"Q92","name":"92#汽油","consumCategory":"1"},
                {"type":"Q95","name":"95#汽油","consumCategory":"1"},
                {"type":"Q98","name":"98#汽油","consumCategory":"1"}
            ],
            "number":[
                {"type":"1","name":"1号枪"},
                {"type":"2","name":"2号枪"},
                {"type":"3","name":"3号枪"},
                {"type":"4","name":"4号枪"},
                {"type":"5","name":"5号枪"},
                {"type":"6","name":"6号枪"},
                {"type":"7","name":"7号枪"},
                {"type":"8","name":"8号枪"},
                {"type":"9","name":"9号枪"},
                {"type":"10","name":"10号枪"},
                {"type":"11","name":"11号枪"},
                {"type":"12","name":"12号枪"},
                {"type":"13","name":"13号枪"},
                {"type":"14","name":"14号枪"},
                {"type":"15","name":"15号枪"},
                {"type":"16","name":"16号枪"},
                {"type":"17","name":"17号枪"},
                {"type":"18","name":"18号枪"},
                {"type":"19","name":"19号枪"},
                {"type":"20","name":"20号枪"}
            ]
        },
        {
            "name": "柴油",
            "id": 2,
            "subclass":[
                {"type":"C0","name":"0#柴油","consumCategory":"1"},
                {"type":"C5","name":"5#柴油","consumCategory":"1"},
                {"type":"C-10","name":"10#柴油","consumCategory":"1"},
                {"type":"C-20","name":"20#柴油","consumCategory":"1"},
                {"type":"C-35","name":"35#柴油","consumCategory":"1"},
                {"type":"C-50","name":"50#柴油","consumCategory":"1"}
            ],
            "number":[
                {"type":"1","name":"1号枪"},
                {"type":"2","name":"2号枪"},
                {"type":"3","name":"3号枪"},
                {"type":"4","name":"4号枪"},
                {"type":"5","name":"5号枪"},
                {"type":"6","name":"6号枪"},
                {"type":"7","name":"7号枪"},
                {"type":"8","name":"8号枪"},
                {"type":"9","name":"9号枪"},
                {"type":"10","name":"10号枪"},
                {"type":"11","name":"11号枪"},
                {"type":"12","name":"12号枪"},
                {"type":"13","name":"13号枪"},
                {"type":"14","name":"14号枪"},
                {"type":"15","name":"15号枪"},
                {"type":"16","name":"16号枪"},
                {"type":"17","name":"17号枪"},
                {"type":"18","name":"18号枪"},
                {"type":"19","name":"19号枪"},
                {"type":"20","name":"20号枪"}
            ]
        },
        {
            "name": "天然气",
            "id": 3,
            "subclass":[
                {"type":"CNG","name":"CNG天然气","consumCategory":"2"},
                {"type":"LNG","name":"LNG天然气","consumCategory":"2"}
            ],
            "number":[
                {"type":"1","name":"1号枪"},
                {"type":"2","name":"2号枪"},
                {"type":"3","name":"3号枪"},
                {"type":"4","name":"4号枪"},
                {"type":"5","name":"5号枪"},
                {"type":"6","name":"6号枪"},
                {"type":"7","name":"7号枪"},
                {"type":"8","name":"8号枪"},
                {"type":"9","name":"9号枪"},
                {"type":"10","name":"10号枪"},
                {"type":"11","name":"11号枪"},
                {"type":"12","name":"12号枪"},
                {"type":"13","name":"13号枪"},
                {"type":"14","name":"14号枪"},
                {"type":"15","name":"15号枪"},
                {"type":"16","name":"16号枪"},
                {"type":"17","name":"17号枪"},
                {"type":"18","name":"18号枪"},
                {"type":"19","name":"19号枪"},
                {"type":"20","name":"20号枪"}
            ]
        }
    ],
    vender_indexBanner: [
        {
            img_url: '/app/upload/carousel/vender/1.jpg',
        },
        {
            img_url: '/app/upload/carousel/vender/2.jpg',
        },
        {
            img_url: '/app/upload/carousel/vender/3.jpg',
        }
    ],
    vender_findBanner: [
        {
            img_url: '/app/upload/carousel/vender/1.jpg',
            url: 'javascript:;',
        },
        {
            img_url: '/app/upload/carousel/vender/2.jpg',
            url: 'javascript:;'
        },
        {
            img_url: '/app/upload/carousel/vender/3.jpg',
            url: 'javascript:;'
        }
    ],
    vender_findOutLink:[
        {
            img_url: '../../static/img/jd.jpg',
            url: 'https://m.jd.com',
            title:'京东'
        },
        {
            img_url: '../../static/img/tuhu.jpg',
            url: 'https://www.tuhu.cn',
            title:'途虎养车'
        },
        {
            img_url: '../../static/img/park.jpg',
            url: 'http://www.cx580.cn',
            title:'违章查询'
        },
        {
            img_url: '../../static/img/find4.jpg',
            url: 'http://www.cx580.cn',
            title:'智慧停车'
        }
    ],
    driver_indexBanner:[
        {
            img_url:'/app/upload/carousel/driver/1.jpg'
        },
        {
            img_url:'/app/upload/carousel/driver/2.jpg'
        },
        {
            img_url:'/app/upload/carousel/driver/3.jpg'
        }
    ],
    driver_indexNav:[
        {
            id:'1',
            href:'#tab1',
            className:'active',
            companyTpe:'2',
            imgUrl:'../../static/img/jiaqi.png',
            name:'加气站'
        },{
            id:'2',
            href:'#tab2',
            className:'',
            companyTpe:'1',
            imgUrl:'../../static/img/jiayou.png',
            name:'加油站'
        },{
            id:'3',
            href:'map.html',
            className:'',
            companyTpe:'',
            imgUrl:'../../static/img/weixiu.png',
            name:'维修站'
        }
    ],
    driver_findBanner:[
            {
                img_url: '/app/upload/carousel/driver/1.jpg',
                url: 'javascript:;',
            },
            {
                img_url: '/app/upload/carousel/driver/2.jpg',
                url: 'javascript:;'
            },
            {
                img_url: '/app/upload/carousel/driver/3.jpg',
                url: 'javascript:;'
            }
        ],
    driver_findOutLink:[
        {
            img_url: '../../static/img/jd.jpg',
            url: 'https://m.jd.com',
            title:'京东'
        },
        {
            img_url: '../../static/img/tuhu.jpg',
            url: 'https://www.tuhu.cn',
            title:'途虎养车'
        },
        {
            img_url: '../../static/img/park.jpg',
            url: 'http://www.cx580.cn',
            title:'违章查询'
        },
        {
            img_url: '../../static/img/find4.jpg',
            url: 'http://www.cx580.cn',
            title:'智慧停车'
        }
    ],
    supportServices:[
        {
            id: '1',
            imgUrl: '../../static/img/toilet.svg',
            title:'洗手间'
        },
        {
            id: '2',
            imgUrl: '../../static/img/store.svg',
            title:'便利店'
        },
        {
            id: '3',
            imgUrl: '../../static/img/parking.svg',
            title:'停车场'
        },
        {
            id: '4',
            imgUrl: '../../static/img/wifi.svg',
            title:'WIFI'
        },
        {
            id: '5',
            imgUrl: '../../static/img/restaurant.svg',
            title:'餐厅'
        }
    ],
    findOutLink:[
        {
            img_url: '../../static/img/jd.jpg',
            url: 'javascript:;',
            title:'京东'
        },
        {
            img_url: '../../static/img/tuhu.jpg',
            url: 'javascript:;',
            title:'途虎养车'
        },
        {
            img_url: '../../static/img/park.jpg',
            url: 'javascript:;',
            title:'违章查询'
        },
        {
            img_url: '../../static/img/find4.jpg',
            url: 'javascript:;',
            title:'智慧停车'
        }
    ],
    vehicle_type:[
        {"type":"1","name":"平板"},
        {"type":"2","name":"高栏"},
        {"type":"3","name":"箱式"},
        {"type":"4","name":"高低板"},
        {"type":"5","name":"保温"},
        {"type":"6","name":"冷藏"},
        {"type":"7","name":"自卸"},
        {"type":"8","name":"中卡"},
        {"type":"9","name":"面包"},
    ],
    vender_type:[
        {"type":"1","name":"加油站"},
        {"type":"2","name":"加气站"},
        {"type":"3","name":"物流商"},
        {"type":"4","name":"其他商家"}
    ],
    goods_type:[
        {"type":1,"name":"普通货物"},
        {"type":2,"name":"危险货物"},
    ],
    cityid:[
        { 'type':'11',name:'北京'},
        { 'type':'31',name:'上海'},
        { 'type':'4401',name:'广州'},
        { 'type':'4403',name:'深圳'}
        ]
};/**
 * Created by zhujinyu on 2018/2/7.
 */
//var BASE_URL = '/app';
//Aman工作室修改//
var BASE_URL = 'http://118.190.152.119/app';

/**渲染模板*/
function getRenderTmpl(tmpl, data_set) {
    var template = $(tmpl).html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, data_set);
    return rendered;
}
/*模板加载*/
function addItem(tmpl, data_set, obj) {
    var reg = /demo/;
    if (reg.test(obj)) {
        data_set.list.map(function (currentValue) {
            currentValue.star = new Array();
            currentValue.star.length = currentValue.starNum;
            return currentValue;
        });
    }
    var rendered = getRenderTmpl(tmpl, data_set);
    $(obj).append(rendered);
}

/*获取经纬度*/
function getLngLat(callback,error) {
    if(window.hasOwnProperty("AMap")){
        var map = new AMap.Map("mapContainer", {
            resizeEnable: true
        });
        map.plugin('AMap.Geolocation', function () {
            geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,//是否使用高精度定位，默认:true
                timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            });
            geolocation.getCurrentPosition(function (status,result) {
                if (status == "complete" ||status == "ok") {
                    var str = [];
                    str.push(result.position.lng);
                    str.push(result.position.lat);
                    str = GCJ2WGS(str);
                    callback && callback(str);
                }else{
                    error && error();
                    console.log("定位失败");
                }
            });
        });
    }else{
        var str = [];
        str.push('116.40717');
        str.push('39.90469');
        callback && callback(str);
    }
}
/**跳转到地图*/
$(document).on('click', '.navigation', function () {
    var location_end = $(this).attr("data-end").split(",");
    var userName = $(this).attr("data-userName");
    getAPPMethod(function () {
        if(window.gasstation){
           var  location = {
               lng:location_end[0],
               lat:location_end[1],
               venderName:userName
           }
            var newLocation = JSON.stringify(location);
            window.gasstation.mapLocation(newLocation);
        }else{
            getLngLat(function (data) {
                GoDestination(data, location_end);
            })
        }
    },function () {
        if(window.webkit){
            window.webkit.messageHandlers.mapLocation.postMessage({
                Lng: location_end[0],
                lat: location_end[1]
            });
        }else {
            getLngLat(function (data) {
                GoDestination(data, location_end);
            })
        }
    },function () {
        getLngLat(function (data) {
            GoDestination(data, location_end);
        })
    });
})
/**地图导航*/
function GoDestination(currentlocation, endLocation) {
    var map = new AMap.Map("mapContainer");
    AMap.plugin(["AMap.Driving"], function () {
        var drivingOption = {
            policy: AMap.DrivingPolicy.LEAST_TIME,
            map: map
        };
        var driving = new AMap.Driving(drivingOption); //构造驾车导航类
        console.log(currentlocation, endLocation);
        driving.search(currentlocation, endLocation, function (status, result) {
            driving.searchOnAMAP({
                origin: result.origin,
                destination: result.destination
            });
        });
    });
}

/**ajax请求封装*/
function ajaxRequest(params) {
    var token = getCookie("token");
    var pathname = window.location.pathname;
    var reg = [/register/,/login/,/forgetPassword/,/fastRegister/,/forget-password/,/find/];
    var result = [];
    for (var i = 0; i < reg.length; i++) {
        if(reg[i].test(pathname)){
            result.push('true');
        }else{
            result.push('false');
        }
    }
    if (!token) {
        if (result.indexOf('true') == -1) {
            pageGo("login");
        }
    }

    $.ajax({
        headers: {
            Accept: "application/json; charset=utf-8",
            token:token
        },
        url: BASE_URL + params.url,
        type: params.type,
        timeout : 10000,
        dataType: 'json',
        data: JSON.stringify(params.data),
        contentType: 'application/json',
        async: params.async || true,
        success: function (response) {
            if(response.retCode === '1000'){
                pageGo("login");
            }else{
                params.callback && params.callback(response);
            }
        },
        complete : function(XMLHttpRequest,status){
            if(status=='timeout'){
                $.alert("请求超时,请重新刷新页面", '',function () {
                    window.location.reload();
                });
            }
        }
    })
}
/**新ajax请求封装*/
function ajaxRequests(url,type,data,callback,errorBack) {
    console.time('请求计时');
    var token = getCookie("token");
    var pathname = window.location.pathname;
    var reg = [/register/,/login/,/forgetPassword/,/fastRegister/,/forget-password/,/find/];
    var result = [];
    for (var i = 0; i < reg.length; i++) {
        if(reg[i].test(pathname)){
            result.push('true');
        }else{
            result.push('false');
        }
    }
    if (!token) {
        if (result.indexOf('true') == -1) {
            pageGo("login");
        }
    }
    if (type == 'get') {
        $.ajax({
            headers: {
                Accept: "application/json; charset=utf-8",
                token: token
            },
            url: BASE_URL + url,
            type: type,
            timeout : 10000,
            dataType: 'json',
            contentType: 'application/json',
            async: true,
            success: function (response) {
                if(response.retCode === '1000'){
                    pageGo("login");
                }else{
                    callback && callback(response);
                }
                console.timeEnd('请求计时');
            },
            error: function (xhr, errorType, error) {
                errorBack && errorBack();
            },
            complete : function(XMLHttpRequest,status){
                if(status=='timeout'){
                    $.alert("请求超时,请重新刷新页面", '',function () {
                        window.location.reload();
                    });
                }
            }
        })
    } else {
        $.ajax({
            headers: {
                Accept: "application/json; charset=utf-8",
                token: token
            },
            url: BASE_URL + url,
            type: type,
            timeout : 10000,
            dataType: 'json',
            data: JSON.stringify(data),
            contentType: 'application/json',
            async: true,
            success: function (response) {
                if(response.retCode === '1000'){
                    pageGo("login");
                }else{
                    callback && callback(response);
                }
                console.timeEnd('请求计时');
            },
            error: function () {
                errorBack && errorBack();
            },
            complete : function(XMLHttpRequest,status){
                if(status=='timeout'){
                    $.alert("请求超时,请重新刷新页面", '',function () {
                        window.location.reload();
                    });
                }
            }
        })
    }
}
/**完整ajax请求*/
function ajaxCompleteRequests(url,type,data,callback,beforeSend,complete) {
    console.time('请求计时');
    var token = getCookie("token");
    $.ajax({
        headers: {
            Accept: "application/json; charset=utf-8",
            token: token
        },
        url: BASE_URL + url,
        type: type,
        timeout : 10000,
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        async: false,
        success: function (response) {
            callback && callback(response);
            console.timeEnd('请求计时');
        },
        beforeSend:function () {
            console.log("请求之前：")
            beforeSend && beforeSend();
        },
        complete : function(XMLHttpRequest,status){
            console.log("请求完成");
            if(status=='timeout'){
                $.alert("请求超时,重新刷新页面", '',function () {
                    window.location.reload();
                });
            }else{
                complete && complete();
            }
        }
    })
}
var t;
/**验证码倒计时*/
function Time(obj, times) {
    times = parseInt(times);
    t = setInterval(function () {
        times -= 1;
        obj.html(times + "秒");
        if (times === 0) {
            obj.attr("data-end", 1);
            obj.html("重新获取验证码");
            obj.css("background", "#f00");
            obj.css("color", "#fff");
            clearInterval(t);
        }
    }, 1000)
}

/**上传图片*/
function fromImgRequest(params,obj) {
    if(!obj){
        var fileUpload = document.getElementById("uploadForm");
        var data = new FormData(fileUpload);
    }else{
        var data = new FormData(obj);
    }
    var type = data.get('file').type;
    var size = data.get('file').size;
    var maxSize = 100 * 1024 * 1024;
    var reg = /image/;
    if (!reg.test(type)) {
        $.toast("请上传图片", 3000);
        return;
    } else if (size > maxSize) {
        $.toast("图片大小不能超过100M", 3000);
        return;
    }
    $.ajax({
        url: BASE_URL + params.url,
        headers: {
            'Lairen-X-Requested-With': 'H5/5.3.2 (OS 100; iPhone 100s)'
        },
        type: 'post',
        async: true,
        data: data,
        cache: true,
        contentType: false,
        processData: false,
        dataType: "multipart/form-data",
        success: function (response) {
            params.callback && params.callback(JSON.parse(response));
        },
        error: function () {
            $.toast("上传失败", 3000);
        }
    });
}

function getQueryString(name) {

    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');

    var r = window.location.search.substr(1).match(reg);

    if (r != null) {

        return unescape(r[2]);

    }

    return null;

}

/*筛选可服务列表*/
function filter(datas) {
    if (!datas) {
        return;
    }
    var list = datas.split(",");
    var supportServices = config.supportServices;
    var support = [];
    list.forEach(function (value) {
        supportServices.forEach(function (v) {
            if(value == v.id){
                support.push(v);
                return;
            }
        })
    })
    return support;
}

/*获取商家类型*/
function getType(companyTpe) {
    var siteInfo = {
        isFillingStation: false,
        isGAS: false,
        isLogisticsProviders: false,
        isFillingStation: false,
        title: ''
    }
    switch (parseInt(companyTpe)) {
        case 1:
            siteInfo.isFillingStation = true;
            siteInfo.title = "加油站";
            siteInfo.btnName = '一键加油';
            break;
        case 2:
            siteInfo.isGAS = true;
            siteInfo.title = "加气站";
            siteInfo.btnName = '一键加气';
            break;
        case 3:
            siteInfo.isLogisticsProviders = true;
            siteInfo.title = "物流商";
            break;
        case 4:
            siteInfo.isbusinesses = true;
            siteInfo.title = "其他商家";
            break;
    }
    return siteInfo;
}
/*货物类型过滤*/
function filterGoodsTypes(type) {
    var typeName = '';
    switch (type){
        case 1:
            typeName = '汽油';
            break;
        case 2:
            typeName = '柴油';
            break;
        case 3:
            typeName = '天然气';
            break;
        case 4:
            typeName = '液化气';
            break;
        case 5:
            typeName = '信息发布';
            break;
    }
    return typeName;
}
/*信息货物类型*/
function filterInfoGoodsTypes(type) {
    var typeName = '';
    var goodsType  = config.goods_type;
    goodsType.forEach(function (v) {
        if(v.type == type){
            typeName = v.name;
        }
    })
    return typeName;
}
/*银行卡筛选*/
function filterBankName(type) {
    var typeName = '';
    var bank_type  = config.bank_type;
    console.log("type1:"+type);
    bank_type.forEach(function (v) {
        if(v.type == type){
            console.log("type:"+v.type);
            console.log("type1:"+type);
            typeName = v.name;
        }
    })
    return typeName;
}
/*油气类型过滤*/
function filterOilAndGasType(typeGrade) {
    var typeName = '';
    var vender_resource = config.vender_resource;
    var subclassAll = [];
    vender_resource.forEach(function (v) {
        subclassAll = subclassAll.concat(v.subclass);
    })
    subclassAll.forEach(function (v) {
        if (v.type == typeGrade) {
            typeName = v.name;
        }
    })
    return typeName;
}
/*站点资源审核状态结果返回*/
function filterAuditStatus(status) {
    var typeStr = '';
    switch (status){
        case 1:
            typeStr = "待审核";
            break;
        case 2:
            typeStr = "审核通过";
            break;
        case 3:
            typeStr = "审核不通过";
            break;
        case 4:
            typeStr = "申请价格变更";
            break;
    }
    return typeStr;
}
/*资源类型过滤*/
function filterResourceType(type) {
    var typeName = '';
    switch (type){
        case 1:
            typeName = '汽油';
            break;
        case 2:
            typeName = '柴油';
            break;
        case 3:
            typeName = '天然气';
            break;
        case 4:
            typeName = '液化气';
            break;
        case 5:
            typeName = '信息发布';
            break;
    }
    return typeName;
}
/*车辆类型过滤*/
function filterInfoCarTypes(type) {
    var typeName = '';
    var vehicle_type  = config.vehicle_type;
    vehicle_type.forEach(function (v) {
        if(v.type == type){
            typeName = v.name;
        }
    })
    return typeName;
}
/*商家类型过滤*/
function filterCompanyTypes(type) {
    var typeName = '';
    switch (type){
        case 1:
            typeName = '加油站';
            break;
        case 2:
            typeName = '加气站';
            break;
    }
    return typeName;
}
/*时间戳转化为日期*/
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    h = (date.getHours() < 10 ? "0"+date.getHours() : date.getHours()) + ':';
    m = (date.getMinutes() < 10 ? "0"+date.getMinutes() : date.getMinutes()) + ':';
    s = (date.getSeconds() < 10 ? "0"+date.getSeconds() : date.getSeconds());
    return Y+M+D+h+m+s;
}
//设置cookies
/*function setCookie(name,value){
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+";path=/";
}

//读取cookies
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

    if(arr=document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}

//删除cookies
function delCookie(name){
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString()+";path=/";
}*/

//Aman工作室修改//
function setCookie(name, value){
    var storage = window.localStorage;
    storage.setItem(name, value);
}

function getCookie(name){
    var storage = window.localStorage;
    return storage.getItem(name);
}

function delCookie(name){
    var storage = window.localStorage;
    storage.removeItem(name);
}

//判断是否为空
function isNUll(param) {
    if (param == "" || typeof(param) == "undefined") {
        return true;
    } else {
        return false;
    }
}
//获取select选中值
function selectedDOM(obj) {
    return $(obj).find("option").not(function(){ return !this.selected });
}
/*三级联动*/
function ProvinceCityDistrict(range) {
    function addIndex(data){
        for(var i=0;i<data.children.length;i++){
            data.children[i].index=i;
        }
        return data;
    }
    var addressData='';
    $.getJSON('../../static/js/lib/address.json',function (data) {
        addressData = {children: data};
        var datas = {children: data};
        addItem("#option",addIndex(datas),range+".province-box");
    })
    function resetSelect(obj) {
        selectedDOM(obj).text("请选择");
        selectedDOM(obj).val("");
    }
    $(document).on("change",range+".address",function () {
        var _this = $(this);
        var type = _this.attr("data-type");
        switch (type){
            case 'province':
                $(range+".city-box").html("");
                $(range+".county-box").html("");
                var val = selectedDOM(_this).attr("data-id");
                $(this).attr("current-index",val);
                addItem("#option",addIndex(addressData.children[val].children[0]),range+".county-box");
                addItem("#option",addIndex(addressData.children[val]),range+".city-box");
                resetSelect(_this.parents(".address-box").find(".county"));
                break;
            case 'city':
                $(range+".county-box").html("");
                var val = selectedDOM(range+".province-box").attr("data-id");
                var vals = selectedDOM(_this).attr("data-id");
                $(this).attr("current-index",vals);
                addItem("#option",addIndex(addressData.children[val].children[vals]),range+".county-box");
                break;
        }
    })
}
//消费类别
function consumType(type) {
    // 1:加油，2:加气,4:维修,5：信息发布,6:邮寄费
    var contentType = '';
    switch (type) {
        case 1:
            contentType = '加油';
            break;
        case 2:
            contentType = '加气';
            break;
        case 4:
            contentType = '维修';
            break;
        case 5:
            contentType = '信息发布';
            break;
        case 6:
            contentType = '邮寄费';
            break;
    }
    return contentType;
}
//检验参数是否为空
function checkParam(params) {
    var isTrue = true;
    for (var i in params) {
        if (isNUll(params[i])) {
            isTrue = false;
            switch (i) {
                case 'mobile':
                    $.alert('手机号不能为空');
                    break;
                case 'validateCode':
                    $.alert('手机验证码不能为空');
                    break;
                case 'idCard':
                    $.alert('身份证号不能为空');
                    break;
                case 'loginPwd':
                    $.alert('密码不能为空');
                    break;
                case 'payPwd':
                    $.alert('支付密码不能为空');
                    break;
                case 'rePwd':
                    $.alert('确认密码不能为空');
                    break;
                case 'userName':
                    $.alert('用户名不能为空');
                    break;
                case 'carNum':
                    $.alert('车牌号不能为空');
                    break;
                case 'carType':
                    $.alert('请选择汽车类型');
                    break;
                case 'receiveUserName':
                    $.alert('对方姓名不能为空');
                    break;
                case 'receiveUserMobile':
                    $.alert('对方手机号不能为空');
                    break;
                case 'amount':
                    $.alert('金额不能为空');
                    break;
            }
            return false;
        } else {
            switch (i) {
                case 'mobile':
                case 'receiveUserMobile':
                    var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
                    if (reg.test(params[i]) && params[i].length === 11) {
                        isTrue = true;
                    } else {
                        $.alert('手机号输入格式不正确');
                        isTrue = false;
                        return false;
                    }
                    break;
                case 'validateCode':
                    if (params[i].length === 6) {
                        isTrue = true;
                    } else {
                        $.alert('手机验证码输入格式不正确');
                        isTrue = false;
                        return false;
                    }
                    break;
                case 'idCard':
                    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;//判断身份证号是否合法
                    if (reg.test(params[i])) {
                        isTrue = true;
                    } else {
                        $.alert('身份证输入不合法');
                        isTrue = false;
                        return false;
                    }
                    break;
                case 'loginPwd':
                case 'rePwd':
                case 'payPwd':
                    if (params[i].length === 6) {
                        isTrue = true;
                    } else {
                        $.alert('请输入6位密码');
                        isTrue = false;
                        return false;
                    }
                    break;

            }
            isTrue = true;
        }
    }
    return isTrue;
}
//充值方式判断
function getRechargeMethod(type) {
    var rechargeMethod = '';
    switch (type) {
        case 1:
            rechargeMethod = '微信充值';
            break;
        case 2:
            rechargeMethod = '支付宝充值';
            break;
        case 3:
            rechargeMethod = '银行转账充值';
            break;
        case 4:
            rechargeMethod = '银行转账充值';
            break;
    }
    return rechargeMethod;
}
//获取发票状态
function getInvoiceApplyStatus(type) {
    var invoiceApplyStatus = '';
    switch (type) {
        case 1:
            invoiceApplyStatus = '待审核';
            break;
        case 2:
            invoiceApplyStatus = '开具发票完成';
            break;
        case 3:
            invoiceApplyStatus = '无效申请';
            break;
    }
    return invoiceApplyStatus;
}
//设置数据不存在时的展示内容
function setNoDataContent() {
    $(".content").html("<div class='noneData'>暂无内容</div>");
}
/*验证输入框是否为空*/
$("input").blur(function () {
    var _this = $(this);
    var $error_tip = _this.siblings(".error-tip");
    var $check_icon = _this.siblings(".check-icon");
    if(_this.attr("data-isCheck")=='yes'){
        if (_this.val() === "") {
            $error_tip.html("*不可为空");
            $check_icon.css("display", "none");
        } else {
            $error_tip.html("");
            $check_icon.css("display", "block");
        }
    }
});
/*页面跳转*/
function pageGo(url,params) {
    if(params){
        location.href=url+'.html'+params;
    }else{
        location.href=url+'.html';
    }
}
/*页面跳转*/
function pageReload() {
   window.location.reload();
}
/*返回*/
function pageBack() {
    window.history.back();
}
//判断审核状态
function setStatus(type) {
    var statusContent = '';
    switch (type) {
        case 0:
            statusContent = '待审核';
            break;
        case 1:
            statusContent = '审核通过';
            break;
        case 2:
            statusContent = '审核不通过';
            break;
    }
    return statusContent;
}
//判断充值状态
function setRechargeStatus(type) {
    var statusContent = '';
    switch (type) {
        case 0:
            statusContent = '申请中';
            break;
        case 1:
            statusContent = '充值完成';
            break;
        case 2:
            statusContent = '充值失败';
            break;
    }
    return statusContent;
}
status
//订单状态
function setOrderStatus(type) {
    var orderStatus = '';
    switch (parseInt(type)) {
        case 0:
            orderStatus = '银行处理中';
            break;
        case 1:
            orderStatus = '提现完成';
            break;
        case 2:
            orderStatus = '提现失败';
            break;
    }
    return orderStatus;
}
/*发送验证码*/
$(".getcode").on("click", function () {
    var _this = $(this);
    var type = $(this).attr("data-type");
    var $mobile = $("#mobile");
    var CheckResult = true;
    if (_this.attr("data-isCheck") == "yes") {
        if($mobile.attr("data-checkMobile")=="1"){
            CheckResult = true;
        }else{
            CheckResult = false;
        }
    }
    if(CheckResult){
        if (_this.attr("data-end") === "1") {
            //判断倒计时是否结束
            var data = {
                mobile: $mobile.val()
            };
            if (checkParam(data)) {
                var times = _this.attr("data-timeout");
                _this.attr("data-end", 2);
                _this.css("background", "#ccc");
                ajaxRequests('/common/sms/sendValidateCode/'+type+'/'+data.mobile,'get','',function (response) {
                    if (response.retCode === '0') {
                        Time(_this, times);
                    }else{
                        $.alert(response.retMsg || '验证码发送失败');
                    }
                })
            }
        }
    }
})
function bankType(type) {
    var bank_type = config.bank_type;
    var result;
    for (var i in bank_type) {
        var item = bank_type[i];
        for (var j in item) {
            if (item[j] == type) {
                result = item;
                break;
            }
        }
    }
    return result;
}
/*保留3位小数*/
function setNumFixed2(num) {
    return parseFloat(num).toFixed(3);
    // return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
}
/*保留2位小数*/
function setNumFixed_2(num) {
    return parseFloat(num).toFixed(2);
    // return Number(num.toString().match(/^\d+(?:\.\d{0,2})?/));
}
/*try catch*/
function tryCatch(success, error) {
    try {
        success();
    }
    catch (err) {
        error();
    }
}
/*判断终端*/
var browser={
    versions:function(){
        var u = navigator.userAgent, app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
            qq: u.match(/\sQQ/i) == " qq" //是否QQ
        };
    }(),
    language:(navigator.browserLanguage || navigator.language).toLowerCase()
}
/*信息状态判断*/
/*货物类型过滤*/
function messageStatus(type) {
    var typeName = '';
    switch (type){
        case 3:
            typeName = '已到期';
            break;
        case 4:
            typeName = '已删除';
            break;

    }
    return typeName;
}
/*调取app方法*/
function getAPPMethod(androidFun,iosFun,pcFun) {
    if (browser.versions.ios) {
        iosFun && iosFun();
    }else if(browser.versions.android){
        androidFun && androidFun();
    }else{
        pcFun && pcFun();
    }
}
/*设置空列表*/
function setListNone(obj) {
    obj.html("<div style='font-size: .6rem;color: #999;padding: 2rem 0;text-align: center'>暂无数据(⊙o⊙)</div>");
}
/*分页数据加载为空*/
function setListPageNone(obj) {
    obj.find(".list-block").append("<div style='font-size: .6rem;color: #999;text-align: center'>没有了(⊙o⊙)</div>");
}
/*司机自动登录*/
function automaticLogin(loginName,loginPwd) {
    ajaxRequests('/driver/login','post',{
        "body": {
            loginName: loginName,
            loginPwd: loginPwd
        }
    },function (response) {
        if (response.retCode === '0') {
            setCookie("id",response.data.id);
            setCookie("token",response.data.token);
            pageGo("index");
        }else{
            $.alert(response.retMsg||'登录失败');
        }
    })
}
/*商家自动登录*/
function venderAutomaticLogin(loginName,loginPwd) {
    ajaxRequests('/vender/login','post',{
        "body": {
            loginName: loginName,
            loginPwd: loginPwd
        }
    },function (response) {
        if (response.retCode === '0') {
            setCookie("companyType", response.data.companyType);
            setCookie("id", response.data.id);
            setCookie("token", response.data.token);
            setCookie("status", response.data.status);
            pageGo("index");
        } else {
            $.alert(response.retMsg || '登录失败');
        }
    })
}
/*省市区三级联动*/
function setAddressChoose(obj,text) {
    $(obj).cityPicker({
        toolbarTemplate: '<header class="bar bar-nav">\
    <button class="button button-link pull-right close-picker">确定</button>\
    <h1 class="title">'+text+'</h1>\
    </header>'
    });
}
/*获取城市id*/
function addressId(obj) {
    var cityJson,pid,sid,qid,pname,sname,qname;
    function jiequ(str,name) {
        var n=(str.split(name)).length-1;
        if(n>1){
            var _len = name.length;
            var newStr =str.substr(_len,str.length);
            return newStr;
        }else{
            str = str.split(name);
            str = str.join('');
            return str;
        }
    }
    $.getJSON('../../static/js/lib/address.json',function (data) {
        cityJson = data;
        var val = obj.val();
        for(var i in cityJson){
            if (val.indexOf(cityJson[i].name) != -1) {
                pid = cityJson[i].code;
                pname = cityJson[i].name;
                var second = cityJson[i].children;
                val = jiequ(val,pname);
                console.log(val);
                for (var j in second) {
                    if (val.indexOf(second[j].name) != -1) {
                        sid = second[j].code;
                        sname = second[j].name;
                        var three = second[j].children;
                        val = jiequ(val,sname);
                        for (var m in three) {
                            if (val.indexOf(three[m].name) != -1) {
                                qid = three[m].code;
                                qname =  three[m].name;
                            }
                        }
                    }
                }
            }
        }
        obj.attr("data-provinceId",pid);
        obj.attr("data-provinceName",pname);
        obj.attr("data-cityId",sid);
        obj.attr("data-cityName",sname);
        obj.attr("data-countyId",qid);
        obj.attr("data-countyName",qname);
    })
}
/**
 * 空闲控制 返回函数连续调用时，空闲时间必须大于或等于 idle，action 才会执行
 * @param idle   {number}    空闲时间，单位毫秒
 * @param action {function}  请求关联函数，实际应用需要调用的函数
 * @return {function}    返回客户调用函数
 */
var debounce = function(idle, action){
    var last
    return function(){
        var ctx = this, args = arguments
        clearTimeout(last)
        last = setTimeout(function(){
            action.apply(ctx, args)
        }, idle)
    }
};
/*高德转为gps*/
function GCJ2WGS(location) {
    var lon = location[0];
    var lat = location[1];
    var a = 6378245.0;
    var ee = 0.00669342162296594626;
    var PI = 3.14159265358979324;
    var x = lon - 105.0;
    var y = lat - 35.0;
    //经度
    var dLon = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    dLon += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    dLon += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
    dLon += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
    //纬度
    var dLat = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    dLat += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    dLat += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
    dLat += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
    var radLat = lat / 180.0 * PI;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic)
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
    var wgsLon = lon - dLon;
    var wgsLat = lat - dLat;
    return [wgsLon,wgsLat];
}
/*获取当前时分秒*/
function getCurrentTime() {
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth()+1;
    var date = myDate.getDate();
    var h = myDate.getHours();
    var min = myDate.getMinutes();
    function timeFormat(a) {
        var b = a;
        if (a <= 9) {
            b = "0" + a;
        }
        return b;
    }
    month = timeFormat(month);
    date = timeFormat(date);
    h = timeFormat(h);
    min = timeFormat(min);
    return [year,month,date,h,min];

}
/*银行卡校验*/
function checkBankNO(bankno) {
    var reg = /^\d{11,}$/;
    if(reg.test(bankno)){
        return true;
    }else{
        return false;
    }
}
/*获取转账比例*/
function getTransfer(type1, type2,data) {
    var rate;
    if (type1 == 1 && type2 == 2) {
        rate = data.oilGasArriveRatio;
    }
    if (type1 == 1 && type2 == 1) {
        rate = data.oilOilArriveRatio;
    }
    if (type1 == 2 && type2 == 1) {
        rate = data.gasOilArriveRatio;
    }
    if (type1 == 2 && type2 == 2) {
        rate = data.gasGasArriveRatio;
    }
    return rate;
}
/*充值状态审核*/
function rechargeStatus(status) {
    var status_txt;
    switch (status){
        case 0:
            status_txt = "充值审核中";
        case 1:
            status_txt = "充值已完成";
        case 2:
            status_txt = "充值失败";
    }
    return status_txt;
}
/*获取轮播图*/
function setBanner(type,callback) {
    ajaxRequests("/common/getSlideshow/"+type,'get','',function (response) {
        if (response.retCode === '0') {
            callback && callback(response);
        }
    })
};;$(function () {
    $.showPreloader();
    var $city_picker = $("#city_picker");
    var $address = $("#address");
    setAddressChoose("#city_picker",'请选择邮寄地址');
    var type = getQueryString("type");
    var amount = getCookie("amount");
    var billDetails = getCookie("billDetails");
    $("#amount").text(amount);
    $("#invoiceAmount").text(amount);
    var params;
    var postFee;
    ajaxRequests('/driverInfo/getPostFee','get','',function (response) {
        if (response.retCode === '0') {
            postFee = response.data;
            $("#postFee").html(postFee);
            $.hidePreloader();
            $(".content").removeClass("dis-n");
        }else{
            pageReload();
        }
    })
    $(document).on("click","#pay",function () {
        var billDetails = getCookie("billDetails");
        var receiptorAddress = $city_picker.val()+$address.val();
        var receiptorName = $("#receiptorName").val();
        var receiptorMobile = $("#receiptorMobile").val();
        var postcode = $("#postcode").val();
        var invoiceType = $("input[name='invoiceType']:checked").val();
        var payUseAmountType = $("#pay_type").val()
        params = {
            billDetails: billDetails.split(","),
            amount: getCookie("amount"),
            postFee: postFee,
            receiptorAddress:receiptorAddress,
            receiptorMobile:receiptorMobile,
            receiptorName:receiptorName,
            postcode:postcode,
            invoiceType:invoiceType,
            title:'个人',
            taxId:111,
            invoiceNo:111,
            payUseAmountType:payUseAmountType
        }
        if(receiptorName==""){
            $.alert("接收方姓名不可为空");
            return;
        }else if(receiptorMobile==""){
            $.alert("接收方手机号不可为空");
            return;
        }else if(receiptorAddress==""){
            $.alert("邮寄地址不可为空");
            return;
        }else if(postcode==""){
            $.alert("邮政编码不可为空");
            return;
        }else{
            ajaxRequests("/driverInfo/checkPayPwdExist","get",{},function (response) {
                if (response.retCode === '0') {
                    /*密码校验*/
                    $.prompt('请输入支付密码', function (value) {
                        ajaxRequests('/driverInfo/driverCheckPayPwd','post',{
                            "body":  {
                                'payPwd': value
                            }
                        },function (result) {
                            if (result.retCode === '0') {
                                submitPay();//提交支付
                            } else {
                                $.alert(result.retMsg || '操作失败');
                            }
                        })
                    });
                } else {
                    $.alert(response.retMsg||"去设置支付密码",'',function () {
                        pageGo("setPassWord");
                    });
                }
            })
        }
    })
    $(document).on("click",".close-picker",function () {
        var item = $(".address-choose");
        addressId(item);
    })
    function submitPay() {
        ajaxRequests('/driverBillDetail/driverInvoiceApply','post',{body:params},function (result) {
            if (result.retCode === '0') {
                $.alert(result.retMsg,'',function () {
                    delCookie("billDetails");
                    delCookie("amount");
                    pageBack();
                });
            } else {
                $.toast(result.retMsg || '申请失败', 2000, 'custom-toast');
            }
        })
    }
    $.init();
})
