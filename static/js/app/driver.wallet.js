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

/**
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
 * Created by Administrator on 2018/4/29.
 */
;//$(function () {
summerready = function(){
    $(".saoma").on("click", function () {
    	var params = {zxing : false};
			ZBar.scan(params, function(args){
				 if(args.indexOf('https')!=-1){
                	 window.location.href=args.slice(args.lastIndexOf('/')+1,args.length); 
                }else{
	                 summer.toast({
				         msg: args,
				         duration:"long"
	                });
                }
			}, function(args){
			    summer.toast({
			        msg: "请扫描支付码",
			         duration:"long"
			    });
			});
      /*  getAPPMethod(function () {
            if (window.gasstation) {
                window.gasstation.zxingClick();
            }
        },function () {
            if(window.webkit){
                window.webkit.messageHandlers.zxingClick.postMessage(null);
            }
        })*/
    })
    }
//})