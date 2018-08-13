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
+function(a){"use strict";var b=function(c,d){function e(){return"horizontal"===o.params.direction}function f(){o.autoplayTimeoutId=setTimeout(function(){o.params.loop?(o.fixLoop(),o._slideNext()):o.isEnd?d.autoplayStopOnLast?o.stopAutoplay():o._slideTo(0):o._slideNext()},o.params.autoplay)}function g(b,c){var d=a(b.target);if(!d.is(c))if("string"==typeof c)d=d.parents(c);else if(c.nodeType){var e;return d.parents().each(function(a,b){b===c&&(e=c)}),e?c:void 0}if(0!==d.length)return d[0]}function h(a,b){b=b||{};var c=window.MutationObserver||window.WebkitMutationObserver,d=new c(function(a){a.forEach(function(a){o.onResize(),o.emit("onObserverUpdate",o,a)})});d.observe(a,{attributes:"undefined"==typeof b.attributes?!0:b.attributes,childList:"undefined"==typeof b.childList?!0:b.childList,characterData:"undefined"==typeof b.characterData?!0:b.characterData}),o.observers.push(d)}function i(b,c){b=a(b);var d,f,g;d=b.attr("data-swiper-parallax")||"0",f=b.attr("data-swiper-parallax-x"),g=b.attr("data-swiper-parallax-y"),f||g?(f=f||"0",g=g||"0"):e()?(f=d,g="0"):(g=d,f="0"),f=f.indexOf("%")>=0?parseInt(f,10)*c+"%":f*c+"px",g=g.indexOf("%")>=0?parseInt(g,10)*c+"%":g*c+"px",b.transform("translate3d("+f+", "+g+",0px)")}function j(a){return 0!==a.indexOf("on")&&(a=a[0]!==a[0].toUpperCase()?"on"+a[0].toUpperCase()+a.substring(1):"on"+a),a}var k=this.defaults,l=d&&d.virtualTranslate;d=d||{};for(var m in k)if("undefined"==typeof d[m])d[m]=k[m];else if("object"==typeof d[m])for(var n in k[m])"undefined"==typeof d[m][n]&&(d[m][n]=k[m][n]);var o=this;if(o.params=d,o.classNames=[],o.$=a,o.container=a(c),0!==o.container.length){if(o.container.length>1)return void o.container.each(function(){new a.Swiper(this,d)});o.container[0].swiper=o,o.container.data("swiper",o),o.classNames.push("swiper-container-"+o.params.direction),o.params.freeMode&&o.classNames.push("swiper-container-free-mode"),o.support.flexbox||(o.classNames.push("swiper-container-no-flexbox"),o.params.slidesPerColumn=1),(o.params.parallax||o.params.watchSlidesVisibility)&&(o.params.watchSlidesProgress=!0),["cube","coverflow"].indexOf(o.params.effect)>=0&&(o.support.transforms3d?(o.params.watchSlidesProgress=!0,o.classNames.push("swiper-container-3d")):o.params.effect="slide"),"slide"!==o.params.effect&&o.classNames.push("swiper-container-"+o.params.effect),"cube"===o.params.effect&&(o.params.resistanceRatio=0,o.params.slidesPerView=1,o.params.slidesPerColumn=1,o.params.slidesPerGroup=1,o.params.centeredSlides=!1,o.params.spaceBetween=0,o.params.virtualTranslate=!0,o.params.setWrapperSize=!1),"fade"===o.params.effect&&(o.params.slidesPerView=1,o.params.slidesPerColumn=1,o.params.slidesPerGroup=1,o.params.watchSlidesProgress=!0,o.params.spaceBetween=0,"undefined"==typeof l&&(o.params.virtualTranslate=!0)),o.params.grabCursor&&o.support.touch&&(o.params.grabCursor=!1),o.wrapper=o.container.children("."+o.params.wrapperClass),o.params.pagination&&(o.paginationContainer=a(o.params.pagination),o.params.paginationClickable&&o.paginationContainer.addClass("swiper-pagination-clickable")),o.rtl=e()&&("rtl"===o.container[0].dir.toLowerCase()||"rtl"===o.container.css("direction")),o.rtl&&o.classNames.push("swiper-container-rtl"),o.rtl&&(o.wrongRTL="-webkit-box"===o.wrapper.css("display")),o.params.slidesPerColumn>1&&o.classNames.push("swiper-container-multirow"),o.device.android&&o.classNames.push("swiper-container-android"),o.container.addClass(o.classNames.join(" ")),o.translate=0,o.progress=0,o.velocity=0,o.lockSwipeToNext=function(){o.params.allowSwipeToNext=!1},o.lockSwipeToPrev=function(){o.params.allowSwipeToPrev=!1},o.lockSwipes=function(){o.params.allowSwipeToNext=o.params.allowSwipeToPrev=!1},o.unlockSwipeToNext=function(){o.params.allowSwipeToNext=!0},o.unlockSwipeToPrev=function(){o.params.allowSwipeToPrev=!0},o.unlockSwipes=function(){o.params.allowSwipeToNext=o.params.allowSwipeToPrev=!0},o.params.grabCursor&&(o.container[0].style.cursor="move",o.container[0].style.cursor="-webkit-grab",o.container[0].style.cursor="-moz-grab",o.container[0].style.cursor="grab"),o.imagesToLoad=[],o.imagesLoaded=0,o.loadImage=function(a,b,c,d){function e(){d&&d()}var f;a.complete&&c?e():b?(f=new Image,f.onload=e,f.onerror=e,f.src=b):e()},o.preloadImages=function(){function a(){"undefined"!=typeof o&&null!==o&&(void 0!==o.imagesLoaded&&o.imagesLoaded++,o.imagesLoaded===o.imagesToLoad.length&&(o.params.updateOnImagesReady&&o.update(),o.emit("onImagesReady",o)))}o.imagesToLoad=o.container.find("img");for(var b=0;b<o.imagesToLoad.length;b++)o.loadImage(o.imagesToLoad[b],o.imagesToLoad[b].currentSrc||o.imagesToLoad[b].getAttribute("src"),!0,a)},o.autoplayTimeoutId=void 0,o.autoplaying=!1,o.autoplayPaused=!1,o.startAutoplay=function(){return"undefined"!=typeof o.autoplayTimeoutId?!1:o.params.autoplay?o.autoplaying?!1:(o.autoplaying=!0,o.emit("onAutoplayStart",o),void f()):!1},o.stopAutoplay=function(){o.autoplayTimeoutId&&(o.autoplayTimeoutId&&clearTimeout(o.autoplayTimeoutId),o.autoplaying=!1,o.autoplayTimeoutId=void 0,o.emit("onAutoplayStop",o))},o.pauseAutoplay=function(a){o.autoplayPaused||(o.autoplayTimeoutId&&clearTimeout(o.autoplayTimeoutId),o.autoplayPaused=!0,0===a?(o.autoplayPaused=!1,f()):o.wrapper.transitionEnd(function(){o.autoplayPaused=!1,o.autoplaying?f():o.stopAutoplay()}))},o.minTranslate=function(){return-o.snapGrid[0]},o.maxTranslate=function(){return-o.snapGrid[o.snapGrid.length-1]},o.updateContainerSize=function(){o.width=o.container[0].clientWidth,o.height=o.container[0].clientHeight,o.size=e()?o.width:o.height},o.updateSlidesSize=function(){o.slides=o.wrapper.children("."+o.params.slideClass),o.snapGrid=[],o.slidesGrid=[],o.slidesSizesGrid=[];var a,b=o.params.spaceBetween,c=0,d=0,f=0;"string"==typeof b&&b.indexOf("%")>=0&&(b=parseFloat(b.replace("%",""))/100*o.size),o.virtualSize=-b,o.rtl?o.slides.css({marginLeft:"",marginTop:""}):o.slides.css({marginRight:"",marginBottom:""});var g;o.params.slidesPerColumn>1&&(g=Math.floor(o.slides.length/o.params.slidesPerColumn)===o.slides.length/o.params.slidesPerColumn?o.slides.length:Math.ceil(o.slides.length/o.params.slidesPerColumn)*o.params.slidesPerColumn);var h;for(a=0;a<o.slides.length;a++){h=0;var i=o.slides.eq(a);if(o.params.slidesPerColumn>1){var j,k,l,m,n=o.params.slidesPerColumn;"column"===o.params.slidesPerColumnFill?(k=Math.floor(a/n),l=a-k*n,j=k+l*g/n,i.css({"-webkit-box-ordinal-group":j,"-moz-box-ordinal-group":j,"-ms-flex-order":j,"-webkit-order":j,order:j})):(m=g/n,l=Math.floor(a/m),k=a-l*m),i.css({"margin-top":0!==l&&o.params.spaceBetween&&o.params.spaceBetween+"px"}).attr("data-swiper-column",k).attr("data-swiper-row",l)}"none"!==i.css("display")&&("auto"===o.params.slidesPerView?h=e()?i.outerWidth(!0):i.outerHeight(!0):(h=(o.size-(o.params.slidesPerView-1)*b)/o.params.slidesPerView,e()?o.slides[a].style.width=h+"px":o.slides[a].style.height=h+"px"),o.slides[a].swiperSlideSize=h,o.slidesSizesGrid.push(h),o.params.centeredSlides?(c=c+h/2+d/2+b,0===a&&(c=c-o.size/2-b),Math.abs(c)<.001&&(c=0),f%o.params.slidesPerGroup===0&&o.snapGrid.push(c),o.slidesGrid.push(c)):(f%o.params.slidesPerGroup===0&&o.snapGrid.push(c),o.slidesGrid.push(c),c=c+h+b),o.virtualSize+=h+b,d=h,f++)}o.virtualSize=Math.max(o.virtualSize,o.size);var p;if(o.rtl&&o.wrongRTL&&("slide"===o.params.effect||"coverflow"===o.params.effect)&&o.wrapper.css({width:o.virtualSize+o.params.spaceBetween+"px"}),(!o.support.flexbox||o.params.setWrapperSize)&&(e()?o.wrapper.css({width:o.virtualSize+o.params.spaceBetween+"px"}):o.wrapper.css({height:o.virtualSize+o.params.spaceBetween+"px"})),o.params.slidesPerColumn>1&&(o.virtualSize=(h+o.params.spaceBetween)*g,o.virtualSize=Math.ceil(o.virtualSize/o.params.slidesPerColumn)-o.params.spaceBetween,o.wrapper.css({width:o.virtualSize+o.params.spaceBetween+"px"}),o.params.centeredSlides)){for(p=[],a=0;a<o.snapGrid.length;a++)o.snapGrid[a]<o.virtualSize+o.snapGrid[0]&&p.push(o.snapGrid[a]);o.snapGrid=p}if(!o.params.centeredSlides){for(p=[],a=0;a<o.snapGrid.length;a++)o.snapGrid[a]<=o.virtualSize-o.size&&p.push(o.snapGrid[a]);o.snapGrid=p,Math.floor(o.virtualSize-o.size)>Math.floor(o.snapGrid[o.snapGrid.length-1])&&o.snapGrid.push(o.virtualSize-o.size)}0===o.snapGrid.length&&(o.snapGrid=[0]),0!==o.params.spaceBetween&&(e()?o.rtl?o.slides.css({marginLeft:b+"px"}):o.slides.css({marginRight:b+"px"}):o.slides.css({marginBottom:b+"px"})),o.params.watchSlidesProgress&&o.updateSlidesOffset()},o.updateSlidesOffset=function(){for(var a=0;a<o.slides.length;a++)o.slides[a].swiperSlideOffset=e()?o.slides[a].offsetLeft:o.slides[a].offsetTop},o.updateSlidesProgress=function(a){if("undefined"==typeof a&&(a=o.translate||0),0!==o.slides.length){"undefined"==typeof o.slides[0].swiperSlideOffset&&o.updateSlidesOffset();var b=o.params.centeredSlides?-a+o.size/2:-a;o.rtl&&(b=o.params.centeredSlides?a-o.size/2:a),o.slides.removeClass(o.params.slideVisibleClass);for(var c=0;c<o.slides.length;c++){var d=o.slides[c],e=o.params.centeredSlides===!0?d.swiperSlideSize/2:0,f=(b-d.swiperSlideOffset-e)/(d.swiperSlideSize+o.params.spaceBetween);if(o.params.watchSlidesVisibility){var g=-(b-d.swiperSlideOffset-e),h=g+o.slidesSizesGrid[c],i=g>=0&&g<o.size||h>0&&h<=o.size||0>=g&&h>=o.size;i&&o.slides.eq(c).addClass(o.params.slideVisibleClass)}d.progress=o.rtl?-f:f}}},o.updateProgress=function(a){"undefined"==typeof a&&(a=o.translate||0);var b=o.maxTranslate()-o.minTranslate();0===b?(o.progress=0,o.isBeginning=o.isEnd=!0):(o.progress=(a-o.minTranslate())/b,o.isBeginning=o.progress<=0,o.isEnd=o.progress>=1),o.isBeginning&&o.emit("onReachBeginning",o),o.isEnd&&o.emit("onReachEnd",o),o.params.watchSlidesProgress&&o.updateSlidesProgress(a),o.emit("onProgress",o,o.progress)},o.updateActiveIndex=function(){var a,b,c,d=o.rtl?o.translate:-o.translate;for(b=0;b<o.slidesGrid.length;b++)"undefined"!=typeof o.slidesGrid[b+1]?d>=o.slidesGrid[b]&&d<o.slidesGrid[b+1]-(o.slidesGrid[b+1]-o.slidesGrid[b])/2?a=b:d>=o.slidesGrid[b]&&d<o.slidesGrid[b+1]&&(a=b+1):d>=o.slidesGrid[b]&&(a=b);(0>a||"undefined"==typeof a)&&(a=0),c=Math.floor(a/o.params.slidesPerGroup),c>=o.snapGrid.length&&(c=o.snapGrid.length-1),a!==o.activeIndex&&(o.snapIndex=c,o.previousIndex=o.activeIndex,o.activeIndex=a,o.updateClasses())},o.updateClasses=function(){o.slides.removeClass(o.params.slideActiveClass+" "+o.params.slideNextClass+" "+o.params.slidePrevClass);var b=o.slides.eq(o.activeIndex);if(b.addClass(o.params.slideActiveClass),b.next("."+o.params.slideClass).addClass(o.params.slideNextClass),b.prev("."+o.params.slideClass).addClass(o.params.slidePrevClass),o.bullets&&o.bullets.length>0){o.bullets.removeClass(o.params.bulletActiveClass);var c;o.params.loop?(c=Math.ceil(o.activeIndex-o.loopedSlides)/o.params.slidesPerGroup,c>o.slides.length-1-2*o.loopedSlides&&(c-=o.slides.length-2*o.loopedSlides),c>o.bullets.length-1&&(c-=o.bullets.length)):c="undefined"!=typeof o.snapIndex?o.snapIndex:o.activeIndex||0,o.paginationContainer.length>1?o.bullets.each(function(){a(this).index()===c&&a(this).addClass(o.params.bulletActiveClass)}):o.bullets.eq(c).addClass(o.params.bulletActiveClass)}o.params.loop||(o.params.prevButton&&(o.isBeginning?(a(o.params.prevButton).addClass(o.params.buttonDisabledClass),o.params.a11y&&o.a11y&&o.a11y.disable(a(o.params.prevButton))):(a(o.params.prevButton).removeClass(o.params.buttonDisabledClass),o.params.a11y&&o.a11y&&o.a11y.enable(a(o.params.prevButton)))),o.params.nextButton&&(o.isEnd?(a(o.params.nextButton).addClass(o.params.buttonDisabledClass),o.params.a11y&&o.a11y&&o.a11y.disable(a(o.params.nextButton))):(a(o.params.nextButton).removeClass(o.params.buttonDisabledClass),o.params.a11y&&o.a11y&&o.a11y.enable(a(o.params.nextButton)))))},o.updatePagination=function(){if(o.params.pagination&&o.paginationContainer&&o.paginationContainer.length>0){for(var a="",b=o.params.loop?Math.ceil((o.slides.length-2*o.loopedSlides)/o.params.slidesPerGroup):o.snapGrid.length,c=0;b>c;c++)a+=o.params.paginationBulletRender?o.params.paginationBulletRender(c,o.params.bulletClass):'<span class="'+o.params.bulletClass+'"></span>';o.paginationContainer.html(a),o.bullets=o.paginationContainer.find("."+o.params.bulletClass)}},o.update=function(a){function b(){d=Math.min(Math.max(o.translate,o.maxTranslate()),o.minTranslate()),o.setWrapperTranslate(d),o.updateActiveIndex(),o.updateClasses()}if(o.updateContainerSize(),o.updateSlidesSize(),o.updateProgress(),o.updatePagination(),o.updateClasses(),o.params.scrollbar&&o.scrollbar&&o.scrollbar.set(),a){var c,d;o.params.freeMode?b():(c="auto"===o.params.slidesPerView&&o.isEnd&&!o.params.centeredSlides?o.slideTo(o.slides.length-1,0,!1,!0):o.slideTo(o.activeIndex,0,!1,!0),c||b())}},o.onResize=function(){if(o.updateContainerSize(),o.updateSlidesSize(),o.updateProgress(),("auto"===o.params.slidesPerView||o.params.freeMode)&&o.updatePagination(),o.params.scrollbar&&o.scrollbar&&o.scrollbar.set(),o.params.freeMode){var a=Math.min(Math.max(o.translate,o.maxTranslate()),o.minTranslate());o.setWrapperTranslate(a),o.updateActiveIndex(),o.updateClasses()}else o.updateClasses(),"auto"===o.params.slidesPerView&&o.isEnd&&!o.params.centeredSlides?o.slideTo(o.slides.length-1,0,!1,!0):o.slideTo(o.activeIndex,0,!1,!0)};var p=["mousedown","mousemove","mouseup"];window.navigator.pointerEnabled?p=["pointerdown","pointermove","pointerup"]:window.navigator.msPointerEnabled&&(p=["MSPointerDown","MSPointerMove","MSPointerUp"]),o.touchEvents={start:o.support.touch||!o.params.simulateTouch?"touchstart":p[0],move:o.support.touch||!o.params.simulateTouch?"touchmove":p[1],end:o.support.touch||!o.params.simulateTouch?"touchend":p[2]},(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&("container"===o.params.touchEventsTarget?o.container:o.wrapper).addClass("swiper-wp8-"+o.params.direction),o.initEvents=function(b){var c=b?"off":"on",e=b?"removeEventListener":"addEventListener",f="container"===o.params.touchEventsTarget?o.container[0]:o.wrapper[0],g=o.support.touch?f:document,h=o.params.nested?!0:!1;o.browser.ie?(f[e](o.touchEvents.start,o.onTouchStart,!1),g[e](o.touchEvents.move,o.onTouchMove,h),g[e](o.touchEvents.end,o.onTouchEnd,!1)):(o.support.touch&&(f[e](o.touchEvents.start,o.onTouchStart,!1),f[e](o.touchEvents.move,o.onTouchMove,h),f[e](o.touchEvents.end,o.onTouchEnd,!1)),!d.simulateTouch||o.device.ios||o.device.android||(f[e]("mousedown",o.onTouchStart,!1),g[e]("mousemove",o.onTouchMove,h),g[e]("mouseup",o.onTouchEnd,!1))),window[e]("resize",o.onResize),o.params.nextButton&&(a(o.params.nextButton)[c]("click",o.onClickNext),o.params.a11y&&o.a11y&&a(o.params.nextButton)[c]("keydown",o.a11y.onEnterKey)),o.params.prevButton&&(a(o.params.prevButton)[c]("click",o.onClickPrev),o.params.a11y&&o.a11y&&a(o.params.prevButton)[c]("keydown",o.a11y.onEnterKey)),o.params.pagination&&o.params.paginationClickable&&a(o.paginationContainer)[c]("click","."+o.params.bulletClass,o.onClickIndex),(o.params.preventClicks||o.params.preventClicksPropagation)&&f[e]("click",o.preventClicks,!0)},o.attachEvents=function(){o.initEvents()},o.detachEvents=function(){o.initEvents(!0)},o.allowClick=!0,o.preventClicks=function(a){o.allowClick||(o.params.preventClicks&&a.preventDefault(),o.params.preventClicksPropagation&&(a.stopPropagation(),a.stopImmediatePropagation()))},o.onClickNext=function(a){a.preventDefault(),o.slideNext()},o.onClickPrev=function(a){a.preventDefault(),o.slidePrev()},o.onClickIndex=function(b){b.preventDefault();var c=a(this).index()*o.params.slidesPerGroup;o.params.loop&&(c+=o.loopedSlides),o.slideTo(c)},o.updateClickedSlide=function(b){var c=g(b,"."+o.params.slideClass);if(!c)return o.clickedSlide=void 0,void(o.clickedIndex=void 0);if(o.clickedSlide=c,o.clickedIndex=a(c).index(),o.params.slideToClickedSlide&&void 0!==o.clickedIndex&&o.clickedIndex!==o.activeIndex){var d,e=o.clickedIndex;if(o.params.loop)if(d=a(o.clickedSlide).attr("data-swiper-slide-index"),e>o.slides.length-o.params.slidesPerView)o.fixLoop(),e=o.wrapper.children("."+o.params.slideClass+'[data-swiper-slide-index="'+d+'"]').eq(0).index(),setTimeout(function(){o.slideTo(e)},0);else if(e<o.params.slidesPerView-1){o.fixLoop();var f=o.wrapper.children("."+o.params.slideClass+'[data-swiper-slide-index="'+d+'"]');e=f.eq(f.length-1).index(),setTimeout(function(){o.slideTo(e)},0)}else o.slideTo(e);else o.slideTo(e)}};var q,r,s,t,u,v,w,x,y,z="input, select, textarea, button",A=Date.now(),B=[];o.animating=!1,o.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0};var C,D;o.onTouchStart=function(b){if(b.originalEvent&&(b=b.originalEvent),C="touchstart"===b.type,C||!("which"in b)||3!==b.which){if(o.params.noSwiping&&g(b,"."+o.params.noSwipingClass))return void(o.allowClick=!0);if(!o.params.swipeHandler||g(b,o.params.swipeHandler)){if(q=!0,r=!1,t=void 0,D=void 0,o.touches.startX=o.touches.currentX="touchstart"===b.type?b.targetTouches[0].pageX:b.pageX,o.touches.startY=o.touches.currentY="touchstart"===b.type?b.targetTouches[0].pageY:b.pageY,s=Date.now(),o.allowClick=!0,o.updateContainerSize(),o.swipeDirection=void 0,o.params.threshold>0&&(w=!1),"touchstart"!==b.type){var c=!0;a(b.target).is(z)&&(c=!1),document.activeElement&&a(document.activeElement).is(z)&&document.activeElement.blur(),c&&b.preventDefault()}o.emit("onTouchStart",o,b)}}},o.onTouchMove=function(b){if(b.originalEvent&&(b=b.originalEvent),!(C&&"mousemove"===b.type||b.preventedByNestedSwiper)){if(o.params.onlyExternal)return r=!0,void(o.allowClick=!1);if(C&&document.activeElement&&b.target===document.activeElement&&a(b.target).is(z))return r=!0,void(o.allowClick=!1);if(o.emit("onTouchMove",o,b),!(b.targetTouches&&b.targetTouches.length>1)){if(o.touches.currentX="touchmove"===b.type?b.targetTouches[0].pageX:b.pageX,o.touches.currentY="touchmove"===b.type?b.targetTouches[0].pageY:b.pageY,"undefined"==typeof t){var c=180*Math.atan2(Math.abs(o.touches.currentY-o.touches.startY),Math.abs(o.touches.currentX-o.touches.startX))/Math.PI;t=e()?c>o.params.touchAngle:90-c>o.params.touchAngle}if(t&&o.emit("onTouchMoveOpposite",o,b),"undefined"==typeof D&&o.browser.ieTouch&&(o.touches.currentX!==o.touches.startX||o.touches.currentY!==o.touches.startY)&&(D=!0),q){if(t)return void(q=!1);if(D||!o.browser.ieTouch){o.allowClick=!1,o.emit("onSliderMove",o,b),b.preventDefault(),o.params.touchMoveStopPropagation&&!o.params.nested&&b.stopPropagation(),r||(d.loop&&o.fixLoop(),v=o.getWrapperTranslate(),o.setWrapperTransition(0),o.animating&&o.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"),o.params.autoplay&&o.autoplaying&&(o.params.autoplayDisableOnInteraction?o.stopAutoplay():o.pauseAutoplay()),y=!1,o.params.grabCursor&&(o.container[0].style.cursor="move",o.container[0].style.cursor="-webkit-grabbing",o.container[0].style.cursor="-moz-grabbin",o.container[0].style.cursor="grabbing")),r=!0;var f=o.touches.diff=e()?o.touches.currentX-o.touches.startX:o.touches.currentY-o.touches.startY;f*=o.params.touchRatio,o.rtl&&(f=-f),o.swipeDirection=f>0?"prev":"next",u=f+v;var g=!0;if(f>0&&u>o.minTranslate()?(g=!1,o.params.resistance&&(u=o.minTranslate()-1+Math.pow(-o.minTranslate()+v+f,o.params.resistanceRatio))):0>f&&u<o.maxTranslate()&&(g=!1,o.params.resistance&&(u=o.maxTranslate()+1-Math.pow(o.maxTranslate()-v-f,o.params.resistanceRatio))),g&&(b.preventedByNestedSwiper=!0),!o.params.allowSwipeToNext&&"next"===o.swipeDirection&&v>u&&(u=v),!o.params.allowSwipeToPrev&&"prev"===o.swipeDirection&&u>v&&(u=v),o.params.followFinger){if(o.params.threshold>0){if(!(Math.abs(f)>o.params.threshold||w))return void(u=v);if(!w)return w=!0,o.touches.startX=o.touches.currentX,o.touches.startY=o.touches.currentY,u=v,void(o.touches.diff=e()?o.touches.currentX-o.touches.startX:o.touches.currentY-o.touches.startY)}(o.params.freeMode||o.params.watchSlidesProgress)&&o.updateActiveIndex(),o.params.freeMode&&(0===B.length&&B.push({position:o.touches[e()?"startX":"startY"],time:s}),B.push({position:o.touches[e()?"currentX":"currentY"],time:(new Date).getTime()})),o.updateProgress(u),o.setWrapperTranslate(u)}}}}}},o.onTouchEnd=function(b){if(b.originalEvent&&(b=b.originalEvent),o.emit("onTouchEnd",o,b),q){o.params.grabCursor&&r&&q&&(o.container[0].style.cursor="move",o.container[0].style.cursor="-webkit-grab",o.container[0].style.cursor="-moz-grab",o.container[0].style.cursor="grab");var c=Date.now(),d=c-s;if(o.allowClick&&(o.updateClickedSlide(b),o.emit("onTap",o,b),300>d&&c-A>300&&(x&&clearTimeout(x),x=setTimeout(function(){o&&(o.params.paginationHide&&o.paginationContainer.length>0&&!a(b.target).hasClass(o.params.bulletClass)&&o.paginationContainer.toggleClass(o.params.paginationHiddenClass),o.emit("onClick",o,b))},300)),300>d&&300>c-A&&(x&&clearTimeout(x),o.emit("onDoubleTap",o,b))),A=Date.now(),setTimeout(function(){o&&o.allowClick&&(o.allowClick=!0)},0),!q||!r||!o.swipeDirection||0===o.touches.diff||u===v)return void(q=r=!1);q=r=!1;var e;if(e=o.params.followFinger?o.rtl?o.translate:-o.translate:-u,o.params.freeMode){if(e<-o.minTranslate())return void o.slideTo(o.activeIndex);if(e>-o.maxTranslate())return void o.slideTo(o.slides.length-1);if(o.params.freeModeMomentum){if(B.length>1){var f=B.pop(),g=B.pop(),h=f.position-g.position,i=f.time-g.time;o.velocity=h/i,o.velocity=o.velocity/2,Math.abs(o.velocity)<.02&&(o.velocity=0),(i>150||(new Date).getTime()-f.time>300)&&(o.velocity=0)}else o.velocity=0;B.length=0;var j=1e3*o.params.freeModeMomentumRatio,k=o.velocity*j,l=o.translate+k;o.rtl&&(l=-l);var m,n=!1,p=20*Math.abs(o.velocity)*o.params.freeModeMomentumBounceRatio;l<o.maxTranslate()&&(o.params.freeModeMomentumBounce?(l+o.maxTranslate()<-p&&(l=o.maxTranslate()-p),m=o.maxTranslate(),n=!0,y=!0):l=o.maxTranslate()),l>o.minTranslate()&&(o.params.freeModeMomentumBounce?(l-o.minTranslate()>p&&(l=o.minTranslate()+p),m=o.minTranslate(),n=!0,y=!0):l=o.minTranslate()),0!==o.velocity&&(j=o.rtl?Math.abs((-l-o.translate)/o.velocity):Math.abs((l-o.translate)/o.velocity)),o.params.freeModeMomentumBounce&&n?(o.updateProgress(m),o.setWrapperTransition(j),o.setWrapperTranslate(l),o.onTransitionStart(),o.animating=!0,o.wrapper.transitionEnd(function(){y&&(o.emit("onMomentumBounce",o),o.setWrapperTransition(o.params.speed),o.setWrapperTranslate(m),o.wrapper.transitionEnd(function(){o.onTransitionEnd()}))})):o.velocity?(o.updateProgress(l),o.setWrapperTransition(j),o.setWrapperTranslate(l),o.onTransitionStart(),o.animating||(o.animating=!0,o.wrapper.transitionEnd(function(){o.onTransitionEnd()}))):o.updateProgress(l),o.updateActiveIndex()}return void((!o.params.freeModeMomentum||d>=o.params.longSwipesMs)&&(o.updateProgress(),o.updateActiveIndex()))}var t,w=0,z=o.slidesSizesGrid[0];for(t=0;t<o.slidesGrid.length;t+=o.params.slidesPerGroup)"undefined"!=typeof o.slidesGrid[t+o.params.slidesPerGroup]?e>=o.slidesGrid[t]&&e<o.slidesGrid[t+o.params.slidesPerGroup]&&(w=t,z=o.slidesGrid[t+o.params.slidesPerGroup]-o.slidesGrid[t]):e>=o.slidesGrid[t]&&(w=t,z=o.slidesGrid[o.slidesGrid.length-1]-o.slidesGrid[o.slidesGrid.length-2]);var C=(e-o.slidesGrid[w])/z;if(d>o.params.longSwipesMs){if(!o.params.longSwipes)return void o.slideTo(o.activeIndex);"next"===o.swipeDirection&&(C>=o.params.longSwipesRatio?o.slideTo(w+o.params.slidesPerGroup):o.slideTo(w)),"prev"===o.swipeDirection&&(C>1-o.params.longSwipesRatio?o.slideTo(w+o.params.slidesPerGroup):o.slideTo(w))}else{if(!o.params.shortSwipes)return void o.slideTo(o.activeIndex);"next"===o.swipeDirection&&o.slideTo(w+o.params.slidesPerGroup),"prev"===o.swipeDirection&&o.slideTo(w)}}},o._slideTo=function(a,b){return o.slideTo(a,b,!0,!0)},o.slideTo=function(a,b,c,d){"undefined"==typeof c&&(c=!0),"undefined"==typeof a&&(a=0),0>a&&(a=0),o.snapIndex=Math.floor(a/o.params.slidesPerGroup),o.snapIndex>=o.snapGrid.length&&(o.snapIndex=o.snapGrid.length-1);var e=-o.snapGrid[o.snapIndex];o.params.autoplay&&o.autoplaying&&(d||!o.params.autoplayDisableOnInteraction?o.pauseAutoplay(b):o.stopAutoplay()),o.updateProgress(e);for(var f=0;f<o.slidesGrid.length;f++)-e>=o.slidesGrid[f]&&(a=f);return"undefined"==typeof b&&(b=o.params.speed),o.previousIndex=o.activeIndex||0,o.activeIndex=a,e===o.translate?(o.updateClasses(),!1):(o.onTransitionStart(c),0===b?(o.setWrapperTransition(0),o.setWrapperTranslate(e),o.onTransitionEnd(c)):(o.setWrapperTransition(b),o.setWrapperTranslate(e),o.animating||(o.animating=!0,o.wrapper.transitionEnd(function(){o.onTransitionEnd(c)}))),o.updateClasses(),!0)},o.onTransitionStart=function(a){"undefined"==typeof a&&(a=!0),o.lazy&&o.lazy.onTransitionStart(),a&&(o.emit("onTransitionStart",o),o.activeIndex!==o.previousIndex&&o.emit("onSlideChangeStart",o))},o.onTransitionEnd=function(a){o.animating=!1,o.setWrapperTransition(0),"undefined"==typeof a&&(a=!0),o.lazy&&o.lazy.onTransitionEnd(),a&&(o.emit("onTransitionEnd",o),o.activeIndex!==o.previousIndex&&o.emit("onSlideChangeEnd",o)),o.params.hashnav&&o.hashnav&&o.hashnav.setHash()},o.slideNext=function(a,b,c){return o.params.loop?o.animating?!1:(o.fixLoop(),o.slideTo(o.activeIndex+o.params.slidesPerGroup,b,a,c)):o.slideTo(o.activeIndex+o.params.slidesPerGroup,b,a,c)},o._slideNext=function(a){return o.slideNext(!0,a,!0)},o.slidePrev=function(a,b,c){return o.params.loop?o.animating?!1:(o.fixLoop(),o.slideTo(o.activeIndex-1,b,a,c)):o.slideTo(o.activeIndex-1,b,a,c)},o._slidePrev=function(a){return o.slidePrev(!0,a,!0)},o.slideReset=function(a,b){return o.slideTo(o.activeIndex,b,a)},o.setWrapperTransition=function(a,b){o.wrapper.transition(a),"slide"!==o.params.effect&&o.effects[o.params.effect]&&o.effects[o.params.effect].setTransition(a),o.params.parallax&&o.parallax&&o.parallax.setTransition(a),o.params.scrollbar&&o.scrollbar&&o.scrollbar.setTransition(a),o.params.control&&o.controller&&o.controller.setTransition(a,b),o.emit("onSetTransition",o,a)},o.setWrapperTranslate=function(a,b,c){var d=0,f=0,g=0;e()?d=o.rtl?-a:a:f=a,o.params.virtualTranslate||(o.support.transforms3d?o.wrapper.transform("translate3d("+d+"px, "+f+"px, "+g+"px)"):o.wrapper.transform("translate("+d+"px, "+f+"px)")),o.translate=e()?d:f,b&&o.updateActiveIndex(),"slide"!==o.params.effect&&o.effects[o.params.effect]&&o.effects[o.params.effect].setTranslate(o.translate),o.params.parallax&&o.parallax&&o.parallax.setTranslate(o.translate),o.params.scrollbar&&o.scrollbar&&o.scrollbar.setTranslate(o.translate),o.params.control&&o.controller&&o.controller.setTranslate(o.translate,c),o.emit("onSetTranslate",o,o.translate)},o.getTranslate=function(a,b){var c,d,e,f;return"undefined"==typeof b&&(b="x"),o.params.virtualTranslate?o.rtl?-o.translate:o.translate:(e=window.getComputedStyle(a,null),window.WebKitCSSMatrix?f=new WebKitCSSMatrix("none"===e.webkitTransform?"":e.webkitTransform):(f=e.MozTransform||e.OTransform||e.MsTransform||e.msTransform||e.transform||e.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),c=f.toString().split(",")),"x"===b&&(d=window.WebKitCSSMatrix?f.m41:16===c.length?parseFloat(c[12]):parseFloat(c[4])),"y"===b&&(d=window.WebKitCSSMatrix?f.m42:16===c.length?parseFloat(c[13]):parseFloat(c[5])),o.rtl&&d&&(d=-d),d||0)},o.getWrapperTranslate=function(a){return"undefined"==typeof a&&(a=e()?"x":"y"),o.getTranslate(o.wrapper[0],a)},o.observers=[],o.initObservers=function(){if(o.params.observeParents)for(var a=o.container.parents(),b=0;b<a.length;b++)h(a[b]);h(o.container[0],{childList:!1}),h(o.wrapper[0],{attributes:!1})},o.disconnectObservers=function(){for(var a=0;a<o.observers.length;a++)o.observers[a].disconnect();o.observers=[]},o.createLoop=function(){o.wrapper.children("."+o.params.slideClass+"."+o.params.slideDuplicateClass).remove();var b=o.wrapper.children("."+o.params.slideClass);o.loopedSlides=parseInt(o.params.loopedSlides||o.params.slidesPerView,10),o.loopedSlides=o.loopedSlides+o.params.loopAdditionalSlides,o.loopedSlides>b.length&&(o.loopedSlides=b.length);var c,d=[],e=[];for(b.each(function(c,f){var g=a(this);c<o.loopedSlides&&e.push(f),c<b.length&&c>=b.length-o.loopedSlides&&d.push(f),g.attr("data-swiper-slide-index",c)}),c=0;c<e.length;c++)o.wrapper.append(a(e[c].cloneNode(!0)).addClass(o.params.slideDuplicateClass));for(c=d.length-1;c>=0;c--)o.wrapper.prepend(a(d[c].cloneNode(!0)).addClass(o.params.slideDuplicateClass))},o.destroyLoop=function(){o.wrapper.children("."+o.params.slideClass+"."+o.params.slideDuplicateClass).remove(),o.slides.removeAttr("data-swiper-slide-index")},o.fixLoop=function(){var a;o.activeIndex<o.loopedSlides?(a=o.slides.length-3*o.loopedSlides+o.activeIndex,a+=o.loopedSlides,o.slideTo(a,0,!1,!0)):("auto"===o.params.slidesPerView&&o.activeIndex>=2*o.loopedSlides||o.activeIndex>o.slides.length-2*o.params.slidesPerView)&&(a=-o.slides.length+o.activeIndex+o.loopedSlides,a+=o.loopedSlides,o.slideTo(a,0,!1,!0))},o.appendSlide=function(a){if(o.params.loop&&o.destroyLoop(),"object"==typeof a&&a.length)for(var b=0;b<a.length;b++)a[b]&&o.wrapper.append(a[b]);else o.wrapper.append(a);o.params.loop&&o.createLoop(),o.params.observer&&o.support.observer||o.update(!0)},o.prependSlide=function(a){o.params.loop&&o.destroyLoop();var b=o.activeIndex+1;if("object"==typeof a&&a.length){for(var c=0;c<a.length;c++)a[c]&&o.wrapper.prepend(a[c]);b=o.activeIndex+a.length}else o.wrapper.prepend(a);o.params.loop&&o.createLoop(),o.params.observer&&o.support.observer||o.update(!0),o.slideTo(b,0,!1)},o.removeSlide=function(a){o.params.loop&&o.destroyLoop();var b,c=o.activeIndex;if("object"==typeof a&&a.length){for(var d=0;d<a.length;d++)b=a[d],o.slides[b]&&o.slides.eq(b).remove(),c>b&&c--;c=Math.max(c,0)}else b=a,o.slides[b]&&o.slides.eq(b).remove(),c>b&&c--,c=Math.max(c,0);o.params.observer&&o.support.observer||o.update(!0),o.slideTo(c,0,!1)},o.removeAllSlides=function(){for(var a=[],b=0;b<o.slides.length;b++)a.push(b);o.removeSlide(a)},o.effects={fade:{fadeIndex:null,setTranslate:function(){for(var a=0;a<o.slides.length;a++){var b=o.slides.eq(a),c=b[0].swiperSlideOffset,d=-c;o.params.virtualTranslate||(d-=o.translate);var f=0;e()||(f=d,d=0);var g=o.params.fade.crossFade?Math.max(1-Math.abs(b[0].progress),0):1+Math.min(Math.max(b[0].progress,-1),0);g>0&&1>g&&(o.effects.fade.fadeIndex=a),b.css({opacity:g}).transform("translate3d("+d+"px, "+f+"px, 0px)")}},setTransition:function(a){if(o.slides.transition(a),o.params.virtualTranslate&&0!==a){var b=null!==o.effects.fade.fadeIndex?o.effects.fade.fadeIndex:o.activeIndex;o.slides.eq(b).transitionEnd(function(){for(var a=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],b=0;b<a.length;b++)o.wrapper.trigger(a[b])})}}},cube:{setTranslate:function(){var b,c=0;o.params.cube.shadow&&(e()?(b=o.wrapper.find(".swiper-cube-shadow"),0===b.length&&(b=a('<div class="swiper-cube-shadow"></div>'),o.wrapper.append(b)),b.css({height:o.width+"px"})):(b=o.container.find(".swiper-cube-shadow"),0===b.length&&(b=a('<div class="swiper-cube-shadow"></div>'),o.container.append(b))));for(var d=0;d<o.slides.length;d++){var f=o.slides.eq(d),g=90*d,h=Math.floor(g/360);o.rtl&&(g=-g,h=Math.floor(-g/360));var i=Math.max(Math.min(f[0].progress,1),-1),j=0,k=0,l=0;d%4===0?(j=4*-h*o.size,l=0):(d-1)%4===0?(j=0,l=4*-h*o.size):(d-2)%4===0?(j=o.size+4*h*o.size,l=o.size):(d-3)%4===0&&(j=-o.size,l=3*o.size+4*o.size*h),o.rtl&&(j=-j),e()||(k=j,j=0);var m="rotateX("+(e()?0:-g)+"deg) rotateY("+(e()?g:0)+"deg) translate3d("+j+"px, "+k+"px, "+l+"px)";if(1>=i&&i>-1&&(c=90*d+90*i,o.rtl&&(c=90*-d-90*i)),f.transform(m),o.params.cube.slideShadows){var n=e()?f.find(".swiper-slide-shadow-left"):f.find(".swiper-slide-shadow-top"),p=e()?f.find(".swiper-slide-shadow-right"):f.find(".swiper-slide-shadow-bottom");0===n.length&&(n=a('<div class="swiper-slide-shadow-'+(e()?"left":"top")+'"></div>'),f.append(n)),0===p.length&&(p=a('<div class="swiper-slide-shadow-'+(e()?"right":"bottom")+'"></div>'),f.append(p)),n.length&&(n[0].style.opacity=-f[0].progress),p.length&&(p[0].style.opacity=f[0].progress)}}if(o.wrapper.css({"-webkit-transform-origin":"50% 50% -"+o.size/2+"px","-moz-transform-origin":"50% 50% -"+o.size/2+"px","-ms-transform-origin":"50% 50% -"+o.size/2+"px",
"transform-origin":"50% 50% -"+o.size/2+"px"}),o.params.cube.shadow)if(e())b.transform("translate3d(0px, "+(o.width/2+o.params.cube.shadowOffset)+"px, "+-o.width/2+"px) rotateX(90deg) rotateZ(0deg) scale("+o.params.cube.shadowScale+")");else{var q=Math.abs(c)-90*Math.floor(Math.abs(c)/90),r=1.5-(Math.sin(2*q*Math.PI/360)/2+Math.cos(2*q*Math.PI/360)/2),s=o.params.cube.shadowScale,t=o.params.cube.shadowScale/r,u=o.params.cube.shadowOffset;b.transform("scale3d("+s+", 1, "+t+") translate3d(0px, "+(o.height/2+u)+"px, "+-o.height/2/t+"px) rotateX(-90deg)")}var v=o.isSafari||o.isUiWebView?-o.size/2:0;o.wrapper.transform("translate3d(0px,0,"+v+"px) rotateX("+(e()?0:c)+"deg) rotateY("+(e()?-c:0)+"deg)")},setTransition:function(a){o.slides.transition(a).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(a),o.params.cube.shadow&&!e()&&o.container.find(".swiper-cube-shadow").transition(a)}},coverflow:{setTranslate:function(){for(var b=o.translate,c=e()?-b+o.width/2:-b+o.height/2,d=e()?o.params.coverflow.rotate:-o.params.coverflow.rotate,f=o.params.coverflow.depth,g=0,h=o.slides.length;h>g;g++){var i=o.slides.eq(g),j=o.slidesSizesGrid[g],k=i[0].swiperSlideOffset,l=(c-k-j/2)/j*o.params.coverflow.modifier,m=e()?d*l:0,n=e()?0:d*l,p=-f*Math.abs(l),q=e()?0:o.params.coverflow.stretch*l,r=e()?o.params.coverflow.stretch*l:0;Math.abs(r)<.001&&(r=0),Math.abs(q)<.001&&(q=0),Math.abs(p)<.001&&(p=0),Math.abs(m)<.001&&(m=0),Math.abs(n)<.001&&(n=0);var s="translate3d("+r+"px,"+q+"px,"+p+"px)  rotateX("+n+"deg) rotateY("+m+"deg)";if(i.transform(s),i[0].style.zIndex=-Math.abs(Math.round(l))+1,o.params.coverflow.slideShadows){var t=e()?i.find(".swiper-slide-shadow-left"):i.find(".swiper-slide-shadow-top"),u=e()?i.find(".swiper-slide-shadow-right"):i.find(".swiper-slide-shadow-bottom");0===t.length&&(t=a('<div class="swiper-slide-shadow-'+(e()?"left":"top")+'"></div>'),i.append(t)),0===u.length&&(u=a('<div class="swiper-slide-shadow-'+(e()?"right":"bottom")+'"></div>'),i.append(u)),t.length&&(t[0].style.opacity=l>0?l:0),u.length&&(u[0].style.opacity=-l>0?-l:0)}}if(o.browser.ie){var v=o.wrapper[0].style;v.perspectiveOrigin=c+"px 50%"}},setTransition:function(a){o.slides.transition(a).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(a)}}},o.lazy={initialImageLoaded:!1,loadImageInSlide:function(b){if("undefined"!=typeof b&&0!==o.slides.length){var c=o.slides.eq(b),d=c.find("img.swiper-lazy:not(.swiper-lazy-loaded):not(.swiper-lazy-loading)");0!==d.length&&d.each(function(){var b=a(this);b.addClass("swiper-lazy-loading");var d=b.attr("data-src");o.loadImage(b[0],d,!1,function(){b.attr("src",d),b.removeAttr("data-src"),b.addClass("swiper-lazy-loaded").removeClass("swiper-lazy-loading"),c.find(".swiper-lazy-preloader, .preloader").remove(),o.emit("onLazyImageReady",o,c[0],b[0])}),o.emit("onLazyImageLoad",o,c[0],b[0])})}},load:function(){if(o.params.watchSlidesVisibility)o.wrapper.children("."+o.params.slideVisibleClass).each(function(){o.lazy.loadImageInSlide(a(this).index())});else if(o.params.slidesPerView>1)for(var b=o.activeIndex;b<o.activeIndex+o.params.slidesPerView;b++)o.slides[b]&&o.lazy.loadImageInSlide(b);else o.lazy.loadImageInSlide(o.activeIndex);if(o.params.lazyLoadingInPrevNext){var c=o.wrapper.children("."+o.params.slideNextClass);c.length>0&&o.lazy.loadImageInSlide(c.index());var d=o.wrapper.children("."+o.params.slidePrevClass);d.length>0&&o.lazy.loadImageInSlide(d.index())}},onTransitionStart:function(){o.params.lazyLoading&&(o.params.lazyLoadingOnTransitionStart||!o.params.lazyLoadingOnTransitionStart&&!o.lazy.initialImageLoaded)&&(o.lazy.initialImageLoaded=!0,o.lazy.load())},onTransitionEnd:function(){o.params.lazyLoading&&!o.params.lazyLoadingOnTransitionStart&&o.lazy.load()}},o.scrollbar={set:function(){if(o.params.scrollbar){var b=o.scrollbar;b.track=a(o.params.scrollbar),b.drag=b.track.find(".swiper-scrollbar-drag"),0===b.drag.length&&(b.drag=a('<div class="swiper-scrollbar-drag"></div>'),b.track.append(b.drag)),b.drag[0].style.width="",b.drag[0].style.height="",b.trackSize=e()?b.track[0].offsetWidth:b.track[0].offsetHeight,b.divider=o.size/o.virtualSize,b.moveDivider=b.divider*(b.trackSize/o.size),b.dragSize=b.trackSize*b.divider,e()?b.drag[0].style.width=b.dragSize+"px":b.drag[0].style.height=b.dragSize+"px",b.divider>=1?b.track[0].style.display="none":b.track[0].style.display="",o.params.scrollbarHide&&(b.track[0].style.opacity=0)}},setTranslate:function(){if(o.params.scrollbar){var a,b=o.scrollbar,c=b.dragSize;a=(b.trackSize-b.dragSize)*o.progress,o.rtl&&e()?(a=-a,a>0?(c=b.dragSize-a,a=0):-a+b.dragSize>b.trackSize&&(c=b.trackSize+a)):0>a?(c=b.dragSize+a,a=0):a+b.dragSize>b.trackSize&&(c=b.trackSize-a),e()?(o.support.transforms3d?b.drag.transform("translate3d("+a+"px, 0, 0)"):b.drag.transform("translateX("+a+"px)"),b.drag[0].style.width=c+"px"):(o.support.transforms3d?b.drag.transform("translate3d(0px, "+a+"px, 0)"):b.drag.transform("translateY("+a+"px)"),b.drag[0].style.height=c+"px"),o.params.scrollbarHide&&(clearTimeout(b.timeout),b.track[0].style.opacity=1,b.timeout=setTimeout(function(){b.track[0].style.opacity=0,b.track.transition(400)},1e3))}},setTransition:function(a){o.params.scrollbar&&o.scrollbar.drag.transition(a)}},o.controller={setTranslate:function(a,c){var d,e,f=o.params.control;if(o.isArray(f))for(var g=0;g<f.length;g++)f[g]!==c&&f[g]instanceof b&&(a=f[g].rtl&&"horizontal"===f[g].params.direction?-o.translate:o.translate,d=(f[g].maxTranslate()-f[g].minTranslate())/(o.maxTranslate()-o.minTranslate()),e=(a-o.minTranslate())*d+f[g].minTranslate(),o.params.controlInverse&&(e=f[g].maxTranslate()-e),f[g].updateProgress(e),f[g].setWrapperTranslate(e,!1,o),f[g].updateActiveIndex());else f instanceof b&&c!==f&&(a=f.rtl&&"horizontal"===f.params.direction?-o.translate:o.translate,d=(f.maxTranslate()-f.minTranslate())/(o.maxTranslate()-o.minTranslate()),e=(a-o.minTranslate())*d+f.minTranslate(),o.params.controlInverse&&(e=f.maxTranslate()-e),f.updateProgress(e),f.setWrapperTranslate(e,!1,o),f.updateActiveIndex())},setTransition:function(a,c){var d=o.params.control;if(o.isArray(d))for(var e=0;e<d.length;e++)d[e]!==c&&d[e]instanceof b&&d[e].setWrapperTransition(a,o);else d instanceof b&&c!==d&&d.setWrapperTransition(a,o)}},o.parallax={setTranslate:function(){o.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){i(this,o.progress)}),o.slides.each(function(){var b=a(this);b.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=Math.min(Math.max(b[0].progress,-1),1);i(this,a)})})},setTransition:function(b){"undefined"==typeof b&&(b=o.params.speed),o.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var c=a(this),d=parseInt(c.attr("data-swiper-parallax-duration"),10)||b;0===b&&(d=0),c.transition(d)})}},o._plugins=[];for(var E in o.plugins)if(o.plugins.hasOwnProperty(E)){var F=o.plugins[E](o,o.params[E]);F&&o._plugins.push(F)}return o.callPlugins=function(a){for(var b=0;b<o._plugins.length;b++)a in o._plugins[b]&&o._plugins[b][a](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},o.emitterEventListeners={},o.emit=function(a){o.params[a]&&o.params[a](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);var b;if(o){if(o.emitterEventListeners[a])for(b=0;b<o.emitterEventListeners[a].length;b++)o.emitterEventListeners[a][b](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);o.callPlugins&&o.callPlugins(a,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])}},o.on=function(a,b){return a=j(a),o.emitterEventListeners[a]||(o.emitterEventListeners[a]=[]),o.emitterEventListeners[a].push(b),o},o.off=function(a,b){var c;if(a=j(a),"undefined"==typeof b)return o.emitterEventListeners[a]=[],o;if(o.emitterEventListeners[a]&&0!==o.emitterEventListeners[a].length){for(c=0;c<o.emitterEventListeners[a].length;c++)o.emitterEventListeners[a][c]===b&&o.emitterEventListeners[a].splice(c,1);return o}},o.once=function(a,b){a=j(a);var c=function(){b(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]),o.off(a,c)};return o.on(a,c),o},o.a11y={makeFocusable:function(a){return a[0].tabIndex="0",a},addRole:function(a,b){return a.attr("role",b),a},addLabel:function(a,b){return a.attr("aria-label",b),a},disable:function(a){return a.attr("aria-disabled",!0),a},enable:function(a){return a.attr("aria-disabled",!1),a},onEnterKey:function(b){13===b.keyCode&&(a(b.target).is(o.params.nextButton)?(o.onClickNext(b),o.isEnd?o.a11y.notify(o.params.lastSlideMsg):o.a11y.notify(o.params.nextSlideMsg)):a(b.target).is(o.params.prevButton)&&(o.onClickPrev(b),o.isBeginning?o.a11y.notify(o.params.firstSlideMsg):o.a11y.notify(o.params.prevSlideMsg)))},liveRegion:a('<span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>'),notify:function(a){var b=o.a11y.liveRegion;0!==b.length&&(b.html(""),b.html(a))},init:function(){if(o.params.nextButton){var b=a(o.params.nextButton);o.a11y.makeFocusable(b),o.a11y.addRole(b,"button"),o.a11y.addLabel(b,o.params.nextSlideMsg)}if(o.params.prevButton){var c=a(o.params.prevButton);o.a11y.makeFocusable(c),o.a11y.addRole(c,"button"),o.a11y.addLabel(c,o.params.prevSlideMsg)}a(o.container).append(o.a11y.liveRegion)},destroy:function(){o.a11y.liveRegion&&o.a11y.liveRegion.length>0&&o.a11y.liveRegion.remove()}},o.init=function(){o.params.loop&&o.createLoop(),o.updateContainerSize(),o.updateSlidesSize(),o.updatePagination(),o.params.scrollbar&&o.scrollbar&&o.scrollbar.set(),"slide"!==o.params.effect&&o.effects[o.params.effect]&&(o.params.loop||o.updateProgress(),o.effects[o.params.effect].setTranslate()),o.params.loop?o.slideTo(o.params.initialSlide+o.loopedSlides,0,o.params.runCallbacksOnInit):(o.slideTo(o.params.initialSlide,0,o.params.runCallbacksOnInit),0===o.params.initialSlide&&(o.parallax&&o.params.parallax&&o.parallax.setTranslate(),o.lazy&&o.params.lazyLoading&&o.lazy.load())),o.attachEvents(),o.params.observer&&o.support.observer&&o.initObservers(),o.params.preloadImages&&!o.params.lazyLoading&&o.preloadImages(),o.params.autoplay&&o.startAutoplay(),o.params.keyboardControl&&o.enableKeyboardControl&&o.enableKeyboardControl(),o.params.mousewheelControl&&o.enableMousewheelControl&&o.enableMousewheelControl(),o.params.hashnav&&o.hashnav&&o.hashnav.init(),o.params.a11y&&o.a11y&&o.a11y.init(),o.emit("onInit",o)},o.cleanupStyles=function(){o.container.removeClass(o.classNames.join(" ")).removeAttr("style"),o.wrapper.removeAttr("style"),o.slides&&o.slides.length&&o.slides.removeClass([o.params.slideVisibleClass,o.params.slideActiveClass,o.params.slideNextClass,o.params.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-column").removeAttr("data-swiper-row"),o.paginationContainer&&o.paginationContainer.length&&o.paginationContainer.removeClass(o.params.paginationHiddenClass),o.bullets&&o.bullets.length&&o.bullets.removeClass(o.params.bulletActiveClass),o.params.prevButton&&a(o.params.prevButton).removeClass(o.params.buttonDisabledClass),o.params.nextButton&&a(o.params.nextButton).removeClass(o.params.buttonDisabledClass),o.params.scrollbar&&o.scrollbar&&(o.scrollbar.track&&o.scrollbar.track.length&&o.scrollbar.track.removeAttr("style"),o.scrollbar.drag&&o.scrollbar.drag.length&&o.scrollbar.drag.removeAttr("style"))},o.destroy=function(a,b){o.detachEvents(),o.stopAutoplay(),o.params.loop&&o.destroyLoop(),b&&o.cleanupStyles(),o.disconnectObservers(),o.params.keyboardControl&&o.disableKeyboardControl&&o.disableKeyboardControl(),o.params.mousewheelControl&&o.disableMousewheelControl&&o.disableMousewheelControl(),o.params.a11y&&o.a11y&&o.a11y.destroy(),o.emit("onDestroy"),a!==!1&&(o=null)},o.init(),o}};b.prototype={defaults:{direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,autoplay:!1,autoplayDisableOnInteraction:!0,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0},cube:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94},fade:{crossFade:!1},parallax:!1,scrollbar:null,scrollbarHide:!0,keyboardControl:!1,mousewheelControl:!1,mousewheelForceToAxis:!1,hashnav:!1,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,onlyExternal:!1,threshold:0,touchMoveStopPropagation:!0,pagination:null,paginationClickable:!1,paginationHide:!1,paginationBulletRender:null,resistance:!0,resistanceRatio:.85,nextButton:null,prevButton:null,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,lazyLoading:!1,lazyLoadingInPrevNext:!1,lazyLoadingOnTransitionStart:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,control:void 0,controlInverse:!1,allowSwipeToPrev:!0,allowSwipeToNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",slideClass:"swiper-slide",slideActiveClass:"swiper-slide-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slidePrevClass:"swiper-slide-prev",wrapperClass:"swiper-wrapper",bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",buttonDisabledClass:"swiper-button-disabled",paginationHiddenClass:"swiper-pagination-hidden",observer:!1,observeParents:!1,a11y:!1,prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",runCallbacksOnInit:!0},isSafari:function(){var a=navigator.userAgent.toLowerCase();return a.indexOf("safari")>=0&&a.indexOf("chrome")<0&&a.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent),isArray:function(a){return"[object Array]"===Object.prototype.toString.apply(a)},browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled,ieTouch:window.navigator.msPointerEnabled&&window.navigator.msMaxTouchPoints>1||window.navigator.pointerEnabled&&window.navigator.maxTouchPoints>1},device:function(){var a=navigator.userAgent,b=a.match(/(Android);?[\s\/]+([\d.]+)?/),c=a.match(/(iPad).*OS\s([\d_]+)/),d=!c&&a.match(/(iPhone\sOS)\s([\d_]+)/);return{ios:c||d||c,android:b}}(),support:{touch:window.Modernizr&&Modernizr.touch===!0||function(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===!0||function(){var a=document.createElement("div").style;return"webkitPerspective"in a||"MozPerspective"in a||"OPerspective"in a||"MsPerspective"in a||"perspective"in a}(),flexbox:function(){for(var a=document.createElement("div").style,b="alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" "),c=0;c<b.length;c++)if(b[c]in a)return!0}(),observer:function(){return"MutationObserver"in window||"WebkitMutationObserver"in window}()},plugins:{}},a.Swiper=b}(Zepto),+function(a){"use strict";a.Swiper.prototype.defaults.pagination=".page-current .swiper-pagination",a.swiper=function(b,c){return new a.Swiper(b,c)},a.fn.swiper=function(b){return new a.Swiper(this,b)},a.initSwiper=function(b){function c(a){function b(){a.destroy(),d.off("pageBeforeRemove",b)}d.on("pageBeforeRemove",b)}var d=a(b||document.body),e=d.find(".swiper-container");if(0!==e.length)for(var f=0;f<e.length;f++){var g,h=e.eq(f);if(h.data("swiper"))h.data("swiper").update(!0);else{g=h.dataset();var i=a.swiper(h[0],g);c(i)}}},a.reinitSwiper=function(b){var c=a(b||".page-current"),d=c.find(".swiper-container");if(0!==d.length)for(var e=0;e<d.length;e++){var f=d[0].swiper;f&&f.update(!0)}}}(Zepto),+function(a){"use strict";var b=function(b){var c,d=this,e=this.defaults;b=b||{};for(var f in e)"undefined"==typeof b[f]&&(b[f]=e[f]);d.params=b;var g=d.params.navbarTemplate||'<header class="bar bar-nav"><a class="icon icon-left pull-left photo-browser-close-link'+("popup"===d.params.type?" close-popup":"")+'"></a><h1 class="title"><div class="center sliding"><span class="photo-browser-current"></span> <span class="photo-browser-of">'+d.params.ofText+'</span> <span class="photo-browser-total"></span></div></h1></header>',h=d.params.toolbarTemplate||'<nav class="bar bar-tab"><a class="tab-item photo-browser-prev" href="#"><i class="icon icon-prev"></i></a><a class="tab-item photo-browser-next" href="#"><i class="icon icon-next"></i></a></nav>',i=d.params.template||'<div class="photo-browser photo-browser-'+d.params.theme+'">{{navbar}}{{toolbar}}<div data-page="photo-browser-slides" class="content">{{captions}}<div class="photo-browser-swiper-container swiper-container"><div class="photo-browser-swiper-wrapper swiper-wrapper">{{photos}}</div></div></div></div>',j=d.params.lazyLoading?d.params.photoLazyTemplate||'<div class="photo-browser-slide photo-browser-slide-lazy swiper-slide"><div class="preloader'+("dark"===d.params.theme?" preloader-white":"")+'"></div><span class="photo-browser-zoom-container"><img data-src="{{url}}" class="swiper-lazy"></span></div>':d.params.photoTemplate||'<div class="photo-browser-slide swiper-slide"><span class="photo-browser-zoom-container"><img src="{{url}}"></span></div>',k=d.params.captionsTheme||d.params.theme,l=d.params.captionsTemplate||'<div class="photo-browser-captions photo-browser-captions-'+k+'">{{captions}}</div>',m=d.params.captionTemplate||'<div class="photo-browser-caption" data-caption-index="{{captionIndex}}">{{caption}}</div>',n=d.params.objectTemplate||'<div class="photo-browser-slide photo-browser-object-slide swiper-slide">{{html}}</div>',o="",p="";for(c=0;c<d.params.photos.length;c++){var q=d.params.photos[c],r="";"string"==typeof q||q instanceof String?r=q.indexOf("<")>=0||q.indexOf(">")>=0?n.replace(/{{html}}/g,q):j.replace(/{{url}}/g,q):"object"==typeof q&&(q.hasOwnProperty("html")&&q.html.length>0?r=n.replace(/{{html}}/g,q.html):q.hasOwnProperty("url")&&q.url.length>0&&(r=j.replace(/{{url}}/g,q.url)),q.hasOwnProperty("caption")&&q.caption.length>0?p+=m.replace(/{{caption}}/g,q.caption).replace(/{{captionIndex}}/g,c):r=r.replace(/{{caption}}/g,"")),o+=r}var s=i.replace("{{navbar}}",d.params.navbar?g:"").replace("{{noNavbar}}",d.params.navbar?"":"no-navbar").replace("{{photos}}",o).replace("{{captions}}",l.replace(/{{captions}}/g,p)).replace("{{toolbar}}",d.params.toolbar?h:"");d.activeIndex=d.params.initialSlide,d.openIndex=d.activeIndex,d.opened=!1,d.open=function(b){return"undefined"==typeof b&&(b=d.activeIndex),b=parseInt(b,10),d.opened&&d.swiper?void d.swiper.slideTo(b):(d.opened=!0,d.openIndex=b,"standalone"===d.params.type&&a(d.params.container).append(s),"popup"===d.params.type&&(d.popup=a.popup('<div class="popup photo-browser-popup">'+s+"</div>"),a(d.popup).on("closed",d.onPopupClose)),"page"===d.params.type?(a(document).on("pageBeforeInit",d.onPageBeforeInit),a(document).on("pageBeforeRemove",d.onPageBeforeRemove),d.params.view||(d.params.view=a.mainView),void d.params.view.loadContent(s)):(d.layout(d.openIndex),void(d.params.onOpen&&d.params.onOpen(d))))},d.close=function(){d.opened=!1,d.swiperContainer&&0!==d.swiperContainer.length&&(d.params.onClose&&d.params.onClose(d),d.attachEvents(!0),"standalone"===d.params.type&&d.container.removeClass("photo-browser-in").addClass("photo-browser-out").transitionEnd(function(){d.container.remove()}),d.swiper.destroy(),d.swiper=d.swiperContainer=d.swiperWrapper=d.slides=t=u=v=void 0)},d.onPopupClose=function(){d.close(),a(d.popup).off("pageBeforeInit",d.onPopupClose)},d.onPageBeforeInit=function(b){"photo-browser-slides"===b.detail.page.name&&d.layout(d.openIndex),a(document).off("pageBeforeInit",d.onPageBeforeInit)},d.onPageBeforeRemove=function(b){"photo-browser-slides"===b.detail.page.name&&d.close(),a(document).off("pageBeforeRemove",d.onPageBeforeRemove)},d.onSliderTransitionStart=function(b){d.activeIndex=b.activeIndex;var c=b.activeIndex+1,e=b.slides.length;if(d.params.loop&&(e-=2,c-=b.loopedSlides,1>c&&(c=e+c),c>e&&(c-=e)),d.container.find(".photo-browser-current").text(c),d.container.find(".photo-browser-total").text(e),a(".photo-browser-prev, .photo-browser-next").removeClass("photo-browser-link-inactive"),b.isBeginning&&!d.params.loop&&a(".photo-browser-prev").addClass("photo-browser-link-inactive"),b.isEnd&&!d.params.loop&&a(".photo-browser-next").addClass("photo-browser-link-inactive"),d.captions.length>0){d.captionsContainer.find(".photo-browser-caption-active").removeClass("photo-browser-caption-active");var f=d.params.loop?b.slides.eq(b.activeIndex).attr("data-swiper-slide-index"):d.activeIndex;d.captionsContainer.find('[data-caption-index="'+f+'"]').addClass("photo-browser-caption-active")}var g=b.slides.eq(b.previousIndex).find("video");g.length>0&&"pause"in g[0]&&g[0].pause(),d.params.onSlideChangeStart&&d.params.onSlideChangeStart(b)},d.onSliderTransitionEnd=function(a){d.params.zoom&&t&&a.previousIndex!==a.activeIndex&&(u.transform("translate3d(0,0,0) scale(1)"),v.transform("translate3d(0,0,0)"),t=u=v=void 0,w=x=1),d.params.onSlideChangeEnd&&d.params.onSlideChangeEnd(a)},d.layout=function(b){"page"===d.params.type?d.container=a(".photo-browser-swiper-container").parents(".view"):d.container=a(".photo-browser"),"standalone"===d.params.type&&d.container.addClass("photo-browser-in"),d.swiperContainer=d.container.find(".photo-browser-swiper-container"),d.swiperWrapper=d.container.find(".photo-browser-swiper-wrapper"),d.slides=d.container.find(".photo-browser-slide"),d.captionsContainer=d.container.find(".photo-browser-captions"),d.captions=d.container.find(".photo-browser-caption");var c={nextButton:d.params.nextButton||".photo-browser-next",prevButton:d.params.prevButton||".photo-browser-prev",indexButton:d.params.indexButton,initialSlide:b,spaceBetween:d.params.spaceBetween,speed:d.params.speed,loop:d.params.loop,lazyLoading:d.params.lazyLoading,lazyLoadingInPrevNext:d.params.lazyLoadingInPrevNext,lazyLoadingOnTransitionStart:d.params.lazyLoadingOnTransitionStart,preloadImages:d.params.lazyLoading?!1:!0,onTap:function(a,b){d.params.onTap&&d.params.onTap(a,b)},onClick:function(a,b){d.params.exposition&&d.toggleExposition(),d.params.onClick&&d.params.onClick(a,b)},onDoubleTap:function(b,c){d.toggleZoom(a(c.target).parents(".photo-browser-slide")),d.params.onDoubleTap&&d.params.onDoubleTap(b,c)},onTransitionStart:function(a){d.onSliderTransitionStart(a)},onTransitionEnd:function(a){d.onSliderTransitionEnd(a)},onLazyImageLoad:function(a,b,c){d.params.onLazyImageLoad&&d.params.onLazyImageLoad(d,b,c)},onLazyImageReady:function(b,c,e){a(c).removeClass("photo-browser-slide-lazy"),d.params.onLazyImageReady&&d.params.onLazyImageReady(d,c,e)}};d.params.swipeToClose&&"page"!==d.params.type&&(c.onTouchStart=d.swipeCloseTouchStart,c.onTouchMoveOpposite=d.swipeCloseTouchMove,c.onTouchEnd=d.swipeCloseTouchEnd),d.swiper=a.swiper(d.swiperContainer,c),0===b&&d.onSliderTransitionStart(d.swiper),d.attachEvents()},d.attachEvents=function(a){var b=a?"off":"on";if(d.params.zoom){var c=d.params.loop?d.swiper.slides:d.slides;c[b]("gesturestart",d.onSlideGestureStart),c[b]("gesturechange",d.onSlideGestureChange),c[b]("gestureend",d.onSlideGestureEnd),c[b]("touchstart",d.onSlideTouchStart),c[b]("touchmove",d.onSlideTouchMove),c[b]("touchend",d.onSlideTouchEnd)}d.container.find(".photo-browser-close-link")[b]("click",d.close)},d.exposed=!1,d.toggleExposition=function(){d.container&&d.container.toggleClass("photo-browser-exposed"),d.params.expositionHideCaptions&&d.captionsContainer.toggleClass("photo-browser-captions-exposed"),d.exposed=!d.exposed},d.enableExposition=function(){d.container&&d.container.addClass("photo-browser-exposed"),d.params.expositionHideCaptions&&d.captionsContainer.addClass("photo-browser-captions-exposed"),d.exposed=!0},d.disableExposition=function(){d.container&&d.container.removeClass("photo-browser-exposed"),d.params.expositionHideCaptions&&d.captionsContainer.removeClass("photo-browser-captions-exposed"),d.exposed=!1};var t,u,v,w=1,x=1,y=!1;d.onSlideGestureStart=function(){return t||(t=a(this),u=t.find("img, svg, canvas"),v=u.parent(".photo-browser-zoom-container"),0!==v.length)?(u.transition(0),void(y=!0)):void(u=void 0)},d.onSlideGestureChange=function(a){u&&0!==u.length&&(w=a.scale*x,w>d.params.maxZoom&&(w=d.params.maxZoom-1+Math.pow(w-d.params.maxZoom+1,.5)),w<d.params.minZoom&&(w=d.params.minZoom+1-Math.pow(d.params.minZoom-w+1,.5)),u.transform("translate3d(0,0,0) scale("+w+")"))},d.onSlideGestureEnd=function(){u&&0!==u.length&&(w=Math.max(Math.min(w,d.params.maxZoom),d.params.minZoom),u.transition(d.params.speed).transform("translate3d(0,0,0) scale("+w+")"),x=w,y=!1,1===w&&(t=void 0))},d.toggleZoom=function(){t||(t=d.swiper.slides.eq(d.swiper.activeIndex),u=t.find("img, svg, canvas"),v=u.parent(".photo-browser-zoom-container")),u&&0!==u.length&&(v.transition(300).transform("translate3d(0,0,0)"),w&&1!==w?(w=x=1,u.transition(300).transform("translate3d(0,0,0) scale(1)"),t=void 0):(w=x=d.params.maxZoom,u.transition(300).transform("translate3d(0,0,0) scale("+w+")")))};var z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q={},R={};d.onSlideTouchStart=function(b){u&&0!==u.length&&(z||("android"===a.device.os&&b.preventDefault(),z=!0,Q.x="touchstart"===b.type?b.targetTouches[0].pageX:b.pageX,Q.y="touchstart"===b.type?b.targetTouches[0].pageY:b.pageY))},d.onSlideTouchMove=function(b){if(u&&0!==u.length&&(d.swiper.allowClick=!1,z&&t)){A||(H=u[0].offsetWidth,I=u[0].offsetHeight,J=a.getTranslate(v[0],"x")||0,K=a.getTranslate(v[0],"y")||0,v.transition(0));var c=H*w,e=I*w;if(!(c<d.swiper.width&&e<d.swiper.height)){if(D=Math.min(d.swiper.width/2-c/2,0),F=-D,E=Math.min(d.swiper.height/2-e/2,0),G=-E,R.x="touchmove"===b.type?b.targetTouches[0].pageX:b.pageX,R.y="touchmove"===b.type?b.targetTouches[0].pageY:b.pageY,!A&&!y&&(Math.floor(D)===Math.floor(J)&&R.x<Q.x||Math.floor(F)===Math.floor(J)&&R.x>Q.x))return void(z=!1);b.preventDefault(),b.stopPropagation(),A=!0,B=R.x-Q.x+J,C=R.y-Q.y+K,D>B&&(B=D+1-Math.pow(D-B+1,.8)),B>F&&(B=F-1+Math.pow(B-F+1,.8)),E>C&&(C=E+1-Math.pow(E-C+1,.8)),C>G&&(C=G-1+Math.pow(C-G+1,.8)),L||(L=R.x),O||(O=R.y),M||(M=Date.now()),N=(R.x-L)/(Date.now()-M)/2,P=(R.y-O)/(Date.now()-M)/2,Math.abs(R.x-L)<2&&(N=0),Math.abs(R.y-O)<2&&(P=0),L=R.x,O=R.y,M=Date.now(),v.transform("translate3d("+B+"px, "+C+"px,0)")}}},d.onSlideTouchEnd=function(){if(u&&0!==u.length){if(!z||!A)return z=!1,void(A=!1);z=!1,A=!1;var a=300,b=300,c=N*a,e=B+c,f=P*b,g=C+f;0!==N&&(a=Math.abs((e-B)/N)),0!==P&&(b=Math.abs((g-C)/P));var h=Math.max(a,b);B=e,C=g;var i=H*w,j=I*w;D=Math.min(d.swiper.width/2-i/2,0),F=-D,E=Math.min(d.swiper.height/2-j/2,0),G=-E,B=Math.max(Math.min(B,F),D),C=Math.max(Math.min(C,G),E),v.transition(h).transform("translate3d("+B+"px, "+C+"px,0)")}};var S,T,U,V,W,X=!1,Y=!0,Z=!1;return d.swipeCloseTouchStart=function(){Y&&(X=!0)},d.swipeCloseTouchMove=function(a,b){if(X){Z||(Z=!0,T="touchmove"===b.type?b.targetTouches[0].pageY:b.pageY,V=d.swiper.slides.eq(d.swiper.activeIndex),W=(new Date).getTime()),b.preventDefault(),U="touchmove"===b.type?b.targetTouches[0].pageY:b.pageY,S=T-U;var c=1-Math.abs(S)/300;V.transform("translate3d(0,"+-S+"px,0)"),d.swiper.container.css("opacity",c).transition(0)}},d.swipeCloseTouchEnd=function(){if(X=!1,!Z)return void(Z=!1);Z=!1,Y=!1;var b=Math.abs(S),c=(new Date).getTime()-W;return 300>c&&b>20||c>=300&&b>100?void setTimeout(function(){"standalone"===d.params.type&&d.close(),"popup"===d.params.type&&a.closeModal(d.popup),d.params.onSwipeToClose&&d.params.onSwipeToClose(d),Y=!0},0):(0!==b?V.addClass("transitioning").transitionEnd(function(){Y=!0,V.removeClass("transitioning")}):Y=!0,d.swiper.container.css("opacity","").transition(""),void V.transform(""))},d};b.prototype={defaults:{photos:[],container:"body",initialSlide:0,spaceBetween:20,speed:300,zoom:!0,maxZoom:3,minZoom:1,exposition:!0,expositionHideCaptions:!1,type:"standalone",navbar:!0,toolbar:!0,theme:"light",swipeToClose:!0,backLinkText:"Close",ofText:"of",loop:!1,lazyLoading:!1,lazyLoadingInPrevNext:!1,lazyLoadingOnTransitionStart:!1}},a.photoBrowser=function(c){return a.extend(c,a.photoBrowser.prototype.defaults),new b(c)},a.photoBrowser.prototype={defaults:{}}}(Zepto);(function defineMustache(global,factory){if(typeof exports==="object"&&exports&&typeof exports.nodeName!=="string"){factory(exports)}else if(typeof define==="function"&&define.amd){define(["exports"],factory)}else{global.Mustache={};factory(global.Mustache)}})(this,function mustacheFactory(mustache){var objectToString=Object.prototype.toString;var isArray=Array.isArray||function isArrayPolyfill(object){return objectToString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function typeStr(obj){return isArray(obj)?"array":typeof obj}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(obj,propName){return obj!=null&&typeof obj==="object"&&propName in obj}var regExpTest=RegExp.prototype.test;function testRegExp(re,string){return regExpTest.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(string){return String(string).replace(/[&<>"'`=\/]/g,function fromEntityMap(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tagsToCompile){if(typeof tagsToCompile==="string")tagsToCompile=tagsToCompile.split(spaceRe,2);if(!isArray(tagsToCompile)||tagsToCompile.length!==2)throw new Error("Invalid tags: "+tagsToCompile);openingTagRe=new RegExp(escapeRegExp(tagsToCompile[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tagsToCompile[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tagsToCompile[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length)}else{nonSpace=true}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n")stripSpace()}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);token=[type,value,start,scanner.pos];tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function scanUntil(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function push(view){return new Context(view,this)};Context.prototype.lookup=function lookup(name){var cache=this.cache;var value;if(cache.hasOwnProperty(name)){value=cache[name]}else{var context=this,names,index,lookupHit=false;while(context){if(name.indexOf(".")>0){value=context.view;names=name.split(".");index=0;while(value!=null&&index<names.length){if(index===names.length-1)lookupHit=hasProperty(value,names[index]);value=value[names[index++]]}}else{value=context.view[name];lookupHit=hasProperty(context.view,name)}if(lookupHit)break;context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.cache={}}Writer.prototype.clearCache=function clearCache(){this.cache={}};Writer.prototype.parse=function parse(template,tags){var cache=this.cache;var tokens=cache[template];if(tokens==null)tokens=cache[template]=parseTemplate(template,tags);return tokens};Writer.prototype.render=function render(template,view,partials){var tokens=this.parse(template);var context=view instanceof Context?view:new Context(view);return this.renderTokens(tokens,context,partials,template)};Writer.prototype.renderTokens=function renderTokens(tokens,context,partials,originalTemplate){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this.renderSection(token,context,partials,originalTemplate);else if(symbol==="^")value=this.renderInverted(token,context,partials,originalTemplate);else if(symbol===">")value=this.renderPartial(token,context,partials,originalTemplate);else if(symbol==="&")value=this.unescapedValue(token,context);else if(symbol==="name")value=this.escapedValue(token,context);else if(symbol==="text")value=this.rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype.renderSection=function renderSection(token,context,partials,originalTemplate){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate)}}else if(typeof value==="object"||typeof value==="string"||typeof value==="number"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate)}return buffer};Writer.prototype.renderInverted=function renderInverted(token,context,partials,originalTemplate){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate)};Writer.prototype.renderPartial=function renderPartial(token,context,partials){if(!partials)return;var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null)return this.renderTokens(this.parse(value),context,partials,value)};Writer.prototype.unescapedValue=function unescapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype.escapedValue=function escapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return mustache.escape(value)};Writer.prototype.rawValue=function rawValue(token){return token[1]};mustache.name="mustache.js";mustache.version="2.3.0";mustache.tags=["{{","}}"];var defaultWriter=new Writer;mustache.clearCache=function clearCache(){return defaultWriter.clearCache()};mustache.parse=function parse(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function render(template,view,partials){if(typeof template!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(template)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return defaultWriter.render(template,view,partials)};mustache.to_html=function to_html(template,view,partials,send){var result=mustache.render(template,view,partials);if(isFunction(send)){send(result)}else{return result}};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer;return mustache});
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
;(function (global, factory) {
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
};;//$(function () {
summerready = function(){
    'use strict';
    var currentPage = 1;
    var totalPage = 1;
    var infoType = getQueryString("infoType");
    var carType = getQueryString("carType");
    var companyType = getQueryString("companyType");
    var goodsType = getQueryString("goodsType");
    var beginCityId = getQueryString("beginCityId");
    var beginProvinceId = getQueryString("beginProvinceId");
    var beginCountyId = getQueryString("beginCountyId");
    var endProvinceId = getQueryString("endProvinceId");
    var endCountyId = getQueryString("endCountyId");
    var endCityId = getQueryString("endCityId");
    var lng = getCookie("lng");
    var lat = getCookie("lat");
    var $infinite_scroll_preloader = $(".infinite-scroll-preloader");
    //多个标签页下的无限滚动
    $(document).on("pageInit", "#pageFind", function (e, id, page) {
        var loading = false;
        var time = 0;
        $(page).on('infinite', function () {
            // 如果正在加载，则退出
            if (loading) return;
            // 设置flag
            loading = true;
            var hasNext = true;
            if (currentPage > totalPage) {
                hasNext = false;
            }
            // 模拟1s的加载过程
            setTimeout(function () {
                // 重置加载flag
                loading = false;
                if (!hasNext) {
                    // 加载完毕，则注销无限加载事件，以防不必要的加载
                    $.detachInfiniteScroll($('.infinite-scroll'));
                    // 删除加载提示符
                    $('.infinite-scroll-preloader').html("<span style='font-size: .6rem;color: #dbdbdb;'>到底了(⊙o⊙)</span>");
                    return;
                }
                getListData();
                // 更新最后加载的序号
                $.refreshScroller();
            }, 1000);
            time++;
        });
    });
    function getListData() {
        var data = {
            pageNum: currentPage,
            pageSize: 20,
            infoType: infoType,
            lat: lat||"39.90469",
            lng: lng||"116.40717"
        }
        if (infoType == 2) {
            var index = 1;
        } else {
            var index = 1;
        }
        if (carType) {
            data.carType = carType;
        }
        if (companyType) {
            data.companyType = companyType;
        }
        if (goodsType) {
            data.goodsType = goodsType;
        }
        if (beginCityId) {
            data.beginCityId = beginCityId;
        }
        if (beginProvinceId) {
            data.beginProvinceId = beginProvinceId;
        }
        if (beginCountyId) {
            data.beginCountyId = beginCountyId;
        }
        if (endProvinceId) {
            data.endProvinceId = endProvinceId;
        }
        if (endCityId) {
            data.endCityId = endCityId;
        }
        if (endCountyId) {
            data.endCountyId = endCountyId;
        }
        var currentTab = $(".find-list");
        ajaxRequests("/venderInformationRelease/informationReleaseList","post",{
            body:data
        },function (response) {
            if (response.retCode === '0') {
                if (response.data.total && response.data.total > 0) {
                    var datas = response.data.list;
                    for (var i = 0;  i < datas.length; i++) {
                        var siteInfo = getType(Number(datas[i].companyType));
                        datas[i].companyTypeInfo = siteInfo.title;
                        datas[i].goodsType = filterInfoGoodsTypes(datas[i].goodsType);
                        datas[i].carType = filterInfoCarTypes(datas[i].carType);
                    }
                    console.log(index);
                    addItem("#infoList" + index, response.data, "#findList");
                    if (currentPage == 1 && response.data.total < 20) {
                        $infinite_scroll_preloader.css("display", "none");
                    }
                    totalPage = Math.ceil(response.data.total / 20);
                    currentPage++;
                }else {
                    if (currentPage == 1) {
                        setListNone(currentTab);
                    } else {
                        setListPageNone(currentTab);
                    }
                }
            } else {
                $.toast(response.retMsg || '操作失败', 2000, 'custom-toast');
            }
        })
    }
    getListData();
    $.init();
    }
//});
