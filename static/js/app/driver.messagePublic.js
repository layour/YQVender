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
;$.smVersion = "0.6.2";+function ($) {
    "use strict";

    //全局配置
    var defaults = {
        autoInit: false, //自动初始化页面
        showPageLoadingIndicator: true, //push.js加载页面的时候显示一个加载提示
        router: true, //默认使用router
        swipePanel: "left", //滑动打开侧栏
        swipePanelOnlyClose: true  //只允许滑动关闭，不允许滑动打开侧栏
    };

    $.smConfig = $.extend(defaults, $.config);

}(Zepto);

+ function($) {
    "use strict";

    //比较一个字符串版本号
    //a > b === 1
    //a = b === 0
    //a < b === -1
    $.compareVersion = function(a, b) {
        var as = a.split('.');
        var bs = b.split('.');
        if (a === b) return 0;

        for (var i = 0; i < as.length; i++) {
            var x = parseInt(as[i]);
            if (!bs[i]) return 1;
            var y = parseInt(bs[i]);
            if (x < y) return -1;
            if (x > y) return 1;
        }
        return -1;
    };

    $.getCurrentPage = function() {
        return $(".page-current")[0] || $(".page")[0] || document.body;
    };

}(Zepto);

/* global WebKitCSSMatrix:true */

(function($) {
    "use strict";
    ['width', 'height'].forEach(function(dimension) {
        var  Dimension = dimension.replace(/./, function(m) {
            return m[0].toUpperCase();
        });
        $.fn['outer' + Dimension] = function(margin) {
            var elem = this;
            if (elem) {
                var size = elem[dimension]();
                var sides = {
                    'width': ['left', 'right'],
                    'height': ['top', 'bottom']
                };
                sides[dimension].forEach(function(side) {
                    if (margin) size += parseInt(elem.css('margin-' + side), 10);
                });
                return size;
            } else {
                return null;
            }
        };
    });

    //support
    $.support = (function() {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
        return support;
    })();

    $.touchEvents = {
        start: $.support.touch ? 'touchstart' : 'mousedown',
        move: $.support.touch ? 'touchmove' : 'mousemove',
        end: $.support.touch ? 'touchend' : 'mouseup'
    };

    $.getTranslate = function (el, axis) {
        var matrix, curTransform, curStyle, transformMatrix;

        // automatic axis detection
        if (typeof axis === 'undefined') {
            axis = 'x';
        }

        curStyle = window.getComputedStyle(el, null);
        if (window.WebKitCSSMatrix) {
            // Some old versions of Webkit choke when 'none' is passed; pass
            // empty string instead in this case
            transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
        }
        else {
            transformMatrix = curStyle.MozTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
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

        return curTransform || 0;
    };
    /* jshint ignore:start */
    $.requestAnimationFrame = function (callback) {
        if (requestAnimationFrame) return requestAnimationFrame(callback);
        else if (webkitRequestAnimationFrame) return webkitRequestAnimationFrame(callback);
        else if (mozRequestAnimationFrame) return mozRequestAnimationFrame(callback);
        else {
            return setTimeout(callback, 1000 / 60);
        }
    };
    $.cancelAnimationFrame = function (id) {
        if (cancelAnimationFrame) return cancelAnimationFrame(id);
        else if (webkitCancelAnimationFrame) return webkitCancelAnimationFrame(id);
        else if (mozCancelAnimationFrame) return mozCancelAnimationFrame(id);
        else {
            return clearTimeout(id);
        }
    };
    /* jshint ignore:end */

    $.fn.dataset = function() {
        var dataset = {},
            ds = this[0].dataset;
        for (var key in ds) { // jshint ignore:line
            var item = (dataset[key] = ds[key]);
            if (item === 'false') dataset[key] = false;
            else if (item === 'true') dataset[key] = true;
            else if (parseFloat(item) === item * 1) dataset[key] = item * 1;
        }
        // mixin dataset and __eleData
        return $.extend({}, dataset, this[0].__eleData);
    };
    $.fn.data = function(key, value) {
        var tmpData = $(this).dataset();
        if (!key) {
            return tmpData;
        }
        // value may be 0, false, null
        if (typeof value === 'undefined') {
            // Get value
            var dataVal = tmpData[key],
                __eD = this[0].__eleData;

            //if (dataVal !== undefined) {
            if (__eD && (key in __eD)) {
                return __eD[key];
            } else {
                return dataVal;
            }

        } else {
            // Set value,uniformly set in extra ```__eleData```
            for (var i = 0; i < this.length; i++) {
                var el = this[i];
                // delete multiple data in dataset
                if (key in tmpData) delete el.dataset[key];

                if (!el.__eleData) el.__eleData = {};
                el.__eleData[key] = value;
            }
            return this;
        }
    };
    function __dealCssEvent(eventNameArr, callback) {
        var events = eventNameArr,
            i, dom = this;// jshint ignore:line

        function fireCallBack(e) {
            /*jshint validthis:true */
            if (e.target !== this) return;
            callback.call(this, e);
            for (i = 0; i < events.length; i++) {
                dom.off(events[i], fireCallBack);
            }
        }
        if (callback) {
            for (i = 0; i < events.length; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
    }
    $.fn.animationEnd = function(callback) {
        __dealCssEvent.call(this, ['webkitAnimationEnd', 'animationend'], callback);
        return this;
    };
    $.fn.transitionEnd = function(callback) {
        __dealCssEvent.call(this, ['webkitTransitionEnd', 'transitionend'], callback);
        return this;
    };
    $.fn.transition = function(duration) {
        if (typeof duration !== 'string') {
            duration = duration + 'ms';
        }
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransitionDuration = elStyle.MozTransitionDuration = elStyle.transitionDuration = duration;
        }
        return this;
    };
    $.fn.transform = function(transform) {
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransform = elStyle.MozTransform = elStyle.transform = transform;
        }
        return this;
    };
    $.fn.prevAll = function (selector) {
        var prevEls = [];
        var el = this[0];
        if (!el) return $([]);
        while (el.previousElementSibling) {
            var prev = el.previousElementSibling;
            if (selector) {
                if($(prev).is(selector)) prevEls.push(prev);
            }
            else prevEls.push(prev);
            el = prev;
        }
        return $(prevEls);
    };
    $.fn.nextAll = function (selector) {
        var nextEls = [];
        var el = this[0];
        if (!el) return $([]);
        while (el.nextElementSibling) {
            var next = el.nextElementSibling;
            if (selector) {
                if($(next).is(selector)) nextEls.push(next);
            }
            else nextEls.push(next);
            el = next;
        }
        return $(nextEls);
    };

    //重置zepto的show方法，防止有些人引用的版本中 show 方法操作 opacity 属性影响动画执行
    $.fn.show = function(){
        var elementDisplay = {};
        function defaultDisplay(nodeName) {
            var element, display;
            if (!elementDisplay[nodeName]) {
                element = document.createElement(nodeName);
                document.body.appendChild(element);
                display = getComputedStyle(element, '').getPropertyValue("display");
                element.parentNode.removeChild(element);
                display === "none" && (display = "block");
                elementDisplay[nodeName] = display;
            }
            return elementDisplay[nodeName];
        }

        return this.each(function(){
            this.style.display === "none" && (this.style.display = '');
            if (getComputedStyle(this, '').getPropertyValue("display") === "none");
            this.style.display = defaultDisplay(this.nodeName);
        });
    };
})(Zepto);

/*===========================
Device/OS Detection
===========================*/
;(function ($) {
    "use strict";
    var device = {};
    var ua = navigator.userAgent;

    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

    device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;

    // Android
    if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
    }
    if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
    }
    if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
            device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
    }

    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

    // Minimal UI
    if (device.os && device.os === 'ios') {
        var osVersionArr = device.osVersion.split('.');
        device.minimalUi = !device.webView &&
            (ipod || iphone) &&
            (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
            $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
    }

    // Check for status bar and fullscreen app mode
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    device.statusBar = false;
    if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
        device.statusBar = true;
    }
    else {
        device.statusBar = false;
    }

    // Classes
    var classNames = [];

    // Pixel Ratio
    device.pixelRatio = window.devicePixelRatio || 1;
    classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
    if (device.pixelRatio >= 2) {
        classNames.push('retina');
    }

    // OS classes
    if (device.os) {
        classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
        if (device.os === 'ios') {
            var major = parseInt(device.osVersion.split('.')[0], 10);
            for (var i = major - 1; i >= 6; i--) {
                classNames.push('ios-gt-' + i);
            }
        }

    }
    // Status bar classes
    if (device.statusBar) {
        classNames.push('with-statusbar-overlay');
    }
    else {
        $('html').removeClass('with-statusbar-overlay');
    }

    // Add html classes
    if (classNames.length > 0) $('html').addClass(classNames.join(' '));

    // keng..
    device.isWeixin = /MicroMessenger/i.test(ua);

    $.device = device;
})(Zepto);

;(function () {
    'use strict';

    /**
     * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
     *
     * @codingstandard ftlabs-jsv2
     * @copyright The Financial Times Limited [All Rights Reserved]
     * @license MIT License (see LICENSE.txt)
     */

    /*jslint browser:true, node:true, elision:true*/
    /*global Event, Node*/


    /**
     * Instantiate fast-clicking listeners on the specified layer.
     *
     * @constructor
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    function FastClick(layer, options) {
        var oldOnClick;

        options = options || {};

        /**
         * Whether a click is currently being tracked.
         *
         * @type boolean
         */
        this.trackingClick = false;


        /**
         * Timestamp for when click tracking started.
         *
         * @type number
         */
        this.trackingClickStart = 0;


        /**
         * The element being tracked for a click.
         *
         * @type EventTarget
         */
        this.targetElement = null;


        /**
         * X-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartX = 0;


        /**
         * Y-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartY = 0;


        /**
         * ID of the last touch, retrieved from Touch.identifier.
         *
         * @type number
         */
        this.lastTouchIdentifier = 0;


        /**
         * Touchmove boundary, beyond which a click will be cancelled.
         *
         * @type number
         */
        this.touchBoundary = options.touchBoundary || 10;


        /**
         * The FastClick layer.
         *
         * @type Element
         */
        this.layer = layer;

        /**
         * The minimum time between tap(touchstart and touchend) events
         *
         * @type number
         */
        this.tapDelay = options.tapDelay || 200;

        /**
         * The maximum time for a tap
         *
         * @type number
         */
        this.tapTimeout = options.tapTimeout || 700;

        if (FastClick.notNeeded(layer)) {
            return;
        }

        // Some old versions of Android don't have Function.prototype.bind
        function bind(method, context) {
            return function() { return method.apply(context, arguments); };
        }


        var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }

        // Set up event handlers as required
        if (deviceIsAndroid) {
            layer.addEventListener('mouseover', this.onMouse, true);
            layer.addEventListener('mousedown', this.onMouse, true);
            layer.addEventListener('mouseup', this.onMouse, true);
        }

        layer.addEventListener('click', this.onClick, true);
        layer.addEventListener('touchstart', this.onTouchStart, false);
        layer.addEventListener('touchmove', this.onTouchMove, false);
        layer.addEventListener('touchend', this.onTouchEnd, false);
        layer.addEventListener('touchcancel', this.onTouchCancel, false);

        // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
        // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
        // layer when they are cancelled.
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === 'click') {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };

            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === 'click') {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }

        // If a handler is already declared in the element's onclick attribute, it will be fired before
        // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
        // adding it as listener.
        if (typeof layer.onclick === 'function') {

            // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
            // - the old one won't work if passed to addEventListener directly.
            oldOnClick = layer.onclick;
            layer.addEventListener('click', function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }

    /**
     * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
     *
     * @type boolean
     */
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

    /**
     * Android requires exceptions.
     *
     * @type boolean
     */
    var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


    /**
     * iOS requires exceptions.
     *
     * @type boolean
     */
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


    /**
     * iOS 4 requires an exception for select elements.
     *
     * @type boolean
     */
    var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


    /**
     * iOS 6.0-7.* requires the target element to be manually derived
     *
     * @type boolean
     */
    var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

    /**
     * BlackBerry requires exceptions.
     *
     * @type boolean
     */
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

    /**
     * 判断是否组合型label
     * @type {Boolean}
     */
    var isCompositeLabel = false;

    /**
     * Determine whether a given element requires a native click.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element needs a native click
     */
    FastClick.prototype.needsClick = function(target) {

        // 修复bug: 如果父元素中有 label
        // 如果label上有needsclick这个类，则用原生的点击，否则，用模拟点击
        var parent = target;
        while(parent && (parent.tagName.toUpperCase() !== "BODY")) {
            if (parent.tagName.toUpperCase() === "LABEL") {
                isCompositeLabel = true;
                if ((/\bneedsclick\b/).test(parent.className)) return true;
            }
            parent = parent.parentNode;
        }

        switch (target.nodeName.toLowerCase()) {

            // Don't send a synthetic click to disabled inputs (issue #62)
            case 'button':
            case 'select':
            case 'textarea':
                if (target.disabled) {
                    return true;
                }

                break;
            case 'input':

                // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
                if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                    return true;
                }

                break;
            case 'label':
            case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
            case 'video':
                return true;
        }

        return (/\bneedsclick\b/).test(target.className);
    };


    /**
     * Determine whether a given element requires a call to focus to simulate click into element.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
     */
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
            case 'textarea':
                return true;
            case 'select':
                return !deviceIsAndroid;
            case 'input':
                switch (target.type) {
                    case 'button':
                    case 'checkbox':
                    case 'file':
                    case 'image':
                    case 'radio':
                    case 'submit':
                        return false;
                }

                // No point in attempting to focus disabled inputs
                return !target.disabled && !target.readOnly;
            default:
                return (/\bneedsfocus\b/).test(target.className);
        }
    };


    /**
     * Send a click event to the specified element.
     *
     * @param {EventTarget|Element} targetElement
     * @param {Event} event
     */
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;

        // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }

        touch = event.changedTouches[0];

        // Synthesise a click event, with an extra attribute so it can be tracked
        clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };

    FastClick.prototype.determineEventType = function(targetElement) {

        //Issue #159: Android Chrome Select Box does not open with a synthetic click event
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
            return 'mousedown';
        }

        return 'click';
    };


    /**
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.focus = function(targetElement) {
        var length;

        // Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
        var unsupportedType = ['date', 'time', 'month', 'number', 'email'];
        if (deviceIsIOS && targetElement.setSelectionRange && unsupportedType.indexOf(targetElement.type) === -1) {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };


    /**
     * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
     *
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;

        scrollParent = targetElement.fastClickScrollParent;

        // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
        // target element was moved to another parent.
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }

                parentElement = parentElement.parentElement;
            } while (parentElement);
        }

        // Always update the scroll top tracker if possible.
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };


    /**
     * @param {EventTarget} targetElement
     * @returns {Element|EventTarget}
     */
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

        // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }

        return eventTarget;
    };


    /**
     * On touch start, record the position and scroll offset.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;

        // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
        if (event.targetTouches.length > 1) {
            return true;
        }

        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];

        if (deviceIsIOS) {

            // Only trusted events will deselect text on iOS (issue #49)
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }

            if (!deviceIsIOS4) {

                // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
                // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
                // with the same identifier as the touch event that previously triggered the click that triggered the alert.
                // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
                // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
                // Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
                // which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
                // random integers, it's safe to to continue if the identifier is 0 here.
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }

                this.lastTouchIdentifier = touch.identifier;

                // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
                // 1) the user does a fling scroll on the scrollable layer
                // 2) the user stops the fling scroll with another tap
                // then the event.target of the last 'touchend' event will be the element that was under the user's finger
                // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
                // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
                this.updateScrollParent(targetElement);
            }
        }

        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;

        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            event.preventDefault();
        }

        return true;
    };


    /**
     * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;

        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }

        return false;
    };


    /**
     * Update the last position.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }

        // If the touch has moved, cancel the click tracking
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }

        return true;
    };


    /**
     * Attempt to find the labelled control for the given label element.
     *
     * @param {EventTarget|HTMLLabelElement} labelElement
     * @returns {Element|null}
     */
    FastClick.prototype.findControl = function(labelElement) {

        // Fast path for newer browsers supporting the HTML5 control attribute
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }

        // All browsers under test that support touch events also support the HTML5 htmlFor attribute
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }

        // If no for attribute exists, attempt to retrieve the first labellable descendant element
        // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    };


    /**
     * On touch end, determine whether to send a click event at once.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

        if (!this.trackingClick) {
            return true;
        }

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }

        if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
            return true;
        }
        //修复安卓微信下，input type="date" 的bug，经测试date,time,month已没问题
        var unsupportedType = ['date', 'time', 'month'];
        if(unsupportedType.indexOf(event.target.type) !== -1){
            　　　　return false;
            　　}
        // Reset to prevent wrong click cancel on input (issue #156).
        this.cancelNextClick = false;

        this.lastClickTime = event.timeStamp;

        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;

        // On some iOS devices, the targetElement supplied with the event is invalid if the layer
        // is performing a transition or scroll, and has to be re-detected manually. Note that
        // for this to function correctly, it must be called *after* the event target is checked!
        // See issue #57; also filed as rdar://13048589 .
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];

            // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }

        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === 'label') {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }

                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {

            // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
            // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
            if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
                this.targetElement = null;
                return false;
            }

            this.focus(targetElement);
            this.sendClick(targetElement, event);

            // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
            // Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
            if (!deviceIsIOS || targetTagName !== 'select') {
                this.targetElement = null;
                event.preventDefault();
            }

            return false;
        }

        if (deviceIsIOS && !deviceIsIOS4) {

            // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
            // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }

        // Prevent the actual click from going though - unless the target node is marked as requiring
        // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }

        return false;
    };


    /**
     * On touch cancel, stop tracking the click.
     *
     * @returns {void}
     */
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };


    /**
     * Determine mouse events which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onMouse = function(event) {

        // If a target element was never set (because a touch event was never fired) allow the event
        if (!this.targetElement) {
            return true;
        }

        if (event.forwardedTouchEvent) {
            return true;
        }

        // Programmatically generated events targeting a specific element should be permitted
        if (!event.cancelable) {
            return true;
        }

        // Derive and check the target element to see whether the mouse event needs to be permitted;
        // unless explicitly enabled, prevent non-touch click events from triggering actions,
        // to prevent ghost/doubleclicks.
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

            // Prevent any user-added listeners declared on FastClick element from being fired.
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {

                // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
                event.propagationStopped = true;
            }

            // Cancel the event
            event.stopPropagation();
            // 允许组合型label冒泡
            if (!isCompositeLabel) {
                event.preventDefault();
            }
            // 允许组合型label冒泡
            return false;
        }

        // If the mouse event is permitted, return true for the action to go through.
        return true;
    };


    /**
     * On actual clicks, determine whether this is a touch-generated click, a click action occurring
     * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
     * an actual click which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onClick = function(event) {
        var permitted;

        // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }

        // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
        if (event.target.type === 'submit' && event.detail === 0) {
            return true;
        }

        permitted = this.onMouse(event);

        // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
        if (!permitted) {
            this.targetElement = null;
        }

        // If clicks are permitted, return true for the action to go through.
        return permitted;
    };


    /**
     * Remove all FastClick's event listeners.
     *
     * @returns {void}
     */
    FastClick.prototype.destroy = function() {
        var layer = this.layer;

        if (deviceIsAndroid) {
            layer.removeEventListener('mouseover', this.onMouse, true);
            layer.removeEventListener('mousedown', this.onMouse, true);
            layer.removeEventListener('mouseup', this.onMouse, true);
        }

        layer.removeEventListener('click', this.onClick, true);
        layer.removeEventListener('touchstart', this.onTouchStart, false);
        layer.removeEventListener('touchmove', this.onTouchMove, false);
        layer.removeEventListener('touchend', this.onTouchEnd, false);
        layer.removeEventListener('touchcancel', this.onTouchCancel, false);
    };


    /**
     * Check whether FastClick is needed.
     *
     * @param {Element} layer The layer to listen on
     */
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;

        // Devices that don't support touch don't need FastClick
        if (typeof window.ontouchstart === 'undefined') {
            return true;
        }

        // Chrome version - zero for other browsers
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (chromeVersion) {

            if (deviceIsAndroid) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // Chrome 32 and above with width=device-width or less don't need FastClick
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }

                // Chrome desktop doesn't need FastClick (issue #15)
            } else {
                return true;
            }
        }

        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

            // BlackBerry 10.3+ does not require Fastclick library.
            // https://github.com/ftlabs/fastclick/issues/251
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // user-scalable=no eliminates click delay.
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // width=device-width (or less than device-width) eliminates click delay.
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }

        // IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
        if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        // Firefox version - zero for other browsers
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (firefoxVersion >= 27) {
            // Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

            metaViewport = document.querySelector('meta[name=viewport]');
            if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }

        // IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
        // http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
        if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        return false;
    };


    /**
     * Factory method for creating a FastClick object
     *
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };

    window.FastClick = FastClick;
}());

/*======================================================
************   Modals   ************
======================================================*/
/*jshint unused: false*/
+function ($) {
    "use strict";
    var _modalTemplateTempDiv = document.createElement('div');

    $.modalStack = [];

    $.modalStackClearQueue = function () {
        if ($.modalStack.length) {
            ($.modalStack.shift())();
        }
    };
    $.modal = function (params) {
        params = params || {};
        var modalHTML = '';
        var buttonsHTML = '';
        if (params.buttons && params.buttons.length > 0) {
            for (var i = 0; i < params.buttons.length; i++) {
                buttonsHTML += '<span class="modal-button' + (params.buttons[i].bold ? ' modal-button-bold' : '') + '">' + params.buttons[i].text + '</span>';
            }
        }
        var extraClass = params.extraClass || '';
        var titleHTML = params.title ? '<div class="modal-title">' + params.title + '</div>' : '';
        var textHTML = params.text ? '<div class="modal-text">' + params.text + '</div>' : '';
        var afterTextHTML = params.afterText ? params.afterText : '';
        var noButtons = !params.buttons || params.buttons.length === 0 ? 'modal-no-buttons' : '';
        var verticalButtons = params.verticalButtons ? 'modal-buttons-vertical' : '';
        modalHTML = '<div class="modal ' + extraClass + ' ' + noButtons + '"><div class="modal-inner">' + (titleHTML + textHTML + afterTextHTML) + '</div><div class="modal-buttons ' + verticalButtons + '">' + buttonsHTML + '</div></div>';

        _modalTemplateTempDiv.innerHTML = modalHTML;

        var modal = $(_modalTemplateTempDiv).children();

        $(defaults.modalContainer).append(modal[0]);

        // Add events on buttons
        modal.find('.modal-button').each(function (index, el) {
            $(el).on('click', function (e) {
                if (params.buttons[index].close !== false) $.closeModal(modal);
                if (params.buttons[index].onClick) params.buttons[index].onClick(modal, e);
                if (params.onClick) params.onClick(modal, index);
            });
        });
        $.openModal(modal);
        return modal[0];
    };
    $.alert = function (text, title, callbackOk) {
        if (typeof title === 'function') {
            callbackOk = arguments[1];
            title = undefined;
        }
        return $.modal({
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            buttons: [ {text: defaults.modalButtonOk, bold: true, onClick: callbackOk} ]
        });
    };
    $.confirm = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }
        return $.modal({
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            buttons: [
                {text: defaults.modalButtonCancel, onClick: callbackCancel},
                {text: defaults.modalButtonOk, bold: true, onClick: callbackOk}
            ]
        });
    };
    $.prompt = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }
        return $.modal({
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            afterText: '<input type="password" class="modal-text-input">',
            buttons: [
                {
                    text: defaults.modalButtonCancel
                },
                {
                    text: defaults.modalButtonOk,
                    bold: true
                }
            ],
            onClick: function (modal, index) {
                if (index === 0 && callbackCancel) callbackCancel($(modal).find('.modal-text-input').val());
                if (index === 1 && callbackOk) callbackOk($(modal).find('.modal-text-input').val());
            }
        });
    };
    $.modalLogin = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }
        return $.modal({
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            afterText: '<input type="text" name="modal-username" placeholder="' + defaults.modalUsernamePlaceholder + '" class="modal-text-input modal-text-input-double"><input type="password" name="modal-password" placeholder="' + defaults.modalPasswordPlaceholder + '" class="modal-text-input modal-text-input-double">',
            buttons: [
                {
                    text: defaults.modalButtonCancel
                },
                {
                    text: defaults.modalButtonOk,
                    bold: true
                }
            ],
            onClick: function (modal, index) {
                var username = $(modal).find('.modal-text-input[name="modal-username"]').val();
                var password = $(modal).find('.modal-text-input[name="modal-password"]').val();
                if (index === 0 && callbackCancel) callbackCancel(username, password);
                if (index === 1 && callbackOk) callbackOk(username, password);
            }
        });
    };
    $.modalPassword = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
            callbackCancel = arguments[2];
            callbackOk = arguments[1];
            title = undefined;
        }
        return $.modal({
            text: text || '',
            title: typeof title === 'undefined' ? defaults.modalTitle : title,
            afterText: '<input type="password" name="modal-password" placeholder="' + defaults.modalPasswordPlaceholder + '" class="modal-text-input">',
            buttons: [
                {
                    text: defaults.modalButtonCancel
                },
                {
                    text: defaults.modalButtonOk,
                    bold: true
                }
            ],
            onClick: function (modal, index) {
                var password = $(modal).find('.modal-text-input[name="modal-password"]').val();
                if (index === 0 && callbackCancel) callbackCancel(password);
                if (index === 1 && callbackOk) callbackOk(password);
            }
        });
    };
    $.showPreloader = function (title) {
        $.hidePreloader();
        $.showPreloader.preloaderModal = $.modal({
            title: title || defaults.modalPreloaderTitle,
            text: '<div class="preloader"></div>'
        });

        return $.showPreloader.preloaderModal;
    };
    $.hidePreloader = function () {
        $.showPreloader.preloaderModal && $.closeModal($.showPreloader.preloaderModal);
    };
    $.showIndicator = function () {
        if ($('.preloader-indicator-modal')[0]) return;
        $(defaults.modalContainer).append('<div class="preloader-indicator-overlay"></div><div class="preloader-indicator-modal"><span class="preloader preloader-white"></span></div>');
    };
    $.hideIndicator = function () {
        $('.preloader-indicator-overlay, .preloader-indicator-modal').remove();
    };
    // Action Sheet
    $.actions = function (params) {
        var modal, groupSelector, buttonSelector;
        params = params || [];

        if (params.length > 0 && !$.isArray(params[0])) {
            params = [params];
        }
        var modalHTML;
        var buttonsHTML = '';
        for (var i = 0; i < params.length; i++) {
            for (var j = 0; j < params[i].length; j++) {
                if (j === 0) buttonsHTML += '<div class="actions-modal-group">';
                var button = params[i][j];
                var buttonClass = button.label ? 'actions-modal-label' : 'actions-modal-button';
                if (button.bold) buttonClass += ' actions-modal-button-bold';
                if (button.color) buttonClass += ' color-' + button.color;
                if (button.bg) buttonClass += ' bg-' + button.bg;
                if (button.disabled) buttonClass += ' disabled';
                buttonsHTML += '<span class="' + buttonClass + '">' + button.text + '</span>';
                if (j === params[i].length - 1) buttonsHTML += '</div>';
            }
        }
        modalHTML = '<div class="actions-modal">' + buttonsHTML + '</div>';
        _modalTemplateTempDiv.innerHTML = modalHTML;
        modal = $(_modalTemplateTempDiv).children();
        $(defaults.modalContainer).append(modal[0]);
        groupSelector = '.actions-modal-group';
        buttonSelector = '.actions-modal-button';

        var groups = modal.find(groupSelector);
        groups.each(function (index, el) {
            var groupIndex = index;
            $(el).children().each(function (index, el) {
                var buttonIndex = index;
                var buttonParams = params[groupIndex][buttonIndex];
                var clickTarget;
                if ($(el).is(buttonSelector)) clickTarget = $(el);
                // if (toPopover && $(el).find(buttonSelector).length > 0) clickTarget = $(el).find(buttonSelector);

                if (clickTarget) {
                    clickTarget.on('click', function (e) {
                        if (buttonParams.close !== false) $.closeModal(modal);
                        if (buttonParams.onClick) buttonParams.onClick(modal, e);
                    });
                }
            });
        });
        $.openModal(modal);
        return modal[0];
    };
    $.popup = function (modal, removeOnClose) {
        if (typeof removeOnClose === 'undefined') removeOnClose = true;
        if (typeof modal === 'string' && modal.indexOf('<') >= 0) {
            var _modal = document.createElement('div');
            _modal.innerHTML = modal.trim();
            if (_modal.childNodes.length > 0) {
                modal = _modal.childNodes[0];
                if (removeOnClose) modal.classList.add('remove-on-close');
                $(defaults.modalContainer).append(modal);
            }
            else return false; //nothing found
        }
        modal = $(modal);
        if (modal.length === 0) return false;
        modal.show();
        modal.find(".content").scroller("refresh");
        if (modal.find('.' + defaults.viewClass).length > 0) {
            $.sizeNavbars(modal.find('.' + defaults.viewClass)[0]);
        }
        $.openModal(modal);

        return modal[0];
    };
    $.pickerModal = function (pickerModal, removeOnClose) {
        if (typeof removeOnClose === 'undefined') removeOnClose = true;
        if (typeof pickerModal === 'string' && pickerModal.indexOf('<') >= 0) {
            pickerModal = $(pickerModal);
            if (pickerModal.length > 0) {
                if (removeOnClose) pickerModal.addClass('remove-on-close');
                $(defaults.modalContainer).append(pickerModal[0]);
            }
            else return false; //nothing found
        }
        pickerModal = $(pickerModal);
        if (pickerModal.length === 0) return false;
        pickerModal.show();
        $.openModal(pickerModal);
        return pickerModal[0];
    };
    $.loginScreen = function (modal) {
        if (!modal) modal = '.login-screen';
        modal = $(modal);
        if (modal.length === 0) return false;
        modal.show();
        if (modal.find('.' + defaults.viewClass).length > 0) {
            $.sizeNavbars(modal.find('.' + defaults.viewClass)[0]);
        }
        $.openModal(modal);
        return modal[0];
    };
    //显示一个消息，会在2秒钟后自动消失
    $.toast = function(msg, duration, extraclass) {
        var $toast = $('<div class="modal toast ' + (extraclass || '') + '">' + msg + '</div>').appendTo(document.body);
        $.openModal($toast, function(){
            setTimeout(function() {
                $.closeModal($toast);
            }, duration || 2000);
        });
    };
    $.openModal = function (modal, cb) {
        modal = $(modal);
        var isModal = modal.hasClass('modal'),
            isNotToast = !modal.hasClass('toast');
        if ($('.modal.modal-in:not(.modal-out)').length && defaults.modalStack && isModal && isNotToast) {
            $.modalStack.push(function () {
                $.openModal(modal, cb);
            });
            return;
        }
        var isPopup = modal.hasClass('popup');
        var isLoginScreen = modal.hasClass('login-screen');
        var isPickerModal = modal.hasClass('picker-modal');
        var isToast = modal.hasClass('toast');
        if (isModal) {
            modal.show();
            modal.css({
                marginTop: - Math.round(modal.outerHeight() / 2) + 'px'
            });
        }
        if (isToast) {
            modal.css({
                marginLeft: - Math.round(modal.outerWidth() / 2 / 1.185) + 'px' //1.185 是初始化时候的放大效果
            });
        }

        var overlay;
        if (!isLoginScreen && !isPickerModal && !isToast) {
            if ($('.modal-overlay').length === 0 && !isPopup) {
                $(defaults.modalContainer).append('<div class="modal-overlay"></div>');
            }
            if ($('.popup-overlay').length === 0 && isPopup) {
                $(defaults.modalContainer).append('<div class="popup-overlay"></div>');
            }
            overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
        }

        //Make sure that styles are applied, trigger relayout;
        var clientLeft = modal[0].clientLeft;

        // Trugger open event
        modal.trigger('open');

        // Picker modal body class
        if (isPickerModal) {
            $(defaults.modalContainer).addClass('with-picker-modal');
        }

        // Classes for transition in
        if (!isLoginScreen && !isPickerModal && !isToast) overlay.addClass('modal-overlay-visible');
        modal.removeClass('modal-out').addClass('modal-in').transitionEnd(function (e) {
            if (modal.hasClass('modal-out')) modal.trigger('closed');
            else modal.trigger('opened');
        });
        // excute callback
        if (typeof cb === 'function') {
          cb.call(this);
        }
        return true;
    };
    $.closeModal = function (modal) {
        modal = $(modal || '.modal-in');
        if (typeof modal !== 'undefined' && modal.length === 0) {
            return;
        }
        var isModal = modal.hasClass('modal'),
            isPopup = modal.hasClass('popup'),
            isToast = modal.hasClass('toast'),
            isLoginScreen = modal.hasClass('login-screen'),
            isPickerModal = modal.hasClass('picker-modal'),
            removeOnClose = modal.hasClass('remove-on-close'),
            overlay = isPopup ? $('.popup-overlay') : $('.modal-overlay');
        if (isPopup){
            if (modal.length === $('.popup.modal-in').length) {
                overlay.removeClass('modal-overlay-visible');
            }
        }
        else if (!(isPickerModal || isToast)) {
            overlay.removeClass('modal-overlay-visible');
        }

        modal.trigger('close');

        // Picker modal body class
        if (isPickerModal) {
            $(defaults.modalContainer).removeClass('with-picker-modal');
            $(defaults.modalContainer).addClass('picker-modal-closing');
        }

        modal.removeClass('modal-in').addClass('modal-out').transitionEnd(function (e) {
            if (modal.hasClass('modal-out')) modal.trigger('closed');
            else modal.trigger('opened');

            if (isPickerModal) {
                $(defaults.modalContainer).removeClass('picker-modal-closing');
            }
            if (isPopup || isLoginScreen || isPickerModal) {
                modal.removeClass('modal-out').hide();
                if (removeOnClose && modal.length > 0) {
                    modal.remove();
                }
            }
            else {
                modal.remove();
            }
        });
        if (isModal &&  defaults.modalStack ) {
            $.modalStackClearQueue();
        }

        return true;
    };
    function handleClicks(e) {
        /*jshint validthis:true */
        var clicked = $(this);
        var url = clicked.attr('href');


        //Collect Clicked data- attributes
        var clickedData = clicked.dataset();

        // Popup
        var popup;
        if (clicked.hasClass('open-popup')) {
            if (clickedData.popup) {
                popup = clickedData.popup;
            }
            else popup = '.popup';
            $.popup(popup);
        }
        if (clicked.hasClass('close-popup')) {
            if (clickedData.popup) {
                popup = clickedData.popup;
            }
            else popup = '.popup.modal-in';
            $.closeModal(popup);
        }

        // Close Modal
        if (clicked.hasClass('modal-overlay')) {
            if ($('.modal.modal-in').length > 0 && defaults.modalCloseByOutside)
                $.closeModal('.modal.modal-in');
            if ($('.actions-modal.modal-in').length > 0 && defaults.actionsCloseByOutside)
                $.closeModal('.actions-modal.modal-in');

        }
        if (clicked.hasClass('popup-overlay')) {
            if ($('.popup.modal-in').length > 0 && defaults.popupCloseByOutside)
                $.closeModal('.popup.modal-in');
        }




    }
    $(document).on('click', ' .modal-overlay, .popup-overlay, .close-popup, .open-popup, .close-picker', handleClicks);
    var defaults =  $.modal.prototype.defaults  = {
        modalStack: true,
        modalButtonOk: '确定',
        modalButtonCancel: '取消',
        modalPreloaderTitle: '加载中',
        modalContainer : document.body
    };
}(Zepto);

/*======================================================
************   Calendar   ************
======================================================*/
/*jshint unused: false*/
+function ($) {
    "use strict";
    var rtl = false;
    var Calendar = function (params) {
        var p = this;
        var defaults = {
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月' , '九月' , '十月', '十一月', '十二月'],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月' , '九月' , '十月', '十一月', '十二月'],
            dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            firstDay: 1, // First day of the week, Monday
            weekendDays: [0, 6], // Sunday and Saturday
            multiple: false,
            dateFormat: 'yyyy-mm-dd',
            direction: 'horizontal', // or 'vertical'
            minDate: null,
            maxDate: null,
            touchMove: true,
            animate: true,
            closeOnSelect: true,
            monthPicker: true,
            monthPickerTemplate:
                '<div class="picker-calendar-month-picker">' +
                '<a href="#" class="link icon-only picker-calendar-prev-month"><i class="icon icon-prev"></i></a>' +
                '<div class="current-month-value"></div>' +
                '<a href="#" class="link icon-only picker-calendar-next-month"><i class="icon icon-next"></i></a>' +
                '</div>',
            yearPicker: true,
            yearPickerTemplate:
                '<div class="picker-calendar-year-picker">' +
                '<a href="#" class="link icon-only picker-calendar-prev-year"><i class="icon icon-prev"></i></a>' +
                '<span class="current-year-value"></span>' +
                '<a href="#" class="link icon-only picker-calendar-next-year"><i class="icon icon-next"></i></a>' +
                '</div>',
            weekHeader: true,
            // Common settings
            scrollToInput: true,
            inputReadOnly: true,
            toolbar: true,
            toolbarCloseText: 'Done',
            toolbarTemplate:
                '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                '{{monthPicker}}' +
                '{{yearPicker}}' +
                // '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
            /* Callbacks
               onMonthAdd
               onChange
               onOpen
               onClose
               onDayClick
               onMonthYearChangeStart
               onMonthYearChangeEnd
               */
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
        }
        p.params = params;
        p.initialized = false;

        // Inline flag
        p.inline = p.params.container ? true : false;

        // Is horizontal
        p.isH = p.params.direction === 'horizontal';

        // RTL inverter
        var inverter = p.isH ? (rtl ? -1 : 1) : 1;

        // Animating flag
        p.animating = false;

        // Format date
        function formatDate(date) {
            date = new Date(date);
            var year = date.getFullYear();
            var month = date.getMonth();
            var month1 = month + 1;
            var day = date.getDate();
            var weekDay = date.getDay();
            return p.params.dateFormat
                .replace(/yyyy/g, year)
                .replace(/yy/g, (year + '').substring(2))
                .replace(/mm/g, month1 < 10 ? '0' + month1 : month1)
                .replace(/m/g, month1)
                .replace(/MM/g, p.params.monthNames[month])
                .replace(/M/g, p.params.monthNamesShort[month])
                .replace(/dd/g, day < 10 ? '0' + day : day)
                .replace(/d/g, day)
                .replace(/DD/g, p.params.dayNames[weekDay])
                .replace(/D/g, p.params.dayNamesShort[weekDay]);
        }


        // Value
        p.addValue = function (value) {
            if (p.params.multiple) {
                if (!p.value) p.value = [];
                var inValuesIndex;
                for (var i = 0; i < p.value.length; i++) {
                    if (new Date(value).getTime() === new Date(p.value[i]).getTime()) {
                        inValuesIndex = i;
                    }
                }
                if (typeof inValuesIndex === 'undefined') {
                    p.value.push(value);
                }
                else {
                    p.value.splice(inValuesIndex, 1);
                }
                p.updateValue();
            }
            else {
                p.value = [value];
                p.updateValue();
            }
        };
        p.setValue = function (arrValues) {
            p.value = arrValues;
            p.updateValue();
        };
        p.updateValue = function () {
            p.wrapper.find('.picker-calendar-day-selected').removeClass('picker-calendar-day-selected');
            var i, inputValue;
            for (i = 0; i < p.value.length; i++) {
                var valueDate = new Date(p.value[i]);
                p.wrapper.find('.picker-calendar-day[data-date="' + valueDate.getFullYear() + '-' + valueDate.getMonth() + '-' + valueDate.getDate() + '"]').addClass('picker-calendar-day-selected');
            }
            if (p.params.onChange) {
                p.params.onChange(p, p.value, p.value.map(formatDate));
            }
            if (p.input && p.input.length > 0) {
                if (p.params.formatValue) inputValue = p.params.formatValue(p, p.value);
                else {
                    inputValue = [];
                    for (i = 0; i < p.value.length; i++) {
                        inputValue.push(formatDate(p.value[i]));
                    }
                    inputValue = inputValue.join(', ');
                }
                $(p.input).val(inputValue);
                $(p.input).trigger('change');
            }
        };

        // Columns Handlers
        p.initCalendarEvents = function () {
            var col;
            var allowItemClick = true;
            var isTouched, isMoved, touchStartX, touchStartY, touchCurrentX, touchCurrentY, touchStartTime, touchEndTime, startTranslate, currentTranslate, wrapperWidth, wrapperHeight, percentage, touchesDiff, isScrolling;
            function handleTouchStart (e) {
                if (isMoved || isTouched) return;
                // e.preventDefault();
                isTouched = true;
                touchStartX = touchCurrentY = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchStartY = touchCurrentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = (new Date()).getTime();
                percentage = 0;
                allowItemClick = true;
                isScrolling = undefined;
                startTranslate = currentTranslate = p.monthsTranslate;
            }
            function handleTouchMove (e) {
                if (!isTouched) return;

                touchCurrentX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                if (typeof isScrolling === 'undefined') {
                    isScrolling = !!(isScrolling || Math.abs(touchCurrentY - touchStartY) > Math.abs(touchCurrentX - touchStartX));
                }
                if (p.isH && isScrolling) {
                    isTouched = false;
                    return;
                }
                e.preventDefault();
                if (p.animating) {
                    isTouched = false;
                    return;
                }
                allowItemClick = false;
                if (!isMoved) {
                    // First move
                    isMoved = true;
                    wrapperWidth = p.wrapper[0].offsetWidth;
                    wrapperHeight = p.wrapper[0].offsetHeight;
                    p.wrapper.transition(0);
                }
                e.preventDefault();

                touchesDiff = p.isH ? touchCurrentX - touchStartX : touchCurrentY - touchStartY;
                percentage = touchesDiff/(p.isH ? wrapperWidth : wrapperHeight);
                currentTranslate = (p.monthsTranslate * inverter + percentage) * 100;

                // Transform wrapper
                p.wrapper.transform('translate3d(' + (p.isH ? currentTranslate : 0) + '%, ' + (p.isH ? 0 : currentTranslate) + '%, 0)');

            }
            function handleTouchEnd (e) {
                if (!isTouched || !isMoved) {
                    isTouched = isMoved = false;
                    return;
                }
                isTouched = isMoved = false;

                touchEndTime = new Date().getTime();
                if (touchEndTime - touchStartTime < 300) {
                    if (Math.abs(touchesDiff) < 10) {
                        p.resetMonth();
                    }
                    else if (touchesDiff >= 10) {
                        if (rtl) p.nextMonth();
                        else p.prevMonth();
                    }
                    else {
                        if (rtl) p.prevMonth();
                        else p.nextMonth();
                    }
                }
                else {
                    if (percentage <= -0.5) {
                        if (rtl) p.prevMonth();
                        else p.nextMonth();
                    }
                    else if (percentage >= 0.5) {
                        if (rtl) p.nextMonth();
                        else p.prevMonth();
                    }
                    else {
                        p.resetMonth();
                    }
                }

                // Allow click
                setTimeout(function () {
                    allowItemClick = true;
                }, 100);
            }

            function handleDayClick(e) {
                if (!allowItemClick) return;
                var day = $(e.target).parents('.picker-calendar-day');
                if (day.length === 0 && $(e.target).hasClass('picker-calendar-day')) {
                    day = $(e.target);
                }
                if (day.length === 0) return;
                if (day.hasClass('picker-calendar-day-selected') && !p.params.multiple) return;
                if (day.hasClass('picker-calendar-day-disabled')) return;
                if (day.hasClass('picker-calendar-day-next')) p.nextMonth();
                if (day.hasClass('picker-calendar-day-prev')) p.prevMonth();
                var dateYear = day.attr('data-year');
                var dateMonth = day.attr('data-month');
                var dateDay = day.attr('data-day');
                if (p.params.onDayClick) {
                    p.params.onDayClick(p, day[0], dateYear, dateMonth, dateDay);
                }
                p.addValue(new Date(dateYear, dateMonth, dateDay).getTime());
                if (p.params.closeOnSelect) p.close();
            }

            p.container.find('.picker-calendar-prev-month').on('click', p.prevMonth);
            p.container.find('.picker-calendar-next-month').on('click', p.nextMonth);
            p.container.find('.picker-calendar-prev-year').on('click', p.prevYear);
            p.container.find('.picker-calendar-next-year').on('click', p.nextYear);
            p.wrapper.on('click', handleDayClick);
            if (p.params.touchMove) {
                p.wrapper.on($.touchEvents.start, handleTouchStart);
                p.wrapper.on($.touchEvents.move, handleTouchMove);
                p.wrapper.on($.touchEvents.end, handleTouchEnd);
            }

            p.container[0].f7DestroyCalendarEvents = function () {
                p.container.find('.picker-calendar-prev-month').off('click', p.prevMonth);
                p.container.find('.picker-calendar-next-month').off('click', p.nextMonth);
                p.container.find('.picker-calendar-prev-year').off('click', p.prevYear);
                p.container.find('.picker-calendar-next-year').off('click', p.nextYear);
                p.wrapper.off('click', handleDayClick);
                if (p.params.touchMove) {
                    p.wrapper.off($.touchEvents.start, handleTouchStart);
                    p.wrapper.off($.touchEvents.move, handleTouchMove);
                    p.wrapper.off($.touchEvents.end, handleTouchEnd);
                }
            };


        };
        p.destroyCalendarEvents = function (colContainer) {
            if ('f7DestroyCalendarEvents' in p.container[0]) p.container[0].f7DestroyCalendarEvents();
        };

        // Calendar Methods
        p.daysInMonth = function (date) {
            var d = new Date(date);
            return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        };
        p.monthHTML = function (date, offset) {
            date = new Date(date);
            var year = date.getFullYear(),
                month = date.getMonth(),
                day = date.getDate();
            if (offset === 'next') {
                if (month === 11) date = new Date(year + 1, 0);
                else date = new Date(year, month + 1, 1);
            }
            if (offset === 'prev') {
                if (month === 0) date = new Date(year - 1, 11);
                else date = new Date(year, month - 1, 1);
            }
            if (offset === 'next' || offset === 'prev') {
                month = date.getMonth();
                year = date.getFullYear();
            }
            var daysInPrevMonth = p.daysInMonth(new Date(date.getFullYear(), date.getMonth()).getTime() - 10 * 24 * 60 * 60 * 1000),
                daysInMonth = p.daysInMonth(date),
                firstDayOfMonthIndex = new Date(date.getFullYear(), date.getMonth()).getDay();
            if (firstDayOfMonthIndex === 0) firstDayOfMonthIndex = 7;

            var dayDate, currentValues = [], i, j,
                rows = 6, cols = 7,
                monthHTML = '',
                dayIndex = 0 + (p.params.firstDay - 1),
                today = new Date().setHours(0,0,0,0),
                minDate = p.params.minDate ? new Date(p.params.minDate).getTime() : null,
                maxDate = p.params.maxDate ? new Date(p.params.maxDate).getTime() : null;

            if (p.value && p.value.length) {
                for (i = 0; i < p.value.length; i++) {
                    currentValues.push(new Date(p.value[i]).setHours(0,0,0,0));
                }
            }

            for (i = 1; i <= rows; i++) {
                var rowHTML = '';
                var row = i;
                for (j = 1; j <= cols; j++) {
                    var col = j;
                    dayIndex ++;
                    var dayNumber = dayIndex - firstDayOfMonthIndex;
                    var addClass = '';
                    if (dayNumber < 0) {
                        dayNumber = daysInPrevMonth + dayNumber + 1;
                        addClass += ' picker-calendar-day-prev';
                        dayDate = new Date(month - 1 < 0 ? year - 1 : year, month - 1 < 0 ? 11 : month - 1, dayNumber).getTime();
                    }
                    else {
                        dayNumber = dayNumber + 1;
                        if (dayNumber > daysInMonth) {
                            dayNumber = dayNumber - daysInMonth;
                            addClass += ' picker-calendar-day-next';
                            dayDate = new Date(month + 1 > 11 ? year + 1 : year, month + 1 > 11 ? 0 : month + 1, dayNumber).getTime();
                        }
                        else {
                            dayDate = new Date(year, month, dayNumber).getTime();
                        }
                    }
                    // Today
                    if (dayDate === today) addClass += ' picker-calendar-day-today';
                    // Selected
                    if (currentValues.indexOf(dayDate) >= 0) addClass += ' picker-calendar-day-selected';
                    // Weekend
                    if (p.params.weekendDays.indexOf(col - 1) >= 0) {
                        addClass += ' picker-calendar-day-weekend';
                    }
                    // Disabled
                    if ((minDate && dayDate < minDate) || (maxDate && dayDate > maxDate)) {
                        addClass += ' picker-calendar-day-disabled';
                    }

                    dayDate = new Date(dayDate);
                    var dayYear = dayDate.getFullYear();
                    var dayMonth = dayDate.getMonth();
                    rowHTML += '<div data-year="' + dayYear + '" data-month="' + dayMonth + '" data-day="' + dayNumber + '" class="picker-calendar-day' + (addClass) + '" data-date="' + (dayYear + '-' + dayMonth + '-' + dayNumber) + '"><span>'+dayNumber+'</span></div>';
                }
                monthHTML += '<div class="picker-calendar-row">' + rowHTML + '</div>';
            }
            monthHTML = '<div class="picker-calendar-month" data-year="' + year + '" data-month="' + month + '">' + monthHTML + '</div>';
            return monthHTML;
        };
        p.animating = false;
        p.updateCurrentMonthYear = function (dir) {
            if (typeof dir === 'undefined') {
                p.currentMonth = parseInt(p.months.eq(1).attr('data-month'), 10);
                p.currentYear = parseInt(p.months.eq(1).attr('data-year'), 10);
            }
            else {
                p.currentMonth = parseInt(p.months.eq(dir === 'next' ? (p.months.length - 1) : 0).attr('data-month'), 10);
                p.currentYear = parseInt(p.months.eq(dir === 'next' ? (p.months.length - 1) : 0).attr('data-year'), 10);
            }
            p.container.find('.current-month-value').text(p.params.monthNames[p.currentMonth]);
            p.container.find('.current-year-value').text(p.currentYear);

        };
        p.onMonthChangeStart = function (dir) {
            p.updateCurrentMonthYear(dir);
            p.months.removeClass('picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next');
            var currentIndex = dir === 'next' ? p.months.length - 1 : 0;

            p.months.eq(currentIndex).addClass('picker-calendar-month-current');
            p.months.eq(dir === 'next' ? currentIndex - 1 : currentIndex + 1).addClass(dir === 'next' ? 'picker-calendar-month-prev' : 'picker-calendar-month-next');

            if (p.params.onMonthYearChangeStart) {
                p.params.onMonthYearChangeStart(p, p.currentYear, p.currentMonth);
            }
        };
        p.onMonthChangeEnd = function (dir, rebuildBoth) {
            p.animating = false;
            var nextMonthHTML, prevMonthHTML, newMonthHTML;
            p.wrapper.find('.picker-calendar-month:not(.picker-calendar-month-prev):not(.picker-calendar-month-current):not(.picker-calendar-month-next)').remove();

            if (typeof dir === 'undefined') {
                dir = 'next';
                rebuildBoth = true;
            }
            if (!rebuildBoth) {
                newMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), dir);
            }
            else {
                p.wrapper.find('.picker-calendar-month-next, .picker-calendar-month-prev').remove();
                prevMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), 'prev');
                nextMonthHTML = p.monthHTML(new Date(p.currentYear, p.currentMonth), 'next');
            }
            if (dir === 'next' || rebuildBoth) {
                p.wrapper.append(newMonthHTML || nextMonthHTML);
            }
            if (dir === 'prev' || rebuildBoth) {
                p.wrapper.prepend(newMonthHTML || prevMonthHTML);
            }
            p.months = p.wrapper.find('.picker-calendar-month');
            p.setMonthsTranslate(p.monthsTranslate);
            if (p.params.onMonthAdd) {
                p.params.onMonthAdd(p, dir === 'next' ? p.months.eq(p.months.length - 1)[0] : p.months.eq(0)[0]);
            }
            if (p.params.onMonthYearChangeEnd) {
                p.params.onMonthYearChangeEnd(p, p.currentYear, p.currentMonth);
            }
        };
        p.setMonthsTranslate = function (translate) {
            translate = translate || p.monthsTranslate || 0;
            if (typeof p.monthsTranslate === 'undefined') p.monthsTranslate = translate;
            p.months.removeClass('picker-calendar-month-current picker-calendar-month-prev picker-calendar-month-next');
            var prevMonthTranslate = -(translate + 1) * 100 * inverter;
            var currentMonthTranslate = -translate * 100 * inverter;
            var nextMonthTranslate = -(translate - 1) * 100 * inverter;
            p.months.eq(0).transform('translate3d(' + (p.isH ? prevMonthTranslate : 0) + '%, ' + (p.isH ? 0 : prevMonthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
            p.months.eq(1).transform('translate3d(' + (p.isH ? currentMonthTranslate : 0) + '%, ' + (p.isH ? 0 : currentMonthTranslate) + '%, 0)').addClass('picker-calendar-month-current');
            p.months.eq(2).transform('translate3d(' + (p.isH ? nextMonthTranslate : 0) + '%, ' + (p.isH ? 0 : nextMonthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
        };
        p.nextMonth = function (transition) {
            if (typeof transition === 'undefined' || typeof transition === 'object') {
                transition = '';
                if (!p.params.animate) transition = 0;
            }
            var nextMonth = parseInt(p.months.eq(p.months.length - 1).attr('data-month'), 10);
            var nextYear = parseInt(p.months.eq(p.months.length - 1).attr('data-year'), 10);
            var nextDate = new Date(nextYear, nextMonth);
            var nextDateTime = nextDate.getTime();
            var transitionEndCallback = p.animating ? false : true;
            if (p.params.maxDate) {
                if (nextDateTime > new Date(p.params.maxDate).getTime()) {
                    return p.resetMonth();
                }
            }
            p.monthsTranslate --;
            if (nextMonth === p.currentMonth) {
                var nextMonthTranslate = -(p.monthsTranslate) * 100 * inverter;
                var nextMonthHTML = $(p.monthHTML(nextDateTime, 'next')).transform('translate3d(' + (p.isH ? nextMonthTranslate : 0) + '%, ' + (p.isH ? 0 : nextMonthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
                p.wrapper.append(nextMonthHTML[0]);
                p.months = p.wrapper.find('.picker-calendar-month');
                if (p.params.onMonthAdd) {
                    p.params.onMonthAdd(p, p.months.eq(p.months.length - 1)[0]);
                }
            }
            p.animating = true;
            p.onMonthChangeStart('next');
            var translate = (p.monthsTranslate * 100) * inverter;

            p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
            if (transitionEndCallback) {
                p.wrapper.transitionEnd(function () {
                    p.onMonthChangeEnd('next');
                });
            }
            if (!p.params.animate) {
                p.onMonthChangeEnd('next');
            }
        };
        p.prevMonth = function (transition) {
            if (typeof transition === 'undefined' || typeof transition === 'object') {
                transition = '';
                if (!p.params.animate) transition = 0;
            }
            var prevMonth = parseInt(p.months.eq(0).attr('data-month'), 10);
            var prevYear = parseInt(p.months.eq(0).attr('data-year'), 10);
            var prevDate = new Date(prevYear, prevMonth + 1, -1);
            var prevDateTime = prevDate.getTime();
            var transitionEndCallback = p.animating ? false : true;
            if (p.params.minDate) {
                if (prevDateTime < new Date(p.params.minDate).getTime()) {
                    return p.resetMonth();
                }
            }
            p.monthsTranslate ++;
            if (prevMonth === p.currentMonth) {
                var prevMonthTranslate = -(p.monthsTranslate) * 100 * inverter;
                var prevMonthHTML = $(p.monthHTML(prevDateTime, 'prev')).transform('translate3d(' + (p.isH ? prevMonthTranslate : 0) + '%, ' + (p.isH ? 0 : prevMonthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
                p.wrapper.prepend(prevMonthHTML[0]);
                p.months = p.wrapper.find('.picker-calendar-month');
                if (p.params.onMonthAdd) {
                    p.params.onMonthAdd(p, p.months.eq(0)[0]);
                }
            }
            p.animating = true;
            p.onMonthChangeStart('prev');
            var translate = (p.monthsTranslate * 100) * inverter;
            p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
            if (transitionEndCallback) {
                p.wrapper.transitionEnd(function () {
                    p.onMonthChangeEnd('prev');
                });
            }
            if (!p.params.animate) {
                p.onMonthChangeEnd('prev');
            }
        };
        p.resetMonth = function (transition) {
            if (typeof transition === 'undefined') transition = '';
            var translate = (p.monthsTranslate * 100) * inverter;
            p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? translate : 0) + '%, ' + (p.isH ? 0 : translate) + '%, 0)');
        };
        p.setYearMonth = function (year, month, transition) {
            if (typeof year === 'undefined') year = p.currentYear;
            if (typeof month === 'undefined') month = p.currentMonth;
            if (typeof transition === 'undefined' || typeof transition === 'object') {
                transition = '';
                if (!p.params.animate) transition = 0;
            }
            var targetDate;
            if (year < p.currentYear) {
                targetDate = new Date(year, month + 1, -1).getTime();
            }
            else {
                targetDate = new Date(year, month).getTime();
            }
            if (p.params.maxDate && targetDate > new Date(p.params.maxDate).getTime()) {
                return false;
            }
            if (p.params.minDate && targetDate < new Date(p.params.minDate).getTime()) {
                return false;
            }
            var currentDate = new Date(p.currentYear, p.currentMonth).getTime();
            var dir = targetDate > currentDate ? 'next' : 'prev';
            var newMonthHTML = p.monthHTML(new Date(year, month));
            p.monthsTranslate = p.monthsTranslate || 0;
            var prevTranslate = p.monthsTranslate;
            var monthTranslate, wrapperTranslate;
            var transitionEndCallback = p.animating ? false : true;
            if (targetDate > currentDate) {
                // To next
                p.monthsTranslate --;
                if (!p.animating) p.months.eq(p.months.length - 1).remove();
                p.wrapper.append(newMonthHTML);
                p.months = p.wrapper.find('.picker-calendar-month');
                monthTranslate = -(prevTranslate - 1) * 100 * inverter;
                p.months.eq(p.months.length - 1).transform('translate3d(' + (p.isH ? monthTranslate : 0) + '%, ' + (p.isH ? 0 : monthTranslate) + '%, 0)').addClass('picker-calendar-month-next');
            }
            else {
                // To prev
                p.monthsTranslate ++;
                if (!p.animating) p.months.eq(0).remove();
                p.wrapper.prepend(newMonthHTML);
                p.months = p.wrapper.find('.picker-calendar-month');
                monthTranslate = -(prevTranslate + 1) * 100 * inverter;
                p.months.eq(0).transform('translate3d(' + (p.isH ? monthTranslate : 0) + '%, ' + (p.isH ? 0 : monthTranslate) + '%, 0)').addClass('picker-calendar-month-prev');
            }
            if (p.params.onMonthAdd) {
                p.params.onMonthAdd(p, dir === 'next' ? p.months.eq(p.months.length - 1)[0] : p.months.eq(0)[0]);
            }
            p.animating = true;
            p.onMonthChangeStart(dir);
            wrapperTranslate = (p.monthsTranslate * 100) * inverter;
            p.wrapper.transition(transition).transform('translate3d(' + (p.isH ? wrapperTranslate : 0) + '%, ' + (p.isH ? 0 : wrapperTranslate) + '%, 0)');
            if (transitionEndCallback) {
                p.wrapper.transitionEnd(function () {
                    p.onMonthChangeEnd(dir, true);
                });
            }
            if (!p.params.animate) {
                p.onMonthChangeEnd(dir);
            }
        };
        p.nextYear = function () {
            p.setYearMonth(p.currentYear + 1);
        };
        p.prevYear = function () {
            p.setYearMonth(p.currentYear - 1);
        };


        // HTML Layout
        p.layout = function () {
            var pickerHTML = '';
            var pickerClass = '';
            var i;

            var layoutDate = p.value && p.value.length ? p.value[0] : new Date().setHours(0,0,0,0);
            var prevMonthHTML = p.monthHTML(layoutDate, 'prev');
            var currentMonthHTML = p.monthHTML(layoutDate);
            var nextMonthHTML = p.monthHTML(layoutDate, 'next');
            var monthsHTML = '<div class="picker-calendar-months"><div class="picker-calendar-months-wrapper">' + (prevMonthHTML + currentMonthHTML + nextMonthHTML) + '</div></div>';
            // Week days header
            var weekHeaderHTML = '';
            if (p.params.weekHeader) {
                for (i = 0; i < 7; i++) {
                    var weekDayIndex = (i + p.params.firstDay > 6) ? (i - 7 + p.params.firstDay) : (i + p.params.firstDay);
                    var dayName = p.params.dayNamesShort[weekDayIndex];
                    weekHeaderHTML += '<div class="picker-calendar-week-day ' + ((p.params.weekendDays.indexOf(weekDayIndex) >= 0) ? 'picker-calendar-week-day-weekend' : '') + '"> ' + dayName + '</div>';

                }
                weekHeaderHTML = '<div class="picker-calendar-week-days">' + weekHeaderHTML + '</div>';
            }
            pickerClass = 'picker-modal picker-calendar ' + (p.params.cssClass || '');
            var toolbarHTML = p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText) : '';
            if (p.params.toolbar) {
                toolbarHTML = p.params.toolbarTemplate
                    .replace(/{{closeText}}/g, p.params.toolbarCloseText)
                    .replace(/{{monthPicker}}/g, (p.params.monthPicker ? p.params.monthPickerTemplate : ''))
                    .replace(/{{yearPicker}}/g, (p.params.yearPicker ? p.params.yearPickerTemplate : ''));
            }

            pickerHTML =
                '<div class="' + (pickerClass) + '">' +
                toolbarHTML +
                '<div class="picker-modal-inner">' +
                weekHeaderHTML +
                monthsHTML +
                '</div>' +
                '</div>';


            p.pickerHTML = pickerHTML;
        };

        // Input Events
        function openOnInput(e) {
            e.preventDefault();
            // 安卓微信webviewreadonly的input依然弹出软键盘问题修复
            if ($.device.isWeixin && $.device.android && p.params.inputReadOnly) {
                /*jshint validthis:true */
                this.focus();
                this.blur();
            }
            if (p.opened) return;
            p.open();
            if (p.params.scrollToInput) {
                var pageContent = p.input.parents('.content');
                if (pageContent.length === 0) return;

                var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                    paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                    pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                    pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                    newPaddingBottom;

                var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
                if (inputTop > pageHeight) {
                    var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                    if (scrollTop + pageHeight > pageScrollHeight) {
                        newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                        if (pageHeight === pageScrollHeight) {
                            newPaddingBottom = p.container.height();
                        }
                        pageContent.css({'padding-bottom': (newPaddingBottom) + 'px'});
                    }
                    pageContent.scrollTop(scrollTop, 300);
                }
            }
        }
        function closeOnHTMLClick(e) {
            if (p.input && p.input.length > 0) {
                if (e.target !== p.input[0] && $(e.target).parents('.picker-modal').length === 0) p.close();
            }
            else {
                if ($(e.target).parents('.picker-modal').length === 0) p.close();
            }
        }

        if (p.params.input) {
            p.input = $(p.params.input);
            if (p.input.length > 0) {
                if (p.params.inputReadOnly) p.input.prop('readOnly', true);
                if (!p.inline) {
                    p.input.on('click', openOnInput);
                }
            }

        }

        if (!p.inline) $('html').on('click', closeOnHTMLClick);

        // Open
        function onPickerClose() {
            p.opened = false;
            if (p.input && p.input.length > 0) p.input.parents('.content').css({'padding-bottom': ''});
            if (p.params.onClose) p.params.onClose(p);

            // Destroy events
            p.destroyCalendarEvents();
        }

        p.opened = false;
        p.open = function () {
            var updateValue = false;
            if (!p.opened) {
                // Set date value
                if (!p.value) {
                    if (p.params.value) {
                        p.value = p.params.value;
                        updateValue = true;
                    }
                }

                // Layout
                p.layout();

                // Append
                if (p.inline) {
                    p.container = $(p.pickerHTML);
                    p.container.addClass('picker-modal-inline');
                    $(p.params.container).append(p.container);
                }
                else {
                    p.container = $($.pickerModal(p.pickerHTML));
                    $(p.container)
                        .on('close', function () {
                            onPickerClose();
                        });
                }

                // Store calendar instance
                p.container[0].f7Calendar = p;
                p.wrapper = p.container.find('.picker-calendar-months-wrapper');

                // Months
                p.months = p.wrapper.find('.picker-calendar-month');

                // Update current month and year
                p.updateCurrentMonthYear();

                // Set initial translate
                p.monthsTranslate = 0;
                p.setMonthsTranslate();

                // Init events
                p.initCalendarEvents();

                // Update input value
                if (updateValue) p.updateValue();

            }

            // Set flag
            p.opened = true;
            p.initialized = true;
            if (p.params.onMonthAdd) {
                p.months.each(function () {
                    p.params.onMonthAdd(p, this);
                });
            }
            if (p.params.onOpen) p.params.onOpen(p);
        };

        // Close
        p.close = function () {
            if (!p.opened || p.inline) return;
            $.closeModal(p.container);
            return;
        };

        // Destroy
        p.destroy = function () {
            p.close();
            if (p.params.input && p.input.length > 0) {
                p.input.off('click', openOnInput);
            }
            $('html').off('click', closeOnHTMLClick);
        };

        if (p.inline) {
            p.open();
        }

        return p;
    };
    $.fn.calendar = function (params) {
        return this.each(function() {
            var $this = $(this);
            if(!$this[0]) return;
            var p = {};
            if($this[0].tagName.toUpperCase() === "INPUT") {
                p.input = $this;
            } else {
                p.container = $this;
            }
            new Calendar($.extend(p, params));
        });
    };

    $.initCalendar = function(content) {
        var $content = content ? $(content) : $(document.body);
        $content.find("[data-toggle='date']").each(function() {
            $(this).calendar();
        });
    };
}(Zepto);

/*======================================================
************   Picker   ************
======================================================*/
/* jshint unused:false */
/* jshint multistr:true */
+ function($) {
    "use strict";
    var Picker = function (params) {
        var p = this;
        var defaults = {
            updateValuesOnMomentum: false,
            updateValuesOnTouchmove: true,
            rotateEffect: false,
            momentumRatio: 7,
            freeMode: false,
            // Common settings
            scrollToInput: true,
            inputReadOnly: true,
            toolbar: true,
            toolbarCloseText: '确定',
            toolbarTemplate: '<header class="bar bar-nav">\
                <button class="button button-link pull-right close-picker">确定</button>\
                <h1 class="title">请选择</h1>\
                </header>',
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
        }
        p.params = params;
        p.cols = [];
        p.initialized = false;

        // Inline flag
        p.inline = p.params.container ? true : false;

        // 3D Transforms origin bug, only on safari
        var originBug = $.device.ios || (navigator.userAgent.toLowerCase().indexOf('safari') >= 0 && navigator.userAgent.toLowerCase().indexOf('chrome') < 0) && !$.device.android;

        // Value
        p.setValue = function (arrValues, transition) {
            var valueIndex = 0;
            for (var i = 0; i < p.cols.length; i++) {
                if (p.cols[i] && !p.cols[i].divider) {
                    p.cols[i].setValue(arrValues[valueIndex], transition);
                    valueIndex++;
                }
            }
        };
        p.updateValue = function () {
            var newValue = [];
            var newDisplayValue = [];
            for (var i = 0; i < p.cols.length; i++) {
                if (!p.cols[i].divider) {
                    newValue.push(p.cols[i].value);
                    newDisplayValue.push(p.cols[i].displayValue);
                }
            }
            if (newValue.indexOf(undefined) >= 0) {
                return;
            }
            p.value = newValue;
            p.displayValue = newDisplayValue;
            if (p.params.onChange) {
                p.params.onChange(p, p.value, p.displayValue);
            }
            if (p.input && p.input.length > 0) {
                $(p.input).val(p.params.formatValue ? p.params.formatValue(p, p.value, p.displayValue) : p.value.join(' '));
                $(p.input).trigger('change');
            }
        };

        // Columns Handlers
        p.initPickerCol = function (colElement, updateItems) {
            var colContainer = $(colElement);
            var colIndex = colContainer.index();
            var col = p.cols[colIndex];
            if (col.divider) return;
            col.container = colContainer;
            col.wrapper = col.container.find('.picker-items-col-wrapper');
            col.items = col.wrapper.find('.picker-item');

            var i, j;
            var wrapperHeight, itemHeight, itemsHeight, minTranslate, maxTranslate;
            col.replaceValues = function (values, displayValues) {
                col.destroyEvents();
                col.values = values;
                col.displayValues = displayValues;
                var newItemsHTML = p.columnHTML(col, true);
                col.wrapper.html(newItemsHTML);
                col.items = col.wrapper.find('.picker-item');
                col.calcSize();
                col.setValue(col.values[0], 0, true);
                col.initEvents();
            };
            col.calcSize = function () {
                if (p.params.rotateEffect) {
                    col.container.removeClass('picker-items-col-absolute');
                    if (!col.width) col.container.css({width:''});
                }
                var colWidth, colHeight;
                colWidth = 0;
                colHeight = col.container[0].offsetHeight;
                wrapperHeight = col.wrapper[0].offsetHeight;
                itemHeight = col.items[0].offsetHeight;
                itemsHeight = itemHeight * col.items.length;
                minTranslate = colHeight / 2 - itemsHeight + itemHeight / 2;
                maxTranslate = colHeight / 2 - itemHeight / 2;
                if (col.width) {
                    colWidth = col.width;
                    if (parseInt(colWidth, 10) === colWidth) colWidth = colWidth + 'px';
                    col.container.css({width: colWidth});
                }
                if (p.params.rotateEffect) {
                    if (!col.width) {
                        col.items.each(function () {
                            var item = $(this);
                            item.css({width:'auto'});
                            colWidth = Math.max(colWidth, item[0].offsetWidth);
                            item.css({width:''});
                        });
                        col.container.css({width: (colWidth + 2) + 'px'});
                    }
                    col.container.addClass('picker-items-col-absolute');
                }
            };
            col.calcSize();

            col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)').transition(0);


            var activeIndex = 0;
            var animationFrameId;

            // Set Value Function
            col.setValue = function (newValue, transition, valueCallbacks) {
                if (typeof transition === 'undefined') transition = '';
                var newActiveIndex = col.wrapper.find('.picker-item[data-picker-value="' + newValue + '"]').index();
                if(typeof newActiveIndex === 'undefined' || newActiveIndex === -1) {
                    return;
                }
                var newTranslate = -newActiveIndex * itemHeight + maxTranslate;
                // Update wrapper
                col.wrapper.transition(transition);
                col.wrapper.transform('translate3d(0,' + (newTranslate) + 'px,0)');

                // Watch items
                if (p.params.updateValuesOnMomentum && col.activeIndex && col.activeIndex !== newActiveIndex ) {
                    $.cancelAnimationFrame(animationFrameId);
                    col.wrapper.transitionEnd(function(){
                        $.cancelAnimationFrame(animationFrameId);
                    });
                    updateDuringScroll();
                }

                // Update items
                col.updateItems(newActiveIndex, newTranslate, transition, valueCallbacks);
            };

            col.updateItems = function (activeIndex, translate, transition, valueCallbacks) {
                if (typeof translate === 'undefined') {
                    translate = $.getTranslate(col.wrapper[0], 'y');
                }
                if(typeof activeIndex === 'undefined') activeIndex = -Math.round((translate - maxTranslate)/itemHeight);
                if (activeIndex < 0) activeIndex = 0;
                if (activeIndex >= col.items.length) activeIndex = col.items.length - 1;
                var previousActiveIndex = col.activeIndex;
                col.activeIndex = activeIndex;
                /*
                   col.wrapper.find('.picker-selected, .picker-after-selected, .picker-before-selected').removeClass('picker-selected picker-after-selected picker-before-selected');

                   col.items.transition(transition);
                   var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');
                   var prevItems = selectedItem.prevAll().addClass('picker-before-selected');
                   var nextItems = selectedItem.nextAll().addClass('picker-after-selected');
                   */
                //去掉 .picker-after-selected, .picker-before-selected 以提高性能
                col.wrapper.find('.picker-selected').removeClass('picker-selected');
                if (p.params.rotateEffect) {
                    col.items.transition(transition);
                }
                var selectedItem = col.items.eq(activeIndex).addClass('picker-selected').transform('');

                if (valueCallbacks || typeof valueCallbacks === 'undefined') {
                    // Update values
                    col.value = selectedItem.attr('data-picker-value');
                    col.displayValue = col.displayValues ? col.displayValues[activeIndex] : col.value;
                    // On change callback
                    if (previousActiveIndex !== activeIndex) {
                        if (col.onChange) {
                            col.onChange(p, col.value, col.displayValue);
                        }
                        p.updateValue();
                    }
                }

                // Set 3D rotate effect
                if (!p.params.rotateEffect) {
                    return;
                }
                var percentage = (translate - (Math.floor((translate - maxTranslate)/itemHeight) * itemHeight + maxTranslate)) / itemHeight;

                col.items.each(function () {
                    var item = $(this);
                    var itemOffsetTop = item.index() * itemHeight;
                    var translateOffset = maxTranslate - translate;
                    var itemOffset = itemOffsetTop - translateOffset;
                    var percentage = itemOffset / itemHeight;

                    var itemsFit = Math.ceil(col.height / itemHeight / 2) + 1;

                    var angle = (-18*percentage);
                    if (angle > 180) angle = 180;
                    if (angle < -180) angle = -180;
                    // Far class
                    if (Math.abs(percentage) > itemsFit) item.addClass('picker-item-far');
                    else item.removeClass('picker-item-far');
                    // Set transform
                    item.transform('translate3d(0, ' + (-translate + maxTranslate) + 'px, ' + (originBug ? -110 : 0) + 'px) rotateX(' + angle + 'deg)');
                });
            };

            function updateDuringScroll() {
                animationFrameId = $.requestAnimationFrame(function () {
                    col.updateItems(undefined, undefined, 0);
                    updateDuringScroll();
                });
            }

            // Update items on init
            if (updateItems) col.updateItems(0, maxTranslate, 0);

            var allowItemClick = true;
            var isTouched, isMoved, touchStartY, touchCurrentY, touchStartTime, touchEndTime, startTranslate, returnTo, currentTranslate, prevTranslate, velocityTranslate, velocityTime;
            function handleTouchStart (e) {
                if (isMoved || isTouched) return;
                e.preventDefault();
                isTouched = true;
                touchStartY = touchCurrentY = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = (new Date()).getTime();

                allowItemClick = true;
                startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
            }
            function handleTouchMove (e) {
                if (!isTouched) return;
                e.preventDefault();
                allowItemClick = false;
                touchCurrentY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                if (!isMoved) {
                    // First move
                    $.cancelAnimationFrame(animationFrameId);
                    isMoved = true;
                    startTranslate = currentTranslate = $.getTranslate(col.wrapper[0], 'y');
                    col.wrapper.transition(0);
                }
                e.preventDefault();

                var diff = touchCurrentY - touchStartY;
                currentTranslate = startTranslate + diff;
                returnTo = undefined;

                // Normalize translate
                if (currentTranslate < minTranslate) {
                    currentTranslate = minTranslate - Math.pow(minTranslate - currentTranslate, 0.8);
                    returnTo = 'min';
                }
                if (currentTranslate > maxTranslate) {
                    currentTranslate = maxTranslate + Math.pow(currentTranslate - maxTranslate, 0.8);
                    returnTo = 'max';
                }
                // Transform wrapper
                col.wrapper.transform('translate3d(0,' + currentTranslate + 'px,0)');

                // Update items
                col.updateItems(undefined, currentTranslate, 0, p.params.updateValuesOnTouchmove);

                // Calc velocity
                velocityTranslate = currentTranslate - prevTranslate || currentTranslate;
                velocityTime = (new Date()).getTime();
                prevTranslate = currentTranslate;
            }
            function handleTouchEnd (e) {
                if (!isTouched || !isMoved) {
                    isTouched = isMoved = false;
                    return;
                }
                isTouched = isMoved = false;
                col.wrapper.transition('');
                if (returnTo) {
                    if (returnTo === 'min') {
                        col.wrapper.transform('translate3d(0,' + minTranslate + 'px,0)');
                    }
                    else col.wrapper.transform('translate3d(0,' + maxTranslate + 'px,0)');
                }
                touchEndTime = new Date().getTime();
                var velocity, newTranslate;
                if (touchEndTime - touchStartTime > 300) {
                    newTranslate = currentTranslate;
                }
                else {
                    velocity = Math.abs(velocityTranslate / (touchEndTime - velocityTime));
                    newTranslate = currentTranslate + velocityTranslate * p.params.momentumRatio;
                }

                newTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate);

                // Active Index
                var activeIndex = -Math.floor((newTranslate - maxTranslate)/itemHeight);

                // Normalize translate
                if (!p.params.freeMode) newTranslate = -activeIndex * itemHeight + maxTranslate;

                // Transform wrapper
                col.wrapper.transform('translate3d(0,' + (parseInt(newTranslate,10)) + 'px,0)');

                // Update items
                col.updateItems(activeIndex, newTranslate, '', true);

                // Watch items
                if (p.params.updateValuesOnMomentum) {
                    updateDuringScroll();
                    col.wrapper.transitionEnd(function(){
                        $.cancelAnimationFrame(animationFrameId);
                    });
                }

                // Allow click
                setTimeout(function () {
                    allowItemClick = true;
                }, 100);
            }

            function handleClick(e) {
                if (!allowItemClick) return;
                $.cancelAnimationFrame(animationFrameId);
                /*jshint validthis:true */
                var value = $(this).attr('data-picker-value');
                col.setValue(value);
            }

            col.initEvents = function (detach) {
                var method = detach ? 'off' : 'on';
                col.container[method]($.touchEvents.start, handleTouchStart);
                col.container[method]($.touchEvents.move, handleTouchMove);
                col.container[method]($.touchEvents.end, handleTouchEnd);
                col.items[method]('click', handleClick);
            };
            col.destroyEvents = function () {
                col.initEvents(true);
            };

            col.container[0].f7DestroyPickerCol = function () {
                col.destroyEvents();
            };

            col.initEvents();

        };
        p.destroyPickerCol = function (colContainer) {
            colContainer = $(colContainer);
            if ('f7DestroyPickerCol' in colContainer[0]) colContainer[0].f7DestroyPickerCol();
        };
        // Resize cols
        function resizeCols() {
            if (!p.opened) return;
            for (var i = 0; i < p.cols.length; i++) {
                if (!p.cols[i].divider) {
                    p.cols[i].calcSize();
                    p.cols[i].setValue(p.cols[i].value, 0, false);
                }
            }
        }
        $(window).on('resize', resizeCols);

        // HTML Layout
        p.columnHTML = function (col, onlyItems) {
            var columnItemsHTML = '';
            var columnHTML = '';
            if (col.divider) {
                columnHTML += '<div class="picker-items-col picker-items-col-divider ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '">' + col.content + '</div>';
            }
            else {
                for (var j = 0; j < col.values.length; j++) {
                    columnItemsHTML += '<div class="picker-item" data-picker-value="' + col.values[j] + '">' + (col.displayValues ? col.displayValues[j] : col.values[j]) + '</div>';
                }

                columnHTML += '<div class="picker-items-col ' + (col.textAlign ? 'picker-items-col-' + col.textAlign : '') + ' ' + (col.cssClass || '') + '"><div class="picker-items-col-wrapper">' + columnItemsHTML + '</div></div>';
            }
            return onlyItems ? columnItemsHTML : columnHTML;
        };
        p.layout = function () {
            var pickerHTML = '';
            var pickerClass = '';
            var i;
            p.cols = [];
            var colsHTML = '';
            for (i = 0; i < p.params.cols.length; i++) {
                var col = p.params.cols[i];
                colsHTML += p.columnHTML(p.params.cols[i]);
                p.cols.push(col);
            }
            pickerClass = 'picker-modal picker-columns ' + (p.params.cssClass || '') + (p.params.rotateEffect ? ' picker-3d' : '');
            pickerHTML =
                '<div class="' + (pickerClass) + '">' +
                (p.params.toolbar ? p.params.toolbarTemplate.replace(/{{closeText}}/g, p.params.toolbarCloseText) : '') +
                '<div class="picker-modal-inner picker-items">' +
                colsHTML +
                '<div class="picker-center-highlight"></div>' +
                '</div>' +
                '</div>';

            p.pickerHTML = pickerHTML;
        };

        // Input Events
        function openOnInput(e) {
            e.preventDefault();
            // 安卓微信webviewreadonly的input依然弹出软键盘问题修复
            if ($.device.isWeixin && $.device.android && p.params.inputReadOnly) {
                /*jshint validthis:true */
                this.focus();
                this.blur();
            }
            if (p.opened) return;
            p.open();
            if (p.params.scrollToInput) {
                var pageContent = p.input.parents('.content');
                if (pageContent.length === 0) return;

                var paddingTop = parseInt(pageContent.css('padding-top'), 10),
                    paddingBottom = parseInt(pageContent.css('padding-bottom'), 10),
                    pageHeight = pageContent[0].offsetHeight - paddingTop - p.container.height(),
                    pageScrollHeight = pageContent[0].scrollHeight - paddingTop - p.container.height(),
                    newPaddingBottom;
                var inputTop = p.input.offset().top - paddingTop + p.input[0].offsetHeight;
                if (inputTop > pageHeight) {
                    var scrollTop = pageContent.scrollTop() + inputTop - pageHeight;
                    if (scrollTop + pageHeight > pageScrollHeight) {
                        newPaddingBottom = scrollTop + pageHeight - pageScrollHeight + paddingBottom;
                        if (pageHeight === pageScrollHeight) {
                            newPaddingBottom = p.container.height();
                        }
                        pageContent.css({'padding-bottom': (newPaddingBottom) + 'px'});
                    }
                    pageContent.scrollTop(scrollTop, 300);
                }
            }
        }
        function closeOnHTMLClick(e) {
            if (!p.opened) return;
            if (p.input && p.input.length > 0) {
                if (e.target !== p.input[0] && $(e.target).parents('.picker-modal').length === 0) p.close();
            }
            else {
                if ($(e.target).parents('.picker-modal').length === 0) p.close();
            }
        }

        if (p.params.input) {
            p.input = $(p.params.input);
            if (p.input.length > 0) {
                if (p.params.inputReadOnly) p.input.prop('readOnly', true);
                if (!p.inline) {
                    p.input.on('click', openOnInput);
                }
            }
        }

        if (!p.inline) $('html').on('click', closeOnHTMLClick);

        // Open
        function onPickerClose() {
            p.opened = false;
            if (p.input && p.input.length > 0) p.input.parents('.content').css({'padding-bottom': ''});
            if (p.params.onClose) p.params.onClose(p);

            // Destroy events
            p.container.find('.picker-items-col').each(function () {
                p.destroyPickerCol(this);
            });
        }

        p.opened = false;
        p.open = function () {
            if (!p.opened) {

                // Layout
                p.layout();

                // Append
                if (p.inline) {
                    p.container = $(p.pickerHTML);
                    p.container.addClass('picker-modal-inline');
                    $(p.params.container).append(p.container);
                    p.opened = true;
                }
                else {
                    p.container = $($.pickerModal(p.pickerHTML));
                    $(p.container)
                        .one('opened', function() {
                            p.opened = true;
                        })
                        .on('close', function () {
                            onPickerClose();
                        });
                }

                // Store picker instance
                p.container[0].f7Picker = p;

                // Init Events
                p.container.find('.picker-items-col').each(function () {
                    var updateItems = true;
                    if ((!p.initialized && p.params.value) || (p.initialized && p.value)) updateItems = false;
                    p.initPickerCol(this, updateItems);
                });

                // Set value
                if (!p.initialized) {
                    if (p.params.value) {
                        p.setValue(p.params.value, 0);
                    }
                }
                else {
                    if (p.value) p.setValue(p.value, 0);
                }
            }

            // Set flag
            p.initialized = true;

            if (p.params.onOpen) p.params.onOpen(p);
        };

        // Close
        p.close = function () {
            if (!p.opened || p.inline) return;
            $.closeModal(p.container);
            return;
        };

        // Destroy
        p.destroy = function () {
            p.close();
            if (p.params.input && p.input.length > 0) {
                p.input.off('click', openOnInput);
            }
            $('html').off('click', closeOnHTMLClick);
            $(window).off('resize', resizeCols);
        };

        if (p.inline) {
            p.open();
        }

        return p;
    };

    $(document).on("click", ".close-picker", function() {
        var pickerToClose = $('.picker-modal.modal-in');
        $.closeModal(pickerToClose);
    });

    $.fn.picker = function(params) {
        var args = arguments;
        return this.each(function() {
            if(!this) return;
            var $this = $(this);

            var picker = $this.data("picker");
            if(!picker) {
                var p = $.extend({
                    input: this,
                    value: $this.val() ? $this.val().split(' ') : ''
                }, params);
                picker = new Picker(p);
                $this.data("picker", picker);
            }
            if(typeof params === typeof "a") {
                picker[params].apply(picker, Array.prototype.slice.call(args, 1));
            }
        });
    };
}(Zepto);

/* jshint unused:false*/

+ function($) {
    "use strict";

    var today = new Date();

    var getDays = function(max) {
        var days = [];
        for(var i=1; i<= (max||31);i++) {
            days.push(i < 10 ? "0"+i : i);
        }
        return days;
    };

    var getDaysByMonthAndYear = function(month, year) {
        var int_d = new Date(year, parseInt(month)+1-1, 1);
        var d = new Date(int_d - 1);
        return getDays(d.getDate());
    };

    var formatNumber = function (n) {
        return n < 10 ? "0" + n : n;
    };

    var initMonthes = ('01 02 03 04 05 06 07 08 09 10 11 12').split(' ');

    var initYears = (function () {
        var arr = [];
        for (var i = 1950; i <= 2050; i++) { arr.push(i); }
        return arr;
    })();


    var defaults = {

        rotateEffect: false,  //为了性能

        value: [today.getFullYear(), formatNumber(today.getMonth()+1), formatNumber(today.getDate()), today.getHours(), formatNumber(today.getMinutes())],

        onChange: function (picker, values, displayValues) {
            var days = getDaysByMonthAndYear(picker.cols[1].value, picker.cols[0].value);
            var currentValue = picker.cols[2].value;
            if(currentValue > days.length) currentValue = days.length;
            picker.cols[2].setValue(currentValue);
        },

        formatValue: function (p, values, displayValues) {
            return displayValues[0] + '-' + values[1] + '-' + values[2] + ' ' + values[3] + ':' + values[4];
        },

        cols: [
            // Years
        {
            values: initYears
        },
        // Months
        {
            values: initMonthes
        },
        // Days
        {
            values: getDays()
        },

        // Space divider
        {
            divider: true,
            content: '  '
        },
        // Hours
        {
            values: (function () {
                var arr = [];
                for (var i = 0; i <= 23; i++) { arr.push(i); }
                return arr;
            })(),
        },
        // Divider
        {
            divider: true,
            content: ':'
        },
        // Minutes
        {
            values: (function () {
                var arr = [];
                for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                return arr;
            })(),
        }
        ]
    };

    $.fn.datetimePicker = function(params) {
        return this.each(function() {
            if(!this) return;
            var p = $.extend(defaults, params);
            $(this).picker(p);
            if (params.value) $(this).val(p.formatValue(p, p.value, p.value));
        });
    };

}(Zepto);

+ function(window) {

    "use strict";

    var rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    /*var cRAF = window.cancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame;*/

    var utils = (function() {
        var me = {};

        var _elementStyle = document.createElement('div').style;
        var _vendor = (function() {
            var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                transform,
                i = 0,
                l = vendors.length;

            for (; i < l; i++) {
                transform = vendors[i] + 'ransform';
                if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
            }

            return false;
        })();

        function _prefixStyle(style) {
            if (_vendor === false) return false;
            if (_vendor === '') return style;
            return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
        }

        me.getTime = Date.now || function getTime() {
            return new Date().getTime();
        };

        me.extend = function(target, obj) {
            for (var i in obj) {  // jshint ignore:line
                    target[i] = obj[i]; 
            }
        };

        me.addEvent = function(el, type, fn, capture) {
            el.addEventListener(type, fn, !!capture);
        };

        me.removeEvent = function(el, type, fn, capture) {
            el.removeEventListener(type, fn, !!capture);
        };

        me.prefixPointerEvent = function(pointerEvent) {
            return window.MSPointerEvent ?
                'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10) :
                pointerEvent;
        };

        me.momentum = function(current, start, time, lowerMargin, wrapperSize, deceleration, self) {
            var distance = current - start,
                speed = Math.abs(distance) / time,
                destination,
                duration;

            // var absDistance = Math.abs(distance);
            speed = speed / 2; //slowdown
            speed = speed > 1.5 ? 1.5 : speed; //set max speed to 1
            deceleration = deceleration === undefined ? 0.0006 : deceleration;

            destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
            duration = speed / deceleration;

            if (destination < lowerMargin) {
                destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
                distance = Math.abs(destination - current);
                duration = distance / speed;
            } else if (destination > 0) {
                destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
                distance = Math.abs(current) + destination;
                duration = distance / speed;
            }

            //simple trigger, every 50ms
            var t = +new Date();
            var l = t;

            function eventTrigger() {
                if (+new Date() - l > 50) {
                    self._execEvent('scroll');
                    l = +new Date();
                }
                if (+new Date() - t < duration) {
                    rAF(eventTrigger);
                }
            }
            rAF(eventTrigger);

            return {
                destination: Math.round(destination),
                duration: duration
            };
        };

        var _transform = _prefixStyle('transform');

        me.extend(me, {
            hasTransform: _transform !== false,
            hasPerspective: _prefixStyle('perspective') in _elementStyle,
            hasTouch: 'ontouchstart' in window,
            hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
            hasTransition: _prefixStyle('transition') in _elementStyle
        });

        // This should find all Android browsers lower than build 535.19 (both stock browser and webview)
        me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion)) && false; //this will cause many android device scroll flash; so set it to false!

        me.extend(me.style = {}, {
            transform: _transform,
            transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
            transitionDuration: _prefixStyle('transitionDuration'),
            transitionDelay: _prefixStyle('transitionDelay'),
            transformOrigin: _prefixStyle('transformOrigin')
        });

        me.hasClass = function(e, c) {
            var re = new RegExp('(^|\\s)' + c + '(\\s|$)');
            return re.test(e.className);
        };

        me.addClass = function(e, c) {
            if (me.hasClass(e, c)) {
                return;
            }

            var newclass = e.className.split(' ');
            newclass.push(c);
            e.className = newclass.join(' ');
        };

        me.removeClass = function(e, c) {
            if (!me.hasClass(e, c)) {
                return;
            }

            var re = new RegExp('(^|\\s)' + c + '(\\s|$)', 'g');
            e.className = e.className.replace(re, ' ');
        };

        me.offset = function(el) {
            var left = -el.offsetLeft,
                top = -el.offsetTop;

            // jshint -W084
            while (el = el.offsetParent) {
                left -= el.offsetLeft;
                top -= el.offsetTop;
            }
            // jshint +W084

            return {
                left: left,
                top: top
            };
        };

        me.preventDefaultException = function(el, exceptions) {
            for (var i in exceptions) {
                if (exceptions[i].test(el[i])) {
                    return true;
                }
            }

            return false;
        };

        me.extend(me.eventType = {}, {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,

            mousedown: 2,
            mousemove: 2,
            mouseup: 2,

            pointerdown: 3,
            pointermove: 3,
            pointerup: 3,

            MSPointerDown: 3,
            MSPointerMove: 3,
            MSPointerUp: 3
        });

        me.extend(me.ease = {}, {
            quadratic: {
                style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fn: function(k) {
                    return k * (2 - k);
                }
            },
            circular: {
                style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly 'circular' but this looks better, it should be (0.075, 0.82, 0.165, 1)
                fn: function(k) {
                    return Math.sqrt(1 - (--k * k));
                }
            },
            back: {
                style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fn: function(k) {
                    var b = 4;
                    return (k = k - 1) * k * ((b + 1) * k + b) + 1;
                }
            },
            bounce: {
                style: '',
                fn: function(k) {
                    if ((k /= 1) < (1 / 2.75)) {
                        return 7.5625 * k * k;
                    } else if (k < (2 / 2.75)) {
                        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
                    } else if (k < (2.5 / 2.75)) {
                        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
                    } else {
                        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
                    }
                }
            },
            elastic: {
                style: '',
                fn: function(k) {
                    var f = 0.22,
                        e = 0.4;

                    if (k === 0) {
                        return 0;
                    }
                    if (k === 1) {
                        return 1;
                    }

                    return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
                }
            }
        });

        me.tap = function(e, eventName) {
            var ev = document.createEvent('Event');
            ev.initEvent(eventName, true, true);
            ev.pageX = e.pageX;
            ev.pageY = e.pageY;
            e.target.dispatchEvent(ev);
        };

        me.click = function(e) {
            var target = e.target,
                ev;

            if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent('click', true, true, e.view, 1,
                    target.screenX, target.screenY, target.clientX, target.clientY,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                    0, null);

                ev._constructed = true;
                target.dispatchEvent(ev);
            }
        };

        return me;
    })();

    function IScroll(el, options) {
        this.wrapper = typeof el === 'string' ? document.querySelector(el) : el;
        this.scroller = $(this.wrapper).find('.content-inner')[0]; // jshint ignore:line


        this.scrollerStyle = this.scroller&&this.scroller.style; // cache style for better performance

        this.options = {

            resizeScrollbars: true,

            mouseWheelSpeed: 20,

            snapThreshold: 0.334,

            // INSERT POINT: OPTIONS 

            startX: 0,
            startY: 0,
            scrollY: true,
            directionLockThreshold: 5,
            momentum: true,

            bounce: true,
            bounceTime: 600,
            bounceEasing: '',

            preventDefault: true,
            preventDefaultException: {
                tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/
            },

            HWCompositing: true,
            useTransition: true,
            useTransform: true,

            //other options
            eventPassthrough: undefined, //if you  want to use native scroll, you can set to: true or horizontal
        };

        for (var i in options) {
                this.options[i] = options[i];
        }

        // Normalize options
        this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

        this.options.useTransition = utils.hasTransition && this.options.useTransition;
        this.options.useTransform = utils.hasTransform && this.options.useTransform;

        this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
        this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

        // If you want eventPassthrough I have to lock one of the axes
        this.options.scrollY = this.options.eventPassthrough === 'vertical' ? false : this.options.scrollY;
        this.options.scrollX = this.options.eventPassthrough === 'horizontal' ? false : this.options.scrollX;

        // With eventPassthrough we also need lockDirection mechanism
        this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
        this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

        this.options.bounceEasing = typeof this.options.bounceEasing === 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

        this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

        if (this.options.tap === true) {
            this.options.tap = 'tap';
        }

        if (this.options.shrinkScrollbars === 'scale') {
            this.options.useTransition = false;
        }

        this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

        if (this.options.probeType === 3) {
            this.options.useTransition = false;
        }

        // INSERT POINT: NORMALIZATION

        // Some defaults    
        this.x = 0;
        this.y = 0;
        this.directionX = 0;
        this.directionY = 0;
        this._events = {};

        // INSERT POINT: DEFAULTS

        this._init();
        this.refresh();

        this.scrollTo(this.options.startX, this.options.startY);
        this.enable();
    }

    IScroll.prototype = {
        version: '5.1.3',

        _init: function() {
            this._initEvents();

            if (this.options.scrollbars || this.options.indicators) {
                this._initIndicators();
            }

            if (this.options.mouseWheel) {
                this._initWheel();
            }

            if (this.options.snap) {
                this._initSnap();
            }

            if (this.options.keyBindings) {
                this._initKeys();
            }

            // INSERT POINT: _init

        },

        destroy: function() {
            this._initEvents(true);

            this._execEvent('destroy');
        },

        _transitionEnd: function(e) {
            if (e.target !== this.scroller || !this.isInTransition) {
                return;
            }

            this._transitionTime();
            if (!this.resetPosition(this.options.bounceTime)) {
                this.isInTransition = false;
                this._execEvent('scrollEnd');
            }
        },

        _start: function(e) {
            // React to left mouse button only
            if (utils.eventType[e.type] !== 1) {
                if (e.button !== 0) {
                    return;
                }
            }

            if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
                return;
            }

            if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
                e.preventDefault();
            }

            var point = e.touches ? e.touches[0] : e,
                pos;

            this.initiated = utils.eventType[e.type];
            this.moved = false;
            this.distX = 0;
            this.distY = 0;
            this.directionX = 0;
            this.directionY = 0;
            this.directionLocked = 0;

            this._transitionTime();

            this.startTime = utils.getTime();

            if (this.options.useTransition && this.isInTransition) {
                this.isInTransition = false;
                pos = this.getComputedPosition();
                this._translate(Math.round(pos.x), Math.round(pos.y));
                this._execEvent('scrollEnd');
            } else if (!this.options.useTransition && this.isAnimating) {
                this.isAnimating = false;
                this._execEvent('scrollEnd');
            }

            this.startX = this.x;
            this.startY = this.y;
            this.absStartX = this.x;
            this.absStartY = this.y;
            this.pointX = point.pageX;
            this.pointY = point.pageY;

            this._execEvent('beforeScrollStart');
        },

        _move: function(e) {
            if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                return;
            }

            if (this.options.preventDefault) { // increases performance on Android? TODO: check!
                e.preventDefault();
            }

            var point = e.touches ? e.touches[0] : e,
                deltaX = point.pageX - this.pointX,
                deltaY = point.pageY - this.pointY,
                timestamp = utils.getTime(),
                newX, newY,
                absDistX, absDistY;

            this.pointX = point.pageX;
            this.pointY = point.pageY;

            this.distX += deltaX;
            this.distY += deltaY;
            absDistX = Math.abs(this.distX);
            absDistY = Math.abs(this.distY);

            // We need to move at least 10 pixels for the scrolling to initiate
            if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
                return;
            }

            // If you are scrolling in one direction lock the other
            if (!this.directionLocked && !this.options.freeScroll) {
                if (absDistX > absDistY + this.options.directionLockThreshold) {
                    this.directionLocked = 'h'; // lock horizontally
                } else if (absDistY >= absDistX + this.options.directionLockThreshold) {
                    this.directionLocked = 'v'; // lock vertically
                } else {
                    this.directionLocked = 'n'; // no lock
                }
            }

            if (this.directionLocked === 'h') {
                if (this.options.eventPassthrough === 'vertical') {
                    e.preventDefault();
                } else if (this.options.eventPassthrough === 'horizontal') {
                    this.initiated = false;
                    return;
                }

                deltaY = 0;
            } else if (this.directionLocked === 'v') {
                if (this.options.eventPassthrough === 'horizontal') {
                    e.preventDefault();
                } else if (this.options.eventPassthrough === 'vertical') {
                    this.initiated = false;
                    return;
                }

                deltaX = 0;
            }

            deltaX = this.hasHorizontalScroll ? deltaX : 0;
            deltaY = this.hasVerticalScroll ? deltaY : 0;

            newX = this.x + deltaX;
            newY = this.y + deltaY;

            // Slow down if outside of the boundaries
            if (newX > 0 || newX < this.maxScrollX) {
                newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
            }
            if (newY > 0 || newY < this.maxScrollY) {
                newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
            }

            this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
            this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

            if (!this.moved) {
                this._execEvent('scrollStart');
            }

            this.moved = true;

            this._translate(newX, newY);

            /* REPLACE START: _move */
            if (timestamp - this.startTime > 300) {
                this.startTime = timestamp;
                this.startX = this.x;
                this.startY = this.y;

                if (this.options.probeType === 1) {
                    this._execEvent('scroll');
                }
            }

            if (this.options.probeType > 1) {
                this._execEvent('scroll');
            }
            /* REPLACE END: _move */

        },

        _end: function(e) {
            if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                return;
            }

            if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
                e.preventDefault();
            }

            var /*point = e.changedTouches ? e.changedTouches[0] : e,*/
                momentumX,
                momentumY,
                duration = utils.getTime() - this.startTime,
                newX = Math.round(this.x),
                newY = Math.round(this.y),
                distanceX = Math.abs(newX - this.startX),
                distanceY = Math.abs(newY - this.startY),
                time = 0,
                easing = '';

            this.isInTransition = 0;
            this.initiated = 0;
            this.endTime = utils.getTime();

            // reset if we are outside of the boundaries
            if (this.resetPosition(this.options.bounceTime)) {
                return;
            }

            this.scrollTo(newX, newY); // ensures that the last position is rounded

            // we scrolled less than 10 pixels
            if (!this.moved) {
                if (this.options.tap) {
                    utils.tap(e, this.options.tap);
                }

                if (this.options.click) {
                    utils.click(e);
                }

                this._execEvent('scrollCancel');
                return;
            }

            if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
                this._execEvent('flick');
                return;
            }

            // start momentum animation if needed
            if (this.options.momentum && duration < 300) {
                momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration, this) : {
                    destination: newX,
                    duration: 0
                };
                momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration, this) : {
                    destination: newY,
                    duration: 0
                };
                newX = momentumX.destination;
                newY = momentumY.destination;
                time = Math.max(momentumX.duration, momentumY.duration);
                this.isInTransition = 1;
            }


            if (this.options.snap) {
                var snap = this._nearestSnap(newX, newY);
                this.currentPage = snap;
                time = this.options.snapSpeed || Math.max(
                    Math.max(
                        Math.min(Math.abs(newX - snap.x), 1000),
                        Math.min(Math.abs(newY - snap.y), 1000)
                    ), 300);
                newX = snap.x;
                newY = snap.y;

                this.directionX = 0;
                this.directionY = 0;
                easing = this.options.bounceEasing;
            }

            // INSERT POINT: _end

            if (newX !== this.x || newY !== this.y) {
                // change easing function when scroller goes out of the boundaries
                if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
                    easing = utils.ease.quadratic;
                }

                this.scrollTo(newX, newY, time, easing);
                return;
            }

            this._execEvent('scrollEnd');
        },

        _resize: function() {
            var that = this;

            clearTimeout(this.resizeTimeout);

            this.resizeTimeout = setTimeout(function() {
                that.refresh();
            }, this.options.resizePolling);
        },

        resetPosition: function(time) {
            var x = this.x,
                y = this.y;

            time = time || 0;

            if (!this.hasHorizontalScroll || this.x > 0) {
                x = 0;
            } else if (this.x < this.maxScrollX) {
                x = this.maxScrollX;
            }

            if (!this.hasVerticalScroll || this.y > 0) {
                y = 0;
            } else if (this.y < this.maxScrollY) {
                y = this.maxScrollY;
            }

            if (x === this.x && y === this.y) {
                return false;
            }

            if (this.options.ptr && this.y > 44 && this.startY * -1 < $(window).height() && !this.ptrLock) {// jshint ignore:line
                // not trigger ptr when user want to scroll to top
                y = this.options.ptrOffset || 44;
                this._execEvent('ptr');
                // 防止返回的过程中再次触发了 ptr ，导致被定位到 44px（因为可能done事件触发很快，在返回到44px以前就触发done
                this.ptrLock = true;
                var self = this;
                setTimeout(function() {
                    self.ptrLock = false;
                }, 500);
            }

            this.scrollTo(x, y, time, this.options.bounceEasing);

            return true;
        },

        disable: function() {
            this.enabled = false;
        },

        enable: function() {
            this.enabled = true;
        },

        refresh: function() {
            // var rf = this.wrapper.offsetHeight; // Force reflow

            this.wrapperWidth = this.wrapper.clientWidth;
            this.wrapperHeight = this.wrapper.clientHeight;

            /* REPLACE START: refresh */

            this.scrollerWidth = this.scroller.offsetWidth;
            this.scrollerHeight = this.scroller.offsetHeight;

            this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
            this.maxScrollY = this.wrapperHeight - this.scrollerHeight;

            /* REPLACE END: refresh */

            this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
            this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;

            if (!this.hasHorizontalScroll) {
                this.maxScrollX = 0;
                this.scrollerWidth = this.wrapperWidth;
            }

            if (!this.hasVerticalScroll) {
                this.maxScrollY = 0;
                this.scrollerHeight = this.wrapperHeight;
            }

            this.endTime = 0;
            this.directionX = 0;
            this.directionY = 0;

            this.wrapperOffset = utils.offset(this.wrapper);

            this._execEvent('refresh');

            this.resetPosition();

            // INSERT POINT: _refresh

        },

        on: function(type, fn) {
            if (!this._events[type]) {
                this._events[type] = [];
            }

            this._events[type].push(fn);
        },

        off: function(type, fn) {
            if (!this._events[type]) {
                return;
            }

            var index = this._events[type].indexOf(fn);

            if (index > -1) {
                this._events[type].splice(index, 1);
            }
        },

        _execEvent: function(type) {
            if (!this._events[type]) {
                return;
            }

            var i = 0,
                l = this._events[type].length;

            if (!l) {
                return;
            }

            for (; i < l; i++) {
                this._events[type][i].apply(this, [].slice.call(arguments, 1));
            }
        },

        scrollBy: function(x, y, time, easing) {
            x = this.x + x;
            y = this.y + y;
            time = time || 0;

            this.scrollTo(x, y, time, easing);
        },

        scrollTo: function(x, y, time, easing) {
            easing = easing || utils.ease.circular;

            this.isInTransition = this.options.useTransition && time > 0;

            if (!time || (this.options.useTransition && easing.style)) {
                this._transitionTimingFunction(easing.style);
                this._transitionTime(time);
                this._translate(x, y);
            } else {
                this._animate(x, y, time, easing.fn);
            }
        },

        scrollToElement: function(el, time, offsetX, offsetY, easing) {
            el = el.nodeType ? el : this.scroller.querySelector(el);

            if (!el) {
                return;
            }

            var pos = utils.offset(el);

            pos.left -= this.wrapperOffset.left;
            pos.top -= this.wrapperOffset.top;

            // if offsetX/Y are true we center the element to the screen
            if (offsetX === true) {
                offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
            }
            if (offsetY === true) {
                offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
            }

            pos.left -= offsetX || 0;
            pos.top -= offsetY || 0;

            pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
            pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;

            time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;

            this.scrollTo(pos.left, pos.top, time, easing);
        },

        _transitionTime: function(time) {
            time = time || 0;

            this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

            if (!time && utils.isBadAndroid) {
                this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
            }


            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].transitionTime(time);
                }
            }


            // INSERT POINT: _transitionTime

        },

        _transitionTimingFunction: function(easing) {
            this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].transitionTimingFunction(easing);
                }
            }


            // INSERT POINT: _transitionTimingFunction

        },

        _translate: function(x, y) {
            if (this.options.useTransform) {

                /* REPLACE START: _translate */

                this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

                /* REPLACE END: _translate */

            } else {
                x = Math.round(x);
                y = Math.round(y);
                this.scrollerStyle.left = x + 'px';
                this.scrollerStyle.top = y + 'px';
            }

            this.x = x;
            this.y = y;


            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].updatePosition();
                }
            }


            // INSERT POINT: _translate

        },

        _initEvents: function(remove) {
            var eventType = remove ? utils.removeEvent : utils.addEvent,
                target = this.options.bindToWrapper ? this.wrapper : window;

            eventType(window, 'orientationchange', this);
            eventType(window, 'resize', this);

            if (this.options.click) {
                eventType(this.wrapper, 'click', this, true);
            }

            if (!this.options.disableMouse) {
                eventType(this.wrapper, 'mousedown', this);
                eventType(target, 'mousemove', this);
                eventType(target, 'mousecancel', this);
                eventType(target, 'mouseup', this);
            }

            if (utils.hasPointer && !this.options.disablePointer) {
                eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
                eventType(target, utils.prefixPointerEvent('pointermove'), this);
                eventType(target, utils.prefixPointerEvent('pointercancel'), this);
                eventType(target, utils.prefixPointerEvent('pointerup'), this);
            }

            if (utils.hasTouch && !this.options.disableTouch) {
                eventType(this.wrapper, 'touchstart', this);
                eventType(target, 'touchmove', this);
                eventType(target, 'touchcancel', this);
                eventType(target, 'touchend', this);
            }

            eventType(this.scroller, 'transitionend', this);
            eventType(this.scroller, 'webkitTransitionEnd', this);
            eventType(this.scroller, 'oTransitionEnd', this);
            eventType(this.scroller, 'MSTransitionEnd', this);
        },

        getComputedPosition: function() {
            var matrix = window.getComputedStyle(this.scroller, null),
                x, y;

            if (this.options.useTransform) {
                matrix = matrix[utils.style.transform].split(')')[0].split(', ');
                x = +(matrix[12] || matrix[4]);
                y = +(matrix[13] || matrix[5]);
            } else {
                x = +matrix.left.replace(/[^-\d.]/g, '');
                y = +matrix.top.replace(/[^-\d.]/g, '');
            }

            return {
                x: x,
                y: y
            };
        },

        _initIndicators: function() {
            var interactive = this.options.interactiveScrollbars,
                customStyle = typeof this.options.scrollbars !== 'string',
                indicators = [],
                indicator;

            var that = this;

            this.indicators = [];

            if (this.options.scrollbars) {
                // Vertical scrollbar
                if (this.options.scrollY) {
                    indicator = {
                        el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenX: false
                    };

                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }

                // Horizontal scrollbar
                if (this.options.scrollX) {
                    indicator = {
                        el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenY: false
                    };

                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }
            }

            if (this.options.indicators) {
                // TODO: check concat compatibility
                indicators = indicators.concat(this.options.indicators);
            }

            for (var i = indicators.length; i--;) {
                this.indicators.push(new Indicator(this, indicators[i]));
            }

            // TODO: check if we can use array.map (wide compatibility and performance issues)
            function _indicatorsMap(fn) {
                for (var i = that.indicators.length; i--;) {
                    fn.call(that.indicators[i]);
                }
            }

            if (this.options.fadeScrollbars) {
                this.on('scrollEnd', function() {
                    _indicatorsMap(function() {
                        this.fade();
                    });
                });

                this.on('scrollCancel', function() {
                    _indicatorsMap(function() {
                        this.fade();
                    });
                });

                this.on('scrollStart', function() {
                    _indicatorsMap(function() {
                        this.fade(1);
                    });
                });

                this.on('beforeScrollStart', function() {
                    _indicatorsMap(function() {
                        this.fade(1, true);
                    });
                });
            }


            this.on('refresh', function() {
                _indicatorsMap(function() {
                    this.refresh();
                });
            });

            this.on('destroy', function() {
                _indicatorsMap(function() {
                    this.destroy();
                });

                delete this.indicators;
            });
        },

        _initWheel: function() {
            utils.addEvent(this.wrapper, 'wheel', this);
            utils.addEvent(this.wrapper, 'mousewheel', this);
            utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

            this.on('destroy', function() {
                utils.removeEvent(this.wrapper, 'wheel', this);
                utils.removeEvent(this.wrapper, 'mousewheel', this);
                utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
            });
        },

        _wheel: function(e) {
            if (!this.enabled) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            var wheelDeltaX, wheelDeltaY,
                newX, newY,
                that = this;

            if (this.wheelTimeout === undefined) {
                that._execEvent('scrollStart');
            }

            // Execute the scrollEnd event after 400ms the wheel stopped scrolling
            clearTimeout(this.wheelTimeout);
            this.wheelTimeout = setTimeout(function() {
                that._execEvent('scrollEnd');
                that.wheelTimeout = undefined;
            }, 400);

            if ('deltaX' in e) {
                if (e.deltaMode === 1) {
                    wheelDeltaX = -e.deltaX * this.options.mouseWheelSpeed;
                    wheelDeltaY = -e.deltaY * this.options.mouseWheelSpeed;
                } else {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                }
            } else if ('wheelDeltaX' in e) {
                wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
                wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
            } else if ('wheelDelta' in e) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
            } else if ('detail' in e) {
                wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
            } else {
                return;
            }

            wheelDeltaX *= this.options.invertWheelDirection;
            wheelDeltaY *= this.options.invertWheelDirection;

            if (!this.hasVerticalScroll) {
                wheelDeltaX = wheelDeltaY;
                wheelDeltaY = 0;
            }

            if (this.options.snap) {
                newX = this.currentPage.pageX;
                newY = this.currentPage.pageY;

                if (wheelDeltaX > 0) {
                    newX--;
                } else if (wheelDeltaX < 0) {
                    newX++;
                }

                if (wheelDeltaY > 0) {
                    newY--;
                } else if (wheelDeltaY < 0) {
                    newY++;
                }

                this.goToPage(newX, newY);

                return;
            }

            newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
            newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

            if (newX > 0) {
                newX = 0;
            } else if (newX < this.maxScrollX) {
                newX = this.maxScrollX;
            }

            if (newY > 0) {
                newY = 0;
            } else if (newY < this.maxScrollY) {
                newY = this.maxScrollY;
            }

            this.scrollTo(newX, newY, 0);

            this._execEvent('scroll');

            // INSERT POINT: _wheel
        },

        _initSnap: function() {
            this.currentPage = {};

            if (typeof this.options.snap === 'string') {
                this.options.snap = this.scroller.querySelectorAll(this.options.snap);
            }

            this.on('refresh', function() {
                var i = 0,
                    l,
                    m = 0,
                    n,
                    cx, cy,
                    x = 0,
                    y,
                    stepX = this.options.snapStepX || this.wrapperWidth,
                    stepY = this.options.snapStepY || this.wrapperHeight,
                    el;

                this.pages = [];

                if (!this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight) {
                    return;
                }

                if (this.options.snap === true) {
                    cx = Math.round(stepX / 2);
                    cy = Math.round(stepY / 2);

                    while (x > -this.scrollerWidth) {
                        this.pages[i] = [];
                        l = 0;
                        y = 0;

                        while (y > -this.scrollerHeight) {
                            this.pages[i][l] = {
                                x: Math.max(x, this.maxScrollX),
                                y: Math.max(y, this.maxScrollY),
                                width: stepX,
                                height: stepY,
                                cx: x - cx,
                                cy: y - cy
                            };

                            y -= stepY;
                            l++;
                        }

                        x -= stepX;
                        i++;
                    }
                } else {
                    el = this.options.snap;
                    l = el.length;
                    n = -1;

                    for (; i < l; i++) {
                        if (i === 0 || el[i].offsetLeft <= el[i - 1].offsetLeft) {
                            m = 0;
                            n++;
                        }

                        if (!this.pages[m]) {
                            this.pages[m] = [];
                        }

                        x = Math.max(-el[i].offsetLeft, this.maxScrollX);
                        y = Math.max(-el[i].offsetTop, this.maxScrollY);
                        cx = x - Math.round(el[i].offsetWidth / 2);
                        cy = y - Math.round(el[i].offsetHeight / 2);

                        this.pages[m][n] = {
                            x: x,
                            y: y,
                            width: el[i].offsetWidth,
                            height: el[i].offsetHeight,
                            cx: cx,
                            cy: cy
                        };

                        if (x > this.maxScrollX) {
                            m++;
                        }
                    }
                }

                this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

                // Update snap threshold if needed
                if (this.options.snapThreshold % 1 === 0) {
                    this.snapThresholdX = this.options.snapThreshold;
                    this.snapThresholdY = this.options.snapThreshold;
                } else {
                    this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
                    this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
                }
            });

            this.on('flick', function() {
                var time = this.options.snapSpeed || Math.max(
                    Math.max(
                        Math.min(Math.abs(this.x - this.startX), 1000),
                        Math.min(Math.abs(this.y - this.startY), 1000)
                    ), 300);

                this.goToPage(
                    this.currentPage.pageX + this.directionX,
                    this.currentPage.pageY + this.directionY,
                    time
                );
            });
        },

        _nearestSnap: function(x, y) {
            if (!this.pages.length) {
                return {
                    x: 0,
                    y: 0,
                    pageX: 0,
                    pageY: 0
                };
            }

            var i = 0,
                l = this.pages.length,
                m = 0;

            // Check if we exceeded the snap threshold
            if (Math.abs(x - this.absStartX) < this.snapThresholdX &&
                Math.abs(y - this.absStartY) < this.snapThresholdY) {
                return this.currentPage;
            }

            if (x > 0) {
                x = 0;
            } else if (x < this.maxScrollX) {
                x = this.maxScrollX;
            }

            if (y > 0) {
                y = 0;
            } else if (y < this.maxScrollY) {
                y = this.maxScrollY;
            }

            for (; i < l; i++) {
                if (x >= this.pages[i][0].cx) {
                    x = this.pages[i][0].x;
                    break;
                }
            }

            l = this.pages[i].length;

            for (; m < l; m++) {
                if (y >= this.pages[0][m].cy) {
                    y = this.pages[0][m].y;
                    break;
                }
            }

            if (i === this.currentPage.pageX) {
                i += this.directionX;

                if (i < 0) {
                    i = 0;
                } else if (i >= this.pages.length) {
                    i = this.pages.length - 1;
                }

                x = this.pages[i][0].x;
            }

            if (m === this.currentPage.pageY) {
                m += this.directionY;

                if (m < 0) {
                    m = 0;
                } else if (m >= this.pages[0].length) {
                    m = this.pages[0].length - 1;
                }

                y = this.pages[0][m].y;
            }

            return {
                x: x,
                y: y,
                pageX: i,
                pageY: m
            };
        },

        goToPage: function(x, y, time, easing) {
            easing = easing || this.options.bounceEasing;

            if (x >= this.pages.length) {
                x = this.pages.length - 1;
            } else if (x < 0) {
                x = 0;
            }

            if (y >= this.pages[x].length) {
                y = this.pages[x].length - 1;
            } else if (y < 0) {
                y = 0;
            }

            var posX = this.pages[x][y].x,
                posY = this.pages[x][y].y;

            time = time === undefined ? this.options.snapSpeed || Math.max(
                Math.max(
                    Math.min(Math.abs(posX - this.x), 1000),
                    Math.min(Math.abs(posY - this.y), 1000)
                ), 300) : time;

            this.currentPage = {
                x: posX,
                y: posY,
                pageX: x,
                pageY: y
            };

            this.scrollTo(posX, posY, time, easing);
        },

        next: function(time, easing) {
            var x = this.currentPage.pageX,
                y = this.currentPage.pageY;

            x++;

            if (x >= this.pages.length && this.hasVerticalScroll) {
                x = 0;
                y++;
            }

            this.goToPage(x, y, time, easing);
        },

        prev: function(time, easing) {
            var x = this.currentPage.pageX,
                y = this.currentPage.pageY;

            x--;

            if (x < 0 && this.hasVerticalScroll) {
                x = 0;
                y--;
            }

            this.goToPage(x, y, time, easing);
        },

        _initKeys: function() {
            // default key bindings
            var keys = {
                pageUp: 33,
                pageDown: 34,
                end: 35,
                home: 36,
                left: 37,
                up: 38,
                right: 39,
                down: 40
            };
            var i;

            // if you give me characters I give you keycode
            if (typeof this.options.keyBindings === 'object') {
                for (i in this.options.keyBindings) {
                    if (typeof this.options.keyBindings[i] === 'string') {
                        this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
                    }
                }
            } else {
                this.options.keyBindings = {};
            }

            for (i in keys) { // jshint ignore:line
                    this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
            }

            utils.addEvent(window, 'keydown', this);

            this.on('destroy', function() {
                utils.removeEvent(window, 'keydown', this);
            });
        },

        _key: function(e) {
            if (!this.enabled) {
                return;
            }

            var snap = this.options.snap, // we are using this alot, better to cache it
                newX = snap ? this.currentPage.pageX : this.x,
                newY = snap ? this.currentPage.pageY : this.y,
                now = utils.getTime(),
                prevTime = this.keyTime || 0,
                acceleration = 0.250,
                pos;

            if (this.options.useTransition && this.isInTransition) {
                pos = this.getComputedPosition();

                this._translate(Math.round(pos.x), Math.round(pos.y));
                this.isInTransition = false;
            }

            this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

            switch (e.keyCode) {
                case this.options.keyBindings.pageUp:
                    if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                        newX += snap ? 1 : this.wrapperWidth;
                    } else {
                        newY += snap ? 1 : this.wrapperHeight;
                    }
                    break;
                case this.options.keyBindings.pageDown:
                    if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                        newX -= snap ? 1 : this.wrapperWidth;
                    } else {
                        newY -= snap ? 1 : this.wrapperHeight;
                    }
                    break;
                case this.options.keyBindings.end:
                    newX = snap ? this.pages.length - 1 : this.maxScrollX;
                    newY = snap ? this.pages[0].length - 1 : this.maxScrollY;
                    break;
                case this.options.keyBindings.home:
                    newX = 0;
                    newY = 0;
                    break;
                case this.options.keyBindings.left:
                    newX += snap ? -1 : 5 + this.keyAcceleration >> 0; // jshint ignore:line
                    break;
                case this.options.keyBindings.up:
                    newY += snap ? 1 : 5 + this.keyAcceleration >> 0; // jshint ignore:line
                    break;
                case this.options.keyBindings.right:
                    newX -= snap ? -1 : 5 + this.keyAcceleration >> 0; // jshint ignore:line
                    break;
                case this.options.keyBindings.down:
                    newY -= snap ? 1 : 5 + this.keyAcceleration >> 0; // jshint ignore:line
                    break;
                default:
                    return;
            }

            if (snap) {
                this.goToPage(newX, newY);
                return;
            }

            if (newX > 0) {
                newX = 0;
                this.keyAcceleration = 0;
            } else if (newX < this.maxScrollX) {
                newX = this.maxScrollX;
                this.keyAcceleration = 0;
            }

            if (newY > 0) {
                newY = 0;
                this.keyAcceleration = 0;
            } else if (newY < this.maxScrollY) {
                newY = this.maxScrollY;
                this.keyAcceleration = 0;
            }

            this.scrollTo(newX, newY, 0);

            this.keyTime = now;
        },

        _animate: function(destX, destY, duration, easingFn) {
            var that = this,
                startX = this.x,
                startY = this.y,
                startTime = utils.getTime(),
                destTime = startTime + duration;

            function step() {
                var now = utils.getTime(),
                    newX, newY,
                    easing;

                if (now >= destTime) {
                    that.isAnimating = false;
                    that._translate(destX, destY);

                    if (!that.resetPosition(that.options.bounceTime)) {
                        that._execEvent('scrollEnd');
                    }

                    return;
                }

                now = (now - startTime) / duration;
                easing = easingFn(now);
                newX = (destX - startX) * easing + startX;
                newY = (destY - startY) * easing + startY;
                that._translate(newX, newY);

                if (that.isAnimating) {
                    rAF(step);
                }

                if (that.options.probeType === 3) {
                    that._execEvent('scroll');
                }
            }

            this.isAnimating = true;
            step();
        },

        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                case 'pointerdown':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'pointermove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'pointerup':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'pointercancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    this._resize();
                    break;
                case 'transitionend':
                case 'webkitTransitionEnd':
                case 'oTransitionEnd':
                case 'MSTransitionEnd':
                    this._transitionEnd(e);
                    break;
                case 'wheel':
                case 'DOMMouseScroll':
                case 'mousewheel':
                    this._wheel(e);
                    break;
                case 'keydown':
                    this._key(e);
                    break;
                case 'click':
                    if (!e._constructed) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    break;
            }
        }
    };

    function createDefaultScrollbar(direction, interactive, type) {
        var scrollbar = document.createElement('div'),
            indicator = document.createElement('div');

        if (type === true) {
            scrollbar.style.cssText = 'position:absolute;z-index:9999';
            indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
        }

        indicator.className = 'iScrollIndicator';

        if (direction === 'h') {
            if (type === true) {
                scrollbar.style.cssText += ';height:5px;left:2px;right:2px;bottom:0';
                indicator.style.height = '100%';
            }
            scrollbar.className = 'iScrollHorizontalScrollbar';
        } else {
            if (type === true) {
                scrollbar.style.cssText += ';width:5px;bottom:2px;top:2px;right:1px';
                indicator.style.width = '100%';
            }
            scrollbar.className = 'iScrollVerticalScrollbar';
        }

        scrollbar.style.cssText += ';overflow:hidden';

        if (!interactive) {
            scrollbar.style.pointerEvents = 'none';
        }

        scrollbar.appendChild(indicator);

        return scrollbar;
    }

    function Indicator(scroller, options) {
        this.wrapper = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
        this.wrapperStyle = this.wrapper.style;
        this.indicator = this.wrapper.children[0];
        this.indicatorStyle = this.indicator.style;
        this.scroller = scroller;

        this.options = {
            listenX: true,
            listenY: true,
            interactive: false,
            resize: true,
            defaultScrollbars: false,
            shrink: false,
            fade: false,
            speedRatioX: 0,
            speedRatioY: 0
        };

        for (var i in options) { // jshint ignore:line
                this.options[i] = options[i];

        }

        this.sizeRatioX = 1;
        this.sizeRatioY = 1;
        this.maxPosX = 0;
        this.maxPosY = 0;

        if (this.options.interactive) {
            if (!this.options.disableTouch) {
                utils.addEvent(this.indicator, 'touchstart', this);
                utils.addEvent(window, 'touchend', this);
            }
            if (!this.options.disablePointer) {
                utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
            }
            if (!this.options.disableMouse) {
                utils.addEvent(this.indicator, 'mousedown', this);
                utils.addEvent(window, 'mouseup', this);
            }
        }

        if (this.options.fade) {
            this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
            this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
            this.wrapperStyle.opacity = '0';
        }
    }

    Indicator.prototype = {
        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                case 'pointerdown':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'pointermove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'pointerup':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'pointercancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
            }
        },

        destroy: function() {
            if (this.options.interactive) {
                utils.removeEvent(this.indicator, 'touchstart', this);
                utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                utils.removeEvent(this.indicator, 'mousedown', this);

                utils.removeEvent(window, 'touchmove', this);
                utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
                utils.removeEvent(window, 'mousemove', this);

                utils.removeEvent(window, 'touchend', this);
                utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
                utils.removeEvent(window, 'mouseup', this);
            }

            if (this.options.defaultScrollbars) {
                this.wrapper.parentNode.removeChild(this.wrapper);
            }
        },

        _start: function(e) {
            var point = e.touches ? e.touches[0] : e;

            e.preventDefault();
            e.stopPropagation();

            this.transitionTime();

            this.initiated = true;
            this.moved = false;
            this.lastPointX = point.pageX;
            this.lastPointY = point.pageY;

            this.startTime = utils.getTime();

            if (!this.options.disableTouch) {
                utils.addEvent(window, 'touchmove', this);
            }
            if (!this.options.disablePointer) {
                utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
            }
            if (!this.options.disableMouse) {
                utils.addEvent(window, 'mousemove', this);
            }

            this.scroller._execEvent('beforeScrollStart');
        },

        _move: function(e) {
            var point = e.touches ? e.touches[0] : e,
                deltaX, deltaY,
                newX, newY,
                timestamp = utils.getTime();

            if (!this.moved) {
                this.scroller._execEvent('scrollStart');
            }

            this.moved = true;

            deltaX = point.pageX - this.lastPointX;
            this.lastPointX = point.pageX;

            deltaY = point.pageY - this.lastPointY;
            this.lastPointY = point.pageY;

            newX = this.x + deltaX;
            newY = this.y + deltaY;

            this._pos(newX, newY);


            if (this.scroller.options.probeType === 1 && timestamp - this.startTime > 300) {
                this.startTime = timestamp;
                this.scroller._execEvent('scroll');
            } else if (this.scroller.options.probeType > 1) {
                this.scroller._execEvent('scroll');
            }


            // INSERT POINT: indicator._move

            e.preventDefault();
            e.stopPropagation();
        },

        _end: function(e) {
            if (!this.initiated) {
                return;
            }

            this.initiated = false;

            e.preventDefault();
            e.stopPropagation();

            utils.removeEvent(window, 'touchmove', this);
            utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
            utils.removeEvent(window, 'mousemove', this);

            if (this.scroller.options.snap) {
                var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

                var time = this.options.snapSpeed || Math.max(
                    Math.max(
                        Math.min(Math.abs(this.scroller.x - snap.x), 1000),
                        Math.min(Math.abs(this.scroller.y - snap.y), 1000)
                    ), 300);

                if (this.scroller.x !== snap.x || this.scroller.y !== snap.y) {
                    this.scroller.directionX = 0;
                    this.scroller.directionY = 0;
                    this.scroller.currentPage = snap;
                    this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
                }
            }

            if (this.moved) {
                this.scroller._execEvent('scrollEnd');
            }
        },

        transitionTime: function(time) {
            time = time || 0;
            this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

            if (!time && utils.isBadAndroid) {
                this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
            }
        },

        transitionTimingFunction: function(easing) {
            this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
        },

        refresh: function() {
            this.transitionTime();

            if (this.options.listenX && !this.options.listenY) {
                this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
            } else if (this.options.listenY && !this.options.listenX) {
                this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
            } else {
                this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
            }

            if (this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll) {
                utils.addClass(this.wrapper, 'iScrollBothScrollbars');
                utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

                if (this.options.defaultScrollbars && this.options.customStyle) {
                    if (this.options.listenX) {
                        this.wrapper.style.right = '8px';
                    } else {
                        this.wrapper.style.bottom = '8px';
                    }
                }
            } else {
                utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
                utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

                if (this.options.defaultScrollbars && this.options.customStyle) {
                    if (this.options.listenX) {
                        this.wrapper.style.right = '2px';
                    } else {
                        this.wrapper.style.bottom = '2px';
                    }
                }
            }

            // var r = this.wrapper.offsetHeight; // force refresh

            if (this.options.listenX) {
                this.wrapperWidth = this.wrapper.clientWidth;
                if (this.options.resize) {
                    this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
                    this.indicatorStyle.width = this.indicatorWidth + 'px';
                } else {
                    this.indicatorWidth = this.indicator.clientWidth;
                }

                this.maxPosX = this.wrapperWidth - this.indicatorWidth;

                if (this.options.shrink === 'clip') {
                    this.minBoundaryX = -this.indicatorWidth + 8;
                    this.maxBoundaryX = this.wrapperWidth - 8;
                } else {
                    this.minBoundaryX = 0;
                    this.maxBoundaryX = this.maxPosX;
                }

                this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
            }

            if (this.options.listenY) {
                this.wrapperHeight = this.wrapper.clientHeight;
                if (this.options.resize) {
                    this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
                    this.indicatorStyle.height = this.indicatorHeight + 'px';
                } else {
                    this.indicatorHeight = this.indicator.clientHeight;
                }

                this.maxPosY = this.wrapperHeight - this.indicatorHeight;

                if (this.options.shrink === 'clip') {
                    this.minBoundaryY = -this.indicatorHeight + 8;
                    this.maxBoundaryY = this.wrapperHeight - 8;
                } else {
                    this.minBoundaryY = 0;
                    this.maxBoundaryY = this.maxPosY;
                }

                this.maxPosY = this.wrapperHeight - this.indicatorHeight;
                this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
            }

            this.updatePosition();
        },

        updatePosition: function() {
            var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
                y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

            if (!this.options.ignoreBoundaries) {
                if (x < this.minBoundaryX) {
                    if (this.options.shrink === 'scale') {
                        this.width = Math.max(this.indicatorWidth + x, 8);
                        this.indicatorStyle.width = this.width + 'px';
                    }
                    x = this.minBoundaryX;
                } else if (x > this.maxBoundaryX) {
                    if (this.options.shrink === 'scale') {
                        this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
                        this.indicatorStyle.width = this.width + 'px';
                        x = this.maxPosX + this.indicatorWidth - this.width;
                    } else {
                        x = this.maxBoundaryX;
                    }
                } else if (this.options.shrink === 'scale' && this.width !== this.indicatorWidth) {
                    this.width = this.indicatorWidth;
                    this.indicatorStyle.width = this.width + 'px';
                }

                if (y < this.minBoundaryY) {
                    if (this.options.shrink === 'scale') {
                        this.height = Math.max(this.indicatorHeight + y * 3, 8);
                        this.indicatorStyle.height = this.height + 'px';
                    }
                    y = this.minBoundaryY;
                } else if (y > this.maxBoundaryY) {
                    if (this.options.shrink === 'scale') {
                        this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
                        this.indicatorStyle.height = this.height + 'px';
                        y = this.maxPosY + this.indicatorHeight - this.height;
                    } else {
                        y = this.maxBoundaryY;
                    }
                } else if (this.options.shrink === 'scale' && this.height !== this.indicatorHeight) {
                    this.height = this.indicatorHeight;
                    this.indicatorStyle.height = this.height + 'px';
                }
            }

            this.x = x;
            this.y = y;

            if (this.scroller.options.useTransform) {
                this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
            } else {
                this.indicatorStyle.left = x + 'px';
                this.indicatorStyle.top = y + 'px';
            }
        },

        _pos: function(x, y) {
            if (x < 0) {
                x = 0;
            } else if (x > this.maxPosX) {
                x = this.maxPosX;
            }

            if (y < 0) {
                y = 0;
            } else if (y > this.maxPosY) {
                y = this.maxPosY;
            }

            x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
            y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

            this.scroller.scrollTo(x, y);
        },

        fade: function(val, hold) {
            if (hold && !this.visible) {
                return;
            }

            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;

            var time = val ? 250 : 500,
                delay = val ? 0 : 300;

            val = val ? '1' : '0';

            this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

            this.fadeTimeout = setTimeout((function(val) {
                this.wrapperStyle.opacity = val;
                this.visible = +val;
            }).bind(this, val), delay);
        }
    };

    IScroll.utils = utils;

    window.IScroll = IScroll;
}(window);

/* ===============================================================================
************   scroller   ************
=============================================================================== */
+ function($) {
    "use strict";
    //重置zepto自带的滚动条
    var _zeptoMethodCache = {
        "scrollTop": $.fn.scrollTop,
        "scrollLeft": $.fn.scrollLeft
    };
    //重置scrollLeft和scrollRight
    (function() {
        $.extend($.fn, {
            scrollTop: function(top, dur) {
                if (!this.length) return;
                var scroller = this.data('scroller');
                if (scroller && scroller.scroller) { //js滚动
                    return scroller.scrollTop(top, dur);
                } else {
                    return _zeptoMethodCache.scrollTop.apply(this, arguments);
                }
            }
        });
        $.extend($.fn, {
            scrollLeft: function(left, dur) {
                if (!this.length) return;
                var scroller = this.data('scroller');
                if (scroller && scroller.scroller) { //js滚动
                    return scroller.scrollLeft(left, dur);
                } else {
                    return _zeptoMethodCache.scrollLeft.apply(this, arguments);
                }
            }
        });
    })();



    //自定义的滚动条
    var Scroller = function(pageContent, _options) {
        var $pageContent = this.$pageContent = $(pageContent);

        this.options = $.extend({}, this._defaults, _options);

        var type = this.options.type;
        //auto的type,系统版本的小于4.4.0的安卓设备和系统版本小于6.0.0的ios设备，启用js版的iscoll
        var useJSScroller = (type === 'js') || (type === 'auto' && ($.device.android && $.compareVersion('4.4.0', $.device.osVersion) > -1) || (type === 'auto' && ($.device.ios && $.compareVersion('6.0.0', $.device.osVersion) > -1)));

        if (useJSScroller) {

            var $pageContentInner = $pageContent.find('.content-inner');
            //如果滚动内容没有被包裹，自动添加wrap
            if (!$pageContentInner[0]) {
                // $pageContent.html('<div class="content-inner">' + $pageContent.html() + '</div>');
                var children = $pageContent.children();
                if (children.length < 1) {
                    $pageContent.children().wrapAll('<div class="content-inner"></div>');
                } else {
                    $pageContent.html('<div class="content-inner">' + $pageContent.html() + '</div>');
                }
            }

            if ($pageContent.hasClass('pull-to-refresh-content')) {
                //因为iscroll 当页面高度不足 100% 时无法滑动，所以无法触发下拉动作，这里改动一下高度
                //区分是否有.bar容器，如有，则content的top:0，无则content的top:-2.2rem,这里取2.2rem的最大值，近60
                var minHeight = $(window).height() + ($pageContent.prev().hasClass(".bar") ? 1 : 61);
                $pageContent.find('.content-inner').css('min-height', minHeight + 'px');
            }

            var ptr = $(pageContent).hasClass('pull-to-refresh-content');
            //js滚动模式，用transform移动内容区位置，会导致fixed失效，表现类似absolute。因此禁用transform模式
            var useTransform = $pageContent.find('.fixed-tab').length === 0;
            var options = {
                probeType: 1,
                mouseWheel: true,
                //解决安卓js模式下，刷新滚动条后绑定的事件不响应，对chrome内核浏览器设置click:true
                click: $.device.androidChrome,
                useTransform: useTransform,
                //js模式下允许滚动条横向滚动，但是需要注意，滚动容易宽度必须大于屏幕宽度滚动才生效
                scrollX: true
            };
            if (ptr) {
                options.ptr = true;
                options.ptrOffset = 44;
            }
            //如果用js滚动条，用transform计算内容区位置，position：fixed将实效。若有.fixed-tab，强制使用native滚动条；备选方案，略粗暴
            // if($(pageContent).find('.fixed-tab').length>0){
            //     $pageContent.addClass('native-scroll');
            //     return;
            // }
            this.scroller = new IScroll(pageContent, options); // jshint ignore:line
            //和native滚动统一起来
            this._bindEventToDomWhenJs();
            $.initPullToRefresh = $._pullToRefreshJSScroll.initPullToRefresh;
            $.pullToRefreshDone = $._pullToRefreshJSScroll.pullToRefreshDone;
            $.pullToRefreshTrigger = $._pullToRefreshJSScroll.pullToRefreshTrigger;
            $.destroyToRefresh = $._pullToRefreshJSScroll.destroyToRefresh;
            $pageContent.addClass('javascript-scroll');
            if (!useTransform) {
                $pageContent.find('.content-inner').css({
                    width: '100%',
                    position: 'absolute'
                });
            }

            //如果页面本身已经进行了原生滚动，那么把这个滚动换成JS的滚动
            var nativeScrollTop = this.$pageContent[0].scrollTop;
            if(nativeScrollTop) {
                this.$pageContent[0].scrollTop = 0;
                this.scrollTop(nativeScrollTop);
            }
        } else {
            $pageContent.addClass('native-scroll');
        }
    };
    Scroller.prototype = {
        _defaults: {
            type: 'native',
        },
        _bindEventToDomWhenJs: function() {
            //"scrollStart", //the scroll started.
            //"scroll", //the content is scrolling. Available only in scroll-probe.js edition. See onScroll event.
            //"scrollEnd", //content stopped scrolling.
            if (this.scroller) {
                var self = this;
                this.scroller.on('scrollStart', function() {
                    self.$pageContent.trigger('scrollstart');
                });
                this.scroller.on('scroll', function() {
                    self.$pageContent.trigger('scroll');
                });
                this.scroller.on('scrollEnd', function() {
                    self.$pageContent.trigger('scrollend');
                });
            } else {
                //TODO: 实现native的scrollStart和scrollEnd
            }
        },
        scrollTop: function(top, dur) {
            if (this.scroller) {
                if (top !== undefined) {
                    this.scroller.scrollTo(0, -1 * top, dur);
                } else {
                    return this.scroller.getComputedPosition().y * -1;
                }
            } else {
                return this.$pageContent.scrollTop(top, dur);
            }
            return this;
        },
        scrollLeft: function(left, dur) {
            if (this.scroller) {
                if (left !== undefined) {
                    this.scroller.scrollTo(-1 * left, 0);
                } else {
                    return this.scroller.getComputedPosition().x * -1;
                }
            } else {
                return this.$pageContent.scrollTop(left, dur);
            }
            return this;
        },
        on: function(event, callback) {
            if (this.scroller) {
                this.scroller.on(event, function() {
                    callback.call(this.wrapper);
                });
            } else {
                this.$pageContent.on(event, callback);
            }
            return this;
        },
        off: function(event, callback) {
            if (this.scroller) {
                this.scroller.off(event, callback);
            } else {
                this.$pageContent.off(event, callback);
            }
            return this;
        },
        refresh: function() {
            if (this.scroller) this.scroller.refresh();
            return this;
        },
        scrollHeight: function() {
            if (this.scroller) {
                return this.scroller.scrollerHeight;
            } else {
                return this.$pageContent[0].scrollHeight;
            }
        }

    };

    //Scroller PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;

        this.each(function() {

            var $this = $(this);

            var options = $.extend({}, $this.dataset(), typeof option === 'object' && option);

            var data = $this.data('scroller');
            //如果 scroller 没有被初始化，对scroller 进行初始化r
            if (!data) {
                //获取data-api的
                $this.data('scroller', (data = new Scroller(this, options)));

            }
            if (typeof option === 'string' && typeof data[option] === 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined)
            return false;
            }

        });

        if (internal_return !== undefined)
            return internal_return;
        else
            return this;

    }

    var old = $.fn.scroller;

    $.fn.scroller = Plugin;
    $.fn.scroller.Constructor = Scroller;


    // Scroll NO CONFLICT
    // =================

    $.fn.scroller.noConflict = function() {
        $.fn.scroller = old;
        return this;
    };
    //添加data-api
    $(function() {
        $('[data-toggle="scroller"]').scroller();
    });

    //统一的接口,带有 .javascript-scroll 的content 进行刷新
    $.refreshScroller = function(content) {
        if (content) {
            $(content).scroller('refresh');
        } else {
            $('.javascript-scroll').each(function() {
                $(this).scroller('refresh');
            });
        }

    };
    //全局初始化方法，会对页面上的 [data-toggle="scroller"]，.content. 进行滚动条初始化
    $.initScroller = function(option) {
        this.options = $.extend({}, typeof option === 'object' && option);
        $('[data-toggle="scroller"],.content').scroller(option);
    };
    //获取scroller对象
    $.getScroller = function(content) {
        //以前默认只能有一个无限滚动，因此infinitescroll都是加在content上，现在允许里面有多个，因此要判断父元素是否有content
        content = content.hasClass('content') ? content : content.parents('.content');
        if (content) {
            return $(content).data('scroller');
        } else {
            return $('.content.javascript-scroll').data('scroller');
        }
    };
    //检测滚动类型,
    //‘js’: javascript 滚动条
    //‘native’: 原生滚动条
    $.detectScrollerType = function(content) {
        if (content) {
            if ($(content).data('scroller') && $(content).data('scroller').scroller) {
                return 'js';
            } else {
                return 'native';
            }
        }
    };

}(Zepto);

/* ===============================================================================
************   Tabs   ************
=============================================================================== */
+function ($) {
    "use strict";

    var showTab = function (tab, tabLink, force) {
        var newTab = $(tab);
        if (arguments.length === 2) {
            if (typeof tabLink === 'boolean') {
                force = tabLink;
            }
        }
        if (newTab.length === 0) return false;
        if (newTab.hasClass('active')) {
            if (force) newTab.trigger('show');
            return false;
        }
        var tabs = newTab.parent('.tabs');
        if (tabs.length === 0) return false;

        // Animated tabs
        /*var isAnimatedTabs = tabs.parent().hasClass('tabs-animated-wrap');
          if (isAnimatedTabs) {
          tabs.transform('translate3d(' + -newTab.index() * 100 + '%,0,0)');
          }*/

        // Remove active class from old tabs
        var oldTab = tabs.children('.tab.active').removeClass('active');
        // Add active class to new tab
        newTab.addClass('active');
        // Trigger 'show' event on new tab
        newTab.trigger('show');

        // Update navbars in new tab
        /*if (!isAnimatedTabs && newTab.find('.navbar').length > 0) {
        // Find tab's view
        var viewContainer;
        if (newTab.hasClass(app.params.viewClass)) viewContainer = newTab[0];
        else viewContainer = newTab.parents('.' + app.params.viewClass)[0];
        app.sizeNavbars(viewContainer);
        }*/

        // Find related link for new tab
        if (tabLink) tabLink = $(tabLink);
        else {
            // Search by id
            if (typeof tab === 'string') tabLink = $('.tab-link[href="' + tab + '"]');
            else tabLink = $('.tab-link[href="#' + newTab.attr('id') + '"]');
            // Search by data-tab
            if (!tabLink || tabLink && tabLink.length === 0) {
                $('[data-tab]').each(function () {
                    if (newTab.is($(this).attr('data-tab'))) tabLink = $(this);
                });
            }
        }
        if (tabLink.length === 0) return;

        // Find related link for old tab
        var oldTabLink;
        if (oldTab && oldTab.length > 0) {
            // Search by id
            var oldTabId = oldTab.attr('id');
            if (oldTabId) oldTabLink = $('.tab-link[href="#' + oldTabId + '"]');
            // Search by data-tab
            if (!oldTabLink || oldTabLink && oldTabLink.length === 0) {
                $('[data-tab]').each(function () {
                    if (oldTab.is($(this).attr('data-tab'))) oldTabLink = $(this);
                });
            }
        }

        // Update links' classes
        if (tabLink && tabLink.length > 0) tabLink.addClass('active');
        if (oldTabLink && oldTabLink.length > 0) oldTabLink.removeClass('active');
        tabLink.trigger('active');

        //app.refreshScroller();

        return true;
    };

    var old = $.showTab;
    $.showTab = showTab;

    $.showTab.noConflict = function () {
        $.showTab = old;
        return this;
    };
    //a标签上的click事件，在iscroll下响应有问题
    $(document).on("click", ".tab-link", function(e) {
        e.preventDefault();
        var clicked = $(this);
        showTab(clicked.data("tab") || clicked.attr('href'), clicked);
    });


}(Zepto);

/* ===============================================================================
************   Tabs   ************
=============================================================================== */
/* +function ($) {
    "use strict";
    $.initFixedTab = function(){
        var $fixedTab = $('.fixed-tab');
        if ($fixedTab.length === 0) return;
        $('.fixed-tab').fixedTab();//默认{offset: 0}
    };
    var FixedTab = function(pageContent, _options) {
        var $pageContent = this.$pageContent = $(pageContent);
        var shadow = $pageContent.clone();
        var fixedTop = $pageContent[0].getBoundingClientRect().top;

        shadow.css('visibility', 'hidden');
        this.options = $.extend({}, this._defaults, {
            fixedTop: fixedTop,
            shadow: shadow,
            offset: 0
        }, _options);

        this._bindEvents();
    };

    FixedTab.prototype = {
        _defaults: {
            offset: 0,
        },
        _bindEvents: function() {
            this.$pageContent.parents('.content').on('scroll', this._scrollHandler.bind(this));
            this.$pageContent.on('active', '.tab-link', this._tabLinkHandler.bind(this));
        },
        _tabLinkHandler: function(ev) {
            var isFixed = $(ev.target).parents('.buttons-fixed').length > 0;
            var fixedTop = this.options.fixedTop;
            var offset = this.options.offset;
            $.refreshScroller();
            if (!isFixed) return;
            this.$pageContent.parents('.content').scrollTop(fixedTop - offset);
        },
        // 滚动核心代码
        _scrollHandler: function(ev) {
            var $scroller = $(ev.target);
            var $pageContent = this.$pageContent;
            var shadow = this.options.shadow;
            var offset = this.options.offset;
            var fixedTop = this.options.fixedTop;
            var scrollTop = $scroller.scrollTop();
            var isFixed = scrollTop >= fixedTop - offset;
            if (isFixed) {
                shadow.insertAfter($pageContent);
                $pageContent.addClass('buttons-fixed').css('top', offset);
            } else {
                shadow.remove();
                $pageContent.removeClass('buttons-fixed').css('top', 0);
            }
        }
    };

    //FixedTab PLUGIN DEFINITION
    // =======================

    function Plugin(option) {
        var args = Array.apply(null, arguments);
        args.shift();
        this.each(function() {
            var $this = $(this);
            var options = $.extend({}, $this.dataset(), typeof option === 'object' && option);
            var data = $this.data('fixedtab');
            if (!data) {
                //获取data-api的
                $this.data('fixedtab', (data = new FixedTab(this, options)));
            }
        });

    }
    $.fn.fixedTab = Plugin;
    $.fn.fixedTab.Constructor = FixedTab;
    $(document).on('pageInit',function(){
        $.initFixedTab();
    });



}(Zepto); */

+ function($) {
    "use strict";
    //这里实在js滚动时使用的下拉刷新代码。

    var refreshTime = 0;
    var initPullToRefreshJS = function(pageContainer) {
        var eventsTarget = $(pageContainer);
        if (!eventsTarget.hasClass('pull-to-refresh-content')) {
            eventsTarget = eventsTarget.find('.pull-to-refresh-content');
        }
        if (!eventsTarget || eventsTarget.length === 0) return;

        var page = eventsTarget.hasClass('content') ? eventsTarget : eventsTarget.parents('.content');
        var scroller = $.getScroller(page[0]);
        if(!scroller) return;


        var container = eventsTarget;

        function handleScroll() {
            if (container.hasClass('refreshing')) return;
            if (scroller.scrollTop() * -1 >= 44) {
                container.removeClass('pull-down').addClass('pull-up');
            } else {
                container.removeClass('pull-up').addClass('pull-down');
            }
        }

        function handleRefresh() {
            if (container.hasClass('refreshing')) return;
            container.removeClass('pull-down pull-up');
            container.addClass('refreshing transitioning');
            container.trigger('refresh');
            refreshTime = +new Date();
        }
        scroller.on('scroll', handleScroll);
        scroller.scroller.on('ptr', handleRefresh);

        // Detach Events on page remove
        function destroyPullToRefresh() {
            scroller.off('scroll', handleScroll);
            scroller.scroller.off('ptr', handleRefresh);
        }
        eventsTarget[0].destroyPullToRefresh = destroyPullToRefresh;

    };

    var pullToRefreshDoneJS = function(container) {
        container = $(container);
        if (container.length === 0) container = $('.pull-to-refresh-content.refreshing');
        if (container.length === 0) return;
        var interval = (+new Date()) - refreshTime;
        var timeOut = interval > 1000 ? 0 : 1000 - interval; //long than bounce time
        var scroller = $.getScroller(container);
        setTimeout(function() {
            scroller.refresh();
            container.removeClass('refreshing');
            container.transitionEnd(function() {
                container.removeClass("transitioning");
            });
        }, timeOut);
    };
    var pullToRefreshTriggerJS = function(container) {
        container = $(container);
        if (container.length === 0) container = $('.pull-to-refresh-content');
        if (container.hasClass('refreshing')) return;
        container.addClass('refreshing');
        var scroller = $.getScroller(container);
        scroller.scrollTop(44 + 1, 200);
        container.trigger('refresh');
    };

    var destroyPullToRefreshJS = function(pageContainer) {
        pageContainer = $(pageContainer);
        var pullToRefreshContent = pageContainer.hasClass('pull-to-refresh-content') ? pageContainer : pageContainer.find('.pull-to-refresh-content');
        if (pullToRefreshContent.length === 0) return;
        if (pullToRefreshContent[0].destroyPullToRefresh) pullToRefreshContent[0].destroyPullToRefresh();
    };

    $._pullToRefreshJSScroll = {
        "initPullToRefresh": initPullToRefreshJS,
        "pullToRefreshDone": pullToRefreshDoneJS,
        "pullToRefreshTrigger": pullToRefreshTriggerJS,
        "destroyPullToRefresh": destroyPullToRefreshJS,
    };
}(Zepto); // jshint ignore:line

+ function($) {
    'use strict';
    $.initPullToRefresh = function(pageContainer) {
        var eventsTarget = $(pageContainer);
        if (!eventsTarget.hasClass('pull-to-refresh-content')) {
            eventsTarget = eventsTarget.find('.pull-to-refresh-content');
        }
        if (!eventsTarget || eventsTarget.length === 0) return;

        var isTouched, isMoved, touchesStart = {},
            isScrolling, touchesDiff, touchStartTime, container, refresh = false,
            useTranslate = false,
            startTranslate = 0,
            translate, scrollTop, wasScrolled, triggerDistance, dynamicTriggerDistance;

        container = eventsTarget;

        // Define trigger distance
        if (container.attr('data-ptr-distance')) {
            dynamicTriggerDistance = true;
        } else {
            triggerDistance = 44;
        }

        function handleTouchStart(e) {
            if (isTouched) {
                if ($.device.android) {
                    if ('targetTouches' in e && e.targetTouches.length > 1) return;
                } else return;
            }
            isMoved = false;
            isTouched = true;
            isScrolling = undefined;
            wasScrolled = undefined;
            touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            touchStartTime = (new Date()).getTime();
            /*jshint validthis:true */
            container = $(this);
        }

        function handleTouchMove(e) {
            if (!isTouched) return;
            var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
            if (typeof isScrolling === 'undefined') {
                isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
            }
            if (!isScrolling) {
                isTouched = false;
                return;
            }

            scrollTop = container[0].scrollTop;
            if (typeof wasScrolled === 'undefined' && scrollTop !== 0) wasScrolled = true;

            if (!isMoved) {
                /*jshint validthis:true */
                container.removeClass('transitioning');
                if (scrollTop > container[0].offsetHeight) {
                    isTouched = false;
                    return;
                }
                if (dynamicTriggerDistance) {
                    triggerDistance = container.attr('data-ptr-distance');
                    if (triggerDistance.indexOf('%') >= 0) triggerDistance = container[0].offsetHeight * parseInt(triggerDistance, 10) / 100;
                }
                startTranslate = container.hasClass('refreshing') ? triggerDistance : 0;
                if (container[0].scrollHeight === container[0].offsetHeight || !$.device.ios) {
                    useTranslate = true;
                } else {
                    useTranslate = false;
                }
                useTranslate = true;
            }
            isMoved = true;
            touchesDiff = pageY - touchesStart.y;

            if (touchesDiff > 0 && scrollTop <= 0 || scrollTop < 0) {
                // iOS 8 fix
                if ($.device.ios && parseInt($.device.osVersion.split('.')[0], 10) > 7 && scrollTop === 0 && !wasScrolled) useTranslate = true;

                if (useTranslate) {
                    e.preventDefault();
                    translate = (Math.pow(touchesDiff, 0.85) + startTranslate);
                    container.transform('translate3d(0,' + translate + 'px,0)');
                } else {}
                if ((useTranslate && Math.pow(touchesDiff, 0.85) > triggerDistance) || (!useTranslate && touchesDiff >= triggerDistance * 2)) {
                    refresh = true;
                    container.addClass('pull-up').removeClass('pull-down');
                } else {
                    refresh = false;
                    container.removeClass('pull-up').addClass('pull-down');
                }
            } else {

                container.removeClass('pull-up pull-down');
                refresh = false;
                return;
            }
        }

        function handleTouchEnd() {
            if (!isTouched || !isMoved) {
                isTouched = false;
                isMoved = false;
                return;
            }
            if (translate) {
                container.addClass('transitioning');
                translate = 0;
            }
            container.transform('');
            if (refresh) {
                //防止二次触发
                if(container.hasClass('refreshing')) return;
                container.addClass('refreshing');
                container.trigger('refresh');
            } else {
                container.removeClass('pull-down');
            }
            isTouched = false;
            isMoved = false;
        }

        // Attach Events
        eventsTarget.on($.touchEvents.start, handleTouchStart);
        eventsTarget.on($.touchEvents.move, handleTouchMove);
        eventsTarget.on($.touchEvents.end, handleTouchEnd);


        function destroyPullToRefresh() {
            eventsTarget.off($.touchEvents.start, handleTouchStart);
            eventsTarget.off($.touchEvents.move, handleTouchMove);
            eventsTarget.off($.touchEvents.end, handleTouchEnd);
        }
        eventsTarget[0].destroyPullToRefresh = destroyPullToRefresh;

    };
    $.pullToRefreshDone = function(container) {
        $(window).scrollTop(0);//解决微信下拉刷新顶部消失的问题
        container = $(container);
        if (container.length === 0) container = $('.pull-to-refresh-content.refreshing');
        container.removeClass('refreshing').addClass('transitioning');
        container.transitionEnd(function() {
            container.removeClass('transitioning pull-up pull-down');
        });
    };
    $.pullToRefreshTrigger = function(container) {
        container = $(container);
        if (container.length === 0) container = $('.pull-to-refresh-content');
        if (container.hasClass('refreshing')) return;
        container.addClass('transitioning refreshing');
        container.trigger('refresh');
    };

    $.destroyPullToRefresh = function(pageContainer) {
        pageContainer = $(pageContainer);
        var pullToRefreshContent = pageContainer.hasClass('pull-to-refresh-content') ? pageContainer : pageContainer.find('.pull-to-refresh-content');
        if (pullToRefreshContent.length === 0) return;
        if (pullToRefreshContent[0].destroyPullToRefresh) pullToRefreshContent[0].destroyPullToRefresh();
    };

    //这里是否需要写到 scroller 中去？
/*    $.initPullToRefresh = function(pageContainer) {
        var $pageContainer = $(pageContainer);
        $pageContainer.each(function(index, item) {
            if ($.detectScrollerType(item) === 'js') {
                $._pullToRefreshJSScroll.initPullToRefresh(item);
            } else {
                initPullToRefresh(item);
            }
        });
    };


    $.pullToRefreshDone = function(pageContainer) {
        var $pageContainer = $(pageContainer);
        $pageContainer.each(function(index, item) {
            if ($.detectScrollerType(item) === 'js') {
                $._pullToRefreshJSScroll.pullToRefreshDone(item);
            } else {
                pullToRefreshDone(item);
            }
        });
    };


    $.pullToRefreshTrigger = function(pageContainer) {
       var $pageContainer = $(pageContainer);
        $pageContainer.each(function(index, item) {
            if ($.detectScrollerType(item) === 'js') {
                $._pullToRefreshJSScroll.pullToRefreshTrigger(item);
            } else {
                pullToRefreshTrigger(item);
            }
        });
    };

    $.destroyPullToRefresh = function(pageContainer) {
        var $pageContainer = $(pageContainer);
        $pageContainer.each(function(index, item) {
            if ($.detectScrollerType(item) === 'js') {
                $._pullToRefreshJSScroll.destroyPullToRefresh(item);
            } else {
                destroyPullToRefresh(item);
            }
        });
    };
*/

}(Zepto); //jshint ignore:line

+ function($) {
    'use strict';

    function handleInfiniteScroll() {
        /*jshint validthis:true */
        var inf = $(this);
        var scroller = $.getScroller(inf);
        var scrollTop = scroller.scrollTop();
        var scrollHeight = scroller.scrollHeight();
        var height = inf[0].offsetHeight;
        var distance = inf[0].getAttribute('data-distance');
        var virtualListContainer = inf.find('.virtual-list');
        var virtualList;
        var onTop = inf.hasClass('infinite-scroll-top');
        if (!distance) distance = 50;
        if (typeof distance === 'string' && distance.indexOf('%') >= 0) {
            distance = parseInt(distance, 10) / 100 * height;
        }
        if (distance > height) distance = height;
        if (onTop) {
            if (scrollTop < distance) {
                inf.trigger('infinite');
            }
        } else {
            if (scrollTop + height >= scrollHeight - distance) {
                if (virtualListContainer.length > 0) {
                    virtualList = virtualListContainer[0].f7VirtualList;
                    if (virtualList && !virtualList.reachEnd) return;
                }
                inf.trigger('infinite');
            }
        }

    }
    $.attachInfiniteScroll = function(infiniteContent) {
        $.getScroller(infiniteContent).on('scroll', handleInfiniteScroll);
    };
    $.detachInfiniteScroll = function(infiniteContent) {
        $.getScroller(infiniteContent).off('scroll', handleInfiniteScroll);
    };

    $.initInfiniteScroll = function(pageContainer) {
        pageContainer = $(pageContainer);
        var infiniteContent = pageContainer.hasClass('infinite-scroll')?pageContainer:pageContainer.find('.infinite-scroll');
        if (infiniteContent.length === 0) return;
        $.attachInfiniteScroll(infiniteContent);
        //如果是顶部无限刷新，要将滚动条初始化于最下端
        pageContainer.forEach(function(v){
            if($(v).hasClass('infinite-scroll-top')){
                var height = v.scrollHeight - v.clientHeight;
                $(v).scrollTop(height);
            }
        });
        function detachEvents() {
            $.detachInfiniteScroll(infiniteContent);
            pageContainer.off('pageBeforeRemove', detachEvents);
        }
        pageContainer.on('pageBeforeRemove', detachEvents);
    };
}(Zepto);

+function ($) {
    "use strict";
    $(function() {
        $(document).on("focus", ".searchbar input", function(e) {
            var $input = $(e.target);
            $input.parents(".searchbar").addClass("searchbar-active");
        });
        $(document).on("click", ".searchbar-cancel", function(e) {
            var $btn = $(e.target);
            $btn.parents(".searchbar").removeClass("searchbar-active");
        });
        $(document).on("blur", ".searchbar input", function(e) {
            var $input = $(e.target);
            $input.parents(".searchbar").removeClass("searchbar-active");
        });
    });
}(Zepto);

/*======================================================
************   Panels   ************
======================================================*/
/*jshint unused: false*/
+function ($) {
    "use strict";
    $.allowPanelOpen = true;
    $.openPanel = function (panel) {
        if (!$.allowPanelOpen) return false;
        if(panel === 'left' || panel === 'right') panel = ".panel-" + panel;  //可以传入一个方向
        panel = panel ? $(panel) : $(".panel").eq(0);
        var direction = panel.hasClass("panel-right") ? "right" : "left";
        if (panel.length === 0 || panel.hasClass('active')) return false;
        $.closePanel(); // Close if some panel is opened
        $.allowPanelOpen = false;
        var effect = panel.hasClass('panel-reveal') ? 'reveal' : 'cover';
        panel.css({display: 'block'}).addClass('active');
        panel.trigger('open');

        // Trigger reLayout
        var clientLeft = panel[0].clientLeft;

        // Transition End;
        var transitionEndTarget = effect === 'reveal' ? $($.getCurrentPage()) : panel;
        var openedTriggered = false;

        function panelTransitionEnd() {
            transitionEndTarget.transitionEnd(function (e) {
                if (e.target === transitionEndTarget[0]) {
                    if (panel.hasClass('active')) {
                        panel.trigger('opened');
                    }
                    else {
                        panel.trigger('closed');
                    }
            $.allowPanelOpen = true;
                }
                else panelTransitionEnd();
            });
        }
        panelTransitionEnd();

        $(document.body).addClass('with-panel-' + direction + '-' + effect);
        return true;
    };
    $.closePanel = function () {
        var activePanel = $('.panel.active');
        if (activePanel.length === 0) return false;
        var effect = activePanel.hasClass('panel-reveal') ? 'reveal' : 'cover';
        var panelPosition = activePanel.hasClass('panel-left') ? 'left' : 'right';
        activePanel.removeClass('active');
        var transitionEndTarget = effect === 'reveal' ? $('.page') : activePanel;
        activePanel.trigger('close');
        $.allowPanelOpen = false;

        transitionEndTarget.transitionEnd(function () {
            if (activePanel.hasClass('active')) return;
            activePanel.css({display: ''});
            activePanel.trigger('closed');
            $('body').removeClass('panel-closing');
            $.allowPanelOpen = true;
        });

        $('body').addClass('panel-closing').removeClass('with-panel-' + panelPosition + '-' + effect);
    };

    $(document).on("click", ".open-panel", function(e) {
        var panel = $(e.target).data('panel');
        $.openPanel(panel);
    });
    $(document).on("click", ".close-panel, .panel-overlay", function(e) {
        $.closePanel();
    });
    /*======================================================
     ************   Swipe panels   ************
     ======================================================*/
    $.initSwipePanels = function () {
        var panel, side;
        var swipePanel = $.smConfig.swipePanel;
        var swipePanelOnlyClose = $.smConfig.swipePanelOnlyClose;
        var swipePanelCloseOpposite = true;
        var swipePanelActiveArea = false;
        var swipePanelThreshold = 2;
        var swipePanelNoFollow = false;

        if(!(swipePanel || swipePanelOnlyClose)) return;

        var panelOverlay = $('.panel-overlay');
        var isTouched, isMoved, isScrolling, touchesStart = {}, touchStartTime, touchesDiff, translate, opened, panelWidth, effect, direction;
        var views = $('.page');

        function handleTouchStart(e) {
            if (!$.allowPanelOpen || (!swipePanel && !swipePanelOnlyClose) || isTouched) return;
            if ($('.modal-in, .photo-browser-in').length > 0) return;
            if (!(swipePanelCloseOpposite || swipePanelOnlyClose)) {
                if ($('.panel.active').length > 0 && !panel.hasClass('active')) return;
            }
            touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
            touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
            if (swipePanelCloseOpposite || swipePanelOnlyClose) {
                if ($('.panel.active').length > 0) {
                    side = $('.panel.active').hasClass('panel-left') ? 'left' : 'right';
                }
                else {
                    if (swipePanelOnlyClose) return;
                    side = swipePanel;
                }
                if (!side) return;
            }
            panel = $('.panel.panel-' + side);
            if(!panel[0]) return;
            opened = panel.hasClass('active');
            if (swipePanelActiveArea && !opened) {
                if (side === 'left') {
                    if (touchesStart.x > swipePanelActiveArea) return;
                }
                if (side === 'right') {
                    if (touchesStart.x < window.innerWidth - swipePanelActiveArea) return;
                }
            }
            isMoved = false;
            isTouched = true;
            isScrolling = undefined;

            touchStartTime = (new Date()).getTime();
            direction = undefined;
        }
        function handleTouchMove(e) {
            if (!isTouched) return;
            if(!panel[0]) return;
            if (e.f7PreventPanelSwipe) return;
            var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
            var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
            if (typeof isScrolling === 'undefined') {
                isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
            }
            if (isScrolling) {
                isTouched = false;
                return;
            }
            if (!direction) {
                if (pageX > touchesStart.x) {
                    direction = 'to-right';
                }
                else {
                    direction = 'to-left';
                }

                if (
                        side === 'left' &&
                        (
                         direction === 'to-left' && !panel.hasClass('active')
                        ) ||
                        side === 'right' &&
                        (
                         direction === 'to-right' && !panel.hasClass('active')
                        )
                   )
                {
                    isTouched = false;
                    return;
                }
            }

            if (swipePanelNoFollow) {
                var timeDiff = (new Date()).getTime() - touchStartTime;
                if (timeDiff < 300) {
                    if (direction === 'to-left') {
                        if (side === 'right') $.openPanel(side);
                        if (side === 'left' && panel.hasClass('active')) $.closePanel();
                    }
                    if (direction === 'to-right') {
                        if (side === 'left') $.openPanel(side);
                        if (side === 'right' && panel.hasClass('active')) $.closePanel();
                    }
                }
                isTouched = false;
                console.log(3);
                isMoved = false;
                return;
            }

            if (!isMoved) {
                effect = panel.hasClass('panel-cover') ? 'cover' : 'reveal';
                if (!opened) {
                    panel.show();
                    panelOverlay.show();
                }
                panelWidth = panel[0].offsetWidth;
                panel.transition(0);
                /*
                   if (panel.find('.' + app.params.viewClass).length > 0) {
                   if (app.sizeNavbars) app.sizeNavbars(panel.find('.' + app.params.viewClass)[0]);
                   }
                   */
            }

            isMoved = true;

            e.preventDefault();
            var threshold = opened ? 0 : -swipePanelThreshold;
            if (side === 'right') threshold = -threshold;

            touchesDiff = pageX - touchesStart.x + threshold;

            if (side === 'right') {
                translate = touchesDiff  - (opened ? panelWidth : 0);
                if (translate > 0) translate = 0;
                if (translate < -panelWidth) {
                    translate = -panelWidth;
                }
            }
            else {
                translate = touchesDiff  + (opened ? panelWidth : 0);
                if (translate < 0) translate = 0;
                if (translate > panelWidth) {
                    translate = panelWidth;
                }
            }
            if (effect === 'reveal') {
                views.transform('translate3d(' + translate + 'px,0,0)').transition(0);
                panelOverlay.transform('translate3d(' + translate + 'px,0,0)');
                //app.pluginHook('swipePanelSetTransform', views[0], panel[0], Math.abs(translate / panelWidth));
            }
            else {
                panel.transform('translate3d(' + translate + 'px,0,0)').transition(0);
                //app.pluginHook('swipePanelSetTransform', views[0], panel[0], Math.abs(translate / panelWidth));
            }
        }
        function handleTouchEnd(e) {
            if (!isTouched || !isMoved) {
                isTouched = false;
                isMoved = false;
                return;
            }
            isTouched = false;
            isMoved = false;
            var timeDiff = (new Date()).getTime() - touchStartTime;
            var action;
            var edge = (translate === 0 || Math.abs(translate) === panelWidth);

            if (!opened) {
                if (translate === 0) {
                    action = 'reset';
                }
                else if (
                        timeDiff < 300 && Math.abs(translate) > 0 ||
                        timeDiff >= 300 && (Math.abs(translate) >= panelWidth / 2)
                        ) {
                            action = 'swap';
                        }
                else {
                    action = 'reset';
                }
            }
            else {
                if (translate === -panelWidth) {
                    action = 'reset';
                }
                else if (
                        timeDiff < 300 && Math.abs(translate) >= 0 ||
                        timeDiff >= 300 && (Math.abs(translate) <= panelWidth / 2)
                        ) {
                            if (side === 'left' && translate === panelWidth) action = 'reset';
                            else action = 'swap';
                        }
                else {
                    action = 'reset';
                }
            }
            if (action === 'swap') {
                $.allowPanelOpen = true;
                if (opened) {
                    $.closePanel();
                    if (edge) {
                        panel.css({display: ''});
                        $('body').removeClass('panel-closing');
                    }
                }
                else {
                    $.openPanel(side);
                }
                if (edge) $.allowPanelOpen = true;
            }
            if (action === 'reset') {
                if (opened) {
                    $.allowPanelOpen = true;
                    $.openPanel(side);
                }
                else {
                    $.closePanel();
                    if (edge) {
                        $.allowPanelOpen = true;
                        panel.css({display: ''});
                    }
                    else {
                        var target = effect === 'reveal' ? views : panel;
                        $('body').addClass('panel-closing');
                        target.transitionEnd(function () {
                            $.allowPanelOpen = true;
                            panel.css({display: ''});
                            $('body').removeClass('panel-closing');
                        });
                    }
                }
            }
            if (effect === 'reveal') {
                views.transition('');
                views.transform('');
            }
            panel.transition('').transform('');
            panelOverlay.css({display: ''}).transform('');
        }
        $(document).on($.touchEvents.start, handleTouchStart);
        $(document).on($.touchEvents.move, handleTouchMove);
        $(document).on($.touchEvents.end, handleTouchEnd);
    };

    $.initSwipePanels();
}(Zepto);

/**
 * 路由
 *
 * 路由功能将接管页面的链接点击行为，最后达到动画切换的效果，具体如下：
 *  1. 链接对应的是另一个页面，那么则尝试 ajax 加载，然后把新页面里的符合约定的结构提取出来，然后做动画切换；如果没法 ajax 或结构不符合，那么则回退为普通的页面跳转
 *  2. 链接是当前页面的锚点，并且该锚点对应的元素存在且符合路由约定，那么则把该元素做动画切入
 *  3. 浏览器前进后退（history.forward/history.back）时，也使用动画效果
 *  4. 如果链接有 back 这个 class，那么则忽略一切，直接调用 history.back() 来后退
 *
 * 路由功能默认开启，如果需要关闭路由功能，那么在 zepto 之后，msui 脚本之前设置 $.config.router = false 即可（intro.js 中会 extend 到 $.smConfig 中）。
 *
 * 可以设置 $.config.routerFilter 函数来设置当前点击链接是否使用路由功能，实参是 a 链接的 zepto 对象；返回 false 表示不使用 router 功能。
 *
 * ajax 载入新的文档时，并不会执行里面的 js。到目前为止，在开启路由功能时，建议的做法是：
 *  把所有页面的 js 都放到同一个脚本里，js 里面的事件绑定使用委托而不是直接的绑定在元素上（因为动态加载的页面元素还不存在），然后所有页面都引用相同的 js 脚本。非事件类可以通过监控 pageInit 事件，根据里面的 pageId 来做对应区别处理。
 *
 * 如果有需要
 *
 * 对外暴露的方法
 *  - load （原 loadPage 效果一致,但后者已标记为待移除）
 *  - forward
 *  - back
 *
 * 事件
 * pageLoad* 系列在发生 ajax 加载时才会触发；当是块切换或已缓存的情况下，不会发送这些事件
 *  - pageLoadCancel: 如果前一个还没加载完,那么取消并发送该事件
 *  - pageLoadStart: 开始加载
 *  - pageLodComplete: ajax complete 完成
 *  - pageLoadError: ajax 发生 error
 *  - pageAnimationStart: 执行动画切换前，实参是 event，sectionId 和 $section
 *  - pageAnimationEnd: 执行动画完毕，实参是 event，sectionId 和 $section
 *  - beforePageRemove: 新 document 载入且动画切换完毕，旧的 document remove 之前在 window 上触发，实参是 event 和 $pageContainer
 *  - pageRemoved: 新的 document 载入且动画切换完毕，旧的 document remove 之后在 window 上触发
 *  - beforePageSwitch: page 切换前，在 pageAnimationStart 前，beforePageSwitch 之后会做一些额外的处理才触发 pageAnimationStart
 *  - pageInitInternal: （经 init.js 处理后，对外是 pageInit）紧跟着动画完成的事件，实参是 event，sectionId 和 $section
 *
 * 术语
 *  - 文档（document），不带 hash 的 url 关联着的应答 html 结构
 *  - 块（section），一个文档内有指定块标识的元素
 *
 * 路由实现约定
 *  - 每个文档的需要展示的内容必需位于指定的标识（routerConfig.sectionGroupClass）的元素里面，默认是: div.page-group （注意,如果改变这个需要同时改变 less 中的命名）
 *  - 每个块必需带有指定的块标识（routerConfig.pageClass），默认是 .page
 *
 *  即，使用路由功能的每一个文档应当是下面这样的结构（省略 <body> 等）:
 *      <div class="page-group">
 *          <div class="page">xxx</div>
 *          <div class="page">yyy</div>
 *      </div>
 *
 * 另，每一个块都应当有一个唯一的 ID，这样才能通过 #the-id 的形式来切换定位。
 * 当一个块没有 id 时，如果是第一个的默认的需要展示的块，那么会给其添加一个随机的 id；否则，没有 id 的块将不会被切换展示。
 *
 * 通过 history.state/history.pushState 以及用 sessionStorage 来记录当前 state 以及最大的 state id 来辅助前进后退的切换效果，所以在不支持 sessionStorage 的情况下，将不开启路由功能。
 *
 * 为了解决 ajax 载入页面导致重复 ID 以及重复 popup 等功能，上面约定了使用路由功能的所有可展示内容都必需位于指定元素内。从而可以在进行文档间切换时可以进行两个文档的整体移动，切换完毕后再把前一个文档的内容从页面之间移除。
 *
 * 默认地过滤了部分协议的链接，包括 tel:, javascript:, mailto:，这些链接将不会使用路由功能。如果有更多的自定义控制需求，可以在 $.config.routerFilter 实现
 *
 * 注: 以 _ 开头的函数标明用于此处内部使用，可根据需要随时重构变更，不对外确保兼容性。
 *
 */
+function($) {
    'use strict';

    if (!window.CustomEvent) {
        window.CustomEvent = function(type, config) {
            config = config || { bubbles: false, cancelable: false, detail: undefined};
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(type, config.bubbles, config.cancelable, config.detail);
            return e;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    var EVENTS = {
        pageLoadStart: 'pageLoadStart', // ajax 开始加载新页面前
        pageLoadCancel: 'pageLoadCancel', // 取消前一个 ajax 加载动作后
        pageLoadError: 'pageLoadError', // ajax 加载页面失败后
        pageLoadComplete: 'pageLoadComplete', // ajax 加载页面完成后（不论成功与否）
        pageAnimationStart: 'pageAnimationStart', // 动画切换 page 前
        pageAnimationEnd: 'pageAnimationEnd', // 动画切换 page 结束后
        beforePageRemove: 'beforePageRemove', // 移除旧 document 前（适用于非内联 page 切换）
        pageRemoved: 'pageRemoved', // 移除旧 document 后（适用于非内联 page 切换）
        beforePageSwitch: 'beforePageSwitch', // page 切换前，在 pageAnimationStart 前，beforePageSwitch 之后会做一些额外的处理才触发 pageAnimationStart
        pageInit: 'pageInitInternal' // 目前是定义为一个 page 加载完毕后（实际和 pageAnimationEnd 等同）
    };

    var Util = {
        /**
         * 获取 url 的 fragment（即 hash 中去掉 # 的剩余部分）
         *
         * 如果没有则返回空字符串
         * 如: http://example.com/path/?query=d#123 => 123
         *
         * @param {String} url url
         * @returns {String}
         */
        getUrlFragment: function(url) {
            var hashIndex = url.indexOf('#');
            return hashIndex === -1 ? '' : url.slice(hashIndex + 1);
        },
        /**
         * 获取一个链接相对于当前页面的绝对地址形式
         *
         * 假设当前页面是 http://a.com/b/c
         * 那么有以下情况:
         * d => http://a.com/b/d
         * /e => http://a.com/e
         * #1 => http://a.com/b/c#1
         * http://b.com/f => http://b.com/f
         *
         * @param {String} url url
         * @returns {String}
         */
        getAbsoluteUrl: function(url) {
            var link = document.createElement('a');
            link.setAttribute('href', url);
            var absoluteUrl = link.href;
            link = null;
            return absoluteUrl;
        },
        /**
         * 获取一个 url 的基本部分，即不包括 hash
         *
         * @param {String} url url
         * @returns {String}
         */
        getBaseUrl: function(url) {
            var hashIndex = url.indexOf('#');
            return hashIndex === -1 ? url.slice(0) : url.slice(0, hashIndex);
        },
        /**
         * 把一个字符串的 url 转为一个可获取其 base 和 fragment 等的对象
         *
         * @param {String} url url
         * @returns {UrlObject}
         */
        toUrlObject: function(url) {
            var fullUrl = this.getAbsoluteUrl(url),
                baseUrl = this.getBaseUrl(fullUrl),
                fragment = this.getUrlFragment(url);

            return {
                base: baseUrl,
                full: fullUrl,
                original: url,
                fragment: fragment
            };
        },
        /**
         * 判断浏览器是否支持 sessionStorage，支持返回 true，否则返回 false
         * @returns {Boolean}
         */
        supportStorage: function() {
            var mod = 'sm.router.storage.ability';
            try {
                sessionStorage.setItem(mod, mod);
                sessionStorage.removeItem(mod);
                return true;
            } catch(e) {
                return false;
            }
        }
    };

    var routerConfig = {
        sectionGroupClass: 'page-group',
        // 表示是当前 page 的 class
        curPageClass: 'page-current',
        // 用来辅助切换时表示 page 是 visible 的,
        // 之所以不用 curPageClass，是因为 page-current 已被赋予了「当前 page」这一含义而不仅仅是 display: block
        // 并且，别的地方已经使用了，所以不方便做变更，故新增一个
        visiblePageClass: 'page-visible',
        // 表示是 page 的 class，注意，仅是标志 class，而不是所有的 class
        pageClass: 'page'
    };

    var DIRECTION = {
        leftToRight: 'from-left-to-right',
        rightToLeft: 'from-right-to-left'
    };

    var theHistory = window.history;

    var Router = function() {
        this.sessionNames = {
            currentState: 'sm.router.currentState',
            maxStateId: 'sm.router.maxStateId'
        };

        this._init();
        this.xhr = null;
        window.addEventListener('popstate', this._onPopState.bind(this));
    };

    /**
     * 初始化
     *
     * - 把当前文档内容缓存起来
     * - 查找默认展示的块内容，查找顺序如下
     *      1. id 是 url 中的 fragment 的元素
     *      2. 有当前块 class 标识的第一个元素
     *      3. 第一个块
     * - 初始页面 state 处理
     *
     * @private
     */
    Router.prototype._init = function() {

        this.$view = $('body');

        // 用来保存 document 的 map
        this.cache = {};
        var $doc = $(document);
        var currentUrl = location.href;
        this._saveDocumentIntoCache($doc, currentUrl);

        var curPageId;

        var currentUrlObj = Util.toUrlObject(currentUrl);
        var $allSection = $doc.find('.' + routerConfig.pageClass);
        var $visibleSection = $doc.find('.' + routerConfig.curPageClass);
        var $curVisibleSection = $visibleSection.eq(0);
        var $hashSection;

        if (currentUrlObj.fragment) {
            $hashSection = $doc.find('#' + currentUrlObj.fragment);
        }
        if ($hashSection && $hashSection.length) {
            $visibleSection = $hashSection.eq(0);
        } else if (!$visibleSection.length) {
            $visibleSection = $allSection.eq(0);
        }
        if (!$visibleSection.attr('id')) {
            $visibleSection.attr('id', this._generateRandomId());
        }

        if ($curVisibleSection.length &&
            ($curVisibleSection.attr('id') !== $visibleSection.attr('id'))) {
            // 在 router 到 inner page 的情况下，刷新（或者直接访问该链接）
            // 直接切换 class 会有「闪」的现象,或许可以采用 animateSection 来减缓一下
            $curVisibleSection.removeClass(routerConfig.curPageClass);
            $visibleSection.addClass(routerConfig.curPageClass);
        } else {
            $visibleSection.addClass(routerConfig.curPageClass);
        }
        curPageId = $visibleSection.attr('id');


        // 新进入一个使用 history.state 相关技术的页面时，如果第一个 state 不 push/replace,
        // 那么在后退回该页面时，将不触发 popState 事件
        if (theHistory.state === null) {
            var curState = {
                id: this._getNextStateId(),
                url: Util.toUrlObject(currentUrl),
                pageId: curPageId
            };

            theHistory.replaceState(curState, '', currentUrl);
            this._saveAsCurrentState(curState);
            this._incMaxStateId();
        }
    };

    /**
     * 切换到 url 指定的块或文档
     *
     * 如果 url 指向的是当前页面，那么认为是切换块；
     * 否则是切换文档
     *
     * @param {String} url url
     * @param {Boolean=} ignoreCache 是否强制请求不使用缓存，对 document 生效，默认是 false
     */
    Router.prototype.load = function(url, ignoreCache) {
        if (ignoreCache === undefined) {
            ignoreCache = false;
        }

        if (this._isTheSameDocument(location.href, url)) {
            this._switchToSection(Util.getUrlFragment(url));
        } else {
            this._saveDocumentIntoCache($(document), location.href);
            this._switchToDocument(url, ignoreCache);
        }
    };

    /**
     * 调用 history.forward()
     */
    Router.prototype.forward = function() {
        theHistory.forward();
    };

    /**
     * 调用 history.back()
     */
    Router.prototype.back = function() {
        theHistory.back();
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     */
    Router.prototype.loadPage = Router.prototype.load;

    /**
     * 切换显示当前文档另一个块
     *
     * 把新块从右边切入展示，同时会把新的块的记录用 history.pushState 来保存起来
     *
     * 如果已经是当前显示的块，那么不做任何处理；
     * 如果没对应的块，那么忽略。
     *
     * @param {String} sectionId 待切换显示的块的 id
     * @private
     */
    Router.prototype._switchToSection = function(sectionId) {
        if (!sectionId) {
            return;
        }

        var $curPage = this._getCurrentSection(),
            $newPage = $('#' + sectionId);

        // 如果已经是当前页，不做任何处理
        if ($curPage === $newPage) {
            return;
        }

        this._animateSection($curPage, $newPage, DIRECTION.rightToLeft);
        this._pushNewState('#' + sectionId, sectionId);
    };

    /**
     * 载入显示一个新的文档
     *
     * - 如果有缓存，那么直接利用缓存来切换
     * - 否则，先把页面加载过来缓存，然后再切换
     *      - 如果解析失败，那么用 location.href 的方式来跳转
     *
     * 注意：不能在这里以及其之后用 location.href 来 **读取** 切换前的页面的 url，
     *     因为如果是 popState 时的调用，那么此时 location 已经是 pop 出来的 state 的了
     *
     * @param {String} url 新的文档的 url
     * @param {Boolean=} ignoreCache 是否不使用缓存强制加载页面
     * @param {Boolean=} isPushState 是否需要 pushState
     * @param {String=} direction 新文档切入的方向
     * @private
     */
    Router.prototype._switchToDocument = function(url, ignoreCache, isPushState, direction) {
        var baseUrl = Util.toUrlObject(url).base;

        if (ignoreCache) {
            delete this.cache[baseUrl];
        }

        var cacheDocument = this.cache[baseUrl];
        var context = this;

        if (cacheDocument) {
            this._doSwitchDocument(url, isPushState, direction);
        } else {
            this._loadDocument(url, {
                success: function($doc) {
                    try {
                        context._parseDocument(url, $doc);
                        context._doSwitchDocument(url, isPushState, direction);
                    } catch (e) {
                        location.href = url;
                    }
                },
                error: function() {
                    location.href = url;
                }
            });
        }
    };

    /**
     * 利用缓存来做具体的切换文档操作
     *
     * - 确定待切入的文档的默认展示 section
     * - 把新文档 append 到 view 中
     * - 动画切换文档
     * - 如果需要 pushState，那么把最新的状态 push 进去并把当前状态更新为该状态
     *
     * @param {String} url 待切换的文档的 url
     * @param {Boolean} isPushState 加载页面后是否需要 pushState，默认是 true
     * @param {String} direction 动画切换方向，默认是 DIRECTION.rightToLeft
     * @private
     */
    Router.prototype._doSwitchDocument = function(url, isPushState, direction) {
        if (typeof isPushState === 'undefined') {
            isPushState = true;
        }

        var urlObj = Util.toUrlObject(url);
        var $currentDoc = this.$view.find('.' + routerConfig.sectionGroupClass);
        var $newDoc = $($('<div></div>').append(this.cache[urlObj.base].$content).html());

        // 确定一个 document 展示 section 的顺序
        // 1. 与 hash 关联的 element
        // 2. 默认的标识为 current 的 element
        // 3. 第一个 section
        var $allSection = $newDoc.find('.' + routerConfig.pageClass);
        var $visibleSection = $newDoc.find('.' + routerConfig.curPageClass);
        var $hashSection;

        if (urlObj.fragment) {
            $hashSection = $newDoc.find('#' + urlObj.fragment);
        }
        if ($hashSection && $hashSection.length) {
            $visibleSection = $hashSection.eq(0);
        } else if (!$visibleSection.length) {
            $visibleSection = $allSection.eq(0);
        }
        if (!$visibleSection.attr('id')) {
            $visibleSection.attr('id', this._generateRandomId());
        }

        var $currentSection = this._getCurrentSection();
        $currentSection.trigger(EVENTS.beforePageSwitch, [$currentSection.attr('id'), $currentSection]);

        $allSection.removeClass(routerConfig.curPageClass);
        $visibleSection.addClass(routerConfig.curPageClass);

        // prepend 而不 append 的目的是避免 append 进去新的 document 在后面，
        // 其里面的默认展示的(.page-current) 的页面直接就覆盖了原显示的页面（因为都是 absolute）
        this.$view.prepend($newDoc);

        this._animateDocument($currentDoc, $newDoc, $visibleSection, direction);

        if (isPushState) {
            this._pushNewState(url, $visibleSection.attr('id'));
        }
    };

    /**
     * 判断两个 url 指向的页面是否是同一个
     *
     * 判断方式: 如果两个 url 的 base 形式（不带 hash 的绝对形式）相同，那么认为是同一个页面
     *
     * @param {String} url
     * @param {String} anotherUrl
     * @returns {Boolean}
     * @private
     */
    Router.prototype._isTheSameDocument = function(url, anotherUrl) {
        return Util.toUrlObject(url).base === Util.toUrlObject(anotherUrl).base;
    };

    /**
     * ajax 加载 url 指定的页面内容
     *
     * 加载过程中会发出以下事件
     *  pageLoadCancel: 如果前一个还没加载完,那么取消并发送该事件
     *  pageLoadStart: 开始加载
     *  pageLodComplete: ajax complete 完成
     *  pageLoadError: ajax 发生 error
     *
     *
     * @param {String} url url
     * @param {Object=} callback 回调函数配置，可选，可以配置 success\error 和 complete
     *      所有回调函数的 this 都是 null，各自实参如下：
     *      success: $doc, status, xhr
     *      error: xhr, status, err
     *      complete: xhr, status
     *
     * @private
     */
    Router.prototype._loadDocument = function(url, callback) {
        if (this.xhr && this.xhr.readyState < 4) {
            this.xhr.onreadystatechange = function() {
            };
            this.xhr.abort();
            this.dispatch(EVENTS.pageLoadCancel);
        }

        this.dispatch(EVENTS.pageLoadStart);

        callback = callback || {};
        var self = this;

        this.xhr = $.ajax({
            url: url,
            success: $.proxy(function(data, status, xhr) {
                // 给包一层 <html/>，从而可以拿到完整的结构
                var $doc = $('<html></html>');
                $doc.append(data);
                callback.success && callback.success.call(null, $doc, status, xhr);
            }, this),
            error: function(xhr, status, err) {
                callback.error && callback.error.call(null, xhr, status, err);
                self.dispatch(EVENTS.pageLoadError);
            },
            complete: function(xhr, status) {
                callback.complete && callback.complete.call(null, xhr, status);
                self.dispatch(EVENTS.pageLoadComplete);
            }
        });
    };

    /**
     * 对于 ajax 加载进来的页面，把其缓存起来
     *
     * @param {String} url url
     * @param $doc ajax 载入的页面的 jq 对象，可以看做是该页面的 $(document)
     * @private
     */
    Router.prototype._parseDocument = function(url, $doc) {
        var $innerView = $doc.find('.' + routerConfig.sectionGroupClass);

        if (!$innerView.length) {
            throw new Error('missing router view mark: ' + routerConfig.sectionGroupClass);
        }

        this._saveDocumentIntoCache($doc, url);
    };

    /**
     * 把一个页面的相关信息保存到 this.cache 中
     *
     * 以页面的 baseUrl 为 key,而 value 则是一个 DocumentCache
     *
     * @param {*} doc doc
     * @param {String} url url
     * @private
     */
    Router.prototype._saveDocumentIntoCache = function(doc, url) {
        var urlAsKey = Util.toUrlObject(url).base;
        var $doc = $(doc);

        this.cache[urlAsKey] = {
            $doc: $doc,
            $content: $doc.find('.' + routerConfig.sectionGroupClass)
        };
    };

    /**
     * 从 sessionStorage 中获取保存下来的「当前状态」
     *
     * 如果解析失败，那么认为当前状态是 null
     *
     * @returns {State|null}
     * @private
     */
    Router.prototype._getLastState = function() {
        var currentState = sessionStorage.getItem(this.sessionNames.currentState);
        try {
            currentState = JSON.parse(currentState);
        } catch(e) {
            currentState = null;
        }

        return currentState;
    };

    /**
     * 把一个状态设为当前状态，保存仅 sessionStorage 中
     *
     * @param {State} state
     * @private
     */
    Router.prototype._saveAsCurrentState = function(state) {
        sessionStorage.setItem(this.sessionNames.currentState, JSON.stringify(state));
    };

    /**
     * 获取下一个 state 的 id
     *
     * 读取 sessionStorage 里的最后的状态的 id，然后 + 1；如果原没设置，那么返回 1
     *
     * @returns {number}
     * @private
     */
    Router.prototype._getNextStateId = function() {
        var maxStateId = sessionStorage.getItem(this.sessionNames.maxStateId);
        return maxStateId ? parseInt(maxStateId, 10) + 1 : 1;
    };

    /**
     * 把 sessionStorage 里的最后状态的 id 自加 1
     *
     * @private
     */
    Router.prototype._incMaxStateId = function() {
        sessionStorage.setItem(this.sessionNames.maxStateId, this._getNextStateId());
    };

    /**
     * 从一个文档切换为显示另一个文档
     *
     * @param $from 目前显示的文档
     * @param $to 待切换显示的新文档
     * @param $visibleSection 新文档中展示的 section 元素
     * @param direction 新文档切入方向
     * @private
     */
    Router.prototype._animateDocument = function($from, $to, $visibleSection, direction) {
        var sectionId = $visibleSection.attr('id');


        var $visibleSectionInFrom = $from.find('.' + routerConfig.curPageClass);
        $visibleSectionInFrom.addClass(routerConfig.visiblePageClass).removeClass(routerConfig.curPageClass);

        $visibleSection.trigger(EVENTS.pageAnimationStart, [sectionId, $visibleSection]);

        this._animateElement($from, $to, direction);

        $from.animationEnd(function() {
            $visibleSectionInFrom.removeClass(routerConfig.visiblePageClass);
            // 移除 document 前后，发送 beforePageRemove 和 pageRemoved 事件
            $(window).trigger(EVENTS.beforePageRemove, [$from]);
            $from.remove();
            $(window).trigger(EVENTS.pageRemoved);
        });

        $to.animationEnd(function() {
            $visibleSection.trigger(EVENTS.pageAnimationEnd, [sectionId, $visibleSection]);
            // 外层（init.js）中会绑定 pageInitInternal 事件，然后对页面进行初始化
            $visibleSection.trigger(EVENTS.pageInit, [sectionId, $visibleSection]);
        });
    };

    /**
     * 把当前文档的展示 section 从一个 section 切换到另一个 section
     *
     * @param $from
     * @param $to
     * @param direction
     * @private
     */
    Router.prototype._animateSection = function($from, $to, direction) {
        var toId = $to.attr('id');
        $from.trigger(EVENTS.beforePageSwitch, [$from.attr('id'), $from]);

        $from.removeClass(routerConfig.curPageClass);
        $to.addClass(routerConfig.curPageClass);
        $to.trigger(EVENTS.pageAnimationStart, [toId, $to]);
        this._animateElement($from, $to, direction);
        $to.animationEnd(function() {
            $to.trigger(EVENTS.pageAnimationEnd, [toId, $to]);
            // 外层（init.js）中会绑定 pageInitInternal 事件，然后对页面进行初始化
            $to.trigger(EVENTS.pageInit, [toId, $to]);
        });
    };

    /**
     * 切换显示两个元素
     *
     * 切换是通过更新 class 来实现的，而具体的切换动画则是 class 关联的 css 来实现
     *
     * @param $from 当前显示的元素
     * @param $to 待显示的元素
     * @param direction 切换的方向
     * @private
     */
    Router.prototype._animateElement = function($from, $to, direction) {
        // todo: 可考虑如果入参不指定，那么尝试读取 $to 的属性，再没有再使用默认的
        // 考虑读取点击的链接上指定的方向
        if (typeof direction === 'undefined') {
            direction = DIRECTION.rightToLeft;
        }

        var animPageClasses = [
            'page-from-center-to-left',
            'page-from-center-to-right',
            'page-from-right-to-center',
            'page-from-left-to-center'].join(' ');

        var classForFrom, classForTo;
        switch(direction) {
            case DIRECTION.rightToLeft:
                classForFrom = 'page-from-center-to-left';
                classForTo = 'page-from-right-to-center';
                break;
            case DIRECTION.leftToRight:
                classForFrom = 'page-from-center-to-right';
                classForTo = 'page-from-left-to-center';
                break;
            default:
                classForFrom = 'page-from-center-to-left';
                classForTo = 'page-from-right-to-center';
                break;
        }

        $from.removeClass(animPageClasses).addClass(classForFrom);
        $to.removeClass(animPageClasses).addClass(classForTo);

        $from.animationEnd(function() {
            $from.removeClass(animPageClasses);
        });
        $to.animationEnd(function() {
            $to.removeClass(animPageClasses);
        });
    };

    /**
     * 获取当前显示的第一个 section
     *
     * @returns {*}
     * @private
     */
    Router.prototype._getCurrentSection = function() {
        return this.$view.find('.' + routerConfig.curPageClass).eq(0);
    };

    /**
     * popState 事件关联着的后退处理
     *
     * 判断两个 state 判断是否是属于同一个文档，然后做对应的 section 或文档切换；
     * 同时在切换后把新 state 设为当前 state
     *
     * @param {State} state 新 state
     * @param {State} fromState 旧 state
     * @private
     */
    Router.prototype._back = function(state, fromState) {
        if (this._isTheSameDocument(state.url.full, fromState.url.full)) {
            var $newPage = $('#' + state.pageId);
            if ($newPage.length) {
                var $currentPage = this._getCurrentSection();
                this._animateSection($currentPage, $newPage, DIRECTION.leftToRight);
                this._saveAsCurrentState(state);
            } else {
                location.href = state.url.full;
            }
        } else {
            this._saveDocumentIntoCache($(document), fromState.url.full);
            this._switchToDocument(state.url.full, false, false, DIRECTION.leftToRight);
            this._saveAsCurrentState(state);
        }
    };

    /**
     * popState 事件关联着的前进处理,类似于 _back，不同的是切换方向
     *
     * @param {State} state 新 state
     * @param {State} fromState 旧 state
     * @private
     */
    Router.prototype._forward = function(state, fromState) {
        if (this._isTheSameDocument(state.url.full, fromState.url.full)) {
            var $newPage = $('#' + state.pageId);
            if ($newPage.length) {
                var $currentPage = this._getCurrentSection();
                this._animateSection($currentPage, $newPage, DIRECTION.rightToLeft);
                this._saveAsCurrentState(state);
            } else {
                location.href = state.url.full;
            }
        } else {
            this._saveDocumentIntoCache($(document), fromState.url.full);
            this._switchToDocument(state.url.full, false, false, DIRECTION.rightToLeft);
            this._saveAsCurrentState(state);
        }
    };

    /**
     * popState 事件处理
     *
     * 根据 pop 出来的 state 和当前 state 来判断是前进还是后退
     *
     * @param event
     * @private
     */
    Router.prototype._onPopState = function(event) {
        var state = event.state;
        // if not a valid state, do nothing
        if (!state || !state.pageId) {
            return;
        }

        var lastState = this._getLastState();

        if (!lastState) {
            console.error && console.error('Missing last state when backward or forward');
            return;
        }

        if (state.id === lastState.id) {
            return;
        }

        if (state.id < lastState.id) {
            this._back(state, lastState);
        } else {
            this._forward(state, lastState);
        }
    };

    /**
     * 页面进入到一个新状态
     *
     * 把新状态 push 进去，设置为当前的状态，然后把 maxState 的 id +1。
     *
     * @param {String} url 新状态的 url
     * @param {String} sectionId 新状态中显示的 section 元素的 id
     * @private
     */
    Router.prototype._pushNewState = function(url, sectionId) {
        var state = {
            id: this._getNextStateId(),
            pageId: sectionId,
            url: Util.toUrlObject(url)
        };

        theHistory.pushState(state, '', url);
        this._saveAsCurrentState(state);
        this._incMaxStateId();
    };

    /**
     * 生成一个随机的 id
     *
     * @returns {string}
     * @private
     */
    Router.prototype._generateRandomId = function() {
        return "page-" + (+new Date());
    };

    Router.prototype.dispatch = function(event) {
        var e = new CustomEvent(event, {
            bubbles: true,
            cancelable: true
        });

        //noinspection JSUnresolvedFunction
        window.dispatchEvent(e);
    };

    /**
     * 判断一个链接是否使用 router 来处理
     *
     * @param $link
     * @returns {boolean}
     */
    function isInRouterBlackList($link) {
        var classBlackList = [
            'external',
            'tab-link',
            'open-popup',
            'close-popup',
            'open-panel',
            'close-panel'
        ];

        for (var i = classBlackList.length -1 ; i >= 0; i--) {
            if ($link.hasClass(classBlackList[i])) {
                return true;
            }
        }

        var linkEle = $link.get(0);
        var linkHref = linkEle.getAttribute('href');

        var protoWhiteList = [
            'http',
            'https'
        ];

        //如果非noscheme形式的链接，且协议不是http(s)，那么路由不会处理这类链接
        if (/^(\w+):/.test(linkHref) && protoWhiteList.indexOf(RegExp.$1) < 0) {
            return true;
        }

        //noinspection RedundantIfStatementJS
        if (linkEle.hasAttribute('external')) {
            return true;
        }

        return false;
    }

    /**
     * 自定义是否执行路由功能的过滤器
     *
     * 可以在外部定义 $.config.routerFilter 函数，实参是点击链接的 Zepto 对象。
     *
     * @param $link 当前点击的链接的 Zepto 对象
     * @returns {boolean} 返回 true 表示执行路由功能，否则不做路由处理
     */
    function customClickFilter($link) {
        var customRouterFilter = $.smConfig.routerFilter;
        if ($.isFunction(customRouterFilter)) {
            var filterResult = customRouterFilter($link);
            if (typeof filterResult === 'boolean') {
                return filterResult;
            }
        }

        return true;
    }

    $(function() {
        // 用户可选关闭router功能
        if (!$.smConfig.router) {
            return;
        }

        if (!Util.supportStorage()) {
            return;
        }

        var $pages = $('.' + routerConfig.pageClass);
        if (!$pages.length) {
            var warnMsg = 'Disable router function because of no .page elements';
            if (window.console && window.console.warn) {
                console.warn(warnMsg);
            }
            return;
        }

        var router = $.router = new Router();

        $(document).on('click', 'a', function(e) {
            var $target = $(e.currentTarget);

            var filterResult = customClickFilter($target);
            if (!filterResult) {
                return;
            }

            if (isInRouterBlackList($target)) {
                return;
            }

            e.preventDefault();

            if ($target.hasClass('back')) {
                router.back();
            } else {
                var url = $target.attr('href');
                if (!url || url === '#') {
                    return;
                }

                var ignoreCache = $target.attr('data-no-cache') === 'true';

                router.load(url, ignoreCache);
            }
        });
    });
}(Zepto);

/**
 * @typedef {Object} State
 * @property {Number} id
 * @property {String} url
 * @property {String} pageId
 */

/**
 * @typedef {Object} UrlObject 字符串 url 转为的对象
 * @property {String} base url 的基本路径
 * @property {String} full url 的完整绝对路径
 * @property {String} origin 转换前的 url
 * @property {String} fragment url 的 fragment
 */

/**
 * @typedef {Object} DocumentCache
 * @property {*|HTMLElement} $doc 看做是 $(document)
 * @property {*|HTMLElement} $content $doc 里的 routerConfig.innerViewClass 元素
 */

/*======================================================
************   Modals   ************
======================================================*/
/*jshint unused: false*/
+function ($) {
  "use strict";
  $.lastPosition =function(options) {
    if ( !sessionStorage) {
        return;
    }
    // 需要记忆模块的className
    var needMemoryClass = options.needMemoryClass || [];

    $(window).off('beforePageSwitch').on('beforePageSwitch', function(event,id,arg) {
      updateMemory(id,arg);
    });
    $(window).off('pageAnimationStart').on('pageAnimationStart', function(event,id,arg) {
      getMemory(id,arg);
    });
    //让后退页面回到之前的高度
    function getMemory(id,arg){
      needMemoryClass.forEach(function(item, index) {
          if ($(item).length === 0) {
              return;
          }
          var positionName = id ;
          // 遍历对应节点设置存储的高度
          var memoryHeight = sessionStorage.getItem(positionName);
          arg.find(item).scrollTop(parseInt(memoryHeight));

      });
    }
    //记住即将离开的页面的高度
    function updateMemory(id,arg) {
        var positionName = id ;
        // 存储需要记忆模块的高度
        needMemoryClass.forEach(function(item, index) {
            if ($(item).length === 0) {
                return;
            }
            sessionStorage.setItem(
                positionName,
                arg.find(item).scrollTop()
            );

        });
    }
  };
}(Zepto);

/*jshint unused: false*/
+function($) {
    'use strict';

    var getPage = function() {
        var $page = $(".page-current");
        if (!$page[0]) $page = $(".page").addClass('page-current');
        return $page;
    };

    //初始化页面中的JS组件
    $.initPage = function(page) {
        var $page = getPage();
        if (!$page[0]) $page = $(document.body);
        var $content = $page.hasClass('content') ?
                       $page :
                       $page.find('.content');
        $content.scroller();  //注意滚动条一定要最先初始化

        $.initPullToRefresh($content);
        $.initInfiniteScroll($content);
        $.initCalendar($content);

        //extend
        if ($.initSwiper) $.initSwiper($content);
    };

    if ($.smConfig.showPageLoadingIndicator) {
        //这里的 以 push 开头的是私有事件，不要用
        $(window).on('pageLoadStart', function() {
            $.showIndicator();

        });
        $(window).on('pageAnimationStart', function() {
            $.hideIndicator();
        });
        $(window).on('pageLoadCancel', function() {
            $.hideIndicator();
        });
        $(window).on('pageLoadComplete', function() {
            $.hideIndicator();
        });
        $(window).on('pageLoadError', function() {
            $.hideIndicator();
            $.toast('加载失败');
        });
    }

    $(window).on('pageAnimationStart', function(event,id,page) {
        // 在路由切换页面动画开始前,为了把位于 .page 之外的 popup 等隐藏,此处做些处理
        $.closeModal();
        $.closePanel();
        // 如果 panel 的 effect 是 reveal 时,似乎是 page 的动画或别的样式原因导致了 transitionEnd 时间不会触发
        // 这里暂且处理一下
        $('body').removeClass('panel-closing');
        $.allowPanelOpen = true;  
    });
   
    $(window).on('pageInit', function() {
        $.hideIndicator();
        $.lastPosition({
            needMemoryClass: [
                '.content'
            ]
        });
    });
    // safari 在后退的时候会使用缓存技术，但实现上似乎存在些问题，
    // 导致路由中绑定的点击事件不会正常如期的运行（log 和 debugger 都没法调试），
    // 从而后续的跳转等完全乱了套。
    // 所以，这里检测到是 safari 的 cache 的情况下，做一次 reload
    // 测试路径(后缀 D 表示是 document，E 表示 external，不使用路由跳转）：
    // 1. aD -> bDE
    // 2. back
    // 3. aD -> bD
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            location.reload();
        }
    });

    $.init = function() {
        var $page = getPage();
        var id = $page[0].id;
        $.initPage();
        $page.trigger('pageInit', [id, $page]);
    };

    //DOM READY
    $(function() {
        //直接绑定
        FastClick.attach(document.body);

        if ($.smConfig.autoInit) {
            $.init();
        }

        $(document).on('pageInitInternal', function(e, id, page) {
            $.init();
        });
    });

}(Zepto);

/**
 * ScrollFix v0.1
 * http://www.joelambert.co.uk
 *
 * Copyright 2011, Joe Lambert.
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
/* ===============================================================================
************   ScrollFix   ************
=============================================================================== */

+ function($) {
    "use strict";
    //安卓微信中使用scrollfix会有问题，因此只在ios中使用，安卓机器按照原来的逻辑

    if($.device.ios){
        var ScrollFix = function(elem) {

            // Variables to track inputs
            var startY;
            var startTopScroll;

            elem = elem || document.querySelector(elem);

            // If there is no element, then do nothing
            if(!elem)
                return;

            // Handle the start of interactions
            elem.addEventListener('touchstart', function(event){
                startY = event.touches[0].pageY;
                startTopScroll = elem.scrollTop;

                if(startTopScroll <= 0)
                elem.scrollTop = 1;

            if(startTopScroll + elem.offsetHeight >= elem.scrollHeight)
                elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
            }, false);
        };

        var initScrollFix = function(){
            var prefix = $('.page-current').length > 0 ? '.page-current ' : '';
            var scrollable = $(prefix + ".content");
            new ScrollFix(scrollable[0]);
        };

        $(document).on($.touchEvents.move, ".page-current .bar",function(){
            event.preventDefault();
        });
        //监听ajax页面跳转
        $(document).on("pageLoadComplete", function(){
             initScrollFix();
        });
        //监听内联页面跳转
        $(document).on("pageAnimationEnd", function(){
             initScrollFix();
        });
        initScrollFix();
    }

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
};/*
 * Aman JavaScript Library
 * Version: 0.3.0.20170419.1411
 */
(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
}(window, function (window, noGlobal) {
    var $s = {};
    var s = {$: $s};
    if (typeof define === "function" && define.amd) {
        define("summer", [], function () {
            return s;
        });
    }
    window.$summer = $s;
    window.summer = s;
    return s;
}));

// $summer  API
;(function () {
    var u = window.$summer || {};
    var isAndroid = (/android/gi).test(navigator.appVersion);
    u.os = (function (env) {
        var browser = {
            info: function () {
                var ua = navigator.userAgent, app = navigator.appVersion;
                return { //移动终端浏览器版本信息
                    //trident: ua.indexOf('Trident') > -1, //IE内核
                    //presto: ua.indexOf('Presto') > -1, //opera内核
                    webKit: ua.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                    //gecko: ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') == -1, //火狐内核
                    mobile: !!ua.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                    ios: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                    android: ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1, //android终端或uc浏览器
                    iPhone: ua.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                    iPad: ua.indexOf('iPad') > -1, //是否iPad
                    //webApp: ua.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                    platform: navigator.platform
                };
            }(),
            lang: (navigator.browserLanguage || navigator.language).toLowerCase()
        };
        if (browser.info.platform.toLowerCase().indexOf("win") >= 0 || browser.info.platform.toLowerCase().indexOf("mac") >= 0) {
            return "pc";
        } else if (browser.info.android) {
            return "android";
        } else if (browser.info.ios || browser.info.iPhone || browser.info.iPad) {
            return "ios";
        } else {
            return "";
        }
    })(u);
    u.isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    u.isFunction = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    };
    u.isEmptyObject = function (obj) {
        if (JSON.stringify(obj) === '{}') {
            return true;
        }
        return false;
    };
    u.alert = function (msg) {
        try {
            if (typeof msg == "string") {
                alert(msg);
            } else if (typeof msg == "object") {
                alert(u.jsonToStr(msg));
            } else {
                alert(msg);
            }
        } catch (e) {
            alert(msg);
        }
    };
    //获取随机的唯一id，随机不重复，长度固定
    u.UUID = function (len) {
        len = len || 6;
        len = parseInt(len, 10);
        len = isNaN(len) ? 6 : len;
        var seed = '0123456789abcdefghijklmnopqrstubwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ';
        var seedLen = seed.length - 1;
        var uid = '';
        while (len--) {
            uid += seed[Math.round(Math.random() * seedLen)];
        }
        return uid;
    };

    u.isJSONObject = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    };
    u.isJSONArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
    u.isFunction = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    };
    //是否为空字符串
    u.isEmpty = function (obj) {
        if (obj === undefined || obj === null || (obj.toString && obj.toString() === "")) {
            return true;
        }
        return false;
    };
    u.check = function (obj, paramNameArray, msg) {
        for (var i = 0, len = paramNameArray.length; i < len; i++) {
            if (obj[paramNameArray[i]] === undefined || obj[paramNameArray[i]] === null) {
                var str = "参数[" + paramNameArray[i] + "]不能为空";
                alert(msg ? msg + str : str);
                return false;
            }
        }
        return true;
    };
    u.checkIfExist = function (obj, paramNameArray, msg) {
        for (var i = 0, len = paramNameArray.length; i < len; i++) {
            var key = paramNameArray[i];
            if (key in obj && $summer.isEmpty(obj[key])) {
                var str = "参数[" + paramNameArray[i] + "]不能为空";
                alert(msg ? msg + str : str);
                return false;
            }
        }
        return true;
    };
    u.isNamespace = function (ns) {
        if (typeof ns == "undefined" || ns === null) {
            return false;
        }
        if (typeof ns == "string" && ns === "") {
            return false;
        }

        if (ns.indexOf(".") < 0 || ns.substring(0, 1) == "." || ns.substring(ns.length - 1) == ".") {
            alert("包名非法，不包含.或以.开始结束");
            return false;
        }

        var nameArr = ns.split(".");
        for (var i = 0, len = nameArr.length; i < len; i++) {
            var name = nameArr[i];
            if (name === "") {
                alert("非法的包名中连续含有两个.");
                return false;
            } else {
                var pattern = /^[a-z]+([a-zA-Z_][a-zA-Z_0-9]*)*$/;
                if (!pattern.test(name)) {
                    alert("非法的包名");
                    return false;
                }
            }
        }
        return true;
    };
    window.$isJSONObject = u.isJSONObject;
    window.$isJSONArray = u.isJSONArray;
    window.$isFunction = u.isFunction;
    window.$isEmpty = u.isEmpty;
    window.$summer = window.$summer || u;
})();

;(function (w) {
    w.$summer = w.$summer || {};
    w.summer = w.summer || {};
    w.api = w.summer;
    (function () {
        try {
            var summerDOMContentLoaded = function () {
                document.addEventListener('DOMContentLoaded', function () {
                    summer.trigger("init");
                    summer.pageParam = window.localStorage;
                    if (typeof summerready == "function")
                        summerready();
                    if (typeof summerReady == "function")
                        summerReady();
                    summer.trigger("ready");
                    summer.trigger("aftershowwin");
                }, false);
            }

            if ($summer.os == "pc" || !window.summerBridge) {
                summer.__debug = true;
                console.log("run by file:// protocol in debug Mode");
                summerDOMContentLoaded();
            } else {
                var url = "";
                if (document.location.href.indexOf("http") === 0) {
                    //1、webapp
                    var strFullPath = window.document.location.href;
                    var strPath = window.document.location.pathname;
                    var pos = strFullPath.indexOf(strPath);
                    var prePath = strFullPath.substring(0, pos); //domain name
                    var postPath = strPath.substring(0, strPath.substr(1).indexOf('/') + 1); //site name
                    w.__$_CORDOVA_PATH = w.__$_CORDOVA_PATH || (prePath + postPath);
                    if ($summer.os == "android") {
                        //alert("android");
                        url = w.__$_CORDOVA_PATH + "/cordova/android/cordova.js";
                    } else if ($summer.os == "ios") {
                        //alert("ios");
                        url = w.__$_CORDOVA_PATH + "/cordova/ios/cordova.js";
                    } else {
                        //alert("请在移动设备上访问");
                    }

                } else {
                    //2、hybrid app
                    if (w.__$_CORDOVA_PATH) {
                        url = w.__$_CORDOVA_PATH + "www/cordova.js";
                    } else {
                        url = document.location.pathname.split("www")[0] + "www/cordova.js";
                    }
                }

                var _script = document.createElement('script');
                _script.id = "cordova_js";
                _script.type = 'text/javascript';
                _script.charset = 'utf-8';
                _script.async = true;
                _script.src = url;
                _script.onload = function (e) {
                    w.$summer.cordova = w.cordova;
                    w.summer.cordova = w.cordova;

                    document.addEventListener('deviceready', function () {
                        summer.trigger("init");//summer.on('init',function(){})

                        //1、先获取页面参数123
                        summer.winParam(function (ret) {
                            //希望返回
                            var ctx = {
                                systemType: "android",//"ios"
                                systemVersion: 7,// ios--> 7    android-->21
                                iOS7StatusBarAppearance: true,//false
                                fullScreen: true,
                                pageParam: {param0: 123, param1: "abc"},
                                screenWidth: "",
                                screenHeight: "",

                                winId: "",
                                winWidth: "",
                                winHeight: "",

                                frameId: "",
                                frameWidth: "",
                                frameHeight: "",

                                appParam: "",
                            };

                            if (typeof ret == "string") {
                                ret = JSON.parse(ret);

                            }
                            summer.pageParam = ret;//put the param in summer
                            if (summer.autoShowWin !== false) {
                                summer.showWin({});
                            }
                            summer.getOpenWinTime({}, function(ret) {
                                var APMJSON = {
                                    "windowid": summer.getSysInfo().winId,
                                    "startTime": ret,
                                    "endTime": new Date().getTime(),
                                    "app_version": summer.getVersion().versionName
                                };
                                var APMPARAMS = ["FeLoad", APMJSON];
                                console.log(APMPARAMS);
                                cordova.require("summer-plugin-apm.SummerAPM").insertAction(APMPARAMS, function(args) {}, function(args) {})
                            }, function(ret) {});
                            if (typeof summerready == "function")
                                summerready();
                            else if (typeof summerReady == "function")
                                summerReady();
                            summer.trigger("ready");

                            summer.trigger("aftershowwin");
                        });
                    }, false);

                };
                _script.onerror = function (e) {
                    summer.__debug = true;
                    console.log("run by http:// protocol in debug Mode");
                    summerDOMContentLoaded();
                };
                //document.currentScript.parentNode.insertBefore(_script, document.currentScript);
                var fs = document.getElementsByTagName('script')[0];
                fs.parentNode.insertBefore(_script, fs);

            }
        } catch (e) {
            console.log(e);
        }
    })();

    w.summer.require = function (mdlName) {
        if (window.$summer["cordova"] != window.cordova) {
            alert("---------warnning : init cordova is too late!");
            window.$summer["cordova"] = window.cordova;
            window.summer["cordova"] = window.cordova;
        }
        if (mdlName == "cordova") {
            return window.summer["cordova"];
        } else {
            return window.summer["cordova"].require(mdlName);
        }
    };
    w.summer.canrequire = function () {
        if (navigator.platform.toLowerCase().indexOf("win") > -1) {
            return false;
        }
        return true;
    };
    w.$summer.require = w.summer.require;

    var EventMgr = function () {
        this._events = {};
    };
    EventMgr.prototype.on = function (evtName, handler) {
        if (this._events[evtName] == undefined) {
            this._events[evtName] = [];
        }
        this._events[evtName].push(handler);
    };
    EventMgr.prototype.off = function (evtName, handler) {
        var handlers = this._events[evtName];
        if (typeof handler == "undefined") {
            delete handlers;
        } else {
            var index = -1;
            for (var i = 0, len = handlers.length; i < len; i++) {
                if (handler == handlers[i]) {
                    index = i;
                    break;
                }
            }
            if (index > 0)
                handlers.remove(index);
        }
    };
    EventMgr.prototype.trigger = function (evtName, sender, args) {
        try {
            var handlers = this._events[evtName];
            if (!handlers) return;
            var handler;
            args = args || {};
            for (var i = 0, len = handlers.length; i < len; i++) {
                handler = handlers[i];
                handler(sender, args);
            }
        } catch (e) {
            alert(e);
        }
    };
    var _ems = new EventMgr();
    w.summer.on = function (eName, fn) {
        _ems.on(eName, fn);
    };
    w.summer.trigger = function (eName) {
        _ems.trigger(eName);
    };
})(window);

//summerBridge 3.0.0.20161031
+function (w, s) {
    //1、兼容Android
    if (w.adrinvoker) alert(w.adrinvoker);
    var adrinvoker = {};
    if (w.adrinvoker && w.adrinvoker.call2) alert(w.adrinvoker.call2);

    //Asynchronous call run as corodva bridge
    adrinvoker.call = function (srvName, strJson) {
        try {
            if (navigator.platform.toLowerCase().indexOf("win") >= 0) {
                alert("执行" + srvName + "完毕\n参数是：" + strJson);
                return;
            }

            strJson = strJson || '{}';
            try {
                return summer.require('summer-plugin-service.XService').call(srvName, JSON.parse(strJson));
            } catch (e) {
                if ($summer.__debug)
                    alert("Excp6.1: 异步调用summer-plugin-service.XService异常:" + e);
                return;
            }
        } catch (e) {
            alert("Excp6: 异步调用adrinvoker.call异常:" + e);
        }
    };

    //Synchronous call as summer bridge
    adrinvoker.call2 = function (srvName, strJson) {
        try {
            if (navigator.platform.toLowerCase().indexOf("win") >= 0) {
                alert("执行" + srvName + "完毕\n参数是：" + strJson);
                return;
            }
            if (typeof summerBridge != "undefined") {
                try {
                    return summerBridge.callSync(srvName, strJson);
                } catch (e) {
                    alert("Excp7.1: summerBridge.callSync异常:" + e);
                }
            } else {
                alert("summerBridge is not defined by native successfully!");
            }
        } catch (e) {
            alert("Excp7: 同步调用adrinvoker.call2异常:" + e);
        }
    };
    w.adrinvoker = adrinvoker;

    //2、兼容ios
    //ios Synchronous
    if (typeof CurrentEnvironment != "undefined") {
        if ($summer.os == "ios") {
            CurrentEnvironment.DeviceType = CurrentEnvironment.DeviceIOS;
        } else if ($summer.os == "android") {
            CurrentEnvironment.DeviceType = CurrentEnvironment.DeviceAndroid;
        } else {
        }
    }
    if (typeof UM_callNativeService == "undefined") {
        var UM_callNativeService = function (serviceType, strParams) {//同步调用，和安卓统一接口
            return adrinvoker.call2(serviceType, strParams);
        };
    } else {
        alert("UM_callNativeService is exist! fatal error!");
        alert(UM_callNativeService);
    }
    w.UM_callNativeService = UM_callNativeService;

    //ios Asynchronous
    if (typeof UM_callNativeServiceNoraml == "undefined") {
        var UM_callNativeServiceNoraml = function (serviceType, strParams) {//异步调用，和安卓统一接口
            return adrinvoker.call(serviceType, strParams);
        };
    } else {
        alert("UM_callNativeServiceNoraml is exist! fatal error!");
        alert(UM_callNativeServiceNoraml);
    }
    w.UM_callNativeServiceNoraml = UM_callNativeServiceNoraml;

    //3、
    s.callSync = function (serivceName, strJson) {
        var strParam = strJson;
        if (typeof strJson == "object") {
            strParam = JSON.stringify(strJson);
        } else if (typeof strJson != "string") {
            strParam = strJson.toString();
        }
        try {
            return summerBridge.callSync(serivceName, strParam);
        } catch (e) {
            if ($summer.os == "pc") {
                return strJson;
            }
            alert(e);
        }
    };
    //20160815
    s.callCordova = function (cordovaPlugName, plugFnName, json, successFn, errFn) {
        if (this.canrequire() && !this.__debug) {
            var plug = this.cordova.require(cordovaPlugName);
            if (plug && plug[plugFnName]) {
                plug[plugFnName](json, successFn, errFn);
            } else {
                alert("the cordova plug[" + cordovaPlugName + "]'s method[" + plugFnName + "] not implementation");
            }
        } else {
            console.log("the cordova plug[" + cordovaPlugName + "]'s method[" + plugFnName + "] executed!");
        }
    };

}(window, summer);


//summer API
+function (w, s) {
    if (!s) {
        s = {};
        w.summer = s;
    }
    s.window = {
        openFrame: function (json, successFn, errFn) {
            json["animation"] = json["animation"] || {};
            json["pageParam"] = json["pageParam"] || {};

            if (json["rect"] && !json["position"]) {
                json["position"] = {};
                json["position"].left = json["rect"].x;
                json["position"].top = json["rect"].y;
                json["position"].width = json["rect"].w;
                json["position"].height = json["rect"].h;

            }
            if (json["name"] && !json["id"]) {
                json["id"] = json["name"];
            }
            if (json["alert"]) {
                $summer.alert(json);
                delete json["alert"];
            }
            return s.callCordova('summer-plugin-frame.XFrame', 'openFrame', json, successFn, errFn);
        },
        closeFrame: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'closeFrame', json, successFn, errFn);
        },
        openFrameGroup: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'openFrameGroup', json, successFn, errFn);
        },
        closeFrameGroup: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'closeFrameGroup', json, successFn, errFn);
        },
        setFrameGroupAttr: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'setFrameGroupAttr', json, successFn, errFn);
        },
        setFrameGroupIndex: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'setFrameGroupIndex', json, successFn, errFn);
        },
        openWin: function (json, successFn, errFn) {
            if(!json["animation"]){
                json["animation"]={
                    type:"push", 
                    subType:"from_right", 
                    duration:300 
                };
            }
            return s.callCordova('summer-plugin-frame.XFrame', 'openWin', json, successFn, errFn);
        },
        // ios下，退出登录，关闭其他页面
        initializeWin: function (json, successFn, errFn) {
            if ($summer.os == "ios") {
                return s.callCordova('summer-plugin-frame.XFrame', 'initializeWin', json, successFn, errFn);
            } else if ($summer.os == "android") {
                if (json.id && json.url && json.toId) {
                    summer.openWin({"id" : json.id, "url" : json.url, "isKeep" : false});
                    summer.closeToWin({id : json.toId});
                }
            }
        },
        // ios下，重新挂载事件监听
        addEventListener: function (json, successFn, errFn) {
            if ($summer.os == "ios") {
                return s.callCordova('summer-plugin-frame.XFrame', 'addEventListener', json, successFn, errFn);
            } else if ($summer.os == "android") {
                if (json.event && json.handler) {
                    var handler = json.handler.replace(/\(|\)/g,'');
                    document.addEventListener(json.event, eval("("+ handler +")"), false);
                }
            }
        },
        createWin: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'createWin', json, successFn, errFn);
        },
        getOpenWinTime: function (json, successFn, errFn) {
            return s.callCordova("summer-plugin-frame.XFrame", "getOpenWinTime", json, successFn, errFn)
        },
        showWin: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'showWin', json, successFn, errFn);
        },
        setWinAttr: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'setWinAttr', json, successFn, errFn);
        },
        closeWin: function (json, successFn, errFn) {
            if (typeof json == "string") {
                json = {"id": json};
            } else if (typeof json == "undefined") {
                json = {}
            }
            return s.callCordova('summer-plugin-frame.XFrame', 'closeWin', json, successFn, errFn);
        },
        closeToWin: function (json, successFn, errFn) {
            if (typeof json == "string") {
                json = {"id": json};
            } else if (typeof json == "undefined") {
                json = {};
            }
            return s.callCordova('summer-plugin-frame.XFrame', 'closeToWin', json, successFn, errFn);
        },
        getSysInfo: function (json, successFn, errFn) {
            if (typeof json == "string") {
                json = alert("parameter json is required json object type, but is string type");
            }
            var param = json || {
                systemType: "android",//"ios"
                systemVersion: 7,// ios--> 7    android-->21
                statusBarAppearance: true,//false
                fullScreen: true,
                pageParam: {param0: 123, param1: "abc"},
                screenWidth: "",
                screenHeight: "",
                winId: "",
                winWidth: "",
                winHeight: "",
                frameId: "",
                frameWidth: "",
                frameHeight: "",
                statusBarHeight: "",
                statusBarStyle: "",
                appParam: "",
            };
            return JSON.parse(s.callSync('SummerDevice.getSysInfo', param));
        },
        setFrameAttr: function (json, successFn, errFn) {
            if (s.canrequire())
                return s.cordova.require('summer-plugin-frame.XFrame').setFrameAttr(json, successFn, errFn);
        },
        winParam: function (json, successFn, errFn) {
            if (s.canrequire())
                return s.cordova.require('summer-plugin-frame.XFrame').winParam(json, successFn, errFn);
        },
        frameParam: function (json, successFn, errFn) {
            if (s.canrequire())
                return s.cordova.require('summer-plugin-frame.XFrame').frameParam(json, successFn, errFn);
        },
        setRefreshHeaderInfo: function (json, successFn, errFn) {
            if (s.canrequire())
                return s.cordova.require('summer-plugin-frame.XFrame').setRefreshHeaderInfo(json, successFn, errFn);
        },
        refreshHeaderLoadDone: function (json, successFn, errFn) {
            if (s.canrequire())
                return s.cordova.require('summer-plugin-frame.XFrame').refreshHeaderLoadDone(json, successFn, errFn);
        },
        refreshHeaderBegin: function (json, successFn, errFn) {
            if (s.canrequire()) {
                return s.cordova.require("summer-plugin-frame.XFrame").refreshHeaderBegin(json, successFn, errFn)
            }
        },
        setRefreshFooterInfo: function (json, successFn, errFn) {
            if (s.canrequire())
                return s.cordova.require('summer-plugin-frame.XFrame').setRefreshFooterInfo(json, successFn, errFn);
        },
        refreshFooterLoadDone: function (json, successFn, errFn) {
            if (s.canrequire())
                return s.cordova.require('summer-plugin-frame.XFrame').refreshFooterLoadDone(json, successFn, errFn);
        },
        refreshFooterBegin: function (json, successFn, errFn) {
            if (s.canrequire()) {
                return s.cordova.require("summer-plugin-frame.XFrame").refreshFooterBegin(json, successFn, errFn)
            }
        },
        hideLaunch: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'removeStartPage', json, successFn, errFn);
        },
        setTabbarIndex: function (json, successFn, errFn) {
            return s.callCordova('summer-plugin-frame.XFrame', 'setTabbarItemSelect', json, successFn, errFn);
        }
    };


    //核心API直接通过 summer.xxx()访问
    s.openFrame = s.window.openFrame;
    s.closeFrame = s.window.closeFrame;
    s.openWin = s.window.openWin;
    s.initializeWin = s.window.initializeWin;
    s.addEventListener = s.window.addEventListener;
    s.setWinAttr = s.window.setWinAttr;
    s.createWin = s.window.createWin;
    s.getOpenWinTime = s.window.getOpenWinTime;
    s.showWin = s.window.showWin;
    s.closeWin = s.window.closeWin;
    s.closeToWin = s.window.closeToWin;
    s.getSysInfo = s.window.getSysInfo;
    s.winParam = s.window.winParam;
    s.frameParam = s.window.frameParam;
    s.setFrameAttr = s.window.setFrameAttr;
    s.setRefreshHeaderInfo = s.window.setRefreshHeaderInfo;
    s.refreshHeaderLoadDone = s.window.refreshHeaderLoadDone;
    s.refreshHeaderBegin = s.window.refreshHeaderBegin;
    s.setRefreshFooterInfo = s.window.setRefreshFooterInfo;
    s.refreshFooterLoadDone = s.window.refreshFooterLoadDone;
    s.refreshFooterBegin = s.window.refreshFooterBegin;
    s.openFrameGroup = s.window.openFrameGroup;
    s.closeFrameGroup = s.window.closeFrameGroup;
    s.setFrameGroupAttr = s.window.setFrameGroupAttr;
    s.setFrameGroupIndex = s.window.setFrameGroupIndex;
    s.hideLaunch = s.window.hideLaunch;
    s.setTabbarIndex = s.window.setTabbarIndex;

    s.showProgress = function (json) {
        if (!s.canrequire()) return;
        var invoker = summer.require('summer-plugin-service.XService');
        json = json || {};
        invoker.call("UMJS.showLoadingBar", json);
    };
    s.hideProgress = function (json) {
        if (!s.canrequire()) return;
        var invoker = summer.require('summer-plugin-service.XService');
        json = json || {};
        invoker.call("UMJS.hideLoadingBar", json);
    };
    s.toast = function (json) {
        if (!s.canrequire()) return;
        var invoker = summer.require('summer-plugin-service.XService');
        json = json || {};
        invoker.call("UMJS.toast", json);
    };
    //upload方法
    s.upload = function (json, sFn, eFn, headers) {
        var fileURL = json.fileURL,
            type = json.type,
            params = json.params;
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = type;

        options.params = params;
        options.httpMethod = "POST";
        options.headers = headers || {};

        var ft = new FileTransfer();
        var SERVER = json.SERVER;
        ft.upload(fileURL, encodeURI(SERVER), sFn, eFn, options);
    };
    //多图多文件批量上传 
    s.multiUpload= function(json,successFn,errFn){
        json["callback"]=successFn;
        json["error"]=errFn;
        return  s.callService('UMFile.multiUpload', json, false);
    };
    s.eval = function (script) {
        var t = setTimeout("try{eval(" + script + ")}catch(e){alert(e)}", 10);
    };
    //仅支持当前Win中的 各个frame和当前win之间的相互执行脚本
    s.execScript = function (json) {
        if (typeof json == "object") {
            //json.execFn = "summer.eval"
            if (json.script) {
                json.script = "try{" + json.script + "}catch(e){alert(e)}";
            } else {
                alert("the parameter script of the execScript function is " + json.script);
            }
        }
        if (s.canrequire()) {
            return this.callCordova('summer-plugin-frame.XFrame', 'execScript', json, null, null);
        }
    };

    //持久化本地存储
    var umStorage = function (type) {
        type = type || "localStorage";
        if (type == "localStorage") {
            if (!window.localStorage) {
                alert('your device do not support the localStorage');
                return;
            }
            return window.localStorage;
        } else if (type == "sessionStorage") {
            if (!window.sessionStorage) {
                alert('your device do not support the sessionStorage');
                return;
            }
            return window.sessionStorage;
        } else if (type == "application") {
            return {
                setItem: function (key, value) {
                    var json = {
                        key: key,
                        value: value
                    };
                    return s.callSync("SummerStorage.writeApplicationContext", JSON.stringify(json));
                },
                getItem: function (key) {
                    var json = {
                        key: key
                    };
                    return s.callSync("SummerStorage.readApplicationContext", JSON.stringify(json));
                }
            };
        } else if (type == "configure") {
            return {
                setItem: function (key, value) {
                    var json = {
                        key: key,
                        value: typeof value == "string" ? value : JSON.stringify(value)
                    };
                    return s.callSync("SummerStorage.writeConfigure", JSON.stringify(json));
                },
                getItem: function (key) {
                    var json = {
                        key: key
                    };
                    return s.callSync("SummerStorage.readConfigure", JSON.stringify(json));
                }
            };
        } else if (type == "window") {
            return {
                setItem: function (key, value) {
                    var json = {
                        key: key,
                        value: typeof value == "string" ? value : JSON.stringify(value)
                    };
                    return s.callSync("SummerStorage.writeWindowContext", JSON.stringify(json));
                },
                getItem: function (key) {
                    var json = {
                        key: key
                    };
                    return s.callSync("SummerStorage.readWindowContext", JSON.stringify(json));
                }
            };
        }
    };
    s.setStorage = function (key, value, storageType) {
        var v = value;
        if (storageType != "configure") {
            if (typeof v == 'object') {
                v = JSON.stringify(v);
                v = 'obj-' + v;
            } else {
                v = 'str-' + v;
            }
        }
        var ls = umStorage(storageType);
        if (ls) {
            ls.setItem(key, v);
        }
    };
    s.getStorage = function (key, storageType) {
        var ls = umStorage(storageType);
        if (ls) {
            var v = ls.getItem(key);
            if (!v) {
                return;
            }
            if (storageType != "configure") {
                if (v.indexOf('obj-') === 0) {
                    v = v.slice(4);
                    return JSON.parse(v);
                } else if (v.indexOf('str-') === 0) {
                    return v.slice(4);
                } else {
                    return v;
                }
            } else {
                return v;
            }
        }
    };

    s.setAppStorage = function (key, value) {
        return s.setStorage(key, value, "application");
    };
    s.getAppStorage = function (key) {
        return s.getStorage(key, "application");
    };
    s.setWindowStorage = function (key, value) {
        return s.setStorage(key, value, "window");
    };
    s.getWindowStorage = function (key) {
        return s.getStorage(key, "window");
    };

    s.rmStorage = function (key) {
        var ls = umStorage();
        if (ls && key) {
            ls.removeItem(key);
        }
    };
    s.clearStorage = function () {
        var ls = umStorage();
        if (ls) {
            ls.clear();
        }
    };

    s.sysInfo = function (json, successFn, errFn) {
        if (s.canrequire())
            return s.cordova.require('summer-plugin-frame.XService').sysInfo(json, successFn, errFn);
    };
    s.getAppVersion = function (json) {
        return s.callSync('XUpgrade.getAppVersion', json || {});
    };
    s.upgradeApp = function (json, successFn, errFn) {
        return s.callCordova('summer-plugin-core.XUpgrade', 'upgradeApp', json, successFn, errFn);
    };
    s.getVersion = function (json) {
        var ver = s.callSync('XUpgrade.getVersion', json || {});
        if (typeof ver == "string") {
            return JSON.parse(ver);
        } else {
            alert("getVersion' return value is not string!");
            return ver;
        }
    };
    s.upgrade = function (json, successFn, errFn) {
        return s.callCordova('summer-plugin-core.XUpgrade', 'upgrade', json, successFn, errFn);
    };
    //退出
    s.exitApp = function (json, successFn, errFn) {
        return s.callCordova('summer-plugin-core.XUpgrade', 'exitApp', json || {}, successFn, errFn);
    };

    s.collectInfos = function (json) {
        var APMPARAMS = ["login", json];
        cordova.require("summer-plugin-apm.SummerAPM").insertAction(APMPARAMS, function (args) {
        }, function (args) {
        });
    };
    //安卓手动获取权限
    s.getPermission = function (json, successFn, errFn) {
        if ($summer.os == 'android') {
            return s.callCordova('summer-plugin-service.XService', 'getPermission', json, successFn, errFn);
        }
    };
}(window, summer);
//HTML DOM API
;(function (window) {
    var u = window.$summer || {};
    u.isElement = function (obj) {
        return !!(obj && obj.nodeType == 1);
    };
    u.addEvt = function (el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$summer.addEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.addEventListener) {
            el.addEventListener(name, fn, useCapture);
        }
    };
    u.rmEvt = function (el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$summer.rmEvt Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        if (el.removeEventListener) {
            el.removeEventListener(name, fn, useCapture);
        }
    };
    u.one = function (el, name, fn, useCapture) {
        if (!u.isElement(el)) {
            console.warn('$api.one Function need el param, el param must be DOM Element');
            return;
        }
        useCapture = useCapture || false;
        var that = this;
        var cb = function () {
            fn && fn();
            that.rmEvt(el, name, cb, useCapture);
        };
        that.addEvt(el, name, cb, useCapture);
    };
    u.dom = function (el, selector) {
        if (arguments.length === 1 && typeof arguments[0] == 'string') {
            if (document.querySelector) {
                return document.querySelector(arguments[0]);
            }
        } else if (arguments.length === 2) {
            if (el.querySelector) {
                return el.querySelector(selector);
            }
        }
    };
    u.domAll = function (el, selector) {
        if (arguments.length === 1 && typeof arguments[0] == 'string') {
            if (document.querySelectorAll) {
                return document.querySelectorAll(arguments[0]);
            }
        } else if (arguments.length === 2) {
            if (el.querySelectorAll) {
                return el.querySelectorAll(selector);
            }
        }
    };
    u.byId = function (id) {
        return document.getElementById(id);
    };
    u.first = function (el, selector) {
        if (arguments.length === 1) {
            if (!u.isElement(el)) {
                console.warn('$summer.first Function need el param, el param must be DOM Element');
                return;
            }
            return el.children[0];
        }
        if (arguments.length === 2) {
            return this.dom(el, selector + ':first-child');
        }
    };
    u.last = function (el, selector) {
        if (arguments.length === 1) {
            if (!u.isElement(el)) {
                console.warn('$summer.last Function need el param, el param must be DOM Element');
                return;
            }
            var children = el.children;
            return children[children.length - 1];
        }
        if (arguments.length === 2) {
            return this.dom(el, selector + ':last-child');
        }
    };
    u.eq = function (el, index) {
        return this.dom(el, ':nth-child(' + index + ')');
    };
    u.not = function (el, selector) {
        return this.domAll(el, ':not(' + selector + ')');
    };
    u.prev = function (el) {
        if (!u.isElement(el)) {
            console.warn('$api.prev Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.previousSibling;
        if (node.nodeType && node.nodeType === 3) {
            node = node.previousSibling;
            return node;
        }
    };
    u.next = function (el) {
        if (!u.isElement(el)) {
            console.warn('$api.next Function need el param, el param must be DOM Element');
            return;
        }
        var node = el.nextSibling;
        if (node.nodeType && node.nodeType === 3) {
            node = node.nextSibling;
            return node;
        }
    };
    u.closest = function (el, selector) {
        if (!u.isElement(el)) {
            console.warn('$api.closest Function need el param, el param must be DOM Element');
            return;
        }
        var doms, targetDom;
        var isSame = function (doms, el) {
            var i = 0, len = doms.length;
            for (i; i < len; i++) {
                if (doms[i].isEqualNode(el)) {
                    return doms[i];
                }
            }
            return false;
        };
        var traversal = function (el, selector) {
            doms = u.domAll(el.parentNode, selector);
            targetDom = isSame(doms, el);
            while (!targetDom) {
                el = el.parentNode;
                if (el !== null && el.nodeType == el.DOCUMENT_NODE) {
                    return false;
                }
                traversal(el, selector);
            }

            return targetDom;
        };

        return traversal(el, selector);
    };
    u.contains = function (parent, el) {
        var mark = false;
        if (el === parent) {
            mark = true;
            return mark;
        } else {
            do {
                el = el.parentNode;
                if (el === parent) {
                    mark = true;
                    return mark;
                }
            } while (el === document.body || el === document.documentElement);

            return mark;
        }

    };
    u.remove = function (el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    };
    u.attr = function (el, name, value) {
        if (!u.isElement(el)) {
            console.warn('$api.attr Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length == 2) {
            return el.getAttribute(name);
        } else if (arguments.length == 3) {
            el.setAttribute(name, value);
            return el;
        }
    };
    u.removeAttr = function (el, name) {
        if (!u.isElement(el)) {
            console.warn('$api.removeAttr Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 2) {
            el.removeAttribute(name);
        }
    };
    u.hasCls = function (el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.hasCls Function need el param, el param must be DOM Element');
            return;
        }
        if (el.className.indexOf(cls) > -1) {
            return true;
        } else {
            return false;
        }
    };
    u.addCls = function (el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.addCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.add(cls);
        } else {
            var preCls = el.className;
            var newCls = preCls + ' ' + cls;
            el.className = newCls;
        }
        return el;
    };
    u.removeCls = function (el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.removeCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.remove(cls);
        } else {
            var preCls = el.className;
            var newCls = preCls.replace(cls, '');
            el.className = newCls;
        }
        return el;
    };
    u.toggleCls = function (el, cls) {
        if (!u.isElement(el)) {
            console.warn('$api.toggleCls Function need el param, el param must be DOM Element');
            return;
        }
        if ('classList' in el) {
            el.classList.toggle(cls);
        } else {
            if (u.hasCls(el, cls)) {
                u.addCls(el, cls);
            } else {
                u.removeCls(el, cls);
            }
        }
        return el;
    };
    u.val = function (el, val) {
        if (!u.isElement(el)) {
            console.warn('$api.val Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            switch (el.tagName) {
                case 'SELECT':
                    var value = el.options[el.selectedIndex].value;
                    return value;
                case 'INPUT':
                    return el.value;
                case 'TEXTAREA':
                    return el.value;
            }
        }
        if (arguments.length === 2) {
            switch (el.tagName) {
                case 'SELECT':
                    el.options[el.selectedIndex].value = val;
                    return el;
                case 'INPUT':
                    el.value = val;
                    return el;
                case 'TEXTAREA':
                    el.value = val;
                    return el;
            }
        }
    };
    u.prepend = function (el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.prepend Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterbegin', html);
        return el;
    };
    u.append = function (el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.append Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforeend', html);
        return el;
    };
    u.before = function (el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.before Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('beforebegin', html);
        return el;
    };
    u.after = function (el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.after Function need el param, el param must be DOM Element');
            return;
        }
        el.insertAdjacentHTML('afterend', html);
        return el;
    };
    u.html = function (el, html) {
        if (!u.isElement(el)) {
            console.warn('$api.html Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            return el.innerHTML;
        } else if (arguments.length === 2) {
            el.innerHTML = html;
            return el;
        }
    };
    u.text = function (el, txt) {
        if (!u.isElement(el)) {
            console.warn('$api.text Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 1) {
            return el.textContent;
        } else if (arguments.length === 2) {
            el.textContent = txt;
            return el;
        }
    };
    u.offset = function (el) {
        if (!u.isElement(el)) {
            console.warn('$api.offset Function need el param, el param must be DOM Element');
            return;
        }
        var sl, st;
        if (document.documentElement) {
            sl = document.documentElement.scrollLeft;
            st = document.documentElement.scrollTop;
        } else {
            sl = document.body.scrollLeft;
            st = document.body.scrollTop;
        }
        var rect = el.getBoundingClientRect();
        return {
            l: rect.left + sl,
            t: rect.top + st,
            w: el.offsetWidth,
            h: el.offsetHeight
        };
    };
    u.css = function (el, css) {
        if (!u.isElement(el)) {
            console.warn('$api.css Function need el param, el param must be DOM Element');
            return;
        }
        if (typeof css == 'string' && css.indexOf(':') > 0) {
            el.style && (el.style.cssText += ';' + css);
        }
    };
    u.cssVal = function (el, prop) {
        if (!u.isElement(el)) {
            console.warn('$api.cssVal Function need el param, el param must be DOM Element');
            return;
        }
        if (arguments.length === 2) {
            var computedStyle = window.getComputedStyle(el, null);
            return computedStyle.getPropertyValue(prop);
        }
    };
    u.jsonToStr = function (json) {
        if (typeof json === 'object') {
            return JSON && JSON.stringify(json);
        } else {
            alert("$summer.jsonToStr's parameter is not a json, it's typeof is " + typeof json);
        }
    };
    u.strToJson = function (str) {
        if (typeof str === 'string') {
            return JSON && JSON.parse(str);
        } else {
            alert("$summer.strToJson's parameter is not a string, it's typeof is " + typeof str);
        }
    };
    //gct api
    u.winWidth = function () {
        return document.documentElement.offsetWidth || document.body.offsetWidth;
    };
    //gct api
    u.winHeight = function () {
        return document.documentElement.offsetHeight || document.body.offsetHeight;
    };
    /******************** HTML API END ********************/


    /******************** Native API BEGIN ********************/
    u.fixStatusBar = function (el) {
        if (!u.isElement(el)) {
            alert('$summer.fixStatusBar Function need el param, el param must be DOM Element');
            return;
        }

        var sysInfo = summer.getSysInfo();
        var strST = sysInfo.systemType;
        var strSV = sysInfo.systemVersion;
        var fullScreen = sysInfo.fullScreen;
        var statusBarAppearance = sysInfo.statusBarAppearance;
        var statusBarHeight = sysInfo.statusBarHeight;
        if ((strST == "ios" && fullScreen && statusBarAppearance == '1') || strST == "pc") {
            el.style.paddingTop = '20px';
            $(el).children().css("top", "20px");
        } else if (strST == "android" && fullScreen && statusBarAppearance) {
            el.style.paddingTop = statusBarHeight + 'px';
            $(el).children().css("top", statusBarHeight + 'px');
        }
    };

    window.$summer = window.$summer || u;
    window.$api = window.$summer;
})(window);

//summer native service v3.0.2016092011
+function (w, s) {
    w.$__cbm = {};
    if (!s) {
        s = {};
        w.summer = s;
    }
    //----------------------------------------------------------------------
    s.UMService = {
        //统一API，summer.callService(), supported by dsl and summer
        call: function (serviceType, jsonArgs, isSync) {
            try {
                jsonArgs = jsonArgs || {};
                var serviceparams = "";

                //Setp1: jsonArgs JSON Format
                if (typeof jsonArgs == "string") {
                    try {
                        var json = JSON.parse(jsonArgs);
                        if (typeof json != "object") {
                            alert("调用服务[" + serviceType + "]时参数不是一个有效的json字符串。参数是" + jsonArgs);
                            return;
                        }
                        jsonArgs = json;
                    } catch (e) {
                        alert("调用服务[" + serviceType + "]时参数不是一个有效的json字符串。参数是" + jsonArgs);
                        alert(e);
                        return;
                    }
                }


                if (typeof jsonArgs == "object") {
                    //Setp2: callback proxy
                    s.UMService._callbackProxy(jsonArgs, "callback");

                    //Setp3: error proxy
                    s.UMService._callbackProxy(jsonArgs, "error");

                    try {
                        serviceparams = $summer.jsonToStr(jsonArgs);
                        if (typeof serviceparams == "object") {
                            //转string后仍然为json，则报错，规定：调用服务的参数如果是字符串，必须是能转为json的字符串才行
                            alert("调用服务[" + serviceType + "]时传递的参数不能标准化为json字符串，请检查参数格式" + jsonArgs);
                            return;
                        }
                    } catch (e) {
                        alert("Excp4: 校验jsonArgs是否可jsonToStr时异常:" + e);
                    }

                    if (isSync) {
                        try {
                            return adrinvoker.call2(serviceType, serviceparams);
                        } catch (e) {
                            alert("Excp5.1: 同步调用adrinvoker.call2异常:" + e);
                        }
                    } else {
                        try {
                            return adrinvoker.call(serviceType, serviceparams);
                        } catch (e) {
                            alert("Excp5.2: 异步调用adrinvoker.call异常:" + e);
                        }
                    }
                } else {
                    alert("调用$service.call(" + serviceType + ", jsonArgs, " + isSync + ")时不合法,参数jsonArgs类型为" + typeof jsonArgs);
                    return;
                }


            } catch (e) {
                var info = "";
                if (isSync)
                    info = "Excp601:调用$service.call(\"" + serviceType + "\", jsonArgs, " + isSync + ")时发生异常,请检查!";
                else
                    info = "Excp602:调用$service.call(\"" + serviceType + "\", jsonArgs)时发生异常,请检查!";
                console.log(info);
                alert(info + ", 更多请使用chrome inspect调试查看console日志;\n错误堆栈信息e为:\n" + e);
            }
        },
        _callbackProxy: function (jsonArgs, callback_KEY) {
            try {
                if (!jsonArgs[callback_KEY])
                    return true;
                if (typeof(jsonArgs[callback_KEY]) == "string") {
                    var cbName = "";
                    try {
                        cbName = jsonArgs[callback_KEY].substring(0, jsonArgs[callback_KEY].indexOf("("));
                        var cbFn = window[cbName];
                        if (typeof cbFn != "function") {
                            alert("Excpt2.91:" + cbName + " is not a function, and must be a global function!\nit's typeof is " + typeof cbFn);
                            return false;
                        }
                        jsonArgs[callback_KEY] = cbFn;
                    } catch (e) {
                        alert("Excpt2.96: callback define error!\n" + cbName + " is not a valid global function");
                        return false;
                    }
                }

                if (typeof(jsonArgs[callback_KEY]) == "function") {
                    var _cbProxy = "__UMCB_" + $summer.UUID(8);
                    while ($__cbm[_cbProxy]) {
                        _cbProxy = "__UMCB_" + $summer.UUID(8);
                    }
                    $__cbm[_cbProxy] = jsonArgs[callback_KEY];

                    window[_cbProxy] = function (sender, args) {
                        try {
                            if (args == undefined) {
                                args = sender;//compatible
                            }
                            $__cbm[_cbProxy](sender, args);
                        } catch (e) {
                            alert(e);
                        } finally {
                            return;
                            if (!jsonArgs["__keepCallback"]) {
                                delete $__cbm[_cbProxy];
                                delete window[_cbProxy];
                            }
                            alert("del after");
                        }
                    };
                    jsonArgs[callback_KEY] = _cbProxy + "()";
                    return true;
                }
                return false;
            } catch (e) {
                alert("Excp603: Exception in handling callback proxy:\n" + e);
                return false;
            }
        },
        openHTTPS: function (json) {
            if ($summer.isJSONObject(json)) {
                if (!json.ishttps) {
                    alert("请输入true或者false");
                    return;
                }
                return s.callService("UMService.openHTTPS", json, false);
            } else {
                alert("参数不是有效的JSONObject");
            }
        },
        writeConfig: function (key, val) {
            //1、准备参数
            var args = {};
            if (arguments.length == 1 && typeof arguments[0] == "object") {
                args = key;
            } else if (arguments.length == 2) {
                args[key] = val;
            } else {
                alert("writeConfig时,参数不合法");
                return;
            }
            //2、调用服务
            return s.callService("UMService.writeConfigure", args, false);
        },
        readConfig: function (name) {
            //1、准备参数
            var args = {};
            if (typeof name == "string")
                args[name] = name;
            else {
                alert("readConfig时，不支持参数[name]的参数类型为" + typeof name);
                return;
            }
            //2、调用服务
            return s.callService("UMService.readConfigure", args, false);
        },
        setAppContext: function (ret) {
            //1、准备参数
            var args = {};
            if (arguments.length == 1 && typeof arguments[0] == "object") {
                for (var key in ret) {
                    if (key == "version") {
                        args["versionname"] = ret[key];
                        args["appversion"] = ret[key];
                    } else if (key == "userid") {
                        args["userid"] = ret[key];
                        args["user"] = ret[key];
                    } else {
                        args[key] = ret[key];
                    }
                }
            } else {
                alert("setAppContext时,参数不合法");
                return;
            }
            //2、调用服务
            return s.callService("UMCtx.setAppValue", args, false);
        },
        callAction: function (controllerName, actionName, params, isDataCollect, callbackActionID, contextmapping, customArgs) {
            if (arguments.length == 1 && typeof arguments[0] == "object") {
                var args = {};
                args = controllerName;
                return s.callService("UMService.callAction", args, false);
            } else {
                var args = {};
                args["viewid"] = controllerName;
                args["action"] = actionName;
                args["params"] = params;
                args["isDataCollect"] = isDataCollect;
                args["callback"] = callbackActionID;
                args["contextmapping"] = contextmapping;
                if (customArgs) {//处理自定义参数，用于该服务的参数扩展
                    for (var key in customArgs) {
                        args[key] = customArgs[key];
                    }
                }
                return s.callService("UMService.callAction", args);
            }
        },
        get: function (json) {
            if ($summer.isJSONObject(json)) {
                if (!json.url) {
                    alert("请输入请求的url");
                    return;
                }
                return s.callService("UMService.get", json, false);
            } else {
                alert("参数不是有效的JSONObject");
            }
        },
        post: function (json) {
            if ($summer.isJSONObject(json)) {
                if (!json.url) {
                    alert("请输入请求的url");
                    return;
                }
                return s.callService("UMService.post", json, false);
            } else {
                alert("参数不是有效的JSONObject");
            }
        }
    };
    s.callServiceEx = function (json, successFn, errFn) {
        if (!json.params) {
            json.params = {}
        }
        if(successFn){
            json.params["callback"] = successFn;
            s.UMService._callbackProxy(json.params, "callback");
        }
        if(errFn){
            json.params["error"] = errFn;
            s.UMService._callbackProxy(json.params, "error");
        }
        return s.callCordova('summer-plugin-service.XService', 'callSync', json, null, null);
    };

    s.UMDevice = {
        _deviceInfo_Screen: null,
        getTimeZoneID: function () {
            return s.callService("UMDevice.getTimeZoneID", "", true);
        },
        getTimeZoneDisplayName: function () {
            return s.callService("UMDevice.getTimeZoneDisplayName", {}, true); //无参调用统一使用{}
        },
        openAddressBook: function () {
            return s.callService("UMDevice.openAddressBook", {});
        },
        getInternalMemoryInfo: function () {
            return s.callService("UMDevice.getInternalMemoryInfo", {}, true);
        },
        getExternalStorageInfo: function () {
            return s.callService("UMDevice.getExternalStorageInfo", {}, true);
        },
        getMemoryInfo: function () {
            return s.callService("UMDevice.getMemoryInfo", {}, true);
        },
        openWebView: function (args) {
            if (!$summer.isJSONObject(args)) {
                alert("调用gotoMapView服务时，参数不是一个有效的JSONObject");
            }
            return s.callService("UMDevice.openWebView", args);
        },
        screenShot: function (args) {

            return s.callService("UMDevice.screenshot", args, true);
        },
        notify: function (args) {
            s.callService("UMService.localNotification", args);
        },
        getDeviceInfo: function (jsonArgs) {
            var result = "";
            if (jsonArgs) {
                result = s.callService("UMDevice.getDeviceInfo", $summer.jsonToStr(jsonArgs), false);
            } else {
                result = s.callService("UMDevice.getDeviceInfo", "", true);
            }
            return JSON.parse(result);
        },
        getScreenWidth: function () {
            if (!this._deviceInfo_Screen) {
                var strd_info = this.getDeviceInfo();
                var info = JSON.parse(strd_info);
                this._deviceInfo_Screen = info.screen;
            }
            if (this._deviceInfo_Screen) {
                return this._deviceInfo_Screen.width;
            } else {
                alert("未能获取到该设备的屏幕信息");
            }
        },
        getScreenHeight: function () {
            if (!this._deviceInfo_Screen) {
                var strd_info = this.getDeviceInfo();
                var info = JSON.parse(strd_info);
                this._deviceInfo_Screen = info.screen;
            }
            if (this._deviceInfo_Screen) {
                return this._deviceInfo_Screen.height;
            } else {
                alert("未能获取到该设备的屏幕信息");
            }
        },
        getScreenDensity: function () {
            if (!this._deviceInfo_Screen) {
                var strd_info = this.getDeviceInfo();
                var info = JSON.parse(strd_info);
                this._deviceInfo_Screen = info.screen;
            }
            if (this._deviceInfo_Screen) {
                return this._deviceInfo_Screen.density;
            } else {
                alert("未能获取到该设备的屏幕信息");
            }
        },
        currentOrientation: function () {
            return s.callService("UMDevice.currentOrientation", {}, true);
        },
        capturePhoto: function (args) {
            if (!$summer.isJSONObject(args)) {
                alert("调用capturePhoto服务时，参数不是一个有效的JSONObject");
            }
            s.callService("UMDevice.capturePhoto", args);
        },
        getAlbumPath: function (args) {
            return s.callService("UMDevice.getAlbumPath", typeof args == "undefined" ? {} : args, true);
        },
        getAppAlbumPath: function (jsonArgs) {
            if (jsonArgs) {
                if (!$summer.isJSONObject(jsonArgs)) {
                    alert("调用 getAppAlbumPath 服务时，参数不是一个有效的JSONObject");
                    return;
                }
            } else {
                jsonArgs = {};
            }
            return s.callService("UMDevice.getAppAlbumPath", jsonArgs, true);
        },
        getContacts: function () {
            return s.callService("UMDevice.getContactPerson", {}, true);
        },
        saveContact: function (args) {
            if (!$summer.isJSONObject(args)) {
                alert("调用saveContact服务时，参数不是一个有效的JSONObject");
            }
            s.callService("UMDevice.saveContact", args);
        },
        popupKeyboard: function () {
            return s.callService("UMDevice.popupKeyboard", {}, true);
        },
        listenGravitySensor: function (json) {
            json = json || {};
            json["__keepCallback"] = true;
            return s.callService("UMDevice.listenGravitySensor", json, false);
        },
        closeGravitySensor: function (json) {
            json = json || {};
            return s.callService("UMDevice.closeGravitySensor", json, false);
        },
        openApp: function (args) {
            if (!$summer.isJSONObject(args)) {
                alert("调用openApp服务时，参数不是一个有效的JSONObject");
            }
            return s.callService("UMDevice.openApp", args);
        },
        getLocationInfo: function () {
            return s.callService("UMDevice.getLocationInfo", {}, true);
        },
        addCalendarEvent: function (args) {
            if (!$summer.isJSONObject(args)) {
                alert("调用addCalendarEvent服务时，参数不是一个有效的JSONObject");
            }
            return s.callService("UMDevice.addCalendarEvent", args, false);
        },
        systemShare: function (args) {
            if (!$summer.isJSONObject(args)) {
                alert("调用systemShare服务时，参数不是一个有效的JSONObject");
            }
            return s.callService("UMDevice.systemShare", args, false);
        }
    };
    s.UMFile = {
        remove: function (args) {
            return s.callService("UMFile.remove", args, false);//默认异步
        },
        compressImage: function (args) {
            return s.callService("UMFile.compressImg", args, false);//默认异步
        },
        //涂鸦
        doodle: function (args) {
            return s.callService("UMFile.startDraw", args, false);//默认异步
        },
        saveImageToAlbum: function (args) {
            return s.callService("UMFile.saveImageToAlbum", args, false);//默认异步
        },
        exists: function (args) {
            return s.callService("UMFile.exists", args, true);
        },
        //获取安卓手机app内文件路径
        getStorageDirectory : function(args){
            if($summer.os=="android"){
                return s.callService("UMFile.getStorageDirectory", args, true);
            }
        },
        download: function (jsonArgs) {
            if ($summer.isEmpty(jsonArgs.url)) {
                alert("参数url不能为空");
            }
            if ($summer.isEmpty(jsonArgs.filename)) {
                alert("参数filename不能为空");
            }
            if ($summer.isEmpty(jsonArgs.locate)) {
                alert("参数locate不能为空");
            }
            if ($summer.isEmpty(jsonArgs.override)) {
                alert("参数override不能为空");
            }
            if ($summer.isEmpty(jsonArgs.callback)) {
                alert("参数callback不能为空 ");
            }
            jsonArgs["__keepCallback"] = true;
            return s.callService("UMFile.download", jsonArgs);//默认异步
        },
        open: function (args) {
            if (!$summer.isJSONObject(args)) {
                alert("调用$file.open方法时，参数不是一个有效的JSONObject");
            }
            return s.callService("UMDevice.openFile", args, false);//调用的是UMDevice的方法
        },
        getFileInfo: function (args) {
            var json = args;
            if (typeof args == "string") {
                json = {"path": args};
            }
            return s.callService("UMFile.getFileInfo", json, true);
        },
        openFileSelector: function (args) {
            return s.callService("UMFile.openFileSelector", args);
        },
        fileToBase64: function (args) {
            var json = args;
            if (typeof args == "string") {
                json = {"path": args};
            }
            return s.callService("UMFile.fileToBase64", json, false);
        },
        base64ToFile: function (args) {
            var json = args;
            if (typeof args == "string") {
                json = {"path": args};
            }
            return s.callService("UMFile.base64ToFile", json, false);
        },
        compressImg: function (json) {
            return s.callService("UMFile.compressImg", json)
        }

    };
    s.UMTel = {
        call: function (tel) {
            if ($summer.os == 'android' || $summer.os == 'ios') {
                s.callService("UMDevice.callPhone", '{"tel":"' + tel + '"}');
            } else {
                alert("Not implementate UMP$Services$Telephone$call in $summer.os == " + $summer.os);
            }
        },
        sendMsg: function (tel, body) {
            if (arguments.length == 1 && $summer.isJSONObject(arguments[0])) {
                var args = tel;
                if ($summer.os == 'android' || $summer.os == 'ios') {
                    return s.callService("UMDevice.sendMsg", args);
                }
            } else {
                if ($summer.os == 'android' || $summer.os == 'ios') {
                    //$service.call("UMDevice.sendMessage", "{recevie:'"+tel+"',message:'"+body+"'}");
                    s.callService("UMDevice.sendMsg", "{tel:'" + tel + "',body:'" + body + "'}");
                }
            }
        },
        sendMail: function (receive, title, content) {
            var args = {};
            if (arguments.length == 1 && $summer.isJSONObject(arguments[0])) {
                args = receive;
            } else {
                args["receive"] = receive;
                args["title"] = title;
                args["content"] = content;
            }
            return s.callService("UMDevice.sendMail", args);
        }

    };
    s.UMCamera = {
        open: function (args) {
            if ($summer.checkIfExist(args, ["bindfield", "callback", "compressionRatio"]))
                return s.callService("UMDevice.openCamera", args, false);
        },
        openPhotoAlbum: function (json) {
            if (!json) return;
            return s.callService("UMDevice.openPhotoAlbum", json, false);//异步调用服务
        }
    };
    s.UMScanner = {
        open: function (jsonArgs) {
            var result = "";
            if (jsonArgs) {
                if (jsonArgs["frameclose"] == null || jsonArgs["frameclose"] == undefined) {
                    jsonArgs["frameclose"] = "true";//默认扫描后关闭
                }
                result = s.callService("UMDevice.captureTwodcode", jsonArgs, false);
            } else {
                result = s.callService("UMDevice.captureTwodcode", "", true);
            }
        },
        generateQRCode: function (jsonArgs) {
            if ($summer.isJSONObject(jsonArgs)) {
                if (typeof jsonArgs["size"] != "undefined") {
                    jsonArgs["twocode-size"] = jsonArgs["size"];
                }
                if (typeof jsonArgs["content"] != "undefined") {
                    jsonArgs["twocode-content"] = jsonArgs["content"];
                }
                if (typeof jsonArgs["twocode-size"] == "undefined") {
                    jsonArgs["twocode-size"] = "180";
                }
                if (typeof jsonArgs["twocode-content"] == "undefined") {
                    alert("参数twocode-content不能为空，此参数用来标识扫描二维码后的返回值");
                    return;
                }
            } else {
                alert("generateQRCode方法的参数不是一个有效的JSONObject!");
                return;
            }

            return s.callService("UMDevice.createTwocodeImage", jsonArgs, true);
        },
    };
    s.UMNet = {
        available: function () {
            var result = false;
            if ($summer.os == 'android' || $summer.os == 'ios') {
                result = s.callService("UMNetwork.isAvailable", {}, true);
            }
            if (result != null && result.toString().toLowerCase() == "true") {
                return true;
            } else {
                return false;
            }
        },
        getNetworkInfo: function () {
            var result = s.callService("UMNetwork.getNetworkInfo", {}, true);//同步
            if (typeof result == "string") {
                return JSON.parse(result);
            } else {
                return result;
            }
        }
    };
    s.UMCache = {
        writeFile: function (filePath, content) {
            var args = {};
            if (filePath)
                args["path"] = filePath;
            if (content)
                args["content"] = content;
            return s.callService("UMFile.write", args, false);
        },
        readFile: function (filePath) {
            var strContent = "";
            var args = {};
            if (filePath)
                args["path"] = filePath;
            strContent = s.callService("UMFile.read", args, true);

            //苹果安卓统一返回处理结果
            if (strContent && strContent != "") {
                try {
                    return strContent;
                } catch (e) {
                    return strContent;
                }
            } else {
                return null;
            }
        }
    };
    /*service*/
    s.openHTTPS = s.UMService.openHTTPS;
    s.callService = s.UMService.call;
    s.callAction = s.UMService.callAction;
    s.writeConfig = s.UMService.writeConfig;
    s.readConfig = s.UMService.readConfig;
    s.setAppContext = s.UMService.setAppContext;

    /*device*/
    s.getTimeZoneID = s.UMDevice.getTimeZoneID;
    s.getTimeZoneDisplayName = s.UMDevice.getTimeZoneDisplayName;
    s.openAddressBook = s.UMDevice.openAddressBook;
    s.getInternalMemoryInfo = s.UMDevice.getInternalMemoryInfo;
    s.getExternalStorageInfo = s.UMDevice.getExternalStorageInfo;
    s.getMemoryInfo = s.UMDevice.getMemoryInfo;
    s.openWebView = s.UMDevice.openWebView;
    s.screenShot = s.UMDevice.screenShot;
    s.notify = s.UMDevice.notify;
    s.getDeviceInfo = s.UMDevice.getDeviceInfo;
    s.getScreenWidth = s.UMDevice.getScreenWidth;
    s.getScreenHeight = s.UMDevice.getScreenHeight;
    s.getScreenDensity = s.UMDevice.getScreenDensity;
    s.currentOrientation = s.UMDevice.currentOrientation;
    s.capturePhoto = s.UMDevice.capturePhoto;
    s.getAlbumPath = s.UMDevice.getAlbumPath;
    s.getAppAlbumPath = s.UMDevice.getAppAlbumPath;
    s.getContacts = s.UMDevice.getContacts;
    s.saveContact = s.UMDevice.saveContact;
    s.popupKeyboard = s.UMDevice.popupKeyboard;
    s.listenGravitySensor = s.UMDevice.listenGravitySensor;
    s.closeGravitySensor = s.UMDevice.closeGravitySensor;
    s.openApp = s.UMDevice.openApp;
    s.getLocationInfo = s.UMDevice.getLocationInfo;
    s.addCalendarEvent = s.UMDevice.addCalendarEvent;
    s.systemShare = s.UMDevice.systemShare;
    /*file*/
    s.removeFile = s.UMFile.remove;
    s.compressImage = s.UMFile.compressImage;
    s.doodle = s.UMFile.doodle;
    s.saveImageToAlbum = s.UMFile.saveImageToAlbum;
    s.exists = s.UMFile.exists;
    s.getStorageDirectory=s.UMFile.getStorageDirectory;
    s.download = s.UMFile.download;
    s.openFile = s.UMFile.open;
    s.getFileInfo = s.UMFile.getFileInfo;
    s.openFileSelector = s.UMFile.openFileSelector;
    s.fileToBase64 = s.UMFile.fileToBase64;
    s.base64ToFile = s.UMFile.base64ToFile;
    s.compressImg = s.UMFile.compressImg;
    /*tel*/
    s.callPhone = s.UMTel.call;
    s.sendMsg = s.UMTel.sendMsg;
    s.sendMail = s.UMTel.sendMail;
    /*cache*/
    s.writeFile = s.UMCache.writeFile;
    s.readFile = s.UMCache.readFile;
    /*camera*/
    s.openCamera = s.UMCamera.open;
    s.openPhotoAlbum = s.UMCamera.openPhotoAlbum;
    /*scanner*/
    s.openScanner = s.UMScanner.open;
    s.generateQRCode = s.UMScanner.generateQRCode;
    /*net*/
    s.netAvailable = s.UMNet.available;
    s.getNetworkInfo = s.UMNet.getNetworkInfo;

    s.ajax = function(json, successFn, errFn){
        if(json.type.toLowerCase() == "get"){
            return summer.get(json.url || "", json.param || {}, json.header || {}, successFn, errFn);
        }else if(json.type.toLowerCase() == "post"){
            if($summer.os == "android" && $ && json.header && json.header["Content-Type"] == "application/json"){
                var jsonAjax = {};
                    jsonAjax["type"] = 'post';
                    jsonAjax["url"] = json.url;
                    if(json.param)
                        jsonAjax["data"] = JSON.stringify(json.param);//后端得到json字符串
                    if(json.header && json.header["Content-Type"])
                        jsonAjax["contentType"] = json.header["Content-Type"];
                    jsonAjax["processData"] = true;
                    if(json.dataType)
                        jsonAjax["dataType"] = json.dataType;//当服务器返回json,jquery返回的是json还是jsonstring
                    if(json.header){
                        jsonAjax["beforeSend"] =  function(request){
                            for(var key in json.header){
                                if(key == "Content-Type") continue;
                                request.setRequestHeader(key, json.header[key]);
                            }
                        }
                    }
                    jsonAjax["success"] = function(data){
                        if(successFn)
                            successFn({data:data});
                    };
                    jsonAjax["error"] = function(data){
                        if(errFn)
                            errFn({data:data});
                    };
                
                return $.ajax(jsonAjax);
            }else{
                return summer.post(json.url || "", json.param || {}, json.header || {}, successFn, errFn);
            }
        }
    };
    s.get = function (url, param, header, successFn, errFn) {
        var startTime = new Date().getTime();
        return cordovaHTTP.get(url || "", param || {}, header || {}, function(data){
            var APMJSON = {
                "type": "get",
                "startTime": startTime,
                "endTime": new Date().getTime(),
                "url": url
            };
            var APMPARAMS = ["FeLoad", APMJSON];
            cordova.require("summer-plugin-apm.SummerAPM").insertAction(APMPARAMS, function(args) {}, function(args) {})
            successFn(data);
        }, errFn);
    };
    s.post = function (url, param, header, successFn, errFn) {
        var startTime = new Date().getTime();
        return cordovaHTTP.post(url || "", param || {}, header || {}, function(data){
            var APMJSON = {
                "type": "get",
                "startTime": startTime,
                "endTime": new Date().getTime(),
                "url": url
            };
            var APMPARAMS = ["FeLoad", APMJSON];
            cordova.require("summer-plugin-apm.SummerAPM").insertAction(APMPARAMS, function(args) {}, function(args) {})
            successFn(data);
        }, errFn);
    };
    s.getLocation = function (successFn, errFn) {
        return navigator.geolocation.getCurrentPosition(successFn, errFn);
    };
    s.getNativeLocation = function (json,successFn, errFn) {
        if(!json){return}
        if($summer.os=="android"){
            return s.cordova.require("cordova-plugin-amap.AMap").getLocation(json,successFn, errFn);
        }else{
            json["callback"] = successFn;
            json["error"] = errFn;
            return s.callService("UMDevice.getLocation", json, false);
        }
        return navigator.geolocation.getCurrentPosition(successFn, errFn);
    };

}(window, summer);

(function (w, s, $s, prefix) {
    //构建函数,用作实例化
    s.umRef = function () {
    };
    //储值对象，用作判断重复性
    var refManager = {
        refs: {},
        exec: function (id, data) {
            this.refs[id].callback(data);
            delete this.refs[id];
        }
    };
    //summer追加的方法，用作公用    
    s.openRef = function (json, fn) {
        var ref = new s.umRef();
        var info = s.getSysInfo();
        ref.param = {
            ref_id: "Fn" + $s.UUID(),//Fn_CA12BA
            ref_winId: info.winId,
            ref_frameId: info.frameId,
            ref_callBack: prefix + ".refCallBack"
        };
        ref.callback = fn;
        refManager.refs[ref.param.ref_id] = ref;
        json.pageParam = json.pageParam || {};
        json.pageParam.refParam = ref.param;
        s.openWin(json);
    };
    // summer的回调方法，用作下个页面的调用
    s.refCallBack = function (id, data) {
        refManager.exec(id, data);
    };

    s.comleteRef = function (json) {
        var str = json;
        if (typeof json == "object") {
            str = JSON.stringify(json);
        } else if (typeof json == "string") {
            str = "'" + json + "'";
        }
        var param = {};
        param.um_refId = s.pageParam.refParam.ref_id;
        param.um_winId = s.pageParam.refParam.ref_winId;
        param.um_frameId = s.pageParam.refParam.ref_frameId;
        param.um_callBack = s.pageParam.refParam.ref_callBack;// summer.refcallBack({})
        s.execScript({
            winId: param.um_winId,
            frameId: param.um_frameId,
            script: param.um_callBack + "('" + param.um_refId + "'," + str + ");"//  xxx({z:1})  xxx(zzzz)
        });
        s.closeWin();
    };
})(window, summer, $summer, "summer");
//summer debug
+function (w, s) {
    w.$summer.__debug = false;//debug
}(window, summer);

/*
 * Summer UI JavaScript Library
 * Copyright (c) 2016 yonyou.com
 * Author: gct@yonyou.com
 * Version: 3.0.0.20161028.1108
 */ 
var UM = UM || {};
UM.UI = UM.UI || {};

UM.UI.eventType = UM.UI.eventType || {
	down: "mousedown",
	move: "mousemove",
	up: "mouseup"
};
UM.UI.isMobile = false;// 判断是否是移动可触摸设备

if ("ontouchstart" in document) {
	UM.UI.eventType = {
		down: "touchstart",
		move: "touchmove",
		up: "touchend"
	};
	UM.UI.isMobile = true;
}
//=========================================================================
//-----------------------------------------------------------------------
// Copyright (C) Yonyou Corporation. All rights reserved.
// include : UMP.Web.EventMgr
// Author gct@yonyou.com
//-----------------------------------------------------------------------
/*!
 * UAP Mobile JavaScript Library v2.7.0
 */
(function( window, undefined ) {
    UM = window.UM || {};
    UM._inherit = (function () {
        var F = function () {
        };
        return function (C, P) {
            F.prototype = P.prototype;
            C.prototype = new F();
            C.base =  P.prototype;
            C.prototype.constructor = C;
        };
    })();

    UM.EventMgr = function() {
        this._events = {};
        /*
         this._events = {
         "oninit" :[function(){},function(){}],
         "onload" :[function(){},function(){}]
         }
         */
    }
    UM.EventMgr.prototype.on = function(evtName, handler) {
        if (this._events[evtName] == null) {
            this._events[evtName] = [];
        }
        this._events[evtName].push(handler);
    }
    UM.EventMgr.prototype.off = function(evtName, handler) {
        var handlers = this._events[evtName];
        if (typeof handler == "undefined") {
            delete handlers;
        } else {
            var index = -1;
            for (var i = 0, len = handlers.length; i < len; i++) {
                if (handler == handlers[i]) {
                    index = i;
                    break;
                }
            }
            if (index > 0)
                handlers.remove(index);
        }
    }
    UM.EventMgr.prototype.trigger = function(evtName, sender, args) {
        try{
            var handlers = this._events[evtName] || [];
            var handler;
            args = args || {};
            for (var i=0,len=handlers.length; i < len; i++) {
                handler = handlers[i];
                handler(sender, args);
            }
        }catch(e){
            alert(e);
        }
    }

	UM.NativeContainer = function() {
		this._eventMgr = new UM.EventMgr();
    }
	UM.NativeContainer.prototype.onReady = function(handler){
		this._eventMgr.on("ready", handler)
	},
	UM.NativeContainer.prototype.on = function(evtName, handler){
		this._eventMgr.on(evtName, handler)
	},
	UM.NativeContainer.prototype.off = function(evtName, handler){
		this._eventMgr.off(evtName, handler)
	},
	UM.NativeContainer.prototype.trigger = function(evtName, sender, args){
		this._eventMgr.trigger(evtName, sender, args)
	}
	
	UM.nativeContainer = new UM.NativeContainer();
	
})( window );

(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("requires a window with a document");
                }
                return factory(w);
            };
    } else if (typeof define === "function" && define.amd) {
        define(["jquery", "UM"], function () {
            return factory(global);
        });
    } else {
        factory(global);
    }

}(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
    var activeDom = function (type, options) {
        this.type = type;
        if (options) {
            this.settings = options;
            var itemtarget = '#actionsheet';
            this.open(itemtarget);
        }

    }
    activeDom.prototype = {
        constructor: activeDom,
        open: function (target, pushPageDirection) {

            var that = this;
            this.$target = target && $(target).length && $(target);
            this.direction = pushPageDirection;
            if (target == '#actionsheet') {

                this._generateHTMl();
                this._showHtml();
                this.$target = this.actionSheet;
            }

            if (!this.$target || !this.$target.hasClass("um-" + this.type)) {
                return;
            }
            this.$target.addClass("active");
            var that = this;
            setTimeout(function () {
                that.$target.css('transform', 'translate3d(0, 0, 0)');
            }, 100)
            if (pushPageDirection) {
                var pushPageClass = "um-page-pushfrom" + pushPageDirection;
                this.$target.data("pushPageClass", pushPageClass);

                $(".um-page.active").addClass("um-transition-default").addClass(pushPageClass);
            }
            this.$overlay = pushPageDirection ? $('<div class="overlay"></div>') : $('<div class="overlay"></div>');

            this.$target.before(this.$overlay);
            //取消点击遮罩层
            /* this.$overlay.on(UM.UI.eventType.down, function () {
             that.close();
             });*/
        },
        _generateHTMl: function () {
            var settings = this.settings ? this.settings : {};
            var type = this.type,
                that = this;
            if (type == 'actionsheet') {
                var $content = $('<div class="um-actionsheet" id="actionsheet"> <ul class="um-list um-list-corner"> <li> <div class="btn action-cancle">取消</div> </li> </ul> </div>');
                var $firstUl = $('<ul class="um-list um-list-corner"></ul>');
                $content.prepend($firstUl);
                if (settings.title) {
                    var $title = $('<li> <p class="btn popup-title">' + settings.title + ' </p> </li>');
                    $firstUl.append($title)
                }
                if (settings.items) {
                    for (var i = 0; i < settings.items.length; i++) {
                        var $li = $('<li> <div class="btn action-item">' + settings.items[i] + '</div> </li>');
                        $firstUl.append($li);
                    }
                }
                that.content = $content;
            }


        },
        _showHtml: function () {
            var actionSheet = $(this.content).appendTo($('body'));
            $(this.content).css('transform', 'translate3d(0, 100%, 0)');
            this.actionSheet = actionSheet;
            this._attachEvent();
        },
        _attachEvent: function () {
            var that = this;
            that.actionSheet.on('click', '.action-item', function (e) {
                e.preventDefault();
                var index = $('.um-actionsheet .action-item').index($(this));
                var callback = that.settings.callbacks[index];
                setTimeout(function () {
                    callback();
                }, 100);
                that.close();
            });
            that.actionSheet.on('click', '.action-cancle', function () {
                that.close();
            })
        },

        close: function () {
            var that = this;
            if (!this.$target) {
                // 关闭所有
                $("um-" + this.type).removeClass("active");
                setTimeout(function () {
                    $("um-" + this.type).css('transform', 'translate3d(0, 100%, 0)');
                    that.$overlay.remove();
                }, 300)
            } else {
                this.$target.removeClass("active");
                if (this.direction == 'left' || this.direction == 'leftCover') {
                    that.$target.css('transform', 'translate3d(-100%, 0, 0)');
                } else if (this.direction == 'right' || this.direction == 'rightCover') {
                    that.$target.css('transform', 'translate3d(100%, 0, 0)');
                } else {
                    that.$target.css('transform', 'translate3d(0, 100%, 0)');
                }
                if (this.type == 'actionsheet') {
                    setTimeout(function () {
                        that.actionSheet.remove();
                    }, 1000)
                }
                that.$overlay.remove();
            }


            var pushPageClass = this.$target.data("pushPageClass");
            if (pushPageClass) {
                $(".um-page.active").removeClass(pushPageClass).one("webkitTransitionEnd", function () {
                    $(this).removeClass("um-transition-default");
                })
            }
        }
    }

    UM.actionsheet = function (options) {
        var type = 'actionsheet';
        return new activeDom(type, options)
    };
    //UM.actionsheet = new activeDom("actionsheet");
    UM.share = new activeDom("share");
    UM.sidebar = new activeDom("sidebar");
    UM.poppicker = new activeDom("poppicker");
}))

;(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error("requires a window with a document");
                }
                return factory(w);
            };
    } else if (typeof define === "function" && define.amd) {
        define(["jquery", "UM"],function() {
            return factory(global);
        });
    } else {
        factory(global);
    }

}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
  function _UModal(type, options) {
    if (options && (options.constructor === String)) {
      this.settings = $.extend({}, this.defaults, {
        title: options,
        text: ""
      });
    } else {
      this.settings = $.extend({}, this.defaults, options);
    }
    this.type = type;
    this._init();
  }
  _UModal.prototype = {
    constructor: _UModal,

    overlay: $('<div class="um-overlay"></div>'),

    defaults: {
      title: window.location.host || "",
      text: "",
      btnText: ["取消", "确定"],
      overlay: true,
      cancle: function() {},
      ok: function(data) {}
    },

    done: function(fn) {
      if (typeof fn === "function" && this._complete) {
        fn.call(this);
      }
    },

    _generateHTML: function() {

      var settings = this.settings,
          type = this.type,
          html;

      html = '<div class="um-modal"><div class="um-modal-content um-border-bottom">';

      if (settings.title) {
        html += '<div class="um-modal-title">' + settings.title + '</div>';
      }
      if (settings.text) {
        html += '<div class="um-modal-text">';
        //if(type === "tips") html += '<span class="um-ani-rotate"></span>';
        html += settings.text + '</div>';
      }
      if (type === "prompt") {
        html += '<div class="um-modal-input"><input type="text" class="form-control"></div>';
      }

      if (type === "login") {
        html += '<div class="um-modal-input"><input type="text" class="form-control" placeholder="请输入账号"><input type="password" class="form-control" placeholder="请输入密码"></div>';
      }

      type === "toast" ? html += '</div>' : html += '</div><div class="um-modal-btns">';

      if (type === "confirm" || type === "login" || type === "prompt") {
        html += '<a href="#" class="btn cancle">' + settings.btnText[0] + '</a>';
      }

      if (type === "toast") {
        html += '</div>';
        var that=this;
        var duration=settings.duration? settings.duration:2000;
        setTimeout(function(){
          that.destroy(that.modal);
        },duration)
      } else {
        html += '<a href="#" class="btn ok">' + settings.btnText[1] +
            '</a></div></div>';
      }

      if (type === "loading") {
        var text=settings.text? settings.text:'正在加载';
        var icons=settings.icons ? settings.icons:'ti-reload';
        html = '<div class="um-modal" style="background-color: rgba(0, 0, 0, 0.2);width: 150px;margin-left: -75px;padding: 20px;border-radius: 12px;"><div style="color: #ffffff;">'+text+'</div><span class="um-ani-rotate '+icons+'"></span></div>';
      }
      this.html = html;
    },
    _showModal: function() {

      this.settings.overlay && this.overlay.appendTo($('body')).fadeIn(300);

      var modal = $(this.html).appendTo($('body')),

          modalH = modal.outerHeight(),
          wh = window.innerHeight;
      console.log(modal);
      modal.css('top', (wh - modalH - 20) / 2);

      setTimeout(function() {
        modal.addClass('um-modal-in');
      }, 100);

      this.modal = modal;
      this._attachEvent();
    },
    _attachEvent: function() {
      var that = this;
      that.modal.on("click", '.btn', function(e) {
        e.preventDefault();
        if ($(this).hasClass('cancle')) {
          setTimeout(function() {
            that.settings.cancle(data)
          }, 100);
        }
        if ($(this).hasClass('ok')) {
          var input = that.modal.find('.form-control'),
              inputLen = input.length,
              data;
          if (inputLen) {
            if (inputLen == 1) data = that.modal.find('.form-control').val();
            else {
              data = [];
              $.each(input, function() {
                data.push(this.value);
              });
            }
          }
          setTimeout(function() {
            that.settings.ok(data)
          }, 100);
        }
        that.destroy(that.modal);
      });
    },
    destroy: function() {
      var that = this;
      this.modal.removeClass('um-modal-in').addClass('um-modal-out').on('webkitTransitionEnd', function() {
        that.modal.off('webkitTransitionEnd');
        that.modal.removeClass('um-modal-out');
        that.modal.remove();
      });
      // 避免遮罩闪烁
      this.settings.overlay && this.overlay.remove();
    },
    _init: function() {

      this._generateHTML();
      this._showModal();

      if (this.type === 'tips' || this.type === 'loading') {
        this._complete = 1;
      }
    }
  }
  var loadingModal=null;/*用来接收loading对象*/
  var api={
    alert: function (options) {
      var $alert='alert';
      return new _UModal($alert,options);
    },
    confirm: function (options) {
      var $confirm='confirm';
      return new _UModal($confirm,options);
    },
    prompt: function (options) {
      var $prompt='prompt';
      return new _UModal($prompt,options);
    },
    login: function (options) {
      var $login='login';
      return new _UModal($login,options);
    },
    toast: function (options) {
      var $toast='toast';
      return new _UModal($toast,options);
    },
    showLoadingBar: function (options) {
      var $loading='loading';
      loadingModal = new _UModal($loading,options);
      //eturn loadingModal;
    },
    hideLoadingBar: function () {
      console.log(loadingModal);
      loadingModal.destroy();
    }
  };
  $.extend(UM,api);
  UM.modal = function(type, options) {
    return new _UModal(type, options);
  }
  return UM.modal;
}))/**
 * Created by zhujinyu on 2018/2/7.
 */
//var BASE_URL = '/app';
//测试环境
//var BASE_URL = 'http://118.190.152.119/app';
//正式环境
var BASE_URL = 'https://m.zhongxinnengyuan.cn/app';

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
    if($summer.os=="android"){
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
    }else{
    	summer.getNativeLocation({
		    "single" : "true"
		},function(result){
			 var str = [];
            str.push(result.longitude);
            str.push(result.latitude);
            str = GCJ2WGS(str);
            callback && callback(str);
		},function(args) {
			 error && error();
	         console.log("定位失败");

		});
    }

}
/**跳转到地图*/
$(document).on('click', '.navigation', function () {
    var location_end = $(this).attr("data-end").split(",");
    var userName = $(this).attr("data-userName");
    if($summer.os == "ios") {
        summer.openWin({
            "id" : "mapLink",
            "url" :"html/driver/mapLink.html",
            "create" : "false",
    		"type" : "actionBar",
            "actionBar" : {
    			title : "导航",
    			titleColor: "#3d4145", //注意必须是6位数的颜色值。（3位数颜色值会不正常）
    		    backgroundColor: "#f7f7f8",
    		    bottomLineColor: "#f7f7f8",
    			leftItem : {
    				image : "static/img/back.png",
    				method : ""
    			}
    		},
            "pageParam" : {
                "location_end": location_end,
                "userName": userName
            }
        });
    } else {
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
            getLngLat(function (data) {
                GoDestination(data, location_end);
            })
        },function () {
            getLngLat(function (data) {
                GoDestination(data, location_end);
            })
        });
    }
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
	/*改造成summer.ajax 
	   zhoulei修改
	 */
	//设置超时
	window.cordovaHTTP.settings = {
		timeout: 10000
	};
	summer.ajax({
		type: params.type,
		url: BASE_URL + params.url,
		param:  params.data,
		header: {
		"Content-Type": "application/json",
		 "token":token
		}
	}, function (response) {
		if (Object.prototype.toString.call(response.data) === '[object String]') {
			response.data = JSON.parse(response.data);
		}
		response = response.data;
 		if(response.retCode === '1000'){
                pageGo("login");
            }else{
                params.callback && params.callback(response);
            }
	}, function (status) {
			console.log(status);
 		      if(status=='timeout'){
                $.alert("请求超时,请重新刷新页面", '',function () {
                    window.location.reload();
                });
            }
	});

  /*  $.ajax({
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
    })*/
   
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
    		window.cordovaHTTP.settings = {
				timeout: 10000
			};

			summer.ajax({
				type: type,
				url: BASE_URL + url,
				param: {},
			header: {
				"Content-Type": "application/json",
				 "token":token
				}
			}, function (response) {
				if (Object.prototype.toString.call(response.data) === '[object String]') {
					response.data = JSON.parse(response.data);
				}
				response = response.data;
		 		  if(response.retCode === '1000'){
                    pageGo("login");
                }else{
                    callback && callback(response);
                }
                console.timeEnd('请求计时');
			}, function (status) {
					console.log(status);
 					  if(status=='timeout'){
		                    $.alert("请求超时,请重新刷新页面", '',function () {
		                        window.location.reload();
		                    });
		                }
			});
    /*    $.ajax({
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
        })*/
    } else {
    		window.cordovaHTTP.settings = {
				timeout: 10000
			};
			summer.ajax({
				type: type,
				url: BASE_URL + url,
				param: data,
			header: {
				"Content-Type": "application/json",
				 "token":token
				}
			}, function (response) {
 				if (Object.prototype.toString.call(response.data) === '[object String]') {
					response.data = JSON.parse(response.data);
				}
				response = response.data;
                if(response.retCode === '1000'){
                    pageGo("login");
                }else{
                    callback && callback(response);
                }
                console.timeEnd('请求计时');
			}, function (status) {
					console.log(status);
 					  if(status=='timeout'){
		                    $.alert("请求超时,请重新刷新页面", '',function () {
		                        window.location.reload();
		                    });
		                }
			});
       /* $.ajax({
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
        })*/
    }
}
/**完整ajax请求*/
function ajaxCompleteRequests(url,type,data,callback,beforeSend,complete) {
    console.time('请求计时');
    var token = getCookie("token");
        	   window.cordovaHTTP.settings = {
				timeout: 10000
			};
			summer.ajax({
				type: type,
				url: BASE_URL + url,
				param:  data,
			header: {
				"Content-Type": "application/json",
				 "token":token
				}
			}, function (response) {
				if (Object.prototype.toString.call(response.data) === '[object String]') {
			response.data = JSON.parse(response.data);
		}
				response = response.data;
 				callback && callback(response);
           		 console.timeEnd('请求计时');
			}, function (status) {
				 console.log("请求完成");
	            if(status=='timeout'){
	                $.alert("请求超时,重新刷新页面", '',function () {
	                    window.location.reload();
	                });
	            }else{
	                complete && complete();
	            }
			});
    /*$.ajax({
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
    })*/
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
    summer.setStorage(name, value);
    var loginTime = new Date().getTime();
    summer.setStorage("loginTime",loginTime);
}

function getCookie(name){
    var loginTime = summer.getStorage("loginTime");
    if(loginTime){
    	if((new Date().getTime()-parseInt(loginTime))>30*24*60*60*1000){
    		summer.rmStorage(name);
    	}
    }
 	return summer.getStorage(name);
}

function delCookie(name){
    summer.rmStorage(name);
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
        /* for(var i in cityJson){
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
        } */
        cityJson.forEach(function (e, i) {
            if (val.indexOf(e.name) != -1) {
                pid = e.code;
                pname = e.name;
                var second = e.children;
                val = jiequ(val,pname);
                console.log(val);
                second.forEach(function (e, i) {
                    if (val.indexOf(e.name) != -1) {
                        sid = e.code;
                        sname = e.name;
                        var three = e.children;
                        val = jiequ(val,sname);
                        three.forEach(function (e, i) {
                            if (val.indexOf(e.name) != -1) {
                                qid = e.code;
                                qname =  e.name;
                            }
                        });
                    }
                });
            }
        });
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
            break;
        case 1:
            status_txt = "充值已完成";
            break;
        case 2:
            status_txt = "充值失败";
            break;
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
};/**
 * Created by Administrator on 2018/4/1.
 */
;//$(function () {
summerready = function(){
    var type = getQueryString('type');
    var id = getQueryString('id');
    var $begin_city_picker = $("#begin_city_picker");
    var $end_city_picker = $("#end_city_picker");
    var isPay = true;
    type = parseInt(type);
    var $unit = $(".unit");
    var $infoNum = $(".infoNum");
    var $mobile = $("#mobile");
    var params;
    if (type == 1) {
        var carTypeData = config.vehicle_type;
        var carTypeTmpl = '';
        carTypeData.forEach(function (v) {
            carTypeTmpl+="<option value='"+v.type+"'>"+v.name+"</option>";
        })
        $("#carType").html(carTypeTmpl);
        setAddressChoose("#begin_city_picker",'选完请点击确定按钮');
        setAddressChoose("#end_city_picker",'选完请点击确定按钮');
    }
    $("#leaveTime").datetimePicker({
        value: getCurrentTime()
    });
    $("#infoPicPathUrl").on("click",function () {
        /* getAPPMethod(function () {
            if(window.gasstation){
                window.gasstation.getPhoto('messageInfo');
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.getPhoto.postMessage("messageInfo");
            }
        }) */
        UM.actionsheet({
            title : '',
            items : ['拍照', '从相册中选择'],
            callbacks : [camera, openPhotoAlbum]
        });
        function camera() {
            summer.openCamera({
                compressionRatio : 0.5,
                callback : function(ret) {
                    var imgPath = ret.compressImgPath;
                    upload(imgPath);
                }
            });
        }
        function openPhotoAlbum() {
            summer.openPhotoAlbum({
                compressionRatio : 0.5,
                callback : function(ret) {
                    var imgPath = ret.compressImgPath;
                    upload(imgPath);
                }
            });
        }
        // 把图片流上传用户中心
        function upload(path) {
            summer.showProgress();
            var fileArray = [];
            var item = {
                fileURL : path,
                type : "image/jpeg",
                name : "file" 
            };
            fileArray.push(item);
            summer.multiUpload({
                fileArray : fileArray,
                params : {},
                SERVER : BASE_URL + "/common/upload/uploadFile"
            }, function(ret) {
                summer.hideProgress();
                summer.toast({
                    "msg" : "车源图片上传成功"
                });
                var photoPath = ret.data;
                $("#infoPicPathUrl").attr("src", BASE_URL + photoPath);
                $("#infoPicPath").val(photoPath);
            }, function(err) {
                summer.hideProgress();
                summer.toast({
                    "msg" : "车源图片上传失败"
                });
            });
        }
    })
    /*验证手机号是否存在*/
    function isMobileExist() {
        var mobile = $mobile.val();
        var _li = $mobile.parents("li");
        var $error_tip = _li.find(".error-tip");
        var $check_icon = _li.find(".check-icon");
        var reg = /^1[3|4|5|7|8][0-9]\d{4,8}$/;//判断手机号的正则
        if (reg.test(mobile) && mobile.length === 11) {
            var params = {
                url: '/driverInfo/checkMobile/' + mobile,
                type: 'get',
                callback: function (response) {
                    if (response.retCode === '0') {
                        $error_tip.html("");
                        $check_icon.css("display", "block");
                        isPay =true;
                    } else {
                        isPay= false;
                        $error_tip.html(response.retMsg || "商家手机号与登录手机号不一致");
                        $check_icon.css("display", "none");
                    }
                }
            }
            ajaxRequest(params);
        } else {
            $error_tip.html("请输入正确的手机号");
            $check_icon.css("display", "none");
        }
    }
    ajaxRequests('/driverInformationRelease/getAllInformationFeeTemplate', 'get', {}, function (response) {
        if (response.retCode === '0') {
            addItem("#list",response,"#feeList");
            $(".item").eq(0).addClass("active");
            $unit.html(response.data[0].totalFee);
            $infoNum.html(response.data[0].days);
        } else {
            $.alert(response.retMsg || '发布失败');
        }
    })
    $(document).on("click","#feeList .item",function () {
        $("#feeList .item").removeClass("active");
        $(this).addClass("active");
        var totalFee = $(this).find(".money").html();
        var num = $(this).find(".num").html();
        $unit.html(totalFee);
        $infoNum.html(num);
    })
    $(document).on("click", "#next", function (e) {
        $(this).removeClass("open-popup");
        var infoDetail = $("#infoDetail").val();
        var infoTitle = $("#infoTitle").val();
        if(type == 3 ||type ==4){
            params = {
                infoType: type,
                infoTitle: infoTitle,
                infoDetail: infoDetail

            }
            if(isNUll(infoTitle)){
                $.alert("信息标题不可为空", '', function () {
                    return false;
                });
            }else if (isNUll(infoDetail)) {
                $.alert("信息描述不可为空", '', function () {
                    return false;
                });
            } else {
                $.popup('#registerPageTwo');
            }
        }else{
            var beginProvinceId = $begin_city_picker.attr("data-provinceId");
            var beginProvinceName = $begin_city_picker.attr("data-provinceName");
            var beginCityId = $begin_city_picker.attr("data-cityId");
            var beginCityName = $begin_city_picker.attr("data-cityName");
            var beginCountyId = $begin_city_picker.attr("data-countyId");
            var beginCountyName = $begin_city_picker.attr("data-countyName");
            var endProvinceId = $end_city_picker.attr("data-provinceId");
            var endProvinceName = $end_city_picker.attr("data-provinceName");
            var endCityId = $end_city_picker.attr("data-cityId");
            var endCityName = $end_city_picker.attr("data-cityName");
            var endCountyId = $end_city_picker.attr("data-countyId");
            var endCountyName = $end_city_picker.attr("data-countyName");
            params = {
                infoType: 1,
                infoTitle: infoTitle,
                infoPicPath: $("#infoPicPath").val(),
                beginProvinceId: beginProvinceId,
                beginProvinceName: beginProvinceName,
                beginCityId: beginCityId,
                beginCityName: beginCityName,
                beginCountyId: beginCountyId,
                beginCountyName: beginCountyName,
                beginAddress: $("#beginAddress").val(),
                endProvinceId: endProvinceId,
                endProvinceName: endProvinceName,
                endCityId: endCityId,
                endCityName: endCityName,
                endCountyId: endCountyId,
                endCountyName: endCountyName,
                endAddress: $("#endAddress").val(),
                leaveTime: $("#leaveTime").val()+":00",
                infoDetail: $("#infoDetail").val(),
                carType: $("#carType").val(),
                carTypeDesc: selectedDOM("#carType").text()
            }
            var testResult = true;
            for(var i in params){
               if(isNUll(params[i])){
                   switch (i){
                       case 'beginProvinceId':
                       case 'beginProvinceName':
                       case 'beginCityId':
                       case 'beginCityName':
                       case 'beginCountyId':
                       case 'beginCountyName':
                           $.alert("请重新选择起始地地址");
                           break;
                       case 'infoTitle':
                           $.alert("信息标题不可为空");
                           break;
                       case 'endProvinceId':
                       case 'endProvinceName':
                       case 'endCityId':
                       case 'endCityName':
                       case 'endCountyId':
                       case 'endCountyName':
                           $.alert("请重新选择目的地");
                           break;
                       case 'endCountyName':
                           $.alert("请重新选择目的地");
                           break;
                       case 'beginAddress':
                           $.alert("起始地详细地址不可为空");
                           break;
                       case 'endAddress':
                           $.alert("目的地详细地址不可为空");
                           break;
                       case 'leaveTime':
                           $.alert("出发时间不可为空");
                           break;
                       case 'infoDetail':
                           $.alert("信息描述不可为空");
                           break;
                       case 'infoPicPath':
                           $.alert("车源图片不可为空");
                           break;
                       case 'goodsType':
                           $.alert("货物类型不可为空");
                           break;
                       case 'carType':
                       case 'carTypeDesc':
                           $.alert("车型选择不可为空");
                           break;
                   }
                   testResult = false;
                   return false;
               }
            }
            if(testResult){
                $.popup('#registerPageTwo');
            }
        }
    })
    $("#mobile").blur(function () {
        isMobileExist();
    })
    $(document).on("click", "#submit", function () {
        var mobile = $mobile.val();
        var validateCode = $("#validateCode").val();
        if(isNUll(mobile)){
            $.alert("请输入联系人手机");
            isPay =false;
            return;
        }
        if(isNUll($("#validateCode").val())){
            $.alert("请输入短信验证码");
            isPay =false;
            return;
        }
        ajaxRequests("/driverInfo/checkPayValidateCode/"+mobile+"/"+validateCode,"get","",function (result) {
            if (result.retCode === '0') {
                isPay =true;
                if(isPay){
                    var id = $(".item.active").attr("data-id");
                    params.costTemplateId = id;
                    ajaxRequests('/driverNoticeInfo/driverPublishInfo', 'post', {
                        "body": params,
                    }, function (response) {
                        if (response.retCode === '0') {
                            $.alert(response.retMsg,'',function () {
                                window.location.href="./message.html?type=2";
                                // pageGo("myMessage");
                                // pageBack();
                            })
                        } else {
                            $.alert(response.retMsg || '发布失败');
                        }
                    })
                }
            } else {
                isPay =false;
                $.toast("短信验证码不正确，请重新输入", 3000);
            }
        })
    })
    $(document).on("click",".address-choose",function () {
        $(".address-choose").removeClass("active");
       $(this).addClass("active");
    })
    $(document).on("click",".close-picker",function () {
        var item = $(".address-choose.active");
        addressId(item);
    })
    $.init();
    } 
//})
function setImage(path) {
    if (browser.versions.ios) {
        path =path.imageUrl;
    }
    if(path){
        $("#infoPicPathUrl").attr("src","/app"+path);
        $("#infoPicPath").val(path);
    }
}