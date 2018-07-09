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
+function ($) {
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



}(Zepto);

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
};

;$(function () {
    var id = getQueryString("id");
    var $venderResourceId = $("#resourceGrade");
    var $amount_box = $(".amount-box");
    var $price = $(".price");
    var $consumFee =  $("#consumFee");
    var $amount =  $(".amount");
    var $total =  $(".total");
    var typeName ;
    $.showPreloader();
    /*一键加油前获取司机信息*/
    ajaxRequests('/driverVender/driverAddOilGas', "post", {
        body: {
            venderId: id
        }
    }, function (response) {
        if (response.retCode === '0') {
            /*加载模板数据*/
            var dataList = response.data.vender;
            var venderResourceList = response.data.venderResourceList;
            var driverData	 = response.data.driver;
            var companyTpe = dataList.companyType;
            var siteInfo = getType(companyTpe);
            typeName = siteInfo.btnName;
            var data = $.extend(dataList, siteInfo);
            data.star = new Array();
            data.star.length = data.starNum;

            addItem("#detail_demo", data, "#detailList");

            var ownAmount = driverData.ownAmount || 0;
            var turnIntoAmount = driverData.turnIntoAmount || 0;
            $(".ownAmount").append('<span class="pl5">(豆:'+ownAmount+')</span>');
            $(".turnIntoAmount").append('<span class="pl5">(余额:'+turnIntoAmount+')</span>');
            $(".lefAmount").html(ownAmount+turnIntoAmount);
            $("#carNum").val(driverData.carNum);

            var option = '';
            for (var i = 0; i < venderResourceList.length; i++) {
                var resourceGrade = venderResourceList[i].resourceGrade;
                option += '<option value="' + venderResourceList[i].id + '" data-unit="' + venderResourceList[i].usedUnitFee + '">' + filterOilAndGasType(resourceGrade) + '</option>';
            }
            $venderResourceId.html(option);
            $price.html(venderResourceList[0].usedUnitFee);
            $(".content").removeClass("dis-n");
            $.hidePreloader();
        } else {
            $.alert(response.retMsg || '操作失败');
        }
    })
    /*选择类型*/
    $(document).on("change", "#resourceGrade", function () {
        var price = setNumFixed2(selectedDOM("#resourceGrade").attr("data-unit"));
        $(".price").html(price);
        $consumFee.val('');
        $amount.html('');
        $total.val('');
    })
    /*根据数量计算金额*/
    $(document).on("input", ".total", function () {
        var total_num = $(this).val();
        var price = $price.text();
        var amount_total = total_num * price;
        amount_total = amount_total > 0 ? setNumFixed_2(amount_total) : '';
        $consumFee.val(amount_total);
        $amount.html(amount_total);
        if($amount_box.hasClass("dis-n")){
            $amount_box.removeClass("dis-n");
        }
    })
    /*根据金额计算数量*/
    $(document).on("input", "#consumFee", function () {
        var consumFee = $(this).val();
        var price = $price.text();
        var total_num = consumFee / price;
        total_num = total_num > 0 ? setNumFixed2(total_num) : '';
        $total.val(total_num);
        $amount.html(consumFee);
    })
    $("#carNum").on("click",function () {
        var carType = $(this).val();
        if (carType == "") {
            pageGo("register-added");
        }
    })
    /*提交支付*/
    $(document).on("click", "#submit", function () {
        var amount = $consumFee.val();
        var total = $total.val();
        var carType = $("#carNum").val();
        if (carType == "") {
            $.alert("您的信息不完善，请先去完善信息" || '操作失败','',function () {
                pageGo("register-added");
            });
            return;
        }
        if (amount > 0 && total > 0) {
            var type = selectedDOM("#pay_type").val();
            if (type == 1) {
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
            }else{
                submitPay(function (response) {
                    var params = {
                        WIDout_trade_no:response.data.billDetailId,
                        WIDsubject:filterGoodsTypes(response.data.consumCategory)+response.data.consumFee+"元",
                        total_amount:setNumFixed_2(response.data.consumFee),
                        WIDbody:typeName
                    }
                    if (type == 2) {
                        wxPay(params);
                    }
                    if (type == 3) {
                        alipayPay(params);
                    }
                });
            }
        }else{
            $.toast('请输入消费金额和数量',2000,'custom-toast');
        }
    })
    function submitPay(callback) {
        var carNum = $("#carNum").val();
        var venderResourceId = $("#resourceGrade").val();
        var consumCategory = 1;
        var resourceOutDeviceNo = $("#resourceOutDeviceNo").val();
        var payType = $("#pay_type").val();
        var consumFee = setNumFixed_2($consumFee.val());
        var payUseAmountType = selectedDOM("#pay_type").attr("data-payUseAmountType");
        if(!venderResourceId){
            $.toast('请先选择油气资源',2000,'custom-toast');
            return false;
        }else if(!consumFee){
            $.toast('请输入消费金额',2000,'custom-toast');
            return false;
        }else if(!resourceOutDeviceNo){
            $.toast('请先选择喷枪号再支付',2000,'custom-toast');
            return false;
        }else if(!payType){
            $.toast('请先选择付款方式再支付',2000,'custom-toast');
            return false;
        }else{
            ajaxRequests('/driverPay/pay',"post",{
                body: {
                    venderId: id,
                    venderResourceId: venderResourceId,
                    consumCategory: consumCategory,
                    carNum: carNum,
                    resourceOutDeviceNo: resourceOutDeviceNo,
                    consumFee: consumFee,
                    payType: payType,
                    payUseAmountType: payUseAmountType
                }
            },function (response) {
                if (response.retCode === '0') {
                    if (payType != 1) {
                        if (response.data.returnGiftAmount > 0) {
                            $.alert("支付完成后，您将获得平台返现的" + response.data.returnGiftAmount + "能源豆", '', function () {
                                callback && callback(response);
                            });
                        } else {
                            callback && callback(response);
                        }
                    }else{
                        pageGo("consumerList");
                    }
                } else if(response.retCode === '2000'){
                    $.alert('还差'+response.data.consumFeeRemainder+','+response.retMsg,'',function () {
                        var consumFee = response.data.consumFeeRemainder;
                        var price = $price.text();
                        var total_num = consumFee / price;
                        total_num = total_num > 0 ? setNumFixed2(total_num) : '';
                        $total.val(total_num);
                        $amount.html(consumFee);
                        $("#consumFee").val(consumFee);
                    });
                }else {
                    $.alert(response.retMsg,'',function () {
                       pageReload();
                    });
                }
            })
        }
    }
    function alipayPay(params) {
        $("#WIDout_trade_no").val(params.WIDout_trade_no+"01");
        $("#WIDsubject").val(params.WIDsubject);
        $("#WIDtotal_amount").val(params.total_amount);
        $("#WIDbody").val(params.WIDbody);
        $("#token").val(getCookie("token"));
        $("#payform").attr("action",BASE_URL+'/driverPayPage/alipay/pay').submit();
    }
    
    function wxPay(params) {
    	var payTypes;
    	getAPPMethod(function(){
    		payTypes ="Android";
    	},function(){
    		payTypes ="IOS";
    	},function(){
    		payTypes ="Wap";
    	})
    	// setCookie("site_wx_status",'wxPay');
        $("#out_trade_no").val(params.WIDout_trade_no+"01");
        $("#total_fee").val(params.total_amount);
        $("#body").val(params.WIDbody);
        $("#payType").val(payTypes);
        $("#token").val(getCookie("token"));
        $("#payform").attr("action",BASE_URL+'/driverPayPage/webChat/payPage').submit();
    }
    // var site_wx_status = getCookie("site_wx_status");
    // if(site_wx_status&&site_wx_status=="wxPay"){
    // 	delCookie("site_wx_status");
    // 	pageGo("consumerList");
    // }
    $.init();
});