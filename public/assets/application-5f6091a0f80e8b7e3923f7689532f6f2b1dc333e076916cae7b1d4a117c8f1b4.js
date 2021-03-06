/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.1.0
Copyright © 2018 Basecamp, LLC
 */

(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,e){return Turbolinks.controller.visit(t,e)},clearCache:function(){return Turbolinks.controller.clearCache()},setProgressBarDelay:function(t){return Turbolinks.controller.setProgressBarDelay(t)}}}).call(this),function(){var t,e,r,n=[].slice;Turbolinks.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},Turbolinks.closest=function(e,r){return t.call(e,r)},t=function(){var t,r;return t=document.documentElement,null!=(r=t.closest)?r:function(t){var r;for(r=this;r;){if(r.nodeType===Node.ELEMENT_NODE&&e.call(r,t))return r;r=r.parentNode}}}(),Turbolinks.defer=function(t){return setTimeout(t,1)},Turbolinks.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},Turbolinks.dispatch=function(t,e){var n,o,i,s,a,u;return a=null!=e?e:{},u=a.target,n=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,n===!0),i.data=null!=o?o:{},i.cancelable&&!r&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},r=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),Turbolinks.match=function(t,r){return e.call(t,r)},e=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),Turbolinks.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}.call(this),function(){Turbolinks.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.HttpRequest=function(){function e(e,r,n){this.delegate=e,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=Turbolinks.Location.wrap(r).requestURL,this.referrer=Turbolinks.Location.wrap(n).absoluteURL,this.createXHR()}return e.NETWORK_FAILURE=0,e.TIMEOUT_FAILURE=-1,e.timeout=60,e.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},e.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},e.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},e.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},e.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},e.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},e.prototype.requestCanceled=function(){return this.endRequest()},e.prototype.notifyApplicationBeforeRequestStart=function(){return Turbolinks.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},e.prototype.notifyApplicationAfterRequestEnd=function(){return Turbolinks.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},e.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},e.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},e.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},e.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.BrowserAdapter=function(){function e(e){this.controller=e,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new Turbolinks.ProgressBar}var r,n,o;return o=Turbolinks.HttpRequest,r=o.NETWORK_FAILURE,n=o.TIMEOUT_FAILURE,e.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},e.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},e.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},e.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},e.prototype.visitRequestCompleted=function(t){return t.loadResponse()},e.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case r:case n:return this.reload();default:return t.loadResponse()}},e.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},e.prototype.visitCompleted=function(t){return t.followRedirect()},e.prototype.pageInvalidated=function(){return this.reload()},e.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},e.prototype.showProgressBar=function(){return this.progressBar.show()},e.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},e.prototype.reload=function(){return window.location.reload()},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.History=function(){function e(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},e.prototype.push=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("push",t,e)},e.prototype.replace=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("replace",t,e)},e.prototype.onPopState=function(t){var e,r,n,o;return this.shouldHandlePopState()&&(o=null!=(r=t.state)?r.turbolinks:void 0)?(e=Turbolinks.Location.wrap(window.location),n=o.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(e,n)):void 0},e.prototype.onPageLoad=function(t){return Turbolinks.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},e.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},e.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},e.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},e}()}.call(this),function(){Turbolinks.Snapshot=function(){function t(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return t.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},t.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},t.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},t.prototype.clone=function(){return new t({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},t.prototype.getRootLocation=function(){var t,e;return e=null!=(t=this.getSetting("root"))?t:"/",new Turbolinks.Location(e)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.body.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},t}()}.call(this),function(){var t=[].slice;Turbolinks.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){Turbolinks.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.SnapshotRenderer=function(e){function r(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=new Turbolinks.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new Turbolinks.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return t(r,e),r.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},r.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},r.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},r.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},r.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},r.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},r.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},r.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.assignNewBody=function(){return document.body=this.newBody},r.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},r.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},r.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},r.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},r.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},r.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},r.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},r.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},r.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},r}(Turbolinks.Renderer)}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.ErrorRenderer=function(e){function r(t){this.html=t}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(Turbolinks.Renderer)}.call(this),function(){Turbolinks.View=function(){function t(t){this.delegate=t,this.element=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return Turbolinks.Snapshot.fromElement(this.element)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,e,r){return Turbolinks.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),Turbolinks.Snapshot.wrap(t),e)},t.prototype.renderError=function(t,e){return Turbolinks.ErrorRenderer.render(this.delegate,e,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ScrollManager=function(){function e(e){this.delegate=e,this.onScroll=t(this.onScroll,this),this.onScroll=Turbolinks.throttle(this.onScroll)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},e.prototype.scrollToElement=function(t){return t.scrollIntoView()},e.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},e.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},e.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},e}()}.call(this),function(){Turbolinks.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var e;return t.prototype.has=function(t){var r;return r=e(t),r in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var r;return r=e(t),this.snapshots[r]},t.prototype.write=function(t,r){var n;return n=e(t),this.snapshots[n]=r},t.prototype.touch=function(t){var r,n;return n=e(t),r=this.keys.indexOf(n),r>-1&&this.keys.splice(r,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},e=function(t){return Turbolinks.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Visit=function(){function e(e,r,n){this.controller=e,this.action=n,this.performScroll=t(this.performScroll,this),this.identifier=Turbolinks.uuid(),this.location=Turbolinks.Location.wrap(r),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var r;return e.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},e.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},e.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},e.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},e.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=r(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},e.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new Turbolinks.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},e.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},e.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},e.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},e.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},e.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},e.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},e.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},e.prototype.requestCompletedWithResponse=function(t,e){return this.response=t,null!=e&&(this.redirectedToLocation=Turbolinks.Location.wrap(e)),this.adapter.visitRequestCompleted(this)},e.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},e.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},e.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},e.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},e.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},e.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},e.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},e.prototype.getTimingMetrics=function(){return Turbolinks.copyObject(this.timingMetrics)},r=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},e.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},e.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},e.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},e.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Controller=function(){function e(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new Turbolinks.History(this),this.view=new Turbolinks.View(this),this.scrollManager=new Turbolinks.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return e.prototype.start=function(){return Turbolinks.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},e.prototype.disable=function(){return this.enabled=!1},e.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},e.prototype.clearCache=function(){return this.cache=new Turbolinks.SnapshotCache(10)},e.prototype.visit=function(t,e){var r,n;return null==e&&(e={}),t=Turbolinks.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(r=null!=(n=e.action)?n:"advance",this.adapter.visitProposedToLocationWithAction(t,r)):window.location=t:void 0},e.prototype.startVisitToLocationWithAction=function(t,e,r){var n;return Turbolinks.supported?(n=this.getRestorationDataForIdentifier(r),this.startVisit(t,e,{restorationData:n})):window.location=t},e.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},e.prototype.startHistory=function(){return this.location=Turbolinks.Location.wrap(window.location),this.restorationIdentifier=Turbolinks.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.stopHistory=function(){return this.history.stop()},e.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},e.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,e){var r;return this.restorationIdentifier=e,this.enabled?(r=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:r,historyChanged:!0}),this.location=Turbolinks.Location.wrap(t)):this.adapter.pageInvalidated()},e.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},e.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},e.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},e.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},e.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},e.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},e.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},e.prototype.render=function(t,e){return this.view.render(t,e)},e.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},e.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},e.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},e.prototype.pageLoaded=function(){
return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},e.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},e.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},e.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},e.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},e.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,e){return Turbolinks.dispatch("turbolinks:click",{target:t,data:{url:e.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationBeforeVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationAfterVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},e.prototype.notifyApplicationBeforeCachingSnapshot=function(){return Turbolinks.dispatch("turbolinks:before-cache")},e.prototype.notifyApplicationBeforeRender=function(t){return Turbolinks.dispatch("turbolinks:before-render",{data:{newBody:t}})},e.prototype.notifyApplicationAfterRender=function(){return Turbolinks.dispatch("turbolinks:render")},e.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),Turbolinks.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},e.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},e.prototype.createVisit=function(t,e,r){var n,o,i,s,a;return o=null!=r?r:{},s=o.restorationIdentifier,i=o.restorationData,n=o.historyChanged,a=new Turbolinks.Visit(this,t,e),a.restorationIdentifier=null!=s?s:Turbolinks.uuid(),a.restorationData=Turbolinks.copyObject(i),a.historyChanged=n,a.referrer=this.location,a},e.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},e.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},e.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?Turbolinks.closest(t,"a[href]:not([target]):not([download])"):void 0},e.prototype.getVisitableLocationForLink=function(t){var e;return e=new Turbolinks.Location(t.getAttribute("href")),this.locationIsVisitable(e)?e:void 0},e.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},e.prototype.nodeIsVisitable=function(t){var e;return(e=Turbolinks.closest(t,"[data-turbolinks]"))?"false"!==e.getAttribute("data-turbolinks"):!0},e.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},e.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},e.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},e}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,e,r;Turbolinks.start=function(){return e()?(null==Turbolinks.controller&&(Turbolinks.controller=t()),Turbolinks.controller.start()):void 0},e=function(){return null==window.Turbolinks&&(window.Turbolinks=Turbolinks),r()},t=function(){var t;return t=new Turbolinks.Controller,t.adapter=new Turbolinks.BrowserAdapter(t),t},r=function(){return window.Turbolinks===Turbolinks},r()&&Turbolinks.start()}.call(this);
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
//! moment.js
//! version : 2.13.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    var hookCallback;

    function utils_hooks__hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function create_utc__createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function valid__isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            m._isValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                m._isValid = m._isValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }
        }
        return m._isValid;
    }

    function valid__createInvalid (flags) {
        var m = create_utc__createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    function isUndefined(input) {
        return input === void 0;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = utils_hooks__hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            utils_hooks__hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (utils_hooks__hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (utils_hooks__hooks.deprecationHandler != null) {
                utils_hooks__hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(arguments).join(', ') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (utils_hooks__hooks.deprecationHandler != null) {
            utils_hooks__hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    utils_hooks__hooks.suppressDeprecationWarnings = false;
    utils_hooks__hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function isObject(input) {
        return Object.prototype.toString.call(input) === '[object Object]';
    }

    function locale_set__set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _ordinalParseLenient.
        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    // internal storage for locale config files
    var locales = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we
                // want to undo that for lazy loaded locales
                locale_locales__getSetGlobalLocale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function locale_locales__getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = locale_locales__getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale');
                config = mergeConfigs(locales[name]._config, config);
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    config = mergeConfigs(locales[config.parentLocale]._config, config);
                } else {
                    // treat as if there is no base config
                    deprecateSimple('parentLocaleUndefined',
                            'specified parentLocale is not defined yet');
                }
            }
            locales[name] = new Locale(config);

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale;
            if (locales[name] != null) {
                config = mergeConfigs(locales[name]._config, config);
            }
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            locale_locales__getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function locale_locales__getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function locale_locales__listLocales() {
        return keys(locales);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                get_set__set(this, unit, value);
                utils_hooks__hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get_set__get(this, unit);
            }
        };
    }

    function get_set__get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function get_set__set (mom, unit, value) {
        if (mom.isValid()) {
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    // MOMENTS

    function getSet (units, value) {
        var unit;
        if (typeof units === 'object') {
            for (unit in units) {
                this.set(unit, units[unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;


    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (typeof callback === 'number') {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        return isArray(this._months) ? this._months[m.month()] :
            this._months[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function units_month__handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = create_utc__createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return units_month__handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (typeof value !== 'number') {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            utils_hooks__hooks.updateOffset(this, true);
            return this;
        } else {
            return get_set__get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    utils_hooks__hooks.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    function createDate (y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
            date.setFullYear(y);
        }
        return date;
    }

    function createUTCDate (y) {
        var date = new Date(Date.UTC.apply(null, arguments));

        //the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? utils_hooks__hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    utils_hooks__hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(utils_hooks__hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
            week = defaults(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    utils_hooks__hooks.ISO_8601 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === utils_hooks__hooks.ISO_8601) {
            configFromISO(config);
            return;
        }

        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (getParsingFlags(config).bigHour === true &&
                config._a[HOUR] <= 12 &&
                config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!valid__isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || locale_locales__getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return valid__createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else if (isDate(input)) {
            config._d = input;
        } else {
            configFromInput(config);
        }

        if (!valid__isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (input === undefined) {
            config._d = new Date(utils_hooks__hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (typeof(input) === 'object') {
            configFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            utils_hooks__hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function local__createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
         'moment().min is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
         function () {
             var other = local__createLocal.apply(null, arguments);
             if (this.isValid() && other.isValid()) {
                 return other < this ? this : other;
             } else {
                 return valid__createInvalid();
             }
         }
     );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
        function () {
            var other = local__createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return valid__createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return local__createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = locale_locales__getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = ((string || '').match(matcher) || []);
        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : local__createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            utils_hooks__hooks.updateOffset(res, false);
            return res;
        } else {
            return local__createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    utils_hooks__hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
            } else if (Math.abs(input) < 16) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    utils_hooks__hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm) {
            this.utcOffset(this._tzm);
        } else if (typeof this._i === 'string') {
            this.utcOffset(offsetFromString(matchOffset, this._i));
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? local__createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? create_utc__createUTC(c._a) : local__createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?\d*)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;

    function create__createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])        * sign,
                h  : toInt(match[HOUR])        * sign,
                m  : toInt(match[MINUTE])      * sign,
                s  : toInt(match[SECOND])      * sign,
                ms : toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    create__createDuration.fn = Duration.prototype;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = create__createDuration(val, period);
            add_subtract__addSubtract(this, dur, direction);
            return this;
        };
    }

    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (days) {
            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
        }
        if (months) {
            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            utils_hooks__hooks.updateOffset(mom, days || months);
        }
    }

    var add_subtract__add      = createAdder(1, 'add');
    var add_subtract__subtract = createAdder(-1, 'subtract');

    function moment_calendar__calendar (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || local__createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            diff = this.diff(sod, 'days', true),
            format = diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format]() : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, local__createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : local__createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units || 'millisecond');
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input,units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input,units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            delta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        if (units === 'year' || units === 'month' || units === 'quarter') {
            output = monthDiff(this, that);
            if (units === 'quarter') {
                output = output / 3;
            } else if (units === 'year') {
                output = output / 12;
            }
        } else {
            delta = this - that;
            output = units === 'second' ? delta / 1e3 : // 1000
                units === 'minute' ? delta / 6e4 : // 1000 * 60
                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                delta;
        }
        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    utils_hooks__hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function moment_format__toISOString () {
        var m = this.clone().utc();
        if (0 < m.year() && m.year() <= 9999) {
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                return this.toDate().toISOString();
            } else {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        } else {
            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
        }
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? utils_hooks__hooks.defaultFormatUtc : utils_hooks__hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(local__createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 local__createLocal(time).isValid())) {
            return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(local__createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = locale_locales__getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    function startOf (units) {
        units = normalizeUnits(units);
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (units) {
        case 'year':
            this.month(0);
            /* falls through */
        case 'quarter':
        case 'month':
            this.date(1);
            /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
        case 'date':
            this.hours(0);
            /* falls through */
        case 'hour':
            this.minutes(0);
            /* falls through */
        case 'minute':
            this.seconds(0);
            /* falls through */
        case 'second':
            this.milliseconds(0);
        }

        // weeks are a special case
        if (units === 'week') {
            this.weekday(0);
        }
        if (units === 'isoWeek') {
            this.isoWeekday(1);
        }

        // quarters are also special
        if (units === 'quarter') {
            this.month(Math.floor(this.month() / 3) * 3);
        }

        return this;
    }

    function endOf (units) {
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond') {
            return this;
        }

        // 'date' is an alias for 'day', so it should be considered as such.
        if (units === 'date') {
            units = 'day';
        }

        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }

    function to_type__valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return this._offset ? new Date(this.valueOf()) : this._d;
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function moment_valid__isValid () {
        return valid__isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 1st is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    // LOCALES

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        return isArray(this._weekdays) ? this._weekdays[m.day()] :
            this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return this._weekdaysShort[m.day()];
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return this._weekdaysMin[m.day()];
    }

    function day_of_week__handleStrictParse(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = create_utc__createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return day_of_week__handleStrictParse.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = create_utc__createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = create_utc__createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var momentPrototype__proto = Moment.prototype;

    momentPrototype__proto.add               = add_subtract__add;
    momentPrototype__proto.calendar          = moment_calendar__calendar;
    momentPrototype__proto.clone             = clone;
    momentPrototype__proto.diff              = diff;
    momentPrototype__proto.endOf             = endOf;
    momentPrototype__proto.format            = format;
    momentPrototype__proto.from              = from;
    momentPrototype__proto.fromNow           = fromNow;
    momentPrototype__proto.to                = to;
    momentPrototype__proto.toNow             = toNow;
    momentPrototype__proto.get               = getSet;
    momentPrototype__proto.invalidAt         = invalidAt;
    momentPrototype__proto.isAfter           = isAfter;
    momentPrototype__proto.isBefore          = isBefore;
    momentPrototype__proto.isBetween         = isBetween;
    momentPrototype__proto.isSame            = isSame;
    momentPrototype__proto.isSameOrAfter     = isSameOrAfter;
    momentPrototype__proto.isSameOrBefore    = isSameOrBefore;
    momentPrototype__proto.isValid           = moment_valid__isValid;
    momentPrototype__proto.lang              = lang;
    momentPrototype__proto.locale            = locale;
    momentPrototype__proto.localeData        = localeData;
    momentPrototype__proto.max               = prototypeMax;
    momentPrototype__proto.min               = prototypeMin;
    momentPrototype__proto.parsingFlags      = parsingFlags;
    momentPrototype__proto.set               = getSet;
    momentPrototype__proto.startOf           = startOf;
    momentPrototype__proto.subtract          = add_subtract__subtract;
    momentPrototype__proto.toArray           = toArray;
    momentPrototype__proto.toObject          = toObject;
    momentPrototype__proto.toDate            = toDate;
    momentPrototype__proto.toISOString       = moment_format__toISOString;
    momentPrototype__proto.toJSON            = toJSON;
    momentPrototype__proto.toString          = toString;
    momentPrototype__proto.unix              = unix;
    momentPrototype__proto.valueOf           = to_type__valueOf;
    momentPrototype__proto.creationData      = creationData;

    // Year
    momentPrototype__proto.year       = getSetYear;
    momentPrototype__proto.isLeapYear = getIsLeapYear;

    // Week Year
    momentPrototype__proto.weekYear    = getSetWeekYear;
    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;

    // Quarter
    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;

    // Month
    momentPrototype__proto.month       = getSetMonth;
    momentPrototype__proto.daysInMonth = getDaysInMonth;

    // Week
    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
    momentPrototype__proto.weeksInYear    = getWeeksInYear;
    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;

    // Day
    momentPrototype__proto.date       = getSetDayOfMonth;
    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
    momentPrototype__proto.dayOfYear  = getSetDayOfYear;

    // Hour
    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;

    // Minute
    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;

    // Second
    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;

    // Millisecond
    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;

    // Offset
    momentPrototype__proto.utcOffset            = getSetOffset;
    momentPrototype__proto.utc                  = setOffsetToUTC;
    momentPrototype__proto.local                = setOffsetToLocal;
    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
    momentPrototype__proto.isDST                = isDaylightSavingTime;
    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
    momentPrototype__proto.isLocal              = isLocal;
    momentPrototype__proto.isUtcOffset          = isUtcOffset;
    momentPrototype__proto.isUtc                = isUtc;
    momentPrototype__proto.isUTC                = isUtc;

    // Timezone
    momentPrototype__proto.zoneAbbr = getZoneAbbr;
    momentPrototype__proto.zoneName = getZoneName;

    // Deprecations
    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);

    var momentPrototype = momentPrototype__proto;

    function moment__createUnix (input) {
        return local__createLocal(input * 1000);
    }

    function moment__createInZone () {
        return local__createLocal.apply(null, arguments).parseZone();
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function locale_calendar__calendar (key, mom, now) {
        var output = this._calendar[key];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    function preParsePostFormat (string) {
        return string;
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var prototype__proto = Locale.prototype;

    prototype__proto._calendar       = defaultCalendar;
    prototype__proto.calendar        = locale_calendar__calendar;
    prototype__proto._longDateFormat = defaultLongDateFormat;
    prototype__proto.longDateFormat  = longDateFormat;
    prototype__proto._invalidDate    = defaultInvalidDate;
    prototype__proto.invalidDate     = invalidDate;
    prototype__proto._ordinal        = defaultOrdinal;
    prototype__proto.ordinal         = ordinal;
    prototype__proto._ordinalParse   = defaultOrdinalParse;
    prototype__proto.preparse        = preParsePostFormat;
    prototype__proto.postformat      = preParsePostFormat;
    prototype__proto._relativeTime   = defaultRelativeTime;
    prototype__proto.relativeTime    = relative__relativeTime;
    prototype__proto.pastFuture      = pastFuture;
    prototype__proto.set             = locale_set__set;

    // Month
    prototype__proto.months            =        localeMonths;
    prototype__proto._months           = defaultLocaleMonths;
    prototype__proto.monthsShort       =        localeMonthsShort;
    prototype__proto._monthsShort      = defaultLocaleMonthsShort;
    prototype__proto.monthsParse       =        localeMonthsParse;
    prototype__proto._monthsRegex      = defaultMonthsRegex;
    prototype__proto.monthsRegex       = monthsRegex;
    prototype__proto._monthsShortRegex = defaultMonthsShortRegex;
    prototype__proto.monthsShortRegex  = monthsShortRegex;

    // Week
    prototype__proto.week = localeWeek;
    prototype__proto._week = defaultLocaleWeek;
    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;

    // Day of Week
    prototype__proto.weekdays       =        localeWeekdays;
    prototype__proto._weekdays      = defaultLocaleWeekdays;
    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
    prototype__proto.weekdaysParse  =        localeWeekdaysParse;

    prototype__proto._weekdaysRegex      = defaultWeekdaysRegex;
    prototype__proto.weekdaysRegex       =        weekdaysRegex;
    prototype__proto._weekdaysShortRegex = defaultWeekdaysShortRegex;
    prototype__proto.weekdaysShortRegex  =        weekdaysShortRegex;
    prototype__proto._weekdaysMinRegex   = defaultWeekdaysMinRegex;
    prototype__proto.weekdaysMinRegex    =        weekdaysMinRegex;

    // Hours
    prototype__proto.isPM = localeIsPM;
    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
    prototype__proto.meridiem = localeMeridiem;

    function lists__get (format, index, field, setter) {
        var locale = locale_locales__getLocale();
        var utc = create_utc__createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (typeof format === 'number') {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return lists__get(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = lists__get(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = locale_locales__getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return lists__get(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = lists__get(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function lists__listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function lists__listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function lists__listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function lists__listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function lists__listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    locale_locales__getSetGlobalLocale('en', {
        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports
    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);

    var mathAbs = Math.abs;

    function duration_abs__abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function duration_add_subtract__addSubtract (duration, input, value, direction) {
        var other = create__createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function duration_add_subtract__add (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function duration_add_subtract__subtract (input, value) {
        return duration_add_subtract__addSubtract(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'year') {
            days   = this._days   + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            return units === 'month' ? months : months / 12;
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function duration_as__valueOf () {
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');

    function duration_get__get (units) {
        units = normalizeUnits(units);
        return this[units + 's']();
    }

    function makeGetter(name) {
        return function () {
            return this._data[name];
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        s: 45,  // seconds to minute
        m: 45,  // minutes to hour
        h: 22,  // hours to day
        d: 26,  // days to month
        M: 11   // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
        var duration = create__createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds < thresholds.s && ['s', seconds]  ||
                minutes <= 1           && ['m']           ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours   <= 1           && ['h']           ||
                hours   < thresholds.h && ['hh', hours]   ||
                days    <= 1           && ['d']           ||
                days    < thresholds.d && ['dd', days]    ||
                months  <= 1           && ['M']           ||
                months  < thresholds.M && ['MM', months]  ||
                years   <= 1           && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set a threshold for relative time strings
    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        return true;
    }

    function humanize (withSuffix) {
        var locale = this.localeData();
        var output = duration_humanize__relativeTime(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var iso_string__abs = Math.abs;

    function iso_string__toISOString() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var seconds = iso_string__abs(this._milliseconds) / 1000;
        var days         = iso_string__abs(this._days);
        var months       = iso_string__abs(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds;
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        return (total < 0 ? '-' : '') +
            'P' +
            (Y ? Y + 'Y' : '') +
            (M ? M + 'M' : '') +
            (D ? D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? h + 'H' : '') +
            (m ? m + 'M' : '') +
            (s ? s + 'S' : '');
    }

    var duration_prototype__proto = Duration.prototype;

    duration_prototype__proto.abs            = duration_abs__abs;
    duration_prototype__proto.add            = duration_add_subtract__add;
    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
    duration_prototype__proto.as             = as;
    duration_prototype__proto.asMilliseconds = asMilliseconds;
    duration_prototype__proto.asSeconds      = asSeconds;
    duration_prototype__proto.asMinutes      = asMinutes;
    duration_prototype__proto.asHours        = asHours;
    duration_prototype__proto.asDays         = asDays;
    duration_prototype__proto.asWeeks        = asWeeks;
    duration_prototype__proto.asMonths       = asMonths;
    duration_prototype__proto.asYears        = asYears;
    duration_prototype__proto.valueOf        = duration_as__valueOf;
    duration_prototype__proto._bubble        = bubble;
    duration_prototype__proto.get            = duration_get__get;
    duration_prototype__proto.milliseconds   = milliseconds;
    duration_prototype__proto.seconds        = seconds;
    duration_prototype__proto.minutes        = minutes;
    duration_prototype__proto.hours          = hours;
    duration_prototype__proto.days           = days;
    duration_prototype__proto.weeks          = weeks;
    duration_prototype__proto.months         = months;
    duration_prototype__proto.years          = years;
    duration_prototype__proto.humanize       = humanize;
    duration_prototype__proto.toISOString    = iso_string__toISOString;
    duration_prototype__proto.toString       = iso_string__toISOString;
    duration_prototype__proto.toJSON         = iso_string__toISOString;
    duration_prototype__proto.locale         = locale;
    duration_prototype__proto.localeData     = localeData;

    // Deprecations
    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
    duration_prototype__proto.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    utils_hooks__hooks.version = '2.13.0';

    setHookCallback(local__createLocal);

    utils_hooks__hooks.fn                    = momentPrototype;
    utils_hooks__hooks.min                   = min;
    utils_hooks__hooks.max                   = max;
    utils_hooks__hooks.now                   = now;
    utils_hooks__hooks.utc                   = create_utc__createUTC;
    utils_hooks__hooks.unix                  = moment__createUnix;
    utils_hooks__hooks.months                = lists__listMonths;
    utils_hooks__hooks.isDate                = isDate;
    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
    utils_hooks__hooks.invalid               = valid__createInvalid;
    utils_hooks__hooks.duration              = create__createDuration;
    utils_hooks__hooks.isMoment              = isMoment;
    utils_hooks__hooks.weekdays              = lists__listWeekdays;
    utils_hooks__hooks.parseZone             = moment__createInZone;
    utils_hooks__hooks.localeData            = locale_locales__getLocale;
    utils_hooks__hooks.isDuration            = isDuration;
    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
    utils_hooks__hooks.defineLocale          = defineLocale;
    utils_hooks__hooks.updateLocale          = updateLocale;
    utils_hooks__hooks.locales               = locale_locales__listLocales;
    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
    utils_hooks__hooks.prototype             = momentPrototype;

    var _moment = utils_hooks__hooks;

    return _moment;

}));
window.ReportsKit = {};

$(document).ready(function() {
  $('.reports_kit_report').each(function(index, el) {
    var el = $(el)
    var reportClass = el.data('report-class');
    new ReportsKit[reportClass]().render({ 'el': el });
  });
});
ReportsKit.Chart = (function(options) {
  var self = this;

  self.initialize = function(options) {
    self.options = options;
    self.report = options.report;
    self.el = self.report.el;

    self.defaultEmptyStateText = 'No data was found';
    self.emptyStateEl = $('<div>' + self.defaultEmptyStateText + '</div>').appendTo(self.report.visualizationEl).hide();
    self.loadingIndicatorEl = $('<div class="loading_indicator"></div>').appendTo(self.report.visualizationEl).hide();
    self.canvas = $('<canvas />').appendTo(self.report.visualizationEl);
  };

  self.render = function() {
    var path = self.el.data('path');
    var separator = path.indexOf('?') === -1 ? '?' : '&';
    path += separator + 'properties=' + encodeURIComponent(JSON.stringify(self.report.properties()));
    self.loadingIndicatorEl.fadeIn(1000);
    if (self.canvas.is(':visible')) {
      self.canvas.fadeTo(300, 0.1);
    }
    $.getJSON(path, function(response) {
      var data = response.data;
      var chartData = data.chart_data;
      var isEmptyState = chartData.datasets.length === 0 ||
        (chartData.datasets.length === 1 && chartData.datasets[0].data.length === 0);
      var emptyStateText = (data.report_options && data.report_options.empty_state_text) || self.defaultEmptyStateText;
      var options = chartData.options;
      options = self.addAdditionalOptions(options, data.report_options);

      self.loadingIndicatorEl.stop(true, true).hide();
      self.emptyStateEl.html(emptyStateText).toggle(isEmptyState);
      if (isEmptyState) {
        self.canvas.hide();
        return;
      }
      self.canvas.show().fadeTo(300, 1);

      var args = {
        type: data.type,
        data: chartData,
        options: options
      };

      if (self.chart) {
        self.chart.data.datasets = chartData.datasets;
        self.chart.data.labels = chartData.labels;
        self.chart.update();
      } else {
        self.chart = new Chart(self.canvas, args);
      }
    });
  };

  self.addAdditionalOptions = function(options, reportOptions) {
    var additionalOptions = {};
    var maxItems = reportOptions && reportOptions.legend && reportOptions.legend.max_items;
    if (maxItems) {
      options.legend = options.legend || {};
      options.legend.labels = options.legend.labels || {};
      options.legend.labels.filter = options.legend.labels.filter || function(item) {
        var index = (typeof item.datasetIndex === 'undefined') ? item.index : item.datasetIndex;
        return index < maxItems;
      };
    }
    return options;
  };

  self.initialize(options);

  return self;
});
ReportsKit.Report = (function() {
  var self = this;

  self.render = function(options) {
    self.el = options.el;
    self.visualizationEl = self.el.find('.reports_kit_visualization');

    self.defaultProperties = self.el.data('properties');
    self.form = self.el.find('.reports_kit_report_form');

    self.initializeElements();
    self.initializeEvents();
    self.initializeVisualization();
    self.renderVisualization();
  };

  self.initializeVisualization = function() {
    if (self.defaultProperties.format == 'table') {
      self.visualization = new ReportsKit.Table({ report: self });
    } else {
      self.visualization = new ReportsKit.Chart({ report: self });
    }
  };

  self.initializeElements = function() {
    self.exportButtons = self.el.find('[data-role=reports_kit_export_button]');
    self.initializeAutocompletes();
    self.initializeDateRangePickers();
  };

  self.initializeAutocompletes = function() {
    self.form.find('.select2').each(function(index, el) {
      el = $(el);
      var path = el.data('path');
      var elParams = el.data('params');
      el.select2({
        theme: 'bootstrap',
        minimumResultsForSearch: 10,
        ajax: {
          url: path,
          dataType: 'json',
          delay: 250,
          data: function(params) {
            var data = {
              q: params.term,
              page: params.page
            };
            data = $.extend(data, elParams);
            return data;
          },
          processResults: function(data, params) {
            params.page = params.page || 1;
            return { results: data.data }
          },
          cache: true
        }
      });
    });
  };

  self.initializeDateRangePickers = function() {
    self.form.find('.date_range_picker').daterangepicker({
      opens: 'left',
      drops: 'down',
      showDropdowns: false,
      showWeekNumbers: false,
      timePicker: false,
      buttonClasses: ['btn', 'btn-sm'],
      applyClass: 'btn-primary btn-daterange-submit',
      cancelClass: 'btn-default',
      maxDate: moment(),
      locale: {
        format: 'MMM D, YYYY'
      },
      ranges: {
        'Last 30 Days': [moment().subtract(30, 'days'), moment()],
        'Last 2 Months': [moment().subtract(2, 'months'), moment()],
        'Last 3 Months': [moment().subtract(3, 'months'), moment()],
        'Last 4 Months': [moment().subtract(4, 'months'), moment()],
        'Last 6 Months': [moment().subtract(6, 'months'), moment()],
        'Last 12 Months': [moment().subtract(12, 'months'), moment()],
        'Year To Date': [moment().startOf('year'), moment()]
      }
    });
  };

  self.initializeEvents = function() {
    self.form.find('select,input').on('change', function() {
      self.renderVisualization();
    })
    self.form.on('submit', function() {
      self.renderVisualization();
      return false;
    })
    self.exportButtons.on('click', self.onClickExportButton);
  };

  self.properties = function() {
    var filterKeysValues = {};
    self.form.find('select,:text').each(function(index, el) {
      var filter = $(el);
      var key = filter.attr('name');
      filterKeysValues[key] = filter.val();
    });
    self.form.find(':checkbox').each(function(index, el) {
      var filter = $(el);
      var key = filter.attr('name');
      filterKeysValues[key] = filter.prop('checked');
    });
    var properties = $.extend({}, self.defaultProperties);

    properties.ui_filters = {};
    Object.keys(filterKeysValues).forEach(function(key, index) {
      var value = filterKeysValues[key];
      properties.ui_filters[key] = value;
    });

    return properties;
  };

  self.onClickExportButton = function(event) {
    var el = $(event.target);
    var path = el.data('path');
    var separator = path.indexOf('?') === -1 ? '?' : '&';
    path += separator + 'properties=' + encodeURIComponent(JSON.stringify(self.properties()));
    window.open(path, '_blank');
    return false;
  };

  self.renderVisualization = function() {
    self.visualization.render();
  };

  return self;
});
ReportsKit.Table = (function(options) {
  var self = this;

  self.initialize = function(options) {
    self.options = options;
    self.report = options.report;
    self.el = self.report.el;

    self.defaultEmptyStateText = 'No data was found';
    self.emptyStateEl = $('<div>' + self.defaultEmptyStateText + '</div>').appendTo(self.report.visualizationEl).hide();
    self.loadingIndicatorEl = $('<div class="loading_indicator"></div>').appendTo(self.report.visualizationEl).hide();
    self.table = $('<table />', { 'class': 'table table-striped table-hover' }).appendTo(self.report.visualizationEl);
  };

  self.render = function() {
    var path = self.el.data('path');
    var separator = path.indexOf('?') === -1 ? '?' : '&';
    path += separator + 'properties=' + encodeURIComponent(JSON.stringify(self.report.properties()));
    self.loadingIndicatorEl.fadeIn(1000);
    if (self.table.is(':visible')) {
      self.table.fadeTo(300, 0.1);
    }
    $.getJSON(path, function(response) {
      var data = response.data;
      var tableData = data.table_data;
      var reportOptions = data.report_options || {};
      // If the data only includes column headers, then it we have an empty state.
      var isEmptyState = tableData.length <= 1;
      var emptyStateText = reportOptions.empty_state_text || self.defaultEmptyStateText;
      self.emptyStateEl.html(emptyStateText);

      self.loadingIndicatorEl.stop(true, true).hide();
      self.emptyStateEl.toggle(isEmptyState);
      if (isEmptyState) {
        self.table.hide();
        return;
      }
      self.table.show().fadeTo(300, 1);

      var rowsCount = tableData.length;

      var hasHead = typeof reportOptions.head_rows_count !== 'undefined';
      var hasFoot = typeof reportOptions.foot_rows_count !== 'undefined';
      var headRowStartIndex = hasHead ? 0 : 0;
      var headRowEndIndex = hasHead ? reportOptions.head_rows_count - 1 : 0;
      var footRowStartIndex = hasFoot ? rowsCount - reportOptions.foot_rows_count : null;
      var footRowEndIndex = hasFoot ? rowsCount - 1 : null;

      var html = '';
      for(var i = 0; i < rowsCount; i++) {
        if (i === headRowStartIndex) {
          html += '<thead><tr>';
        } else if (i === (headRowEndIndex + 1)) {
          html += '<tbody><tr>';
        } else if (i === footRowStartIndex) {
          html += '<tfoot><tr>';
        } else {
          html += '<tr>';
        }

        for(var j = 0; j < tableData[i].length; j++) {
          if (i == 0 || j == 0) {
            html += '<th>' + (tableData[i][j] || '') + '</th>';
          } else {
            html += '<td>' + ((tableData[i][j] === null) ? '' : tableData[i][j]) + '</td>';
          }
        }

        if (i === headRowEndIndex) {
          html += '</tr></thead>';
        } else if (i === (footRowStartIndex - 1)) {
          html += '</tr></tbody>';
        } else if (i === footRowEndIndex) {
          html += '</tfoot></tbody>';
        } else {
          html += '</tr>';
        }
      }
      self.table.html(html);
      self.table.tablesorter({ sortInitialOrder: 'desc' });
    });
  };

  self.initialize(options);

  return self;
});
/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 2.5.0
 *
 * Copyright 2017 Nick Downie
 * Released under the MIT license
 * https://github.com/chartjs/Chart.js/blob/master/LICENSE.md
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Chart = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/* MIT license */
var colorNames = require(6);

module.exports = {
   getRgba: getRgba,
   getHsla: getHsla,
   getRgb: getRgb,
   getHsl: getHsl,
   getHwb: getHwb,
   getAlpha: getAlpha,

   hexString: hexString,
   rgbString: rgbString,
   rgbaString: rgbaString,
   percentString: percentString,
   percentaString: percentaString,
   hslString: hslString,
   hslaString: hslaString,
   hwbString: hwbString,
   keyword: keyword
}

function getRgba(string) {
   if (!string) {
      return;
   }
   var abbr =  /^#([a-fA-F0-9]{3})$/,
       hex =  /^#([a-fA-F0-9]{6})$/,
       rgba = /^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
       per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,
       keyword = /(\w+)/;

   var rgb = [0, 0, 0],
       a = 1,
       match = string.match(abbr);
   if (match) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i] + match[i], 16);
      }
   }
   else if (match = string.match(hex)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
   }
   else if (match = string.match(rgba)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = parseInt(match[i + 1]);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(per)) {
      for (var i = 0; i < rgb.length; i++) {
         rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
      a = parseFloat(match[4]);
   }
   else if (match = string.match(keyword)) {
      if (match[1] == "transparent") {
         return [0, 0, 0, 0];
      }
      rgb = colorNames[match[1]];
      if (!rgb) {
         return;
      }
   }

   for (var i = 0; i < rgb.length; i++) {
      rgb[i] = scale(rgb[i], 0, 255);
   }
   if (!a && a != 0) {
      a = 1;
   }
   else {
      a = scale(a, 0, 1);
   }
   rgb[3] = a;
   return rgb;
}

function getHsla(string) {
   if (!string) {
      return;
   }
   var hsl = /^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hsl);
   if (match) {
      var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          s = scale(parseFloat(match[2]), 0, 100),
          l = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, s, l, a];
   }
}

function getHwb(string) {
   if (!string) {
      return;
   }
   var hwb = /^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;
   var match = string.match(hwb);
   if (match) {
    var alpha = parseFloat(match[4]);
      var h = scale(parseInt(match[1]), 0, 360),
          w = scale(parseFloat(match[2]), 0, 100),
          b = scale(parseFloat(match[3]), 0, 100),
          a = scale(isNaN(alpha) ? 1 : alpha, 0, 1);
      return [h, w, b, a];
   }
}

function getRgb(string) {
   var rgba = getRgba(string);
   return rgba && rgba.slice(0, 3);
}

function getHsl(string) {
  var hsla = getHsla(string);
  return hsla && hsla.slice(0, 3);
}

function getAlpha(string) {
   var vals = getRgba(string);
   if (vals) {
      return vals[3];
   }
   else if (vals = getHsla(string)) {
      return vals[3];
   }
   else if (vals = getHwb(string)) {
      return vals[3];
   }
}

// generators
function hexString(rgb) {
   return "#" + hexDouble(rgb[0]) + hexDouble(rgb[1])
              + hexDouble(rgb[2]);
}

function rgbString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return rgbaString(rgba, alpha);
   }
   return "rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")";
}

function rgbaString(rgba, alpha) {
   if (alpha === undefined) {
      alpha = (rgba[3] !== undefined ? rgba[3] : 1);
   }
   return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2]
           + ", " + alpha + ")";
}

function percentString(rgba, alpha) {
   if (alpha < 1 || (rgba[3] && rgba[3] < 1)) {
      return percentaString(rgba, alpha);
   }
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);

   return "rgb(" + r + "%, " + g + "%, " + b + "%)";
}

function percentaString(rgba, alpha) {
   var r = Math.round(rgba[0]/255 * 100),
       g = Math.round(rgba[1]/255 * 100),
       b = Math.round(rgba[2]/255 * 100);
   return "rgba(" + r + "%, " + g + "%, " + b + "%, " + (alpha || rgba[3] || 1) + ")";
}

function hslString(hsla, alpha) {
   if (alpha < 1 || (hsla[3] && hsla[3] < 1)) {
      return hslaString(hsla, alpha);
   }
   return "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)";
}

function hslaString(hsla, alpha) {
   if (alpha === undefined) {
      alpha = (hsla[3] !== undefined ? hsla[3] : 1);
   }
   return "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, "
           + alpha + ")";
}

// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
function hwbString(hwb, alpha) {
   if (alpha === undefined) {
      alpha = (hwb[3] !== undefined ? hwb[3] : 1);
   }
   return "hwb(" + hwb[0] + ", " + hwb[1] + "%, " + hwb[2] + "%"
           + (alpha !== undefined && alpha !== 1 ? ", " + alpha : "") + ")";
}

function keyword(rgb) {
  return reverseNames[rgb.slice(0, 3)];
}

// helpers
function scale(num, min, max) {
   return Math.min(Math.max(min, num), max);
}

function hexDouble(num) {
  var str = num.toString(16).toUpperCase();
  return (str.length < 2) ? "0" + str : str;
}


//create a list of reverse color names
var reverseNames = {};
for (var name in colorNames) {
   reverseNames[colorNames[name]] = name;
}

},{"6":6}],3:[function(require,module,exports){
/* MIT license */
var convert = require(5);
var string = require(2);

var Color = function (obj) {
  if (obj instanceof Color) {
    return obj;
  }
  if (!(this instanceof Color)) {
    return new Color(obj);
  }

  this.values = {
    rgb: [0, 0, 0],
    hsl: [0, 0, 0],
    hsv: [0, 0, 0],
    hwb: [0, 0, 0],
    cmyk: [0, 0, 0, 0],
    alpha: 1
  };

  // parse Color() argument
  var vals;
  if (typeof obj === 'string') {
    vals = string.getRgba(obj);
    if (vals) {
      this.setValues('rgb', vals);
    } else if (vals = string.getHsla(obj)) {
      this.setValues('hsl', vals);
    } else if (vals = string.getHwb(obj)) {
      this.setValues('hwb', vals);
    } else {
      throw new Error('Unable to parse color from string "' + obj + '"');
    }
  } else if (typeof obj === 'object') {
    vals = obj;
    if (vals.r !== undefined || vals.red !== undefined) {
      this.setValues('rgb', vals);
    } else if (vals.l !== undefined || vals.lightness !== undefined) {
      this.setValues('hsl', vals);
    } else if (vals.v !== undefined || vals.value !== undefined) {
      this.setValues('hsv', vals);
    } else if (vals.w !== undefined || vals.whiteness !== undefined) {
      this.setValues('hwb', vals);
    } else if (vals.c !== undefined || vals.cyan !== undefined) {
      this.setValues('cmyk', vals);
    } else {
      throw new Error('Unable to parse color from object ' + JSON.stringify(obj));
    }
  }
};

Color.prototype = {
  rgb: function () {
    return this.setSpace('rgb', arguments);
  },
  hsl: function () {
    return this.setSpace('hsl', arguments);
  },
  hsv: function () {
    return this.setSpace('hsv', arguments);
  },
  hwb: function () {
    return this.setSpace('hwb', arguments);
  },
  cmyk: function () {
    return this.setSpace('cmyk', arguments);
  },

  rgbArray: function () {
    return this.values.rgb;
  },
  hslArray: function () {
    return this.values.hsl;
  },
  hsvArray: function () {
    return this.values.hsv;
  },
  hwbArray: function () {
    var values = this.values;
    if (values.alpha !== 1) {
      return values.hwb.concat([values.alpha]);
    }
    return values.hwb;
  },
  cmykArray: function () {
    return this.values.cmyk;
  },
  rgbaArray: function () {
    var values = this.values;
    return values.rgb.concat([values.alpha]);
  },
  hslaArray: function () {
    var values = this.values;
    return values.hsl.concat([values.alpha]);
  },
  alpha: function (val) {
    if (val === undefined) {
      return this.values.alpha;
    }
    this.setValues('alpha', val);
    return this;
  },

  red: function (val) {
    return this.setChannel('rgb', 0, val);
  },
  green: function (val) {
    return this.setChannel('rgb', 1, val);
  },
  blue: function (val) {
    return this.setChannel('rgb', 2, val);
  },
  hue: function (val) {
    if (val) {
      val %= 360;
      val = val < 0 ? 360 + val : val;
    }
    return this.setChannel('hsl', 0, val);
  },
  saturation: function (val) {
    return this.setChannel('hsl', 1, val);
  },
  lightness: function (val) {
    return this.setChannel('hsl', 2, val);
  },
  saturationv: function (val) {
    return this.setChannel('hsv', 1, val);
  },
  whiteness: function (val) {
    return this.setChannel('hwb', 1, val);
  },
  blackness: function (val) {
    return this.setChannel('hwb', 2, val);
  },
  value: function (val) {
    return this.setChannel('hsv', 2, val);
  },
  cyan: function (val) {
    return this.setChannel('cmyk', 0, val);
  },
  magenta: function (val) {
    return this.setChannel('cmyk', 1, val);
  },
  yellow: function (val) {
    return this.setChannel('cmyk', 2, val);
  },
  black: function (val) {
    return this.setChannel('cmyk', 3, val);
  },

  hexString: function () {
    return string.hexString(this.values.rgb);
  },
  rgbString: function () {
    return string.rgbString(this.values.rgb, this.values.alpha);
  },
  rgbaString: function () {
    return string.rgbaString(this.values.rgb, this.values.alpha);
  },
  percentString: function () {
    return string.percentString(this.values.rgb, this.values.alpha);
  },
  hslString: function () {
    return string.hslString(this.values.hsl, this.values.alpha);
  },
  hslaString: function () {
    return string.hslaString(this.values.hsl, this.values.alpha);
  },
  hwbString: function () {
    return string.hwbString(this.values.hwb, this.values.alpha);
  },
  keyword: function () {
    return string.keyword(this.values.rgb, this.values.alpha);
  },

  rgbNumber: function () {
    var rgb = this.values.rgb;
    return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
  },

  luminosity: function () {
    // http://www.w3.org/TR/WCAG20/#relativeluminancedef
    var rgb = this.values.rgb;
    var lum = [];
    for (var i = 0; i < rgb.length; i++) {
      var chan = rgb[i] / 255;
      lum[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
    }
    return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
  },

  contrast: function (color2) {
    // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
    var lum1 = this.luminosity();
    var lum2 = color2.luminosity();
    if (lum1 > lum2) {
      return (lum1 + 0.05) / (lum2 + 0.05);
    }
    return (lum2 + 0.05) / (lum1 + 0.05);
  },

  level: function (color2) {
    var contrastRatio = this.contrast(color2);
    if (contrastRatio >= 7.1) {
      return 'AAA';
    }

    return (contrastRatio >= 4.5) ? 'AA' : '';
  },

  dark: function () {
    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
    var rgb = this.values.rgb;
    var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return yiq < 128;
  },

  light: function () {
    return !this.dark();
  },

  negate: function () {
    var rgb = [];
    for (var i = 0; i < 3; i++) {
      rgb[i] = 255 - this.values.rgb[i];
    }
    this.setValues('rgb', rgb);
    return this;
  },

  lighten: function (ratio) {
    var hsl = this.values.hsl;
    hsl[2] += hsl[2] * ratio;
    this.setValues('hsl', hsl);
    return this;
  },

  darken: function (ratio) {
    var hsl = this.values.hsl;
    hsl[2] -= hsl[2] * ratio;
    this.setValues('hsl', hsl);
    return this;
  },

  saturate: function (ratio) {
    var hsl = this.values.hsl;
    hsl[1] += hsl[1] * ratio;
    this.setValues('hsl', hsl);
    return this;
  },

  desaturate: function (ratio) {
    var hsl = this.values.hsl;
    hsl[1] -= hsl[1] * ratio;
    this.setValues('hsl', hsl);
    return this;
  },

  whiten: function (ratio) {
    var hwb = this.values.hwb;
    hwb[1] += hwb[1] * ratio;
    this.setValues('hwb', hwb);
    return this;
  },

  blacken: function (ratio) {
    var hwb = this.values.hwb;
    hwb[2] += hwb[2] * ratio;
    this.setValues('hwb', hwb);
    return this;
  },

  greyscale: function () {
    var rgb = this.values.rgb;
    // http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
    var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
    this.setValues('rgb', [val, val, val]);
    return this;
  },

  clearer: function (ratio) {
    var alpha = this.values.alpha;
    this.setValues('alpha', alpha - (alpha * ratio));
    return this;
  },

  opaquer: function (ratio) {
    var alpha = this.values.alpha;
    this.setValues('alpha', alpha + (alpha * ratio));
    return this;
  },

  rotate: function (degrees) {
    var hsl = this.values.hsl;
    var hue = (hsl[0] + degrees) % 360;
    hsl[0] = hue < 0 ? 360 + hue : hue;
    this.setValues('hsl', hsl);
    return this;
  },

  /**
   * Ported from sass implementation in C
   * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
   */
  mix: function (mixinColor, weight) {
    var color1 = this;
    var color2 = mixinColor;
    var p = weight === undefined ? 0.5 : weight;

    var w = 2 * p - 1;
    var a = color1.alpha() - color2.alpha();

    var w1 = (((w * a === -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
    var w2 = 1 - w1;

    return this
      .rgb(
        w1 * color1.red() + w2 * color2.red(),
        w1 * color1.green() + w2 * color2.green(),
        w1 * color1.blue() + w2 * color2.blue()
      )
      .alpha(color1.alpha() * p + color2.alpha() * (1 - p));
  },

  toJSON: function () {
    return this.rgb();
  },

  clone: function () {
    // NOTE(SB): using node-clone creates a dependency to Buffer when using browserify,
    // making the final build way to big to embed in Chart.js. So let's do it manually,
    // assuming that values to clone are 1 dimension arrays containing only numbers,
    // except 'alpha' which is a number.
    var result = new Color();
    var source = this.values;
    var target = result.values;
    var value, type;

    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        value = source[prop];
        type = ({}).toString.call(value);
        if (type === '[object Array]') {
          target[prop] = value.slice(0);
        } else if (type === '[object Number]') {
          target[prop] = value;
        } else {
          console.error('unexpected color value:', value);
        }
      }
    }

    return result;
  }
};

Color.prototype.spaces = {
  rgb: ['red', 'green', 'blue'],
  hsl: ['hue', 'saturation', 'lightness'],
  hsv: ['hue', 'saturation', 'value'],
  hwb: ['hue', 'whiteness', 'blackness'],
  cmyk: ['cyan', 'magenta', 'yellow', 'black']
};

Color.prototype.maxes = {
  rgb: [255, 255, 255],
  hsl: [360, 100, 100],
  hsv: [360, 100, 100],
  hwb: [360, 100, 100],
  cmyk: [100, 100, 100, 100]
};

Color.prototype.getValues = function (space) {
  var values = this.values;
  var vals = {};

  for (var i = 0; i < space.length; i++) {
    vals[space.charAt(i)] = values[space][i];
  }

  if (values.alpha !== 1) {
    vals.a = values.alpha;
  }

  // {r: 255, g: 255, b: 255, a: 0.4}
  return vals;
};

Color.prototype.setValues = function (space, vals) {
  var values = this.values;
  var spaces = this.spaces;
  var maxes = this.maxes;
  var alpha = 1;
  var i;

  if (space === 'alpha') {
    alpha = vals;
  } else if (vals.length) {
    // [10, 10, 10]
    values[space] = vals.slice(0, space.length);
    alpha = vals[space.length];
  } else if (vals[space.charAt(0)] !== undefined) {
    // {r: 10, g: 10, b: 10}
    for (i = 0; i < space.length; i++) {
      values[space][i] = vals[space.charAt(i)];
    }

    alpha = vals.a;
  } else if (vals[spaces[space][0]] !== undefined) {
    // {red: 10, green: 10, blue: 10}
    var chans = spaces[space];

    for (i = 0; i < space.length; i++) {
      values[space][i] = vals[chans[i]];
    }

    alpha = vals.alpha;
  }

  values.alpha = Math.max(0, Math.min(1, (alpha === undefined ? values.alpha : alpha)));

  if (space === 'alpha') {
    return false;
  }

  var capped;

  // cap values of the space prior converting all values
  for (i = 0; i < space.length; i++) {
    capped = Math.max(0, Math.min(maxes[space][i], values[space][i]));
    values[space][i] = Math.round(capped);
  }

  // convert to all the other color spaces
  for (var sname in spaces) {
    if (sname !== space) {
      values[sname] = convert[space][sname](values[space]);
    }
  }

  return true;
};

Color.prototype.setSpace = function (space, args) {
  var vals = args[0];

  if (vals === undefined) {
    // color.rgb()
    return this.getValues(space);
  }

  // color.rgb(10, 10, 10)
  if (typeof vals === 'number') {
    vals = Array.prototype.slice.call(args);
  }

  this.setValues(space, vals);
  return this;
};

Color.prototype.setChannel = function (space, index, val) {
  var svalues = this.values[space];
  if (val === undefined) {
    // color.red()
    return svalues[index];
  } else if (val === svalues[index]) {
    // color.red(color.red())
    return this;
  }

  // color.red(100)
  svalues[index] = val;
  this.setValues(space, svalues);

  return this;
};

if (typeof window !== 'undefined') {
  window.Color = Color;
}

module.exports = Color;

},{"2":2,"5":5}],4:[function(require,module,exports){
/* MIT license */

module.exports = {
  rgb2hsl: rgb2hsl,
  rgb2hsv: rgb2hsv,
  rgb2hwb: rgb2hwb,
  rgb2cmyk: rgb2cmyk,
  rgb2keyword: rgb2keyword,
  rgb2xyz: rgb2xyz,
  rgb2lab: rgb2lab,
  rgb2lch: rgb2lch,

  hsl2rgb: hsl2rgb,
  hsl2hsv: hsl2hsv,
  hsl2hwb: hsl2hwb,
  hsl2cmyk: hsl2cmyk,
  hsl2keyword: hsl2keyword,

  hsv2rgb: hsv2rgb,
  hsv2hsl: hsv2hsl,
  hsv2hwb: hsv2hwb,
  hsv2cmyk: hsv2cmyk,
  hsv2keyword: hsv2keyword,

  hwb2rgb: hwb2rgb,
  hwb2hsl: hwb2hsl,
  hwb2hsv: hwb2hsv,
  hwb2cmyk: hwb2cmyk,
  hwb2keyword: hwb2keyword,

  cmyk2rgb: cmyk2rgb,
  cmyk2hsl: cmyk2hsl,
  cmyk2hsv: cmyk2hsv,
  cmyk2hwb: cmyk2hwb,
  cmyk2keyword: cmyk2keyword,

  keyword2rgb: keyword2rgb,
  keyword2hsl: keyword2hsl,
  keyword2hsv: keyword2hsv,
  keyword2hwb: keyword2hwb,
  keyword2cmyk: keyword2cmyk,
  keyword2lab: keyword2lab,
  keyword2xyz: keyword2xyz,

  xyz2rgb: xyz2rgb,
  xyz2lab: xyz2lab,
  xyz2lch: xyz2lch,

  lab2xyz: lab2xyz,
  lab2rgb: lab2rgb,
  lab2lch: lab2lch,

  lch2lab: lch2lab,
  lch2xyz: lch2xyz,
  lch2rgb: lch2rgb
}


function rgb2hsl(rgb) {
  var r = rgb[0]/255,
      g = rgb[1]/255,
      b = rgb[2]/255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, l;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g)/ delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  l = (min + max) / 2;

  if (max == min)
    s = 0;
  else if (l <= 0.5)
    s = delta / (max + min);
  else
    s = delta / (2 - max - min);

  return [h, s * 100, l * 100];
}

function rgb2hsv(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      delta = max - min,
      h, s, v;

  if (max == 0)
    s = 0;
  else
    s = (delta/max * 1000)/10;

  if (max == min)
    h = 0;
  else if (r == max)
    h = (g - b) / delta;
  else if (g == max)
    h = 2 + (b - r) / delta;
  else if (b == max)
    h = 4 + (r - g) / delta;

  h = Math.min(h * 60, 360);

  if (h < 0)
    h += 360;

  v = ((max / 255) * 1000) / 10;

  return [h, s, v];
}

function rgb2hwb(rgb) {
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      h = rgb2hsl(rgb)[0],
      w = 1/255 * Math.min(r, Math.min(g, b)),
      b = 1 - 1/255 * Math.max(r, Math.max(g, b));

  return [h, w * 100, b * 100];
}

function rgb2cmyk(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      c, m, y, k;

  k = Math.min(1 - r, 1 - g, 1 - b);
  c = (1 - r - k) / (1 - k) || 0;
  m = (1 - g - k) / (1 - k) || 0;
  y = (1 - b - k) / (1 - k) || 0;
  return [c * 100, m * 100, y * 100, k * 100];
}

function rgb2keyword(rgb) {
  return reverseKeywords[JSON.stringify(rgb)];
}

function rgb2xyz(rgb) {
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;

  // assume sRGB
  r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
  g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
  b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

  var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
  var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
  var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

  return [x * 100, y *100, z * 100];
}

function rgb2lab(rgb) {
  var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function rgb2lch(args) {
  return lab2lch(rgb2lab(args));
}

function hsl2rgb(hsl) {
  var h = hsl[0] / 360,
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      t1, t2, t3, rgb, val;

  if (s == 0) {
    val = l * 255;
    return [val, val, val];
  }

  if (l < 0.5)
    t2 = l * (1 + s);
  else
    t2 = l + s - l * s;
  t1 = 2 * l - t2;

  rgb = [0, 0, 0];
  for (var i = 0; i < 3; i++) {
    t3 = h + 1 / 3 * - (i - 1);
    t3 < 0 && t3++;
    t3 > 1 && t3--;

    if (6 * t3 < 1)
      val = t1 + (t2 - t1) * 6 * t3;
    else if (2 * t3 < 1)
      val = t2;
    else if (3 * t3 < 2)
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    else
      val = t1;

    rgb[i] = val * 255;
  }

  return rgb;
}

function hsl2hsv(hsl) {
  var h = hsl[0],
      s = hsl[1] / 100,
      l = hsl[2] / 100,
      sv, v;

  if(l === 0) {
      // no need to do calc on black
      // also avoids divide by 0 error
      return [0, 0, 0];
  }

  l *= 2;
  s *= (l <= 1) ? l : 2 - l;
  v = (l + s) / 2;
  sv = (2 * s) / (l + s);
  return [h, sv * 100, v * 100];
}

function hsl2hwb(args) {
  return rgb2hwb(hsl2rgb(args));
}

function hsl2cmyk(args) {
  return rgb2cmyk(hsl2rgb(args));
}

function hsl2keyword(args) {
  return rgb2keyword(hsl2rgb(args));
}


function hsv2rgb(hsv) {
  var h = hsv[0] / 60,
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      hi = Math.floor(h) % 6;

  var f = h - Math.floor(h),
      p = 255 * v * (1 - s),
      q = 255 * v * (1 - (s * f)),
      t = 255 * v * (1 - (s * (1 - f))),
      v = 255 * v;

  switch(hi) {
    case 0:
      return [v, t, p];
    case 1:
      return [q, v, p];
    case 2:
      return [p, v, t];
    case 3:
      return [p, q, v];
    case 4:
      return [t, p, v];
    case 5:
      return [v, p, q];
  }
}

function hsv2hsl(hsv) {
  var h = hsv[0],
      s = hsv[1] / 100,
      v = hsv[2] / 100,
      sl, l;

  l = (2 - s) * v;
  sl = s * v;
  sl /= (l <= 1) ? l : 2 - l;
  sl = sl || 0;
  l /= 2;
  return [h, sl * 100, l * 100];
}

function hsv2hwb(args) {
  return rgb2hwb(hsv2rgb(args))
}

function hsv2cmyk(args) {
  return rgb2cmyk(hsv2rgb(args));
}

function hsv2keyword(args) {
  return rgb2keyword(hsv2rgb(args));
}

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
function hwb2rgb(hwb) {
  var h = hwb[0] / 360,
      wh = hwb[1] / 100,
      bl = hwb[2] / 100,
      ratio = wh + bl,
      i, v, f, n;

  // wh + bl cant be > 1
  if (ratio > 1) {
    wh /= ratio;
    bl /= ratio;
  }

  i = Math.floor(6 * h);
  v = 1 - bl;
  f = 6 * h - i;
  if ((i & 0x01) != 0) {
    f = 1 - f;
  }
  n = wh + f * (v - wh);  // linear interpolation

  switch (i) {
    default:
    case 6:
    case 0: r = v; g = n; b = wh; break;
    case 1: r = n; g = v; b = wh; break;
    case 2: r = wh; g = v; b = n; break;
    case 3: r = wh; g = n; b = v; break;
    case 4: r = n; g = wh; b = v; break;
    case 5: r = v; g = wh; b = n; break;
  }

  return [r * 255, g * 255, b * 255];
}

function hwb2hsl(args) {
  return rgb2hsl(hwb2rgb(args));
}

function hwb2hsv(args) {
  return rgb2hsv(hwb2rgb(args));
}

function hwb2cmyk(args) {
  return rgb2cmyk(hwb2rgb(args));
}

function hwb2keyword(args) {
  return rgb2keyword(hwb2rgb(args));
}

function cmyk2rgb(cmyk) {
  var c = cmyk[0] / 100,
      m = cmyk[1] / 100,
      y = cmyk[2] / 100,
      k = cmyk[3] / 100,
      r, g, b;

  r = 1 - Math.min(1, c * (1 - k) + k);
  g = 1 - Math.min(1, m * (1 - k) + k);
  b = 1 - Math.min(1, y * (1 - k) + k);
  return [r * 255, g * 255, b * 255];
}

function cmyk2hsl(args) {
  return rgb2hsl(cmyk2rgb(args));
}

function cmyk2hsv(args) {
  return rgb2hsv(cmyk2rgb(args));
}

function cmyk2hwb(args) {
  return rgb2hwb(cmyk2rgb(args));
}

function cmyk2keyword(args) {
  return rgb2keyword(cmyk2rgb(args));
}


function xyz2rgb(xyz) {
  var x = xyz[0] / 100,
      y = xyz[1] / 100,
      z = xyz[2] / 100,
      r, g, b;

  r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
  g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
  b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

  // assume sRGB
  r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
    : r = (r * 12.92);

  g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
    : g = (g * 12.92);

  b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
    : b = (b * 12.92);

  r = Math.min(Math.max(0, r), 1);
  g = Math.min(Math.max(0, g), 1);
  b = Math.min(Math.max(0, b), 1);

  return [r * 255, g * 255, b * 255];
}

function xyz2lab(xyz) {
  var x = xyz[0],
      y = xyz[1],
      z = xyz[2],
      l, a, b;

  x /= 95.047;
  y /= 100;
  z /= 108.883;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  l = (116 * y) - 16;
  a = 500 * (x - y);
  b = 200 * (y - z);

  return [l, a, b];
}

function xyz2lch(args) {
  return lab2lch(xyz2lab(args));
}

function lab2xyz(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      x, y, z, y2;

  if (l <= 8) {
    y = (l * 100) / 903.3;
    y2 = (7.787 * (y / 100)) + (16 / 116);
  } else {
    y = 100 * Math.pow((l + 16) / 116, 3);
    y2 = Math.pow(y / 100, 1/3);
  }

  x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

  z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

  return [x, y, z];
}

function lab2lch(lab) {
  var l = lab[0],
      a = lab[1],
      b = lab[2],
      hr, h, c;

  hr = Math.atan2(b, a);
  h = hr * 360 / 2 / Math.PI;
  if (h < 0) {
    h += 360;
  }
  c = Math.sqrt(a * a + b * b);
  return [l, c, h];
}

function lab2rgb(args) {
  return xyz2rgb(lab2xyz(args));
}

function lch2lab(lch) {
  var l = lch[0],
      c = lch[1],
      h = lch[2],
      a, b, hr;

  hr = h / 360 * 2 * Math.PI;
  a = c * Math.cos(hr);
  b = c * Math.sin(hr);
  return [l, a, b];
}

function lch2xyz(args) {
  return lab2xyz(lch2lab(args));
}

function lch2rgb(args) {
  return lab2rgb(lch2lab(args));
}

function keyword2rgb(keyword) {
  return cssKeywords[keyword];
}

function keyword2hsl(args) {
  return rgb2hsl(keyword2rgb(args));
}

function keyword2hsv(args) {
  return rgb2hsv(keyword2rgb(args));
}

function keyword2hwb(args) {
  return rgb2hwb(keyword2rgb(args));
}

function keyword2cmyk(args) {
  return rgb2cmyk(keyword2rgb(args));
}

function keyword2lab(args) {
  return rgb2lab(keyword2rgb(args));
}

function keyword2xyz(args) {
  return rgb2xyz(keyword2rgb(args));
}

var cssKeywords = {
  aliceblue:  [240,248,255],
  antiquewhite: [250,235,215],
  aqua: [0,255,255],
  aquamarine: [127,255,212],
  azure:  [240,255,255],
  beige:  [245,245,220],
  bisque: [255,228,196],
  black:  [0,0,0],
  blanchedalmond: [255,235,205],
  blue: [0,0,255],
  blueviolet: [138,43,226],
  brown:  [165,42,42],
  burlywood:  [222,184,135],
  cadetblue:  [95,158,160],
  chartreuse: [127,255,0],
  chocolate:  [210,105,30],
  coral:  [255,127,80],
  cornflowerblue: [100,149,237],
  cornsilk: [255,248,220],
  crimson:  [220,20,60],
  cyan: [0,255,255],
  darkblue: [0,0,139],
  darkcyan: [0,139,139],
  darkgoldenrod:  [184,134,11],
  darkgray: [169,169,169],
  darkgreen:  [0,100,0],
  darkgrey: [169,169,169],
  darkkhaki:  [189,183,107],
  darkmagenta:  [139,0,139],
  darkolivegreen: [85,107,47],
  darkorange: [255,140,0],
  darkorchid: [153,50,204],
  darkred:  [139,0,0],
  darksalmon: [233,150,122],
  darkseagreen: [143,188,143],
  darkslateblue:  [72,61,139],
  darkslategray:  [47,79,79],
  darkslategrey:  [47,79,79],
  darkturquoise:  [0,206,209],
  darkviolet: [148,0,211],
  deeppink: [255,20,147],
  deepskyblue:  [0,191,255],
  dimgray:  [105,105,105],
  dimgrey:  [105,105,105],
  dodgerblue: [30,144,255],
  firebrick:  [178,34,34],
  floralwhite:  [255,250,240],
  forestgreen:  [34,139,34],
  fuchsia:  [255,0,255],
  gainsboro:  [220,220,220],
  ghostwhite: [248,248,255],
  gold: [255,215,0],
  goldenrod:  [218,165,32],
  gray: [128,128,128],
  green:  [0,128,0],
  greenyellow:  [173,255,47],
  grey: [128,128,128],
  honeydew: [240,255,240],
  hotpink:  [255,105,180],
  indianred:  [205,92,92],
  indigo: [75,0,130],
  ivory:  [255,255,240],
  khaki:  [240,230,140],
  lavender: [230,230,250],
  lavenderblush:  [255,240,245],
  lawngreen:  [124,252,0],
  lemonchiffon: [255,250,205],
  lightblue:  [173,216,230],
  lightcoral: [240,128,128],
  lightcyan:  [224,255,255],
  lightgoldenrodyellow: [250,250,210],
  lightgray:  [211,211,211],
  lightgreen: [144,238,144],
  lightgrey:  [211,211,211],
  lightpink:  [255,182,193],
  lightsalmon:  [255,160,122],
  lightseagreen:  [32,178,170],
  lightskyblue: [135,206,250],
  lightslategray: [119,136,153],
  lightslategrey: [119,136,153],
  lightsteelblue: [176,196,222],
  lightyellow:  [255,255,224],
  lime: [0,255,0],
  limegreen:  [50,205,50],
  linen:  [250,240,230],
  magenta:  [255,0,255],
  maroon: [128,0,0],
  mediumaquamarine: [102,205,170],
  mediumblue: [0,0,205],
  mediumorchid: [186,85,211],
  mediumpurple: [147,112,219],
  mediumseagreen: [60,179,113],
  mediumslateblue:  [123,104,238],
  mediumspringgreen:  [0,250,154],
  mediumturquoise:  [72,209,204],
  mediumvioletred:  [199,21,133],
  midnightblue: [25,25,112],
  mintcream:  [245,255,250],
  mistyrose:  [255,228,225],
  moccasin: [255,228,181],
  navajowhite:  [255,222,173],
  navy: [0,0,128],
  oldlace:  [253,245,230],
  olive:  [128,128,0],
  olivedrab:  [107,142,35],
  orange: [255,165,0],
  orangered:  [255,69,0],
  orchid: [218,112,214],
  palegoldenrod:  [238,232,170],
  palegreen:  [152,251,152],
  paleturquoise:  [175,238,238],
  palevioletred:  [219,112,147],
  papayawhip: [255,239,213],
  peachpuff:  [255,218,185],
  peru: [205,133,63],
  pink: [255,192,203],
  plum: [221,160,221],
  powderblue: [176,224,230],
  purple: [128,0,128],
  rebeccapurple: [102, 51, 153],
  red:  [255,0,0],
  rosybrown:  [188,143,143],
  royalblue:  [65,105,225],
  saddlebrown:  [139,69,19],
  salmon: [250,128,114],
  sandybrown: [244,164,96],
  seagreen: [46,139,87],
  seashell: [255,245,238],
  sienna: [160,82,45],
  silver: [192,192,192],
  skyblue:  [135,206,235],
  slateblue:  [106,90,205],
  slategray:  [112,128,144],
  slategrey:  [112,128,144],
  snow: [255,250,250],
  springgreen:  [0,255,127],
  steelblue:  [70,130,180],
  tan:  [210,180,140],
  teal: [0,128,128],
  thistle:  [216,191,216],
  tomato: [255,99,71],
  turquoise:  [64,224,208],
  violet: [238,130,238],
  wheat:  [245,222,179],
  white:  [255,255,255],
  whitesmoke: [245,245,245],
  yellow: [255,255,0],
  yellowgreen:  [154,205,50]
};

var reverseKeywords = {};
for (var key in cssKeywords) {
  reverseKeywords[JSON.stringify(cssKeywords[key])] = key;
}

},{}],5:[function(require,module,exports){
var conversions = require(4);

var convert = function() {
   return new Converter();
}

for (var func in conversions) {
  // export Raw versions
  convert[func + "Raw"] =  (function(func) {
    // accept array or plain args
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);
      return conversions[func](arg);
    }
  })(func);

  var pair = /(\w+)2(\w+)/.exec(func),
      from = pair[1],
      to = pair[2];

  // export rgb2hsl and ["rgb"]["hsl"]
  convert[from] = convert[from] || {};

  convert[from][to] = convert[func] = (function(func) {
    return function(arg) {
      if (typeof arg == "number")
        arg = Array.prototype.slice.call(arguments);

      var val = conversions[func](arg);
      if (typeof val == "string" || val === undefined)
        return val; // keyword

      for (var i = 0; i < val.length; i++)
        val[i] = Math.round(val[i]);
      return val;
    }
  })(func);
}


/* Converter does lazy conversion and caching */
var Converter = function() {
   this.convs = {};
};

/* Either get the values for a space or
  set the values for a space, depending on args */
Converter.prototype.routeSpace = function(space, args) {
   var values = args[0];
   if (values === undefined) {
      // color.rgb()
      return this.getValues(space);
   }
   // color.rgb(10, 10, 10)
   if (typeof values == "number") {
      values = Array.prototype.slice.call(args);
   }

   return this.setValues(space, values);
};

/* Set the values for a space, invalidating cache */
Converter.prototype.setValues = function(space, values) {
   this.space = space;
   this.convs = {};
   this.convs[space] = values;
   return this;
};

/* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */
Converter.prototype.getValues = function(space) {
   var vals = this.convs[space];
   if (!vals) {
      var fspace = this.space,
          from = this.convs[fspace];
      vals = convert[fspace][space](from);

      this.convs[space] = vals;
   }
  return vals;
};

["rgb", "hsl", "hsv", "cmyk", "keyword"].forEach(function(space) {
   Converter.prototype[space] = function(vals) {
      return this.routeSpace(space, arguments);
   }
});

module.exports = convert;
},{"4":4}],6:[function(require,module,exports){
module.exports = {
  "aliceblue": [240, 248, 255],
  "antiquewhite": [250, 235, 215],
  "aqua": [0, 255, 255],
  "aquamarine": [127, 255, 212],
  "azure": [240, 255, 255],
  "beige": [245, 245, 220],
  "bisque": [255, 228, 196],
  "black": [0, 0, 0],
  "blanchedalmond": [255, 235, 205],
  "blue": [0, 0, 255],
  "blueviolet": [138, 43, 226],
  "brown": [165, 42, 42],
  "burlywood": [222, 184, 135],
  "cadetblue": [95, 158, 160],
  "chartreuse": [127, 255, 0],
  "chocolate": [210, 105, 30],
  "coral": [255, 127, 80],
  "cornflowerblue": [100, 149, 237],
  "cornsilk": [255, 248, 220],
  "crimson": [220, 20, 60],
  "cyan": [0, 255, 255],
  "darkblue": [0, 0, 139],
  "darkcyan": [0, 139, 139],
  "darkgoldenrod": [184, 134, 11],
  "darkgray": [169, 169, 169],
  "darkgreen": [0, 100, 0],
  "darkgrey": [169, 169, 169],
  "darkkhaki": [189, 183, 107],
  "darkmagenta": [139, 0, 139],
  "darkolivegreen": [85, 107, 47],
  "darkorange": [255, 140, 0],
  "darkorchid": [153, 50, 204],
  "darkred": [139, 0, 0],
  "darksalmon": [233, 150, 122],
  "darkseagreen": [143, 188, 143],
  "darkslateblue": [72, 61, 139],
  "darkslategray": [47, 79, 79],
  "darkslategrey": [47, 79, 79],
  "darkturquoise": [0, 206, 209],
  "darkviolet": [148, 0, 211],
  "deeppink": [255, 20, 147],
  "deepskyblue": [0, 191, 255],
  "dimgray": [105, 105, 105],
  "dimgrey": [105, 105, 105],
  "dodgerblue": [30, 144, 255],
  "firebrick": [178, 34, 34],
  "floralwhite": [255, 250, 240],
  "forestgreen": [34, 139, 34],
  "fuchsia": [255, 0, 255],
  "gainsboro": [220, 220, 220],
  "ghostwhite": [248, 248, 255],
  "gold": [255, 215, 0],
  "goldenrod": [218, 165, 32],
  "gray": [128, 128, 128],
  "green": [0, 128, 0],
  "greenyellow": [173, 255, 47],
  "grey": [128, 128, 128],
  "honeydew": [240, 255, 240],
  "hotpink": [255, 105, 180],
  "indianred": [205, 92, 92],
  "indigo": [75, 0, 130],
  "ivory": [255, 255, 240],
  "khaki": [240, 230, 140],
  "lavender": [230, 230, 250],
  "lavenderblush": [255, 240, 245],
  "lawngreen": [124, 252, 0],
  "lemonchiffon": [255, 250, 205],
  "lightblue": [173, 216, 230],
  "lightcoral": [240, 128, 128],
  "lightcyan": [224, 255, 255],
  "lightgoldenrodyellow": [250, 250, 210],
  "lightgray": [211, 211, 211],
  "lightgreen": [144, 238, 144],
  "lightgrey": [211, 211, 211],
  "lightpink": [255, 182, 193],
  "lightsalmon": [255, 160, 122],
  "lightseagreen": [32, 178, 170],
  "lightskyblue": [135, 206, 250],
  "lightslategray": [119, 136, 153],
  "lightslategrey": [119, 136, 153],
  "lightsteelblue": [176, 196, 222],
  "lightyellow": [255, 255, 224],
  "lime": [0, 255, 0],
  "limegreen": [50, 205, 50],
  "linen": [250, 240, 230],
  "magenta": [255, 0, 255],
  "maroon": [128, 0, 0],
  "mediumaquamarine": [102, 205, 170],
  "mediumblue": [0, 0, 205],
  "mediumorchid": [186, 85, 211],
  "mediumpurple": [147, 112, 219],
  "mediumseagreen": [60, 179, 113],
  "mediumslateblue": [123, 104, 238],
  "mediumspringgreen": [0, 250, 154],
  "mediumturquoise": [72, 209, 204],
  "mediumvioletred": [199, 21, 133],
  "midnightblue": [25, 25, 112],
  "mintcream": [245, 255, 250],
  "mistyrose": [255, 228, 225],
  "moccasin": [255, 228, 181],
  "navajowhite": [255, 222, 173],
  "navy": [0, 0, 128],
  "oldlace": [253, 245, 230],
  "olive": [128, 128, 0],
  "olivedrab": [107, 142, 35],
  "orange": [255, 165, 0],
  "orangered": [255, 69, 0],
  "orchid": [218, 112, 214],
  "palegoldenrod": [238, 232, 170],
  "palegreen": [152, 251, 152],
  "paleturquoise": [175, 238, 238],
  "palevioletred": [219, 112, 147],
  "papayawhip": [255, 239, 213],
  "peachpuff": [255, 218, 185],
  "peru": [205, 133, 63],
  "pink": [255, 192, 203],
  "plum": [221, 160, 221],
  "powderblue": [176, 224, 230],
  "purple": [128, 0, 128],
  "rebeccapurple": [102, 51, 153],
  "red": [255, 0, 0],
  "rosybrown": [188, 143, 143],
  "royalblue": [65, 105, 225],
  "saddlebrown": [139, 69, 19],
  "salmon": [250, 128, 114],
  "sandybrown": [244, 164, 96],
  "seagreen": [46, 139, 87],
  "seashell": [255, 245, 238],
  "sienna": [160, 82, 45],
  "silver": [192, 192, 192],
  "skyblue": [135, 206, 235],
  "slateblue": [106, 90, 205],
  "slategray": [112, 128, 144],
  "slategrey": [112, 128, 144],
  "snow": [255, 250, 250],
  "springgreen": [0, 255, 127],
  "steelblue": [70, 130, 180],
  "tan": [210, 180, 140],
  "teal": [0, 128, 128],
  "thistle": [216, 191, 216],
  "tomato": [255, 99, 71],
  "turquoise": [64, 224, 208],
  "violet": [238, 130, 238],
  "wheat": [245, 222, 179],
  "white": [255, 255, 255],
  "whitesmoke": [245, 245, 245],
  "yellow": [255, 255, 0],
  "yellowgreen": [154, 205, 50]
};
},{}],7:[function(require,module,exports){
/**
 * @namespace Chart
 */
var Chart = require(28)();

require(26)(Chart);
require(42)(Chart);
require(22)(Chart);
require(31)(Chart);
require(25)(Chart);
require(21)(Chart);
require(23)(Chart);
require(24)(Chart);
require(29)(Chart);
require(33)(Chart);
require(34)(Chart);
require(32)(Chart);
require(35)(Chart);
require(30)(Chart);
require(27)(Chart);
require(36)(Chart);

require(37)(Chart);
require(38)(Chart);
require(39)(Chart);
require(40)(Chart);

require(45)(Chart);
require(43)(Chart);
require(44)(Chart);
require(46)(Chart);
require(47)(Chart);
require(48)(Chart);

// Controllers must be loaded after elements
// See Chart.core.datasetController.dataElementType
require(15)(Chart);
require(16)(Chart);
require(17)(Chart);
require(18)(Chart);
require(19)(Chart);
require(20)(Chart);

require(8)(Chart);
require(9)(Chart);
require(10)(Chart);
require(11)(Chart);
require(12)(Chart);
require(13)(Chart);
require(14)(Chart);

window.Chart = module.exports = Chart;

},{"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"16":16,"17":17,"18":18,"19":19,"20":20,"21":21,"22":22,"23":23,"24":24,"25":25,"26":26,"27":27,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"34":34,"35":35,"36":36,"37":37,"38":38,"39":39,"40":40,"42":42,"43":43,"44":44,"45":45,"46":46,"47":47,"48":48,"8":8,"9":9}],8:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  Chart.Bar = function(context, config) {
    config.type = 'bar';

    return new Chart(context, config);
  };

};

},{}],9:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  Chart.Bubble = function(context, config) {
    config.type = 'bubble';
    return new Chart(context, config);
  };

};

},{}],10:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  Chart.Doughnut = function(context, config) {
    config.type = 'doughnut';

    return new Chart(context, config);
  };

};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  Chart.Line = function(context, config) {
    config.type = 'line';

    return new Chart(context, config);
  };

};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  Chart.PolarArea = function(context, config) {
    config.type = 'polarArea';

    return new Chart(context, config);
  };

};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  Chart.Radar = function(context, config) {
    config.type = 'radar';

    return new Chart(context, config);
  };

};

},{}],14:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var defaultConfig = {
    hover: {
      mode: 'single'
    },

    scales: {
      xAxes: [{
        type: 'linear', // scatter should not use a category axis
        position: 'bottom',
        id: 'x-axis-1' // need an ID so datasets can reference the scale
      }],
      yAxes: [{
        type: 'linear',
        position: 'left',
        id: 'y-axis-1'
      }]
    },

    tooltips: {
      callbacks: {
        title: function() {
          // Title doesn't make sense for scatter since we format the data as a point
          return '';
        },
        label: function(tooltipItem) {
          return '(' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ')';
        }
      }
    }
  };

  // Register the default config for this type
  Chart.defaults.scatter = defaultConfig;

  // Scatter charts use line controllers
  Chart.controllers.scatter = Chart.controllers.line;

  Chart.Scatter = function(context, config) {
    config.type = 'scatter';
    return new Chart(context, config);
  };

};

},{}],15:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.bar = {
    hover: {
      mode: 'label'
    },

    scales: {
      xAxes: [{
        type: 'category',

        // Specific to Bar Controller
        categoryPercentage: 0.8,
        barPercentage: 0.9,

        // grid line settings
        gridLines: {
          offsetGridLines: true
        }
      }],
      yAxes: [{
        type: 'linear'
      }]
    }
  };

  Chart.controllers.bar = Chart.DatasetController.extend({

    dataElementType: Chart.elements.Rectangle,

    initialize: function(chart, datasetIndex) {
      Chart.DatasetController.prototype.initialize.call(this, chart, datasetIndex);

      var me = this;
      var meta = me.getMeta();
      var dataset = me.getDataset();

      meta.stack = dataset.stack;
      // Use this to indicate that this is a bar dataset.
      meta.bar = true;
    },

    // Correctly calculate the bar width accounting for stacks and the fact that not all bars are visible
    getStackCount: function() {
      var me = this;
      var meta = me.getMeta();
      var yScale = me.getScaleForId(meta.yAxisID);

      var stacks = [];
      helpers.each(me.chart.data.datasets, function(dataset, datasetIndex) {
        var dsMeta = me.chart.getDatasetMeta(datasetIndex);
        if (dsMeta.bar && me.chart.isDatasetVisible(datasetIndex) &&
          (yScale.options.stacked === false ||
          (yScale.options.stacked === true && stacks.indexOf(dsMeta.stack) === -1) ||
          (yScale.options.stacked === undefined && (dsMeta.stack === undefined || stacks.indexOf(dsMeta.stack) === -1)))) {
          stacks.push(dsMeta.stack);
        }
      }, me);

      return stacks.length;
    },

    update: function(reset) {
      var me = this;
      helpers.each(me.getMeta().data, function(rectangle, index) {
        me.updateElement(rectangle, index, reset);
      }, me);
    },

    updateElement: function(rectangle, index, reset) {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      var yScale = me.getScaleForId(meta.yAxisID);
      var scaleBase = yScale.getBasePixel();
      var rectangleElementOptions = me.chart.options.elements.rectangle;
      var custom = rectangle.custom || {};
      var dataset = me.getDataset();

      rectangle._xScale = xScale;
      rectangle._yScale = yScale;
      rectangle._datasetIndex = me.index;
      rectangle._index = index;

      var ruler = me.getRuler(index); // The index argument for compatible
      rectangle._model = {
        x: me.calculateBarX(index, me.index, ruler),
        y: reset ? scaleBase : me.calculateBarY(index, me.index),

        // Tooltip
        label: me.chart.data.labels[index],
        datasetLabel: dataset.label,

        // Appearance
        horizontal: false,
        base: reset ? scaleBase : me.calculateBarBase(me.index, index),
        width: me.calculateBarWidth(ruler),
        backgroundColor: custom.backgroundColor ? custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, rectangleElementOptions.backgroundColor),
        borderSkipped: custom.borderSkipped ? custom.borderSkipped : rectangleElementOptions.borderSkipped,
        borderColor: custom.borderColor ? custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, rectangleElementOptions.borderColor),
        borderWidth: custom.borderWidth ? custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangleElementOptions.borderWidth)
      };

      rectangle.pivot();
    },

    calculateBarBase: function(datasetIndex, index) {
      var me = this;
      var meta = me.getMeta();
      var yScale = me.getScaleForId(meta.yAxisID);
      var base = yScale.getBaseValue();
      var original = base;

      if ((yScale.options.stacked === true) ||
        (yScale.options.stacked === undefined && meta.stack !== undefined)) {
        var chart = me.chart;
        var datasets = chart.data.datasets;
        var value = Number(datasets[datasetIndex].data[index]);

        for (var i = 0; i < datasetIndex; i++) {
          var currentDs = datasets[i];
          var currentDsMeta = chart.getDatasetMeta(i);
          if (currentDsMeta.bar && currentDsMeta.yAxisID === yScale.id && chart.isDatasetVisible(i) &&
            meta.stack === currentDsMeta.stack) {
            var currentVal = Number(currentDs.data[index]);
            base += value < 0 ? Math.min(currentVal, original) : Math.max(currentVal, original);
          }
        }

        return yScale.getPixelForValue(base);
      }

      return yScale.getBasePixel();
    },

    getRuler: function() {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      var stackCount = me.getStackCount();

      var tickWidth = xScale.width / xScale.ticks.length;
      var categoryWidth = tickWidth * xScale.options.categoryPercentage;
      var categorySpacing = (tickWidth - (tickWidth * xScale.options.categoryPercentage)) / 2;
      var fullBarWidth = categoryWidth / stackCount;

      var barWidth = fullBarWidth * xScale.options.barPercentage;
      var barSpacing = fullBarWidth - (fullBarWidth * xScale.options.barPercentage);

      return {
        stackCount: stackCount,
        tickWidth: tickWidth,
        categoryWidth: categoryWidth,
        categorySpacing: categorySpacing,
        fullBarWidth: fullBarWidth,
        barWidth: barWidth,
        barSpacing: barSpacing
      };
    },

    calculateBarWidth: function(ruler) {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      if (xScale.options.barThickness) {
        return xScale.options.barThickness;
      }
      return ruler.barWidth;
    },

    // Get stack index from the given dataset index accounting for stacks and the fact that not all bars are visible
    getStackIndex: function(datasetIndex) {
      var me = this;
      var meta = me.chart.getDatasetMeta(datasetIndex);
      var yScale = me.getScaleForId(meta.yAxisID);
      var dsMeta, j;
      var stacks = [meta.stack];

      for (j = 0; j < datasetIndex; ++j) {
        dsMeta = this.chart.getDatasetMeta(j);
        if (dsMeta.bar && this.chart.isDatasetVisible(j) &&
          (yScale.options.stacked === false ||
          (yScale.options.stacked === true && stacks.indexOf(dsMeta.stack) === -1) ||
          (yScale.options.stacked === undefined && (dsMeta.stack === undefined || stacks.indexOf(dsMeta.stack) === -1)))) {
          stacks.push(dsMeta.stack);
        }
      }

      return stacks.length - 1;
    },

    calculateBarX: function(index, datasetIndex, ruler) {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      var stackIndex = me.getStackIndex(datasetIndex);
      var leftTick = xScale.getPixelForValue(null, index, datasetIndex, me.chart.isCombo);
      leftTick -= me.chart.isCombo ? (ruler.tickWidth / 2) : 0;

      return leftTick +
        (ruler.barWidth / 2) +
        ruler.categorySpacing +
        (ruler.barWidth * stackIndex) +
        (ruler.barSpacing / 2) +
        (ruler.barSpacing * stackIndex);
    },

    calculateBarY: function(index, datasetIndex) {
      var me = this;
      var meta = me.getMeta();
      var yScale = me.getScaleForId(meta.yAxisID);
      var value = Number(me.getDataset().data[index]);

      if (yScale.options.stacked ||
        (yScale.options.stacked === undefined && meta.stack !== undefined)) {
        var base = yScale.getBaseValue();
        var sumPos = base,
          sumNeg = base;

        for (var i = 0; i < datasetIndex; i++) {
          var ds = me.chart.data.datasets[i];
          var dsMeta = me.chart.getDatasetMeta(i);
          if (dsMeta.bar && dsMeta.yAxisID === yScale.id && me.chart.isDatasetVisible(i) &&
            meta.stack === dsMeta.stack) {
            var stackedVal = Number(ds.data[index]);
            if (stackedVal < 0) {
              sumNeg += stackedVal || 0;
            } else {
              sumPos += stackedVal || 0;
            }
          }
        }

        if (value < 0) {
          return yScale.getPixelForValue(sumNeg + value);
        }
        return yScale.getPixelForValue(sumPos + value);
      }

      return yScale.getPixelForValue(value);
    },

    draw: function(ease) {
      var me = this;
      var easingDecimal = ease || 1;
      var metaData = me.getMeta().data;
      var dataset = me.getDataset();
      var i, len;

      Chart.canvasHelpers.clipArea(me.chart.chart.ctx, me.chart.chartArea);
      for (i = 0, len = metaData.length; i < len; ++i) {
        var d = dataset.data[i];
        if (d !== null && d !== undefined && !isNaN(d)) {
          metaData[i].transition(easingDecimal).draw();
        }
      }
      Chart.canvasHelpers.unclipArea(me.chart.chart.ctx);
    },

    setHoverStyle: function(rectangle) {
      var dataset = this.chart.data.datasets[rectangle._datasetIndex];
      var index = rectangle._index;

      var custom = rectangle.custom || {};
      var model = rectangle._model;
      model.backgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor, index, helpers.getHoverColor(model.backgroundColor));
      model.borderColor = custom.hoverBorderColor ? custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor, index, helpers.getHoverColor(model.borderColor));
      model.borderWidth = custom.hoverBorderWidth ? custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth, index, model.borderWidth);
    },

    removeHoverStyle: function(rectangle) {
      var dataset = this.chart.data.datasets[rectangle._datasetIndex];
      var index = rectangle._index;
      var custom = rectangle.custom || {};
      var model = rectangle._model;
      var rectangleElementOptions = this.chart.options.elements.rectangle;

      model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, rectangleElementOptions.backgroundColor);
      model.borderColor = custom.borderColor ? custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, rectangleElementOptions.borderColor);
      model.borderWidth = custom.borderWidth ? custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangleElementOptions.borderWidth);
    }

  });


  // including horizontalBar in the bar file, instead of a file of its own
  // it extends bar (like pie extends doughnut)
  Chart.defaults.horizontalBar = {
    hover: {
      mode: 'label'
    },

    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom'
      }],
      yAxes: [{
        position: 'left',
        type: 'category',

        // Specific to Horizontal Bar Controller
        categoryPercentage: 0.8,
        barPercentage: 0.9,

        // grid line settings
        gridLines: {
          offsetGridLines: true
        }
      }]
    },
    elements: {
      rectangle: {
        borderSkipped: 'left'
      }
    },
    tooltips: {
      callbacks: {
        title: function(tooltipItems, data) {
          // Pick first xLabel for now
          var title = '';

          if (tooltipItems.length > 0) {
            if (tooltipItems[0].yLabel) {
              title = tooltipItems[0].yLabel;
            } else if (data.labels.length > 0 && tooltipItems[0].index < data.labels.length) {
              title = data.labels[tooltipItems[0].index];
            }
          }

          return title;
        },
        label: function(tooltipItem, data) {
          var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
          return datasetLabel + ': ' + tooltipItem.xLabel;
        }
      }
    }
  };

  Chart.controllers.horizontalBar = Chart.controllers.bar.extend({

    // Correctly calculate the bar width accounting for stacks and the fact that not all bars are visible
    getStackCount: function() {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);

      var stacks = [];
      helpers.each(me.chart.data.datasets, function(dataset, datasetIndex) {
        var dsMeta = me.chart.getDatasetMeta(datasetIndex);
        if (dsMeta.bar && me.chart.isDatasetVisible(datasetIndex) &&
          (xScale.options.stacked === false ||
          (xScale.options.stacked === true && stacks.indexOf(dsMeta.stack) === -1) ||
          (xScale.options.stacked === undefined && (dsMeta.stack === undefined || stacks.indexOf(dsMeta.stack) === -1)))) {
          stacks.push(dsMeta.stack);
        }
      }, me);

      return stacks.length;
    },

    updateElement: function(rectangle, index, reset) {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      var yScale = me.getScaleForId(meta.yAxisID);
      var scaleBase = xScale.getBasePixel();
      var custom = rectangle.custom || {};
      var dataset = me.getDataset();
      var rectangleElementOptions = me.chart.options.elements.rectangle;

      rectangle._xScale = xScale;
      rectangle._yScale = yScale;
      rectangle._datasetIndex = me.index;
      rectangle._index = index;

      var ruler = me.getRuler(index); // The index argument for compatible
      rectangle._model = {
        x: reset ? scaleBase : me.calculateBarX(index, me.index),
        y: me.calculateBarY(index, me.index, ruler),

        // Tooltip
        label: me.chart.data.labels[index],
        datasetLabel: dataset.label,

        // Appearance
        horizontal: true,
        base: reset ? scaleBase : me.calculateBarBase(me.index, index),
        height: me.calculateBarHeight(ruler),
        backgroundColor: custom.backgroundColor ? custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.backgroundColor, index, rectangleElementOptions.backgroundColor),
        borderSkipped: custom.borderSkipped ? custom.borderSkipped : rectangleElementOptions.borderSkipped,
        borderColor: custom.borderColor ? custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.borderColor, index, rectangleElementOptions.borderColor),
        borderWidth: custom.borderWidth ? custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.borderWidth, index, rectangleElementOptions.borderWidth)
      };

      rectangle.pivot();
    },

    calculateBarBase: function(datasetIndex, index) {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      var base = xScale.getBaseValue();
      var originalBase = base;

      if (xScale.options.stacked ||
        (xScale.options.stacked === undefined && meta.stack !== undefined)) {
        var chart = me.chart;
        var datasets = chart.data.datasets;
        var value = Number(datasets[datasetIndex].data[index]);

        for (var i = 0; i < datasetIndex; i++) {
          var currentDs = datasets[i];
          var currentDsMeta = chart.getDatasetMeta(i);
          if (currentDsMeta.bar && currentDsMeta.xAxisID === xScale.id && chart.isDatasetVisible(i) &&
            meta.stack === currentDsMeta.stack) {
            var currentVal = Number(currentDs.data[index]);
            base += value < 0 ? Math.min(currentVal, originalBase) : Math.max(currentVal, originalBase);
          }
        }

        return xScale.getPixelForValue(base);
      }

      return xScale.getBasePixel();
    },

    getRuler: function() {
      var me = this;
      var meta = me.getMeta();
      var yScale = me.getScaleForId(meta.yAxisID);
      var stackCount = me.getStackCount();

      var tickHeight = yScale.height / yScale.ticks.length;
      var categoryHeight = tickHeight * yScale.options.categoryPercentage;
      var categorySpacing = (tickHeight - (tickHeight * yScale.options.categoryPercentage)) / 2;
      var fullBarHeight = categoryHeight / stackCount;

      var barHeight = fullBarHeight * yScale.options.barPercentage;
      var barSpacing = fullBarHeight - (fullBarHeight * yScale.options.barPercentage);

      return {
        stackCount: stackCount,
        tickHeight: tickHeight,
        categoryHeight: categoryHeight,
        categorySpacing: categorySpacing,
        fullBarHeight: fullBarHeight,
        barHeight: barHeight,
        barSpacing: barSpacing
      };
    },

    calculateBarHeight: function(ruler) {
      var me = this;
      var meta = me.getMeta();
      var yScale = me.getScaleForId(meta.yAxisID);
      if (yScale.options.barThickness) {
        return yScale.options.barThickness;
      }
      return ruler.barHeight;
    },

    // Get stack index from the given dataset index accounting for stacks and the fact that not all bars are visible
    getStackIndex: function(datasetIndex) {
      var me = this;
      var meta = me.chart.getDatasetMeta(datasetIndex);
      var xScale = me.getScaleForId(meta.xAxisID);
      var dsMeta, j;
      var stacks = [meta.stack];

      for (j = 0; j < datasetIndex; ++j) {
        dsMeta = this.chart.getDatasetMeta(j);
        if (dsMeta.bar && this.chart.isDatasetVisible(j) &&
          (xScale.options.stacked === false ||
          (xScale.options.stacked === true && stacks.indexOf(dsMeta.stack) === -1) ||
          (xScale.options.stacked === undefined && (dsMeta.stack === undefined || stacks.indexOf(dsMeta.stack) === -1)))) {
          stacks.push(dsMeta.stack);
        }
      }

      return stacks.length - 1;
    },

    calculateBarX: function(index, datasetIndex) {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      var value = Number(me.getDataset().data[index]);

      if (xScale.options.stacked ||
        (xScale.options.stacked === undefined && meta.stack !== undefined)) {
        var base = xScale.getBaseValue();
        var sumPos = base,
          sumNeg = base;

        for (var i = 0; i < datasetIndex; i++) {
          var ds = me.chart.data.datasets[i];
          var dsMeta = me.chart.getDatasetMeta(i);
          if (dsMeta.bar && dsMeta.xAxisID === xScale.id && me.chart.isDatasetVisible(i) &&
            meta.stack === dsMeta.stack) {
            var stackedVal = Number(ds.data[index]);
            if (stackedVal < 0) {
              sumNeg += stackedVal || 0;
            } else {
              sumPos += stackedVal || 0;
            }
          }
        }

        if (value < 0) {
          return xScale.getPixelForValue(sumNeg + value);
        }
        return xScale.getPixelForValue(sumPos + value);
      }

      return xScale.getPixelForValue(value);
    },

    calculateBarY: function(index, datasetIndex, ruler) {
      var me = this;
      var meta = me.getMeta();
      var yScale = me.getScaleForId(meta.yAxisID);
      var stackIndex = me.getStackIndex(datasetIndex);
      var topTick = yScale.getPixelForValue(null, index, datasetIndex, me.chart.isCombo);
      topTick -= me.chart.isCombo ? (ruler.tickHeight / 2) : 0;

      return topTick +
        (ruler.barHeight / 2) +
        ruler.categorySpacing +
        (ruler.barHeight * stackIndex) +
        (ruler.barSpacing / 2) +
        (ruler.barSpacing * stackIndex);
    }
  });
};

},{}],16:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.bubble = {
    hover: {
      mode: 'single'
    },

    scales: {
      xAxes: [{
        type: 'linear', // bubble should probably use a linear scale by default
        position: 'bottom',
        id: 'x-axis-0' // need an ID so datasets can reference the scale
      }],
      yAxes: [{
        type: 'linear',
        position: 'left',
        id: 'y-axis-0'
      }]
    },

    tooltips: {
      callbacks: {
        title: function() {
          // Title doesn't make sense for scatter since we format the data as a point
          return '';
        },
        label: function(tooltipItem, data) {
          var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
          var dataPoint = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
          return datasetLabel + ': (' + tooltipItem.xLabel + ', ' + tooltipItem.yLabel + ', ' + dataPoint.r + ')';
        }
      }
    }
  };

  Chart.controllers.bubble = Chart.DatasetController.extend({

    dataElementType: Chart.elements.Point,

    update: function(reset) {
      var me = this;
      var meta = me.getMeta();
      var points = meta.data;

      // Update Points
      helpers.each(points, function(point, index) {
        me.updateElement(point, index, reset);
      });
    },

    updateElement: function(point, index, reset) {
      var me = this;
      var meta = me.getMeta();
      var xScale = me.getScaleForId(meta.xAxisID);
      var yScale = me.getScaleForId(meta.yAxisID);

      var custom = point.custom || {};
      var dataset = me.getDataset();
      var data = dataset.data[index];
      var pointElementOptions = me.chart.options.elements.point;
      var dsIndex = me.index;

      helpers.extend(point, {
        // Utility
        _xScale: xScale,
        _yScale: yScale,
        _datasetIndex: dsIndex,
        _index: index,

        // Desired view properties
        _model: {
          x: reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(typeof data === 'object' ? data : NaN, index, dsIndex, me.chart.isCombo),
          y: reset ? yScale.getBasePixel() : yScale.getPixelForValue(data, index, dsIndex),
          // Appearance
          radius: reset ? 0 : custom.radius ? custom.radius : me.getRadius(data),

          // Tooltip
          hitRadius: custom.hitRadius ? custom.hitRadius : helpers.getValueAtIndexOrDefault(dataset.hitRadius, index, pointElementOptions.hitRadius)
        }
      });

      // Trick to reset the styles of the point
      Chart.DatasetController.prototype.removeHoverStyle.call(me, point, pointElementOptions);

      var model = point._model;
      model.skip = custom.skip ? custom.skip : (isNaN(model.x) || isNaN(model.y));

      point.pivot();
    },

    getRadius: function(value) {
      return value.r || this.chart.options.elements.point.radius;
    },

    setHoverStyle: function(point) {
      var me = this;
      Chart.DatasetController.prototype.setHoverStyle.call(me, point);

      // Radius
      var dataset = me.chart.data.datasets[point._datasetIndex];
      var index = point._index;
      var custom = point.custom || {};
      var model = point._model;
      model.radius = custom.hoverRadius ? custom.hoverRadius : (helpers.getValueAtIndexOrDefault(dataset.hoverRadius, index, me.chart.options.elements.point.hoverRadius)) + me.getRadius(dataset.data[index]);
    },

    removeHoverStyle: function(point) {
      var me = this;
      Chart.DatasetController.prototype.removeHoverStyle.call(me, point, me.chart.options.elements.point);

      var dataVal = me.chart.data.datasets[point._datasetIndex].data[point._index];
      var custom = point.custom || {};
      var model = point._model;

      model.radius = custom.radius ? custom.radius : me.getRadius(dataVal);
    }
  });
};

},{}],17:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers,
    defaults = Chart.defaults;

  defaults.doughnut = {
    animation: {
      // Boolean - Whether we animate the rotation of the Doughnut
      animateRotate: true,
      // Boolean - Whether we animate scaling the Doughnut from the centre
      animateScale: false
    },
    aspectRatio: 1,
    hover: {
      mode: 'single'
    },
    legendCallback: function(chart) {
      var text = [];
      text.push('<ul class="' + chart.id + '-legend">');

      var data = chart.data;
      var datasets = data.datasets;
      var labels = data.labels;

      if (datasets.length) {
        for (var i = 0; i < datasets[0].data.length; ++i) {
          text.push('<li><span style="background-color:' + datasets[0].backgroundColor[i] + '"></span>');
          if (labels[i]) {
            text.push(labels[i]);
          }
          text.push('</li>');
        }
      }

      text.push('</ul>');
      return text.join('');
    },
    legend: {
      labels: {
        generateLabels: function(chart) {
          var data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map(function(label, i) {
              var meta = chart.getDatasetMeta(0);
              var ds = data.datasets[0];
              var arc = meta.data[i];
              var custom = arc && arc.custom || {};
              var getValueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;
              var arcOpts = chart.options.elements.arc;
              var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
              var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
              var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

              return {
                text: label,
                fillStyle: fill,
                strokeStyle: stroke,
                lineWidth: bw,
                hidden: isNaN(ds.data[i]) || meta.data[i].hidden,

                // Extra data used for toggling the correct item
                index: i
              };
            });
          }
          return [];
        }
      },

      onClick: function(e, legendItem) {
        var index = legendItem.index;
        var chart = this.chart;
        var i, ilen, meta;

        for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
          meta = chart.getDatasetMeta(i);
          // toggle visibility of index if exists
          if (meta.data[index]) {
            meta.data[index].hidden = !meta.data[index].hidden;
          }
        }

        chart.update();
      }
    },

    // The percentage of the chart that we cut out of the middle.
    cutoutPercentage: 50,

    // The rotation of the chart, where the first data arc begins.
    rotation: Math.PI * -0.5,

    // The total circumference of the chart.
    circumference: Math.PI * 2.0,

    // Need to override these to give a nice default
    tooltips: {
      callbacks: {
        title: function() {
          return '';
        },
        label: function(tooltipItem, data) {
          var dataLabel = data.labels[tooltipItem.index];
          var value = ': ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

          if (helpers.isArray(dataLabel)) {
            // show value on first line of multiline label
            // need to clone because we are changing the value
            dataLabel = dataLabel.slice();
            dataLabel[0] += value;
          } else {
            dataLabel += value;
          }

          return dataLabel;
        }
      }
    }
  };

  defaults.pie = helpers.clone(defaults.doughnut);
  helpers.extend(defaults.pie, {
    cutoutPercentage: 0
  });


  Chart.controllers.doughnut = Chart.controllers.pie = Chart.DatasetController.extend({

    dataElementType: Chart.elements.Arc,

    linkScales: helpers.noop,

    // Get index of the dataset in relation to the visible datasets. This allows determining the inner and outer radius correctly
    getRingIndex: function(datasetIndex) {
      var ringIndex = 0;

      for (var j = 0; j < datasetIndex; ++j) {
        if (this.chart.isDatasetVisible(j)) {
          ++ringIndex;
        }
      }

      return ringIndex;
    },

    update: function(reset) {
      var me = this;
      var chart = me.chart,
        chartArea = chart.chartArea,
        opts = chart.options,
        arcOpts = opts.elements.arc,
        availableWidth = chartArea.right - chartArea.left - arcOpts.borderWidth,
        availableHeight = chartArea.bottom - chartArea.top - arcOpts.borderWidth,
        minSize = Math.min(availableWidth, availableHeight),
        offset = {
          x: 0,
          y: 0
        },
        meta = me.getMeta(),
        cutoutPercentage = opts.cutoutPercentage,
        circumference = opts.circumference;

      // If the chart's circumference isn't a full circle, calculate minSize as a ratio of the width/height of the arc
      if (circumference < Math.PI * 2.0) {
        var startAngle = opts.rotation % (Math.PI * 2.0);
        startAngle += Math.PI * 2.0 * (startAngle >= Math.PI ? -1 : startAngle < -Math.PI ? 1 : 0);
        var endAngle = startAngle + circumference;
        var start = {x: Math.cos(startAngle), y: Math.sin(startAngle)};
        var end = {x: Math.cos(endAngle), y: Math.sin(endAngle)};
        var contains0 = (startAngle <= 0 && 0 <= endAngle) || (startAngle <= Math.PI * 2.0 && Math.PI * 2.0 <= endAngle);
        var contains90 = (startAngle <= Math.PI * 0.5 && Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 2.5 && Math.PI * 2.5 <= endAngle);
        var contains180 = (startAngle <= -Math.PI && -Math.PI <= endAngle) || (startAngle <= Math.PI && Math.PI <= endAngle);
        var contains270 = (startAngle <= -Math.PI * 0.5 && -Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 1.5 && Math.PI * 1.5 <= endAngle);
        var cutout = cutoutPercentage / 100.0;
        var min = {x: contains180 ? -1 : Math.min(start.x * (start.x < 0 ? 1 : cutout), end.x * (end.x < 0 ? 1 : cutout)), y: contains270 ? -1 : Math.min(start.y * (start.y < 0 ? 1 : cutout), end.y * (end.y < 0 ? 1 : cutout))};
        var max = {x: contains0 ? 1 : Math.max(start.x * (start.x > 0 ? 1 : cutout), end.x * (end.x > 0 ? 1 : cutout)), y: contains90 ? 1 : Math.max(start.y * (start.y > 0 ? 1 : cutout), end.y * (end.y > 0 ? 1 : cutout))};
        var size = {width: (max.x - min.x) * 0.5, height: (max.y - min.y) * 0.5};
        minSize = Math.min(availableWidth / size.width, availableHeight / size.height);
        offset = {x: (max.x + min.x) * -0.5, y: (max.y + min.y) * -0.5};
      }

      chart.borderWidth = me.getMaxBorderWidth(meta.data);
      chart.outerRadius = Math.max((minSize - chart.borderWidth) / 2, 0);
      chart.innerRadius = Math.max(cutoutPercentage ? (chart.outerRadius / 100) * (cutoutPercentage) : 0, 0);
      chart.radiusLength = (chart.outerRadius - chart.innerRadius) / chart.getVisibleDatasetCount();
      chart.offsetX = offset.x * chart.outerRadius;
      chart.offsetY = offset.y * chart.outerRadius;

      meta.total = me.calculateTotal();

      me.outerRadius = chart.outerRadius - (chart.radiusLength * me.getRingIndex(me.index));
      me.innerRadius = Math.max(me.outerRadius - chart.radiusLength, 0);

      helpers.each(meta.data, function(arc, index) {
        me.updateElement(arc, index, reset);
      });
    },

    updateElement: function(arc, index, reset) {
      var me = this;
      var chart = me.chart,
        chartArea = chart.chartArea,
        opts = chart.options,
        animationOpts = opts.animation,
        centerX = (chartArea.left + chartArea.right) / 2,
        centerY = (chartArea.top + chartArea.bottom) / 2,
        startAngle = opts.rotation, // non reset case handled later
        endAngle = opts.rotation, // non reset case handled later
        dataset = me.getDataset(),
        circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : me.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
        innerRadius = reset && animationOpts.animateScale ? 0 : me.innerRadius,
        outerRadius = reset && animationOpts.animateScale ? 0 : me.outerRadius,
        valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

      helpers.extend(arc, {
        // Utility
        _datasetIndex: me.index,
        _index: index,

        // Desired view properties
        _model: {
          x: centerX + chart.offsetX,
          y: centerY + chart.offsetY,
          startAngle: startAngle,
          endAngle: endAngle,
          circumference: circumference,
          outerRadius: outerRadius,
          innerRadius: innerRadius,
          label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
        }
      });

      var model = arc._model;
      // Resets the visual styles
      this.removeHoverStyle(arc);

      // Set correct angles if not resetting
      if (!reset || !animationOpts.animateRotate) {
        if (index === 0) {
          model.startAngle = opts.rotation;
        } else {
          model.startAngle = me.getMeta().data[index - 1]._model.endAngle;
        }

        model.endAngle = model.startAngle + model.circumference;
      }

      arc.pivot();
    },

    removeHoverStyle: function(arc) {
      Chart.DatasetController.prototype.removeHoverStyle.call(this, arc, this.chart.options.elements.arc);
    },

    calculateTotal: function() {
      var dataset = this.getDataset();
      var meta = this.getMeta();
      var total = 0;
      var value;

      helpers.each(meta.data, function(element, index) {
        value = dataset.data[index];
        if (!isNaN(value) && !element.hidden) {
          total += Math.abs(value);
        }
      });

      /* if (total === 0) {
        total = NaN;
      }*/

      return total;
    },

    calculateCircumference: function(value) {
      var total = this.getMeta().total;
      if (total > 0 && !isNaN(value)) {
        return (Math.PI * 2.0) * (value / total);
      }
      return 0;
    },

    // gets the max border or hover width to properly scale pie charts
    getMaxBorderWidth: function(elements) {
      var max = 0,
        index = this.index,
        length = elements.length,
        borderWidth,
        hoverWidth;

      for (var i = 0; i < length; i++) {
        borderWidth = elements[i]._model ? elements[i]._model.borderWidth : 0;
        hoverWidth = elements[i]._chart ? elements[i]._chart.config.data.datasets[index].hoverBorderWidth : 0;

        max = borderWidth > max ? borderWidth : max;
        max = hoverWidth > max ? hoverWidth : max;
      }
      return max;
    }
  });
};

},{}],18:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.line = {
    showLines: true,
    spanGaps: false,

    hover: {
      mode: 'label'
    },

    scales: {
      xAxes: [{
        type: 'category',
        id: 'x-axis-0'
      }],
      yAxes: [{
        type: 'linear',
        id: 'y-axis-0'
      }]
    }
  };

  function lineEnabled(dataset, options) {
    return helpers.getValueOrDefault(dataset.showLine, options.showLines);
  }

  Chart.controllers.line = Chart.DatasetController.extend({

    datasetElementType: Chart.elements.Line,

    dataElementType: Chart.elements.Point,

    update: function(reset) {
      var me = this;
      var meta = me.getMeta();
      var line = meta.dataset;
      var points = meta.data || [];
      var options = me.chart.options;
      var lineElementOptions = options.elements.line;
      var scale = me.getScaleForId(meta.yAxisID);
      var i, ilen, custom;
      var dataset = me.getDataset();
      var showLine = lineEnabled(dataset, options);

      // Update Line
      if (showLine) {
        custom = line.custom || {};

        // Compatibility: If the properties are defined with only the old name, use those values
        if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
          dataset.lineTension = dataset.tension;
        }

        // Utility
        line._scale = scale;
        line._datasetIndex = me.index;
        // Data
        line._children = points;
        // Model
        line._model = {
          // Appearance
          // The default behavior of lines is to break at null values, according
          // to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
          // This option gives lines the ability to span gaps
          spanGaps: dataset.spanGaps ? dataset.spanGaps : options.spanGaps,
          tension: custom.tension ? custom.tension : helpers.getValueOrDefault(dataset.lineTension, lineElementOptions.tension),
          backgroundColor: custom.backgroundColor ? custom.backgroundColor : (dataset.backgroundColor || lineElementOptions.backgroundColor),
          borderWidth: custom.borderWidth ? custom.borderWidth : (dataset.borderWidth || lineElementOptions.borderWidth),
          borderColor: custom.borderColor ? custom.borderColor : (dataset.borderColor || lineElementOptions.borderColor),
          borderCapStyle: custom.borderCapStyle ? custom.borderCapStyle : (dataset.borderCapStyle || lineElementOptions.borderCapStyle),
          borderDash: custom.borderDash ? custom.borderDash : (dataset.borderDash || lineElementOptions.borderDash),
          borderDashOffset: custom.borderDashOffset ? custom.borderDashOffset : (dataset.borderDashOffset || lineElementOptions.borderDashOffset),
          borderJoinStyle: custom.borderJoinStyle ? custom.borderJoinStyle : (dataset.borderJoinStyle || lineElementOptions.borderJoinStyle),
          fill: custom.fill ? custom.fill : (dataset.fill !== undefined ? dataset.fill : lineElementOptions.fill),
          steppedLine: custom.steppedLine ? custom.steppedLine : helpers.getValueOrDefault(dataset.steppedLine, lineElementOptions.stepped),
          cubicInterpolationMode: custom.cubicInterpolationMode ? custom.cubicInterpolationMode : helpers.getValueOrDefault(dataset.cubicInterpolationMode, lineElementOptions.cubicInterpolationMode),
          // Scale
          scaleTop: scale.top,
          scaleBottom: scale.bottom,
          scaleZero: scale.getBasePixel()
        };

        line.pivot();
      }

      // Update Points
      for (i=0, ilen=points.length; i<ilen; ++i) {
        me.updateElement(points[i], i, reset);
      }

      if (showLine && line._model.tension !== 0) {
        me.updateBezierControlPoints();
      }

      // Now pivot the point for animation
      for (i=0, ilen=points.length; i<ilen; ++i) {
        points[i].pivot();
      }
    },

    getPointBackgroundColor: function(point, index) {
      var backgroundColor = this.chart.options.elements.point.backgroundColor;
      var dataset = this.getDataset();
      var custom = point.custom || {};

      if (custom.backgroundColor) {
        backgroundColor = custom.backgroundColor;
      } else if (dataset.pointBackgroundColor) {
        backgroundColor = helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor, index, backgroundColor);
      } else if (dataset.backgroundColor) {
        backgroundColor = dataset.backgroundColor;
      }

      return backgroundColor;
    },

    getPointBorderColor: function(point, index) {
      var borderColor = this.chart.options.elements.point.borderColor;
      var dataset = this.getDataset();
      var custom = point.custom || {};

      if (custom.borderColor) {
        borderColor = custom.borderColor;
      } else if (dataset.pointBorderColor) {
        borderColor = helpers.getValueAtIndexOrDefault(dataset.pointBorderColor, index, borderColor);
      } else if (dataset.borderColor) {
        borderColor = dataset.borderColor;
      }

      return borderColor;
    },

    getPointBorderWidth: function(point, index) {
      var borderWidth = this.chart.options.elements.point.borderWidth;
      var dataset = this.getDataset();
      var custom = point.custom || {};

      if (!isNaN(custom.borderWidth)) {
        borderWidth = custom.borderWidth;
      } else if (!isNaN(dataset.pointBorderWidth)) {
        borderWidth = helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, borderWidth);
      } else if (!isNaN(dataset.borderWidth)) {
        borderWidth = dataset.borderWidth;
      }

      return borderWidth;
    },

    updateElement: function(point, index, reset) {
      var me = this;
      var meta = me.getMeta();
      var custom = point.custom || {};
      var dataset = me.getDataset();
      var datasetIndex = me.index;
      var value = dataset.data[index];
      var yScale = me.getScaleForId(meta.yAxisID);
      var xScale = me.getScaleForId(meta.xAxisID);
      var pointOptions = me.chart.options.elements.point;
      var x, y;
      var labels = me.chart.data.labels || [];
      var includeOffset = (labels.length === 1 || dataset.data.length === 1) || me.chart.isCombo;

      // Compatibility: If the properties are defined with only the old name, use those values
      if ((dataset.radius !== undefined) && (dataset.pointRadius === undefined)) {
        dataset.pointRadius = dataset.radius;
      }
      if ((dataset.hitRadius !== undefined) && (dataset.pointHitRadius === undefined)) {
        dataset.pointHitRadius = dataset.hitRadius;
      }

      x = xScale.getPixelForValue(typeof value === 'object' ? value : NaN, index, datasetIndex, includeOffset);
      y = reset ? yScale.getBasePixel() : me.calculatePointY(value, index, datasetIndex);

      // Utility
      point._xScale = xScale;
      point._yScale = yScale;
      point._datasetIndex = datasetIndex;
      point._index = index;

      // Desired view properties
      point._model = {
        x: x,
        y: y,
        skip: custom.skip || isNaN(x) || isNaN(y),
        // Appearance
        radius: custom.radius || helpers.getValueAtIndexOrDefault(dataset.pointRadius, index, pointOptions.radius),
        pointStyle: custom.pointStyle || helpers.getValueAtIndexOrDefault(dataset.pointStyle, index, pointOptions.pointStyle),
        backgroundColor: me.getPointBackgroundColor(point, index),
        borderColor: me.getPointBorderColor(point, index),
        borderWidth: me.getPointBorderWidth(point, index),
        tension: meta.dataset._model ? meta.dataset._model.tension : 0,
        steppedLine: meta.dataset._model ? meta.dataset._model.steppedLine : false,
        // Tooltip
        hitRadius: custom.hitRadius || helpers.getValueAtIndexOrDefault(dataset.pointHitRadius, index, pointOptions.hitRadius)
      };
    },

    calculatePointY: function(value, index, datasetIndex) {
      var me = this;
      var chart = me.chart;
      var meta = me.getMeta();
      var yScale = me.getScaleForId(meta.yAxisID);
      var sumPos = 0;
      var sumNeg = 0;
      var i, ds, dsMeta;

      if (yScale.options.stacked) {
        for (i = 0; i < datasetIndex; i++) {
          ds = chart.data.datasets[i];
          dsMeta = chart.getDatasetMeta(i);
          if (dsMeta.type === 'line' && dsMeta.yAxisID === yScale.id && chart.isDatasetVisible(i)) {
            var stackedRightValue = Number(yScale.getRightValue(ds.data[index]));
            if (stackedRightValue < 0) {
              sumNeg += stackedRightValue || 0;
            } else {
              sumPos += stackedRightValue || 0;
            }
          }
        }

        var rightValue = Number(yScale.getRightValue(value));
        if (rightValue < 0) {
          return yScale.getPixelForValue(sumNeg + rightValue);
        }
        return yScale.getPixelForValue(sumPos + rightValue);
      }

      return yScale.getPixelForValue(value);
    },

    updateBezierControlPoints: function() {
      var me = this;
      var meta = me.getMeta();
      var area = me.chart.chartArea;
      var points = (meta.data || []);
      var i, ilen, point, model, controlPoints;

      // Only consider points that are drawn in case the spanGaps option is used
      if (meta.dataset._model.spanGaps) {
        points = points.filter(function(pt) {
          return !pt._model.skip;
        });
      }

      function capControlPoint(pt, min, max) {
        return Math.max(Math.min(pt, max), min);
      }

      if (meta.dataset._model.cubicInterpolationMode === 'monotone') {
        helpers.splineCurveMonotone(points);
      } else {
        for (i = 0, ilen = points.length; i < ilen; ++i) {
          point = points[i];
          model = point._model;
          controlPoints = helpers.splineCurve(
            helpers.previousItem(points, i)._model,
            model,
            helpers.nextItem(points, i)._model,
            meta.dataset._model.tension
          );
          model.controlPointPreviousX = controlPoints.previous.x;
          model.controlPointPreviousY = controlPoints.previous.y;
          model.controlPointNextX = controlPoints.next.x;
          model.controlPointNextY = controlPoints.next.y;
        }
      }

      if (me.chart.options.elements.line.capBezierPoints) {
        for (i = 0, ilen = points.length; i < ilen; ++i) {
          model = points[i]._model;
          model.controlPointPreviousX = capControlPoint(model.controlPointPreviousX, area.left, area.right);
          model.controlPointPreviousY = capControlPoint(model.controlPointPreviousY, area.top, area.bottom);
          model.controlPointNextX = capControlPoint(model.controlPointNextX, area.left, area.right);
          model.controlPointNextY = capControlPoint(model.controlPointNextY, area.top, area.bottom);
        }
      }
    },

    draw: function(ease) {
      var me = this;
      var meta = me.getMeta();
      var points = meta.data || [];
      var easingDecimal = ease || 1;
      var i, ilen;

      // Transition Point Locations
      for (i=0, ilen=points.length; i<ilen; ++i) {
        points[i].transition(easingDecimal);
      }

      Chart.canvasHelpers.clipArea(me.chart.chart.ctx, me.chart.chartArea);
      // Transition and Draw the line
      if (lineEnabled(me.getDataset(), me.chart.options)) {
        meta.dataset.transition(easingDecimal).draw();
      }
      Chart.canvasHelpers.unclipArea(me.chart.chart.ctx);

      // Draw the points
      for (i=0, ilen=points.length; i<ilen; ++i) {
        points[i].draw(me.chart.chartArea);
      }
    },

    setHoverStyle: function(point) {
      // Point
      var dataset = this.chart.data.datasets[point._datasetIndex];
      var index = point._index;
      var custom = point.custom || {};
      var model = point._model;

      model.radius = custom.hoverRadius || helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
      model.backgroundColor = custom.hoverBackgroundColor || helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.getHoverColor(model.backgroundColor));
      model.borderColor = custom.hoverBorderColor || helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.getHoverColor(model.borderColor));
      model.borderWidth = custom.hoverBorderWidth || helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderWidth, index, model.borderWidth);
    },

    removeHoverStyle: function(point) {
      var me = this;
      var dataset = me.chart.data.datasets[point._datasetIndex];
      var index = point._index;
      var custom = point.custom || {};
      var model = point._model;

      // Compatibility: If the properties are defined with only the old name, use those values
      if ((dataset.radius !== undefined) && (dataset.pointRadius === undefined)) {
        dataset.pointRadius = dataset.radius;
      }

      model.radius = custom.radius || helpers.getValueAtIndexOrDefault(dataset.pointRadius, index, me.chart.options.elements.point.radius);
      model.backgroundColor = me.getPointBackgroundColor(point, index);
      model.borderColor = me.getPointBorderColor(point, index);
      model.borderWidth = me.getPointBorderWidth(point, index);
    }
  });
};

},{}],19:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.polarArea = {

    scale: {
      type: 'radialLinear',
      lineArc: true, // so that lines are circular
      ticks: {
        beginAtZero: true
      }
    },

    // Boolean - Whether to animate the rotation of the chart
    animation: {
      animateRotate: true,
      animateScale: true
    },

    startAngle: -0.5 * Math.PI,
    aspectRatio: 1,
    legendCallback: function(chart) {
      var text = [];
      text.push('<ul class="' + chart.id + '-legend">');

      var data = chart.data;
      var datasets = data.datasets;
      var labels = data.labels;

      if (datasets.length) {
        for (var i = 0; i < datasets[0].data.length; ++i) {
          text.push('<li><span style="background-color:' + datasets[0].backgroundColor[i] + '"></span>');
          if (labels[i]) {
            text.push(labels[i]);
          }
          text.push('</li>');
        }
      }

      text.push('</ul>');
      return text.join('');
    },
    legend: {
      labels: {
        generateLabels: function(chart) {
          var data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map(function(label, i) {
              var meta = chart.getDatasetMeta(0);
              var ds = data.datasets[0];
              var arc = meta.data[i];
              var custom = arc.custom || {};
              var getValueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;
              var arcOpts = chart.options.elements.arc;
              var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
              var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
              var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

              return {
                text: label,
                fillStyle: fill,
                strokeStyle: stroke,
                lineWidth: bw,
                hidden: isNaN(ds.data[i]) || meta.data[i].hidden,

                // Extra data used for toggling the correct item
                index: i
              };
            });
          }
          return [];
        }
      },

      onClick: function(e, legendItem) {
        var index = legendItem.index;
        var chart = this.chart;
        var i, ilen, meta;

        for (i = 0, ilen = (chart.data.datasets || []).length; i < ilen; ++i) {
          meta = chart.getDatasetMeta(i);
          meta.data[index].hidden = !meta.data[index].hidden;
        }

        chart.update();
      }
    },

    // Need to override these to give a nice default
    tooltips: {
      callbacks: {
        title: function() {
          return '';
        },
        label: function(tooltipItem, data) {
          return data.labels[tooltipItem.index] + ': ' + tooltipItem.yLabel;
        }
      }
    }
  };

  Chart.controllers.polarArea = Chart.DatasetController.extend({

    dataElementType: Chart.elements.Arc,

    linkScales: helpers.noop,

    update: function(reset) {
      var me = this;
      var chart = me.chart;
      var chartArea = chart.chartArea;
      var meta = me.getMeta();
      var opts = chart.options;
      var arcOpts = opts.elements.arc;
      var minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      chart.outerRadius = Math.max((minSize - arcOpts.borderWidth / 2) / 2, 0);
      chart.innerRadius = Math.max(opts.cutoutPercentage ? (chart.outerRadius / 100) * (opts.cutoutPercentage) : 1, 0);
      chart.radiusLength = (chart.outerRadius - chart.innerRadius) / chart.getVisibleDatasetCount();

      me.outerRadius = chart.outerRadius - (chart.radiusLength * me.index);
      me.innerRadius = me.outerRadius - chart.radiusLength;

      meta.count = me.countVisibleElements();

      helpers.each(meta.data, function(arc, index) {
        me.updateElement(arc, index, reset);
      });
    },

    updateElement: function(arc, index, reset) {
      var me = this;
      var chart = me.chart;
      var dataset = me.getDataset();
      var opts = chart.options;
      var animationOpts = opts.animation;
      var scale = chart.scale;
      var getValueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;
      var labels = chart.data.labels;

      var circumference = me.calculateCircumference(dataset.data[index]);
      var centerX = scale.xCenter;
      var centerY = scale.yCenter;

      // If there is NaN data before us, we need to calculate the starting angle correctly.
      // We could be way more efficient here, but its unlikely that the polar area chart will have a lot of data
      var visibleCount = 0;
      var meta = me.getMeta();
      for (var i = 0; i < index; ++i) {
        if (!isNaN(dataset.data[i]) && !meta.data[i].hidden) {
          ++visibleCount;
        }
      }

      // var negHalfPI = -0.5 * Math.PI;
      var datasetStartAngle = opts.startAngle;
      var distance = arc.hidden ? 0 : scale.getDistanceFromCenterForValue(dataset.data[index]);
      var startAngle = datasetStartAngle + (circumference * visibleCount);
      var endAngle = startAngle + (arc.hidden ? 0 : circumference);

      var resetRadius = animationOpts.animateScale ? 0 : scale.getDistanceFromCenterForValue(dataset.data[index]);

      helpers.extend(arc, {
        // Utility
        _datasetIndex: me.index,
        _index: index,
        _scale: scale,

        // Desired view properties
        _model: {
          x: centerX,
          y: centerY,
          innerRadius: 0,
          outerRadius: reset ? resetRadius : distance,
          startAngle: reset && animationOpts.animateRotate ? datasetStartAngle : startAngle,
          endAngle: reset && animationOpts.animateRotate ? datasetStartAngle : endAngle,
          label: getValueAtIndexOrDefault(labels, index, labels[index])
        }
      });

      // Apply border and fill style
      me.removeHoverStyle(arc);

      arc.pivot();
    },

    removeHoverStyle: function(arc) {
      Chart.DatasetController.prototype.removeHoverStyle.call(this, arc, this.chart.options.elements.arc);
    },

    countVisibleElements: function() {
      var dataset = this.getDataset();
      var meta = this.getMeta();
      var count = 0;

      helpers.each(meta.data, function(element, index) {
        if (!isNaN(dataset.data[index]) && !element.hidden) {
          count++;
        }
      });

      return count;
    },

    calculateCircumference: function(value) {
      var count = this.getMeta().count;
      if (count > 0 && !isNaN(value)) {
        return (2 * Math.PI) / count;
      }
      return 0;
    }
  });
};

},{}],20:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.radar = {
    aspectRatio: 1,
    scale: {
      type: 'radialLinear'
    },
    elements: {
      line: {
        tension: 0 // no bezier in radar
      }
    }
  };

  Chart.controllers.radar = Chart.DatasetController.extend({

    datasetElementType: Chart.elements.Line,

    dataElementType: Chart.elements.Point,

    linkScales: helpers.noop,

    update: function(reset) {
      var me = this;
      var meta = me.getMeta();
      var line = meta.dataset;
      var points = meta.data;
      var custom = line.custom || {};
      var dataset = me.getDataset();
      var lineElementOptions = me.chart.options.elements.line;
      var scale = me.chart.scale;

      // Compatibility: If the properties are defined with only the old name, use those values
      if ((dataset.tension !== undefined) && (dataset.lineTension === undefined)) {
        dataset.lineTension = dataset.tension;
      }

      helpers.extend(meta.dataset, {
        // Utility
        _datasetIndex: me.index,
        // Data
        _children: points,
        _loop: true,
        // Model
        _model: {
          // Appearance
          tension: custom.tension ? custom.tension : helpers.getValueOrDefault(dataset.lineTension, lineElementOptions.tension),
          backgroundColor: custom.backgroundColor ? custom.backgroundColor : (dataset.backgroundColor || lineElementOptions.backgroundColor),
          borderWidth: custom.borderWidth ? custom.borderWidth : (dataset.borderWidth || lineElementOptions.borderWidth),
          borderColor: custom.borderColor ? custom.borderColor : (dataset.borderColor || lineElementOptions.borderColor),
          fill: custom.fill ? custom.fill : (dataset.fill !== undefined ? dataset.fill : lineElementOptions.fill),
          borderCapStyle: custom.borderCapStyle ? custom.borderCapStyle : (dataset.borderCapStyle || lineElementOptions.borderCapStyle),
          borderDash: custom.borderDash ? custom.borderDash : (dataset.borderDash || lineElementOptions.borderDash),
          borderDashOffset: custom.borderDashOffset ? custom.borderDashOffset : (dataset.borderDashOffset || lineElementOptions.borderDashOffset),
          borderJoinStyle: custom.borderJoinStyle ? custom.borderJoinStyle : (dataset.borderJoinStyle || lineElementOptions.borderJoinStyle),

          // Scale
          scaleTop: scale.top,
          scaleBottom: scale.bottom,
          scaleZero: scale.getBasePosition()
        }
      });

      meta.dataset.pivot();

      // Update Points
      helpers.each(points, function(point, index) {
        me.updateElement(point, index, reset);
      }, me);

      // Update bezier control points
      me.updateBezierControlPoints();
    },
    updateElement: function(point, index, reset) {
      var me = this;
      var custom = point.custom || {};
      var dataset = me.getDataset();
      var scale = me.chart.scale;
      var pointElementOptions = me.chart.options.elements.point;
      var pointPosition = scale.getPointPositionForValue(index, dataset.data[index]);

      helpers.extend(point, {
        // Utility
        _datasetIndex: me.index,
        _index: index,
        _scale: scale,

        // Desired view properties
        _model: {
          x: reset ? scale.xCenter : pointPosition.x, // value not used in dataset scale, but we want a consistent API between scales
          y: reset ? scale.yCenter : pointPosition.y,

          // Appearance
          tension: custom.tension ? custom.tension : helpers.getValueOrDefault(dataset.lineTension, me.chart.options.elements.line.tension),
          radius: custom.radius ? custom.radius : helpers.getValueAtIndexOrDefault(dataset.pointRadius, index, pointElementOptions.radius),
          backgroundColor: custom.backgroundColor ? custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor, index, pointElementOptions.backgroundColor),
          borderColor: custom.borderColor ? custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.pointBorderColor, index, pointElementOptions.borderColor),
          borderWidth: custom.borderWidth ? custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, pointElementOptions.borderWidth),
          pointStyle: custom.pointStyle ? custom.pointStyle : helpers.getValueAtIndexOrDefault(dataset.pointStyle, index, pointElementOptions.pointStyle),

          // Tooltip
          hitRadius: custom.hitRadius ? custom.hitRadius : helpers.getValueAtIndexOrDefault(dataset.hitRadius, index, pointElementOptions.hitRadius)
        }
      });

      point._model.skip = custom.skip ? custom.skip : (isNaN(point._model.x) || isNaN(point._model.y));
    },
    updateBezierControlPoints: function() {
      var chartArea = this.chart.chartArea;
      var meta = this.getMeta();

      helpers.each(meta.data, function(point, index) {
        var model = point._model;
        var controlPoints = helpers.splineCurve(
          helpers.previousItem(meta.data, index, true)._model,
          model,
          helpers.nextItem(meta.data, index, true)._model,
          model.tension
        );

        // Prevent the bezier going outside of the bounds of the graph
        model.controlPointPreviousX = Math.max(Math.min(controlPoints.previous.x, chartArea.right), chartArea.left);
        model.controlPointPreviousY = Math.max(Math.min(controlPoints.previous.y, chartArea.bottom), chartArea.top);

        model.controlPointNextX = Math.max(Math.min(controlPoints.next.x, chartArea.right), chartArea.left);
        model.controlPointNextY = Math.max(Math.min(controlPoints.next.y, chartArea.bottom), chartArea.top);

        // Now pivot the point for animation
        point.pivot();
      });
    },

    draw: function(ease) {
      var meta = this.getMeta();
      var easingDecimal = ease || 1;

      // Transition Point Locations
      helpers.each(meta.data, function(point) {
        point.transition(easingDecimal);
      });

      // Transition and Draw the line
      meta.dataset.transition(easingDecimal).draw();

      // Draw the points
      helpers.each(meta.data, function(point) {
        point.draw();
      });
    },

    setHoverStyle: function(point) {
      // Point
      var dataset = this.chart.data.datasets[point._datasetIndex];
      var custom = point.custom || {};
      var index = point._index;
      var model = point._model;

      model.radius = custom.hoverRadius ? custom.hoverRadius : helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius, index, this.chart.options.elements.point.hoverRadius);
      model.backgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor, index, helpers.getHoverColor(model.backgroundColor));
      model.borderColor = custom.hoverBorderColor ? custom.hoverBorderColor : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor, index, helpers.getHoverColor(model.borderColor));
      model.borderWidth = custom.hoverBorderWidth ? custom.hoverBorderWidth : helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderWidth, index, model.borderWidth);
    },

    removeHoverStyle: function(point) {
      var dataset = this.chart.data.datasets[point._datasetIndex];
      var custom = point.custom || {};
      var index = point._index;
      var model = point._model;
      var pointElementOptions = this.chart.options.elements.point;

      model.radius = custom.radius ? custom.radius : helpers.getValueAtIndexOrDefault(dataset.radius, index, pointElementOptions.radius);
      model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor, index, pointElementOptions.backgroundColor);
      model.borderColor = custom.borderColor ? custom.borderColor : helpers.getValueAtIndexOrDefault(dataset.pointBorderColor, index, pointElementOptions.borderColor);
      model.borderWidth = custom.borderWidth ? custom.borderWidth : helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth, index, pointElementOptions.borderWidth);
    }
  });
};

},{}],21:[function(require,module,exports){
/* global window: false */
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.global.animation = {
    duration: 1000,
    easing: 'easeOutQuart',
    onProgress: helpers.noop,
    onComplete: helpers.noop
  };

  Chart.Animation = Chart.Element.extend({
    currentStep: null, // the current animation step
    numSteps: 60, // default number of steps
    easing: '', // the easing to use for this animation
    render: null, // render function used by the animation service

    onAnimationProgress: null, // user specified callback to fire on each step of the animation
    onAnimationComplete: null // user specified callback to fire when the animation finishes
  });

  Chart.animationService = {
    frameDuration: 17,
    animations: [],
    dropFrames: 0,
    request: null,

    /**
     * @function Chart.animationService.addAnimation
     * @param chartInstance {ChartController} the chart to animate
     * @param animationObject {IAnimation} the animation that we will animate
     * @param duration {Number} length of animation in ms
     * @param lazy {Boolean} if true, the chart is not marked as animating to enable more responsive interactions
     */
    addAnimation: function(chartInstance, animationObject, duration, lazy) {
      var me = this;

      if (!lazy) {
        chartInstance.animating = true;
      }

      for (var index = 0; index < me.animations.length; ++index) {
        if (me.animations[index].chartInstance === chartInstance) {
          // replacing an in progress animation
          me.animations[index].animationObject = animationObject;
          return;
        }
      }

      me.animations.push({
        chartInstance: chartInstance,
        animationObject: animationObject
      });

      // If there are no animations queued, manually kickstart a digest, for lack of a better word
      if (me.animations.length === 1) {
        me.requestAnimationFrame();
      }
    },
    // Cancel the animation for a given chart instance
    cancelAnimation: function(chartInstance) {
      var index = helpers.findIndex(this.animations, function(animationWrapper) {
        return animationWrapper.chartInstance === chartInstance;
      });

      if (index !== -1) {
        this.animations.splice(index, 1);
        chartInstance.animating = false;
      }
    },
    requestAnimationFrame: function() {
      var me = this;
      if (me.request === null) {
        // Skip animation frame requests until the active one is executed.
        // This can happen when processing mouse events, e.g. 'mousemove'
        // and 'mouseout' events will trigger multiple renders.
        me.request = helpers.requestAnimFrame.call(window, function() {
          me.request = null;
          me.startDigest();
        });
      }
    },
    startDigest: function() {
      var me = this;

      var startTime = Date.now();
      var framesToDrop = 0;

      if (me.dropFrames > 1) {
        framesToDrop = Math.floor(me.dropFrames);
        me.dropFrames = me.dropFrames % 1;
      }

      var i = 0;
      while (i < me.animations.length) {
        if (me.animations[i].animationObject.currentStep === null) {
          me.animations[i].animationObject.currentStep = 0;
        }

        me.animations[i].animationObject.currentStep += 1 + framesToDrop;

        if (me.animations[i].animationObject.currentStep > me.animations[i].animationObject.numSteps) {
          me.animations[i].animationObject.currentStep = me.animations[i].animationObject.numSteps;
        }

        me.animations[i].animationObject.render(me.animations[i].chartInstance, me.animations[i].animationObject);
        if (me.animations[i].animationObject.onAnimationProgress && me.animations[i].animationObject.onAnimationProgress.call) {
          me.animations[i].animationObject.onAnimationProgress.call(me.animations[i].chartInstance, me.animations[i]);
        }

        if (me.animations[i].animationObject.currentStep === me.animations[i].animationObject.numSteps) {
          if (me.animations[i].animationObject.onAnimationComplete && me.animations[i].animationObject.onAnimationComplete.call) {
            me.animations[i].animationObject.onAnimationComplete.call(me.animations[i].chartInstance, me.animations[i]);
          }

          // executed the last frame. Remove the animation.
          me.animations[i].chartInstance.animating = false;

          me.animations.splice(i, 1);
        } else {
          ++i;
        }
      }

      var endTime = Date.now();
      var dropFrames = (endTime - startTime) / me.frameDuration;

      me.dropFrames += dropFrames;

      // Do we have more stuff to animate?
      if (me.animations.length > 0) {
        me.requestAnimationFrame();
      }
    }
  };
};

},{}],22:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {
  // Global Chart canvas helpers object for drawing items to canvas
  var helpers = Chart.canvasHelpers = {};

  helpers.drawPoint = function(ctx, pointStyle, radius, x, y) {
    var type, edgeLength, xOffset, yOffset, height, size;

    if (typeof pointStyle === 'object') {
      type = pointStyle.toString();
      if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
        ctx.drawImage(pointStyle, x - pointStyle.width / 2, y - pointStyle.height / 2);
        return;
      }
    }

    if (isNaN(radius) || radius <= 0) {
      return;
    }

    switch (pointStyle) {
    // Default includes circle
    default:
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      edgeLength = 3 * radius / Math.sqrt(3);
      height = edgeLength * Math.sqrt(3) / 2;
      ctx.moveTo(x - edgeLength / 2, y + height / 3);
      ctx.lineTo(x + edgeLength / 2, y + height / 3);
      ctx.lineTo(x, y - 2 * height / 3);
      ctx.closePath();
      ctx.fill();
      break;
    case 'rect':
      size = 1 / Math.SQRT2 * radius;
      ctx.beginPath();
      ctx.fillRect(x - size, y - size, 2 * size, 2 * size);
      ctx.strokeRect(x - size, y - size, 2 * size, 2 * size);
      break;
    case 'rectRounded':
      var offset = radius / Math.SQRT2;
      var leftX = x - offset;
      var topY = y - offset;
      var sideSize = Math.SQRT2 * radius;
      Chart.helpers.drawRoundedRectangle(ctx, leftX, topY, sideSize, sideSize, radius / 2);
      ctx.fill();
      break;
    case 'rectRot':
      size = 1 / Math.SQRT2 * radius;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y - size);
      ctx.closePath();
      ctx.fill();
      break;
    case 'cross':
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y - radius);
      ctx.moveTo(x - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.closePath();
      break;
    case 'crossRot':
      ctx.beginPath();
      xOffset = Math.cos(Math.PI / 4) * radius;
      yOffset = Math.sin(Math.PI / 4) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x - xOffset, y + yOffset);
      ctx.lineTo(x + xOffset, y - yOffset);
      ctx.closePath();
      break;
    case 'star':
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y - radius);
      ctx.moveTo(x - radius, y);
      ctx.lineTo(x + radius, y);
      xOffset = Math.cos(Math.PI / 4) * radius;
      yOffset = Math.sin(Math.PI / 4) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      ctx.moveTo(x - xOffset, y + yOffset);
      ctx.lineTo(x + xOffset, y - yOffset);
      ctx.closePath();
      break;
    case 'line':
      ctx.beginPath();
      ctx.moveTo(x - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.closePath();
      break;
    case 'dash':
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + radius, y);
      ctx.closePath();
      break;
    }

    ctx.stroke();
  };

  helpers.clipArea = function(ctx, clipArea) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(clipArea.left, clipArea.top, clipArea.right - clipArea.left, clipArea.bottom - clipArea.top);
    ctx.clip();
  };

  helpers.unclipArea = function(ctx) {
    ctx.restore();
  };

};

},{}],23:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;
  var plugins = Chart.plugins;
  var platform = Chart.platform;

  // Create a dictionary of chart types, to allow for extension of existing types
  Chart.types = {};

  // Store a reference to each instance - allowing us to globally resize chart instances on window resize.
  // Destroy method on the chart will remove the instance of the chart from this reference.
  Chart.instances = {};

  // Controllers available for dataset visualization eg. bar, line, slice, etc.
  Chart.controllers = {};

  /**
   * Initializes the given config with global and chart default values.
   */
  function initConfig(config) {
    config = config || {};

    // Do NOT use configMerge() for the data object because this method merges arrays
    // and so would change references to labels and datasets, preventing data updates.
    var data = config.data = config.data || {};
    data.datasets = data.datasets || [];
    data.labels = data.labels || [];

    config.options = helpers.configMerge(
      Chart.defaults.global,
      Chart.defaults[config.type],
      config.options || {});

    return config;
  }

  /**
   * Updates the config of the chart
   * @param chart {Chart.Controller} chart to update the options for
   */
  function updateConfig(chart) {
    var newOptions = chart.options;

    // Update Scale(s) with options
    if (newOptions.scale) {
      chart.scale.options = newOptions.scale;
    } else if (newOptions.scales) {
      newOptions.scales.xAxes.concat(newOptions.scales.yAxes).forEach(function(scaleOptions) {
        chart.scales[scaleOptions.id].options = scaleOptions;
      });
    }

    // Tooltip
    chart.tooltip._options = newOptions.tooltips;
  }

  /**
   * @class Chart.Controller
   * The main controller of a chart.
   */
  Chart.Controller = function(item, config, instance) {
    var me = this;

    config = initConfig(config);

    var context = platform.acquireContext(item, config);
    var canvas = context && context.canvas;
    var height = canvas && canvas.height;
    var width = canvas && canvas.width;

    instance.ctx = context;
    instance.canvas = canvas;
    instance.config = config;
    instance.width = width;
    instance.height = height;
    instance.aspectRatio = height? width / height : null;

    me.id = helpers.uid();
    me.chart = instance;
    me.config = config;
    me.options = config.options;
    me._bufferedRender = false;

    // Add the chart instance to the global namespace
    Chart.instances[me.id] = me;

    Object.defineProperty(me, 'data', {
      get: function() {
        return me.config.data;
      }
    });

    if (!context || !canvas) {
      // The given item is not a compatible context2d element, let's return before finalizing
      // the chart initialization but after setting basic chart / controller properties that
      // can help to figure out that the chart is not valid (e.g chart.canvas !== null);
      // https://github.com/chartjs/Chart.js/issues/2807
      console.error("Failed to create chart: can't acquire context from the given item");
      return me;
    }

    me.initialize();
    me.update();

    return me;
  };

  helpers.extend(Chart.Controller.prototype, /** @lends Chart.Controller.prototype */ {
    initialize: function() {
      var me = this;

      // Before init plugin notification
      plugins.notify(me, 'beforeInit');

      helpers.retinaScale(me.chart);

      me.bindEvents();

      if (me.options.responsive) {
        // Initial resize before chart draws (must be silent to preserve initial animations).
        me.resize(true);
      }

      // Make sure scales have IDs and are built before we build any controllers.
      me.ensureScalesHaveIDs();
      me.buildScales();
      me.initToolTip();

      // After init plugin notification
      plugins.notify(me, 'afterInit');

      return me;
    },

    clear: function() {
      helpers.clear(this.chart);
      return this;
    },

    stop: function() {
      // Stops any current animation loop occurring
      Chart.animationService.cancelAnimation(this);
      return this;
    },

    resize: function(silent) {
      var me = this;
      var chart = me.chart;
      var options = me.options;
      var canvas = chart.canvas;
      var aspectRatio = (options.maintainAspectRatio && chart.aspectRatio) || null;

      // the canvas render width and height will be casted to integers so make sure that
      // the canvas display style uses the same integer values to avoid blurring effect.
      var newWidth = Math.floor(helpers.getMaximumWidth(canvas));
      var newHeight = Math.floor(aspectRatio? newWidth / aspectRatio : helpers.getMaximumHeight(canvas));

      if (chart.width === newWidth && chart.height === newHeight) {
        return;
      }

      canvas.width = chart.width = newWidth;
      canvas.height = chart.height = newHeight;
      canvas.style.width = newWidth + 'px';
      canvas.style.height = newHeight + 'px';

      helpers.retinaScale(chart);

      if (!silent) {
        // Notify any plugins about the resize
        var newSize = {width: newWidth, height: newHeight};
        plugins.notify(me, 'resize', [newSize]);

        // Notify of resize
        if (me.options.onResize) {
          me.options.onResize(me, newSize);
        }

        me.stop();
        me.update(me.options.responsiveAnimationDuration);
      }
    },

    ensureScalesHaveIDs: function() {
      var options = this.options;
      var scalesOptions = options.scales || {};
      var scaleOptions = options.scale;

      helpers.each(scalesOptions.xAxes, function(xAxisOptions, index) {
        xAxisOptions.id = xAxisOptions.id || ('x-axis-' + index);
      });

      helpers.each(scalesOptions.yAxes, function(yAxisOptions, index) {
        yAxisOptions.id = yAxisOptions.id || ('y-axis-' + index);
      });

      if (scaleOptions) {
        scaleOptions.id = scaleOptions.id || 'scale';
      }
    },

    /**
     * Builds a map of scale ID to scale object for future lookup.
     */
    buildScales: function() {
      var me = this;
      var options = me.options;
      var scales = me.scales = {};
      var items = [];

      if (options.scales) {
        items = items.concat(
          (options.scales.xAxes || []).map(function(xAxisOptions) {
            return {options: xAxisOptions, dtype: 'category'};
          }),
          (options.scales.yAxes || []).map(function(yAxisOptions) {
            return {options: yAxisOptions, dtype: 'linear'};
          })
        );
      }

      if (options.scale) {
        items.push({options: options.scale, dtype: 'radialLinear', isDefault: true});
      }

      helpers.each(items, function(item) {
        var scaleOptions = item.options;
        var scaleType = helpers.getValueOrDefault(scaleOptions.type, item.dtype);
        var scaleClass = Chart.scaleService.getScaleConstructor(scaleType);
        if (!scaleClass) {
          return;
        }

        var scale = new scaleClass({
          id: scaleOptions.id,
          options: scaleOptions,
          ctx: me.chart.ctx,
          chart: me
        });

        scales[scale.id] = scale;

        // TODO(SB): I think we should be able to remove this custom case (options.scale)
        // and consider it as a regular scale part of the "scales"" map only! This would
        // make the logic easier and remove some useless? custom code.
        if (item.isDefault) {
          me.scale = scale;
        }
      });

      Chart.scaleService.addScalesToLayout(this);
    },

    buildOrUpdateControllers: function() {
      var me = this;
      var types = [];
      var newControllers = [];

      helpers.each(me.data.datasets, function(dataset, datasetIndex) {
        var meta = me.getDatasetMeta(datasetIndex);
        if (!meta.type) {
          meta.type = dataset.type || me.config.type;
        }

        types.push(meta.type);

        if (meta.controller) {
          meta.controller.updateIndex(datasetIndex);
        } else {
          meta.controller = new Chart.controllers[meta.type](me, datasetIndex);
          newControllers.push(meta.controller);
        }
      }, me);

      if (types.length > 1) {
        for (var i = 1; i < types.length; i++) {
          if (types[i] !== types[i - 1]) {
            me.isCombo = true;
            break;
          }
        }
      }

      return newControllers;
    },

    /**
     * Reset the elements of all datasets
     * @private
     */
    resetElements: function() {
      var me = this;
      helpers.each(me.data.datasets, function(dataset, datasetIndex) {
        me.getDatasetMeta(datasetIndex).controller.reset();
      }, me);
    },

    /**
    * Resets the chart back to it's state before the initial animation
    */
    reset: function() {
      this.resetElements();
      this.tooltip.initialize();
    },

    update: function(animationDuration, lazy) {
      var me = this;

      updateConfig(me);

      if (plugins.notify(me, 'beforeUpdate') === false) {
        return;
      }

      // In case the entire data object changed
      me.tooltip._data = me.data;

      // Make sure dataset controllers are updated and new controllers are reset
      var newControllers = me.buildOrUpdateControllers();

      // Make sure all dataset controllers have correct meta data counts
      helpers.each(me.data.datasets, function(dataset, datasetIndex) {
        me.getDatasetMeta(datasetIndex).controller.buildOrUpdateElements();
      }, me);

      me.updateLayout();

      // Can only reset the new controllers after the scales have been updated
      helpers.each(newControllers, function(controller) {
        controller.reset();
      });

      me.updateDatasets();

      // Do this before render so that any plugins that need final scale updates can use it
      plugins.notify(me, 'afterUpdate');

      if (me._bufferedRender) {
        me._bufferedRequest = {
          lazy: lazy,
          duration: animationDuration
        };
      } else {
        me.render(animationDuration, lazy);
      }
    },

    /**
     * Updates the chart layout unless a plugin returns `false` to the `beforeLayout`
     * hook, in which case, plugins will not be called on `afterLayout`.
     * @private
     */
    updateLayout: function() {
      var me = this;

      if (plugins.notify(me, 'beforeLayout') === false) {
        return;
      }

      Chart.layoutService.update(this, this.chart.width, this.chart.height);

      /**
       * Provided for backward compatibility, use `afterLayout` instead.
       * @method IPlugin#afterScaleUpdate
       * @deprecated since version 2.5.0
       * @todo remove at version 3
       */
      plugins.notify(me, 'afterScaleUpdate');
      plugins.notify(me, 'afterLayout');
    },

    /**
     * Updates all datasets unless a plugin returns `false` to the `beforeDatasetsUpdate`
     * hook, in which case, plugins will not be called on `afterDatasetsUpdate`.
     * @private
     */
    updateDatasets: function() {
      var me = this;

      if (plugins.notify(me, 'beforeDatasetsUpdate') === false) {
        return;
      }

      for (var i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
        me.getDatasetMeta(i).controller.update();
      }

      plugins.notify(me, 'afterDatasetsUpdate');
    },

    render: function(duration, lazy) {
      var me = this;

      if (plugins.notify(me, 'beforeRender') === false) {
        return;
      }

      var animationOptions = me.options.animation;
      var onComplete = function() {
        plugins.notify(me, 'afterRender');
        var callback = animationOptions && animationOptions.onComplete;
        if (callback && callback.call) {
          callback.call(me);
        }
      };

      if (animationOptions && ((typeof duration !== 'undefined' && duration !== 0) || (typeof duration === 'undefined' && animationOptions.duration !== 0))) {
        var animation = new Chart.Animation();
        animation.numSteps = (duration || animationOptions.duration) / 16.66; // 60 fps
        animation.easing = animationOptions.easing;

        // render function
        animation.render = function(chartInstance, animationObject) {
          var easingFunction = helpers.easingEffects[animationObject.easing];
          var stepDecimal = animationObject.currentStep / animationObject.numSteps;
          var easeDecimal = easingFunction(stepDecimal);

          chartInstance.draw(easeDecimal, stepDecimal, animationObject.currentStep);
        };

        // user events
        animation.onAnimationProgress = animationOptions.onProgress;
        animation.onAnimationComplete = onComplete;

        Chart.animationService.addAnimation(me, animation, duration, lazy);
      } else {
        me.draw();
        onComplete();
      }

      return me;
    },

    draw: function(easingValue) {
      var me = this;

      me.clear();

      if (easingValue === undefined || easingValue === null) {
        easingValue = 1;
      }

      if (plugins.notify(me, 'beforeDraw', [easingValue]) === false) {
        return;
      }

      // Draw all the scales
      helpers.each(me.boxes, function(box) {
        box.draw(me.chartArea);
      }, me);

      if (me.scale) {
        me.scale.draw();
      }

      me.drawDatasets(easingValue);

      // Finally draw the tooltip
      me.tooltip.transition(easingValue).draw();

      plugins.notify(me, 'afterDraw', [easingValue]);
    },

    /**
     * Draws all datasets unless a plugin returns `false` to the `beforeDatasetsDraw`
     * hook, in which case, plugins will not be called on `afterDatasetsDraw`.
     * @private
     */
    drawDatasets: function(easingValue) {
      var me = this;

      if (plugins.notify(me, 'beforeDatasetsDraw', [easingValue]) === false) {
        return;
      }

      // Draw each dataset via its respective controller (reversed to support proper line stacking)
      helpers.each(me.data.datasets, function(dataset, datasetIndex) {
        if (me.isDatasetVisible(datasetIndex)) {
          me.getDatasetMeta(datasetIndex).controller.draw(easingValue);
        }
      }, me, true);

      plugins.notify(me, 'afterDatasetsDraw', [easingValue]);
    },

    // Get the single element that was clicked on
    // @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
    getElementAtEvent: function(e) {
      return Chart.Interaction.modes.single(this, e);
    },

    getElementsAtEvent: function(e) {
      return Chart.Interaction.modes.label(this, e, {intersect: true});
    },

    getElementsAtXAxis: function(e) {
      return Chart.Interaction.modes['x-axis'](this, e, {intersect: true});
    },

    getElementsAtEventForMode: function(e, mode, options) {
      var method = Chart.Interaction.modes[mode];
      if (typeof method === 'function') {
        return method(this, e, options);
      }

      return [];
    },

    getDatasetAtEvent: function(e) {
      return Chart.Interaction.modes.dataset(this, e, {intersect: true});
    },

    getDatasetMeta: function(datasetIndex) {
      var me = this;
      var dataset = me.data.datasets[datasetIndex];
      if (!dataset._meta) {
        dataset._meta = {};
      }

      var meta = dataset._meta[me.id];
      if (!meta) {
        meta = dataset._meta[me.id] = {
          type: null,
          data: [],
          dataset: null,
          controller: null,
          hidden: null,     // See isDatasetVisible() comment
          xAxisID: null,
          yAxisID: null
        };
      }

      return meta;
    },

    getVisibleDatasetCount: function() {
      var count = 0;
      for (var i = 0, ilen = this.data.datasets.length; i<ilen; ++i) {
        if (this.isDatasetVisible(i)) {
          count++;
        }
      }
      return count;
    },

    isDatasetVisible: function(datasetIndex) {
      var meta = this.getDatasetMeta(datasetIndex);

      // meta.hidden is a per chart dataset hidden flag override with 3 states: if true or false,
      // the dataset.hidden value is ignored, else if null, the dataset hidden state is returned.
      return typeof meta.hidden === 'boolean'? !meta.hidden : !this.data.datasets[datasetIndex].hidden;
    },

    generateLegend: function() {
      return this.options.legendCallback(this);
    },

    destroy: function() {
      var me = this;
      var canvas = me.chart.canvas;
      var meta, i, ilen;

      me.stop();

      // dataset controllers need to cleanup associated data
      for (i = 0, ilen = me.data.datasets.length; i < ilen; ++i) {
        meta = me.getDatasetMeta(i);
        if (meta.controller) {
          meta.controller.destroy();
          meta.controller = null;
        }
      }

      if (canvas) {
        me.unbindEvents();
        helpers.clear(me.chart);
        platform.releaseContext(me.chart.ctx);
        me.chart.canvas = null;
        me.chart.ctx = null;
      }

      plugins.notify(me, 'destroy');

      delete Chart.instances[me.id];
    },

    toBase64Image: function() {
      return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
    },

    initToolTip: function() {
      var me = this;
      me.tooltip = new Chart.Tooltip({
        _chart: me.chart,
        _chartInstance: me,
        _data: me.data,
        _options: me.options.tooltips
      }, me);
      me.tooltip.initialize();
    },

    /**
     * @private
     */
    bindEvents: function() {
      var me = this;
      var listeners = me._listeners = {};
      var listener = function() {
        me.eventHandler.apply(me, arguments);
      };

      helpers.each(me.options.events, function(type) {
        platform.addEventListener(me, type, listener);
        listeners[type] = listener;
      });

      // Responsiveness is currently based on the use of an iframe, however this method causes
      // performance issues and could be troublesome when used with ad blockers. So make sure
      // that the user is still able to create a chart without iframe when responsive is false.
      // See https://github.com/chartjs/Chart.js/issues/2210
      if (me.options.responsive) {
        listener = function() {
          me.resize();
        };

        platform.addEventListener(me, 'resize', listener);
        listeners.resize = listener;
      }
    },

    /**
     * @private
     */
    unbindEvents: function() {
      var me = this;
      var listeners = me._listeners;
      if (!listeners) {
        return;
      }

      delete me._listeners;
      helpers.each(listeners, function(listener, type) {
        platform.removeEventListener(me, type, listener);
      });
    },

    updateHoverStyle: function(elements, mode, enabled) {
      var method = enabled? 'setHoverStyle' : 'removeHoverStyle';
      var element, i, ilen;

      for (i=0, ilen=elements.length; i<ilen; ++i) {
        element = elements[i];
        if (element) {
          this.getDatasetMeta(element._datasetIndex).controller[method](element);
        }
      }
    },

    /**
     * @private
     */
    eventHandler: function(e) {
      var me = this;
      var tooltip = me.tooltip;

      if (plugins.notify(me, 'beforeEvent', [e]) === false) {
        return;
      }

      // Buffer any update calls so that renders do not occur
      me._bufferedRender = true;
      me._bufferedRequest = null;

      var changed = me.handleEvent(e);
      changed |= tooltip && tooltip.handleEvent(e);

      plugins.notify(me, 'afterEvent', [e]);

      var bufferedRequest = me._bufferedRequest;
      if (bufferedRequest) {
        // If we have an update that was triggered, we need to do a normal render
        me.render(bufferedRequest.duration, bufferedRequest.lazy);
      } else if (changed && !me.animating) {
        // If entering, leaving, or changing elements, animate the change via pivot
        me.stop();

        // We only need to render at this point. Updating will cause scales to be
        // recomputed generating flicker & using more memory than necessary.
        me.render(me.options.hover.animationDuration, true);
      }

      me._bufferedRender = false;
      me._bufferedRequest = null;

      return me;
    },

    /**
     * Handle an event
     * @private
     * @param {IEvent} event the event to handle
     * @return {Boolean} true if the chart needs to re-render
     */
    handleEvent: function(e) {
      var me = this;
      var options = me.options || {};
      var hoverOptions = options.hover;
      var changed = false;

      me.lastActive = me.lastActive || [];

      // Find Active Elements for hover and tooltips
      if (e.type === 'mouseout') {
        me.active = [];
      } else {
        me.active = me.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions);
      }

      // On Hover hook
      if (hoverOptions.onHover) {
        // Need to call with native event here to not break backwards compatibility
        hoverOptions.onHover.call(me, e.native, me.active);
      }

      if (e.type === 'mouseup' || e.type === 'click') {
        if (options.onClick) {
          // Use e.native here for backwards compatibility
          options.onClick.call(me, e.native, me.active);
        }
      }

      // Remove styling for last active (even if it may still be active)
      if (me.lastActive.length) {
        me.updateHoverStyle(me.lastActive, hoverOptions.mode, false);
      }

      // Built in hover styling
      if (me.active.length && hoverOptions.mode) {
        me.updateHoverStyle(me.active, hoverOptions.mode, true);
      }

      changed = !helpers.arrayEquals(me.active, me.lastActive);

      // Remember Last Actives
      me.lastActive = me.active;

      return changed;
    }
  });
};

},{}],24:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  var arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];

  /**
   * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
   * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
   * called on the 'onData*' callbacks (e.g. onDataPush, etc.) with same arguments.
   */
  function listenArrayEvents(array, listener) {
    if (array._chartjs) {
      array._chartjs.listeners.push(listener);
      return;
    }

    Object.defineProperty(array, '_chartjs', {
      configurable: true,
      enumerable: false,
      value: {
        listeners: [listener]
      }
    });

    arrayEvents.forEach(function(key) {
      var method = 'onData' + key.charAt(0).toUpperCase() + key.slice(1);
      var base = array[key];

      Object.defineProperty(array, key, {
        configurable: true,
        enumerable: false,
        value: function() {
          var args = Array.prototype.slice.call(arguments);
          var res = base.apply(this, args);

          helpers.each(array._chartjs.listeners, function(object) {
            if (typeof object[method] === 'function') {
              object[method].apply(object, args);
            }
          });

          return res;
        }
      });
    });
  }

  /**
   * Removes the given array event listener and cleanup extra attached properties (such as
   * the _chartjs stub and overridden methods) if array doesn't have any more listeners.
   */
  function unlistenArrayEvents(array, listener) {
    var stub = array._chartjs;
    if (!stub) {
      return;
    }

    var listeners = stub.listeners;
    var index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length > 0) {
      return;
    }

    arrayEvents.forEach(function(key) {
      delete array[key];
    });

    delete array._chartjs;
  }

  // Base class for all dataset controllers (line, bar, etc)
  Chart.DatasetController = function(chart, datasetIndex) {
    this.initialize(chart, datasetIndex);
  };

  helpers.extend(Chart.DatasetController.prototype, {

    /**
     * Element type used to generate a meta dataset (e.g. Chart.element.Line).
     * @type {Chart.core.element}
     */
    datasetElementType: null,

    /**
     * Element type used to generate a meta data (e.g. Chart.element.Point).
     * @type {Chart.core.element}
     */
    dataElementType: null,

    initialize: function(chart, datasetIndex) {
      var me = this;
      me.chart = chart;
      me.index = datasetIndex;
      me.linkScales();
      me.addElements();
    },

    updateIndex: function(datasetIndex) {
      this.index = datasetIndex;
    },

    linkScales: function() {
      var me = this;
      var meta = me.getMeta();
      var dataset = me.getDataset();

      if (meta.xAxisID === null) {
        meta.xAxisID = dataset.xAxisID || me.chart.options.scales.xAxes[0].id;
      }
      if (meta.yAxisID === null) {
        meta.yAxisID = dataset.yAxisID || me.chart.options.scales.yAxes[0].id;
      }
    },

    getDataset: function() {
      return this.chart.data.datasets[this.index];
    },

    getMeta: function() {
      return this.chart.getDatasetMeta(this.index);
    },

    getScaleForId: function(scaleID) {
      return this.chart.scales[scaleID];
    },

    reset: function() {
      this.update(true);
    },

    /**
     * @private
     */
    destroy: function() {
      if (this._data) {
        unlistenArrayEvents(this._data, this);
      }
    },

    createMetaDataset: function() {
      var me = this;
      var type = me.datasetElementType;
      return type && new type({
        _chart: me.chart.chart,
        _datasetIndex: me.index
      });
    },

    createMetaData: function(index) {
      var me = this;
      var type = me.dataElementType;
      return type && new type({
        _chart: me.chart.chart,
        _datasetIndex: me.index,
        _index: index
      });
    },

    addElements: function() {
      var me = this;
      var meta = me.getMeta();
      var data = me.getDataset().data || [];
      var metaData = meta.data;
      var i, ilen;

      for (i=0, ilen=data.length; i<ilen; ++i) {
        metaData[i] = metaData[i] || me.createMetaData(i);
      }

      meta.dataset = meta.dataset || me.createMetaDataset();
    },

    addElementAndReset: function(index) {
      var element = this.createMetaData(index);
      this.getMeta().data.splice(index, 0, element);
      this.updateElement(element, index, true);
    },

    buildOrUpdateElements: function() {
      var me = this;
      var dataset = me.getDataset();
      var data = dataset.data || (dataset.data = []);

      // In order to correctly handle data addition/deletion animation (an thus simulate
      // real-time charts), we need to monitor these data modifications and synchronize
      // the internal meta data accordingly.
      if (me._data !== data) {
        if (me._data) {
          // This case happens when the user replaced the data array instance.
          unlistenArrayEvents(me._data, me);
        }

        listenArrayEvents(data, me);
        me._data = data;
      }

      // Re-sync meta data in case the user replaced the data array or if we missed
      // any updates and so make sure that we handle number of datapoints changing.
      me.resyncElements();
    },

    update: helpers.noop,

    draw: function(ease) {
      var easingDecimal = ease || 1;
      var i, len;
      var metaData = this.getMeta().data;
      for (i = 0, len = metaData.length; i < len; ++i) {
        metaData[i].transition(easingDecimal).draw();
      }
    },

    removeHoverStyle: function(element, elementOpts) {
      var dataset = this.chart.data.datasets[element._datasetIndex],
        index = element._index,
        custom = element.custom || {},
        valueOrDefault = helpers.getValueAtIndexOrDefault,
        model = element._model;

      model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : valueOrDefault(dataset.backgroundColor, index, elementOpts.backgroundColor);
      model.borderColor = custom.borderColor ? custom.borderColor : valueOrDefault(dataset.borderColor, index, elementOpts.borderColor);
      model.borderWidth = custom.borderWidth ? custom.borderWidth : valueOrDefault(dataset.borderWidth, index, elementOpts.borderWidth);
    },

    setHoverStyle: function(element) {
      var dataset = this.chart.data.datasets[element._datasetIndex],
        index = element._index,
        custom = element.custom || {},
        valueOrDefault = helpers.getValueAtIndexOrDefault,
        getHoverColor = helpers.getHoverColor,
        model = element._model;

      model.backgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : valueOrDefault(dataset.hoverBackgroundColor, index, getHoverColor(model.backgroundColor));
      model.borderColor = custom.hoverBorderColor ? custom.hoverBorderColor : valueOrDefault(dataset.hoverBorderColor, index, getHoverColor(model.borderColor));
      model.borderWidth = custom.hoverBorderWidth ? custom.hoverBorderWidth : valueOrDefault(dataset.hoverBorderWidth, index, model.borderWidth);
    },

    /**
     * @private
     */
    resyncElements: function() {
      var me = this;
      var meta = me.getMeta();
      var data = me.getDataset().data;
      var numMeta = meta.data.length;
      var numData = data.length;

      if (numData < numMeta) {
        meta.data.splice(numData, numMeta - numData);
      } else if (numData > numMeta) {
        me.insertElements(numMeta, numData - numMeta);
      }
    },

    /**
     * @private
     */
    insertElements: function(start, count) {
      for (var i=0; i<count; ++i) {
        this.addElementAndReset(start + i);
      }
    },

    /**
     * @private
     */
    onDataPush: function() {
      this.insertElements(this.getDataset().data.length-1, arguments.length);
    },

    /**
     * @private
     */
    onDataPop: function() {
      this.getMeta().data.pop();
    },

    /**
     * @private
     */
    onDataShift: function() {
      this.getMeta().data.shift();
    },

    /**
     * @private
     */
    onDataSplice: function(start, count) {
      this.getMeta().data.splice(start, count);
      this.insertElements(start, arguments.length - 2);
    },

    /**
     * @private
     */
    onDataUnshift: function() {
      this.insertElements(0, arguments.length);
    }
  });

  Chart.DatasetController.extend = helpers.inherits;
};

},{}],25:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.elements = {};

  Chart.Element = function(configuration) {
    helpers.extend(this, configuration);
    this.initialize.apply(this, arguments);
  };

  helpers.extend(Chart.Element.prototype, {

    initialize: function() {
      this.hidden = false;
    },

    pivot: function() {
      var me = this;
      if (!me._view) {
        me._view = helpers.clone(me._model);
      }
      me._start = helpers.clone(me._view);
      return me;
    },

    transition: function(ease) {
      var me = this;

      if (!me._view) {
        me._view = helpers.clone(me._model);
      }

      // No animation -> No Transition
      if (ease === 1) {
        me._view = me._model;
        me._start = null;
        return me;
      }

      if (!me._start) {
        me.pivot();
      }

      helpers.each(me._model, function(value, key) {

        if (key[0] === '_') {
          // Only non-underscored properties
        // Init if doesn't exist
        } else if (!me._view.hasOwnProperty(key)) {
          if (typeof value === 'number' && !isNaN(me._view[key])) {
            me._view[key] = value * ease;
          } else {
            me._view[key] = value;
          }
        // No unnecessary computations
        } else if (value === me._view[key]) {
          // It's the same! Woohoo!
        // Color transitions if possible
        } else if (typeof value === 'string') {
          try {
            var color = helpers.color(me._model[key]).mix(helpers.color(me._start[key]), ease);
            me._view[key] = color.rgbString();
          } catch (err) {
            me._view[key] = value;
          }
        // Number transitions
        } else if (typeof value === 'number') {
          var startVal = me._start[key] !== undefined && isNaN(me._start[key]) === false ? me._start[key] : 0;
          me._view[key] = ((me._model[key] - startVal) * ease) + startVal;
        // Everything else
        } else {
          me._view[key] = value;
        }
      }, me);

      return me;
    },

    tooltipPosition: function() {
      return {
        x: this._model.x,
        y: this._model.y
      };
    },

    hasValue: function() {
      return helpers.isNumber(this._model.x) && helpers.isNumber(this._model.y);
    }
  });

  Chart.Element.extend = helpers.inherits;

};

},{}],26:[function(require,module,exports){
/* global window: false */
/* global document: false */
'use strict';

var color = require(3);

module.exports = function(Chart) {
  // Global Chart helpers object for utility methods and classes
  var helpers = Chart.helpers = {};

  // -- Basic js utility methods
  helpers.each = function(loopable, callback, self, reverse) {
    // Check to see if null or undefined firstly.
    var i, len;
    if (helpers.isArray(loopable)) {
      len = loopable.length;
      if (reverse) {
        for (i = len - 1; i >= 0; i--) {
          callback.call(self, loopable[i], i);
        }
      } else {
        for (i = 0; i < len; i++) {
          callback.call(self, loopable[i], i);
        }
      }
    } else if (typeof loopable === 'object') {
      var keys = Object.keys(loopable);
      len = keys.length;
      for (i = 0; i < len; i++) {
        callback.call(self, loopable[keys[i]], keys[i]);
      }
    }
  };
  helpers.clone = function(obj) {
    var objClone = {};
    helpers.each(obj, function(value, key) {
      if (helpers.isArray(value)) {
        objClone[key] = value.slice(0);
      } else if (typeof value === 'object' && value !== null) {
        objClone[key] = helpers.clone(value);
      } else {
        objClone[key] = value;
      }
    });
    return objClone;
  };
  helpers.extend = function(base) {
    var setFn = function(value, key) {
      base[key] = value;
    };
    for (var i = 1, ilen = arguments.length; i < ilen; i++) {
      helpers.each(arguments[i], setFn);
    }
    return base;
  };
  // Need a special merge function to chart configs since they are now grouped
  helpers.configMerge = function(_base) {
    var base = helpers.clone(_base);
    helpers.each(Array.prototype.slice.call(arguments, 1), function(extension) {
      helpers.each(extension, function(value, key) {
        var baseHasProperty = base.hasOwnProperty(key);
        var baseVal = baseHasProperty ? base[key] : {};

        if (key === 'scales') {
          // Scale config merging is complex. Add our own function here for that
          base[key] = helpers.scaleMerge(baseVal, value);
        } else if (key === 'scale') {
          // Used in polar area & radar charts since there is only one scale
          base[key] = helpers.configMerge(baseVal, Chart.scaleService.getScaleDefaults(value.type), value);
        } else if (baseHasProperty
            && typeof baseVal === 'object'
            && !helpers.isArray(baseVal)
            && baseVal !== null
            && typeof value === 'object'
            && !helpers.isArray(value)) {
          // If we are overwriting an object with an object, do a merge of the properties.
          base[key] = helpers.configMerge(baseVal, value);
        } else {
          // can just overwrite the value in this case
          base[key] = value;
        }
      });
    });

    return base;
  };
  helpers.scaleMerge = function(_base, extension) {
    var base = helpers.clone(_base);

    helpers.each(extension, function(value, key) {
      if (key === 'xAxes' || key === 'yAxes') {
        // These properties are arrays of items
        if (base.hasOwnProperty(key)) {
          helpers.each(value, function(valueObj, index) {
            var axisType = helpers.getValueOrDefault(valueObj.type, key === 'xAxes' ? 'category' : 'linear');
            var axisDefaults = Chart.scaleService.getScaleDefaults(axisType);
            if (index >= base[key].length || !base[key][index].type) {
              base[key].push(helpers.configMerge(axisDefaults, valueObj));
            } else if (valueObj.type && valueObj.type !== base[key][index].type) {
              // Type changed. Bring in the new defaults before we bring in valueObj so that valueObj can override the correct scale defaults
              base[key][index] = helpers.configMerge(base[key][index], axisDefaults, valueObj);
            } else {
              // Type is the same
              base[key][index] = helpers.configMerge(base[key][index], valueObj);
            }
          });
        } else {
          base[key] = [];
          helpers.each(value, function(valueObj) {
            var axisType = helpers.getValueOrDefault(valueObj.type, key === 'xAxes' ? 'category' : 'linear');
            base[key].push(helpers.configMerge(Chart.scaleService.getScaleDefaults(axisType), valueObj));
          });
        }
      } else if (base.hasOwnProperty(key) && typeof base[key] === 'object' && base[key] !== null && typeof value === 'object') {
        // If we are overwriting an object with an object, do a merge of the properties.
        base[key] = helpers.configMerge(base[key], value);

      } else {
        // can just overwrite the value in this case
        base[key] = value;
      }
    });

    return base;
  };
  helpers.getValueAtIndexOrDefault = function(value, index, defaultValue) {
    if (value === undefined || value === null) {
      return defaultValue;
    }

    if (helpers.isArray(value)) {
      return index < value.length ? value[index] : defaultValue;
    }

    return value;
  };
  helpers.getValueOrDefault = function(value, defaultValue) {
    return value === undefined ? defaultValue : value;
  };
  helpers.indexOf = Array.prototype.indexOf?
    function(array, item) {
      return array.indexOf(item);
    }:
    function(array, item) {
      for (var i = 0, ilen = array.length; i < ilen; ++i) {
        if (array[i] === item) {
          return i;
        }
      }
      return -1;
    };
  helpers.where = function(collection, filterCallback) {
    if (helpers.isArray(collection) && Array.prototype.filter) {
      return collection.filter(filterCallback);
    }
    var filtered = [];

    helpers.each(collection, function(item) {
      if (filterCallback(item)) {
        filtered.push(item);
      }
    });

    return filtered;
  };
  helpers.findIndex = Array.prototype.findIndex?
    function(array, callback, scope) {
      return array.findIndex(callback, scope);
    } :
    function(array, callback, scope) {
      scope = scope === undefined? array : scope;
      for (var i = 0, ilen = array.length; i < ilen; ++i) {
        if (callback.call(scope, array[i], i, array)) {
          return i;
        }
      }
      return -1;
    };
  helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex) {
    // Default to start of the array
    if (startIndex === undefined || startIndex === null) {
      startIndex = -1;
    }
    for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
      var currentItem = arrayToSearch[i];
      if (filterCallback(currentItem)) {
        return currentItem;
      }
    }
  };
  helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex) {
    // Default to end of the array
    if (startIndex === undefined || startIndex === null) {
      startIndex = arrayToSearch.length;
    }
    for (var i = startIndex - 1; i >= 0; i--) {
      var currentItem = arrayToSearch[i];
      if (filterCallback(currentItem)) {
        return currentItem;
      }
    }
  };
  helpers.inherits = function(extensions) {
    // Basic javascript inheritance based on the model created in Backbone.js
    var me = this;
    var ChartElement = (extensions && extensions.hasOwnProperty('constructor')) ? extensions.constructor : function() {
      return me.apply(this, arguments);
    };

    var Surrogate = function() {
      this.constructor = ChartElement;
    };
    Surrogate.prototype = me.prototype;
    ChartElement.prototype = new Surrogate();

    ChartElement.extend = helpers.inherits;

    if (extensions) {
      helpers.extend(ChartElement.prototype, extensions);
    }

    ChartElement.__super__ = me.prototype;

    return ChartElement;
  };
  helpers.noop = function() {};
  helpers.uid = (function() {
    var id = 0;
    return function() {
      return id++;
    };
  }());
  // -- Math methods
  helpers.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };
  helpers.almostEquals = function(x, y, epsilon) {
    return Math.abs(x - y) < epsilon;
  };
  helpers.almostWhole = function(x, epsilon) {
    var rounded = Math.round(x);
    return (((rounded - epsilon) < x) && ((rounded + epsilon) > x));
  };
  helpers.max = function(array) {
    return array.reduce(function(max, value) {
      if (!isNaN(value)) {
        return Math.max(max, value);
      }
      return max;
    }, Number.NEGATIVE_INFINITY);
  };
  helpers.min = function(array) {
    return array.reduce(function(min, value) {
      if (!isNaN(value)) {
        return Math.min(min, value);
      }
      return min;
    }, Number.POSITIVE_INFINITY);
  };
  helpers.sign = Math.sign?
    function(x) {
      return Math.sign(x);
    } :
    function(x) {
      x = +x; // convert to a number
      if (x === 0 || isNaN(x)) {
        return x;
      }
      return x > 0 ? 1 : -1;
    };
  helpers.log10 = Math.log10?
    function(x) {
      return Math.log10(x);
    } :
    function(x) {
      return Math.log(x) / Math.LN10;
    };
  helpers.toRadians = function(degrees) {
    return degrees * (Math.PI / 180);
  };
  helpers.toDegrees = function(radians) {
    return radians * (180 / Math.PI);
  };
  // Gets the angle from vertical upright to the point about a centre.
  helpers.getAngleFromPoint = function(centrePoint, anglePoint) {
    var distanceFromXCenter = anglePoint.x - centrePoint.x,
      distanceFromYCenter = anglePoint.y - centrePoint.y,
      radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);

    var angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);

    if (angle < (-0.5 * Math.PI)) {
      angle += 2.0 * Math.PI; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
    }

    return {
      angle: angle,
      distance: radialDistanceFromCenter
    };
  };
  helpers.distanceBetweenPoints = function(pt1, pt2) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
  };
  helpers.aliasPixel = function(pixelWidth) {
    return (pixelWidth % 2 === 0) ? 0 : 0.5;
  };
  helpers.splineCurve = function(firstPoint, middlePoint, afterPoint, t) {
    // Props to Rob Spencer at scaled innovation for his post on splining between points
    // http://scaledinnovation.com/analytics/splines/aboutSplines.html

    // This function must also respect "skipped" points

    var previous = firstPoint.skip ? middlePoint : firstPoint,
      current = middlePoint,
      next = afterPoint.skip ? middlePoint : afterPoint;

    var d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2));
    var d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));

    var s01 = d01 / (d01 + d12);
    var s12 = d12 / (d01 + d12);

    // If all points are the same, s01 & s02 will be inf
    s01 = isNaN(s01) ? 0 : s01;
    s12 = isNaN(s12) ? 0 : s12;

    var fa = t * s01; // scaling factor for triangle Ta
    var fb = t * s12;

    return {
      previous: {
        x: current.x - fa * (next.x - previous.x),
        y: current.y - fa * (next.y - previous.y)
      },
      next: {
        x: current.x + fb * (next.x - previous.x),
        y: current.y + fb * (next.y - previous.y)
      }
    };
  };
  helpers.EPSILON = Number.EPSILON || 1e-14;
  helpers.splineCurveMonotone = function(points) {
    // This function calculates Bézier control points in a similar way than |splineCurve|,
    // but preserves monotonicity of the provided data and ensures no local extremums are added
    // between the dataset discrete points due to the interpolation.
    // See : https://en.wikipedia.org/wiki/Monotone_cubic_interpolation

    var pointsWithTangents = (points || []).map(function(point) {
      return {
        model: point._model,
        deltaK: 0,
        mK: 0
      };
    });

    // Calculate slopes (deltaK) and initialize tangents (mK)
    var pointsLen = pointsWithTangents.length;
    var i, pointBefore, pointCurrent, pointAfter;
    for (i = 0; i < pointsLen; ++i) {
      pointCurrent = pointsWithTangents[i];
      if (pointCurrent.model.skip) {
        continue;
      }

      pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
      pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
      if (pointAfter && !pointAfter.model.skip) {
        var slopeDeltaX = (pointAfter.model.x - pointCurrent.model.x);

        // In the case of two points that appear at the same x pixel, slopeDeltaX is 0
        pointCurrent.deltaK = slopeDeltaX !== 0 ? (pointAfter.model.y - pointCurrent.model.y) / slopeDeltaX : 0;
      }

      if (!pointBefore || pointBefore.model.skip) {
        pointCurrent.mK = pointCurrent.deltaK;
      } else if (!pointAfter || pointAfter.model.skip) {
        pointCurrent.mK = pointBefore.deltaK;
      } else if (this.sign(pointBefore.deltaK) !== this.sign(pointCurrent.deltaK)) {
        pointCurrent.mK = 0;
      } else {
        pointCurrent.mK = (pointBefore.deltaK + pointCurrent.deltaK) / 2;
      }
    }

    // Adjust tangents to ensure monotonic properties
    var alphaK, betaK, tauK, squaredMagnitude;
    for (i = 0; i < pointsLen - 1; ++i) {
      pointCurrent = pointsWithTangents[i];
      pointAfter = pointsWithTangents[i + 1];
      if (pointCurrent.model.skip || pointAfter.model.skip) {
        continue;
      }

      if (helpers.almostEquals(pointCurrent.deltaK, 0, this.EPSILON)) {
        pointCurrent.mK = pointAfter.mK = 0;
        continue;
      }

      alphaK = pointCurrent.mK / pointCurrent.deltaK;
      betaK = pointAfter.mK / pointCurrent.deltaK;
      squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
      if (squaredMagnitude <= 9) {
        continue;
      }

      tauK = 3 / Math.sqrt(squaredMagnitude);
      pointCurrent.mK = alphaK * tauK * pointCurrent.deltaK;
      pointAfter.mK = betaK * tauK * pointCurrent.deltaK;
    }

    // Compute control points
    var deltaX;
    for (i = 0; i < pointsLen; ++i) {
      pointCurrent = pointsWithTangents[i];
      if (pointCurrent.model.skip) {
        continue;
      }

      pointBefore = i > 0 ? pointsWithTangents[i - 1] : null;
      pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null;
      if (pointBefore && !pointBefore.model.skip) {
        deltaX = (pointCurrent.model.x - pointBefore.model.x) / 3;
        pointCurrent.model.controlPointPreviousX = pointCurrent.model.x - deltaX;
        pointCurrent.model.controlPointPreviousY = pointCurrent.model.y - deltaX * pointCurrent.mK;
      }
      if (pointAfter && !pointAfter.model.skip) {
        deltaX = (pointAfter.model.x - pointCurrent.model.x) / 3;
        pointCurrent.model.controlPointNextX = pointCurrent.model.x + deltaX;
        pointCurrent.model.controlPointNextY = pointCurrent.model.y + deltaX * pointCurrent.mK;
      }
    }
  };
  helpers.nextItem = function(collection, index, loop) {
    if (loop) {
      return index >= collection.length - 1 ? collection[0] : collection[index + 1];
    }
    return index >= collection.length - 1 ? collection[collection.length - 1] : collection[index + 1];
  };
  helpers.previousItem = function(collection, index, loop) {
    if (loop) {
      return index <= 0 ? collection[collection.length - 1] : collection[index - 1];
    }
    return index <= 0 ? collection[0] : collection[index - 1];
  };
  // Implementation of the nice number algorithm used in determining where axis labels will go
  helpers.niceNum = function(range, round) {
    var exponent = Math.floor(helpers.log10(range));
    var fraction = range / Math.pow(10, exponent);
    var niceFraction;

    if (round) {
      if (fraction < 1.5) {
        niceFraction = 1;
      } else if (fraction < 3) {
        niceFraction = 2;
      } else if (fraction < 7) {
        niceFraction = 5;
      } else {
        niceFraction = 10;
      }
    } else if (fraction <= 1.0) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
  };
  // Easing functions adapted from Robert Penner's easing equations
  // http://www.robertpenner.com/easing/
  var easingEffects = helpers.easingEffects = {
    linear: function(t) {
      return t;
    },
    easeInQuad: function(t) {
      return t * t;
    },
    easeOutQuad: function(t) {
      return -1 * t * (t - 2);
    },
    easeInOutQuad: function(t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t;
      }
      return -1 / 2 * ((--t) * (t - 2) - 1);
    },
    easeInCubic: function(t) {
      return t * t * t;
    },
    easeOutCubic: function(t) {
      return 1 * ((t = t / 1 - 1) * t * t + 1);
    },
    easeInOutCubic: function(t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t * t;
      }
      return 1 / 2 * ((t -= 2) * t * t + 2);
    },
    easeInQuart: function(t) {
      return t * t * t * t;
    },
    easeOutQuart: function(t) {
      return -1 * ((t = t / 1 - 1) * t * t * t - 1);
    },
    easeInOutQuart: function(t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t * t * t;
      }
      return -1 / 2 * ((t -= 2) * t * t * t - 2);
    },
    easeInQuint: function(t) {
      return 1 * (t /= 1) * t * t * t * t;
    },
    easeOutQuint: function(t) {
      return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
    },
    easeInOutQuint: function(t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t * t * t * t;
      }
      return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
    },
    easeInSine: function(t) {
      return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
    },
    easeOutSine: function(t) {
      return 1 * Math.sin(t / 1 * (Math.PI / 2));
    },
    easeInOutSine: function(t) {
      return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
    },
    easeInExpo: function(t) {
      return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
    },
    easeOutExpo: function(t) {
      return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
    },
    easeInOutExpo: function(t) {
      if (t === 0) {
        return 0;
      }
      if (t === 1) {
        return 1;
      }
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * Math.pow(2, 10 * (t - 1));
      }
      return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
    },
    easeInCirc: function(t) {
      if (t >= 1) {
        return t;
      }
      return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
    },
    easeOutCirc: function(t) {
      return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
    },
    easeInOutCirc: function(t) {
      if ((t /= 1 / 2) < 1) {
        return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
      }
      return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },
    easeInElastic: function(t) {
      var s = 1.70158;
      var p = 0;
      var a = 1;
      if (t === 0) {
        return 0;
      }
      if ((t /= 1) === 1) {
        return 1;
      }
      if (!p) {
        p = 1 * 0.3;
      }
      if (a < Math.abs(1)) {
        a = 1;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a);
      }
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
    },
    easeOutElastic: function(t) {
      var s = 1.70158;
      var p = 0;
      var a = 1;
      if (t === 0) {
        return 0;
      }
      if ((t /= 1) === 1) {
        return 1;
      }
      if (!p) {
        p = 1 * 0.3;
      }
      if (a < Math.abs(1)) {
        a = 1;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a);
      }
      return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
    },
    easeInOutElastic: function(t) {
      var s = 1.70158;
      var p = 0;
      var a = 1;
      if (t === 0) {
        return 0;
      }
      if ((t /= 1 / 2) === 2) {
        return 1;
      }
      if (!p) {
        p = 1 * (0.3 * 1.5);
      }
      if (a < Math.abs(1)) {
        a = 1;
        s = p / 4;
      } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a);
      }
      if (t < 1) {
        return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
      }
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1;
    },
    easeInBack: function(t) {
      var s = 1.70158;
      return 1 * (t /= 1) * t * ((s + 1) * t - s);
    },
    easeOutBack: function(t) {
      var s = 1.70158;
      return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
    },
    easeInOutBack: function(t) {
      var s = 1.70158;
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s));
      }
      return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2);
    },
    easeInBounce: function(t) {
      return 1 - easingEffects.easeOutBounce(1 - t);
    },
    easeOutBounce: function(t) {
      if ((t /= 1) < (1 / 2.75)) {
        return 1 * (7.5625 * t * t);
      } else if (t < (2 / 2.75)) {
        return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
      } else if (t < (2.5 / 2.75)) {
        return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
      }
      return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
    },
    easeInOutBounce: function(t) {
      if (t < 1 / 2) {
        return easingEffects.easeInBounce(t * 2) * 0.5;
      }
      return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
    }
  };
  // Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  helpers.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };
  }());
  // -- DOM methods
  helpers.getRelativePosition = function(evt, chart) {
    var mouseX, mouseY;
    var e = evt.originalEvent || evt,
      canvas = evt.currentTarget || evt.srcElement,
      boundingRect = canvas.getBoundingClientRect();

    var touches = e.touches;
    if (touches && touches.length > 0) {
      mouseX = touches[0].clientX;
      mouseY = touches[0].clientY;

    } else {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    // Scale mouse coordinates into canvas coordinates
    // by following the pattern laid out by 'jerryj' in the comments of
    // http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
    var paddingLeft = parseFloat(helpers.getStyle(canvas, 'padding-left'));
    var paddingTop = parseFloat(helpers.getStyle(canvas, 'padding-top'));
    var paddingRight = parseFloat(helpers.getStyle(canvas, 'padding-right'));
    var paddingBottom = parseFloat(helpers.getStyle(canvas, 'padding-bottom'));
    var width = boundingRect.right - boundingRect.left - paddingLeft - paddingRight;
    var height = boundingRect.bottom - boundingRect.top - paddingTop - paddingBottom;

    // We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
    // the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
    mouseX = Math.round((mouseX - boundingRect.left - paddingLeft) / (width) * canvas.width / chart.currentDevicePixelRatio);
    mouseY = Math.round((mouseY - boundingRect.top - paddingTop) / (height) * canvas.height / chart.currentDevicePixelRatio);

    return {
      x: mouseX,
      y: mouseY
    };

  };
  helpers.addEvent = function(node, eventType, method) {
    if (node.addEventListener) {
      node.addEventListener(eventType, method);
    } else if (node.attachEvent) {
      node.attachEvent('on' + eventType, method);
    } else {
      node['on' + eventType] = method;
    }
  };
  helpers.removeEvent = function(node, eventType, handler) {
    if (node.removeEventListener) {
      node.removeEventListener(eventType, handler, false);
    } else if (node.detachEvent) {
      node.detachEvent('on' + eventType, handler);
    } else {
      node['on' + eventType] = helpers.noop;
    }
  };

  // Private helper function to convert max-width/max-height values that may be percentages into a number
  function parseMaxStyle(styleValue, node, parentProperty) {
    var valueInPixels;
    if (typeof(styleValue) === 'string') {
      valueInPixels = parseInt(styleValue, 10);

      if (styleValue.indexOf('%') !== -1) {
        // percentage * size in dimension
        valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
      }
    } else {
      valueInPixels = styleValue;
    }

    return valueInPixels;
  }

  /**
   * Returns if the given value contains an effective constraint.
   * @private
   */
  function isConstrainedValue(value) {
    return value !== undefined && value !== null && value !== 'none';
  }

  // Private helper to get a constraint dimension
  // @param domNode : the node to check the constraint on
  // @param maxStyle : the style that defines the maximum for the direction we are using (maxWidth / maxHeight)
  // @param percentageProperty : property of parent to use when calculating width as a percentage
  // @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
  function getConstraintDimension(domNode, maxStyle, percentageProperty) {
    var view = document.defaultView;
    var parentNode = domNode.parentNode;
    var constrainedNode = view.getComputedStyle(domNode)[maxStyle];
    var constrainedContainer = view.getComputedStyle(parentNode)[maxStyle];
    var hasCNode = isConstrainedValue(constrainedNode);
    var hasCContainer = isConstrainedValue(constrainedContainer);
    var infinity = Number.POSITIVE_INFINITY;

    if (hasCNode || hasCContainer) {
      return Math.min(
        hasCNode? parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity,
        hasCContainer? parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity);
    }

    return 'none';
  }
  // returns Number or undefined if no constraint
  helpers.getConstraintWidth = function(domNode) {
    return getConstraintDimension(domNode, 'max-width', 'clientWidth');
  };
  // returns Number or undefined if no constraint
  helpers.getConstraintHeight = function(domNode) {
    return getConstraintDimension(domNode, 'max-height', 'clientHeight');
  };
  helpers.getMaximumWidth = function(domNode) {
    var container = domNode.parentNode;
    var paddingLeft = parseInt(helpers.getStyle(container, 'padding-left'), 10);
    var paddingRight = parseInt(helpers.getStyle(container, 'padding-right'), 10);
    var w = container.clientWidth - paddingLeft - paddingRight;
    var cw = helpers.getConstraintWidth(domNode);
    return isNaN(cw)? w : Math.min(w, cw);
  };
  helpers.getMaximumHeight = function(domNode) {
    var container = domNode.parentNode;
    var paddingTop = parseInt(helpers.getStyle(container, 'padding-top'), 10);
    var paddingBottom = parseInt(helpers.getStyle(container, 'padding-bottom'), 10);
    var h = container.clientHeight - paddingTop - paddingBottom;
    var ch = helpers.getConstraintHeight(domNode);
    return isNaN(ch)? h : Math.min(h, ch);
  };
  helpers.getStyle = function(el, property) {
    return el.currentStyle ?
      el.currentStyle[property] :
      document.defaultView.getComputedStyle(el, null).getPropertyValue(property);
  };
  helpers.retinaScale = function(chart) {
    var pixelRatio = chart.currentDevicePixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio === 1) {
      return;
    }

    var canvas = chart.canvas;
    var height = chart.height;
    var width = chart.width;

    canvas.height = height * pixelRatio;
    canvas.width = width * pixelRatio;
    chart.ctx.scale(pixelRatio, pixelRatio);

    // If no style has been set on the canvas, the render size is used as display size,
    // making the chart visually bigger, so let's enforce it to the "correct" values.
    // See https://github.com/chartjs/Chart.js/issues/3575
    canvas.style.height = height + 'px';
    canvas.style.width = width + 'px';
  };
  // -- Canvas methods
  helpers.clear = function(chart) {
    chart.ctx.clearRect(0, 0, chart.width, chart.height);
  };
  helpers.fontString = function(pixelSize, fontStyle, fontFamily) {
    return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
  };
  helpers.longestText = function(ctx, font, arrayOfThings, cache) {
    cache = cache || {};
    var data = cache.data = cache.data || {};
    var gc = cache.garbageCollect = cache.garbageCollect || [];

    if (cache.font !== font) {
      data = cache.data = {};
      gc = cache.garbageCollect = [];
      cache.font = font;
    }

    ctx.font = font;
    var longest = 0;
    helpers.each(arrayOfThings, function(thing) {
      // Undefined strings and arrays should not be measured
      if (thing !== undefined && thing !== null && helpers.isArray(thing) !== true) {
        longest = helpers.measureText(ctx, data, gc, longest, thing);
      } else if (helpers.isArray(thing)) {
        // if it is an array lets measure each element
        // to do maybe simplify this function a bit so we can do this more recursively?
        helpers.each(thing, function(nestedThing) {
          // Undefined strings and arrays should not be measured
          if (nestedThing !== undefined && nestedThing !== null && !helpers.isArray(nestedThing)) {
            longest = helpers.measureText(ctx, data, gc, longest, nestedThing);
          }
        });
      }
    });

    var gcLen = gc.length / 2;
    if (gcLen > arrayOfThings.length) {
      for (var i = 0; i < gcLen; i++) {
        delete data[gc[i]];
      }
      gc.splice(0, gcLen);
    }
    return longest;
  };
  helpers.measureText = function(ctx, data, gc, longest, string) {
    var textWidth = data[string];
    if (!textWidth) {
      textWidth = data[string] = ctx.measureText(string).width;
      gc.push(string);
    }
    if (textWidth > longest) {
      longest = textWidth;
    }
    return longest;
  };
  helpers.numberOfLabelLines = function(arrayOfThings) {
    var numberOfLines = 1;
    helpers.each(arrayOfThings, function(thing) {
      if (helpers.isArray(thing)) {
        if (thing.length > numberOfLines) {
          numberOfLines = thing.length;
        }
      }
    });
    return numberOfLines;
  };
  helpers.drawRoundedRectangle = function(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };
  helpers.color = function(c) {
    if (!color) {
      console.error('Color.js not found!');
      return c;
    }

    /* global CanvasGradient */
    if (c instanceof CanvasGradient) {
      return color(Chart.defaults.global.defaultColor);
    }

    return color(c);
  };
  helpers.isArray = Array.isArray?
    function(obj) {
      return Array.isArray(obj);
    } :
    function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  // ! @see http://stackoverflow.com/a/14853974
  helpers.arrayEquals = function(a0, a1) {
    var i, ilen, v0, v1;

    if (!a0 || !a1 || a0.length !== a1.length) {
      return false;
    }

    for (i = 0, ilen=a0.length; i < ilen; ++i) {
      v0 = a0[i];
      v1 = a1[i];

      if (v0 instanceof Array && v1 instanceof Array) {
        if (!helpers.arrayEquals(v0, v1)) {
          return false;
        }
      } else if (v0 !== v1) {
        // NOTE: two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }

    return true;
  };
  helpers.callCallback = function(fn, args, _tArg) {
    if (fn && typeof fn.call === 'function') {
      fn.apply(_tArg, args);
    }
  };
  helpers.getHoverColor = function(colorValue) {
    /* global CanvasPattern */
    return (colorValue instanceof CanvasPattern) ?
      colorValue :
      helpers.color(colorValue).saturate(0.5).darken(0.1).rgbString();
  };
};

},{"3":3}],27:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {
  var helpers = Chart.helpers;

  /**
   * Helper function to get relative position for an event
   * @param {Event|IEvent} event - The event to get the position for
   * @param {Chart} chart - The chart
   * @returns {Point} the event position
   */
  function getRelativePosition(e, chart) {
    if (e.native) {
      return {
        x: e.x,
        y: e.y
      };
    }

    return helpers.getRelativePosition(e, chart);
  }

  /**
   * Helper function to traverse all of the visible elements in the chart
   * @param chart {chart} the chart
   * @param handler {Function} the callback to execute for each visible item
   */
  function parseVisibleItems(chart, handler) {
    var datasets = chart.data.datasets;
    var meta, i, j, ilen, jlen;

    for (i = 0, ilen = datasets.length; i < ilen; ++i) {
      if (!chart.isDatasetVisible(i)) {
        continue;
      }

      meta = chart.getDatasetMeta(i);
      for (j = 0, jlen = meta.data.length; j < jlen; ++j) {
        var element = meta.data[j];
        if (!element._view.skip) {
          handler(element);
        }
      }
    }
  }

  /**
   * Helper function to get the items that intersect the event position
   * @param items {ChartElement[]} elements to filter
   * @param position {Point} the point to be nearest to
   * @return {ChartElement[]} the nearest items
   */
  function getIntersectItems(chart, position) {
    var elements = [];

    parseVisibleItems(chart, function(element) {
      if (element.inRange(position.x, position.y)) {
        elements.push(element);
      }
    });

    return elements;
  }

  /**
   * Helper function to get the items nearest to the event position considering all visible items in teh chart
   * @param chart {Chart} the chart to look at elements from
   * @param position {Point} the point to be nearest to
   * @param intersect {Boolean} if true, only consider items that intersect the position
   * @param distanceMetric {Function} Optional function to provide the distance between
   * @return {ChartElement[]} the nearest items
   */
  function getNearestItems(chart, position, intersect, distanceMetric) {
    var minDistance = Number.POSITIVE_INFINITY;
    var nearestItems = [];

    if (!distanceMetric) {
      distanceMetric = helpers.distanceBetweenPoints;
    }

    parseVisibleItems(chart, function(element) {
      if (intersect && !element.inRange(position.x, position.y)) {
        return;
      }

      var center = element.getCenterPoint();
      var distance = distanceMetric(position, center);

      if (distance < minDistance) {
        nearestItems = [element];
        minDistance = distance;
      } else if (distance === minDistance) {
        // Can have multiple items at the same distance in which case we sort by size
        nearestItems.push(element);
      }
    });

    return nearestItems;
  }

  function indexMode(chart, e, options) {
    var position = getRelativePosition(e, chart.chart);
    var distanceMetric = function(pt1, pt2) {
      return Math.abs(pt1.x - pt2.x);
    };
    var items = options.intersect ? getIntersectItems(chart, position) : getNearestItems(chart, position, false, distanceMetric);
    var elements = [];

    if (!items.length) {
      return [];
    }

    chart.data.datasets.forEach(function(dataset, datasetIndex) {
      if (chart.isDatasetVisible(datasetIndex)) {
        var meta = chart.getDatasetMeta(datasetIndex),
          element = meta.data[items[0]._index];

        // don't count items that are skipped (null data)
        if (element && !element._view.skip) {
          elements.push(element);
        }
      }
    });

    return elements;
  }

  /**
   * @interface IInteractionOptions
   */
  /**
   * If true, only consider items that intersect the point
   * @name IInterfaceOptions#boolean
   * @type Boolean
   */

  /**
   * Contains interaction related functions
   * @namespace Chart.Interaction
   */
  Chart.Interaction = {
    // Helper function for different modes
    modes: {
      single: function(chart, e) {
        var position = getRelativePosition(e, chart.chart);
        var elements = [];

        parseVisibleItems(chart, function(element) {
          if (element.inRange(position.x, position.y)) {
            elements.push(element);
            return elements;
          }
        });

        return elements.slice(0, 1);
      },

      /**
       * @function Chart.Interaction.modes.label
       * @deprecated since version 2.4.0
       */
      label: indexMode,

      /**
       * Returns items at the same index. If the options.intersect parameter is true, we only return items if we intersect something
       * If the options.intersect mode is false, we find the nearest item and return the items at the same index as that item
       * @function Chart.Interaction.modes.index
       * @since v2.4.0
       * @param chart {chart} the chart we are returning items from
       * @param e {Event} the event we are find things at
       * @param options {IInteractionOptions} options to use during interaction
       * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
       */
      index: indexMode,

      /**
       * Returns items in the same dataset. If the options.intersect parameter is true, we only return items if we intersect something
       * If the options.intersect is false, we find the nearest item and return the items in that dataset
       * @function Chart.Interaction.modes.dataset
       * @param chart {chart} the chart we are returning items from
       * @param e {Event} the event we are find things at
       * @param options {IInteractionOptions} options to use during interaction
       * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
       */
      dataset: function(chart, e, options) {
        var position = getRelativePosition(e, chart.chart);
        var items = options.intersect ? getIntersectItems(chart, position) : getNearestItems(chart, position, false);

        if (items.length > 0) {
          items = chart.getDatasetMeta(items[0]._datasetIndex).data;
        }

        return items;
      },

      /**
       * @function Chart.Interaction.modes.x-axis
       * @deprecated since version 2.4.0. Use index mode and intersect == true
       */
      'x-axis': function(chart, e) {
        return indexMode(chart, e, true);
      },

      /**
       * Point mode returns all elements that hit test based on the event position
       * of the event
       * @function Chart.Interaction.modes.intersect
       * @param chart {chart} the chart we are returning items from
       * @param e {Event} the event we are find things at
       * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
       */
      point: function(chart, e) {
        var position = getRelativePosition(e, chart.chart);
        return getIntersectItems(chart, position);
      },

      /**
       * nearest mode returns the element closest to the point
       * @function Chart.Interaction.modes.intersect
       * @param chart {chart} the chart we are returning items from
       * @param e {Event} the event we are find things at
       * @param options {IInteractionOptions} options to use
       * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
       */
      nearest: function(chart, e, options) {
        var position = getRelativePosition(e, chart.chart);
        var nearestItems = getNearestItems(chart, position, options.intersect);

        // We have multiple items at the same distance from the event. Now sort by smallest
        if (nearestItems.length > 1) {
          nearestItems.sort(function(a, b) {
            var sizeA = a.getArea();
            var sizeB = b.getArea();
            var ret = sizeA - sizeB;

            if (ret === 0) {
              // if equal sort by dataset index
              ret = a._datasetIndex - b._datasetIndex;
            }

            return ret;
          });
        }

        // Return only 1 item
        return nearestItems.slice(0, 1);
      },

      /**
       * x mode returns the elements that hit-test at the current x coordinate
       * @function Chart.Interaction.modes.x
       * @param chart {chart} the chart we are returning items from
       * @param e {Event} the event we are find things at
       * @param options {IInteractionOptions} options to use
       * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
       */
      x: function(chart, e, options) {
        var position = getRelativePosition(e, chart.chart);
        var items = [];
        var intersectsItem = false;

        parseVisibleItems(chart, function(element) {
          if (element.inXRange(position.x)) {
            items.push(element);
          }

          if (element.inRange(position.x, position.y)) {
            intersectsItem = true;
          }
        });

        // If we want to trigger on an intersect and we don't have any items
        // that intersect the position, return nothing
        if (options.intersect && !intersectsItem) {
          items = [];
        }
        return items;
      },

      /**
       * y mode returns the elements that hit-test at the current y coordinate
       * @function Chart.Interaction.modes.y
       * @param chart {chart} the chart we are returning items from
       * @param e {Event} the event we are find things at
       * @param options {IInteractionOptions} options to use
       * @return {Chart.Element[]} Array of elements that are under the point. If none are found, an empty array is returned
       */
      y: function(chart, e, options) {
        var position = getRelativePosition(e, chart.chart);
        var items = [];
        var intersectsItem = false;

        parseVisibleItems(chart, function(element) {
          if (element.inYRange(position.y)) {
            items.push(element);
          }

          if (element.inRange(position.x, position.y)) {
            intersectsItem = true;
          }
        });

        // If we want to trigger on an intersect and we don't have any items
        // that intersect the position, return nothing
        if (options.intersect && !intersectsItem) {
          items = [];
        }
        return items;
      }
    }
  };
};

},{}],28:[function(require,module,exports){
'use strict';

module.exports = function() {

  // Occupy the global variable of Chart, and create a simple base class
  var Chart = function(item, config) {
    this.controller = new Chart.Controller(item, config, this);
    return this.controller;
  };

  // Globally expose the defaults to allow for user updating/changing
  Chart.defaults = {
    global: {
      responsive: true,
      responsiveAnimationDuration: 0,
      maintainAspectRatio: true,
      events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
      hover: {
        onHover: null,
        mode: 'nearest',
        intersect: true,
        animationDuration: 400
      },
      onClick: null,
      defaultColor: 'rgba(0,0,0,0.1)',
      defaultFontColor: '#666',
      defaultFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      defaultFontSize: 12,
      defaultFontStyle: 'normal',
      showLines: true,

      // Element defaults defined in element extensions
      elements: {},

      // Legend callback string
      legendCallback: function(chart) {
        var text = [];
        text.push('<ul class="' + chart.id + '-legend">');
        for (var i = 0; i < chart.data.datasets.length; i++) {
          text.push('<li><span style="background-color:' + chart.data.datasets[i].backgroundColor + '"></span>');
          if (chart.data.datasets[i].label) {
            text.push(chart.data.datasets[i].label);
          }
          text.push('</li>');
        }
        text.push('</ul>');

        return text.join('');
      }
    }
  };

  Chart.Chart = Chart;

  return Chart;
};

},{}],29:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  // The layout service is very self explanatory.  It's responsible for the layout within a chart.
  // Scales, Legends and Plugins all rely on the layout service and can easily register to be placed anywhere they need
  // It is this service's responsibility of carrying out that layout.
  Chart.layoutService = {
    defaults: {},

    // Register a box to a chartInstance. A box is simply a reference to an object that requires layout. eg. Scales, Legend, Plugins.
    addBox: function(chartInstance, box) {
      if (!chartInstance.boxes) {
        chartInstance.boxes = [];
      }
      chartInstance.boxes.push(box);
    },

    removeBox: function(chartInstance, box) {
      if (!chartInstance.boxes) {
        return;
      }
      chartInstance.boxes.splice(chartInstance.boxes.indexOf(box), 1);
    },

    // The most important function
    update: function(chartInstance, width, height) {

      if (!chartInstance) {
        return;
      }

      var layoutOptions = chartInstance.options.layout;
      var padding = layoutOptions ? layoutOptions.padding : null;

      var leftPadding = 0;
      var rightPadding = 0;
      var topPadding = 0;
      var bottomPadding = 0;

      if (!isNaN(padding)) {
        // options.layout.padding is a number. assign to all
        leftPadding = padding;
        rightPadding = padding;
        topPadding = padding;
        bottomPadding = padding;
      } else {
        leftPadding = padding.left || 0;
        rightPadding = padding.right || 0;
        topPadding = padding.top || 0;
        bottomPadding = padding.bottom || 0;
      }

      var leftBoxes = helpers.where(chartInstance.boxes, function(box) {
        return box.options.position === 'left';
      });
      var rightBoxes = helpers.where(chartInstance.boxes, function(box) {
        return box.options.position === 'right';
      });
      var topBoxes = helpers.where(chartInstance.boxes, function(box) {
        return box.options.position === 'top';
      });
      var bottomBoxes = helpers.where(chartInstance.boxes, function(box) {
        return box.options.position === 'bottom';
      });

      // Boxes that overlay the chartarea such as the radialLinear scale
      var chartAreaBoxes = helpers.where(chartInstance.boxes, function(box) {
        return box.options.position === 'chartArea';
      });

      // Ensure that full width boxes are at the very top / bottom
      topBoxes.sort(function(a, b) {
        return (b.options.fullWidth ? 1 : 0) - (a.options.fullWidth ? 1 : 0);
      });
      bottomBoxes.sort(function(a, b) {
        return (a.options.fullWidth ? 1 : 0) - (b.options.fullWidth ? 1 : 0);
      });

      // Essentially we now have any number of boxes on each of the 4 sides.
      // Our canvas looks like the following.
      // The areas L1 and L2 are the left axes. R1 is the right axis, T1 is the top axis and
      // B1 is the bottom axis
      // There are also 4 quadrant-like locations (left to right instead of clockwise) reserved for chart overlays
      // These locations are single-box locations only, when trying to register a chartArea location that is already taken,
      // an error will be thrown.
      //
      // |----------------------------------------------------|
      // |                  T1 (Full Width)                   |
      // |----------------------------------------------------|
      // |    |    |                 T2                  |    |
      // |    |----|-------------------------------------|----|
      // |    |    | C1 |                           | C2 |    |
      // |    |    |----|                           |----|    |
      // |    |    |                                     |    |
      // | L1 | L2 |           ChartArea (C0)            | R1 |
      // |    |    |                                     |    |
      // |    |    |----|                           |----|    |
      // |    |    | C3 |                           | C4 |    |
      // |    |----|-------------------------------------|----|
      // |    |    |                 B1                  |    |
      // |----------------------------------------------------|
      // |                  B2 (Full Width)                   |
      // |----------------------------------------------------|
      //
      // What we do to find the best sizing, we do the following
      // 1. Determine the minimum size of the chart area.
      // 2. Split the remaining width equally between each vertical axis
      // 3. Split the remaining height equally between each horizontal axis
      // 4. Give each layout the maximum size it can be. The layout will return it's minimum size
      // 5. Adjust the sizes of each axis based on it's minimum reported size.
      // 6. Refit each axis
      // 7. Position each axis in the final location
      // 8. Tell the chart the final location of the chart area
      // 9. Tell any axes that overlay the chart area the positions of the chart area

      // Step 1
      var chartWidth = width - leftPadding - rightPadding;
      var chartHeight = height - topPadding - bottomPadding;
      var chartAreaWidth = chartWidth / 2; // min 50%
      var chartAreaHeight = chartHeight / 2; // min 50%

      // Step 2
      var verticalBoxWidth = (width - chartAreaWidth) / (leftBoxes.length + rightBoxes.length);

      // Step 3
      var horizontalBoxHeight = (height - chartAreaHeight) / (topBoxes.length + bottomBoxes.length);

      // Step 4
      var maxChartAreaWidth = chartWidth;
      var maxChartAreaHeight = chartHeight;
      var minBoxSizes = [];

      function getMinimumBoxSize(box) {
        var minSize;
        var isHorizontal = box.isHorizontal();

        if (isHorizontal) {
          minSize = box.update(box.options.fullWidth ? chartWidth : maxChartAreaWidth, horizontalBoxHeight);
          maxChartAreaHeight -= minSize.height;
        } else {
          minSize = box.update(verticalBoxWidth, chartAreaHeight);
          maxChartAreaWidth -= minSize.width;
        }

        minBoxSizes.push({
          horizontal: isHorizontal,
          minSize: minSize,
          box: box,
        });
      }

      helpers.each(leftBoxes.concat(rightBoxes, topBoxes, bottomBoxes), getMinimumBoxSize);

      // If a horizontal box has padding, we move the left boxes over to avoid ugly charts (see issue #2478)
      var maxHorizontalLeftPadding = 0;
      var maxHorizontalRightPadding = 0;
      var maxVerticalTopPadding = 0;
      var maxVerticalBottomPadding = 0;

      helpers.each(topBoxes.concat(bottomBoxes), function(horizontalBox) {
        if (horizontalBox.getPadding) {
          var boxPadding = horizontalBox.getPadding();
          maxHorizontalLeftPadding = Math.max(maxHorizontalLeftPadding, boxPadding.left);
          maxHorizontalRightPadding = Math.max(maxHorizontalRightPadding, boxPadding.right);
        }
      });

      helpers.each(leftBoxes.concat(rightBoxes), function(verticalBox) {
        if (verticalBox.getPadding) {
          var boxPadding = verticalBox.getPadding();
          maxVerticalTopPadding = Math.max(maxVerticalTopPadding, boxPadding.top);
          maxVerticalBottomPadding = Math.max(maxVerticalBottomPadding, boxPadding.bottom);
        }
      });

      // At this point, maxChartAreaHeight and maxChartAreaWidth are the size the chart area could
      // be if the axes are drawn at their minimum sizes.
      // Steps 5 & 6
      var totalLeftBoxesWidth = leftPadding;
      var totalRightBoxesWidth = rightPadding;
      var totalTopBoxesHeight = topPadding;
      var totalBottomBoxesHeight = bottomPadding;

      // Function to fit a box
      function fitBox(box) {
        var minBoxSize = helpers.findNextWhere(minBoxSizes, function(minBox) {
          return minBox.box === box;
        });

        if (minBoxSize) {
          if (box.isHorizontal()) {
            var scaleMargin = {
              left: Math.max(totalLeftBoxesWidth, maxHorizontalLeftPadding),
              right: Math.max(totalRightBoxesWidth, maxHorizontalRightPadding),
              top: 0,
              bottom: 0
            };

            // Don't use min size here because of label rotation. When the labels are rotated, their rotation highly depends
            // on the margin. Sometimes they need to increase in size slightly
            box.update(box.options.fullWidth ? chartWidth : maxChartAreaWidth, chartHeight / 2, scaleMargin);
          } else {
            box.update(minBoxSize.minSize.width, maxChartAreaHeight);
          }
        }
      }

      // Update, and calculate the left and right margins for the horizontal boxes
      helpers.each(leftBoxes.concat(rightBoxes), fitBox);

      helpers.each(leftBoxes, function(box) {
        totalLeftBoxesWidth += box.width;
      });

      helpers.each(rightBoxes, function(box) {
        totalRightBoxesWidth += box.width;
      });

      // Set the Left and Right margins for the horizontal boxes
      helpers.each(topBoxes.concat(bottomBoxes), fitBox);

      // Figure out how much margin is on the top and bottom of the vertical boxes
      helpers.each(topBoxes, function(box) {
        totalTopBoxesHeight += box.height;
      });

      helpers.each(bottomBoxes, function(box) {
        totalBottomBoxesHeight += box.height;
      });

      function finalFitVerticalBox(box) {
        var minBoxSize = helpers.findNextWhere(minBoxSizes, function(minSize) {
          return minSize.box === box;
        });

        var scaleMargin = {
          left: 0,
          right: 0,
          top: totalTopBoxesHeight,
          bottom: totalBottomBoxesHeight
        };

        if (minBoxSize) {
          box.update(minBoxSize.minSize.width, maxChartAreaHeight, scaleMargin);
        }
      }

      // Let the left layout know the final margin
      helpers.each(leftBoxes.concat(rightBoxes), finalFitVerticalBox);

      // Recalculate because the size of each layout might have changed slightly due to the margins (label rotation for instance)
      totalLeftBoxesWidth = leftPadding;
      totalRightBoxesWidth = rightPadding;
      totalTopBoxesHeight = topPadding;
      totalBottomBoxesHeight = bottomPadding;

      helpers.each(leftBoxes, function(box) {
        totalLeftBoxesWidth += box.width;
      });

      helpers.each(rightBoxes, function(box) {
        totalRightBoxesWidth += box.width;
      });

      helpers.each(topBoxes, function(box) {
        totalTopBoxesHeight += box.height;
      });
      helpers.each(bottomBoxes, function(box) {
        totalBottomBoxesHeight += box.height;
      });

      // We may be adding some padding to account for rotated x axis labels
      var leftPaddingAddition = Math.max(maxHorizontalLeftPadding - totalLeftBoxesWidth, 0);
      totalLeftBoxesWidth += leftPaddingAddition;
      totalRightBoxesWidth += Math.max(maxHorizontalRightPadding - totalRightBoxesWidth, 0);

      var topPaddingAddition = Math.max(maxVerticalTopPadding - totalTopBoxesHeight, 0);
      totalTopBoxesHeight += topPaddingAddition;
      totalBottomBoxesHeight += Math.max(maxVerticalBottomPadding - totalBottomBoxesHeight, 0);

      // Figure out if our chart area changed. This would occur if the dataset layout label rotation
      // changed due to the application of the margins in step 6. Since we can only get bigger, this is safe to do
      // without calling `fit` again
      var newMaxChartAreaHeight = height - totalTopBoxesHeight - totalBottomBoxesHeight;
      var newMaxChartAreaWidth = width - totalLeftBoxesWidth - totalRightBoxesWidth;

      if (newMaxChartAreaWidth !== maxChartAreaWidth || newMaxChartAreaHeight !== maxChartAreaHeight) {
        helpers.each(leftBoxes, function(box) {
          box.height = newMaxChartAreaHeight;
        });

        helpers.each(rightBoxes, function(box) {
          box.height = newMaxChartAreaHeight;
        });

        helpers.each(topBoxes, function(box) {
          if (!box.options.fullWidth) {
            box.width = newMaxChartAreaWidth;
          }
        });

        helpers.each(bottomBoxes, function(box) {
          if (!box.options.fullWidth) {
            box.width = newMaxChartAreaWidth;
          }
        });

        maxChartAreaHeight = newMaxChartAreaHeight;
        maxChartAreaWidth = newMaxChartAreaWidth;
      }

      // Step 7 - Position the boxes
      var left = leftPadding + leftPaddingAddition;
      var top = topPadding + topPaddingAddition;

      function placeBox(box) {
        if (box.isHorizontal()) {
          box.left = box.options.fullWidth ? leftPadding : totalLeftBoxesWidth;
          box.right = box.options.fullWidth ? width - rightPadding : totalLeftBoxesWidth + maxChartAreaWidth;
          box.top = top;
          box.bottom = top + box.height;

          // Move to next point
          top = box.bottom;

        } else {

          box.left = left;
          box.right = left + box.width;
          box.top = totalTopBoxesHeight;
          box.bottom = totalTopBoxesHeight + maxChartAreaHeight;

          // Move to next point
          left = box.right;
        }
      }

      helpers.each(leftBoxes.concat(topBoxes), placeBox);

      // Account for chart width and height
      left += maxChartAreaWidth;
      top += maxChartAreaHeight;

      helpers.each(rightBoxes, placeBox);
      helpers.each(bottomBoxes, placeBox);

      // Step 8
      chartInstance.chartArea = {
        left: totalLeftBoxesWidth,
        top: totalTopBoxesHeight,
        right: totalLeftBoxesWidth + maxChartAreaWidth,
        bottom: totalTopBoxesHeight + maxChartAreaHeight
      };

      // Step 9
      helpers.each(chartAreaBoxes, function(box) {
        box.left = chartInstance.chartArea.left;
        box.top = chartInstance.chartArea.top;
        box.right = chartInstance.chartArea.right;
        box.bottom = chartInstance.chartArea.bottom;

        box.update(maxChartAreaWidth, maxChartAreaHeight);
      });
    }
  };
};

},{}],30:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;
  var noop = helpers.noop;

  Chart.defaults.global.legend = {

    display: true,
    position: 'top',
    fullWidth: true, // marks that this box should take the full width of the canvas (pushing down other boxes)
    reverse: false,

    // a callback that will handle
    onClick: function(e, legendItem) {
      var index = legendItem.datasetIndex;
      var ci = this.chart;
      var meta = ci.getDatasetMeta(index);

      // See controller.isDatasetVisible comment
      meta.hidden = meta.hidden === null? !ci.data.datasets[index].hidden : null;

      // We hid a dataset ... rerender the chart
      ci.update();
    },

    onHover: null,

    labels: {
      boxWidth: 40,
      padding: 10,
      // Generates labels shown in the legend
      // Valid properties to return:
      // text : text to display
      // fillStyle : fill of coloured box
      // strokeStyle: stroke of coloured box
      // hidden : if this legend item refers to a hidden item
      // lineCap : cap style for line
      // lineDash
      // lineDashOffset :
      // lineJoin :
      // lineWidth :
      generateLabels: function(chart) {
        var data = chart.data;
        return helpers.isArray(data.datasets) ? data.datasets.map(function(dataset, i) {
          return {
            text: dataset.label,
            fillStyle: (!helpers.isArray(dataset.backgroundColor) ? dataset.backgroundColor : dataset.backgroundColor[0]),
            hidden: !chart.isDatasetVisible(i),
            lineCap: dataset.borderCapStyle,
            lineDash: dataset.borderDash,
            lineDashOffset: dataset.borderDashOffset,
            lineJoin: dataset.borderJoinStyle,
            lineWidth: dataset.borderWidth,
            strokeStyle: dataset.borderColor,
            pointStyle: dataset.pointStyle,

            // Below is extra data used for toggling the datasets
            datasetIndex: i
          };
        }, this) : [];
      }
    }
  };

  /**
   * Helper function to get the box width based on the usePointStyle option
   * @param labelopts {Object} the label options on the legend
   * @param fontSize {Number} the label font size
   * @return {Number} width of the color box area
   */
  function getBoxWidth(labelOpts, fontSize) {
    return labelOpts.usePointStyle ?
      fontSize * Math.SQRT2 :
      labelOpts.boxWidth;
  }

  Chart.Legend = Chart.Element.extend({

    initialize: function(config) {
      helpers.extend(this, config);

      // Contains hit boxes for each dataset (in dataset order)
      this.legendHitBoxes = [];

      // Are we in doughnut mode which has a different data type
      this.doughnutMode = false;
    },

    // These methods are ordered by lifecycle. Utilities then follow.
    // Any function defined here is inherited by all legend types.
    // Any function can be extended by the legend type

    beforeUpdate: noop,
    update: function(maxWidth, maxHeight, margins) {
      var me = this;

      // Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
      me.beforeUpdate();

      // Absorb the master measurements
      me.maxWidth = maxWidth;
      me.maxHeight = maxHeight;
      me.margins = margins;

      // Dimensions
      me.beforeSetDimensions();
      me.setDimensions();
      me.afterSetDimensions();
      // Labels
      me.beforeBuildLabels();
      me.buildLabels();
      me.afterBuildLabels();

      // Fit
      me.beforeFit();
      me.fit();
      me.afterFit();
      //
      me.afterUpdate();

      return me.minSize;
    },
    afterUpdate: noop,

    //

    beforeSetDimensions: noop,
    setDimensions: function() {
      var me = this;
      // Set the unconstrained dimension before label rotation
      if (me.isHorizontal()) {
        // Reset position before calculating rotation
        me.width = me.maxWidth;
        me.left = 0;
        me.right = me.width;
      } else {
        me.height = me.maxHeight;

        // Reset position before calculating rotation
        me.top = 0;
        me.bottom = me.height;
      }

      // Reset padding
      me.paddingLeft = 0;
      me.paddingTop = 0;
      me.paddingRight = 0;
      me.paddingBottom = 0;

      // Reset minSize
      me.minSize = {
        width: 0,
        height: 0
      };
    },
    afterSetDimensions: noop,

    //

    beforeBuildLabels: noop,
    buildLabels: function() {
      var me = this;
      var labelOpts = me.options.labels;
      var legendItems = labelOpts.generateLabels.call(me, me.chart);

      if (labelOpts.filter) {
        legendItems = legendItems.filter(function(item) {
          return labelOpts.filter(item, me.chart.data);
        });
      }

      if (me.options.reverse) {
        legendItems.reverse();
      }

      me.legendItems = legendItems;
    },
    afterBuildLabels: noop,

    //

    beforeFit: noop,
    fit: function() {
      var me = this;
      var opts = me.options;
      var labelOpts = opts.labels;
      var display = opts.display;

      var ctx = me.ctx;

      var globalDefault = Chart.defaults.global,
        itemOrDefault = helpers.getValueOrDefault,
        fontSize = itemOrDefault(labelOpts.fontSize, globalDefault.defaultFontSize),
        fontStyle = itemOrDefault(labelOpts.fontStyle, globalDefault.defaultFontStyle),
        fontFamily = itemOrDefault(labelOpts.fontFamily, globalDefault.defaultFontFamily),
        labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);

      // Reset hit boxes
      var hitboxes = me.legendHitBoxes = [];

      var minSize = me.minSize;
      var isHorizontal = me.isHorizontal();

      if (isHorizontal) {
        minSize.width = me.maxWidth; // fill all the width
        minSize.height = display ? 10 : 0;
      } else {
        minSize.width = display ? 10 : 0;
        minSize.height = me.maxHeight; // fill all the height
      }

      // Increase sizes here
      if (display) {
        ctx.font = labelFont;

        if (isHorizontal) {
          // Labels

          // Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
          var lineWidths = me.lineWidths = [0];
          var totalHeight = me.legendItems.length ? fontSize + (labelOpts.padding) : 0;

          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          helpers.each(me.legendItems, function(legendItem, i) {
            var boxWidth = getBoxWidth(labelOpts, fontSize);
            var width = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

            if (lineWidths[lineWidths.length - 1] + width + labelOpts.padding >= me.width) {
              totalHeight += fontSize + (labelOpts.padding);
              lineWidths[lineWidths.length] = me.left;
            }

            // Store the hitbox width and height here. Final position will be updated in `draw`
            hitboxes[i] = {
              left: 0,
              top: 0,
              width: width,
              height: fontSize
            };

            lineWidths[lineWidths.length - 1] += width + labelOpts.padding;
          });

          minSize.height += totalHeight;

        } else {
          var vPadding = labelOpts.padding;
          var columnWidths = me.columnWidths = [];
          var totalWidth = labelOpts.padding;
          var currentColWidth = 0;
          var currentColHeight = 0;
          var itemHeight = fontSize + vPadding;

          helpers.each(me.legendItems, function(legendItem, i) {
            var boxWidth = getBoxWidth(labelOpts, fontSize);
            var itemWidth = boxWidth + (fontSize / 2) + ctx.measureText(legendItem.text).width;

            // If too tall, go to new column
            if (currentColHeight + itemHeight > minSize.height) {
              totalWidth += currentColWidth + labelOpts.padding;
              columnWidths.push(currentColWidth); // previous column width

              currentColWidth = 0;
              currentColHeight = 0;
            }

            // Get max width
            currentColWidth = Math.max(currentColWidth, itemWidth);
            currentColHeight += itemHeight;

            // Store the hitbox width and height here. Final position will be updated in `draw`
            hitboxes[i] = {
              left: 0,
              top: 0,
              width: itemWidth,
              height: fontSize
            };
          });

          totalWidth += currentColWidth;
          columnWidths.push(currentColWidth);
          minSize.width += totalWidth;
        }
      }

      me.width = minSize.width;
      me.height = minSize.height;
    },
    afterFit: noop,

    // Shared Methods
    isHorizontal: function() {
      return this.options.position === 'top' || this.options.position === 'bottom';
    },

    // Actually draw the legend on the canvas
    draw: function() {
      var me = this;
      var opts = me.options;
      var labelOpts = opts.labels;
      var globalDefault = Chart.defaults.global,
        lineDefault = globalDefault.elements.line,
        legendWidth = me.width,
        lineWidths = me.lineWidths;

      if (opts.display) {
        var ctx = me.ctx,
          cursor,
          itemOrDefault = helpers.getValueOrDefault,
          fontColor = itemOrDefault(labelOpts.fontColor, globalDefault.defaultFontColor),
          fontSize = itemOrDefault(labelOpts.fontSize, globalDefault.defaultFontSize),
          fontStyle = itemOrDefault(labelOpts.fontStyle, globalDefault.defaultFontStyle),
          fontFamily = itemOrDefault(labelOpts.fontFamily, globalDefault.defaultFontFamily),
          labelFont = helpers.fontString(fontSize, fontStyle, fontFamily);

        // Canvas setup
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = fontColor; // for strikethrough effect
        ctx.fillStyle = fontColor; // render in correct colour
        ctx.font = labelFont;

        var boxWidth = getBoxWidth(labelOpts, fontSize),
          hitboxes = me.legendHitBoxes;

        // current position
        var drawLegendBox = function(x, y, legendItem) {
          if (isNaN(boxWidth) || boxWidth <= 0) {
            return;
          }

          // Set the ctx for the box
          ctx.save();

          ctx.fillStyle = itemOrDefault(legendItem.fillStyle, globalDefault.defaultColor);
          ctx.lineCap = itemOrDefault(legendItem.lineCap, lineDefault.borderCapStyle);
          ctx.lineDashOffset = itemOrDefault(legendItem.lineDashOffset, lineDefault.borderDashOffset);
          ctx.lineJoin = itemOrDefault(legendItem.lineJoin, lineDefault.borderJoinStyle);
          ctx.lineWidth = itemOrDefault(legendItem.lineWidth, lineDefault.borderWidth);
          ctx.strokeStyle = itemOrDefault(legendItem.strokeStyle, globalDefault.defaultColor);
          var isLineWidthZero = (itemOrDefault(legendItem.lineWidth, lineDefault.borderWidth) === 0);

          if (ctx.setLineDash) {
            // IE 9 and 10 do not support line dash
            ctx.setLineDash(itemOrDefault(legendItem.lineDash, lineDefault.borderDash));
          }

          if (opts.labels && opts.labels.usePointStyle) {
            // Recalculate x and y for drawPoint() because its expecting
            // x and y to be center of figure (instead of top left)
            var radius = fontSize * Math.SQRT2 / 2;
            var offSet = radius / Math.SQRT2;
            var centerX = x + offSet;
            var centerY = y + offSet;

            // Draw pointStyle as legend symbol
            Chart.canvasHelpers.drawPoint(ctx, legendItem.pointStyle, radius, centerX, centerY);
          } else {
            // Draw box as legend symbol
            if (!isLineWidthZero) {
              ctx.strokeRect(x, y, boxWidth, fontSize);
            }
            ctx.fillRect(x, y, boxWidth, fontSize);
          }

          ctx.restore();
        };
        var fillText = function(x, y, legendItem, textWidth) {
          ctx.fillText(legendItem.text, boxWidth + (fontSize / 2) + x, y);

          if (legendItem.hidden) {
            // Strikethrough the text if hidden
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.moveTo(boxWidth + (fontSize / 2) + x, y + (fontSize / 2));
            ctx.lineTo(boxWidth + (fontSize / 2) + x + textWidth, y + (fontSize / 2));
            ctx.stroke();
          }
        };

        // Horizontal
        var isHorizontal = me.isHorizontal();
        if (isHorizontal) {
          cursor = {
            x: me.left + ((legendWidth - lineWidths[0]) / 2),
            y: me.top + labelOpts.padding,
            line: 0
          };
        } else {
          cursor = {
            x: me.left + labelOpts.padding,
            y: me.top + labelOpts.padding,
            line: 0
          };
        }

        var itemHeight = fontSize + labelOpts.padding;
        helpers.each(me.legendItems, function(legendItem, i) {
          var textWidth = ctx.measureText(legendItem.text).width,
            width = boxWidth + (fontSize / 2) + textWidth,
            x = cursor.x,
            y = cursor.y;

          if (isHorizontal) {
            if (x + width >= legendWidth) {
              y = cursor.y += itemHeight;
              cursor.line++;
              x = cursor.x = me.left + ((legendWidth - lineWidths[cursor.line]) / 2);
            }
          } else if (y + itemHeight > me.bottom) {
            x = cursor.x = x + me.columnWidths[cursor.line] + labelOpts.padding;
            y = cursor.y = me.top + labelOpts.padding;
            cursor.line++;
          }

          drawLegendBox(x, y, legendItem);

          hitboxes[i].left = x;
          hitboxes[i].top = y;

          // Fill the actual label
          fillText(x, y, legendItem, textWidth);

          if (isHorizontal) {
            cursor.x += width + (labelOpts.padding);
          } else {
            cursor.y += itemHeight;
          }

        });
      }
    },

    /**
     * Handle an event
     * @private
     * @param {IEvent} event - The event to handle
     * @return {Boolean} true if a change occured
     */
    handleEvent: function(e) {
      var me = this;
      var opts = me.options;
      var type = e.type === 'mouseup' ? 'click' : e.type;
      var changed = false;

      if (type === 'mousemove') {
        if (!opts.onHover) {
          return;
        }
      } else if (type === 'click') {
        if (!opts.onClick) {
          return;
        }
      } else {
        return;
      }

      // Chart event already has relative position in it
      var x = e.x,
        y = e.y;

      if (x >= me.left && x <= me.right && y >= me.top && y <= me.bottom) {
        // See if we are touching one of the dataset boxes
        var lh = me.legendHitBoxes;
        for (var i = 0; i < lh.length; ++i) {
          var hitBox = lh[i];

          if (x >= hitBox.left && x <= hitBox.left + hitBox.width && y >= hitBox.top && y <= hitBox.top + hitBox.height) {
            // Touching an element
            if (type === 'click') {
              // use e.native for backwards compatibility
              opts.onClick.call(me, e.native, me.legendItems[i]);
              changed = true;
              break;
            } else if (type === 'mousemove') {
              // use e.native for backwards compatibility
              opts.onHover.call(me, e.native, me.legendItems[i]);
              changed = true;
              break;
            }
          }
        }
      }

      return changed;
    }
  });

  function createNewLegendAndAttach(chartInstance, legendOpts) {
    var legend = new Chart.Legend({
      ctx: chartInstance.chart.ctx,
      options: legendOpts,
      chart: chartInstance
    });
    chartInstance.legend = legend;
    Chart.layoutService.addBox(chartInstance, legend);
  }

  // Register the legend plugin
  Chart.plugins.register({
    beforeInit: function(chartInstance) {
      var legendOpts = chartInstance.options.legend;

      if (legendOpts) {
        createNewLegendAndAttach(chartInstance, legendOpts);
      }
    },
    beforeUpdate: function(chartInstance) {
      var legendOpts = chartInstance.options.legend;

      if (legendOpts) {
        legendOpts = helpers.configMerge(Chart.defaults.global.legend, legendOpts);

        if (chartInstance.legend) {
          chartInstance.legend.options = legendOpts;
        } else {
          createNewLegendAndAttach(chartInstance, legendOpts);
        }
      } else {
        Chart.layoutService.removeBox(chartInstance, chartInstance.legend);
        delete chartInstance.legend;
      }
    },
    afterEvent: function(chartInstance, e) {
      var legend = chartInstance.legend;
      if (legend) {
        legend.handleEvent(e);
      }
    }
  });
};

},{}],31:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.global.plugins = {};

  /**
   * The plugin service singleton
   * @namespace Chart.plugins
   * @since 2.1.0
   */
  Chart.plugins = {
    /**
     * Globally registered plugins.
     * @private
     */
    _plugins: [],

    /**
     * This identifier is used to invalidate the descriptors cache attached to each chart
     * when a global plugin is registered or unregistered. In this case, the cache ID is
     * incremented and descriptors are regenerated during following API calls.
     * @private
     */
    _cacheId: 0,

    /**
     * Registers the given plugin(s) if not already registered.
     * @param {Array|Object} plugins plugin instance(s).
     */
    register: function(plugins) {
      var p = this._plugins;
      ([]).concat(plugins).forEach(function(plugin) {
        if (p.indexOf(plugin) === -1) {
          p.push(plugin);
        }
      });

      this._cacheId++;
    },

    /**
     * Unregisters the given plugin(s) only if registered.
     * @param {Array|Object} plugins plugin instance(s).
     */
    unregister: function(plugins) {
      var p = this._plugins;
      ([]).concat(plugins).forEach(function(plugin) {
        var idx = p.indexOf(plugin);
        if (idx !== -1) {
          p.splice(idx, 1);
        }
      });

      this._cacheId++;
    },

    /**
     * Remove all registered plugins.
     * @since 2.1.5
     */
    clear: function() {
      this._plugins = [];
      this._cacheId++;
    },

    /**
     * Returns the number of registered plugins?
     * @returns {Number}
     * @since 2.1.5
     */
    count: function() {
      return this._plugins.length;
    },

    /**
     * Returns all registered plugin instances.
     * @returns {Array} array of plugin objects.
     * @since 2.1.5
     */
    getAll: function() {
      return this._plugins;
    },

    /**
     * Calls enabled plugins for `chart` on the specified hook and with the given args.
     * This method immediately returns as soon as a plugin explicitly returns false. The
     * returned value can be used, for instance, to interrupt the current action.
     * @param {Object} chart - The chart instance for which plugins should be called.
     * @param {String} hook - The name of the plugin method to call (e.g. 'beforeUpdate').
     * @param {Array} [args] - Extra arguments to apply to the hook call.
     * @returns {Boolean} false if any of the plugins return false, else returns true.
     */
    notify: function(chart, hook, args) {
      var descriptors = this.descriptors(chart);
      var ilen = descriptors.length;
      var i, descriptor, plugin, params, method;

      for (i=0; i<ilen; ++i) {
        descriptor = descriptors[i];
        plugin = descriptor.plugin;
        method = plugin[hook];
        if (typeof method === 'function') {
          params = [chart].concat(args || []);
          params.push(descriptor.options);
          if (method.apply(plugin, params) === false) {
            return false;
          }
        }
      }

      return true;
    },

    /**
     * Returns descriptors of enabled plugins for the given chart.
     * @returns {Array} [{ plugin, options }]
     * @private
     */
    descriptors: function(chart) {
      var cache = chart._plugins || (chart._plugins = {});
      if (cache.id === this._cacheId) {
        return cache.descriptors;
      }

      var plugins = [];
      var descriptors = [];
      var config = (chart && chart.config) || {};
      var defaults = Chart.defaults.global.plugins;
      var options = (config.options && config.options.plugins) || {};

      this._plugins.concat(config.plugins || []).forEach(function(plugin) {
        var idx = plugins.indexOf(plugin);
        if (idx !== -1) {
          return;
        }

        var id = plugin.id;
        var opts = options[id];
        if (opts === false) {
          return;
        }

        if (opts === true) {
          opts = helpers.clone(defaults[id]);
        }

        plugins.push(plugin);
        descriptors.push({
          plugin: plugin,
          options: opts || {}
        });
      });

      cache.descriptors = descriptors;
      cache.id = this._cacheId;
      return descriptors;
    }
  };

  /**
   * Plugin extension hooks.
   * @interface IPlugin
   * @since 2.1.0
   */
  /**
   * @method IPlugin#beforeInit
   * @desc Called before initializing `chart`.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#afterInit
   * @desc Called after `chart` has been initialized and before the first update.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#beforeUpdate
   * @desc Called before updating `chart`. If any plugin returns `false`, the update
   * is cancelled (and thus subsequent render(s)) until another `update` is triggered.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   * @returns {Boolean} `false` to cancel the chart update.
   */
  /**
   * @method IPlugin#afterUpdate
   * @desc Called after `chart` has been updated and before rendering. Note that this
   * hook will not be called if the chart update has been previously cancelled.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#beforeDatasetsUpdate
   * @desc Called before updating the `chart` datasets. If any plugin returns `false`,
   * the datasets update is cancelled until another `update` is triggered.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   * @returns {Boolean} false to cancel the datasets update.
   * @since version 2.1.5
   */
  /**
   * @method IPlugin#afterDatasetsUpdate
   * @desc Called after the `chart` datasets have been updated. Note that this hook
   * will not be called if the datasets update has been previously cancelled.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   * @since version 2.1.5
   */
  /**
   * @method IPlugin#beforeLayout
   * @desc Called before laying out `chart`. If any plugin returns `false`,
   * the layout update is cancelled until another `update` is triggered.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   * @returns {Boolean} `false` to cancel the chart layout.
   */
  /**
   * @method IPlugin#afterLayout
   * @desc Called after the `chart` has been layed out. Note that this hook will not
   * be called if the layout update has been previously cancelled.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#beforeRender
   * @desc Called before rendering `chart`. If any plugin returns `false`,
   * the rendering is cancelled until another `render` is triggered.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   * @returns {Boolean} `false` to cancel the chart rendering.
   */
  /**
   * @method IPlugin#afterRender
   * @desc Called after the `chart` has been fully rendered (and animation completed). Note
   * that this hook will not be called if the rendering has been previously cancelled.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#beforeDraw
   * @desc Called before drawing `chart` at every animation frame specified by the given
   * easing value. If any plugin returns `false`, the frame drawing is cancelled until
   * another `render` is triggered.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
   * @param {Object} options - The plugin options.
   * @returns {Boolean} `false` to cancel the chart drawing.
   */
  /**
   * @method IPlugin#afterDraw
   * @desc Called after the `chart` has been drawn for the specific easing value. Note
   * that this hook will not be called if the drawing has been previously cancelled.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#beforeDatasetsDraw
   * @desc Called before drawing the `chart` datasets. If any plugin returns `false`,
   * the datasets drawing is cancelled until another `render` is triggered.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
   * @param {Object} options - The plugin options.
   * @returns {Boolean} `false` to cancel the chart datasets drawing.
   */
  /**
   * @method IPlugin#afterDatasetsDraw
   * @desc Called after the `chart` datasets have been drawn. Note that this hook
   * will not be called if the datasets drawing has been previously cancelled.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Number} easingValue - The current animation value, between 0.0 and 1.0.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#beforeEvent
   * @desc Called before processing the specified `event`. If any plugin returns `false`,
   * the event will be discarded.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {IEvent} event - The event object.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#afterEvent
   * @desc Called after the `event` has been consumed. Note that this hook
   * will not be called if the `event` has been previously discarded.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {IEvent} event - The event object.
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#resize
   * @desc Called after the chart as been resized.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Number} size - The new canvas display size (eq. canvas.style width & height).
   * @param {Object} options - The plugin options.
   */
  /**
   * @method IPlugin#destroy
   * @desc Called after the chart as been destroyed.
   * @param {Chart.Controller} chart - The chart instance.
   * @param {Object} options - The plugin options.
   */

  /**
   * Provided for backward compatibility, use Chart.plugins instead
   * @namespace Chart.pluginService
   * @deprecated since version 2.1.5
   * @todo remove at version 3
   * @private
   */
  Chart.pluginService = Chart.plugins;

  /**
   * Provided for backward compatibility, inheriting from Chart.PlugingBase has no
   * effect, instead simply create/register plugins via plain JavaScript objects.
   * @interface Chart.PluginBase
   * @deprecated since version 2.5.0
   * @todo remove at version 3
   * @private
   */
  Chart.PluginBase = helpers.inherits({});
};

},{}],32:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.scale = {
    display: true,
    position: 'left',

    // grid line settings
    gridLines: {
      display: true,
      color: 'rgba(0, 0, 0, 0.1)',
      lineWidth: 1,
      drawBorder: true,
      drawOnChartArea: true,
      drawTicks: true,
      tickMarkLength: 10,
      zeroLineWidth: 1,
      zeroLineColor: 'rgba(0,0,0,0.25)',
      offsetGridLines: false,
      borderDash: [],
      borderDashOffset: 0.0
    },

    // scale label
    scaleLabel: {
      // actual label
      labelString: '',

      // display property
      display: false
    },

    // label settings
    ticks: {
      beginAtZero: false,
      minRotation: 0,
      maxRotation: 50,
      mirror: false,
      padding: 0,
      reverse: false,
      display: true,
      autoSkip: true,
      autoSkipPadding: 0,
      labelOffset: 0,
      // We pass through arrays to be rendered as multiline labels, we convert Others to strings here.
      callback: Chart.Ticks.formatters.values
    }
  };

  function computeTextSize(context, tick, font) {
    return helpers.isArray(tick) ?
      helpers.longestText(context, font, tick) :
      context.measureText(tick).width;
  }

  function parseFontOptions(options) {
    var getValueOrDefault = helpers.getValueOrDefault;
    var globalDefaults = Chart.defaults.global;
    var size = getValueOrDefault(options.fontSize, globalDefaults.defaultFontSize);
    var style = getValueOrDefault(options.fontStyle, globalDefaults.defaultFontStyle);
    var family = getValueOrDefault(options.fontFamily, globalDefaults.defaultFontFamily);

    return {
      size: size,
      style: style,
      family: family,
      font: helpers.fontString(size, style, family)
    };
  }

  Chart.Scale = Chart.Element.extend({
    /**
     * Get the padding needed for the scale
     * @method getPadding
     * @private
     * @returns {Padding} the necessary padding
     */
    getPadding: function() {
      var me = this;
      return {
        left: me.paddingLeft || 0,
        top: me.paddingTop || 0,
        right: me.paddingRight || 0,
        bottom: me.paddingBottom || 0
      };
    },

    // These methods are ordered by lifecyle. Utilities then follow.
    // Any function defined here is inherited by all scale types.
    // Any function can be extended by the scale type

    beforeUpdate: function() {
      helpers.callCallback(this.options.beforeUpdate, [this]);
    },
    update: function(maxWidth, maxHeight, margins) {
      var me = this;

      // Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
      me.beforeUpdate();

      // Absorb the master measurements
      me.maxWidth = maxWidth;
      me.maxHeight = maxHeight;
      me.margins = helpers.extend({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }, margins);
      me.longestTextCache = me.longestTextCache || {};

      // Dimensions
      me.beforeSetDimensions();
      me.setDimensions();
      me.afterSetDimensions();

      // Data min/max
      me.beforeDataLimits();
      me.determineDataLimits();
      me.afterDataLimits();

      // Ticks
      me.beforeBuildTicks();
      me.buildTicks();
      me.afterBuildTicks();

      me.beforeTickToLabelConversion();
      me.convertTicksToLabels();
      me.afterTickToLabelConversion();

      // Tick Rotation
      me.beforeCalculateTickRotation();
      me.calculateTickRotation();
      me.afterCalculateTickRotation();
      // Fit
      me.beforeFit();
      me.fit();
      me.afterFit();
      //
      me.afterUpdate();

      return me.minSize;

    },
    afterUpdate: function() {
      helpers.callCallback(this.options.afterUpdate, [this]);
    },

    //

    beforeSetDimensions: function() {
      helpers.callCallback(this.options.beforeSetDimensions, [this]);
    },
    setDimensions: function() {
      var me = this;
      // Set the unconstrained dimension before label rotation
      if (me.isHorizontal()) {
        // Reset position before calculating rotation
        me.width = me.maxWidth;
        me.left = 0;
        me.right = me.width;
      } else {
        me.height = me.maxHeight;

        // Reset position before calculating rotation
        me.top = 0;
        me.bottom = me.height;
      }

      // Reset padding
      me.paddingLeft = 0;
      me.paddingTop = 0;
      me.paddingRight = 0;
      me.paddingBottom = 0;
    },
    afterSetDimensions: function() {
      helpers.callCallback(this.options.afterSetDimensions, [this]);
    },

    // Data limits
    beforeDataLimits: function() {
      helpers.callCallback(this.options.beforeDataLimits, [this]);
    },
    determineDataLimits: helpers.noop,
    afterDataLimits: function() {
      helpers.callCallback(this.options.afterDataLimits, [this]);
    },

    //
    beforeBuildTicks: function() {
      helpers.callCallback(this.options.beforeBuildTicks, [this]);
    },
    buildTicks: helpers.noop,
    afterBuildTicks: function() {
      helpers.callCallback(this.options.afterBuildTicks, [this]);
    },

    beforeTickToLabelConversion: function() {
      helpers.callCallback(this.options.beforeTickToLabelConversion, [this]);
    },
    convertTicksToLabels: function() {
      var me = this;
      // Convert ticks to strings
      var tickOpts = me.options.ticks;
      me.ticks = me.ticks.map(tickOpts.userCallback || tickOpts.callback);
    },
    afterTickToLabelConversion: function() {
      helpers.callCallback(this.options.afterTickToLabelConversion, [this]);
    },

    //

    beforeCalculateTickRotation: function() {
      helpers.callCallback(this.options.beforeCalculateTickRotation, [this]);
    },
    calculateTickRotation: function() {
      var me = this;
      var context = me.ctx;
      var tickOpts = me.options.ticks;

      // Get the width of each grid by calculating the difference
      // between x offsets between 0 and 1.
      var tickFont = parseFontOptions(tickOpts);
      context.font = tickFont.font;

      var labelRotation = tickOpts.minRotation || 0;

      if (me.options.display && me.isHorizontal()) {
        var originalLabelWidth = helpers.longestText(context, tickFont.font, me.ticks, me.longestTextCache);
        var labelWidth = originalLabelWidth;
        var cosRotation;
        var sinRotation;

        // Allow 3 pixels x2 padding either side for label readability
        var tickWidth = me.getPixelForTick(1) - me.getPixelForTick(0) - 6;

        // Max label rotation can be set or default to 90 - also act as a loop counter
        while (labelWidth > tickWidth && labelRotation < tickOpts.maxRotation) {
          var angleRadians = helpers.toRadians(labelRotation);
          cosRotation = Math.cos(angleRadians);
          sinRotation = Math.sin(angleRadians);

          if (sinRotation * originalLabelWidth > me.maxHeight) {
            // go back one step
            labelRotation--;
            break;
          }

          labelRotation++;
          labelWidth = cosRotation * originalLabelWidth;
        }
      }

      me.labelRotation = labelRotation;
    },
    afterCalculateTickRotation: function() {
      helpers.callCallback(this.options.afterCalculateTickRotation, [this]);
    },

    //

    beforeFit: function() {
      helpers.callCallback(this.options.beforeFit, [this]);
    },
    fit: function() {
      var me = this;
      // Reset
      var minSize = me.minSize = {
        width: 0,
        height: 0
      };

      var opts = me.options;
      var tickOpts = opts.ticks;
      var scaleLabelOpts = opts.scaleLabel;
      var gridLineOpts = opts.gridLines;
      var display = opts.display;
      var isHorizontal = me.isHorizontal();

      var tickFont = parseFontOptions(tickOpts);
      var scaleLabelFontSize = parseFontOptions(scaleLabelOpts).size * 1.5;
      var tickMarkLength = opts.gridLines.tickMarkLength;

      // Width
      if (isHorizontal) {
        // subtract the margins to line up with the chartArea if we are a full width scale
        minSize.width = me.isFullWidth() ? me.maxWidth - me.margins.left - me.margins.right : me.maxWidth;
      } else {
        minSize.width = display && gridLineOpts.drawTicks ? tickMarkLength : 0;
      }

      // height
      if (isHorizontal) {
        minSize.height = display && gridLineOpts.drawTicks ? tickMarkLength : 0;
      } else {
        minSize.height = me.maxHeight; // fill all the height
      }

      // Are we showing a title for the scale?
      if (scaleLabelOpts.display && display) {
        if (isHorizontal) {
          minSize.height += scaleLabelFontSize;
        } else {
          minSize.width += scaleLabelFontSize;
        }
      }

      // Don't bother fitting the ticks if we are not showing them
      if (tickOpts.display && display) {
        var largestTextWidth = helpers.longestText(me.ctx, tickFont.font, me.ticks, me.longestTextCache);
        var tallestLabelHeightInLines = helpers.numberOfLabelLines(me.ticks);
        var lineSpace = tickFont.size * 0.5;

        if (isHorizontal) {
          // A horizontal axis is more constrained by the height.
          me.longestLabelWidth = largestTextWidth;

          var angleRadians = helpers.toRadians(me.labelRotation);
          var cosRotation = Math.cos(angleRadians);
          var sinRotation = Math.sin(angleRadians);

          // TODO - improve this calculation
          var labelHeight = (sinRotation * largestTextWidth)
            + (tickFont.size * tallestLabelHeightInLines)
            + (lineSpace * tallestLabelHeightInLines);

          minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight);
          me.ctx.font = tickFont.font;

          var firstTick = me.ticks[0];
          var firstLabelWidth = computeTextSize(me.ctx, firstTick, tickFont.font);

          var lastTick = me.ticks[me.ticks.length - 1];
          var lastLabelWidth = computeTextSize(me.ctx, lastTick, tickFont.font);

          // Ensure that our ticks are always inside the canvas. When rotated, ticks are right aligned which means that the right padding is dominated
          // by the font height
          if (me.labelRotation !== 0) {
            me.paddingLeft = opts.position === 'bottom'? (cosRotation * firstLabelWidth) + 3: (cosRotation * lineSpace) + 3; // add 3 px to move away from canvas edges
            me.paddingRight = opts.position === 'bottom'? (cosRotation * lineSpace) + 3: (cosRotation * lastLabelWidth) + 3;
          } else {
            me.paddingLeft = firstLabelWidth / 2 + 3; // add 3 px to move away from canvas edges
            me.paddingRight = lastLabelWidth / 2 + 3;
          }
        } else {
          // A vertical axis is more constrained by the width. Labels are the dominant factor here, so get that length first
          // Account for padding

          if (tickOpts.mirror) {
            largestTextWidth = 0;
          } else {
            largestTextWidth += me.options.ticks.padding;
          }
          minSize.width += largestTextWidth;
          me.paddingTop = tickFont.size / 2;
          me.paddingBottom = tickFont.size / 2;
        }
      }

      me.handleMargins();

      me.width = minSize.width;
      me.height = minSize.height;
    },

    /**
     * Handle margins and padding interactions
     * @private
     */
    handleMargins: function() {
      var me = this;
      if (me.margins) {
        me.paddingLeft = Math.max(me.paddingLeft - me.margins.left, 0);
        me.paddingTop = Math.max(me.paddingTop - me.margins.top, 0);
        me.paddingRight = Math.max(me.paddingRight - me.margins.right, 0);
        me.paddingBottom = Math.max(me.paddingBottom - me.margins.bottom, 0);
      }
    },

    afterFit: function() {
      helpers.callCallback(this.options.afterFit, [this]);
    },

    // Shared Methods
    isHorizontal: function() {
      return this.options.position === 'top' || this.options.position === 'bottom';
    },
    isFullWidth: function() {
      return (this.options.fullWidth);
    },

    // Get the correct value. NaN bad inputs, If the value type is object get the x or y based on whether we are horizontal or not
    getRightValue: function(rawValue) {
      // Null and undefined values first
      if (rawValue === null || typeof(rawValue) === 'undefined') {
        return NaN;
      }
      // isNaN(object) returns true, so make sure NaN is checking for a number; Discard Infinite values
      if (typeof(rawValue) === 'number' && !isFinite(rawValue)) {
        return NaN;
      }
      // If it is in fact an object, dive in one more level
      if (typeof(rawValue) === 'object') {
        if ((rawValue instanceof Date) || (rawValue.isValid)) {
          return rawValue;
        }
        return this.getRightValue(this.isHorizontal() ? rawValue.x : rawValue.y);
      }

      // Value is good, return it
      return rawValue;
    },

    // Used to get the value to display in the tooltip for the data at the given index
    // function getLabelForIndex(index, datasetIndex)
    getLabelForIndex: helpers.noop,

    // Used to get data value locations.  Value can either be an index or a numerical value
    getPixelForValue: helpers.noop,

    // Used to get the data value from a given pixel. This is the inverse of getPixelForValue
    getValueForPixel: helpers.noop,

    // Used for tick location, should
    getPixelForTick: function(index, includeOffset) {
      var me = this;
      if (me.isHorizontal()) {
        var innerWidth = me.width - (me.paddingLeft + me.paddingRight);
        var tickWidth = innerWidth / Math.max((me.ticks.length - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
        var pixel = (tickWidth * index) + me.paddingLeft;

        if (includeOffset) {
          pixel += tickWidth / 2;
        }

        var finalVal = me.left + Math.round(pixel);
        finalVal += me.isFullWidth() ? me.margins.left : 0;
        return finalVal;
      }
      var innerHeight = me.height - (me.paddingTop + me.paddingBottom);
      return me.top + (index * (innerHeight / (me.ticks.length - 1)));
    },

    // Utility for getting the pixel location of a percentage of scale
    getPixelForDecimal: function(decimal /* , includeOffset*/) {
      var me = this;
      if (me.isHorizontal()) {
        var innerWidth = me.width - (me.paddingLeft + me.paddingRight);
        var valueOffset = (innerWidth * decimal) + me.paddingLeft;

        var finalVal = me.left + Math.round(valueOffset);
        finalVal += me.isFullWidth() ? me.margins.left : 0;
        return finalVal;
      }
      return me.top + (decimal * me.height);
    },

    getBasePixel: function() {
      return this.getPixelForValue(this.getBaseValue());
    },

    getBaseValue: function() {
      var me = this;
      var min = me.min;
      var max = me.max;

      return me.beginAtZero ? 0:
        min < 0 && max < 0? max :
        min > 0 && max > 0? min :
        0;
    },

    // Actually draw the scale on the canvas
    // @param {rectangle} chartArea : the area of the chart to draw full grid lines on
    draw: function(chartArea) {
      var me = this;
      var options = me.options;
      if (!options.display) {
        return;
      }

      var context = me.ctx;
      var globalDefaults = Chart.defaults.global;
      var optionTicks = options.ticks;
      var gridLines = options.gridLines;
      var scaleLabel = options.scaleLabel;

      var isRotated = me.labelRotation !== 0;
      var skipRatio;
      var useAutoskipper = optionTicks.autoSkip;
      var isHorizontal = me.isHorizontal();

      // figure out the maximum number of gridlines to show
      var maxTicks;
      if (optionTicks.maxTicksLimit) {
        maxTicks = optionTicks.maxTicksLimit;
      }

      var tickFontColor = helpers.getValueOrDefault(optionTicks.fontColor, globalDefaults.defaultFontColor);
      var tickFont = parseFontOptions(optionTicks);

      var tl = gridLines.drawTicks ? gridLines.tickMarkLength : 0;
      var borderDash = helpers.getValueOrDefault(gridLines.borderDash, globalDefaults.borderDash);
      var borderDashOffset = helpers.getValueOrDefault(gridLines.borderDashOffset, globalDefaults.borderDashOffset);

      var scaleLabelFontColor = helpers.getValueOrDefault(scaleLabel.fontColor, globalDefaults.defaultFontColor);
      var scaleLabelFont = parseFontOptions(scaleLabel);

      var labelRotationRadians = helpers.toRadians(me.labelRotation);
      var cosRotation = Math.cos(labelRotationRadians);
      var longestRotatedLabel = me.longestLabelWidth * cosRotation;

      // Make sure we draw text in the correct color and font
      context.fillStyle = tickFontColor;

      var itemsToDraw = [];

      if (isHorizontal) {
        skipRatio = false;

        // Only calculate the skip ratio with the half width of longestRotateLabel if we got an actual rotation
        // See #2584
        if (isRotated) {
          longestRotatedLabel /= 2;
        }

        if ((longestRotatedLabel + optionTicks.autoSkipPadding) * me.ticks.length > (me.width - (me.paddingLeft + me.paddingRight))) {
          skipRatio = 1 + Math.floor(((longestRotatedLabel + optionTicks.autoSkipPadding) * me.ticks.length) / (me.width - (me.paddingLeft + me.paddingRight)));
        }

        // if they defined a max number of optionTicks,
        // increase skipRatio until that number is met
        if (maxTicks && me.ticks.length > maxTicks) {
          while (!skipRatio || me.ticks.length / (skipRatio || 1) > maxTicks) {
            if (!skipRatio) {
              skipRatio = 1;
            }
            skipRatio += 1;
          }
        }

        if (!useAutoskipper) {
          skipRatio = false;
        }
      }


      var xTickStart = options.position === 'right' ? me.left : me.right - tl;
      var xTickEnd = options.position === 'right' ? me.left + tl : me.right;
      var yTickStart = options.position === 'bottom' ? me.top : me.bottom - tl;
      var yTickEnd = options.position === 'bottom' ? me.top + tl : me.bottom;

      helpers.each(me.ticks, function(label, index) {
        // If the callback returned a null or undefined value, do not draw this line
        if (label === undefined || label === null) {
          return;
        }

        var isLastTick = me.ticks.length === index + 1;

        // Since we always show the last tick,we need may need to hide the last shown one before
        var shouldSkip = (skipRatio > 1 && index % skipRatio > 0) || (index % skipRatio === 0 && index + skipRatio >= me.ticks.length);
        if (shouldSkip && !isLastTick || (label === undefined || label === null)) {
          return;
        }

        var lineWidth, lineColor;
        if (index === (typeof me.zeroLineIndex !== 'undefined' ? me.zeroLineIndex : 0)) {
          // Draw the first index specially
          lineWidth = gridLines.zeroLineWidth;
          lineColor = gridLines.zeroLineColor;
        } else {
          lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, index);
          lineColor = helpers.getValueAtIndexOrDefault(gridLines.color, index);
        }

        // Common properties
        var tx1, ty1, tx2, ty2, x1, y1, x2, y2, labelX, labelY;
        var textAlign = 'middle';
        var textBaseline = 'middle';

        if (isHorizontal) {

          if (options.position === 'bottom') {
            // bottom
            textBaseline = !isRotated? 'top':'middle';
            textAlign = !isRotated? 'center': 'right';
            labelY = me.top + tl;
          } else {
            // top
            textBaseline = !isRotated? 'bottom':'middle';
            textAlign = !isRotated? 'center': 'left';
            labelY = me.bottom - tl;
          }

          var xLineValue = me.getPixelForTick(index) + helpers.aliasPixel(lineWidth); // xvalues for grid lines
          labelX = me.getPixelForTick(index, gridLines.offsetGridLines) + optionTicks.labelOffset; // x values for optionTicks (need to consider offsetLabel option)

          tx1 = tx2 = x1 = x2 = xLineValue;
          ty1 = yTickStart;
          ty2 = yTickEnd;
          y1 = chartArea.top;
          y2 = chartArea.bottom;
        } else {
          var isLeft = options.position === 'left';
          var tickPadding = optionTicks.padding;
          var labelXOffset;

          if (optionTicks.mirror) {
            textAlign = isLeft ? 'left' : 'right';
            labelXOffset = tickPadding;
          } else {
            textAlign = isLeft ? 'right' : 'left';
            labelXOffset = tl + tickPadding;
          }

          labelX = isLeft ? me.right - labelXOffset : me.left + labelXOffset;

          var yLineValue = me.getPixelForTick(index); // xvalues for grid lines
          yLineValue += helpers.aliasPixel(lineWidth);
          labelY = me.getPixelForTick(index, gridLines.offsetGridLines);

          tx1 = xTickStart;
          tx2 = xTickEnd;
          x1 = chartArea.left;
          x2 = chartArea.right;
          ty1 = ty2 = y1 = y2 = yLineValue;
        }

        itemsToDraw.push({
          tx1: tx1,
          ty1: ty1,
          tx2: tx2,
          ty2: ty2,
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          labelX: labelX,
          labelY: labelY,
          glWidth: lineWidth,
          glColor: lineColor,
          glBorderDash: borderDash,
          glBorderDashOffset: borderDashOffset,
          rotation: -1 * labelRotationRadians,
          label: label,
          textBaseline: textBaseline,
          textAlign: textAlign
        });
      });

      // Draw all of the tick labels, tick marks, and grid lines at the correct places
      helpers.each(itemsToDraw, function(itemToDraw) {
        if (gridLines.display) {
          context.save();
          context.lineWidth = itemToDraw.glWidth;
          context.strokeStyle = itemToDraw.glColor;
          if (context.setLineDash) {
            context.setLineDash(itemToDraw.glBorderDash);
            context.lineDashOffset = itemToDraw.glBorderDashOffset;
          }

          context.beginPath();

          if (gridLines.drawTicks) {
            context.moveTo(itemToDraw.tx1, itemToDraw.ty1);
            context.lineTo(itemToDraw.tx2, itemToDraw.ty2);
          }

          if (gridLines.drawOnChartArea) {
            context.moveTo(itemToDraw.x1, itemToDraw.y1);
            context.lineTo(itemToDraw.x2, itemToDraw.y2);
          }

          context.stroke();
          context.restore();
        }

        if (optionTicks.display) {
          context.save();
          context.translate(itemToDraw.labelX, itemToDraw.labelY);
          context.rotate(itemToDraw.rotation);
          context.font = tickFont.font;
          context.textBaseline = itemToDraw.textBaseline;
          context.textAlign = itemToDraw.textAlign;

          var label = itemToDraw.label;
          if (helpers.isArray(label)) {
            for (var i = 0, y = 0; i < label.length; ++i) {
              // We just make sure the multiline element is a string here..
              context.fillText('' + label[i], 0, y);
              // apply same lineSpacing as calculated @ L#320
              y += (tickFont.size * 1.5);
            }
          } else {
            context.fillText(label, 0, 0);
          }
          context.restore();
        }
      });

      if (scaleLabel.display) {
        // Draw the scale label
        var scaleLabelX;
        var scaleLabelY;
        var rotation = 0;

        if (isHorizontal) {
          scaleLabelX = me.left + ((me.right - me.left) / 2); // midpoint of the width
          scaleLabelY = options.position === 'bottom' ? me.bottom - (scaleLabelFont.size / 2) : me.top + (scaleLabelFont.size / 2);
        } else {
          var isLeft = options.position === 'left';
          scaleLabelX = isLeft ? me.left + (scaleLabelFont.size / 2) : me.right - (scaleLabelFont.size / 2);
          scaleLabelY = me.top + ((me.bottom - me.top) / 2);
          rotation = isLeft ? -0.5 * Math.PI : 0.5 * Math.PI;
        }

        context.save();
        context.translate(scaleLabelX, scaleLabelY);
        context.rotate(rotation);
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = scaleLabelFontColor; // render in correct colour
        context.font = scaleLabelFont.font;
        context.fillText(scaleLabel.labelString, 0, 0);
        context.restore();
      }

      if (gridLines.drawBorder) {
        // Draw the line at the edge of the axis
        context.lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, 0);
        context.strokeStyle = helpers.getValueAtIndexOrDefault(gridLines.color, 0);
        var x1 = me.left,
          x2 = me.right,
          y1 = me.top,
          y2 = me.bottom;

        var aliasPixel = helpers.aliasPixel(context.lineWidth);
        if (isHorizontal) {
          y1 = y2 = options.position === 'top' ? me.bottom : me.top;
          y1 += aliasPixel;
          y2 += aliasPixel;
        } else {
          x1 = x2 = options.position === 'left' ? me.right : me.left;
          x1 += aliasPixel;
          x2 += aliasPixel;
        }

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      }
    }
  });
};

},{}],33:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.scaleService = {
    // Scale registration object. Extensions can register new scale types (such as log or DB scales) and then
    // use the new chart options to grab the correct scale
    constructors: {},
    // Use a registration function so that we can move to an ES6 map when we no longer need to support
    // old browsers

    // Scale config defaults
    defaults: {},
    registerScaleType: function(type, scaleConstructor, defaults) {
      this.constructors[type] = scaleConstructor;
      this.defaults[type] = helpers.clone(defaults);
    },
    getScaleConstructor: function(type) {
      return this.constructors.hasOwnProperty(type) ? this.constructors[type] : undefined;
    },
    getScaleDefaults: function(type) {
      // Return the scale defaults merged with the global settings so that we always use the latest ones
      return this.defaults.hasOwnProperty(type) ? helpers.scaleMerge(Chart.defaults.scale, this.defaults[type]) : {};
    },
    updateScaleDefaults: function(type, additions) {
      var defaults = this.defaults;
      if (defaults.hasOwnProperty(type)) {
        defaults[type] = helpers.extend(defaults[type], additions);
      }
    },
    addScalesToLayout: function(chartInstance) {
      // Adds each scale to the chart.boxes array to be sized accordingly
      helpers.each(chartInstance.scales, function(scale) {
        Chart.layoutService.addBox(chartInstance, scale);
      });
    }
  };
};

},{}],34:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  /**
   * Namespace to hold static tick generation functions
   * @namespace Chart.Ticks
   */
  Chart.Ticks = {
    /**
     * Namespace to hold generators for different types of ticks
     * @namespace Chart.Ticks.generators
     */
    generators: {
      /**
       * Interface for the options provided to the numeric tick generator
       * @interface INumericTickGenerationOptions
       */
      /**
       * The maximum number of ticks to display
       * @name INumericTickGenerationOptions#maxTicks
       * @type Number
       */
      /**
       * The distance between each tick.
       * @name INumericTickGenerationOptions#stepSize
       * @type Number
       * @optional
       */
      /**
       * Forced minimum for the ticks. If not specified, the minimum of the data range is used to calculate the tick minimum
       * @name INumericTickGenerationOptions#min
       * @type Number
       * @optional
       */
      /**
       * The maximum value of the ticks. If not specified, the maximum of the data range is used to calculate the tick maximum
       * @name INumericTickGenerationOptions#max
       * @type Number
       * @optional
       */

      /**
       * Generate a set of linear ticks
       * @method Chart.Ticks.generators.linear
       * @param generationOptions {INumericTickGenerationOptions} the options used to generate the ticks
       * @param dataRange {IRange} the range of the data
       * @returns {Array<Number>} array of tick values
       */
      linear: function(generationOptions, dataRange) {
        var ticks = [];
        // To get a "nice" value for the tick spacing, we will use the appropriately named
        // "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
        // for details.

        var spacing;
        if (generationOptions.stepSize && generationOptions.stepSize > 0) {
          spacing = generationOptions.stepSize;
        } else {
          var niceRange = helpers.niceNum(dataRange.max - dataRange.min, false);
          spacing = helpers.niceNum(niceRange / (generationOptions.maxTicks - 1), true);
        }
        var niceMin = Math.floor(dataRange.min / spacing) * spacing;
        var niceMax = Math.ceil(dataRange.max / spacing) * spacing;

        // If min, max and stepSize is set and they make an evenly spaced scale use it.
        if (generationOptions.min && generationOptions.max && generationOptions.stepSize) {
          // If very close to our whole number, use it.
          if (helpers.almostWhole((generationOptions.max - generationOptions.min) / generationOptions.stepSize, spacing / 1000)) {
            niceMin = generationOptions.min;
            niceMax = generationOptions.max;
          }
        }

        var numSpaces = (niceMax - niceMin) / spacing;
        // If very close to our rounded value, use it.
        if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
          numSpaces = Math.round(numSpaces);
        } else {
          numSpaces = Math.ceil(numSpaces);
        }

        // Put the values into the ticks array
        ticks.push(generationOptions.min !== undefined ? generationOptions.min : niceMin);
        for (var j = 1; j < numSpaces; ++j) {
          ticks.push(niceMin + (j * spacing));
        }
        ticks.push(generationOptions.max !== undefined ? generationOptions.max : niceMax);

        return ticks;
      },

      /**
       * Generate a set of logarithmic ticks
       * @method Chart.Ticks.generators.logarithmic
       * @param generationOptions {INumericTickGenerationOptions} the options used to generate the ticks
       * @param dataRange {IRange} the range of the data
       * @returns {Array<Number>} array of tick values
       */
      logarithmic: function(generationOptions, dataRange) {
        var ticks = [];
        var getValueOrDefault = helpers.getValueOrDefault;

        // Figure out what the max number of ticks we can support it is based on the size of
        // the axis area. For now, we say that the minimum tick spacing in pixels must be 50
        // We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
        // the graph
        var tickVal = getValueOrDefault(generationOptions.min, Math.pow(10, Math.floor(helpers.log10(dataRange.min))));

        var endExp = Math.floor(helpers.log10(dataRange.max));
        var endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
        var exp;
        var significand;

        if (tickVal === 0) {
          exp = Math.floor(helpers.log10(dataRange.minNotZero));
          significand = Math.floor(dataRange.minNotZero / Math.pow(10, exp));

          ticks.push(tickVal);
          tickVal = significand * Math.pow(10, exp);
        } else {
          exp = Math.floor(helpers.log10(tickVal));
          significand = Math.floor(tickVal / Math.pow(10, exp));
        }

        do {
          ticks.push(tickVal);

          ++significand;
          if (significand === 10) {
            significand = 1;
            ++exp;
          }

          tickVal = significand * Math.pow(10, exp);
        } while (exp < endExp || (exp === endExp && significand < endSignificand));

        var lastTick = getValueOrDefault(generationOptions.max, tickVal);
        ticks.push(lastTick);

        return ticks;
      }
    },

    /**
     * Namespace to hold formatters for different types of ticks
     * @namespace Chart.Ticks.formatters
     */
    formatters: {
      /**
       * Formatter for value labels
       * @method Chart.Ticks.formatters.values
       * @param value the value to display
       * @return {String|Array} the label to display
       */
      values: function(value) {
        return helpers.isArray(value) ? value : '' + value;
      },

      /**
       * Formatter for linear numeric ticks
       * @method Chart.Ticks.formatters.linear
       * @param tickValue {Number} the value to be formatted
       * @param index {Number} the position of the tickValue parameter in the ticks array
       * @param ticks {Array<Number>} the list of ticks being converted
       * @return {String} string representation of the tickValue parameter
       */
      linear: function(tickValue, index, ticks) {
        // If we have lots of ticks, don't use the ones
        var delta = ticks.length > 3 ? ticks[2] - ticks[1] : ticks[1] - ticks[0];

        // If we have a number like 2.5 as the delta, figure out how many decimal places we need
        if (Math.abs(delta) > 1) {
          if (tickValue !== Math.floor(tickValue)) {
            // not an integer
            delta = tickValue - Math.floor(tickValue);
          }
        }

        var logDelta = helpers.log10(Math.abs(delta));
        var tickString = '';

        if (tickValue !== 0) {
          var numDecimal = -1 * Math.floor(logDelta);
          numDecimal = Math.max(Math.min(numDecimal, 20), 0); // toFixed has a max of 20 decimal places
          tickString = tickValue.toFixed(numDecimal);
        } else {
          tickString = '0'; // never show decimal places for 0
        }

        return tickString;
      },

      logarithmic: function(tickValue, index, ticks) {
        var remain = tickValue / (Math.pow(10, Math.floor(helpers.log10(tickValue))));

        if (tickValue === 0) {
          return '0';
        } else if (remain === 1 || remain === 2 || remain === 5 || index === 0 || index === ticks.length - 1) {
          return tickValue.toExponential();
        }
        return '';
      }
    }
  };
};

},{}],35:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  Chart.defaults.global.title = {
    display: false,
    position: 'top',
    fullWidth: true, // marks that this box should take the full width of the canvas (pushing down other boxes)

    fontStyle: 'bold',
    padding: 10,

    // actual title
    text: ''
  };

  var noop = helpers.noop;
  Chart.Title = Chart.Element.extend({

    initialize: function(config) {
      var me = this;
      helpers.extend(me, config);

      // Contains hit boxes for each dataset (in dataset order)
      me.legendHitBoxes = [];
    },

    // These methods are ordered by lifecycle. Utilities then follow.

    beforeUpdate: noop,
    update: function(maxWidth, maxHeight, margins) {
      var me = this;

      // Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
      me.beforeUpdate();

      // Absorb the master measurements
      me.maxWidth = maxWidth;
      me.maxHeight = maxHeight;
      me.margins = margins;

      // Dimensions
      me.beforeSetDimensions();
      me.setDimensions();
      me.afterSetDimensions();
      // Labels
      me.beforeBuildLabels();
      me.buildLabels();
      me.afterBuildLabels();

      // Fit
      me.beforeFit();
      me.fit();
      me.afterFit();
      //
      me.afterUpdate();

      return me.minSize;

    },
    afterUpdate: noop,

    //

    beforeSetDimensions: noop,
    setDimensions: function() {
      var me = this;
      // Set the unconstrained dimension before label rotation
      if (me.isHorizontal()) {
        // Reset position before calculating rotation
        me.width = me.maxWidth;
        me.left = 0;
        me.right = me.width;
      } else {
        me.height = me.maxHeight;

        // Reset position before calculating rotation
        me.top = 0;
        me.bottom = me.height;
      }

      // Reset padding
      me.paddingLeft = 0;
      me.paddingTop = 0;
      me.paddingRight = 0;
      me.paddingBottom = 0;

      // Reset minSize
      me.minSize = {
        width: 0,
        height: 0
      };
    },
    afterSetDimensions: noop,

    //

    beforeBuildLabels: noop,
    buildLabels: noop,
    afterBuildLabels: noop,

    //

    beforeFit: noop,
    fit: function() {
      var me = this,
        valueOrDefault = helpers.getValueOrDefault,
        opts = me.options,
        globalDefaults = Chart.defaults.global,
        display = opts.display,
        fontSize = valueOrDefault(opts.fontSize, globalDefaults.defaultFontSize),
        minSize = me.minSize;

      if (me.isHorizontal()) {
        minSize.width = me.maxWidth; // fill all the width
        minSize.height = display ? fontSize + (opts.padding * 2) : 0;
      } else {
        minSize.width = display ? fontSize + (opts.padding * 2) : 0;
        minSize.height = me.maxHeight; // fill all the height
      }

      me.width = minSize.width;
      me.height = minSize.height;

    },
    afterFit: noop,

    // Shared Methods
    isHorizontal: function() {
      var pos = this.options.position;
      return pos === 'top' || pos === 'bottom';
    },

    // Actually draw the title block on the canvas
    draw: function() {
      var me = this,
        ctx = me.ctx,
        valueOrDefault = helpers.getValueOrDefault,
        opts = me.options,
        globalDefaults = Chart.defaults.global;

      if (opts.display) {
        var fontSize = valueOrDefault(opts.fontSize, globalDefaults.defaultFontSize),
          fontStyle = valueOrDefault(opts.fontStyle, globalDefaults.defaultFontStyle),
          fontFamily = valueOrDefault(opts.fontFamily, globalDefaults.defaultFontFamily),
          titleFont = helpers.fontString(fontSize, fontStyle, fontFamily),
          rotation = 0,
          titleX,
          titleY,
          top = me.top,
          left = me.left,
          bottom = me.bottom,
          right = me.right,
          maxWidth;

        ctx.fillStyle = valueOrDefault(opts.fontColor, globalDefaults.defaultFontColor); // render in correct colour
        ctx.font = titleFont;

        // Horizontal
        if (me.isHorizontal()) {
          titleX = left + ((right - left) / 2); // midpoint of the width
          titleY = top + ((bottom - top) / 2); // midpoint of the height
          maxWidth = right - left;
        } else {
          titleX = opts.position === 'left' ? left + (fontSize / 2) : right - (fontSize / 2);
          titleY = top + ((bottom - top) / 2);
          maxWidth = bottom - top;
          rotation = Math.PI * (opts.position === 'left' ? -0.5 : 0.5);
        }

        ctx.save();
        ctx.translate(titleX, titleY);
        ctx.rotate(rotation);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opts.text, 0, 0, maxWidth);
        ctx.restore();
      }
    }
  });

  function createNewTitleBlockAndAttach(chartInstance, titleOpts) {
    var title = new Chart.Title({
      ctx: chartInstance.chart.ctx,
      options: titleOpts,
      chart: chartInstance
    });
    chartInstance.titleBlock = title;
    Chart.layoutService.addBox(chartInstance, title);
  }

  // Register the title plugin
  Chart.plugins.register({
    beforeInit: function(chartInstance) {
      var titleOpts = chartInstance.options.title;

      if (titleOpts) {
        createNewTitleBlockAndAttach(chartInstance, titleOpts);
      }
    },
    beforeUpdate: function(chartInstance) {
      var titleOpts = chartInstance.options.title;

      if (titleOpts) {
        titleOpts = helpers.configMerge(Chart.defaults.global.title, titleOpts);

        if (chartInstance.titleBlock) {
          chartInstance.titleBlock.options = titleOpts;
        } else {
          createNewTitleBlockAndAttach(chartInstance, titleOpts);
        }
      } else {
        Chart.layoutService.removeBox(chartInstance, chartInstance.titleBlock);
        delete chartInstance.titleBlock;
      }
    }
  });
};

},{}],36:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  /**
   * Helper method to merge the opacity into a color
   */
  function mergeOpacity(colorString, opacity) {
    var color = helpers.color(colorString);
    return color.alpha(opacity * color.alpha()).rgbaString();
  }

  Chart.defaults.global.tooltips = {
    enabled: true,
    custom: null,
    mode: 'nearest',
    position: 'average',
    intersect: true,
    backgroundColor: 'rgba(0,0,0,0.8)',
    titleFontStyle: 'bold',
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleFontColor: '#fff',
    titleAlign: 'left',
    bodySpacing: 2,
    bodyFontColor: '#fff',
    bodyAlign: 'left',
    footerFontStyle: 'bold',
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFontColor: '#fff',
    footerAlign: 'left',
    yPadding: 6,
    xPadding: 6,
    caretSize: 5,
    cornerRadius: 6,
    multiKeyBackground: '#fff',
    displayColors: true,
    callbacks: {
      // Args are: (tooltipItems, data)
      beforeTitle: helpers.noop,
      title: function(tooltipItems, data) {
        // Pick first xLabel for now
        var title = '';
        var labels = data.labels;
        var labelCount = labels ? labels.length : 0;

        if (tooltipItems.length > 0) {
          var item = tooltipItems[0];

          if (item.xLabel) {
            title = item.xLabel;
          } else if (labelCount > 0 && item.index < labelCount) {
            title = labels[item.index];
          }
        }

        return title;
      },
      afterTitle: helpers.noop,

      // Args are: (tooltipItems, data)
      beforeBody: helpers.noop,

      // Args are: (tooltipItem, data)
      beforeLabel: helpers.noop,
      label: function(tooltipItem, data) {
        var datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
        return datasetLabel + ': ' + tooltipItem.yLabel;
      },
      labelColor: function(tooltipItem, chartInstance) {
        var meta = chartInstance.getDatasetMeta(tooltipItem.datasetIndex);
        var activeElement = meta.data[tooltipItem.index];
        var view = activeElement._view;
        return {
          borderColor: view.borderColor,
          backgroundColor: view.backgroundColor
        };
      },
      afterLabel: helpers.noop,

      // Args are: (tooltipItems, data)
      afterBody: helpers.noop,

      // Args are: (tooltipItems, data)
      beforeFooter: helpers.noop,
      footer: helpers.noop,
      afterFooter: helpers.noop
    }
  };

  // Helper to push or concat based on if the 2nd parameter is an array or not
  function pushOrConcat(base, toPush) {
    if (toPush) {
      if (helpers.isArray(toPush)) {
        // base = base.concat(toPush);
        Array.prototype.push.apply(base, toPush);
      } else {
        base.push(toPush);
      }
    }

    return base;
  }

  // Private helper to create a tooltip item model
  // @param element : the chart element (point, arc, bar) to create the tooltip item for
  // @return : new tooltip item
  function createTooltipItem(element) {
    var xScale = element._xScale;
    var yScale = element._yScale || element._scale; // handle radar || polarArea charts
    var index = element._index,
      datasetIndex = element._datasetIndex;

    return {
      xLabel: xScale ? xScale.getLabelForIndex(index, datasetIndex) : '',
      yLabel: yScale ? yScale.getLabelForIndex(index, datasetIndex) : '',
      index: index,
      datasetIndex: datasetIndex,
      x: element._model.x,
      y: element._model.y
    };
  }

  /**
   * Helper to get the reset model for the tooltip
   * @param tooltipOpts {Object} the tooltip options
   */
  function getBaseModel(tooltipOpts) {
    var globalDefaults = Chart.defaults.global;
    var getValueOrDefault = helpers.getValueOrDefault;

    return {
      // Positioning
      xPadding: tooltipOpts.xPadding,
      yPadding: tooltipOpts.yPadding,
      xAlign: tooltipOpts.xAlign,
      yAlign: tooltipOpts.yAlign,

      // Body
      bodyFontColor: tooltipOpts.bodyFontColor,
      _bodyFontFamily: getValueOrDefault(tooltipOpts.bodyFontFamily, globalDefaults.defaultFontFamily),
      _bodyFontStyle: getValueOrDefault(tooltipOpts.bodyFontStyle, globalDefaults.defaultFontStyle),
      _bodyAlign: tooltipOpts.bodyAlign,
      bodyFontSize: getValueOrDefault(tooltipOpts.bodyFontSize, globalDefaults.defaultFontSize),
      bodySpacing: tooltipOpts.bodySpacing,

      // Title
      titleFontColor: tooltipOpts.titleFontColor,
      _titleFontFamily: getValueOrDefault(tooltipOpts.titleFontFamily, globalDefaults.defaultFontFamily),
      _titleFontStyle: getValueOrDefault(tooltipOpts.titleFontStyle, globalDefaults.defaultFontStyle),
      titleFontSize: getValueOrDefault(tooltipOpts.titleFontSize, globalDefaults.defaultFontSize),
      _titleAlign: tooltipOpts.titleAlign,
      titleSpacing: tooltipOpts.titleSpacing,
      titleMarginBottom: tooltipOpts.titleMarginBottom,

      // Footer
      footerFontColor: tooltipOpts.footerFontColor,
      _footerFontFamily: getValueOrDefault(tooltipOpts.footerFontFamily, globalDefaults.defaultFontFamily),
      _footerFontStyle: getValueOrDefault(tooltipOpts.footerFontStyle, globalDefaults.defaultFontStyle),
      footerFontSize: getValueOrDefault(tooltipOpts.footerFontSize, globalDefaults.defaultFontSize),
      _footerAlign: tooltipOpts.footerAlign,
      footerSpacing: tooltipOpts.footerSpacing,
      footerMarginTop: tooltipOpts.footerMarginTop,

      // Appearance
      caretSize: tooltipOpts.caretSize,
      cornerRadius: tooltipOpts.cornerRadius,
      backgroundColor: tooltipOpts.backgroundColor,
      opacity: 0,
      legendColorBackground: tooltipOpts.multiKeyBackground,
      displayColors: tooltipOpts.displayColors
    };
  }

  /**
   * Get the size of the tooltip
   */
  function getTooltipSize(tooltip, model) {
    var ctx = tooltip._chart.ctx;

    var height = model.yPadding * 2; // Tooltip Padding
    var width = 0;

    // Count of all lines in the body
    var body = model.body;
    var combinedBodyLength = body.reduce(function(count, bodyItem) {
      return count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length;
    }, 0);
    combinedBodyLength += model.beforeBody.length + model.afterBody.length;

    var titleLineCount = model.title.length;
    var footerLineCount = model.footer.length;
    var titleFontSize = model.titleFontSize,
      bodyFontSize = model.bodyFontSize,
      footerFontSize = model.footerFontSize;

    height += titleLineCount * titleFontSize; // Title Lines
    height += titleLineCount ? (titleLineCount - 1) * model.titleSpacing : 0; // Title Line Spacing
    height += titleLineCount ? model.titleMarginBottom : 0; // Title's bottom Margin
    height += combinedBodyLength * bodyFontSize; // Body Lines
    height += combinedBodyLength ? (combinedBodyLength - 1) * model.bodySpacing : 0; // Body Line Spacing
    height += footerLineCount ? model.footerMarginTop : 0; // Footer Margin
    height += footerLineCount * (footerFontSize); // Footer Lines
    height += footerLineCount ? (footerLineCount - 1) * model.footerSpacing : 0; // Footer Line Spacing

    // Title width
    var widthPadding = 0;
    var maxLineWidth = function(line) {
      width = Math.max(width, ctx.measureText(line).width + widthPadding);
    };

    ctx.font = helpers.fontString(titleFontSize, model._titleFontStyle, model._titleFontFamily);
    helpers.each(model.title, maxLineWidth);

    // Body width
    ctx.font = helpers.fontString(bodyFontSize, model._bodyFontStyle, model._bodyFontFamily);
    helpers.each(model.beforeBody.concat(model.afterBody), maxLineWidth);

    // Body lines may include some extra width due to the color box
    widthPadding = model.displayColors ? (bodyFontSize + 2) : 0;
    helpers.each(body, function(bodyItem) {
      helpers.each(bodyItem.before, maxLineWidth);
      helpers.each(bodyItem.lines, maxLineWidth);
      helpers.each(bodyItem.after, maxLineWidth);
    });

    // Reset back to 0
    widthPadding = 0;

    // Footer width
    ctx.font = helpers.fontString(footerFontSize, model._footerFontStyle, model._footerFontFamily);
    helpers.each(model.footer, maxLineWidth);

    // Add padding
    width += 2 * model.xPadding;

    return {
      width: width,
      height: height
    };
  }

  /**
   * Helper to get the alignment of a tooltip given the size
   */
  function determineAlignment(tooltip, size) {
    var model = tooltip._model;
    var chart = tooltip._chart;
    var chartArea = tooltip._chartInstance.chartArea;
    var xAlign = 'center';
    var yAlign = 'center';

    if (model.y < size.height) {
      yAlign = 'top';
    } else if (model.y > (chart.height - size.height)) {
      yAlign = 'bottom';
    }

    var lf, rf; // functions to determine left, right alignment
    var olf, orf; // functions to determine if left/right alignment causes tooltip to go outside chart
    var yf; // function to get the y alignment if the tooltip goes outside of the left or right edges
    var midX = (chartArea.left + chartArea.right) / 2;
    var midY = (chartArea.top + chartArea.bottom) / 2;

    if (yAlign === 'center') {
      lf = function(x) {
        return x <= midX;
      };
      rf = function(x) {
        return x > midX;
      };
    } else {
      lf = function(x) {
        return x <= (size.width / 2);
      };
      rf = function(x) {
        return x >= (chart.width - (size.width / 2));
      };
    }

    olf = function(x) {
      return x + size.width > chart.width;
    };
    orf = function(x) {
      return x - size.width < 0;
    };
    yf = function(y) {
      return y <= midY ? 'top' : 'bottom';
    };

    if (lf(model.x)) {
      xAlign = 'left';

      // Is tooltip too wide and goes over the right side of the chart.?
      if (olf(model.x)) {
        xAlign = 'center';
        yAlign = yf(model.y);
      }
    } else if (rf(model.x)) {
      xAlign = 'right';

      // Is tooltip too wide and goes outside left edge of canvas?
      if (orf(model.x)) {
        xAlign = 'center';
        yAlign = yf(model.y);
      }
    }

    var opts = tooltip._options;
    return {
      xAlign: opts.xAlign ? opts.xAlign : xAlign,
      yAlign: opts.yAlign ? opts.yAlign : yAlign
    };
  }

  /**
   * @Helper to get the location a tooltip needs to be placed at given the initial position (via the vm) and the size and alignment
   */
  function getBackgroundPoint(vm, size, alignment) {
    // Background Position
    var x = vm.x;
    var y = vm.y;

    var caretSize = vm.caretSize,
      caretPadding = vm.caretPadding,
      cornerRadius = vm.cornerRadius,
      xAlign = alignment.xAlign,
      yAlign = alignment.yAlign,
      paddingAndSize = caretSize + caretPadding,
      radiusAndPadding = cornerRadius + caretPadding;

    if (xAlign === 'right') {
      x -= size.width;
    } else if (xAlign === 'center') {
      x -= (size.width / 2);
    }

    if (yAlign === 'top') {
      y += paddingAndSize;
    } else if (yAlign === 'bottom') {
      y -= size.height + paddingAndSize;
    } else {
      y -= (size.height / 2);
    }

    if (yAlign === 'center') {
      if (xAlign === 'left') {
        x += paddingAndSize;
      } else if (xAlign === 'right') {
        x -= paddingAndSize;
      }
    } else if (xAlign === 'left') {
      x -= radiusAndPadding;
    } else if (xAlign === 'right') {
      x += radiusAndPadding;
    }

    return {
      x: x,
      y: y
    };
  }

  Chart.Tooltip = Chart.Element.extend({
    initialize: function() {
      this._model = getBaseModel(this._options);
    },

    // Get the title
    // Args are: (tooltipItem, data)
    getTitle: function() {
      var me = this;
      var opts = me._options;
      var callbacks = opts.callbacks;

      var beforeTitle = callbacks.beforeTitle.apply(me, arguments),
        title = callbacks.title.apply(me, arguments),
        afterTitle = callbacks.afterTitle.apply(me, arguments);

      var lines = [];
      lines = pushOrConcat(lines, beforeTitle);
      lines = pushOrConcat(lines, title);
      lines = pushOrConcat(lines, afterTitle);

      return lines;
    },

    // Args are: (tooltipItem, data)
    getBeforeBody: function() {
      var lines = this._options.callbacks.beforeBody.apply(this, arguments);
      return helpers.isArray(lines) ? lines : lines !== undefined ? [lines] : [];
    },

    // Args are: (tooltipItem, data)
    getBody: function(tooltipItems, data) {
      var me = this;
      var callbacks = me._options.callbacks;
      var bodyItems = [];

      helpers.each(tooltipItems, function(tooltipItem) {
        var bodyItem = {
          before: [],
          lines: [],
          after: []
        };
        pushOrConcat(bodyItem.before, callbacks.beforeLabel.call(me, tooltipItem, data));
        pushOrConcat(bodyItem.lines, callbacks.label.call(me, tooltipItem, data));
        pushOrConcat(bodyItem.after, callbacks.afterLabel.call(me, tooltipItem, data));

        bodyItems.push(bodyItem);
      });

      return bodyItems;
    },

    // Args are: (tooltipItem, data)
    getAfterBody: function() {
      var lines = this._options.callbacks.afterBody.apply(this, arguments);
      return helpers.isArray(lines) ? lines : lines !== undefined ? [lines] : [];
    },

    // Get the footer and beforeFooter and afterFooter lines
    // Args are: (tooltipItem, data)
    getFooter: function() {
      var me = this;
      var callbacks = me._options.callbacks;

      var beforeFooter = callbacks.beforeFooter.apply(me, arguments);
      var footer = callbacks.footer.apply(me, arguments);
      var afterFooter = callbacks.afterFooter.apply(me, arguments);

      var lines = [];
      lines = pushOrConcat(lines, beforeFooter);
      lines = pushOrConcat(lines, footer);
      lines = pushOrConcat(lines, afterFooter);

      return lines;
    },

    update: function(changed) {
      var me = this;
      var opts = me._options;

      // Need to regenerate the model because its faster than using extend and it is necessary due to the optimization in Chart.Element.transition
      // that does _view = _model if ease === 1. This causes the 2nd tooltip update to set properties in both the view and model at the same time
      // which breaks any animations.
      var existingModel = me._model;
      var model = me._model = getBaseModel(opts);
      var active = me._active;

      var data = me._data;
      var chartInstance = me._chartInstance;

      // In the case where active.length === 0 we need to keep these at existing values for good animations
      var alignment = {
        xAlign: existingModel.xAlign,
        yAlign: existingModel.yAlign
      };
      var backgroundPoint = {
        x: existingModel.x,
        y: existingModel.y
      };
      var tooltipSize = {
        width: existingModel.width,
        height: existingModel.height
      };
      var tooltipPosition = {
        x: existingModel.caretX,
        y: existingModel.caretY
      };

      var i, len;

      if (active.length) {
        model.opacity = 1;

        var labelColors = [];
        tooltipPosition = Chart.Tooltip.positioners[opts.position](active, me._eventPosition);

        var tooltipItems = [];
        for (i = 0, len = active.length; i < len; ++i) {
          tooltipItems.push(createTooltipItem(active[i]));
        }

        // If the user provided a filter function, use it to modify the tooltip items
        if (opts.filter) {
          tooltipItems = tooltipItems.filter(function(a) {
            return opts.filter(a, data);
          });
        }

        // If the user provided a sorting function, use it to modify the tooltip items
        if (opts.itemSort) {
          tooltipItems = tooltipItems.sort(function(a, b) {
            return opts.itemSort(a, b, data);
          });
        }

        // Determine colors for boxes
        helpers.each(tooltipItems, function(tooltipItem) {
          labelColors.push(opts.callbacks.labelColor.call(me, tooltipItem, chartInstance));
        });

        // Build the Text Lines
        model.title = me.getTitle(tooltipItems, data);
        model.beforeBody = me.getBeforeBody(tooltipItems, data);
        model.body = me.getBody(tooltipItems, data);
        model.afterBody = me.getAfterBody(tooltipItems, data);
        model.footer = me.getFooter(tooltipItems, data);

        // Initial positioning and colors
        model.x = Math.round(tooltipPosition.x);
        model.y = Math.round(tooltipPosition.y);
        model.caretPadding = helpers.getValueOrDefault(tooltipPosition.padding, 2);
        model.labelColors = labelColors;

        // data points
        model.dataPoints = tooltipItems;

        // We need to determine alignment of the tooltip
        tooltipSize = getTooltipSize(this, model);
        alignment = determineAlignment(this, tooltipSize);
        // Final Size and Position
        backgroundPoint = getBackgroundPoint(model, tooltipSize, alignment);
      } else {
        model.opacity = 0;
      }

      model.xAlign = alignment.xAlign;
      model.yAlign = alignment.yAlign;
      model.x = backgroundPoint.x;
      model.y = backgroundPoint.y;
      model.width = tooltipSize.width;
      model.height = tooltipSize.height;

      // Point where the caret on the tooltip points to
      model.caretX = tooltipPosition.x;
      model.caretY = tooltipPosition.y;

      me._model = model;

      if (changed && opts.custom) {
        opts.custom.call(me, model);
      }

      return me;
    },
    drawCaret: function(tooltipPoint, size, opacity) {
      var vm = this._view;
      var ctx = this._chart.ctx;
      var x1, x2, x3;
      var y1, y2, y3;
      var caretSize = vm.caretSize;
      var cornerRadius = vm.cornerRadius;
      var xAlign = vm.xAlign,
        yAlign = vm.yAlign;
      var ptX = tooltipPoint.x,
        ptY = tooltipPoint.y;
      var width = size.width,
        height = size.height;

      if (yAlign === 'center') {
        // Left or right side
        if (xAlign === 'left') {
          x1 = ptX;
          x2 = x1 - caretSize;
          x3 = x1;
        } else {
          x1 = ptX + width;
          x2 = x1 + caretSize;
          x3 = x1;
        }

        y2 = ptY + (height / 2);
        y1 = y2 - caretSize;
        y3 = y2 + caretSize;
      } else {
        if (xAlign === 'left') {
          x1 = ptX + cornerRadius;
          x2 = x1 + caretSize;
          x3 = x2 + caretSize;
        } else if (xAlign === 'right') {
          x1 = ptX + width - cornerRadius;
          x2 = x1 - caretSize;
          x3 = x2 - caretSize;
        } else {
          x2 = ptX + (width / 2);
          x1 = x2 - caretSize;
          x3 = x2 + caretSize;
        }

        if (yAlign === 'top') {
          y1 = ptY;
          y2 = y1 - caretSize;
          y3 = y1;
        } else {
          y1 = ptY + height;
          y2 = y1 + caretSize;
          y3 = y1;
        }
      }

      ctx.fillStyle = mergeOpacity(vm.backgroundColor, opacity);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();
    },
    drawTitle: function(pt, vm, ctx, opacity) {
      var title = vm.title;

      if (title.length) {
        ctx.textAlign = vm._titleAlign;
        ctx.textBaseline = 'top';

        var titleFontSize = vm.titleFontSize,
          titleSpacing = vm.titleSpacing;

        ctx.fillStyle = mergeOpacity(vm.titleFontColor, opacity);
        ctx.font = helpers.fontString(titleFontSize, vm._titleFontStyle, vm._titleFontFamily);

        var i, len;
        for (i = 0, len = title.length; i < len; ++i) {
          ctx.fillText(title[i], pt.x, pt.y);
          pt.y += titleFontSize + titleSpacing; // Line Height and spacing

          if (i + 1 === title.length) {
            pt.y += vm.titleMarginBottom - titleSpacing; // If Last, add margin, remove spacing
          }
        }
      }
    },
    drawBody: function(pt, vm, ctx, opacity) {
      var bodyFontSize = vm.bodyFontSize;
      var bodySpacing = vm.bodySpacing;
      var body = vm.body;

      ctx.textAlign = vm._bodyAlign;
      ctx.textBaseline = 'top';

      var textColor = mergeOpacity(vm.bodyFontColor, opacity);
      ctx.fillStyle = textColor;
      ctx.font = helpers.fontString(bodyFontSize, vm._bodyFontStyle, vm._bodyFontFamily);

      // Before Body
      var xLinePadding = 0;
      var fillLineOfText = function(line) {
        ctx.fillText(line, pt.x + xLinePadding, pt.y);
        pt.y += bodyFontSize + bodySpacing;
      };

      // Before body lines
      helpers.each(vm.beforeBody, fillLineOfText);

      var drawColorBoxes = vm.displayColors;
      xLinePadding = drawColorBoxes ? (bodyFontSize + 2) : 0;

      // Draw body lines now
      helpers.each(body, function(bodyItem, i) {
        helpers.each(bodyItem.before, fillLineOfText);

        helpers.each(bodyItem.lines, function(line) {
          // Draw Legend-like boxes if needed
          if (drawColorBoxes) {
            // Fill a white rect so that colours merge nicely if the opacity is < 1
            ctx.fillStyle = mergeOpacity(vm.legendColorBackground, opacity);
            ctx.fillRect(pt.x, pt.y, bodyFontSize, bodyFontSize);

            // Border
            ctx.strokeStyle = mergeOpacity(vm.labelColors[i].borderColor, opacity);
            ctx.strokeRect(pt.x, pt.y, bodyFontSize, bodyFontSize);

            // Inner square
            ctx.fillStyle = mergeOpacity(vm.labelColors[i].backgroundColor, opacity);
            ctx.fillRect(pt.x + 1, pt.y + 1, bodyFontSize - 2, bodyFontSize - 2);

            ctx.fillStyle = textColor;
          }

          fillLineOfText(line);
        });

        helpers.each(bodyItem.after, fillLineOfText);
      });

      // Reset back to 0 for after body
      xLinePadding = 0;

      // After body lines
      helpers.each(vm.afterBody, fillLineOfText);
      pt.y -= bodySpacing; // Remove last body spacing
    },
    drawFooter: function(pt, vm, ctx, opacity) {
      var footer = vm.footer;

      if (footer.length) {
        pt.y += vm.footerMarginTop;

        ctx.textAlign = vm._footerAlign;
        ctx.textBaseline = 'top';

        ctx.fillStyle = mergeOpacity(vm.footerFontColor, opacity);
        ctx.font = helpers.fontString(vm.footerFontSize, vm._footerFontStyle, vm._footerFontFamily);

        helpers.each(footer, function(line) {
          ctx.fillText(line, pt.x, pt.y);
          pt.y += vm.footerFontSize + vm.footerSpacing;
        });
      }
    },
    drawBackground: function(pt, vm, ctx, tooltipSize, opacity) {
      ctx.fillStyle = mergeOpacity(vm.backgroundColor, opacity);
      helpers.drawRoundedRectangle(ctx, pt.x, pt.y, tooltipSize.width, tooltipSize.height, vm.cornerRadius);
      ctx.fill();
    },
    draw: function() {
      var ctx = this._chart.ctx;
      var vm = this._view;

      if (vm.opacity === 0) {
        return;
      }

      var tooltipSize = {
        width: vm.width,
        height: vm.height
      };
      var pt = {
        x: vm.x,
        y: vm.y
      };

      // IE11/Edge does not like very small opacities, so snap to 0
      var opacity = Math.abs(vm.opacity < 1e-3) ? 0 : vm.opacity;

      if (this._options.enabled) {
        // Draw Background
        this.drawBackground(pt, vm, ctx, tooltipSize, opacity);

        // Draw Caret
        this.drawCaret(pt, tooltipSize, opacity);

        // Draw Title, Body, and Footer
        pt.x += vm.xPadding;
        pt.y += vm.yPadding;

        // Titles
        this.drawTitle(pt, vm, ctx, opacity);

        // Body
        this.drawBody(pt, vm, ctx, opacity);

        // Footer
        this.drawFooter(pt, vm, ctx, opacity);
      }
    },

    /**
     * Handle an event
     * @private
     * @param {IEvent} event - The event to handle
     * @returns {Boolean} true if the tooltip changed
     */
    handleEvent: function(e) {
      var me = this;
      var options = me._options;
      var changed = false;

      me._lastActive = me._lastActive || [];

      // Find Active Elements for tooltips
      if (e.type === 'mouseout') {
        me._active = [];
      } else {
        me._active = me._chartInstance.getElementsAtEventForMode(e, options.mode, options);
      }

      // Remember Last Actives
      changed = !helpers.arrayEquals(me._active, me._lastActive);
      me._lastActive = me._active;

      if (options.enabled || options.custom) {
        me._eventPosition = {
          x: e.x,
          y: e.y
        };

        var model = me._model;
        me.update(true);
        me.pivot();

        // See if our tooltip position changed
        changed |= (model.x !== me._model.x) || (model.y !== me._model.y);
      }

      return changed;
    }
  });

  /**
   * @namespace Chart.Tooltip.positioners
   */
  Chart.Tooltip.positioners = {
    /**
     * Average mode places the tooltip at the average position of the elements shown
     * @function Chart.Tooltip.positioners.average
     * @param elements {ChartElement[]} the elements being displayed in the tooltip
     * @returns {Point} tooltip position
     */
    average: function(elements) {
      if (!elements.length) {
        return false;
      }

      var i, len;
      var x = 0;
      var y = 0;
      var count = 0;

      for (i = 0, len = elements.length; i < len; ++i) {
        var el = elements[i];
        if (el && el.hasValue()) {
          var pos = el.tooltipPosition();
          x += pos.x;
          y += pos.y;
          ++count;
        }
      }

      return {
        x: Math.round(x / count),
        y: Math.round(y / count)
      };
    },

    /**
     * Gets the tooltip position nearest of the item nearest to the event position
     * @function Chart.Tooltip.positioners.nearest
     * @param elements {Chart.Element[]} the tooltip elements
     * @param eventPosition {Point} the position of the event in canvas coordinates
     * @returns {Point} the tooltip position
     */
    nearest: function(elements, eventPosition) {
      var x = eventPosition.x;
      var y = eventPosition.y;

      var nearestElement;
      var minDistance = Number.POSITIVE_INFINITY;
      var i, len;
      for (i = 0, len = elements.length; i < len; ++i) {
        var el = elements[i];
        if (el && el.hasValue()) {
          var center = el.getCenterPoint();
          var d = helpers.distanceBetweenPoints(eventPosition, center);

          if (d < minDistance) {
            minDistance = d;
            nearestElement = el;
          }
        }
      }

      if (nearestElement) {
        var tp = nearestElement.tooltipPosition();
        x = tp.x;
        y = tp.y;
      }

      return {
        x: x,
        y: y
      };
    }
  };
};

},{}],37:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers,
    globalOpts = Chart.defaults.global;

  globalOpts.elements.arc = {
    backgroundColor: globalOpts.defaultColor,
    borderColor: '#fff',
    borderWidth: 2
  };

  Chart.elements.Arc = Chart.Element.extend({
    inLabelRange: function(mouseX) {
      var vm = this._view;

      if (vm) {
        return (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hoverRadius, 2));
      }
      return false;
    },
    inRange: function(chartX, chartY) {
      var vm = this._view;

      if (vm) {
        var pointRelativePosition = helpers.getAngleFromPoint(vm, {
            x: chartX,
            y: chartY
          }),
          angle = pointRelativePosition.angle,
          distance = pointRelativePosition.distance;

        // Sanitise angle range
        var startAngle = vm.startAngle;
        var endAngle = vm.endAngle;
        while (endAngle < startAngle) {
          endAngle += 2.0 * Math.PI;
        }
        while (angle > endAngle) {
          angle -= 2.0 * Math.PI;
        }
        while (angle < startAngle) {
          angle += 2.0 * Math.PI;
        }

        // Check if within the range of the open/close angle
        var betweenAngles = (angle >= startAngle && angle <= endAngle),
          withinRadius = (distance >= vm.innerRadius && distance <= vm.outerRadius);

        return (betweenAngles && withinRadius);
      }
      return false;
    },
    getCenterPoint: function() {
      var vm = this._view;
      var halfAngle = (vm.startAngle + vm.endAngle) / 2;
      var halfRadius = (vm.innerRadius + vm.outerRadius) / 2;
      return {
        x: vm.x + Math.cos(halfAngle) * halfRadius,
        y: vm.y + Math.sin(halfAngle) * halfRadius
      };
    },
    getArea: function() {
      var vm = this._view;
      return Math.PI * ((vm.endAngle - vm.startAngle) / (2 * Math.PI)) * (Math.pow(vm.outerRadius, 2) - Math.pow(vm.innerRadius, 2));
    },
    tooltipPosition: function() {
      var vm = this._view;

      var centreAngle = vm.startAngle + ((vm.endAngle - vm.startAngle) / 2),
        rangeFromCentre = (vm.outerRadius - vm.innerRadius) / 2 + vm.innerRadius;
      return {
        x: vm.x + (Math.cos(centreAngle) * rangeFromCentre),
        y: vm.y + (Math.sin(centreAngle) * rangeFromCentre)
      };
    },
    draw: function() {

      var ctx = this._chart.ctx,
        vm = this._view,
        sA = vm.startAngle,
        eA = vm.endAngle;

      ctx.beginPath();

      ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
      ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

      ctx.closePath();
      ctx.strokeStyle = vm.borderColor;
      ctx.lineWidth = vm.borderWidth;

      ctx.fillStyle = vm.backgroundColor;

      ctx.fill();
      ctx.lineJoin = 'bevel';

      if (vm.borderWidth) {
        ctx.stroke();
      }
    }
  });
};

},{}],38:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;
  var globalDefaults = Chart.defaults.global;

  Chart.defaults.global.elements.line = {
    tension: 0.4,
    backgroundColor: globalDefaults.defaultColor,
    borderWidth: 3,
    borderColor: globalDefaults.defaultColor,
    borderCapStyle: 'butt',
    borderDash: [],
    borderDashOffset: 0.0,
    borderJoinStyle: 'miter',
    capBezierPoints: true,
    fill: true, // do we fill in the area between the line and its base axis
  };

  Chart.elements.Line = Chart.Element.extend({
    draw: function() {
      var me = this;
      var vm = me._view;
      var spanGaps = vm.spanGaps;
      var fillPoint = vm.scaleZero;
      var loop = me._loop;

      // Handle different fill modes for cartesian lines
      if (!loop) {
        if (vm.fill === 'top') {
          fillPoint = vm.scaleTop;
        } else if (vm.fill === 'bottom') {
          fillPoint = vm.scaleBottom;
        }
      }

      var ctx = me._chart.ctx;
      ctx.save();

      // Helper function to draw a line to a point
      function lineToPoint(previousPoint, point) {
        var pointVM = point._view;
        if (point._view.steppedLine === true) {
          ctx.lineTo(pointVM.x, previousPoint._view.y);
          ctx.lineTo(pointVM.x, pointVM.y);
        } else if (point._view.tension === 0) {
          ctx.lineTo(pointVM.x, pointVM.y);
        } else {
          ctx.bezierCurveTo(
            previousPoint._view.controlPointNextX,
            previousPoint._view.controlPointNextY,
            pointVM.controlPointPreviousX,
            pointVM.controlPointPreviousY,
            pointVM.x,
            pointVM.y
          );
        }
      }

      var points = me._children.slice(); // clone array
      var lastDrawnIndex = -1;

      // If we are looping, adding the first point again
      if (loop && points.length) {
        points.push(points[0]);
      }

      var index, current, previous, currentVM;

      // Fill Line
      if (points.length && vm.fill) {
        ctx.beginPath();

        for (index = 0; index < points.length; ++index) {
          current = points[index];
          previous = helpers.previousItem(points, index);
          currentVM = current._view;

          // First point moves to it's starting position no matter what
          if (index === 0) {
            if (loop) {
              ctx.moveTo(fillPoint.x, fillPoint.y);
            } else {
              ctx.moveTo(currentVM.x, fillPoint);
            }

            if (!currentVM.skip) {
              lastDrawnIndex = index;
              ctx.lineTo(currentVM.x, currentVM.y);
            }
          } else {
            previous = lastDrawnIndex === -1 ? previous : points[lastDrawnIndex];

            if (currentVM.skip) {
              // Only do this if this is the first point that is skipped
              if (!spanGaps && lastDrawnIndex === (index - 1)) {
                if (loop) {
                  ctx.lineTo(fillPoint.x, fillPoint.y);
                } else {
                  ctx.lineTo(previous._view.x, fillPoint);
                }
              }
            } else {
              if (lastDrawnIndex !== (index - 1)) {
                // There was a gap and this is the first point after the gap. If we've never drawn a point, this is a special case.
                // If the first data point is NaN, then there is no real gap to skip
                if (spanGaps && lastDrawnIndex !== -1) {
                  // We are spanning the gap, so simple draw a line to this point
                  lineToPoint(previous, current);
                } else if (loop) {
                  ctx.lineTo(currentVM.x, currentVM.y);
                } else {
                  ctx.lineTo(currentVM.x, fillPoint);
                  ctx.lineTo(currentVM.x, currentVM.y);
                }
              } else {
                // Line to next point
                lineToPoint(previous, current);
              }
              lastDrawnIndex = index;
            }
          }
        }

        if (!loop && lastDrawnIndex !== -1) {
          ctx.lineTo(points[lastDrawnIndex]._view.x, fillPoint);
        }

        ctx.fillStyle = vm.backgroundColor || globalDefaults.defaultColor;
        ctx.closePath();
        ctx.fill();
      }

      // Stroke Line Options
      var globalOptionLineElements = globalDefaults.elements.line;
      ctx.lineCap = vm.borderCapStyle || globalOptionLineElements.borderCapStyle;

      // IE 9 and 10 do not support line dash
      if (ctx.setLineDash) {
        ctx.setLineDash(vm.borderDash || globalOptionLineElements.borderDash);
      }

      ctx.lineDashOffset = vm.borderDashOffset || globalOptionLineElements.borderDashOffset;
      ctx.lineJoin = vm.borderJoinStyle || globalOptionLineElements.borderJoinStyle;
      ctx.lineWidth = vm.borderWidth || globalOptionLineElements.borderWidth;
      ctx.strokeStyle = vm.borderColor || globalDefaults.defaultColor;

      // Stroke Line
      ctx.beginPath();
      lastDrawnIndex = -1;

      for (index = 0; index < points.length; ++index) {
        current = points[index];
        previous = helpers.previousItem(points, index);
        currentVM = current._view;

        // First point moves to it's starting position no matter what
        if (index === 0) {
          if (!currentVM.skip) {
            ctx.moveTo(currentVM.x, currentVM.y);
            lastDrawnIndex = index;
          }
        } else {
          previous = lastDrawnIndex === -1 ? previous : points[lastDrawnIndex];

          if (!currentVM.skip) {
            if ((lastDrawnIndex !== (index - 1) && !spanGaps) || lastDrawnIndex === -1) {
              // There was a gap and this is the first point after the gap
              ctx.moveTo(currentVM.x, currentVM.y);
            } else {
              // Line to next point
              lineToPoint(previous, current);
            }
            lastDrawnIndex = index;
          }
        }
      }

      ctx.stroke();
      ctx.restore();
    }
  });
};

},{}],39:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers,
    globalOpts = Chart.defaults.global,
    defaultColor = globalOpts.defaultColor;

  globalOpts.elements.point = {
    radius: 3,
    pointStyle: 'circle',
    backgroundColor: defaultColor,
    borderWidth: 1,
    borderColor: defaultColor,
    // Hover
    hitRadius: 1,
    hoverRadius: 4,
    hoverBorderWidth: 1
  };

  function xRange(mouseX) {
    var vm = this._view;
    return vm ? (Math.pow(mouseX - vm.x, 2) < Math.pow(vm.radius + vm.hitRadius, 2)) : false;
  }

  function yRange(mouseY) {
    var vm = this._view;
    return vm ? (Math.pow(mouseY - vm.y, 2) < Math.pow(vm.radius + vm.hitRadius, 2)) : false;
  }

  Chart.elements.Point = Chart.Element.extend({
    inRange: function(mouseX, mouseY) {
      var vm = this._view;
      return vm ? ((Math.pow(mouseX - vm.x, 2) + Math.pow(mouseY - vm.y, 2)) < Math.pow(vm.hitRadius + vm.radius, 2)) : false;
    },

    inLabelRange: xRange,
    inXRange: xRange,
    inYRange: yRange,

    getCenterPoint: function() {
      var vm = this._view;
      return {
        x: vm.x,
        y: vm.y
      };
    },
    getArea: function() {
      return Math.PI * Math.pow(this._view.radius, 2);
    },
    tooltipPosition: function() {
      var vm = this._view;
      return {
        x: vm.x,
        y: vm.y,
        padding: vm.radius + vm.borderWidth
      };
    },
    draw: function(chartArea) {
      var vm = this._view;
      var model = this._model;
      var ctx = this._chart.ctx;
      var pointStyle = vm.pointStyle;
      var radius = vm.radius;
      var x = vm.x;
      var y = vm.y;
      var color = Chart.helpers.color;
      var errMargin = 1.01; // 1.01 is margin for Accumulated error. (Especially Edge, IE.)
      var ratio = 0;

      if (vm.skip) {
        return;
      }

      ctx.strokeStyle = vm.borderColor || defaultColor;
      ctx.lineWidth = helpers.getValueOrDefault(vm.borderWidth, globalOpts.elements.point.borderWidth);
      ctx.fillStyle = vm.backgroundColor || defaultColor;

      // Cliping for Points.
      // going out from inner charArea?
      if ((chartArea !== undefined) && ((model.x < chartArea.left) || (chartArea.right*errMargin < model.x) || (model.y < chartArea.top) || (chartArea.bottom*errMargin < model.y))) {
        // Point fade out
        if (model.x < chartArea.left) {
          ratio = (x - model.x) / (chartArea.left - model.x);
        } else if (chartArea.right*errMargin < model.x) {
          ratio = (model.x - x) / (model.x - chartArea.right);
        } else if (model.y < chartArea.top) {
          ratio = (y - model.y) / (chartArea.top - model.y);
        } else if (chartArea.bottom*errMargin < model.y) {
          ratio = (model.y - y) / (model.y - chartArea.bottom);
        }
        ratio = Math.round(ratio*100) / 100;
        ctx.strokeStyle = color(ctx.strokeStyle).alpha(ratio).rgbString();
        ctx.fillStyle = color(ctx.fillStyle).alpha(ratio).rgbString();
      }

      Chart.canvasHelpers.drawPoint(ctx, pointStyle, radius, x, y);
    }
  });
};

},{}],40:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var globalOpts = Chart.defaults.global;

  globalOpts.elements.rectangle = {
    backgroundColor: globalOpts.defaultColor,
    borderWidth: 0,
    borderColor: globalOpts.defaultColor,
    borderSkipped: 'bottom'
  };

  function isVertical(bar) {
    return bar._view.width !== undefined;
  }

  /**
   * Helper function to get the bounds of the bar regardless of the orientation
   * @private
   * @param bar {Chart.Element.Rectangle} the bar
   * @return {Bounds} bounds of the bar
   */
  function getBarBounds(bar) {
    var vm = bar._view;
    var x1, x2, y1, y2;

    if (isVertical(bar)) {
      // vertical
      var halfWidth = vm.width / 2;
      x1 = vm.x - halfWidth;
      x2 = vm.x + halfWidth;
      y1 = Math.min(vm.y, vm.base);
      y2 = Math.max(vm.y, vm.base);
    } else {
      // horizontal bar
      var halfHeight = vm.height / 2;
      x1 = Math.min(vm.x, vm.base);
      x2 = Math.max(vm.x, vm.base);
      y1 = vm.y - halfHeight;
      y2 = vm.y + halfHeight;
    }

    return {
      left: x1,
      top: y1,
      right: x2,
      bottom: y2
    };
  }

  Chart.elements.Rectangle = Chart.Element.extend({
    draw: function() {
      var ctx = this._chart.ctx;
      var vm = this._view;
      var left, right, top, bottom, signX, signY, borderSkipped;
      var borderWidth = vm.borderWidth;

      if (!vm.horizontal) {
        // bar
        left = vm.x - vm.width / 2;
        right = vm.x + vm.width / 2;
        top = vm.y;
        bottom = vm.base;
        signX = 1;
        signY = bottom > top? 1: -1;
        borderSkipped = vm.borderSkipped || 'bottom';
      } else {
        // horizontal bar
        left = vm.base;
        right = vm.x;
        top = vm.y - vm.height / 2;
        bottom = vm.y + vm.height / 2;
        signX = right > left? 1: -1;
        signY = 1;
        borderSkipped = vm.borderSkipped || 'left';
      }

      // Canvas doesn't allow us to stroke inside the width so we can
      // adjust the sizes to fit if we're setting a stroke on the line
      if (borderWidth) {
        // borderWidth shold be less than bar width and bar height.
        var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
        borderWidth = borderWidth > barSize? barSize: borderWidth;
        var halfStroke = borderWidth / 2;
        // Adjust borderWidth when bar top position is near vm.base(zero).
        var borderLeft = left + (borderSkipped !== 'left'? halfStroke * signX: 0);
        var borderRight = right + (borderSkipped !== 'right'? -halfStroke * signX: 0);
        var borderTop = top + (borderSkipped !== 'top'? halfStroke * signY: 0);
        var borderBottom = bottom + (borderSkipped !== 'bottom'? -halfStroke * signY: 0);
        // not become a vertical line?
        if (borderLeft !== borderRight) {
          top = borderTop;
          bottom = borderBottom;
        }
        // not become a horizontal line?
        if (borderTop !== borderBottom) {
          left = borderLeft;
          right = borderRight;
        }
      }

      ctx.beginPath();
      ctx.fillStyle = vm.backgroundColor;
      ctx.strokeStyle = vm.borderColor;
      ctx.lineWidth = borderWidth;

      // Corner points, from bottom-left to bottom-right clockwise
      // | 1 2 |
      // | 0 3 |
      var corners = [
        [left, bottom],
        [left, top],
        [right, top],
        [right, bottom]
      ];

      // Find first (starting) corner with fallback to 'bottom'
      var borders = ['bottom', 'left', 'top', 'right'];
      var startCorner = borders.indexOf(borderSkipped, 0);
      if (startCorner === -1) {
        startCorner = 0;
      }

      function cornerAt(index) {
        return corners[(startCorner + index) % 4];
      }

      // Draw rectangle from 'startCorner'
      var corner = cornerAt(0);
      ctx.moveTo(corner[0], corner[1]);

      for (var i = 1; i < 4; i++) {
        corner = cornerAt(i);
        ctx.lineTo(corner[0], corner[1]);
      }

      ctx.fill();
      if (borderWidth) {
        ctx.stroke();
      }
    },
    height: function() {
      var vm = this._view;
      return vm.base - vm.y;
    },
    inRange: function(mouseX, mouseY) {
      var inRange = false;

      if (this._view) {
        var bounds = getBarBounds(this);
        inRange = mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
      }

      return inRange;
    },
    inLabelRange: function(mouseX, mouseY) {
      var me = this;
      if (!me._view) {
        return false;
      }

      var inRange = false;
      var bounds = getBarBounds(me);

      if (isVertical(me)) {
        inRange = mouseX >= bounds.left && mouseX <= bounds.right;
      } else {
        inRange = mouseY >= bounds.top && mouseY <= bounds.bottom;
      }

      return inRange;
    },
    inXRange: function(mouseX) {
      var bounds = getBarBounds(this);
      return mouseX >= bounds.left && mouseX <= bounds.right;
    },
    inYRange: function(mouseY) {
      var bounds = getBarBounds(this);
      return mouseY >= bounds.top && mouseY <= bounds.bottom;
    },
    getCenterPoint: function() {
      var vm = this._view;
      var x, y;
      if (isVertical(this)) {
        x = vm.x;
        y = (vm.y + vm.base) / 2;
      } else {
        x = (vm.x + vm.base) / 2;
        y = vm.y;
      }

      return {x: x, y: y};
    },
    getArea: function() {
      var vm = this._view;
      return vm.width * Math.abs(vm.y - vm.base);
    },
    tooltipPosition: function() {
      var vm = this._view;
      return {
        x: vm.x,
        y: vm.y
      };
    }
  });

};

},{}],41:[function(require,module,exports){
'use strict';

// Chart.Platform implementation for targeting a web browser
module.exports = function(Chart) {
  var helpers = Chart.helpers;

  // DOM event types -> Chart.js event types.
  // Note: only events with different types are mapped.
  // https://developer.mozilla.org/en-US/docs/Web/Events
  var eventTypeMap = {
    // Touch events
    touchstart: 'mousedown',
    touchmove: 'mousemove',
    touchend: 'mouseup',

    // Pointer events
    pointerenter: 'mouseenter',
    pointerdown: 'mousedown',
    pointermove: 'mousemove',
    pointerup: 'mouseup',
    pointerleave: 'mouseout',
    pointerout: 'mouseout'
  };

  /**
   * The "used" size is the final value of a dimension property after all calculations have
   * been performed. This method uses the computed style of `element` but returns undefined
   * if the computed style is not expressed in pixels. That can happen in some cases where
   * `element` has a size relative to its parent and this last one is not yet displayed,
   * for example because of `display: none` on a parent node.
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
   * @returns {Number} Size in pixels or undefined if unknown.
   */
  function readUsedSize(element, property) {
    var value = helpers.getStyle(element, property);
    var matches = value && value.match(/(\d+)px/);
    return matches? Number(matches[1]) : undefined;
  }

  /**
   * Initializes the canvas style and render size without modifying the canvas display size,
   * since responsiveness is handled by the controller.resize() method. The config is used
   * to determine the aspect ratio to apply in case no explicit height has been specified.
   */
  function initCanvas(canvas, config) {
    var style = canvas.style;

    // NOTE(SB) canvas.getAttribute('width') !== canvas.width: in the first case it
    // returns null or '' if no explicit value has been set to the canvas attribute.
    var renderHeight = canvas.getAttribute('height');
    var renderWidth = canvas.getAttribute('width');

    // Chart.js modifies some canvas values that we want to restore on destroy
    canvas._chartjs = {
      initial: {
        height: renderHeight,
        width: renderWidth,
        style: {
          display: style.display,
          height: style.height,
          width: style.width
        }
      }
    };

    // Force canvas to display as block to avoid extra space caused by inline
    // elements, which would interfere with the responsive resize process.
    // https://github.com/chartjs/Chart.js/issues/2538
    style.display = style.display || 'block';

    if (renderWidth === null || renderWidth === '') {
      var displayWidth = readUsedSize(canvas, 'width');
      if (displayWidth !== undefined) {
        canvas.width = displayWidth;
      }
    }

    if (renderHeight === null || renderHeight === '') {
      if (canvas.style.height === '') {
        // If no explicit render height and style height, let's apply the aspect ratio,
        // which one can be specified by the user but also by charts as default option
        // (i.e. options.aspectRatio). If not specified, use canvas aspect ratio of 2.
        canvas.height = canvas.width / (config.options.aspectRatio || 2);
      } else {
        var displayHeight = readUsedSize(canvas, 'height');
        if (displayWidth !== undefined) {
          canvas.height = displayHeight;
        }
      }
    }

    return canvas;
  }

  function createEvent(type, chart, x, y, native) {
    return {
      type: type,
      chart: chart,
      native: native || null,
      x: x !== undefined? x : null,
      y: y !== undefined? y : null,
    };
  }

  function fromNativeEvent(event, chart) {
    var type = eventTypeMap[event.type] || event.type;
    var pos = helpers.getRelativePosition(event, chart);
    return createEvent(type, chart, pos.x, pos.y, event);
  }

  function createResizer(handler) {
    var iframe = document.createElement('iframe');
    iframe.className = 'chartjs-hidden-iframe';
    iframe.style.cssText =
      'display:block;'+
      'overflow:hidden;'+
      'border:0;'+
      'margin:0;'+
      'top:0;'+
      'left:0;'+
      'bottom:0;'+
      'right:0;'+
      'height:100%;'+
      'width:100%;'+
      'position:absolute;'+
      'pointer-events:none;'+
      'z-index:-1;';

    // Prevent the iframe to gain focus on tab.
    // https://github.com/chartjs/Chart.js/issues/3090
    iframe.tabIndex = -1;

    // If the iframe is re-attached to the DOM, the resize listener is removed because the
    // content is reloaded, so make sure to install the handler after the iframe is loaded.
    // https://github.com/chartjs/Chart.js/issues/3521
    helpers.addEvent(iframe, 'load', function() {
      helpers.addEvent(iframe.contentWindow || iframe, 'resize', handler);

      // The iframe size might have changed while loading, which can also
      // happen if the size has been changed while detached from the DOM.
      handler();
    });

    return iframe;
  }

  function addResizeListener(node, listener, chart) {
    var stub = node._chartjs = {
      ticking: false
    };

    // Throttle the callback notification until the next animation frame.
    var notify = function() {
      if (!stub.ticking) {
        stub.ticking = true;
        helpers.requestAnimFrame.call(window, function() {
          if (stub.resizer) {
            stub.ticking = false;
            return listener(createEvent('resize', chart));
          }
        });
      }
    };

    // Let's keep track of this added iframe and thus avoid DOM query when removing it.
    stub.resizer = createResizer(notify);

    node.insertBefore(stub.resizer, node.firstChild);
  }

  function removeResizeListener(node) {
    if (!node || !node._chartjs) {
      return;
    }

    var resizer = node._chartjs.resizer;
    if (resizer) {
      resizer.parentNode.removeChild(resizer);
      node._chartjs.resizer = null;
    }

    delete node._chartjs;
  }

  return {
    acquireContext: function(item, config) {
      if (typeof item === 'string') {
        item = document.getElementById(item);
      } else if (item.length) {
        // Support for array based queries (such as jQuery)
        item = item[0];
      }

      if (item && item.canvas) {
        // Support for any object associated to a canvas (including a context2d)
        item = item.canvas;
      }

      if (item instanceof HTMLCanvasElement) {
        // To prevent canvas fingerprinting, some add-ons undefine the getContext
        // method, for example: https://github.com/kkapsner/CanvasBlocker
        // https://github.com/chartjs/Chart.js/issues/2807
        var context = item.getContext && item.getContext('2d');
        if (context instanceof CanvasRenderingContext2D) {
          initCanvas(item, config);
          return context;
        }
      }

      return null;
    },

    releaseContext: function(context) {
      var canvas = context.canvas;
      if (!canvas._chartjs) {
        return;
      }

      var initial = canvas._chartjs.initial;
      ['height', 'width'].forEach(function(prop) {
        var value = initial[prop];
        if (value === undefined || value === null) {
          canvas.removeAttribute(prop);
        } else {
          canvas.setAttribute(prop, value);
        }
      });

      helpers.each(initial.style || {}, function(value, key) {
        canvas.style[key] = value;
      });

      // The canvas render size might have been changed (and thus the state stack discarded),
      // we can't use save() and restore() to restore the initial state. So make sure that at
      // least the canvas context is reset to the default state by setting the canvas width.
      // https://www.w3.org/TR/2011/WD-html5-20110525/the-canvas-element.html
      canvas.width = canvas.width;

      delete canvas._chartjs;
    },

    addEventListener: function(chart, type, listener) {
      var canvas = chart.chart.canvas;
      if (type === 'resize') {
        // Note: the resize event is not supported on all browsers.
        addResizeListener(canvas.parentNode, listener, chart.chart);
        return;
      }

      var stub = listener._chartjs || (listener._chartjs = {});
      var proxies = stub.proxies || (stub.proxies = {});
      var proxy = proxies[chart.id + '_' + type] = function(event) {
        listener(fromNativeEvent(event, chart.chart));
      };

      helpers.addEvent(canvas, type, proxy);
    },

    removeEventListener: function(chart, type, listener) {
      var canvas = chart.chart.canvas;
      if (type === 'resize') {
        // Note: the resize event is not supported on all browsers.
        removeResizeListener(canvas.parentNode, listener);
        return;
      }

      var stub = listener._chartjs || {};
      var proxies = stub.proxies || {};
      var proxy = proxies[chart.id + '_' + type];
      if (!proxy) {
        return;
      }

      helpers.removeEvent(canvas, type, proxy);
    }
  };
};

},{}],42:[function(require,module,exports){
'use strict';

// By default, select the browser (DOM) platform.
// @TODO Make possible to select another platform at build time.
var implementation = require(41);

module.exports = function(Chart) {
  /**
   * @namespace Chart.platform
   * @see https://chartjs.gitbooks.io/proposals/content/Platform.html
   * @since 2.4.0
   */
  Chart.platform = {
    /**
     * Called at chart construction time, returns a context2d instance implementing
     * the [W3C Canvas 2D Context API standard]{@link https://www.w3.org/TR/2dcontext/}.
     * @param {*} item - The native item from which to acquire context (platform specific)
     * @param {Object} options - The chart options
     * @returns {CanvasRenderingContext2D} context2d instance
     */
    acquireContext: function() {},

    /**
     * Called at chart destruction time, releases any resources associated to the context
     * previously returned by the acquireContext() method.
     * @param {CanvasRenderingContext2D} context - The context2d instance
     * @returns {Boolean} true if the method succeeded, else false
     */
    releaseContext: function() {},

    /**
     * Registers the specified listener on the given chart.
     * @param {Chart} chart - Chart from which to listen for event
     * @param {String} type - The ({@link IEvent}) type to listen for
     * @param {Function} listener - Receives a notification (an object that implements
     * the {@link IEvent} interface) when an event of the specified type occurs.
     */
    addEventListener: function() {},

    /**
     * Removes the specified listener previously registered with addEventListener.
     * @param {Chart} chart -Chart from which to remove the listener
     * @param {String} type - The ({@link IEvent}) type to remove
     * @param {Function} listener - The listener function to remove from the event target.
     */
    removeEventListener: function() {}
  };

  /**
   * @interface IPlatform
   * Allows abstracting platform dependencies away from the chart
   * @borrows Chart.platform.acquireContext as acquireContext
   * @borrows Chart.platform.releaseContext as releaseContext
   * @borrows Chart.platform.addEventListener as addEventListener
   * @borrows Chart.platform.removeEventListener as removeEventListener
   */

  /**
   * @interface IEvent
   * @prop {String} type - The event type name, possible values are:
   * 'contextmenu', 'mouseenter', 'mousedown', 'mousemove', 'mouseup', 'mouseout',
   * 'click', 'dblclick', 'keydown', 'keypress', 'keyup' and 'resize'
   * @prop {*} native - The original native event (null for emulated events, e.g. 'resize')
   * @prop {Number} x - The mouse x position, relative to the canvas (null for incompatible events)
   * @prop {Number} y - The mouse y position, relative to the canvas (null for incompatible events)
   */

  Chart.helpers.extend(Chart.platform, implementation(Chart));
};

},{"41":41}],43:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;
  // Default config for a category scale
  var defaultConfig = {
    position: 'bottom'
  };

  var DatasetScale = Chart.Scale.extend({
    /**
    * Internal function to get the correct labels. If data.xLabels or data.yLabels are defined, use those
    * else fall back to data.labels
    * @private
    */
    getLabels: function() {
      var data = this.chart.data;
      return (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels;
    },
    // Implement this so that
    determineDataLimits: function() {
      var me = this;
      var labels = me.getLabels();
      me.minIndex = 0;
      me.maxIndex = labels.length - 1;
      var findIndex;

      if (me.options.ticks.min !== undefined) {
        // user specified min value
        findIndex = helpers.indexOf(labels, me.options.ticks.min);
        me.minIndex = findIndex !== -1 ? findIndex : me.minIndex;
      }

      if (me.options.ticks.max !== undefined) {
        // user specified max value
        findIndex = helpers.indexOf(labels, me.options.ticks.max);
        me.maxIndex = findIndex !== -1 ? findIndex : me.maxIndex;
      }

      me.min = labels[me.minIndex];
      me.max = labels[me.maxIndex];
    },

    buildTicks: function() {
      var me = this;
      var labels = me.getLabels();
      // If we are viewing some subset of labels, slice the original array
      me.ticks = (me.minIndex === 0 && me.maxIndex === labels.length - 1) ? labels : labels.slice(me.minIndex, me.maxIndex + 1);
    },

    getLabelForIndex: function(index, datasetIndex) {
      var me = this;
      var data = me.chart.data;
      var isHorizontal = me.isHorizontal();

      if (data.yLabels && !isHorizontal) {
        return me.getRightValue(data.datasets[datasetIndex].data[index]);
      }
      return me.ticks[index - me.minIndex];
    },

    // Used to get data value locations.  Value can either be an index or a numerical value
    getPixelForValue: function(value, index, datasetIndex, includeOffset) {
      var me = this;
      // 1 is added because we need the length but we have the indexes
      var offsetAmt = Math.max((me.maxIndex + 1 - me.minIndex - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);

      if (value !== undefined && isNaN(index)) {
        var labels = me.getLabels();
        var idx = labels.indexOf(value);
        index = idx !== -1 ? idx : index;
      }

      if (me.isHorizontal()) {
        var valueWidth = me.width / offsetAmt;
        var widthOffset = (valueWidth * (index - me.minIndex));

        if (me.options.gridLines.offsetGridLines && includeOffset || me.maxIndex === me.minIndex && includeOffset) {
          widthOffset += (valueWidth / 2);
        }

        return me.left + Math.round(widthOffset);
      }
      var valueHeight = me.height / offsetAmt;
      var heightOffset = (valueHeight * (index - me.minIndex));

      if (me.options.gridLines.offsetGridLines && includeOffset) {
        heightOffset += (valueHeight / 2);
      }

      return me.top + Math.round(heightOffset);
    },
    getPixelForTick: function(index, includeOffset) {
      return this.getPixelForValue(this.ticks[index], index + this.minIndex, null, includeOffset);
    },
    getValueForPixel: function(pixel) {
      var me = this;
      var value;
      var offsetAmt = Math.max((me.ticks.length - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
      var horz = me.isHorizontal();
      var valueDimension = (horz ? me.width : me.height) / offsetAmt;

      pixel -= horz ? me.left : me.top;

      if (me.options.gridLines.offsetGridLines) {
        pixel -= (valueDimension / 2);
      }

      if (pixel <= 0) {
        value = 0;
      } else {
        value = Math.round(pixel / valueDimension);
      }

      return value;
    },
    getBasePixel: function() {
      return this.bottom;
    }
  });

  Chart.scaleService.registerScaleType('category', DatasetScale, defaultConfig);

};

},{}],44:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  var defaultConfig = {
    position: 'left',
    ticks: {
      callback: Chart.Ticks.formatters.linear
    }
  };

  var LinearScale = Chart.LinearScaleBase.extend({
    determineDataLimits: function() {
      var me = this;
      var opts = me.options;
      var chart = me.chart;
      var data = chart.data;
      var datasets = data.datasets;
      var isHorizontal = me.isHorizontal();

      function IDMatches(meta) {
        return isHorizontal ? meta.xAxisID === me.id : meta.yAxisID === me.id;
      }

      // First Calculate the range
      me.min = null;
      me.max = null;

      var hasStacks = opts.stacked;
      if (hasStacks === undefined) {
        helpers.each(datasets, function(dataset, datasetIndex) {
          if (hasStacks) {
            return;
          }

          var meta = chart.getDatasetMeta(datasetIndex);
          if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta) &&
            meta.stack !== undefined) {
            hasStacks = true;
          }
        });
      }

      if (opts.stacked || hasStacks) {
        var valuesPerStack = {};

        helpers.each(datasets, function(dataset, datasetIndex) {
          var meta = chart.getDatasetMeta(datasetIndex);
          var key = [
            meta.type,
            // we have a separate stack for stack=undefined datasets when the opts.stacked is undefined
            ((opts.stacked === undefined && meta.stack === undefined) ? datasetIndex : ''),
            meta.stack
          ].join('.');

          if (valuesPerStack[key] === undefined) {
            valuesPerStack[key] = {
              positiveValues: [],
              negativeValues: []
            };
          }

          // Store these per type
          var positiveValues = valuesPerStack[key].positiveValues;
          var negativeValues = valuesPerStack[key].negativeValues;

          if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
            helpers.each(dataset.data, function(rawValue, index) {
              var value = +me.getRightValue(rawValue);
              if (isNaN(value) || meta.data[index].hidden) {
                return;
              }

              positiveValues[index] = positiveValues[index] || 0;
              negativeValues[index] = negativeValues[index] || 0;

              if (opts.relativePoints) {
                positiveValues[index] = 100;
              } else if (value < 0) {
                negativeValues[index] += value;
              } else {
                positiveValues[index] += value;
              }
            });
          }
        });

        helpers.each(valuesPerStack, function(valuesForType) {
          var values = valuesForType.positiveValues.concat(valuesForType.negativeValues);
          var minVal = helpers.min(values);
          var maxVal = helpers.max(values);
          me.min = me.min === null ? minVal : Math.min(me.min, minVal);
          me.max = me.max === null ? maxVal : Math.max(me.max, maxVal);
        });

      } else {
        helpers.each(datasets, function(dataset, datasetIndex) {
          var meta = chart.getDatasetMeta(datasetIndex);
          if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
            helpers.each(dataset.data, function(rawValue, index) {
              var value = +me.getRightValue(rawValue);
              if (isNaN(value) || meta.data[index].hidden) {
                return;
              }

              if (me.min === null) {
                me.min = value;
              } else if (value < me.min) {
                me.min = value;
              }

              if (me.max === null) {
                me.max = value;
              } else if (value > me.max) {
                me.max = value;
              }
            });
          }
        });
      }

      // Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
      this.handleTickRangeOptions();
    },
    getTickLimit: function() {
      var maxTicks;
      var me = this;
      var tickOpts = me.options.ticks;

      if (me.isHorizontal()) {
        maxTicks = Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(me.width / 50));
      } else {
        // The factor of 2 used to scale the font size has been experimentally determined.
        var tickFontSize = helpers.getValueOrDefault(tickOpts.fontSize, Chart.defaults.global.defaultFontSize);
        maxTicks = Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(me.height / (2 * tickFontSize)));
      }

      return maxTicks;
    },
    // Called after the ticks are built. We need
    handleDirectionalChanges: function() {
      if (!this.isHorizontal()) {
        // We are in a vertical orientation. The top value is the highest. So reverse the array
        this.ticks.reverse();
      }
    },
    getLabelForIndex: function(index, datasetIndex) {
      return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
    },
    // Utils
    getPixelForValue: function(value) {
      // This must be called after fit has been run so that
      // this.left, this.top, this.right, and this.bottom have been defined
      var me = this;
      var start = me.start;

      var rightValue = +me.getRightValue(value);
      var pixel;
      var range = me.end - start;

      if (me.isHorizontal()) {
        pixel = me.left + (me.width / range * (rightValue - start));
        return Math.round(pixel);
      }

      pixel = me.bottom - (me.height / range * (rightValue - start));
      return Math.round(pixel);
    },
    getValueForPixel: function(pixel) {
      var me = this;
      var isHorizontal = me.isHorizontal();
      var innerDimension = isHorizontal ? me.width : me.height;
      var offset = (isHorizontal ? pixel - me.left : me.bottom - pixel) / innerDimension;
      return me.start + ((me.end - me.start) * offset);
    },
    getPixelForTick: function(index) {
      return this.getPixelForValue(this.ticksAsNumbers[index]);
    }
  });
  Chart.scaleService.registerScaleType('linear', LinearScale, defaultConfig);

};

},{}],45:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers,
    noop = helpers.noop;

  Chart.LinearScaleBase = Chart.Scale.extend({
    handleTickRangeOptions: function() {
      var me = this;
      var opts = me.options;
      var tickOpts = opts.ticks;

      // If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
      // do nothing since that would make the chart weird. If the user really wants a weird chart
      // axis, they can manually override it
      if (tickOpts.beginAtZero) {
        var minSign = helpers.sign(me.min);
        var maxSign = helpers.sign(me.max);

        if (minSign < 0 && maxSign < 0) {
          // move the top up to 0
          me.max = 0;
        } else if (minSign > 0 && maxSign > 0) {
          // move the bottom down to 0
          me.min = 0;
        }
      }

      if (tickOpts.min !== undefined) {
        me.min = tickOpts.min;
      } else if (tickOpts.suggestedMin !== undefined) {
        me.min = Math.min(me.min, tickOpts.suggestedMin);
      }

      if (tickOpts.max !== undefined) {
        me.max = tickOpts.max;
      } else if (tickOpts.suggestedMax !== undefined) {
        me.max = Math.max(me.max, tickOpts.suggestedMax);
      }

      if (me.min === me.max) {
        me.max++;

        if (!tickOpts.beginAtZero) {
          me.min--;
        }
      }
    },
    getTickLimit: noop,
    handleDirectionalChanges: noop,

    buildTicks: function() {
      var me = this;
      var opts = me.options;
      var tickOpts = opts.ticks;

      // Figure out what the max number of ticks we can support it is based on the size of
      // the axis area. For now, we say that the minimum tick spacing in pixels must be 50
      // We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
      // the graph. Make sure we always have at least 2 ticks
      var maxTicks = me.getTickLimit();
      maxTicks = Math.max(2, maxTicks);

      var numericGeneratorOptions = {
        maxTicks: maxTicks,
        min: tickOpts.min,
        max: tickOpts.max,
        stepSize: helpers.getValueOrDefault(tickOpts.fixedStepSize, tickOpts.stepSize)
      };
      var ticks = me.ticks = Chart.Ticks.generators.linear(numericGeneratorOptions, me);

      me.handleDirectionalChanges();

      // At this point, we need to update our max and min given the tick values since we have expanded the
      // range of the scale
      me.max = helpers.max(ticks);
      me.min = helpers.min(ticks);

      if (tickOpts.reverse) {
        ticks.reverse();

        me.start = me.max;
        me.end = me.min;
      } else {
        me.start = me.min;
        me.end = me.max;
      }
    },
    convertTicksToLabels: function() {
      var me = this;
      me.ticksAsNumbers = me.ticks.slice();
      me.zeroLineIndex = me.ticks.indexOf(0);

      Chart.Scale.prototype.convertTicksToLabels.call(me);
    }
  });
};

},{}],46:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;

  var defaultConfig = {
    position: 'left',

    // label settings
    ticks: {
      callback: Chart.Ticks.formatters.logarithmic
    }
  };

  var LogarithmicScale = Chart.Scale.extend({
    determineDataLimits: function() {
      var me = this;
      var opts = me.options;
      var tickOpts = opts.ticks;
      var chart = me.chart;
      var data = chart.data;
      var datasets = data.datasets;
      var getValueOrDefault = helpers.getValueOrDefault;
      var isHorizontal = me.isHorizontal();
      function IDMatches(meta) {
        return isHorizontal ? meta.xAxisID === me.id : meta.yAxisID === me.id;
      }

      // Calculate Range
      me.min = null;
      me.max = null;
      me.minNotZero = null;

      var hasStacks = opts.stacked;
      if (hasStacks === undefined) {
        helpers.each(datasets, function(dataset, datasetIndex) {
          if (hasStacks) {
            return;
          }

          var meta = chart.getDatasetMeta(datasetIndex);
          if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta) &&
            meta.stack !== undefined) {
            hasStacks = true;
          }
        });
      }

      if (opts.stacked || hasStacks) {
        var valuesPerStack = {};

        helpers.each(datasets, function(dataset, datasetIndex) {
          var meta = chart.getDatasetMeta(datasetIndex);
          var key = [
            meta.type,
            // we have a separate stack for stack=undefined datasets when the opts.stacked is undefined
            ((opts.stacked === undefined && meta.stack === undefined) ? datasetIndex : ''),
            meta.stack
          ].join('.');

          if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
            if (valuesPerStack[key] === undefined) {
              valuesPerStack[key] = [];
            }

            helpers.each(dataset.data, function(rawValue, index) {
              var values = valuesPerStack[key];
              var value = +me.getRightValue(rawValue);
              if (isNaN(value) || meta.data[index].hidden) {
                return;
              }

              values[index] = values[index] || 0;

              if (opts.relativePoints) {
                values[index] = 100;
              } else {
                // Don't need to split positive and negative since the log scale can't handle a 0 crossing
                values[index] += value;
              }
            });
          }
        });

        helpers.each(valuesPerStack, function(valuesForType) {
          var minVal = helpers.min(valuesForType);
          var maxVal = helpers.max(valuesForType);
          me.min = me.min === null ? minVal : Math.min(me.min, minVal);
          me.max = me.max === null ? maxVal : Math.max(me.max, maxVal);
        });

      } else {
        helpers.each(datasets, function(dataset, datasetIndex) {
          var meta = chart.getDatasetMeta(datasetIndex);
          if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
            helpers.each(dataset.data, function(rawValue, index) {
              var value = +me.getRightValue(rawValue);
              if (isNaN(value) || meta.data[index].hidden) {
                return;
              }

              if (me.min === null) {
                me.min = value;
              } else if (value < me.min) {
                me.min = value;
              }

              if (me.max === null) {
                me.max = value;
              } else if (value > me.max) {
                me.max = value;
              }

              if (value !== 0 && (me.minNotZero === null || value < me.minNotZero)) {
                me.minNotZero = value;
              }
            });
          }
        });
      }

      me.min = getValueOrDefault(tickOpts.min, me.min);
      me.max = getValueOrDefault(tickOpts.max, me.max);

      if (me.min === me.max) {
        if (me.min !== 0 && me.min !== null) {
          me.min = Math.pow(10, Math.floor(helpers.log10(me.min)) - 1);
          me.max = Math.pow(10, Math.floor(helpers.log10(me.max)) + 1);
        } else {
          me.min = 1;
          me.max = 10;
        }
      }
    },
    buildTicks: function() {
      var me = this;
      var opts = me.options;
      var tickOpts = opts.ticks;

      var generationOptions = {
        min: tickOpts.min,
        max: tickOpts.max
      };
      var ticks = me.ticks = Chart.Ticks.generators.logarithmic(generationOptions, me);

      if (!me.isHorizontal()) {
        // We are in a vertical orientation. The top value is the highest. So reverse the array
        ticks.reverse();
      }

      // At this point, we need to update our max and min given the tick values since we have expanded the
      // range of the scale
      me.max = helpers.max(ticks);
      me.min = helpers.min(ticks);

      if (tickOpts.reverse) {
        ticks.reverse();

        me.start = me.max;
        me.end = me.min;
      } else {
        me.start = me.min;
        me.end = me.max;
      }
    },
    convertTicksToLabels: function() {
      this.tickValues = this.ticks.slice();

      Chart.Scale.prototype.convertTicksToLabels.call(this);
    },
    // Get the correct tooltip label
    getLabelForIndex: function(index, datasetIndex) {
      return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
    },
    getPixelForTick: function(index) {
      return this.getPixelForValue(this.tickValues[index]);
    },
    getPixelForValue: function(value) {
      var me = this;
      var innerDimension;
      var pixel;

      var start = me.start;
      var newVal = +me.getRightValue(value);
      var range;
      var opts = me.options;
      var tickOpts = opts.ticks;

      if (me.isHorizontal()) {
        range = helpers.log10(me.end) - helpers.log10(start); // todo: if start === 0
        if (newVal === 0) {
          pixel = me.left;
        } else {
          innerDimension = me.width;
          pixel = me.left + (innerDimension / range * (helpers.log10(newVal) - helpers.log10(start)));
        }
      } else {
        // Bottom - top since pixels increase downward on a screen
        innerDimension = me.height;
        if (start === 0 && !tickOpts.reverse) {
          range = helpers.log10(me.end) - helpers.log10(me.minNotZero);
          if (newVal === start) {
            pixel = me.bottom;
          } else if (newVal === me.minNotZero) {
            pixel = me.bottom - innerDimension * 0.02;
          } else {
            pixel = me.bottom - innerDimension * 0.02 - (innerDimension * 0.98/ range * (helpers.log10(newVal)-helpers.log10(me.minNotZero)));
          }
        } else if (me.end === 0 && tickOpts.reverse) {
          range = helpers.log10(me.start) - helpers.log10(me.minNotZero);
          if (newVal === me.end) {
            pixel = me.top;
          } else if (newVal === me.minNotZero) {
            pixel = me.top + innerDimension * 0.02;
          } else {
            pixel = me.top + innerDimension * 0.02 + (innerDimension * 0.98/ range * (helpers.log10(newVal)-helpers.log10(me.minNotZero)));
          }
        } else {
          range = helpers.log10(me.end) - helpers.log10(start);
          innerDimension = me.height;
          pixel = me.bottom - (innerDimension / range * (helpers.log10(newVal) - helpers.log10(start)));
        }
      }
      return pixel;
    },
    getValueForPixel: function(pixel) {
      var me = this;
      var range = helpers.log10(me.end) - helpers.log10(me.start);
      var value, innerDimension;

      if (me.isHorizontal()) {
        innerDimension = me.width;
        value = me.start * Math.pow(10, (pixel - me.left) * range / innerDimension);
      } else {  // todo: if start === 0
        innerDimension = me.height;
        value = Math.pow(10, (me.bottom - pixel) * range / innerDimension) / me.start;
      }
      return value;
    }
  });
  Chart.scaleService.registerScaleType('logarithmic', LogarithmicScale, defaultConfig);

};

},{}],47:[function(require,module,exports){
'use strict';

module.exports = function(Chart) {

  var helpers = Chart.helpers;
  var globalDefaults = Chart.defaults.global;

  var defaultConfig = {
    display: true,

    // Boolean - Whether to animate scaling the chart from the centre
    animate: true,
    lineArc: false,
    position: 'chartArea',

    angleLines: {
      display: true,
      color: 'rgba(0, 0, 0, 0.1)',
      lineWidth: 1
    },

    // label settings
    ticks: {
      // Boolean - Show a backdrop to the scale label
      showLabelBackdrop: true,

      // String - The colour of the label backdrop
      backdropColor: 'rgba(255,255,255,0.75)',

      // Number - The backdrop padding above & below the label in pixels
      backdropPaddingY: 2,

      // Number - The backdrop padding to the side of the label in pixels
      backdropPaddingX: 2,

      callback: Chart.Ticks.formatters.linear
    },

    pointLabels: {
      // Number - Point label font size in pixels
      fontSize: 10,

      // Function - Used to convert point labels
      callback: function(label) {
        return label;
      }
    }
  };

  function getValueCount(scale) {
    return !scale.options.lineArc ? scale.chart.data.labels.length : 0;
  }

  function getPointLabelFontOptions(scale) {
    var pointLabelOptions = scale.options.pointLabels;
    var fontSize = helpers.getValueOrDefault(pointLabelOptions.fontSize, globalDefaults.defaultFontSize);
    var fontStyle = helpers.getValueOrDefault(pointLabelOptions.fontStyle, globalDefaults.defaultFontStyle);
    var fontFamily = helpers.getValueOrDefault(pointLabelOptions.fontFamily, globalDefaults.defaultFontFamily);
    var font = helpers.fontString(fontSize, fontStyle, fontFamily);

    return {
      size: fontSize,
      style: fontStyle,
      family: fontFamily,
      font: font
    };
  }

  function measureLabelSize(ctx, fontSize, label) {
    if (helpers.isArray(label)) {
      return {
        w: helpers.longestText(ctx, ctx.font, label),
        h: (label.length * fontSize) + ((label.length - 1) * 1.5 * fontSize)
      };
    }

    return {
      w: ctx.measureText(label).width,
      h: fontSize
    };
  }

  function determineLimits(angle, pos, size, min, max) {
    if (angle === min || angle === max) {
      return {
        start: pos - (size / 2),
        end: pos + (size / 2)
      };
    } else if (angle < min || angle > max) {
      return {
        start: pos - size - 5,
        end: pos
      };
    }

    return {
      start: pos,
      end: pos + size + 5
    };
  }

  /**
   * Helper function to fit a radial linear scale with point labels
   */
  function fitWithPointLabels(scale) {
    /*
     * Right, this is really confusing and there is a lot of maths going on here
     * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
     *
     * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
     *
     * Solution:
     *
     * We assume the radius of the polygon is half the size of the canvas at first
     * at each index we check if the text overlaps.
     *
     * Where it does, we store that angle and that index.
     *
     * After finding the largest index and angle we calculate how much we need to remove
     * from the shape radius to move the point inwards by that x.
     *
     * We average the left and right distances to get the maximum shape radius that can fit in the box
     * along with labels.
     *
     * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
     * on each side, removing that from the size, halving it and adding the left x protrusion width.
     *
     * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
     * and position it in the most space efficient manner
     *
     * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
     */

    var plFont = getPointLabelFontOptions(scale);

    // Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
    // Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
    var largestPossibleRadius = Math.min(scale.height / 2, scale.width / 2);
    var furthestLimits = {
      l: scale.width,
      r: 0,
      t: scale.height,
      b: 0
    };
    var furthestAngles = {};
    var i;
    var textSize;
    var pointPosition;

    scale.ctx.font = plFont.font;
    scale._pointLabelSizes = [];

    var valueCount = getValueCount(scale);
    for (i = 0; i < valueCount; i++) {
      pointPosition = scale.getPointPosition(i, largestPossibleRadius);
      textSize = measureLabelSize(scale.ctx, plFont.size, scale.pointLabels[i] || '');
      scale._pointLabelSizes[i] = textSize;

      // Add quarter circle to make degree 0 mean top of circle
      var angleRadians = scale.getIndexAngle(i);
      var angle = helpers.toDegrees(angleRadians) % 360;
      var hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
      var vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);

      if (hLimits.start < furthestLimits.l) {
        furthestLimits.l = hLimits.start;
        furthestAngles.l = angleRadians;
      }

      if (hLimits.end > furthestLimits.r) {
        furthestLimits.r = hLimits.end;
        furthestAngles.r = angleRadians;
      }

      if (vLimits.start < furthestLimits.t) {
        furthestLimits.t = vLimits.start;
        furthestAngles.t = angleRadians;
      }

      if (vLimits.end > furthestLimits.b) {
        furthestLimits.b = vLimits.end;
        furthestAngles.b = angleRadians;
      }
    }

    scale.setReductions(largestPossibleRadius, furthestLimits, furthestAngles);
  }

  /**
   * Helper function to fit a radial linear scale with no point labels
   */
  function fit(scale) {
    var largestPossibleRadius = Math.min(scale.height / 2, scale.width / 2);
    scale.drawingArea = Math.round(largestPossibleRadius);
    scale.setCenterPoint(0, 0, 0, 0);
  }

  function getTextAlignForAngle(angle) {
    if (angle === 0 || angle === 180) {
      return 'center';
    } else if (angle < 180) {
      return 'left';
    }

    return 'right';
  }

  function fillText(ctx, text, position, fontSize) {
    if (helpers.isArray(text)) {
      var y = position.y;
      var spacing = 1.5 * fontSize;

      for (var i = 0; i < text.length; ++i) {
        ctx.fillText(text[i], position.x, y);
        y+= spacing;
      }
    } else {
      ctx.fillText(text, position.x, position.y);
    }
  }

  function adjustPointPositionForLabelHeight(angle, textSize, position) {
    if (angle === 90 || angle === 270) {
      position.y -= (textSize.h / 2);
    } else if (angle > 270 || angle < 90) {
      position.y -= textSize.h;
    }
  }

  function drawPointLabels(scale) {
    var ctx = scale.ctx;
    var getValueOrDefault = helpers.getValueOrDefault;
    var opts = scale.options;
    var angleLineOpts = opts.angleLines;
    var pointLabelOpts = opts.pointLabels;

    ctx.lineWidth = angleLineOpts.lineWidth;
    ctx.strokeStyle = angleLineOpts.color;

    var outerDistance = scale.getDistanceFromCenterForValue(opts.reverse ? scale.min : scale.max);

    // Point Label Font
    var plFont = getPointLabelFontOptions(scale);

    ctx.textBaseline = 'top';

    for (var i = getValueCount(scale) - 1; i >= 0; i--) {
      if (angleLineOpts.display) {
        var outerPosition = scale.getPointPosition(i, outerDistance);
        ctx.beginPath();
        ctx.moveTo(scale.xCenter, scale.yCenter);
        ctx.lineTo(outerPosition.x, outerPosition.y);
        ctx.stroke();
        ctx.closePath();
      }
      // Extra 3px out for some label spacing
      var pointLabelPosition = scale.getPointPosition(i, outerDistance + 5);

      // Keep this in loop since we may support array properties here
      var pointLabelFontColor = getValueOrDefault(pointLabelOpts.fontColor, globalDefaults.defaultFontColor);
      ctx.font = plFont.font;
      ctx.fillStyle = pointLabelFontColor;

      var angleRadians = scale.getIndexAngle(i);
      var angle = helpers.toDegrees(angleRadians);
      ctx.textAlign = getTextAlignForAngle(angle);
      adjustPointPositionForLabelHeight(angle, scale._pointLabelSizes[i], pointLabelPosition);
      fillText(ctx, scale.pointLabels[i] || '', pointLabelPosition, plFont.size);
    }
  }

  function drawRadiusLine(scale, gridLineOpts, radius, index) {
    var ctx = scale.ctx;
    ctx.strokeStyle = helpers.getValueAtIndexOrDefault(gridLineOpts.color, index - 1);
    ctx.lineWidth = helpers.getValueAtIndexOrDefault(gridLineOpts.lineWidth, index - 1);

    if (scale.options.lineArc) {
      // Draw circular arcs between the points
      ctx.beginPath();
      ctx.arc(scale.xCenter, scale.yCenter, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.stroke();
    } else {
      // Draw straight lines connecting each index
      var valueCount = getValueCount(scale);

      if (valueCount === 0) {
        return;
      }

      ctx.beginPath();
      var pointPosition = scale.getPointPosition(0, radius);
      ctx.moveTo(pointPosition.x, pointPosition.y);

      for (var i = 1; i < valueCount; i++) {
        pointPosition = scale.getPointPosition(i, radius);
        ctx.lineTo(pointPosition.x, pointPosition.y);
      }

      ctx.closePath();
      ctx.stroke();
    }
  }

  function numberOrZero(param) {
    return helpers.isNumber(param) ? param : 0;
  }

  var LinearRadialScale = Chart.LinearScaleBase.extend({
    setDimensions: function() {
      var me = this;
      var opts = me.options;
      var tickOpts = opts.ticks;
      // Set the unconstrained dimension before label rotation
      me.width = me.maxWidth;
      me.height = me.maxHeight;
      me.xCenter = Math.round(me.width / 2);
      me.yCenter = Math.round(me.height / 2);

      var minSize = helpers.min([me.height, me.width]);
      var tickFontSize = helpers.getValueOrDefault(tickOpts.fontSize, globalDefaults.defaultFontSize);
      me.drawingArea = opts.display ? (minSize / 2) - (tickFontSize / 2 + tickOpts.backdropPaddingY) : (minSize / 2);
    },
    determineDataLimits: function() {
      var me = this;
      var chart = me.chart;
      var min = Number.POSITIVE_INFINITY;
      var max = Number.NEGATIVE_INFINITY;

      helpers.each(chart.data.datasets, function(dataset, datasetIndex) {
        if (chart.isDatasetVisible(datasetIndex)) {
          var meta = chart.getDatasetMeta(datasetIndex);

          helpers.each(dataset.data, function(rawValue, index) {
            var value = +me.getRightValue(rawValue);
            if (isNaN(value) || meta.data[index].hidden) {
              return;
            }

            min = Math.min(value, min);
            max = Math.max(value, max);
          });
        }
      });

      me.min = (min === Number.POSITIVE_INFINITY ? 0 : min);
      me.max = (max === Number.NEGATIVE_INFINITY ? 0 : max);

      // Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
      me.handleTickRangeOptions();
    },
    getTickLimit: function() {
      var tickOpts = this.options.ticks;
      var tickFontSize = helpers.getValueOrDefault(tickOpts.fontSize, globalDefaults.defaultFontSize);
      return Math.min(tickOpts.maxTicksLimit ? tickOpts.maxTicksLimit : 11, Math.ceil(this.drawingArea / (1.5 * tickFontSize)));
    },
    convertTicksToLabels: function() {
      var me = this;
      Chart.LinearScaleBase.prototype.convertTicksToLabels.call(me);

      // Point labels
      me.pointLabels = me.chart.data.labels.map(me.options.pointLabels.callback, me);
    },
    getLabelForIndex: function(index, datasetIndex) {
      return +this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);
    },
    fit: function() {
      if (this.options.lineArc) {
        fit(this);
      } else {
        fitWithPointLabels(this);
      }
    },
    /**
     * Set radius reductions and determine new radius and center point
     * @private
     */
    setReductions: function(largestPossibleRadius, furthestLimits, furthestAngles) {
      var me = this;
      var radiusReductionLeft = furthestLimits.l / Math.sin(furthestAngles.l);
      var radiusReductionRight = Math.max(furthestLimits.r - me.width, 0) / Math.sin(furthestAngles.r);
      var radiusReductionTop = -furthestLimits.t / Math.cos(furthestAngles.t);
      var radiusReductionBottom = -Math.max(furthestLimits.b - me.height, 0) / Math.cos(furthestAngles.b);

      radiusReductionLeft = numberOrZero(radiusReductionLeft);
      radiusReductionRight = numberOrZero(radiusReductionRight);
      radiusReductionTop = numberOrZero(radiusReductionTop);
      radiusReductionBottom = numberOrZero(radiusReductionBottom);

      me.drawingArea = Math.min(
        Math.round(largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2),
        Math.round(largestPossibleRadius - (radiusReductionTop + radiusReductionBottom) / 2));
      me.setCenterPoint(radiusReductionLeft, radiusReductionRight, radiusReductionTop, radiusReductionBottom);
    },
    setCenterPoint: function(leftMovement, rightMovement, topMovement, bottomMovement) {
      var me = this;
      var maxRight = me.width - rightMovement - me.drawingArea,
        maxLeft = leftMovement + me.drawingArea,
        maxTop = topMovement + me.drawingArea,
        maxBottom = me.height - bottomMovement - me.drawingArea;

      me.xCenter = Math.round(((maxLeft + maxRight) / 2) + me.left);
      me.yCenter = Math.round(((maxTop + maxBottom) / 2) + me.top);
    },

    getIndexAngle: function(index) {
      var angleMultiplier = (Math.PI * 2) / getValueCount(this);
      var startAngle = this.chart.options && this.chart.options.startAngle ?
        this.chart.options.startAngle :
        0;

      var startAngleRadians = startAngle * Math.PI * 2 / 360;

      // Start from the top instead of right, so remove a quarter of the circle
      return index * angleMultiplier + startAngleRadians;
    },
    getDistanceFromCenterForValue: function(value) {
      var me = this;

      if (value === null) {
        return 0; // null always in center
      }

      // Take into account half font size + the yPadding of the top value
      var scalingFactor = me.drawingArea / (me.max - me.min);
      if (me.options.reverse) {
        return (me.max - value) * scalingFactor;
      }
      return (value - me.min) * scalingFactor;
    },
    getPointPosition: function(index, distanceFromCenter) {
      var me = this;
      var thisAngle = me.getIndexAngle(index) - (Math.PI / 2);
      return {
        x: Math.round(Math.cos(thisAngle) * distanceFromCenter) + me.xCenter,
        y: Math.round(Math.sin(thisAngle) * distanceFromCenter) + me.yCenter
      };
    },
    getPointPositionForValue: function(index, value) {
      return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
    },

    getBasePosition: function() {
      var me = this;
      var min = me.min;
      var max = me.max;

      return me.getPointPositionForValue(0,
        me.beginAtZero? 0:
        min < 0 && max < 0? max :
        min > 0 && max > 0? min :
        0);
    },

    draw: function() {
      var me = this;
      var opts = me.options;
      var gridLineOpts = opts.gridLines;
      var tickOpts = opts.ticks;
      var getValueOrDefault = helpers.getValueOrDefault;

      if (opts.display) {
        var ctx = me.ctx;

        // Tick Font
        var tickFontSize = getValueOrDefault(tickOpts.fontSize, globalDefaults.defaultFontSize);
        var tickFontStyle = getValueOrDefault(tickOpts.fontStyle, globalDefaults.defaultFontStyle);
        var tickFontFamily = getValueOrDefault(tickOpts.fontFamily, globalDefaults.defaultFontFamily);
        var tickLabelFont = helpers.fontString(tickFontSize, tickFontStyle, tickFontFamily);

        helpers.each(me.ticks, function(label, index) {
          // Don't draw a centre value (if it is minimum)
          if (index > 0 || opts.reverse) {
            var yCenterOffset = me.getDistanceFromCenterForValue(me.ticksAsNumbers[index]);
            var yHeight = me.yCenter - yCenterOffset;

            // Draw circular lines around the scale
            if (gridLineOpts.display && index !== 0) {
              drawRadiusLine(me, gridLineOpts, yCenterOffset, index);
            }

            if (tickOpts.display) {
              var tickFontColor = getValueOrDefault(tickOpts.fontColor, globalDefaults.defaultFontColor);
              ctx.font = tickLabelFont;

              if (tickOpts.showLabelBackdrop) {
                var labelWidth = ctx.measureText(label).width;
                ctx.fillStyle = tickOpts.backdropColor;
                ctx.fillRect(
                  me.xCenter - labelWidth / 2 - tickOpts.backdropPaddingX,
                  yHeight - tickFontSize / 2 - tickOpts.backdropPaddingY,
                  labelWidth + tickOpts.backdropPaddingX * 2,
                  tickFontSize + tickOpts.backdropPaddingY * 2
                );
              }

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = tickFontColor;
              ctx.fillText(label, me.xCenter, yHeight);
            }
          }
        });

        if (!opts.lineArc) {
          drawPointLabels(me);
        }
      }
    }
  });
  Chart.scaleService.registerScaleType('radialLinear', LinearRadialScale, defaultConfig);

};

},{}],48:[function(require,module,exports){
/* global window: false */
'use strict';

var moment = require(1);
moment = typeof(moment) === 'function' ? moment : window.moment;

module.exports = function(Chart) {

  var helpers = Chart.helpers;
  var time = {
    units: [{
      name: 'millisecond',
      steps: [1, 2, 5, 10, 20, 50, 100, 250, 500]
    }, {
      name: 'second',
      steps: [1, 2, 5, 10, 30]
    }, {
      name: 'minute',
      steps: [1, 2, 5, 10, 30]
    }, {
      name: 'hour',
      steps: [1, 2, 3, 6, 12]
    }, {
      name: 'day',
      steps: [1, 2, 5]
    }, {
      name: 'week',
      maxStep: 4
    }, {
      name: 'month',
      maxStep: 3
    }, {
      name: 'quarter',
      maxStep: 4
    }, {
      name: 'year',
      maxStep: false
    }]
  };

  var defaultConfig = {
    position: 'bottom',

    time: {
      parser: false, // false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
      format: false, // DEPRECATED false == date objects, moment object, callback or a pattern string from http://momentjs.com/docs/#/parsing/string-format/
      unit: false, // false == automatic or override with week, month, year, etc.
      round: false, // none, or override with week, month, year, etc.
      displayFormat: false, // DEPRECATED
      isoWeekday: false, // override week start day - see http://momentjs.com/docs/#/get-set/iso-weekday/
      minUnit: 'millisecond',

      // defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
      displayFormats: {
        millisecond: 'h:mm:ss.SSS a', // 11:20:01.123 AM,
        second: 'h:mm:ss a', // 11:20:01 AM
        minute: 'h:mm:ss a', // 11:20:01 AM
        hour: 'MMM D, hA', // Sept 4, 5PM
        day: 'll', // Sep 4 2015
        week: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
        month: 'MMM YYYY', // Sept 2015
        quarter: '[Q]Q - YYYY', // Q3
        year: 'YYYY' // 2015
      }
    },
    ticks: {
      autoSkip: false
    }
  };

  var TimeScale = Chart.Scale.extend({
    initialize: function() {
      if (!moment) {
        throw new Error('Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com');
      }

      Chart.Scale.prototype.initialize.call(this);
    },
    getLabelMoment: function(datasetIndex, index) {
      if (datasetIndex === null || index === null) {
        return null;
      }

      if (typeof this.labelMoments[datasetIndex] !== 'undefined') {
        return this.labelMoments[datasetIndex][index];
      }

      return null;
    },
    getLabelDiff: function(datasetIndex, index) {
      var me = this;
      if (datasetIndex === null || index === null) {
        return null;
      }

      if (me.labelDiffs === undefined) {
        me.buildLabelDiffs();
      }

      if (typeof me.labelDiffs[datasetIndex] !== 'undefined') {
        return me.labelDiffs[datasetIndex][index];
      }

      return null;
    },
    getMomentStartOf: function(tick) {
      var me = this;
      if (me.options.time.unit === 'week' && me.options.time.isoWeekday !== false) {
        return tick.clone().startOf('isoWeek').isoWeekday(me.options.time.isoWeekday);
      }
      return tick.clone().startOf(me.tickUnit);
    },
    determineDataLimits: function() {
      var me = this;
      me.labelMoments = [];

      // Only parse these once. If the dataset does not have data as x,y pairs, we will use
      // these
      var scaleLabelMoments = [];
      if (me.chart.data.labels && me.chart.data.labels.length > 0) {
        helpers.each(me.chart.data.labels, function(label) {
          var labelMoment = me.parseTime(label);

          if (labelMoment.isValid()) {
            if (me.options.time.round) {
              labelMoment.startOf(me.options.time.round);
            }
            scaleLabelMoments.push(labelMoment);
          }
        }, me);

        me.firstTick = moment.min.call(me, scaleLabelMoments);
        me.lastTick = moment.max.call(me, scaleLabelMoments);
      } else {
        me.firstTick = null;
        me.lastTick = null;
      }

      helpers.each(me.chart.data.datasets, function(dataset, datasetIndex) {
        var momentsForDataset = [];
        var datasetVisible = me.chart.isDatasetVisible(datasetIndex);

        if (typeof dataset.data[0] === 'object' && dataset.data[0] !== null) {
          helpers.each(dataset.data, function(value) {
            var labelMoment = me.parseTime(me.getRightValue(value));

            if (labelMoment.isValid()) {
              if (me.options.time.round) {
                labelMoment.startOf(me.options.time.round);
              }
              momentsForDataset.push(labelMoment);

              if (datasetVisible) {
                // May have gone outside the scale ranges, make sure we keep the first and last ticks updated
                me.firstTick = me.firstTick !== null ? moment.min(me.firstTick, labelMoment) : labelMoment;
                me.lastTick = me.lastTick !== null ? moment.max(me.lastTick, labelMoment) : labelMoment;
              }
            }
          }, me);
        } else {
          // We have no labels. Use the ones from the scale
          momentsForDataset = scaleLabelMoments;
        }

        me.labelMoments.push(momentsForDataset);
      }, me);

      // Set these after we've done all the data
      if (me.options.time.min) {
        me.firstTick = me.parseTime(me.options.time.min);
      }

      if (me.options.time.max) {
        me.lastTick = me.parseTime(me.options.time.max);
      }

      // We will modify these, so clone for later
      me.firstTick = (me.firstTick || moment()).clone();
      me.lastTick = (me.lastTick || moment()).clone();
    },
    buildLabelDiffs: function() {
      var me = this;
      me.labelDiffs = [];
      var scaleLabelDiffs = [];
      // Parse common labels once
      if (me.chart.data.labels && me.chart.data.labels.length > 0) {
        helpers.each(me.chart.data.labels, function(label) {
          var labelMoment = me.parseTime(label);

          if (labelMoment.isValid()) {
            if (me.options.time.round) {
              labelMoment.startOf(me.options.time.round);
            }
            scaleLabelDiffs.push(labelMoment.diff(me.firstTick, me.tickUnit, true));
          }
        }, me);
      }

      helpers.each(me.chart.data.datasets, function(dataset) {
        var diffsForDataset = [];

        if (typeof dataset.data[0] === 'object' && dataset.data[0] !== null) {
          helpers.each(dataset.data, function(value) {
            var labelMoment = me.parseTime(me.getRightValue(value));

            if (labelMoment.isValid()) {
              if (me.options.time.round) {
                labelMoment.startOf(me.options.time.round);
              }
              diffsForDataset.push(labelMoment.diff(me.firstTick, me.tickUnit, true));
            }
          }, me);
        } else {
          // We have no labels. Use common ones
          diffsForDataset = scaleLabelDiffs;
        }

        me.labelDiffs.push(diffsForDataset);
      }, me);
    },
    buildTicks: function() {
      var me = this;

      me.ctx.save();
      var tickFontSize = helpers.getValueOrDefault(me.options.ticks.fontSize, Chart.defaults.global.defaultFontSize);
      var tickFontStyle = helpers.getValueOrDefault(me.options.ticks.fontStyle, Chart.defaults.global.defaultFontStyle);
      var tickFontFamily = helpers.getValueOrDefault(me.options.ticks.fontFamily, Chart.defaults.global.defaultFontFamily);
      var tickLabelFont = helpers.fontString(tickFontSize, tickFontStyle, tickFontFamily);
      me.ctx.font = tickLabelFont;

      me.ticks = [];
      me.unitScale = 1; // How much we scale the unit by, ie 2 means 2x unit per step
      me.scaleSizeInUnits = 0; // How large the scale is in the base unit (seconds, minutes, etc)

      // Set unit override if applicable
      if (me.options.time.unit) {
        me.tickUnit = me.options.time.unit || 'day';
        me.displayFormat = me.options.time.displayFormats[me.tickUnit];
        me.scaleSizeInUnits = me.lastTick.diff(me.firstTick, me.tickUnit, true);
        me.unitScale = helpers.getValueOrDefault(me.options.time.unitStepSize, 1);
      } else {
        // Determine the smallest needed unit of the time
        var innerWidth = me.isHorizontal() ? me.width : me.height;

        // Crude approximation of what the label length might be
        var tempFirstLabel = me.tickFormatFunction(me.firstTick, 0, []);
        var tickLabelWidth = me.ctx.measureText(tempFirstLabel).width;
        var cosRotation = Math.cos(helpers.toRadians(me.options.ticks.maxRotation));
        var sinRotation = Math.sin(helpers.toRadians(me.options.ticks.maxRotation));
        tickLabelWidth = (tickLabelWidth * cosRotation) + (tickFontSize * sinRotation);
        var labelCapacity = innerWidth / (tickLabelWidth);

        // Start as small as possible
        me.tickUnit = me.options.time.minUnit;
        me.scaleSizeInUnits = me.lastTick.diff(me.firstTick, me.tickUnit, true);
        me.displayFormat = me.options.time.displayFormats[me.tickUnit];

        var unitDefinitionIndex = 0;
        var unitDefinition = time.units[unitDefinitionIndex];

        // While we aren't ideal and we don't have units left
        while (unitDefinitionIndex < time.units.length) {
          // Can we scale this unit. If `false` we can scale infinitely
          me.unitScale = 1;

          if (helpers.isArray(unitDefinition.steps) && Math.ceil(me.scaleSizeInUnits / labelCapacity) < helpers.max(unitDefinition.steps)) {
            // Use one of the predefined steps
            for (var idx = 0; idx < unitDefinition.steps.length; ++idx) {
              if (unitDefinition.steps[idx] >= Math.ceil(me.scaleSizeInUnits / labelCapacity)) {
                me.unitScale = helpers.getValueOrDefault(me.options.time.unitStepSize, unitDefinition.steps[idx]);
                break;
              }
            }

            break;
          } else if ((unitDefinition.maxStep === false) || (Math.ceil(me.scaleSizeInUnits / labelCapacity) < unitDefinition.maxStep)) {
            // We have a max step. Scale this unit
            me.unitScale = helpers.getValueOrDefault(me.options.time.unitStepSize, Math.ceil(me.scaleSizeInUnits / labelCapacity));
            break;
          } else {
            // Move to the next unit up
            ++unitDefinitionIndex;
            unitDefinition = time.units[unitDefinitionIndex];

            me.tickUnit = unitDefinition.name;
            var leadingUnitBuffer = me.firstTick.diff(me.getMomentStartOf(me.firstTick), me.tickUnit, true);
            var trailingUnitBuffer = me.getMomentStartOf(me.lastTick.clone().add(1, me.tickUnit)).diff(me.lastTick, me.tickUnit, true);
            me.scaleSizeInUnits = me.lastTick.diff(me.firstTick, me.tickUnit, true) + leadingUnitBuffer + trailingUnitBuffer;
            me.displayFormat = me.options.time.displayFormats[unitDefinition.name];
          }
        }
      }

      var roundedStart;

      // Only round the first tick if we have no hard minimum
      if (!me.options.time.min) {
        me.firstTick = me.getMomentStartOf(me.firstTick);
        roundedStart = me.firstTick;
      } else {
        roundedStart = me.getMomentStartOf(me.firstTick);
      }

      // Only round the last tick if we have no hard maximum
      if (!me.options.time.max) {
        var roundedEnd = me.getMomentStartOf(me.lastTick);
        var delta = roundedEnd.diff(me.lastTick, me.tickUnit, true);
        if (delta < 0) {
          // Do not use end of because we need me to be in the next time unit
          me.lastTick = me.getMomentStartOf(me.lastTick.add(1, me.tickUnit));
        } else if (delta >= 0) {
          me.lastTick = roundedEnd;
        }

        me.scaleSizeInUnits = me.lastTick.diff(me.firstTick, me.tickUnit, true);
      }

      // Tick displayFormat override
      if (me.options.time.displayFormat) {
        me.displayFormat = me.options.time.displayFormat;
      }

      // first tick. will have been rounded correctly if options.time.min is not specified
      me.ticks.push(me.firstTick.clone());

      // For every unit in between the first and last moment, create a moment and add it to the ticks tick
      for (var i = me.unitScale; i <= me.scaleSizeInUnits; i += me.unitScale) {
        var newTick = roundedStart.clone().add(i, me.tickUnit);

        // Are we greater than the max time
        if (me.options.time.max && newTick.diff(me.lastTick, me.tickUnit, true) >= 0) {
          break;
        }

        me.ticks.push(newTick);
      }

      // Always show the right tick
      var diff = me.ticks[me.ticks.length - 1].diff(me.lastTick, me.tickUnit);
      if (diff !== 0 || me.scaleSizeInUnits === 0) {
        // this is a weird case. If the <max> option is the same as the end option, we can't just diff the times because the tick was created from the roundedStart
        // but the last tick was not rounded.
        if (me.options.time.max) {
          me.ticks.push(me.lastTick.clone());
          me.scaleSizeInUnits = me.lastTick.diff(me.ticks[0], me.tickUnit, true);
        } else {
          me.ticks.push(me.lastTick.clone());
          me.scaleSizeInUnits = me.lastTick.diff(me.firstTick, me.tickUnit, true);
        }
      }

      me.ctx.restore();

      // Invalidate label diffs cache
      me.labelDiffs = undefined;
    },
    // Get tooltip label
    getLabelForIndex: function(index, datasetIndex) {
      var me = this;
      var label = me.chart.data.labels && index < me.chart.data.labels.length ? me.chart.data.labels[index] : '';
      var value = me.chart.data.datasets[datasetIndex].data[index];

      if (value !== null && typeof value === 'object') {
        label = me.getRightValue(value);
      }

      // Format nicely
      if (me.options.time.tooltipFormat) {
        label = me.parseTime(label).format(me.options.time.tooltipFormat);
      }

      return label;
    },
    // Function to format an individual tick mark
    tickFormatFunction: function(tick, index, ticks) {
      var formattedTick = tick.format(this.displayFormat);
      var tickOpts = this.options.ticks;
      var callback = helpers.getValueOrDefault(tickOpts.callback, tickOpts.userCallback);

      if (callback) {
        return callback(formattedTick, index, ticks);
      }
      return formattedTick;
    },
    convertTicksToLabels: function() {
      var me = this;
      me.tickMoments = me.ticks;
      me.ticks = me.ticks.map(me.tickFormatFunction, me);
    },
    getPixelForValue: function(value, index, datasetIndex) {
      var me = this;
      var offset = null;
      if (index !== undefined && datasetIndex !== undefined) {
        offset = me.getLabelDiff(datasetIndex, index);
      }

      if (offset === null) {
        if (!value || !value.isValid) {
          // not already a moment object
          value = me.parseTime(me.getRightValue(value));
        }
        if (value && value.isValid && value.isValid()) {
          offset = value.diff(me.firstTick, me.tickUnit, true);
        }
      }

      if (offset !== null) {
        var decimal = offset !== 0 ? offset / me.scaleSizeInUnits : offset;

        if (me.isHorizontal()) {
          var valueOffset = (me.width * decimal);
          return me.left + Math.round(valueOffset);
        }

        var heightOffset = (me.height * decimal);
        return me.top + Math.round(heightOffset);
      }
    },
    getPixelForTick: function(index) {
      return this.getPixelForValue(this.tickMoments[index], null, null);
    },
    getValueForPixel: function(pixel) {
      var me = this;
      var innerDimension = me.isHorizontal() ? me.width : me.height;
      var offset = (pixel - (me.isHorizontal() ? me.left : me.top)) / innerDimension;
      offset *= me.scaleSizeInUnits;
      return me.firstTick.clone().add(moment.duration(offset, me.tickUnit).asSeconds(), 'seconds');
    },
    parseTime: function(label) {
      var me = this;
      if (typeof me.options.time.parser === 'string') {
        return moment(label, me.options.time.parser);
      }
      if (typeof me.options.time.parser === 'function') {
        return me.options.time.parser(label);
      }
      // Date objects
      if (typeof label.getMonth === 'function' || typeof label === 'number') {
        return moment(label);
      }
      // Moment support
      if (label.isValid && label.isValid()) {
        return label;
      }
      // Custom parsing (return an instance of moment)
      if (typeof me.options.time.format !== 'string' && me.options.time.format.call) {
        console.warn('options.time.format is deprecated and replaced by options.time.parser. See http://nnnick.github.io/Chart.js/docs-v2/#scales-time-scale');
        return me.options.time.format(label);
      }
      // Moment format parsing
      return moment(label, me.options.time.format);
    }
  });
  Chart.scaleService.registerScaleType('time', TimeScale, defaultConfig);

};

},{"1":1}]},{},[7])(7)
});
/**
* @version: 2.1.25
* @author: Dan Grossman http://www.dangrossman.info/
* @copyright: Copyright (c) 2012-2017 Dan Grossman. All rights reserved.
* @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
* @website: http://www.daterangepicker.com/
*/
// Follow the UMD template https://github.com/umdjs/umd/blob/master/templates/returnExportsGlobal.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Make globaly available as well
        define(['moment', 'jquery'], function (moment, jquery) {
            return (root.daterangepicker = factory(moment, jquery));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node / Browserify
        //isomorphic issue
        var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;
        if (!jQuery) {
            jQuery = require('jquery');
            if (!jQuery.fn) jQuery.fn = {};
        }
        var moment = (typeof window != 'undefined' && typeof window.moment != 'undefined') ? window.moment : require('moment');
        module.exports = factory(moment, jQuery);
    } else {
        // Browser globals
        root.daterangepicker = factory(root.moment, root.jQuery);
    }
}(this, function(moment, $) {
    var DateRangePicker = function(element, options, cb) {

        //default settings for options
        this.parentEl = 'body';
        this.element = $(element);
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.dateLimit = false;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.showCustomRangeLabel = true;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.linkedCalendars = true;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.ranges = {};

        this.opens = 'right';
        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        this.drops = 'down';
        if (this.element.hasClass('dropup'))
            this.drops = 'up';

        this.buttonClasses = 'btn btn-sm';
        this.applyClass = 'btn-success';
        this.cancelClass = 'btn-default';

        this.locale = {
            direction: 'ltr',
            format: moment.localeData().longDateFormat('L'),
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: moment.weekdaysMin(),
            monthNames: moment.monthsShort(),
            firstDay: moment.localeData().firstDayOfWeek()
        };

        this.callback = function() { };

        //some state information
        this.isShowing = false;
        this.leftCalendar = {};
        this.rightCalendar = {};

        //custom options from user
        if (typeof options !== 'object' || options === null)
            options = {};

        //allow setting options with data attributes
        //data-api options will be overwritten with custom javascript options
        options = $.extend(this.element.data(), options);

        //html template for the picker UI
        if (typeof options.template !== 'string' && !(options.template instanceof $))
            options.template = '<div class="daterangepicker dropdown-menu">' +
                '<div class="calendar left">' +
                    '<div class="daterangepicker_input">' +
                      '<input class="input-mini form-control" type="text" name="daterangepicker_start" value="" />' +
                      '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
                      '<div class="calendar-time">' +
                        '<div></div>' +
                        '<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
                      '</div>' +
                    '</div>' +
                    '<div class="calendar-table"></div>' +
                '</div>' +
                '<div class="calendar right">' +
                    '<div class="daterangepicker_input">' +
                      '<input class="input-mini form-control" type="text" name="daterangepicker_end" value="" />' +
                      '<i class="fa fa-calendar glyphicon glyphicon-calendar"></i>' +
                      '<div class="calendar-time">' +
                        '<div></div>' +
                        '<i class="fa fa-clock-o glyphicon glyphicon-time"></i>' +
                      '</div>' +
                    '</div>' +
                    '<div class="calendar-table"></div>' +
                '</div>' +
                '<div class="ranges">' +
                    '<div class="range_inputs">' +
                        '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
                        '<button class="cancelBtn" type="button"></button>' +
                    '</div>' +
                '</div>' +
            '</div>';

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(options.template).appendTo(this.parentEl);

        //
        // handle all the possible options overriding defaults
        //

        if (typeof options.locale === 'object') {

            if (typeof options.locale.direction === 'string')
                this.locale.direction = options.locale.direction;

            if (typeof options.locale.format === 'string')
                this.locale.format = options.locale.format;

            if (typeof options.locale.separator === 'string')
                this.locale.separator = options.locale.separator;

            if (typeof options.locale.daysOfWeek === 'object')
                this.locale.daysOfWeek = options.locale.daysOfWeek.slice();

            if (typeof options.locale.monthNames === 'object')
              this.locale.monthNames = options.locale.monthNames.slice();

            if (typeof options.locale.firstDay === 'number')
              this.locale.firstDay = options.locale.firstDay;

            if (typeof options.locale.applyLabel === 'string')
              this.locale.applyLabel = options.locale.applyLabel;

            if (typeof options.locale.cancelLabel === 'string')
              this.locale.cancelLabel = options.locale.cancelLabel;

            if (typeof options.locale.weekLabel === 'string')
              this.locale.weekLabel = options.locale.weekLabel;

            if (typeof options.locale.customRangeLabel === 'string'){
                //Support unicode chars in the custom range name.
                var elem = document.createElement('textarea');
                elem.innerHTML = options.locale.customRangeLabel;
                var rangeHtml = elem.value;
                this.locale.customRangeLabel = rangeHtml;
            }
        }
        this.container.addClass(this.locale.direction);

        if (typeof options.startDate === 'string')
            this.startDate = moment(options.startDate, this.locale.format);

        if (typeof options.endDate === 'string')
            this.endDate = moment(options.endDate, this.locale.format);

        if (typeof options.minDate === 'string')
            this.minDate = moment(options.minDate, this.locale.format);

        if (typeof options.maxDate === 'string')
            this.maxDate = moment(options.maxDate, this.locale.format);

        if (typeof options.startDate === 'object')
            this.startDate = moment(options.startDate);

        if (typeof options.endDate === 'object')
            this.endDate = moment(options.endDate);

        if (typeof options.minDate === 'object')
            this.minDate = moment(options.minDate);

        if (typeof options.maxDate === 'object')
            this.maxDate = moment(options.maxDate);

        // sanity check for bad options
        if (this.minDate && this.startDate.isBefore(this.minDate))
            this.startDate = this.minDate.clone();

        // sanity check for bad options
        if (this.maxDate && this.endDate.isAfter(this.maxDate))
            this.endDate = this.maxDate.clone();

        if (typeof options.applyClass === 'string')
            this.applyClass = options.applyClass;

        if (typeof options.cancelClass === 'string')
            this.cancelClass = options.cancelClass;

        if (typeof options.dateLimit === 'object')
            this.dateLimit = options.dateLimit;

        if (typeof options.opens === 'string')
            this.opens = options.opens;

        if (typeof options.drops === 'string')
            this.drops = options.drops;

        if (typeof options.showWeekNumbers === 'boolean')
            this.showWeekNumbers = options.showWeekNumbers;

        if (typeof options.showISOWeekNumbers === 'boolean')
            this.showISOWeekNumbers = options.showISOWeekNumbers;

        if (typeof options.buttonClasses === 'string')
            this.buttonClasses = options.buttonClasses;

        if (typeof options.buttonClasses === 'object')
            this.buttonClasses = options.buttonClasses.join(' ');

        if (typeof options.showDropdowns === 'boolean')
            this.showDropdowns = options.showDropdowns;

        if (typeof options.showCustomRangeLabel === 'boolean')
            this.showCustomRangeLabel = options.showCustomRangeLabel;

        if (typeof options.singleDatePicker === 'boolean') {
            this.singleDatePicker = options.singleDatePicker;
            if (this.singleDatePicker)
                this.endDate = this.startDate.clone();
        }

        if (typeof options.timePicker === 'boolean')
            this.timePicker = options.timePicker;

        if (typeof options.timePickerSeconds === 'boolean')
            this.timePickerSeconds = options.timePickerSeconds;

        if (typeof options.timePickerIncrement === 'number')
            this.timePickerIncrement = options.timePickerIncrement;

        if (typeof options.timePicker24Hour === 'boolean')
            this.timePicker24Hour = options.timePicker24Hour;

        if (typeof options.autoApply === 'boolean')
            this.autoApply = options.autoApply;

        if (typeof options.autoUpdateInput === 'boolean')
            this.autoUpdateInput = options.autoUpdateInput;

        if (typeof options.linkedCalendars === 'boolean')
            this.linkedCalendars = options.linkedCalendars;

        if (typeof options.isInvalidDate === 'function')
            this.isInvalidDate = options.isInvalidDate;

        if (typeof options.isCustomDate === 'function')
            this.isCustomDate = options.isCustomDate;

        if (typeof options.alwaysShowCalendars === 'boolean')
            this.alwaysShowCalendars = options.alwaysShowCalendars;

        // update day names order to firstDay
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                iterator--;
            }
        }

        var start, end, range;

        //if no start/end dates set, check if an input element contains initial values
        if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
            if ($(this.element).is('input[type=text]')) {
                var val = $(this.element).val(),
                    split = val.split(this.locale.separator);

                start = end = null;

                if (split.length == 2) {
                    start = moment(split[0], this.locale.format);
                    end = moment(split[1], this.locale.format);
                } else if (this.singleDatePicker && val !== "") {
                    start = moment(val, this.locale.format);
                    end = moment(val, this.locale.format);
                }
                if (start !== null && end !== null) {
                    this.setStartDate(start);
                    this.setEndDate(end);
                }
            }
        }

        if (typeof options.ranges === 'object') {
            for (range in options.ranges) {

                if (typeof options.ranges[range][0] === 'string')
                    start = moment(options.ranges[range][0], this.locale.format);
                else
                    start = moment(options.ranges[range][0]);

                if (typeof options.ranges[range][1] === 'string')
                    end = moment(options.ranges[range][1], this.locale.format);
                else
                    end = moment(options.ranges[range][1]);

                // If the start or end date exceed those allowed by the minDate or dateLimit
                // options, shorten the range to the allowable period.
                if (this.minDate && start.isBefore(this.minDate))
                    start = this.minDate.clone();

                var maxDate = this.maxDate;
                if (this.dateLimit && maxDate && start.clone().add(this.dateLimit).isAfter(maxDate))
                    maxDate = start.clone().add(this.dateLimit);
                if (maxDate && end.isAfter(maxDate))
                    end = maxDate.clone();

                // If the end of the range is before the minimum or the start of the range is
                // after the maximum, don't display this range option at all.
                if ((this.minDate && end.isBefore(this.minDate, this.timepicker ? 'minute' : 'day')) 
                  || (maxDate && start.isAfter(maxDate, this.timepicker ? 'minute' : 'day')))
                    continue;

                //Support unicode chars in the range names.
                var elem = document.createElement('textarea');
                elem.innerHTML = range;
                var rangeHtml = elem.value;

                this.ranges[rangeHtml] = [start, end];
            }

            var list = '<ul>';
            for (range in this.ranges) {
                list += '<li data-range-key="' + range + '">' + range + '</li>';
            }
            if (this.showCustomRangeLabel) {
                list += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</li>';
            }
            list += '</ul>';
            this.container.find('.ranges').prepend(list);
        }

        if (typeof cb === 'function') {
            this.callback = cb;
        }

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.endOf('day');
            this.container.find('.calendar-time').hide();
        }

        //can't be used together for now
        if (this.timePicker && this.autoApply)
            this.autoApply = false;

        if (this.autoApply && typeof options.ranges !== 'object') {
            this.container.find('.ranges').hide();
        } else if (this.autoApply) {
            this.container.find('.applyBtn, .cancelBtn').addClass('hide');
        }

        if (this.singleDatePicker) {
            this.container.addClass('single');
            this.container.find('.calendar.left').addClass('single');
            this.container.find('.calendar.left').show();
            this.container.find('.calendar.right').hide();
            this.container.find('.daterangepicker_input input, .daterangepicker_input > i').hide();
            if (this.timePicker) {
                this.container.find('.ranges ul').hide();
            } else {
                this.container.find('.ranges').hide();
            }
        }

        if ((typeof options.ranges === 'undefined' && !this.singleDatePicker) || this.alwaysShowCalendars) {
            this.container.addClass('show-calendar');
        }

        this.container.addClass('opens' + this.opens);

        //swap the position of the predefined ranges if opens right
        if (typeof options.ranges !== 'undefined' && this.opens == 'right') {
            this.container.find('.ranges').prependTo( this.container.find('.calendar.left').parent() );
        }

        //apply CSS classes and labels to buttons
        this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
        if (this.applyClass.length)
            this.container.find('.applyBtn').addClass(this.applyClass);
        if (this.cancelClass.length)
            this.container.find('.cancelBtn').addClass(this.cancelClass);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //
        // event listeners
        //

        this.container.find('.calendar')
            .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
            .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
            .on('mousedown.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
            .on('mouseleave.daterangepicker', 'td.available', $.proxy(this.updateFormInputs, this))
            .on('change.daterangepicker', 'select.yearselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.monthselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.timeChanged, this))
            .on('click.daterangepicker', '.daterangepicker_input input', $.proxy(this.showCalendars, this))
            .on('focus.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsFocused, this))
            .on('blur.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsBlurred, this))
            .on('change.daterangepicker', '.daterangepicker_input input', $.proxy(this.formInputsChanged, this));

        this.container.find('.ranges')
            .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))
            .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))
            .on('mouseenter.daterangepicker', 'li', $.proxy(this.hoverRange, this))
            .on('mouseleave.daterangepicker', 'li', $.proxy(this.updateFormInputs, this));

        if (this.element.is('input') || this.element.is('button')) {
            this.element.on({
                'click.daterangepicker': $.proxy(this.show, this),
                'focus.daterangepicker': $.proxy(this.show, this),
                'keyup.daterangepicker': $.proxy(this.elementChanged, this),
                'keydown.daterangepicker': $.proxy(this.keydown, this)
            });
        } else {
            this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
        }

        //
        // if attached to a text input, set the initial value
        //

        if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
            this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
            this.element.trigger('change');
        } else if (this.element.is('input') && this.autoUpdateInput) {
            this.element.val(this.startDate.format(this.locale.format));
            this.element.trigger('change');
        }

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setStartDate: function(startDate) {
            if (typeof startDate === 'string')
                this.startDate = moment(startDate, this.locale.format);

            if (typeof startDate === 'object')
                this.startDate = moment(startDate);

            if (!this.timePicker)
                this.startDate = this.startDate.startOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.minDate && this.startDate.isBefore(this.minDate)) {
                this.startDate = this.minDate.clone();
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
                this.startDate = this.maxDate.clone();
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        },

        setEndDate: function(endDate) {
            if (typeof endDate === 'string')
                this.endDate = moment(endDate, this.locale.format);

            if (typeof endDate === 'object')
                this.endDate = moment(endDate);

            if (!this.timePicker)
                this.endDate = this.endDate.endOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.endDate.isBefore(this.startDate))
                this.endDate = this.startDate.clone();

            if (this.maxDate && this.endDate.isAfter(this.maxDate))
                this.endDate = this.maxDate.clone();

            if (this.dateLimit && this.startDate.clone().add(this.dateLimit).isBefore(this.endDate))
                this.endDate = this.startDate.clone().add(this.dateLimit);

            this.previousRightTime = this.endDate.clone();

            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        },

        isInvalidDate: function() {
            return false;
        },

        isCustomDate: function() {
            return false;
        },

        updateView: function() {
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
                if (!this.endDate) {
                    this.container.find('.right .calendar-time select').attr('disabled', 'disabled').addClass('disabled');
                } else {
                    this.container.find('.right .calendar-time select').removeAttr('disabled').removeClass('disabled');
                }
            }
            if (this.endDate) {
                this.container.find('input[name="daterangepicker_end"]').removeClass('active');
                this.container.find('input[name="daterangepicker_start"]').addClass('active');
            } else {
                this.container.find('input[name="daterangepicker_end"]').addClass('active');
                this.container.find('input[name="daterangepicker_start"]').removeClass('active');
            }
            this.updateMonthsInView();
            this.updateCalendars();
            this.updateFormInputs();
        },

        updateMonthsInView: function() {
            if (this.endDate) {

                //if both dates are visible already, do nothing
                if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                    (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.startDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    &&
                    (this.endDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    ) {
                    return;
                }

                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                } else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }

            } else {
                if (this.leftCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM') && this.rightCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM')) {
                    this.leftCalendar.month = this.startDate.clone().date(2);
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
            if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
              this.rightCalendar.month = this.maxDate.clone().date(2);
              this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
            }
        },

        updateCalendars: function() {

            if (this.timePicker) {
                var hour, minute, second;
                if (this.endDate) {
                    hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                } else {
                    hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                }
                this.leftCalendar.month.hour(hour).minute(minute).second(second);
                this.rightCalendar.month.hour(hour).minute(minute).second(second);
            }

            this.renderCalendar('left');
            this.renderCalendar('right');

            //highlight any predefined range matching the current start and end dates
            this.container.find('.ranges li').removeClass('active');
            if (this.endDate == null) return;

            this.calculateChosenLabel();
        },

        renderCalendar: function(side) {

            //
            // Build the matrix of dates that will populate the calendar
            //

            var calendar = side == 'left' ? this.leftCalendar : this.rightCalendar;
            var month = calendar.month.month();
            var year = calendar.month.year();
            var hour = calendar.month.hour();
            var minute = calendar.month.minute();
            var second = calendar.month.second();
            var daysInMonth = moment([year, month]).daysInMonth();
            var firstDay = moment([year, month, 1]);
            var lastDay = moment([year, month, daysInMonth]);
            var lastMonth = moment(firstDay).subtract(1, 'month').month();
            var lastYear = moment(firstDay).subtract(1, 'month').year();
            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

            var col, row;
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
                curDate.hour(12);

                if (this.minDate && calendar[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
                    calendar[row][col] = this.minDate.clone();
                }

                if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
                    calendar[row][col] = this.maxDate.clone();
                }

            }

            //make the calendar object available to hoverDate/clickDate
            if (side == 'left') {
                this.leftCalendar.calendar = calendar;
            } else {
                this.rightCalendar.calendar = calendar;
            }

            //
            // Display the calendar
            //

            var minDate = side == 'left' ? this.minDate : this.startDate;
            var maxDate = this.maxDate;
            var selected = side == 'left' ? this.startDate : this.endDate;
            var arrow = this.locale.direction == 'ltr' ? {left: 'chevron-left', right: 'chevron-right'} : {left: 'chevron-right', right: 'chevron-left'};

            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th></th>';

            if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!this.linkedCalendars || side == 'left')) {
                html += '<th class="prev available"><i class="fa fa-' + arrow.left + ' glyphicon glyphicon-' + arrow.left + '"></i></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                var currentMonth = calendar[1][1].month();
                var currentYear = calendar[1][1].year();
                var maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
                var minYear = (minDate && minDate.year()) || (currentYear - 50);
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;

                var monthHtml = '<select class="monthselect">';
                for (var m = 0; m < 12; m++) {
                    if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + this.locale.monthNames[m] + "</option>";
                    } else {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + this.locale.monthNames[m] + "</option>";
                    }
                }
                monthHtml += "</select>";

                var yearHtml = '<select class="yearselect">';
                for (var y = minYear; y <= maxYear; y++) {
                    yearHtml += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearHtml += '</select>';

                dateHtml = monthHtml + yearHtml;
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (!this.linkedCalendars || side == 'right' || this.singleDatePicker)) {
                html += '<th class="next available"><i class="fa fa-' + arrow.right + ' glyphicon glyphicon-' + arrow.right + '"></i></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            //adjust maxDate to reflect the dateLimit setting in order to
            //grey out end dates beyond the dateLimit
            if (this.endDate == null && this.dateLimit) {
                var maxLimit = this.startDate.clone().add(this.dateLimit).endOf('day');
                if (!maxDate || maxLimit.isBefore(maxDate)) {
                    maxDate = maxLimit;
                }
            }

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';
                else if (this.showISOWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].isoWeek() + '</td>';

                for (var col = 0; col < 7; col++) {

                    var classes = [];

                    //highlight today's date
                    if (calendar[row][col].isSame(new Date(), "day"))
                        classes.push('today');

                    //highlight weekends
                    if (calendar[row][col].isoWeekday() > 5)
                        classes.push('weekend');

                    //grey out the dates in other months displayed at beginning and end of this calendar
                    if (calendar[row][col].month() != calendar[1][1].month())
                        classes.push('off');

                    //don't allow selection of dates before the minimum date
                    if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day'))
                        classes.push('off', 'disabled');

                    //don't allow selection of dates after the maximum date
                    if (maxDate && calendar[row][col].isAfter(maxDate, 'day'))
                        classes.push('off', 'disabled');

                    //don't allow selection of date if a custom function decides it's invalid
                    if (this.isInvalidDate(calendar[row][col]))
                        classes.push('off', 'disabled');

                    //highlight the currently selected start date
                    if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD'))
                        classes.push('active', 'start-date');

                    //highlight the currently selected end date
                    if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD'))
                        classes.push('active', 'end-date');

                    //highlight dates in-between the selected dates
                    if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate)
                        classes.push('in-range');

                    //apply custom classes for this date
                    var isCustom = this.isCustomDate(calendar[row][col]);
                    if (isCustom !== false) {
                        if (typeof isCustom === 'string')
                            classes.push(isCustom);
                        else
                            Array.prototype.push.apply(classes, isCustom);
                    }

                    var cname = '', disabled = false;
                    for (var i = 0; i < classes.length; i++) {
                        cname += classes[i] + ' ';
                        if (classes[i] == 'disabled')
                            disabled = true;
                    }
                    if (!disabled)
                        cname += 'available';

                    html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            this.container.find('.calendar.' + side + ' .calendar-table').html(html);

        },

        renderTimePicker: function(side) {

            // Don't bother updating the time picker if it's currently disabled
            // because an end date hasn't been clicked yet
            if (side == 'right' && !this.endDate) return;

            var html, selected, minDate, maxDate = this.maxDate;

            if (this.dateLimit && (!this.maxDate || this.startDate.clone().add(this.dateLimit).isAfter(this.maxDate)))
                maxDate = this.startDate.clone().add(this.dateLimit);

            if (side == 'left') {
                selected = this.startDate.clone();
                minDate = this.minDate;
            } else if (side == 'right') {
                selected = this.endDate.clone();
                minDate = this.startDate;

                //Preserve the time already selected
                var timeSelector = this.container.find('.calendar.right .calendar-time div');
                if (timeSelector.html() != '') {

                    selected.hour(timeSelector.find('.hourselect option:selected').val() || selected.hour());
                    selected.minute(timeSelector.find('.minuteselect option:selected').val() || selected.minute());
                    selected.second(timeSelector.find('.secondselect option:selected').val() || selected.second());

                    if (!this.timePicker24Hour) {
                        var ampm = timeSelector.find('.ampmselect option:selected').val();
                        if (ampm === 'PM' && selected.hour() < 12)
                            selected.hour(selected.hour() + 12);
                        if (ampm === 'AM' && selected.hour() === 12)
                            selected.hour(0);
                    }

                }

                if (selected.isBefore(this.startDate))
                    selected = this.startDate.clone();

                if (maxDate && selected.isAfter(maxDate))
                    selected = maxDate.clone();

            }

            //
            // hours
            //

            html = '<select class="hourselect">';

            var start = this.timePicker24Hour ? 0 : 1;
            var end = this.timePicker24Hour ? 23 : 12;

            for (var i = start; i <= end; i++) {
                var i_in_24 = i;
                if (!this.timePicker24Hour)
                    i_in_24 = selected.hour() >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i);

                var time = selected.clone().hour(i_in_24);
                var disabled = false;
                if (minDate && time.minute(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.minute(0).isAfter(maxDate))
                    disabled = true;

                if (i_in_24 == selected.hour() && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                } else {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
            }

            html += '</select> ';

            //
            // minutes
            //

            html += ': <select class="minuteselect">';

            for (var i = 0; i < 60; i += this.timePickerIncrement) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().minute(i);

                var disabled = false;
                if (minDate && time.second(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.second(0).isAfter(maxDate))
                    disabled = true;

                if (selected.minute() == i && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                } else {
                    html += '<option value="' + i + '">' + padded + '</option>';
                }
            }

            html += '</select> ';

            //
            // seconds
            //

            if (this.timePickerSeconds) {
                html += ': <select class="secondselect">';

                for (var i = 0; i < 60; i++) {
                    var padded = i < 10 ? '0' + i : i;
                    var time = selected.clone().second(i);

                    var disabled = false;
                    if (minDate && time.isBefore(minDate))
                        disabled = true;
                    if (maxDate && time.isAfter(maxDate))
                        disabled = true;

                    if (selected.second() == i && !disabled) {
                        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                    } else if (disabled) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + padded + '</option>';
                    }
                }

                html += '</select> ';
            }

            //
            // AM/PM
            //

            if (!this.timePicker24Hour) {
                html += '<select class="ampmselect">';

                var am_html = '';
                var pm_html = '';

                if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate))
                    am_html = ' disabled="disabled" class="disabled"';

                if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate))
                    pm_html = ' disabled="disabled" class="disabled"';

                if (selected.hour() >= 12) {
                    html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                } else {
                    html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                }

                html += '</select>';
            }

            this.container.find('.calendar.' + side + ' .calendar-time div').html(html);

        },

        updateFormInputs: function() {

            //ignore mouse movements while an above-calendar text input has focus
            if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
                return;

            this.container.find('input[name=daterangepicker_start]').val(this.startDate.format(this.locale.format));
            if (this.endDate)
                this.container.find('input[name=daterangepicker_end]').val(this.endDate.format(this.locale.format));

            if (this.singleDatePicker || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }

        },

        move: function() {
            var parentOffset = { top: 0, left: 0 },
                containerTop;
            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }

            if (this.drops == 'up')
                containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
            else
                containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
            this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('dropup');

            if (this.opens == 'left') {
                this.container.css({
                    top: containerTop,
                    right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else if (this.opens == 'center') {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                            - this.container.outerWidth() / 2,
                    right: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function(e) {
            if (this.isShowing) return;

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);

            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown.daterangepicker', this._outsideClickProxy)
              // also support mobile devices
              .on('touchend.daterangepicker', this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin.daterangepicker', this._outsideClickProxy);

            // Reposition the picker if the window is resized while it's open
            $(window).on('resize.daterangepicker', $.proxy(function(e) { this.move(e); }, this));

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.previousRightTime = this.endDate.clone();

            this.updateView();
            this.container.show();
            this.move();
            this.element.trigger('show.daterangepicker', this);
            this.isShowing = true;
        },

        hide: function(e) {
            if (!this.isShowing) return;

            //incomplete date selection, revert to last values
            if (!this.endDate) {
                this.startDate = this.oldStartDate.clone();
                this.endDate = this.oldEndDate.clone();
            }

            //if a new date range was selected, invoke the user callback function
            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.callback(this.startDate, this.endDate, this.chosenLabel);

            //if picker is attached to a text input, update it
            this.updateElement();

            $(document).off('.daterangepicker');
            $(window).off('.daterangepicker');
            this.container.hide();
            this.element.trigger('hide.daterangepicker', this);
            this.isShowing = false;
        },

        toggle: function(e) {
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        },

        outsideClick: function(e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type == "focusin" ||
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-table').length
                ) return;
            this.hide();
            this.element.trigger('outsideClick.daterangepicker', this);
        },

        showCalendars: function() {
            this.container.addClass('show-calendar');
            this.move();
            this.element.trigger('showCalendar.daterangepicker', this);
        },

        hideCalendars: function() {
            this.container.removeClass('show-calendar');
            this.element.trigger('hideCalendar.daterangepicker', this);
        },

        hoverRange: function(e) {

            //ignore mouse movements while an above-calendar text input has focus
            if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
                return;

            var label = e.target.getAttribute('data-range-key');

            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find('input[name=daterangepicker_start]').val(dates[0].format(this.locale.format));
                this.container.find('input[name=daterangepicker_end]').val(dates[1].format(this.locale.format));
            }

        },

        clickRange: function(e) {
            var label = e.target.getAttribute('data-range-key');
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                if (!this.alwaysShowCalendars)
                    this.hideCalendars();
                this.clickApply();
            }
        },

        clickPrev: function(e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract(1, 'month');
                if (this.linkedCalendars)
                    this.rightCalendar.month.subtract(1, 'month');
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        clickNext: function(e) {
            var cal = $(e.target).parents('.calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
                if (this.linkedCalendars)
                    this.leftCalendar.month.add(1, 'month');
            }
            this.updateCalendars();
        },

        hoverDate: function(e) {

            //ignore mouse movements while an above-calendar text input has focus
            //if (this.container.find('input[name=daterangepicker_start]').is(":focus") || this.container.find('input[name=daterangepicker_end]').is(":focus"))
            //    return;

            //ignore dates that can't be selected
            if (!$(e.target).hasClass('available')) return;

            //have the text inputs above calendars reflect the date being hovered over
            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            if (this.endDate && !this.container.find('input[name=daterangepicker_start]').is(":focus")) {
                this.container.find('input[name=daterangepicker_start]').val(date.format(this.locale.format));
            } else if (!this.endDate && !this.container.find('input[name=daterangepicker_end]').is(":focus")) {
                this.container.find('input[name=daterangepicker_end]').val(date.format(this.locale.format));
            }

            //highlight the dates between the start date and the date being hovered as a potential end date
            var leftCalendar = this.leftCalendar;
            var rightCalendar = this.rightCalendar;
            var startDate = this.startDate;
            if (!this.endDate) {
                this.container.find('.calendar tbody td').each(function(index, el) {

                    //skip week numbers, only look at dates
                    if ($(el).hasClass('week')) return;

                    var title = $(el).attr('data-title');
                    var row = title.substr(1, 1);
                    var col = title.substr(3, 1);
                    var cal = $(el).parents('.calendar');
                    var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

                    if ((dt.isAfter(startDate) && dt.isBefore(date)) || dt.isSame(date, 'day')) {
                        $(el).addClass('in-range');
                    } else {
                        $(el).removeClass('in-range');
                    }

                });
            }

        },

        clickDate: function(e) {

            if (!$(e.target).hasClass('available')) return;

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            //
            // this function needs to do a few things:
            // * alternate between selecting a start and end date for the range,
            // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
            // * if autoapply is enabled, and an end date was chosen, apply the selection
            // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
            // * if one of the inputs above the calendars was focused, cancel that manual input
            //

            if (this.endDate || date.isBefore(this.startDate, 'day')) { //picking start
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.endDate = null;
                this.setStartDate(date.clone());
            } else if (!this.endDate && date.isBefore(this.startDate)) {
                //special case: clicking the same date for start/end,
                //but the time of the end date is before the start date
                this.setEndDate(this.startDate.clone());
            } else { // picking end
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.setEndDate(date.clone());
                if (this.autoApply) {
                  this.calculateChosenLabel();
                  this.clickApply();
                }
            }

            if (this.singleDatePicker) {
                this.setEndDate(this.startDate);
                if (!this.timePicker)
                    this.clickApply();
            }

            this.updateView();

            //This is to cancel the blur event handler if the mouse was in one of the inputs
            e.stopPropagation();

        },

        calculateChosenLabel: function () {
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
                        break;
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').html();
                        break;
                    }
                }
                i++;
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenLabel = this.container.find('.ranges li:last').addClass('active').html();
                } else {
                    this.chosenLabel = null;
                }
                this.showCalendars();
            }
        },

        clickApply: function(e) {
            this.hide();
            this.element.trigger('apply.daterangepicker', this);
        },

        clickCancel: function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.hide();
            this.element.trigger('cancel.daterangepicker', this);
        },

        monthOrYearChanged: function(e) {
            var isLeft = $(e.target).closest('.calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.calendar.'+leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (!isLeft) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            } else {
                this.rightCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
            this.updateCalendars();
        },

        timeChanged: function(e) {

            var cal = $(e.target).closest('.calendar'),
                isLeft = cal.hasClass('left');

            var hour = parseInt(cal.find('.hourselect').val(), 10);
            var minute = parseInt(cal.find('.minuteselect').val(), 10);
            var second = this.timePickerSeconds ? parseInt(cal.find('.secondselect').val(), 10) : 0;

            if (!this.timePicker24Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm === 'PM' && hour < 12)
                    hour += 12;
                if (ampm === 'AM' && hour === 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                start.second(second);
                this.setStartDate(start);
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                } else if (this.endDate && this.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                    this.setEndDate(start.clone());
                }
            } else if (this.endDate) {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                end.second(second);
                this.setEndDate(end);
            }

            //update the calendars so all clickable dates reflect the new time component
            this.updateCalendars();

            //update the form inputs above the calendars with the new time
            this.updateFormInputs();

            //re-render the time pickers because changing one selection can affect what's enabled in another
            this.renderTimePicker('left');
            this.renderTimePicker('right');

        },

        formInputsChanged: function(e) {
            var isRight = $(e.target).closest('.calendar').hasClass('right');
            var start = moment(this.container.find('input[name="daterangepicker_start"]').val(), this.locale.format);
            var end = moment(this.container.find('input[name="daterangepicker_end"]').val(), this.locale.format);

            if (start.isValid() && end.isValid()) {

                if (isRight && end.isBefore(start))
                    start = end.clone();

                this.setStartDate(start);
                this.setEndDate(end);

                if (isRight) {
                    this.container.find('input[name="daterangepicker_start"]').val(this.startDate.format(this.locale.format));
                } else {
                    this.container.find('input[name="daterangepicker_end"]').val(this.endDate.format(this.locale.format));
                }

            }

            this.updateView();
        },

        formInputsFocused: function(e) {

            // Highlight the focused input
            this.container.find('input[name="daterangepicker_start"], input[name="daterangepicker_end"]').removeClass('active');
            $(e.target).addClass('active');

            // Set the state such that if the user goes back to using a mouse, 
            // the calendars are aware we're selecting the end of the range, not
            // the start. This allows someone to edit the end of a date range without
            // re-selecting the beginning, by clicking on the end date input then
            // using the calendar.
            var isRight = $(e.target).closest('.calendar').hasClass('right');
            if (isRight) {
                this.endDate = null;
                this.setStartDate(this.startDate.clone());
                this.updateView();
            }

        },

        formInputsBlurred: function(e) {

            // this function has one purpose right now: if you tab from the first
            // text input to the second in the UI, the endDate is nulled so that
            // you can click another, but if you tab out without clicking anything
            // or changing the input value, the old endDate should be retained

            if (!this.endDate) {
                var val = this.container.find('input[name="daterangepicker_end"]').val();
                var end = moment(val, this.locale.format);
                if (end.isValid()) {
                    this.setEndDate(end);
                    this.updateView();
                }
            }

        },

        elementChanged: function() {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;
            if (this.element.val().length < this.locale.format.length) return;

            var dateString = this.element.val().split(this.locale.separator),
                start = null,
                end = null;

            if (dateString.length === 2) {
                start = moment(dateString[0], this.locale.format);
                end = moment(dateString[1], this.locale.format);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.val(), this.locale.format);
                end = start;
            }

            if (!start.isValid() || !end.isValid()) return;

            this.setStartDate(start);
            this.setEndDate(end);
            this.updateView();
        },

        keydown: function(e) {
            //hide on tab or enter
            if ((e.keyCode === 9) || (e.keyCode === 13)) {
                this.hide();
            }
        },

        updateElement: function() {
            if (this.element.is('input') && !this.singleDatePicker && this.autoUpdateInput) {
                this.element.val(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
                this.element.trigger('change');
            } else if (this.element.is('input') && this.autoUpdateInput) {
                this.element.val(this.startDate.format(this.locale.format));
                this.element.trigger('change');
            }
        },

        remove: function() {
            this.container.remove();
            this.element.off('.daterangepicker');
            this.element.removeData();
        }

    };

    $.fn.daterangepicker = function(options, callback) {
        this.each(function() {
            var el = $(this);
            if (el.data('daterangepicker'))
                el.data('daterangepicker').remove();
            el.data('daterangepicker', new DateRangePicker(el, options, callback));
        });
        return this;
    };

    return DateRangePicker;

}));

(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if (c.dateFormat == "pt") {s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3/$2/$1");} else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);
/*!
 * Select2 4.0.3
 * https://select2.github.io
 *
 * Released under the MIT license
 * https://github.com/select2/select2/blob/master/LICENSE.md
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function (jQuery) {
  // This is needed so we can catch the AMD loader configuration and use it
  // The inner file should be wrapped (by `banner.start.js`) in a function that
  // returns the AMD loader references.
  var S2 =
(function () {
  // Restore the Select2 AMD loader so it can be used
  // Needed mostly in the language files, where the loader is not inserted
  if (jQuery && jQuery.fn && jQuery.fn.select2 && jQuery.fn.select2.amd) {
    var S2 = jQuery.fn.select2.amd;
  }
var S2;(function () { if (!S2 || !S2.requirejs) {
if (!S2) { S2 = {}; } else { require = S2; }
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

S2.requirejs = requirejs;S2.require = require;S2.define = define;
}
}());
S2.define("almond", function(){});

/* global jQuery:false, $:false */
S2.define('jquery',[],function () {
  var _$ = jQuery || $;

  if (_$ == null && console && console.error) {
    console.error(
      'Select2: An instance of jQuery or a jQuery-compatible library was not ' +
      'found. Make sure that you are including jQuery before Select2 on your ' +
      'web page.'
    );
  }

  return _$;
});

S2.define('select2/utils',[
  'jquery'
], function ($) {
  var Utils = {};

  Utils.Extend = function (ChildClass, SuperClass) {
    var __hasProp = {}.hasOwnProperty;

    function BaseConstructor () {
      this.constructor = ChildClass;
    }

    for (var key in SuperClass) {
      if (__hasProp.call(SuperClass, key)) {
        ChildClass[key] = SuperClass[key];
      }
    }

    BaseConstructor.prototype = SuperClass.prototype;
    ChildClass.prototype = new BaseConstructor();
    ChildClass.__super__ = SuperClass.prototype;

    return ChildClass;
  };

  function getMethods (theClass) {
    var proto = theClass.prototype;

    var methods = [];

    for (var methodName in proto) {
      var m = proto[methodName];

      if (typeof m !== 'function') {
        continue;
      }

      if (methodName === 'constructor') {
        continue;
      }

      methods.push(methodName);
    }

    return methods;
  }

  Utils.Decorate = function (SuperClass, DecoratorClass) {
    var decoratedMethods = getMethods(DecoratorClass);
    var superMethods = getMethods(SuperClass);

    function DecoratedClass () {
      var unshift = Array.prototype.unshift;

      var argCount = DecoratorClass.prototype.constructor.length;

      var calledConstructor = SuperClass.prototype.constructor;

      if (argCount > 0) {
        unshift.call(arguments, SuperClass.prototype.constructor);

        calledConstructor = DecoratorClass.prototype.constructor;
      }

      calledConstructor.apply(this, arguments);
    }

    DecoratorClass.displayName = SuperClass.displayName;

    function ctr () {
      this.constructor = DecoratedClass;
    }

    DecoratedClass.prototype = new ctr();

    for (var m = 0; m < superMethods.length; m++) {
        var superMethod = superMethods[m];

        DecoratedClass.prototype[superMethod] =
          SuperClass.prototype[superMethod];
    }

    var calledMethod = function (methodName) {
      // Stub out the original method if it's not decorating an actual method
      var originalMethod = function () {};

      if (methodName in DecoratedClass.prototype) {
        originalMethod = DecoratedClass.prototype[methodName];
      }

      var decoratedMethod = DecoratorClass.prototype[methodName];

      return function () {
        var unshift = Array.prototype.unshift;

        unshift.call(arguments, originalMethod);

        return decoratedMethod.apply(this, arguments);
      };
    };

    for (var d = 0; d < decoratedMethods.length; d++) {
      var decoratedMethod = decoratedMethods[d];

      DecoratedClass.prototype[decoratedMethod] = calledMethod(decoratedMethod);
    }

    return DecoratedClass;
  };

  var Observable = function () {
    this.listeners = {};
  };

  Observable.prototype.on = function (event, callback) {
    this.listeners = this.listeners || {};

    if (event in this.listeners) {
      this.listeners[event].push(callback);
    } else {
      this.listeners[event] = [callback];
    }
  };

  Observable.prototype.trigger = function (event) {
    var slice = Array.prototype.slice;
    var params = slice.call(arguments, 1);

    this.listeners = this.listeners || {};

    // Params should always come in as an array
    if (params == null) {
      params = [];
    }

    // If there are no arguments to the event, use a temporary object
    if (params.length === 0) {
      params.push({});
    }

    // Set the `_type` of the first object to the event
    params[0]._type = event;

    if (event in this.listeners) {
      this.invoke(this.listeners[event], slice.call(arguments, 1));
    }

    if ('*' in this.listeners) {
      this.invoke(this.listeners['*'], arguments);
    }
  };

  Observable.prototype.invoke = function (listeners, params) {
    for (var i = 0, len = listeners.length; i < len; i++) {
      listeners[i].apply(this, params);
    }
  };

  Utils.Observable = Observable;

  Utils.generateChars = function (length) {
    var chars = '';

    for (var i = 0; i < length; i++) {
      var randomChar = Math.floor(Math.random() * 36);
      chars += randomChar.toString(36);
    }

    return chars;
  };

  Utils.bind = function (func, context) {
    return function () {
      func.apply(context, arguments);
    };
  };

  Utils._convertData = function (data) {
    for (var originalKey in data) {
      var keys = originalKey.split('-');

      var dataLevel = data;

      if (keys.length === 1) {
        continue;
      }

      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];

        // Lowercase the first letter
        // By default, dash-separated becomes camelCase
        key = key.substring(0, 1).toLowerCase() + key.substring(1);

        if (!(key in dataLevel)) {
          dataLevel[key] = {};
        }

        if (k == keys.length - 1) {
          dataLevel[key] = data[originalKey];
        }

        dataLevel = dataLevel[key];
      }

      delete data[originalKey];
    }

    return data;
  };

  Utils.hasScroll = function (index, el) {
    // Adapted from the function created by @ShadowScripter
    // and adapted by @BillBarry on the Stack Exchange Code Review website.
    // The original code can be found at
    // http://codereview.stackexchange.com/q/13338
    // and was designed to be used with the Sizzle selector engine.

    var $el = $(el);
    var overflowX = el.style.overflowX;
    var overflowY = el.style.overflowY;

    //Check both x and y declarations
    if (overflowX === overflowY &&
        (overflowY === 'hidden' || overflowY === 'visible')) {
      return false;
    }

    if (overflowX === 'scroll' || overflowY === 'scroll') {
      return true;
    }

    return ($el.innerHeight() < el.scrollHeight ||
      $el.innerWidth() < el.scrollWidth);
  };

  Utils.escapeMarkup = function (markup) {
    var replaceMap = {
      '\\': '&#92;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;',
      '/': '&#47;'
    };

    // Do not try to escape the markup if it's not a string
    if (typeof markup !== 'string') {
      return markup;
    }

    return String(markup).replace(/[&<>"'\/\\]/g, function (match) {
      return replaceMap[match];
    });
  };

  // Append an array of jQuery nodes to a given element.
  Utils.appendMany = function ($element, $nodes) {
    // jQuery 1.7.x does not support $.fn.append() with an array
    // Fall back to a jQuery object collection using $.fn.add()
    if ($.fn.jquery.substr(0, 3) === '1.7') {
      var $jqNodes = $();

      $.map($nodes, function (node) {
        $jqNodes = $jqNodes.add(node);
      });

      $nodes = $jqNodes;
    }

    $element.append($nodes);
  };

  return Utils;
});

S2.define('select2/results',[
  'jquery',
  './utils'
], function ($, Utils) {
  function Results ($element, options, dataAdapter) {
    this.$element = $element;
    this.data = dataAdapter;
    this.options = options;

    Results.__super__.constructor.call(this);
  }

  Utils.Extend(Results, Utils.Observable);

  Results.prototype.render = function () {
    var $results = $(
      '<ul class="select2-results__options" role="tree"></ul>'
    );

    if (this.options.get('multiple')) {
      $results.attr('aria-multiselectable', 'true');
    }

    this.$results = $results;

    return $results;
  };

  Results.prototype.clear = function () {
    this.$results.empty();
  };

  Results.prototype.displayMessage = function (params) {
    var escapeMarkup = this.options.get('escapeMarkup');

    this.clear();
    this.hideLoading();

    var $message = $(
      '<li role="treeitem" aria-live="assertive"' +
      ' class="select2-results__option"></li>'
    );

    var message = this.options.get('translations').get(params.message);

    $message.append(
      escapeMarkup(
        message(params.args)
      )
    );

    $message[0].className += ' select2-results__message';

    this.$results.append($message);
  };

  Results.prototype.hideMessages = function () {
    this.$results.find('.select2-results__message').remove();
  };

  Results.prototype.append = function (data) {
    this.hideLoading();

    var $options = [];

    if (data.results == null || data.results.length === 0) {
      if (this.$results.children().length === 0) {
        this.trigger('results:message', {
          message: 'noResults'
        });
      }

      return;
    }

    data.results = this.sort(data.results);

    for (var d = 0; d < data.results.length; d++) {
      var item = data.results[d];

      var $option = this.option(item);

      $options.push($option);
    }

    this.$results.append($options);
  };

  Results.prototype.position = function ($results, $dropdown) {
    var $resultsContainer = $dropdown.find('.select2-results');
    $resultsContainer.append($results);
  };

  Results.prototype.sort = function (data) {
    var sorter = this.options.get('sorter');

    return sorter(data);
  };

  Results.prototype.highlightFirstItem = function () {
    var $options = this.$results
      .find('.select2-results__option[aria-selected]');

    var $selected = $options.filter('[aria-selected=true]');

    // Check if there are any selected options
    if ($selected.length > 0) {
      // If there are selected options, highlight the first
      $selected.first().trigger('mouseenter');
    } else {
      // If there are no selected options, highlight the first option
      // in the dropdown
      $options.first().trigger('mouseenter');
    }

    this.ensureHighlightVisible();
  };

  Results.prototype.setClasses = function () {
    var self = this;

    this.data.current(function (selected) {
      var selectedIds = $.map(selected, function (s) {
        return s.id.toString();
      });

      var $options = self.$results
        .find('.select2-results__option[aria-selected]');

      $options.each(function () {
        var $option = $(this);

        var item = $.data(this, 'data');

        // id needs to be converted to a string when comparing
        var id = '' + item.id;

        if ((item.element != null && item.element.selected) ||
            (item.element == null && $.inArray(id, selectedIds) > -1)) {
          $option.attr('aria-selected', 'true');
        } else {
          $option.attr('aria-selected', 'false');
        }
      });

    });
  };

  Results.prototype.showLoading = function (params) {
    this.hideLoading();

    var loadingMore = this.options.get('translations').get('searching');

    var loading = {
      disabled: true,
      loading: true,
      text: loadingMore(params)
    };
    var $loading = this.option(loading);
    $loading.className += ' loading-results';

    this.$results.prepend($loading);
  };

  Results.prototype.hideLoading = function () {
    this.$results.find('.loading-results').remove();
  };

  Results.prototype.option = function (data) {
    var option = document.createElement('li');
    option.className = 'select2-results__option';

    var attrs = {
      'role': 'treeitem',
      'aria-selected': 'false'
    };

    if (data.disabled) {
      delete attrs['aria-selected'];
      attrs['aria-disabled'] = 'true';
    }

    if (data.id == null) {
      delete attrs['aria-selected'];
    }

    if (data._resultId != null) {
      option.id = data._resultId;
    }

    if (data.title) {
      option.title = data.title;
    }

    if (data.children) {
      attrs.role = 'group';
      attrs['aria-label'] = data.text;
      delete attrs['aria-selected'];
    }

    for (var attr in attrs) {
      var val = attrs[attr];

      option.setAttribute(attr, val);
    }

    if (data.children) {
      var $option = $(option);

      var label = document.createElement('strong');
      label.className = 'select2-results__group';

      var $label = $(label);
      this.template(data, label);

      var $children = [];

      for (var c = 0; c < data.children.length; c++) {
        var child = data.children[c];

        var $child = this.option(child);

        $children.push($child);
      }

      var $childrenContainer = $('<ul></ul>', {
        'class': 'select2-results__options select2-results__options--nested'
      });

      $childrenContainer.append($children);

      $option.append(label);
      $option.append($childrenContainer);
    } else {
      this.template(data, option);
    }

    $.data(option, 'data', data);

    return option;
  };

  Results.prototype.bind = function (container, $container) {
    var self = this;

    var id = container.id + '-results';

    this.$results.attr('id', id);

    container.on('results:all', function (params) {
      self.clear();
      self.append(params.data);

      if (container.isOpen()) {
        self.setClasses();
        self.highlightFirstItem();
      }
    });

    container.on('results:append', function (params) {
      self.append(params.data);

      if (container.isOpen()) {
        self.setClasses();
      }
    });

    container.on('query', function (params) {
      self.hideMessages();
      self.showLoading(params);
    });

    container.on('select', function () {
      if (!container.isOpen()) {
        return;
      }

      self.setClasses();
      self.highlightFirstItem();
    });

    container.on('unselect', function () {
      if (!container.isOpen()) {
        return;
      }

      self.setClasses();
      self.highlightFirstItem();
    });

    container.on('open', function () {
      // When the dropdown is open, aria-expended="true"
      self.$results.attr('aria-expanded', 'true');
      self.$results.attr('aria-hidden', 'false');

      self.setClasses();
      self.ensureHighlightVisible();
    });

    container.on('close', function () {
      // When the dropdown is closed, aria-expended="false"
      self.$results.attr('aria-expanded', 'false');
      self.$results.attr('aria-hidden', 'true');
      self.$results.removeAttr('aria-activedescendant');
    });

    container.on('results:toggle', function () {
      var $highlighted = self.getHighlightedResults();

      if ($highlighted.length === 0) {
        return;
      }

      $highlighted.trigger('mouseup');
    });

    container.on('results:select', function () {
      var $highlighted = self.getHighlightedResults();

      if ($highlighted.length === 0) {
        return;
      }

      var data = $highlighted.data('data');

      if ($highlighted.attr('aria-selected') == 'true') {
        self.trigger('close', {});
      } else {
        self.trigger('select', {
          data: data
        });
      }
    });

    container.on('results:previous', function () {
      var $highlighted = self.getHighlightedResults();

      var $options = self.$results.find('[aria-selected]');

      var currentIndex = $options.index($highlighted);

      // If we are already at te top, don't move further
      if (currentIndex === 0) {
        return;
      }

      var nextIndex = currentIndex - 1;

      // If none are highlighted, highlight the first
      if ($highlighted.length === 0) {
        nextIndex = 0;
      }

      var $next = $options.eq(nextIndex);

      $next.trigger('mouseenter');

      var currentOffset = self.$results.offset().top;
      var nextTop = $next.offset().top;
      var nextOffset = self.$results.scrollTop() + (nextTop - currentOffset);

      if (nextIndex === 0) {
        self.$results.scrollTop(0);
      } else if (nextTop - currentOffset < 0) {
        self.$results.scrollTop(nextOffset);
      }
    });

    container.on('results:next', function () {
      var $highlighted = self.getHighlightedResults();

      var $options = self.$results.find('[aria-selected]');

      var currentIndex = $options.index($highlighted);

      var nextIndex = currentIndex + 1;

      // If we are at the last option, stay there
      if (nextIndex >= $options.length) {
        return;
      }

      var $next = $options.eq(nextIndex);

      $next.trigger('mouseenter');

      var currentOffset = self.$results.offset().top +
        self.$results.outerHeight(false);
      var nextBottom = $next.offset().top + $next.outerHeight(false);
      var nextOffset = self.$results.scrollTop() + nextBottom - currentOffset;

      if (nextIndex === 0) {
        self.$results.scrollTop(0);
      } else if (nextBottom > currentOffset) {
        self.$results.scrollTop(nextOffset);
      }
    });

    container.on('results:focus', function (params) {
      params.element.addClass('select2-results__option--highlighted');
    });

    container.on('results:message', function (params) {
      self.displayMessage(params);
    });

    if ($.fn.mousewheel) {
      this.$results.on('mousewheel', function (e) {
        var top = self.$results.scrollTop();

        var bottom = self.$results.get(0).scrollHeight - top + e.deltaY;

        var isAtTop = e.deltaY > 0 && top - e.deltaY <= 0;
        var isAtBottom = e.deltaY < 0 && bottom <= self.$results.height();

        if (isAtTop) {
          self.$results.scrollTop(0);

          e.preventDefault();
          e.stopPropagation();
        } else if (isAtBottom) {
          self.$results.scrollTop(
            self.$results.get(0).scrollHeight - self.$results.height()
          );

          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    this.$results.on('mouseup', '.select2-results__option[aria-selected]',
      function (evt) {
      var $this = $(this);

      var data = $this.data('data');

      if ($this.attr('aria-selected') === 'true') {
        if (self.options.get('multiple')) {
          self.trigger('unselect', {
            originalEvent: evt,
            data: data
          });
        } else {
          self.trigger('close', {});
        }

        return;
      }

      self.trigger('select', {
        originalEvent: evt,
        data: data
      });
    });

    this.$results.on('mouseenter', '.select2-results__option[aria-selected]',
      function (evt) {
      var data = $(this).data('data');

      self.getHighlightedResults()
          .removeClass('select2-results__option--highlighted');

      self.trigger('results:focus', {
        data: data,
        element: $(this)
      });
    });
  };

  Results.prototype.getHighlightedResults = function () {
    var $highlighted = this.$results
    .find('.select2-results__option--highlighted');

    return $highlighted;
  };

  Results.prototype.destroy = function () {
    this.$results.remove();
  };

  Results.prototype.ensureHighlightVisible = function () {
    var $highlighted = this.getHighlightedResults();

    if ($highlighted.length === 0) {
      return;
    }

    var $options = this.$results.find('[aria-selected]');

    var currentIndex = $options.index($highlighted);

    var currentOffset = this.$results.offset().top;
    var nextTop = $highlighted.offset().top;
    var nextOffset = this.$results.scrollTop() + (nextTop - currentOffset);

    var offsetDelta = nextTop - currentOffset;
    nextOffset -= $highlighted.outerHeight(false) * 2;

    if (currentIndex <= 2) {
      this.$results.scrollTop(0);
    } else if (offsetDelta > this.$results.outerHeight() || offsetDelta < 0) {
      this.$results.scrollTop(nextOffset);
    }
  };

  Results.prototype.template = function (result, container) {
    var template = this.options.get('templateResult');
    var escapeMarkup = this.options.get('escapeMarkup');

    var content = template(result, container);

    if (content == null) {
      container.style.display = 'none';
    } else if (typeof content === 'string') {
      container.innerHTML = escapeMarkup(content);
    } else {
      $(container).append(content);
    }
  };

  return Results;
});

S2.define('select2/keys',[

], function () {
  var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46
  };

  return KEYS;
});

S2.define('select2/selection/base',[
  'jquery',
  '../utils',
  '../keys'
], function ($, Utils, KEYS) {
  function BaseSelection ($element, options) {
    this.$element = $element;
    this.options = options;

    BaseSelection.__super__.constructor.call(this);
  }

  Utils.Extend(BaseSelection, Utils.Observable);

  BaseSelection.prototype.render = function () {
    var $selection = $(
      '<span class="select2-selection" role="combobox" ' +
      ' aria-haspopup="true" aria-expanded="false">' +
      '</span>'
    );

    this._tabindex = 0;

    if (this.$element.data('old-tabindex') != null) {
      this._tabindex = this.$element.data('old-tabindex');
    } else if (this.$element.attr('tabindex') != null) {
      this._tabindex = this.$element.attr('tabindex');
    }

    $selection.attr('title', this.$element.attr('title'));
    $selection.attr('tabindex', this._tabindex);

    this.$selection = $selection;

    return $selection;
  };

  BaseSelection.prototype.bind = function (container, $container) {
    var self = this;

    var id = container.id + '-container';
    var resultsId = container.id + '-results';

    this.container = container;

    this.$selection.on('focus', function (evt) {
      self.trigger('focus', evt);
    });

    this.$selection.on('blur', function (evt) {
      self._handleBlur(evt);
    });

    this.$selection.on('keydown', function (evt) {
      self.trigger('keypress', evt);

      if (evt.which === KEYS.SPACE) {
        evt.preventDefault();
      }
    });

    container.on('results:focus', function (params) {
      self.$selection.attr('aria-activedescendant', params.data._resultId);
    });

    container.on('selection:update', function (params) {
      self.update(params.data);
    });

    container.on('open', function () {
      // When the dropdown is open, aria-expanded="true"
      self.$selection.attr('aria-expanded', 'true');
      self.$selection.attr('aria-owns', resultsId);

      self._attachCloseHandler(container);
    });

    container.on('close', function () {
      // When the dropdown is closed, aria-expanded="false"
      self.$selection.attr('aria-expanded', 'false');
      self.$selection.removeAttr('aria-activedescendant');
      self.$selection.removeAttr('aria-owns');

      self.$selection.focus();

      self._detachCloseHandler(container);
    });

    container.on('enable', function () {
      self.$selection.attr('tabindex', self._tabindex);
    });

    container.on('disable', function () {
      self.$selection.attr('tabindex', '-1');
    });
  };

  BaseSelection.prototype._handleBlur = function (evt) {
    var self = this;

    // This needs to be delayed as the active element is the body when the tab
    // key is pressed, possibly along with others.
    window.setTimeout(function () {
      // Don't trigger `blur` if the focus is still in the selection
      if (
        (document.activeElement == self.$selection[0]) ||
        ($.contains(self.$selection[0], document.activeElement))
      ) {
        return;
      }

      self.trigger('blur', evt);
    }, 1);
  };

  BaseSelection.prototype._attachCloseHandler = function (container) {
    var self = this;

    $(document.body).on('mousedown.select2.' + container.id, function (e) {
      var $target = $(e.target);

      var $select = $target.closest('.select2');

      var $all = $('.select2.select2-container--open');

      $all.each(function () {
        var $this = $(this);

        if (this == $select[0]) {
          return;
        }

        var $element = $this.data('element');

        $element.select2('close');
      });
    });
  };

  BaseSelection.prototype._detachCloseHandler = function (container) {
    $(document.body).off('mousedown.select2.' + container.id);
  };

  BaseSelection.prototype.position = function ($selection, $container) {
    var $selectionContainer = $container.find('.selection');
    $selectionContainer.append($selection);
  };

  BaseSelection.prototype.destroy = function () {
    this._detachCloseHandler(this.container);
  };

  BaseSelection.prototype.update = function (data) {
    throw new Error('The `update` method must be defined in child classes.');
  };

  return BaseSelection;
});

S2.define('select2/selection/single',[
  'jquery',
  './base',
  '../utils',
  '../keys'
], function ($, BaseSelection, Utils, KEYS) {
  function SingleSelection () {
    SingleSelection.__super__.constructor.apply(this, arguments);
  }

  Utils.Extend(SingleSelection, BaseSelection);

  SingleSelection.prototype.render = function () {
    var $selection = SingleSelection.__super__.render.call(this);

    $selection.addClass('select2-selection--single');

    $selection.html(
      '<span class="select2-selection__rendered"></span>' +
      '<span class="select2-selection__arrow" role="presentation">' +
        '<b role="presentation"></b>' +
      '</span>'
    );

    return $selection;
  };

  SingleSelection.prototype.bind = function (container, $container) {
    var self = this;

    SingleSelection.__super__.bind.apply(this, arguments);

    var id = container.id + '-container';

    this.$selection.find('.select2-selection__rendered').attr('id', id);
    this.$selection.attr('aria-labelledby', id);

    this.$selection.on('mousedown', function (evt) {
      // Only respond to left clicks
      if (evt.which !== 1) {
        return;
      }

      self.trigger('toggle', {
        originalEvent: evt
      });
    });

    this.$selection.on('focus', function (evt) {
      // User focuses on the container
    });

    this.$selection.on('blur', function (evt) {
      // User exits the container
    });

    container.on('focus', function (evt) {
      if (!container.isOpen()) {
        self.$selection.focus();
      }
    });

    container.on('selection:update', function (params) {
      self.update(params.data);
    });
  };

  SingleSelection.prototype.clear = function () {
    this.$selection.find('.select2-selection__rendered').empty();
  };

  SingleSelection.prototype.display = function (data, container) {
    var template = this.options.get('templateSelection');
    var escapeMarkup = this.options.get('escapeMarkup');

    return escapeMarkup(template(data, container));
  };

  SingleSelection.prototype.selectionContainer = function () {
    return $('<span></span>');
  };

  SingleSelection.prototype.update = function (data) {
    if (data.length === 0) {
      this.clear();
      return;
    }

    var selection = data[0];

    var $rendered = this.$selection.find('.select2-selection__rendered');
    var formatted = this.display(selection, $rendered);

    $rendered.empty().append(formatted);
    $rendered.prop('title', selection.title || selection.text);
  };

  return SingleSelection;
});

S2.define('select2/selection/multiple',[
  'jquery',
  './base',
  '../utils'
], function ($, BaseSelection, Utils) {
  function MultipleSelection ($element, options) {
    MultipleSelection.__super__.constructor.apply(this, arguments);
  }

  Utils.Extend(MultipleSelection, BaseSelection);

  MultipleSelection.prototype.render = function () {
    var $selection = MultipleSelection.__super__.render.call(this);

    $selection.addClass('select2-selection--multiple');

    $selection.html(
      '<ul class="select2-selection__rendered"></ul>'
    );

    return $selection;
  };

  MultipleSelection.prototype.bind = function (container, $container) {
    var self = this;

    MultipleSelection.__super__.bind.apply(this, arguments);

    this.$selection.on('click', function (evt) {
      self.trigger('toggle', {
        originalEvent: evt
      });
    });

    this.$selection.on(
      'click',
      '.select2-selection__choice__remove',
      function (evt) {
        // Ignore the event if it is disabled
        if (self.options.get('disabled')) {
          return;
        }

        var $remove = $(this);
        var $selection = $remove.parent();

        var data = $selection.data('data');

        self.trigger('unselect', {
          originalEvent: evt,
          data: data
        });
      }
    );
  };

  MultipleSelection.prototype.clear = function () {
    this.$selection.find('.select2-selection__rendered').empty();
  };

  MultipleSelection.prototype.display = function (data, container) {
    var template = this.options.get('templateSelection');
    var escapeMarkup = this.options.get('escapeMarkup');

    return escapeMarkup(template(data, container));
  };

  MultipleSelection.prototype.selectionContainer = function () {
    var $container = $(
      '<li class="select2-selection__choice">' +
        '<span class="select2-selection__choice__remove" role="presentation">' +
          '&times;' +
        '</span>' +
      '</li>'
    );

    return $container;
  };

  MultipleSelection.prototype.update = function (data) {
    this.clear();

    if (data.length === 0) {
      return;
    }

    var $selections = [];

    for (var d = 0; d < data.length; d++) {
      var selection = data[d];

      var $selection = this.selectionContainer();
      var formatted = this.display(selection, $selection);

      $selection.append(formatted);
      $selection.prop('title', selection.title || selection.text);

      $selection.data('data', selection);

      $selections.push($selection);
    }

    var $rendered = this.$selection.find('.select2-selection__rendered');

    Utils.appendMany($rendered, $selections);
  };

  return MultipleSelection;
});

S2.define('select2/selection/placeholder',[
  '../utils'
], function (Utils) {
  function Placeholder (decorated, $element, options) {
    this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

    decorated.call(this, $element, options);
  }

  Placeholder.prototype.normalizePlaceholder = function (_, placeholder) {
    if (typeof placeholder === 'string') {
      placeholder = {
        id: '',
        text: placeholder
      };
    }

    return placeholder;
  };

  Placeholder.prototype.createPlaceholder = function (decorated, placeholder) {
    var $placeholder = this.selectionContainer();

    $placeholder.html(this.display(placeholder));
    $placeholder.addClass('select2-selection__placeholder')
                .removeClass('select2-selection__choice');

    return $placeholder;
  };

  Placeholder.prototype.update = function (decorated, data) {
    var singlePlaceholder = (
      data.length == 1 && data[0].id != this.placeholder.id
    );
    var multipleSelections = data.length > 1;

    if (multipleSelections || singlePlaceholder) {
      return decorated.call(this, data);
    }

    this.clear();

    var $placeholder = this.createPlaceholder(this.placeholder);

    this.$selection.find('.select2-selection__rendered').append($placeholder);
  };

  return Placeholder;
});

S2.define('select2/selection/allowClear',[
  'jquery',
  '../keys'
], function ($, KEYS) {
  function AllowClear () { }

  AllowClear.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    if (this.placeholder == null) {
      if (this.options.get('debug') && window.console && console.error) {
        console.error(
          'Select2: The `allowClear` option should be used in combination ' +
          'with the `placeholder` option.'
        );
      }
    }

    this.$selection.on('mousedown', '.select2-selection__clear',
      function (evt) {
        self._handleClear(evt);
    });

    container.on('keypress', function (evt) {
      self._handleKeyboardClear(evt, container);
    });
  };

  AllowClear.prototype._handleClear = function (_, evt) {
    // Ignore the event if it is disabled
    if (this.options.get('disabled')) {
      return;
    }

    var $clear = this.$selection.find('.select2-selection__clear');

    // Ignore the event if nothing has been selected
    if ($clear.length === 0) {
      return;
    }

    evt.stopPropagation();

    var data = $clear.data('data');

    for (var d = 0; d < data.length; d++) {
      var unselectData = {
        data: data[d]
      };

      // Trigger the `unselect` event, so people can prevent it from being
      // cleared.
      this.trigger('unselect', unselectData);

      // If the event was prevented, don't clear it out.
      if (unselectData.prevented) {
        return;
      }
    }

    this.$element.val(this.placeholder.id).trigger('change');

    this.trigger('toggle', {});
  };

  AllowClear.prototype._handleKeyboardClear = function (_, evt, container) {
    if (container.isOpen()) {
      return;
    }

    if (evt.which == KEYS.DELETE || evt.which == KEYS.BACKSPACE) {
      this._handleClear(evt);
    }
  };

  AllowClear.prototype.update = function (decorated, data) {
    decorated.call(this, data);

    if (this.$selection.find('.select2-selection__placeholder').length > 0 ||
        data.length === 0) {
      return;
    }

    var $remove = $(
      '<span class="select2-selection__clear">' +
        '&times;' +
      '</span>'
    );
    $remove.data('data', data);

    this.$selection.find('.select2-selection__rendered').prepend($remove);
  };

  return AllowClear;
});

S2.define('select2/selection/search',[
  'jquery',
  '../utils',
  '../keys'
], function ($, Utils, KEYS) {
  function Search (decorated, $element, options) {
    decorated.call(this, $element, options);
  }

  Search.prototype.render = function (decorated) {
    var $search = $(
      '<li class="select2-search select2-search--inline">' +
        '<input class="select2-search__field" type="search" tabindex="-1"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="off"' +
        ' spellcheck="false" role="textbox" aria-autocomplete="list" />' +
      '</li>'
    );

    this.$searchContainer = $search;
    this.$search = $search.find('input');

    var $rendered = decorated.call(this);

    this._transferTabIndex();

    return $rendered;
  };

  Search.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('open', function () {
      self.$search.trigger('focus');
    });

    container.on('close', function () {
      self.$search.val('');
      self.$search.removeAttr('aria-activedescendant');
      self.$search.trigger('focus');
    });

    container.on('enable', function () {
      self.$search.prop('disabled', false);

      self._transferTabIndex();
    });

    container.on('disable', function () {
      self.$search.prop('disabled', true);
    });

    container.on('focus', function (evt) {
      self.$search.trigger('focus');
    });

    container.on('results:focus', function (params) {
      self.$search.attr('aria-activedescendant', params.id);
    });

    this.$selection.on('focusin', '.select2-search--inline', function (evt) {
      self.trigger('focus', evt);
    });

    this.$selection.on('focusout', '.select2-search--inline', function (evt) {
      self._handleBlur(evt);
    });

    this.$selection.on('keydown', '.select2-search--inline', function (evt) {
      evt.stopPropagation();

      self.trigger('keypress', evt);

      self._keyUpPrevented = evt.isDefaultPrevented();

      var key = evt.which;

      if (key === KEYS.BACKSPACE && self.$search.val() === '') {
        var $previousChoice = self.$searchContainer
          .prev('.select2-selection__choice');

        if ($previousChoice.length > 0) {
          var item = $previousChoice.data('data');

          self.searchRemoveChoice(item);

          evt.preventDefault();
        }
      }
    });

    // Try to detect the IE version should the `documentMode` property that
    // is stored on the document. This is only implemented in IE and is
    // slightly cleaner than doing a user agent check.
    // This property is not available in Edge, but Edge also doesn't have
    // this bug.
    var msie = document.documentMode;
    var disableInputEvents = msie && msie <= 11;

    // Workaround for browsers which do not support the `input` event
    // This will prevent double-triggering of events for browsers which support
    // both the `keyup` and `input` events.
    this.$selection.on(
      'input.searchcheck',
      '.select2-search--inline',
      function (evt) {
        // IE will trigger the `input` event when a placeholder is used on a
        // search box. To get around this issue, we are forced to ignore all
        // `input` events in IE and keep using `keyup`.
        if (disableInputEvents) {
          self.$selection.off('input.search input.searchcheck');
          return;
        }

        // Unbind the duplicated `keyup` event
        self.$selection.off('keyup.search');
      }
    );

    this.$selection.on(
      'keyup.search input.search',
      '.select2-search--inline',
      function (evt) {
        // IE will trigger the `input` event when a placeholder is used on a
        // search box. To get around this issue, we are forced to ignore all
        // `input` events in IE and keep using `keyup`.
        if (disableInputEvents && evt.type === 'input') {
          self.$selection.off('input.search input.searchcheck');
          return;
        }

        var key = evt.which;

        // We can freely ignore events from modifier keys
        if (key == KEYS.SHIFT || key == KEYS.CTRL || key == KEYS.ALT) {
          return;
        }

        // Tabbing will be handled during the `keydown` phase
        if (key == KEYS.TAB) {
          return;
        }

        self.handleSearch(evt);
      }
    );
  };

  /**
   * This method will transfer the tabindex attribute from the rendered
   * selection to the search box. This allows for the search box to be used as
   * the primary focus instead of the selection container.
   *
   * @private
   */
  Search.prototype._transferTabIndex = function (decorated) {
    this.$search.attr('tabindex', this.$selection.attr('tabindex'));
    this.$selection.attr('tabindex', '-1');
  };

  Search.prototype.createPlaceholder = function (decorated, placeholder) {
    this.$search.attr('placeholder', placeholder.text);
  };

  Search.prototype.update = function (decorated, data) {
    var searchHadFocus = this.$search[0] == document.activeElement;

    this.$search.attr('placeholder', '');

    decorated.call(this, data);

    this.$selection.find('.select2-selection__rendered')
                   .append(this.$searchContainer);

    this.resizeSearch();
    if (searchHadFocus) {
      this.$search.focus();
    }
  };

  Search.prototype.handleSearch = function () {
    this.resizeSearch();

    if (!this._keyUpPrevented) {
      var input = this.$search.val();

      this.trigger('query', {
        term: input
      });
    }

    this._keyUpPrevented = false;
  };

  Search.prototype.searchRemoveChoice = function (decorated, item) {
    this.trigger('unselect', {
      data: item
    });

    this.$search.val(item.text);
    this.handleSearch();
  };

  Search.prototype.resizeSearch = function () {
    this.$search.css('width', '25px');

    var width = '';

    if (this.$search.attr('placeholder') !== '') {
      width = this.$selection.find('.select2-selection__rendered').innerWidth();
    } else {
      var minimumWidth = this.$search.val().length + 1;

      width = (minimumWidth * 0.75) + 'em';
    }

    this.$search.css('width', width);
  };

  return Search;
});

S2.define('select2/selection/eventRelay',[
  'jquery'
], function ($) {
  function EventRelay () { }

  EventRelay.prototype.bind = function (decorated, container, $container) {
    var self = this;
    var relayEvents = [
      'open', 'opening',
      'close', 'closing',
      'select', 'selecting',
      'unselect', 'unselecting'
    ];

    var preventableEvents = ['opening', 'closing', 'selecting', 'unselecting'];

    decorated.call(this, container, $container);

    container.on('*', function (name, params) {
      // Ignore events that should not be relayed
      if ($.inArray(name, relayEvents) === -1) {
        return;
      }

      // The parameters should always be an object
      params = params || {};

      // Generate the jQuery event for the Select2 event
      var evt = $.Event('select2:' + name, {
        params: params
      });

      self.$element.trigger(evt);

      // Only handle preventable events if it was one
      if ($.inArray(name, preventableEvents) === -1) {
        return;
      }

      params.prevented = evt.isDefaultPrevented();
    });
  };

  return EventRelay;
});

S2.define('select2/translation',[
  'jquery',
  'require'
], function ($, require) {
  function Translation (dict) {
    this.dict = dict || {};
  }

  Translation.prototype.all = function () {
    return this.dict;
  };

  Translation.prototype.get = function (key) {
    return this.dict[key];
  };

  Translation.prototype.extend = function (translation) {
    this.dict = $.extend({}, translation.all(), this.dict);
  };

  // Static functions

  Translation._cache = {};

  Translation.loadPath = function (path) {
    if (!(path in Translation._cache)) {
      var translations = require(path);

      Translation._cache[path] = translations;
    }

    return new Translation(Translation._cache[path]);
  };

  return Translation;
});

S2.define('select2/diacritics',[

], function () {
  var diacritics = {
    '\u24B6': 'A',
    '\uFF21': 'A',
    '\u00C0': 'A',
    '\u00C1': 'A',
    '\u00C2': 'A',
    '\u1EA6': 'A',
    '\u1EA4': 'A',
    '\u1EAA': 'A',
    '\u1EA8': 'A',
    '\u00C3': 'A',
    '\u0100': 'A',
    '\u0102': 'A',
    '\u1EB0': 'A',
    '\u1EAE': 'A',
    '\u1EB4': 'A',
    '\u1EB2': 'A',
    '\u0226': 'A',
    '\u01E0': 'A',
    '\u00C4': 'A',
    '\u01DE': 'A',
    '\u1EA2': 'A',
    '\u00C5': 'A',
    '\u01FA': 'A',
    '\u01CD': 'A',
    '\u0200': 'A',
    '\u0202': 'A',
    '\u1EA0': 'A',
    '\u1EAC': 'A',
    '\u1EB6': 'A',
    '\u1E00': 'A',
    '\u0104': 'A',
    '\u023A': 'A',
    '\u2C6F': 'A',
    '\uA732': 'AA',
    '\u00C6': 'AE',
    '\u01FC': 'AE',
    '\u01E2': 'AE',
    '\uA734': 'AO',
    '\uA736': 'AU',
    '\uA738': 'AV',
    '\uA73A': 'AV',
    '\uA73C': 'AY',
    '\u24B7': 'B',
    '\uFF22': 'B',
    '\u1E02': 'B',
    '\u1E04': 'B',
    '\u1E06': 'B',
    '\u0243': 'B',
    '\u0182': 'B',
    '\u0181': 'B',
    '\u24B8': 'C',
    '\uFF23': 'C',
    '\u0106': 'C',
    '\u0108': 'C',
    '\u010A': 'C',
    '\u010C': 'C',
    '\u00C7': 'C',
    '\u1E08': 'C',
    '\u0187': 'C',
    '\u023B': 'C',
    '\uA73E': 'C',
    '\u24B9': 'D',
    '\uFF24': 'D',
    '\u1E0A': 'D',
    '\u010E': 'D',
    '\u1E0C': 'D',
    '\u1E10': 'D',
    '\u1E12': 'D',
    '\u1E0E': 'D',
    '\u0110': 'D',
    '\u018B': 'D',
    '\u018A': 'D',
    '\u0189': 'D',
    '\uA779': 'D',
    '\u01F1': 'DZ',
    '\u01C4': 'DZ',
    '\u01F2': 'Dz',
    '\u01C5': 'Dz',
    '\u24BA': 'E',
    '\uFF25': 'E',
    '\u00C8': 'E',
    '\u00C9': 'E',
    '\u00CA': 'E',
    '\u1EC0': 'E',
    '\u1EBE': 'E',
    '\u1EC4': 'E',
    '\u1EC2': 'E',
    '\u1EBC': 'E',
    '\u0112': 'E',
    '\u1E14': 'E',
    '\u1E16': 'E',
    '\u0114': 'E',
    '\u0116': 'E',
    '\u00CB': 'E',
    '\u1EBA': 'E',
    '\u011A': 'E',
    '\u0204': 'E',
    '\u0206': 'E',
    '\u1EB8': 'E',
    '\u1EC6': 'E',
    '\u0228': 'E',
    '\u1E1C': 'E',
    '\u0118': 'E',
    '\u1E18': 'E',
    '\u1E1A': 'E',
    '\u0190': 'E',
    '\u018E': 'E',
    '\u24BB': 'F',
    '\uFF26': 'F',
    '\u1E1E': 'F',
    '\u0191': 'F',
    '\uA77B': 'F',
    '\u24BC': 'G',
    '\uFF27': 'G',
    '\u01F4': 'G',
    '\u011C': 'G',
    '\u1E20': 'G',
    '\u011E': 'G',
    '\u0120': 'G',
    '\u01E6': 'G',
    '\u0122': 'G',
    '\u01E4': 'G',
    '\u0193': 'G',
    '\uA7A0': 'G',
    '\uA77D': 'G',
    '\uA77E': 'G',
    '\u24BD': 'H',
    '\uFF28': 'H',
    '\u0124': 'H',
    '\u1E22': 'H',
    '\u1E26': 'H',
    '\u021E': 'H',
    '\u1E24': 'H',
    '\u1E28': 'H',
    '\u1E2A': 'H',
    '\u0126': 'H',
    '\u2C67': 'H',
    '\u2C75': 'H',
    '\uA78D': 'H',
    '\u24BE': 'I',
    '\uFF29': 'I',
    '\u00CC': 'I',
    '\u00CD': 'I',
    '\u00CE': 'I',
    '\u0128': 'I',
    '\u012A': 'I',
    '\u012C': 'I',
    '\u0130': 'I',
    '\u00CF': 'I',
    '\u1E2E': 'I',
    '\u1EC8': 'I',
    '\u01CF': 'I',
    '\u0208': 'I',
    '\u020A': 'I',
    '\u1ECA': 'I',
    '\u012E': 'I',
    '\u1E2C': 'I',
    '\u0197': 'I',
    '\u24BF': 'J',
    '\uFF2A': 'J',
    '\u0134': 'J',
    '\u0248': 'J',
    '\u24C0': 'K',
    '\uFF2B': 'K',
    '\u1E30': 'K',
    '\u01E8': 'K',
    '\u1E32': 'K',
    '\u0136': 'K',
    '\u1E34': 'K',
    '\u0198': 'K',
    '\u2C69': 'K',
    '\uA740': 'K',
    '\uA742': 'K',
    '\uA744': 'K',
    '\uA7A2': 'K',
    '\u24C1': 'L',
    '\uFF2C': 'L',
    '\u013F': 'L',
    '\u0139': 'L',
    '\u013D': 'L',
    '\u1E36': 'L',
    '\u1E38': 'L',
    '\u013B': 'L',
    '\u1E3C': 'L',
    '\u1E3A': 'L',
    '\u0141': 'L',
    '\u023D': 'L',
    '\u2C62': 'L',
    '\u2C60': 'L',
    '\uA748': 'L',
    '\uA746': 'L',
    '\uA780': 'L',
    '\u01C7': 'LJ',
    '\u01C8': 'Lj',
    '\u24C2': 'M',
    '\uFF2D': 'M',
    '\u1E3E': 'M',
    '\u1E40': 'M',
    '\u1E42': 'M',
    '\u2C6E': 'M',
    '\u019C': 'M',
    '\u24C3': 'N',
    '\uFF2E': 'N',
    '\u01F8': 'N',
    '\u0143': 'N',
    '\u00D1': 'N',
    '\u1E44': 'N',
    '\u0147': 'N',
    '\u1E46': 'N',
    '\u0145': 'N',
    '\u1E4A': 'N',
    '\u1E48': 'N',
    '\u0220': 'N',
    '\u019D': 'N',
    '\uA790': 'N',
    '\uA7A4': 'N',
    '\u01CA': 'NJ',
    '\u01CB': 'Nj',
    '\u24C4': 'O',
    '\uFF2F': 'O',
    '\u00D2': 'O',
    '\u00D3': 'O',
    '\u00D4': 'O',
    '\u1ED2': 'O',
    '\u1ED0': 'O',
    '\u1ED6': 'O',
    '\u1ED4': 'O',
    '\u00D5': 'O',
    '\u1E4C': 'O',
    '\u022C': 'O',
    '\u1E4E': 'O',
    '\u014C': 'O',
    '\u1E50': 'O',
    '\u1E52': 'O',
    '\u014E': 'O',
    '\u022E': 'O',
    '\u0230': 'O',
    '\u00D6': 'O',
    '\u022A': 'O',
    '\u1ECE': 'O',
    '\u0150': 'O',
    '\u01D1': 'O',
    '\u020C': 'O',
    '\u020E': 'O',
    '\u01A0': 'O',
    '\u1EDC': 'O',
    '\u1EDA': 'O',
    '\u1EE0': 'O',
    '\u1EDE': 'O',
    '\u1EE2': 'O',
    '\u1ECC': 'O',
    '\u1ED8': 'O',
    '\u01EA': 'O',
    '\u01EC': 'O',
    '\u00D8': 'O',
    '\u01FE': 'O',
    '\u0186': 'O',
    '\u019F': 'O',
    '\uA74A': 'O',
    '\uA74C': 'O',
    '\u01A2': 'OI',
    '\uA74E': 'OO',
    '\u0222': 'OU',
    '\u24C5': 'P',
    '\uFF30': 'P',
    '\u1E54': 'P',
    '\u1E56': 'P',
    '\u01A4': 'P',
    '\u2C63': 'P',
    '\uA750': 'P',
    '\uA752': 'P',
    '\uA754': 'P',
    '\u24C6': 'Q',
    '\uFF31': 'Q',
    '\uA756': 'Q',
    '\uA758': 'Q',
    '\u024A': 'Q',
    '\u24C7': 'R',
    '\uFF32': 'R',
    '\u0154': 'R',
    '\u1E58': 'R',
    '\u0158': 'R',
    '\u0210': 'R',
    '\u0212': 'R',
    '\u1E5A': 'R',
    '\u1E5C': 'R',
    '\u0156': 'R',
    '\u1E5E': 'R',
    '\u024C': 'R',
    '\u2C64': 'R',
    '\uA75A': 'R',
    '\uA7A6': 'R',
    '\uA782': 'R',
    '\u24C8': 'S',
    '\uFF33': 'S',
    '\u1E9E': 'S',
    '\u015A': 'S',
    '\u1E64': 'S',
    '\u015C': 'S',
    '\u1E60': 'S',
    '\u0160': 'S',
    '\u1E66': 'S',
    '\u1E62': 'S',
    '\u1E68': 'S',
    '\u0218': 'S',
    '\u015E': 'S',
    '\u2C7E': 'S',
    '\uA7A8': 'S',
    '\uA784': 'S',
    '\u24C9': 'T',
    '\uFF34': 'T',
    '\u1E6A': 'T',
    '\u0164': 'T',
    '\u1E6C': 'T',
    '\u021A': 'T',
    '\u0162': 'T',
    '\u1E70': 'T',
    '\u1E6E': 'T',
    '\u0166': 'T',
    '\u01AC': 'T',
    '\u01AE': 'T',
    '\u023E': 'T',
    '\uA786': 'T',
    '\uA728': 'TZ',
    '\u24CA': 'U',
    '\uFF35': 'U',
    '\u00D9': 'U',
    '\u00DA': 'U',
    '\u00DB': 'U',
    '\u0168': 'U',
    '\u1E78': 'U',
    '\u016A': 'U',
    '\u1E7A': 'U',
    '\u016C': 'U',
    '\u00DC': 'U',
    '\u01DB': 'U',
    '\u01D7': 'U',
    '\u01D5': 'U',
    '\u01D9': 'U',
    '\u1EE6': 'U',
    '\u016E': 'U',
    '\u0170': 'U',
    '\u01D3': 'U',
    '\u0214': 'U',
    '\u0216': 'U',
    '\u01AF': 'U',
    '\u1EEA': 'U',
    '\u1EE8': 'U',
    '\u1EEE': 'U',
    '\u1EEC': 'U',
    '\u1EF0': 'U',
    '\u1EE4': 'U',
    '\u1E72': 'U',
    '\u0172': 'U',
    '\u1E76': 'U',
    '\u1E74': 'U',
    '\u0244': 'U',
    '\u24CB': 'V',
    '\uFF36': 'V',
    '\u1E7C': 'V',
    '\u1E7E': 'V',
    '\u01B2': 'V',
    '\uA75E': 'V',
    '\u0245': 'V',
    '\uA760': 'VY',
    '\u24CC': 'W',
    '\uFF37': 'W',
    '\u1E80': 'W',
    '\u1E82': 'W',
    '\u0174': 'W',
    '\u1E86': 'W',
    '\u1E84': 'W',
    '\u1E88': 'W',
    '\u2C72': 'W',
    '\u24CD': 'X',
    '\uFF38': 'X',
    '\u1E8A': 'X',
    '\u1E8C': 'X',
    '\u24CE': 'Y',
    '\uFF39': 'Y',
    '\u1EF2': 'Y',
    '\u00DD': 'Y',
    '\u0176': 'Y',
    '\u1EF8': 'Y',
    '\u0232': 'Y',
    '\u1E8E': 'Y',
    '\u0178': 'Y',
    '\u1EF6': 'Y',
    '\u1EF4': 'Y',
    '\u01B3': 'Y',
    '\u024E': 'Y',
    '\u1EFE': 'Y',
    '\u24CF': 'Z',
    '\uFF3A': 'Z',
    '\u0179': 'Z',
    '\u1E90': 'Z',
    '\u017B': 'Z',
    '\u017D': 'Z',
    '\u1E92': 'Z',
    '\u1E94': 'Z',
    '\u01B5': 'Z',
    '\u0224': 'Z',
    '\u2C7F': 'Z',
    '\u2C6B': 'Z',
    '\uA762': 'Z',
    '\u24D0': 'a',
    '\uFF41': 'a',
    '\u1E9A': 'a',
    '\u00E0': 'a',
    '\u00E1': 'a',
    '\u00E2': 'a',
    '\u1EA7': 'a',
    '\u1EA5': 'a',
    '\u1EAB': 'a',
    '\u1EA9': 'a',
    '\u00E3': 'a',
    '\u0101': 'a',
    '\u0103': 'a',
    '\u1EB1': 'a',
    '\u1EAF': 'a',
    '\u1EB5': 'a',
    '\u1EB3': 'a',
    '\u0227': 'a',
    '\u01E1': 'a',
    '\u00E4': 'a',
    '\u01DF': 'a',
    '\u1EA3': 'a',
    '\u00E5': 'a',
    '\u01FB': 'a',
    '\u01CE': 'a',
    '\u0201': 'a',
    '\u0203': 'a',
    '\u1EA1': 'a',
    '\u1EAD': 'a',
    '\u1EB7': 'a',
    '\u1E01': 'a',
    '\u0105': 'a',
    '\u2C65': 'a',
    '\u0250': 'a',
    '\uA733': 'aa',
    '\u00E6': 'ae',
    '\u01FD': 'ae',
    '\u01E3': 'ae',
    '\uA735': 'ao',
    '\uA737': 'au',
    '\uA739': 'av',
    '\uA73B': 'av',
    '\uA73D': 'ay',
    '\u24D1': 'b',
    '\uFF42': 'b',
    '\u1E03': 'b',
    '\u1E05': 'b',
    '\u1E07': 'b',
    '\u0180': 'b',
    '\u0183': 'b',
    '\u0253': 'b',
    '\u24D2': 'c',
    '\uFF43': 'c',
    '\u0107': 'c',
    '\u0109': 'c',
    '\u010B': 'c',
    '\u010D': 'c',
    '\u00E7': 'c',
    '\u1E09': 'c',
    '\u0188': 'c',
    '\u023C': 'c',
    '\uA73F': 'c',
    '\u2184': 'c',
    '\u24D3': 'd',
    '\uFF44': 'd',
    '\u1E0B': 'd',
    '\u010F': 'd',
    '\u1E0D': 'd',
    '\u1E11': 'd',
    '\u1E13': 'd',
    '\u1E0F': 'd',
    '\u0111': 'd',
    '\u018C': 'd',
    '\u0256': 'd',
    '\u0257': 'd',
    '\uA77A': 'd',
    '\u01F3': 'dz',
    '\u01C6': 'dz',
    '\u24D4': 'e',
    '\uFF45': 'e',
    '\u00E8': 'e',
    '\u00E9': 'e',
    '\u00EA': 'e',
    '\u1EC1': 'e',
    '\u1EBF': 'e',
    '\u1EC5': 'e',
    '\u1EC3': 'e',
    '\u1EBD': 'e',
    '\u0113': 'e',
    '\u1E15': 'e',
    '\u1E17': 'e',
    '\u0115': 'e',
    '\u0117': 'e',
    '\u00EB': 'e',
    '\u1EBB': 'e',
    '\u011B': 'e',
    '\u0205': 'e',
    '\u0207': 'e',
    '\u1EB9': 'e',
    '\u1EC7': 'e',
    '\u0229': 'e',
    '\u1E1D': 'e',
    '\u0119': 'e',
    '\u1E19': 'e',
    '\u1E1B': 'e',
    '\u0247': 'e',
    '\u025B': 'e',
    '\u01DD': 'e',
    '\u24D5': 'f',
    '\uFF46': 'f',
    '\u1E1F': 'f',
    '\u0192': 'f',
    '\uA77C': 'f',
    '\u24D6': 'g',
    '\uFF47': 'g',
    '\u01F5': 'g',
    '\u011D': 'g',
    '\u1E21': 'g',
    '\u011F': 'g',
    '\u0121': 'g',
    '\u01E7': 'g',
    '\u0123': 'g',
    '\u01E5': 'g',
    '\u0260': 'g',
    '\uA7A1': 'g',
    '\u1D79': 'g',
    '\uA77F': 'g',
    '\u24D7': 'h',
    '\uFF48': 'h',
    '\u0125': 'h',
    '\u1E23': 'h',
    '\u1E27': 'h',
    '\u021F': 'h',
    '\u1E25': 'h',
    '\u1E29': 'h',
    '\u1E2B': 'h',
    '\u1E96': 'h',
    '\u0127': 'h',
    '\u2C68': 'h',
    '\u2C76': 'h',
    '\u0265': 'h',
    '\u0195': 'hv',
    '\u24D8': 'i',
    '\uFF49': 'i',
    '\u00EC': 'i',
    '\u00ED': 'i',
    '\u00EE': 'i',
    '\u0129': 'i',
    '\u012B': 'i',
    '\u012D': 'i',
    '\u00EF': 'i',
    '\u1E2F': 'i',
    '\u1EC9': 'i',
    '\u01D0': 'i',
    '\u0209': 'i',
    '\u020B': 'i',
    '\u1ECB': 'i',
    '\u012F': 'i',
    '\u1E2D': 'i',
    '\u0268': 'i',
    '\u0131': 'i',
    '\u24D9': 'j',
    '\uFF4A': 'j',
    '\u0135': 'j',
    '\u01F0': 'j',
    '\u0249': 'j',
    '\u24DA': 'k',
    '\uFF4B': 'k',
    '\u1E31': 'k',
    '\u01E9': 'k',
    '\u1E33': 'k',
    '\u0137': 'k',
    '\u1E35': 'k',
    '\u0199': 'k',
    '\u2C6A': 'k',
    '\uA741': 'k',
    '\uA743': 'k',
    '\uA745': 'k',
    '\uA7A3': 'k',
    '\u24DB': 'l',
    '\uFF4C': 'l',
    '\u0140': 'l',
    '\u013A': 'l',
    '\u013E': 'l',
    '\u1E37': 'l',
    '\u1E39': 'l',
    '\u013C': 'l',
    '\u1E3D': 'l',
    '\u1E3B': 'l',
    '\u017F': 'l',
    '\u0142': 'l',
    '\u019A': 'l',
    '\u026B': 'l',
    '\u2C61': 'l',
    '\uA749': 'l',
    '\uA781': 'l',
    '\uA747': 'l',
    '\u01C9': 'lj',
    '\u24DC': 'm',
    '\uFF4D': 'm',
    '\u1E3F': 'm',
    '\u1E41': 'm',
    '\u1E43': 'm',
    '\u0271': 'm',
    '\u026F': 'm',
    '\u24DD': 'n',
    '\uFF4E': 'n',
    '\u01F9': 'n',
    '\u0144': 'n',
    '\u00F1': 'n',
    '\u1E45': 'n',
    '\u0148': 'n',
    '\u1E47': 'n',
    '\u0146': 'n',
    '\u1E4B': 'n',
    '\u1E49': 'n',
    '\u019E': 'n',
    '\u0272': 'n',
    '\u0149': 'n',
    '\uA791': 'n',
    '\uA7A5': 'n',
    '\u01CC': 'nj',
    '\u24DE': 'o',
    '\uFF4F': 'o',
    '\u00F2': 'o',
    '\u00F3': 'o',
    '\u00F4': 'o',
    '\u1ED3': 'o',
    '\u1ED1': 'o',
    '\u1ED7': 'o',
    '\u1ED5': 'o',
    '\u00F5': 'o',
    '\u1E4D': 'o',
    '\u022D': 'o',
    '\u1E4F': 'o',
    '\u014D': 'o',
    '\u1E51': 'o',
    '\u1E53': 'o',
    '\u014F': 'o',
    '\u022F': 'o',
    '\u0231': 'o',
    '\u00F6': 'o',
    '\u022B': 'o',
    '\u1ECF': 'o',
    '\u0151': 'o',
    '\u01D2': 'o',
    '\u020D': 'o',
    '\u020F': 'o',
    '\u01A1': 'o',
    '\u1EDD': 'o',
    '\u1EDB': 'o',
    '\u1EE1': 'o',
    '\u1EDF': 'o',
    '\u1EE3': 'o',
    '\u1ECD': 'o',
    '\u1ED9': 'o',
    '\u01EB': 'o',
    '\u01ED': 'o',
    '\u00F8': 'o',
    '\u01FF': 'o',
    '\u0254': 'o',
    '\uA74B': 'o',
    '\uA74D': 'o',
    '\u0275': 'o',
    '\u01A3': 'oi',
    '\u0223': 'ou',
    '\uA74F': 'oo',
    '\u24DF': 'p',
    '\uFF50': 'p',
    '\u1E55': 'p',
    '\u1E57': 'p',
    '\u01A5': 'p',
    '\u1D7D': 'p',
    '\uA751': 'p',
    '\uA753': 'p',
    '\uA755': 'p',
    '\u24E0': 'q',
    '\uFF51': 'q',
    '\u024B': 'q',
    '\uA757': 'q',
    '\uA759': 'q',
    '\u24E1': 'r',
    '\uFF52': 'r',
    '\u0155': 'r',
    '\u1E59': 'r',
    '\u0159': 'r',
    '\u0211': 'r',
    '\u0213': 'r',
    '\u1E5B': 'r',
    '\u1E5D': 'r',
    '\u0157': 'r',
    '\u1E5F': 'r',
    '\u024D': 'r',
    '\u027D': 'r',
    '\uA75B': 'r',
    '\uA7A7': 'r',
    '\uA783': 'r',
    '\u24E2': 's',
    '\uFF53': 's',
    '\u00DF': 's',
    '\u015B': 's',
    '\u1E65': 's',
    '\u015D': 's',
    '\u1E61': 's',
    '\u0161': 's',
    '\u1E67': 's',
    '\u1E63': 's',
    '\u1E69': 's',
    '\u0219': 's',
    '\u015F': 's',
    '\u023F': 's',
    '\uA7A9': 's',
    '\uA785': 's',
    '\u1E9B': 's',
    '\u24E3': 't',
    '\uFF54': 't',
    '\u1E6B': 't',
    '\u1E97': 't',
    '\u0165': 't',
    '\u1E6D': 't',
    '\u021B': 't',
    '\u0163': 't',
    '\u1E71': 't',
    '\u1E6F': 't',
    '\u0167': 't',
    '\u01AD': 't',
    '\u0288': 't',
    '\u2C66': 't',
    '\uA787': 't',
    '\uA729': 'tz',
    '\u24E4': 'u',
    '\uFF55': 'u',
    '\u00F9': 'u',
    '\u00FA': 'u',
    '\u00FB': 'u',
    '\u0169': 'u',
    '\u1E79': 'u',
    '\u016B': 'u',
    '\u1E7B': 'u',
    '\u016D': 'u',
    '\u00FC': 'u',
    '\u01DC': 'u',
    '\u01D8': 'u',
    '\u01D6': 'u',
    '\u01DA': 'u',
    '\u1EE7': 'u',
    '\u016F': 'u',
    '\u0171': 'u',
    '\u01D4': 'u',
    '\u0215': 'u',
    '\u0217': 'u',
    '\u01B0': 'u',
    '\u1EEB': 'u',
    '\u1EE9': 'u',
    '\u1EEF': 'u',
    '\u1EED': 'u',
    '\u1EF1': 'u',
    '\u1EE5': 'u',
    '\u1E73': 'u',
    '\u0173': 'u',
    '\u1E77': 'u',
    '\u1E75': 'u',
    '\u0289': 'u',
    '\u24E5': 'v',
    '\uFF56': 'v',
    '\u1E7D': 'v',
    '\u1E7F': 'v',
    '\u028B': 'v',
    '\uA75F': 'v',
    '\u028C': 'v',
    '\uA761': 'vy',
    '\u24E6': 'w',
    '\uFF57': 'w',
    '\u1E81': 'w',
    '\u1E83': 'w',
    '\u0175': 'w',
    '\u1E87': 'w',
    '\u1E85': 'w',
    '\u1E98': 'w',
    '\u1E89': 'w',
    '\u2C73': 'w',
    '\u24E7': 'x',
    '\uFF58': 'x',
    '\u1E8B': 'x',
    '\u1E8D': 'x',
    '\u24E8': 'y',
    '\uFF59': 'y',
    '\u1EF3': 'y',
    '\u00FD': 'y',
    '\u0177': 'y',
    '\u1EF9': 'y',
    '\u0233': 'y',
    '\u1E8F': 'y',
    '\u00FF': 'y',
    '\u1EF7': 'y',
    '\u1E99': 'y',
    '\u1EF5': 'y',
    '\u01B4': 'y',
    '\u024F': 'y',
    '\u1EFF': 'y',
    '\u24E9': 'z',
    '\uFF5A': 'z',
    '\u017A': 'z',
    '\u1E91': 'z',
    '\u017C': 'z',
    '\u017E': 'z',
    '\u1E93': 'z',
    '\u1E95': 'z',
    '\u01B6': 'z',
    '\u0225': 'z',
    '\u0240': 'z',
    '\u2C6C': 'z',
    '\uA763': 'z',
    '\u0386': '\u0391',
    '\u0388': '\u0395',
    '\u0389': '\u0397',
    '\u038A': '\u0399',
    '\u03AA': '\u0399',
    '\u038C': '\u039F',
    '\u038E': '\u03A5',
    '\u03AB': '\u03A5',
    '\u038F': '\u03A9',
    '\u03AC': '\u03B1',
    '\u03AD': '\u03B5',
    '\u03AE': '\u03B7',
    '\u03AF': '\u03B9',
    '\u03CA': '\u03B9',
    '\u0390': '\u03B9',
    '\u03CC': '\u03BF',
    '\u03CD': '\u03C5',
    '\u03CB': '\u03C5',
    '\u03B0': '\u03C5',
    '\u03C9': '\u03C9',
    '\u03C2': '\u03C3'
  };

  return diacritics;
});

S2.define('select2/data/base',[
  '../utils'
], function (Utils) {
  function BaseAdapter ($element, options) {
    BaseAdapter.__super__.constructor.call(this);
  }

  Utils.Extend(BaseAdapter, Utils.Observable);

  BaseAdapter.prototype.current = function (callback) {
    throw new Error('The `current` method must be defined in child classes.');
  };

  BaseAdapter.prototype.query = function (params, callback) {
    throw new Error('The `query` method must be defined in child classes.');
  };

  BaseAdapter.prototype.bind = function (container, $container) {
    // Can be implemented in subclasses
  };

  BaseAdapter.prototype.destroy = function () {
    // Can be implemented in subclasses
  };

  BaseAdapter.prototype.generateResultId = function (container, data) {
    var id = container.id + '-result-';

    id += Utils.generateChars(4);

    if (data.id != null) {
      id += '-' + data.id.toString();
    } else {
      id += '-' + Utils.generateChars(4);
    }
    return id;
  };

  return BaseAdapter;
});

S2.define('select2/data/select',[
  './base',
  '../utils',
  'jquery'
], function (BaseAdapter, Utils, $) {
  function SelectAdapter ($element, options) {
    this.$element = $element;
    this.options = options;

    SelectAdapter.__super__.constructor.call(this);
  }

  Utils.Extend(SelectAdapter, BaseAdapter);

  SelectAdapter.prototype.current = function (callback) {
    var data = [];
    var self = this;

    this.$element.find(':selected').each(function () {
      var $option = $(this);

      var option = self.item($option);

      data.push(option);
    });

    callback(data);
  };

  SelectAdapter.prototype.select = function (data) {
    var self = this;

    data.selected = true;

    // If data.element is a DOM node, use it instead
    if ($(data.element).is('option')) {
      data.element.selected = true;

      this.$element.trigger('change');

      return;
    }

    if (this.$element.prop('multiple')) {
      this.current(function (currentData) {
        var val = [];

        data = [data];
        data.push.apply(data, currentData);

        for (var d = 0; d < data.length; d++) {
          var id = data[d].id;

          if ($.inArray(id, val) === -1) {
            val.push(id);
          }
        }

        self.$element.val(val);
        self.$element.trigger('change');
      });
    } else {
      var val = data.id;

      this.$element.val(val);
      this.$element.trigger('change');
    }
  };

  SelectAdapter.prototype.unselect = function (data) {
    var self = this;

    if (!this.$element.prop('multiple')) {
      return;
    }

    data.selected = false;

    if ($(data.element).is('option')) {
      data.element.selected = false;

      this.$element.trigger('change');

      return;
    }

    this.current(function (currentData) {
      var val = [];

      for (var d = 0; d < currentData.length; d++) {
        var id = currentData[d].id;

        if (id !== data.id && $.inArray(id, val) === -1) {
          val.push(id);
        }
      }

      self.$element.val(val);

      self.$element.trigger('change');
    });
  };

  SelectAdapter.prototype.bind = function (container, $container) {
    var self = this;

    this.container = container;

    container.on('select', function (params) {
      self.select(params.data);
    });

    container.on('unselect', function (params) {
      self.unselect(params.data);
    });
  };

  SelectAdapter.prototype.destroy = function () {
    // Remove anything added to child elements
    this.$element.find('*').each(function () {
      // Remove any custom data set by Select2
      $.removeData(this, 'data');
    });
  };

  SelectAdapter.prototype.query = function (params, callback) {
    var data = [];
    var self = this;

    var $options = this.$element.children();

    $options.each(function () {
      var $option = $(this);

      if (!$option.is('option') && !$option.is('optgroup')) {
        return;
      }

      var option = self.item($option);

      var matches = self.matches(params, option);

      if (matches !== null) {
        data.push(matches);
      }
    });

    callback({
      results: data
    });
  };

  SelectAdapter.prototype.addOptions = function ($options) {
    Utils.appendMany(this.$element, $options);
  };

  SelectAdapter.prototype.option = function (data) {
    var option;

    if (data.children) {
      option = document.createElement('optgroup');
      option.label = data.text;
    } else {
      option = document.createElement('option');

      if (option.textContent !== undefined) {
        option.textContent = data.text;
      } else {
        option.innerText = data.text;
      }
    }

    if (data.id) {
      option.value = data.id;
    }

    if (data.disabled) {
      option.disabled = true;
    }

    if (data.selected) {
      option.selected = true;
    }

    if (data.title) {
      option.title = data.title;
    }

    var $option = $(option);

    var normalizedData = this._normalizeItem(data);
    normalizedData.element = option;

    // Override the option's data with the combined data
    $.data(option, 'data', normalizedData);

    return $option;
  };

  SelectAdapter.prototype.item = function ($option) {
    var data = {};

    data = $.data($option[0], 'data');

    if (data != null) {
      return data;
    }

    if ($option.is('option')) {
      data = {
        id: $option.val(),
        text: $option.text(),
        disabled: $option.prop('disabled'),
        selected: $option.prop('selected'),
        title: $option.prop('title')
      };
    } else if ($option.is('optgroup')) {
      data = {
        text: $option.prop('label'),
        children: [],
        title: $option.prop('title')
      };

      var $children = $option.children('option');
      var children = [];

      for (var c = 0; c < $children.length; c++) {
        var $child = $($children[c]);

        var child = this.item($child);

        children.push(child);
      }

      data.children = children;
    }

    data = this._normalizeItem(data);
    data.element = $option[0];

    $.data($option[0], 'data', data);

    return data;
  };

  SelectAdapter.prototype._normalizeItem = function (item) {
    if (!$.isPlainObject(item)) {
      item = {
        id: item,
        text: item
      };
    }

    item = $.extend({}, {
      text: ''
    }, item);

    var defaults = {
      selected: false,
      disabled: false
    };

    if (item.id != null) {
      item.id = item.id.toString();
    }

    if (item.text != null) {
      item.text = item.text.toString();
    }

    if (item._resultId == null && item.id && this.container != null) {
      item._resultId = this.generateResultId(this.container, item);
    }

    return $.extend({}, defaults, item);
  };

  SelectAdapter.prototype.matches = function (params, data) {
    var matcher = this.options.get('matcher');

    return matcher(params, data);
  };

  return SelectAdapter;
});

S2.define('select2/data/array',[
  './select',
  '../utils',
  'jquery'
], function (SelectAdapter, Utils, $) {
  function ArrayAdapter ($element, options) {
    var data = options.get('data') || [];

    ArrayAdapter.__super__.constructor.call(this, $element, options);

    this.addOptions(this.convertToOptions(data));
  }

  Utils.Extend(ArrayAdapter, SelectAdapter);

  ArrayAdapter.prototype.select = function (data) {
    var $option = this.$element.find('option').filter(function (i, elm) {
      return elm.value == data.id.toString();
    });

    if ($option.length === 0) {
      $option = this.option(data);

      this.addOptions($option);
    }

    ArrayAdapter.__super__.select.call(this, data);
  };

  ArrayAdapter.prototype.convertToOptions = function (data) {
    var self = this;

    var $existing = this.$element.find('option');
    var existingIds = $existing.map(function () {
      return self.item($(this)).id;
    }).get();

    var $options = [];

    // Filter out all items except for the one passed in the argument
    function onlyItem (item) {
      return function () {
        return $(this).val() == item.id;
      };
    }

    for (var d = 0; d < data.length; d++) {
      var item = this._normalizeItem(data[d]);

      // Skip items which were pre-loaded, only merge the data
      if ($.inArray(item.id, existingIds) >= 0) {
        var $existingOption = $existing.filter(onlyItem(item));

        var existingData = this.item($existingOption);
        var newData = $.extend(true, {}, item, existingData);

        var $newOption = this.option(newData);

        $existingOption.replaceWith($newOption);

        continue;
      }

      var $option = this.option(item);

      if (item.children) {
        var $children = this.convertToOptions(item.children);

        Utils.appendMany($option, $children);
      }

      $options.push($option);
    }

    return $options;
  };

  return ArrayAdapter;
});

S2.define('select2/data/ajax',[
  './array',
  '../utils',
  'jquery'
], function (ArrayAdapter, Utils, $) {
  function AjaxAdapter ($element, options) {
    this.ajaxOptions = this._applyDefaults(options.get('ajax'));

    if (this.ajaxOptions.processResults != null) {
      this.processResults = this.ajaxOptions.processResults;
    }

    AjaxAdapter.__super__.constructor.call(this, $element, options);
  }

  Utils.Extend(AjaxAdapter, ArrayAdapter);

  AjaxAdapter.prototype._applyDefaults = function (options) {
    var defaults = {
      data: function (params) {
        return $.extend({}, params, {
          q: params.term
        });
      },
      transport: function (params, success, failure) {
        var $request = $.ajax(params);

        $request.then(success);
        $request.fail(failure);

        return $request;
      }
    };

    return $.extend({}, defaults, options, true);
  };

  AjaxAdapter.prototype.processResults = function (results) {
    return results;
  };

  AjaxAdapter.prototype.query = function (params, callback) {
    var matches = [];
    var self = this;

    if (this._request != null) {
      // JSONP requests cannot always be aborted
      if ($.isFunction(this._request.abort)) {
        this._request.abort();
      }

      this._request = null;
    }

    var options = $.extend({
      type: 'GET'
    }, this.ajaxOptions);

    if (typeof options.url === 'function') {
      options.url = options.url.call(this.$element, params);
    }

    if (typeof options.data === 'function') {
      options.data = options.data.call(this.$element, params);
    }

    function request () {
      var $request = options.transport(options, function (data) {
        var results = self.processResults(data, params);

        if (self.options.get('debug') && window.console && console.error) {
          // Check to make sure that the response included a `results` key.
          if (!results || !results.results || !$.isArray(results.results)) {
            console.error(
              'Select2: The AJAX results did not return an array in the ' +
              '`results` key of the response.'
            );
          }
        }

        callback(results);
      }, function () {
        // Attempt to detect if a request was aborted
        // Only works if the transport exposes a status property
        if ($request.status && $request.status === '0') {
          return;
        }

        self.trigger('results:message', {
          message: 'errorLoading'
        });
      });

      self._request = $request;
    }

    if (this.ajaxOptions.delay && params.term != null) {
      if (this._queryTimeout) {
        window.clearTimeout(this._queryTimeout);
      }

      this._queryTimeout = window.setTimeout(request, this.ajaxOptions.delay);
    } else {
      request();
    }
  };

  return AjaxAdapter;
});

S2.define('select2/data/tags',[
  'jquery'
], function ($) {
  function Tags (decorated, $element, options) {
    var tags = options.get('tags');

    var createTag = options.get('createTag');

    if (createTag !== undefined) {
      this.createTag = createTag;
    }

    var insertTag = options.get('insertTag');

    if (insertTag !== undefined) {
        this.insertTag = insertTag;
    }

    decorated.call(this, $element, options);

    if ($.isArray(tags)) {
      for (var t = 0; t < tags.length; t++) {
        var tag = tags[t];
        var item = this._normalizeItem(tag);

        var $option = this.option(item);

        this.$element.append($option);
      }
    }
  }

  Tags.prototype.query = function (decorated, params, callback) {
    var self = this;

    this._removeOldTags();

    if (params.term == null || params.page != null) {
      decorated.call(this, params, callback);
      return;
    }

    function wrapper (obj, child) {
      var data = obj.results;

      for (var i = 0; i < data.length; i++) {
        var option = data[i];

        var checkChildren = (
          option.children != null &&
          !wrapper({
            results: option.children
          }, true)
        );

        var checkText = option.text === params.term;

        if (checkText || checkChildren) {
          if (child) {
            return false;
          }

          obj.data = data;
          callback(obj);

          return;
        }
      }

      if (child) {
        return true;
      }

      var tag = self.createTag(params);

      if (tag != null) {
        var $option = self.option(tag);
        $option.attr('data-select2-tag', true);

        self.addOptions([$option]);

        self.insertTag(data, tag);
      }

      obj.results = data;

      callback(obj);
    }

    decorated.call(this, params, wrapper);
  };

  Tags.prototype.createTag = function (decorated, params) {
    var term = $.trim(params.term);

    if (term === '') {
      return null;
    }

    return {
      id: term,
      text: term
    };
  };

  Tags.prototype.insertTag = function (_, data, tag) {
    data.unshift(tag);
  };

  Tags.prototype._removeOldTags = function (_) {
    var tag = this._lastTag;

    var $options = this.$element.find('option[data-select2-tag]');

    $options.each(function () {
      if (this.selected) {
        return;
      }

      $(this).remove();
    });
  };

  return Tags;
});

S2.define('select2/data/tokenizer',[
  'jquery'
], function ($) {
  function Tokenizer (decorated, $element, options) {
    var tokenizer = options.get('tokenizer');

    if (tokenizer !== undefined) {
      this.tokenizer = tokenizer;
    }

    decorated.call(this, $element, options);
  }

  Tokenizer.prototype.bind = function (decorated, container, $container) {
    decorated.call(this, container, $container);

    this.$search =  container.dropdown.$search || container.selection.$search ||
      $container.find('.select2-search__field');
  };

  Tokenizer.prototype.query = function (decorated, params, callback) {
    var self = this;

    function createAndSelect (data) {
      // Normalize the data object so we can use it for checks
      var item = self._normalizeItem(data);

      // Check if the data object already exists as a tag
      // Select it if it doesn't
      var $existingOptions = self.$element.find('option').filter(function () {
        return $(this).val() === item.id;
      });

      // If an existing option wasn't found for it, create the option
      if (!$existingOptions.length) {
        var $option = self.option(item);
        $option.attr('data-select2-tag', true);

        self._removeOldTags();
        self.addOptions([$option]);
      }

      // Select the item, now that we know there is an option for it
      select(item);
    }

    function select (data) {
      self.trigger('select', {
        data: data
      });
    }

    params.term = params.term || '';

    var tokenData = this.tokenizer(params, this.options, createAndSelect);

    if (tokenData.term !== params.term) {
      // Replace the search term if we have the search box
      if (this.$search.length) {
        this.$search.val(tokenData.term);
        this.$search.focus();
      }

      params.term = tokenData.term;
    }

    decorated.call(this, params, callback);
  };

  Tokenizer.prototype.tokenizer = function (_, params, options, callback) {
    var separators = options.get('tokenSeparators') || [];
    var term = params.term;
    var i = 0;

    var createTag = this.createTag || function (params) {
      return {
        id: params.term,
        text: params.term
      };
    };

    while (i < term.length) {
      var termChar = term[i];

      if ($.inArray(termChar, separators) === -1) {
        i++;

        continue;
      }

      var part = term.substr(0, i);
      var partParams = $.extend({}, params, {
        term: part
      });

      var data = createTag(partParams);

      if (data == null) {
        i++;
        continue;
      }

      callback(data);

      // Reset the term to not include the tokenized portion
      term = term.substr(i + 1) || '';
      i = 0;
    }

    return {
      term: term
    };
  };

  return Tokenizer;
});

S2.define('select2/data/minimumInputLength',[

], function () {
  function MinimumInputLength (decorated, $e, options) {
    this.minimumInputLength = options.get('minimumInputLength');

    decorated.call(this, $e, options);
  }

  MinimumInputLength.prototype.query = function (decorated, params, callback) {
    params.term = params.term || '';

    if (params.term.length < this.minimumInputLength) {
      this.trigger('results:message', {
        message: 'inputTooShort',
        args: {
          minimum: this.minimumInputLength,
          input: params.term,
          params: params
        }
      });

      return;
    }

    decorated.call(this, params, callback);
  };

  return MinimumInputLength;
});

S2.define('select2/data/maximumInputLength',[

], function () {
  function MaximumInputLength (decorated, $e, options) {
    this.maximumInputLength = options.get('maximumInputLength');

    decorated.call(this, $e, options);
  }

  MaximumInputLength.prototype.query = function (decorated, params, callback) {
    params.term = params.term || '';

    if (this.maximumInputLength > 0 &&
        params.term.length > this.maximumInputLength) {
      this.trigger('results:message', {
        message: 'inputTooLong',
        args: {
          maximum: this.maximumInputLength,
          input: params.term,
          params: params
        }
      });

      return;
    }

    decorated.call(this, params, callback);
  };

  return MaximumInputLength;
});

S2.define('select2/data/maximumSelectionLength',[

], function (){
  function MaximumSelectionLength (decorated, $e, options) {
    this.maximumSelectionLength = options.get('maximumSelectionLength');

    decorated.call(this, $e, options);
  }

  MaximumSelectionLength.prototype.query =
    function (decorated, params, callback) {
      var self = this;

      this.current(function (currentData) {
        var count = currentData != null ? currentData.length : 0;
        if (self.maximumSelectionLength > 0 &&
          count >= self.maximumSelectionLength) {
          self.trigger('results:message', {
            message: 'maximumSelected',
            args: {
              maximum: self.maximumSelectionLength
            }
          });
          return;
        }
        decorated.call(self, params, callback);
      });
  };

  return MaximumSelectionLength;
});

S2.define('select2/dropdown',[
  'jquery',
  './utils'
], function ($, Utils) {
  function Dropdown ($element, options) {
    this.$element = $element;
    this.options = options;

    Dropdown.__super__.constructor.call(this);
  }

  Utils.Extend(Dropdown, Utils.Observable);

  Dropdown.prototype.render = function () {
    var $dropdown = $(
      '<span class="select2-dropdown">' +
        '<span class="select2-results"></span>' +
      '</span>'
    );

    $dropdown.attr('dir', this.options.get('dir'));

    this.$dropdown = $dropdown;

    return $dropdown;
  };

  Dropdown.prototype.bind = function () {
    // Should be implemented in subclasses
  };

  Dropdown.prototype.position = function ($dropdown, $container) {
    // Should be implmented in subclasses
  };

  Dropdown.prototype.destroy = function () {
    // Remove the dropdown from the DOM
    this.$dropdown.remove();
  };

  return Dropdown;
});

S2.define('select2/dropdown/search',[
  'jquery',
  '../utils'
], function ($, Utils) {
  function Search () { }

  Search.prototype.render = function (decorated) {
    var $rendered = decorated.call(this);

    var $search = $(
      '<span class="select2-search select2-search--dropdown">' +
        '<input class="select2-search__field" type="search" tabindex="-1"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="off"' +
        ' spellcheck="false" role="textbox" />' +
      '</span>'
    );

    this.$searchContainer = $search;
    this.$search = $search.find('input');

    $rendered.prepend($search);

    return $rendered;
  };

  Search.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    this.$search.on('keydown', function (evt) {
      self.trigger('keypress', evt);

      self._keyUpPrevented = evt.isDefaultPrevented();
    });

    // Workaround for browsers which do not support the `input` event
    // This will prevent double-triggering of events for browsers which support
    // both the `keyup` and `input` events.
    this.$search.on('input', function (evt) {
      // Unbind the duplicated `keyup` event
      $(this).off('keyup');
    });

    this.$search.on('keyup input', function (evt) {
      self.handleSearch(evt);
    });

    container.on('open', function () {
      self.$search.attr('tabindex', 0);

      self.$search.focus();

      window.setTimeout(function () {
        self.$search.focus();
      }, 0);
    });

    container.on('close', function () {
      self.$search.attr('tabindex', -1);

      self.$search.val('');
    });

    container.on('focus', function () {
      if (container.isOpen()) {
        self.$search.focus();
      }
    });

    container.on('results:all', function (params) {
      if (params.query.term == null || params.query.term === '') {
        var showSearch = self.showSearch(params);

        if (showSearch) {
          self.$searchContainer.removeClass('select2-search--hide');
        } else {
          self.$searchContainer.addClass('select2-search--hide');
        }
      }
    });
  };

  Search.prototype.handleSearch = function (evt) {
    if (!this._keyUpPrevented) {
      var input = this.$search.val();

      this.trigger('query', {
        term: input
      });
    }

    this._keyUpPrevented = false;
  };

  Search.prototype.showSearch = function (_, params) {
    return true;
  };

  return Search;
});

S2.define('select2/dropdown/hidePlaceholder',[

], function () {
  function HidePlaceholder (decorated, $element, options, dataAdapter) {
    this.placeholder = this.normalizePlaceholder(options.get('placeholder'));

    decorated.call(this, $element, options, dataAdapter);
  }

  HidePlaceholder.prototype.append = function (decorated, data) {
    data.results = this.removePlaceholder(data.results);

    decorated.call(this, data);
  };

  HidePlaceholder.prototype.normalizePlaceholder = function (_, placeholder) {
    if (typeof placeholder === 'string') {
      placeholder = {
        id: '',
        text: placeholder
      };
    }

    return placeholder;
  };

  HidePlaceholder.prototype.removePlaceholder = function (_, data) {
    var modifiedData = data.slice(0);

    for (var d = data.length - 1; d >= 0; d--) {
      var item = data[d];

      if (this.placeholder.id === item.id) {
        modifiedData.splice(d, 1);
      }
    }

    return modifiedData;
  };

  return HidePlaceholder;
});

S2.define('select2/dropdown/infiniteScroll',[
  'jquery'
], function ($) {
  function InfiniteScroll (decorated, $element, options, dataAdapter) {
    this.lastParams = {};

    decorated.call(this, $element, options, dataAdapter);

    this.$loadingMore = this.createLoadingMore();
    this.loading = false;
  }

  InfiniteScroll.prototype.append = function (decorated, data) {
    this.$loadingMore.remove();
    this.loading = false;

    decorated.call(this, data);

    if (this.showLoadingMore(data)) {
      this.$results.append(this.$loadingMore);
    }
  };

  InfiniteScroll.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('query', function (params) {
      self.lastParams = params;
      self.loading = true;
    });

    container.on('query:append', function (params) {
      self.lastParams = params;
      self.loading = true;
    });

    this.$results.on('scroll', function () {
      var isLoadMoreVisible = $.contains(
        document.documentElement,
        self.$loadingMore[0]
      );

      if (self.loading || !isLoadMoreVisible) {
        return;
      }

      var currentOffset = self.$results.offset().top +
        self.$results.outerHeight(false);
      var loadingMoreOffset = self.$loadingMore.offset().top +
        self.$loadingMore.outerHeight(false);

      if (currentOffset + 50 >= loadingMoreOffset) {
        self.loadMore();
      }
    });
  };

  InfiniteScroll.prototype.loadMore = function () {
    this.loading = true;

    var params = $.extend({}, {page: 1}, this.lastParams);

    params.page++;

    this.trigger('query:append', params);
  };

  InfiniteScroll.prototype.showLoadingMore = function (_, data) {
    return data.pagination && data.pagination.more;
  };

  InfiniteScroll.prototype.createLoadingMore = function () {
    var $option = $(
      '<li ' +
      'class="select2-results__option select2-results__option--load-more"' +
      'role="treeitem" aria-disabled="true"></li>'
    );

    var message = this.options.get('translations').get('loadingMore');

    $option.html(message(this.lastParams));

    return $option;
  };

  return InfiniteScroll;
});

S2.define('select2/dropdown/attachBody',[
  'jquery',
  '../utils'
], function ($, Utils) {
  function AttachBody (decorated, $element, options) {
    this.$dropdownParent = options.get('dropdownParent') || $(document.body);

    decorated.call(this, $element, options);
  }

  AttachBody.prototype.bind = function (decorated, container, $container) {
    var self = this;

    var setupResultsEvents = false;

    decorated.call(this, container, $container);

    container.on('open', function () {
      self._showDropdown();
      self._attachPositioningHandler(container);

      if (!setupResultsEvents) {
        setupResultsEvents = true;

        container.on('results:all', function () {
          self._positionDropdown();
          self._resizeDropdown();
        });

        container.on('results:append', function () {
          self._positionDropdown();
          self._resizeDropdown();
        });
      }
    });

    container.on('close', function () {
      self._hideDropdown();
      self._detachPositioningHandler(container);
    });

    this.$dropdownContainer.on('mousedown', function (evt) {
      evt.stopPropagation();
    });
  };

  AttachBody.prototype.destroy = function (decorated) {
    decorated.call(this);

    this.$dropdownContainer.remove();
  };

  AttachBody.prototype.position = function (decorated, $dropdown, $container) {
    // Clone all of the container classes
    $dropdown.attr('class', $container.attr('class'));

    $dropdown.removeClass('select2');
    $dropdown.addClass('select2-container--open');

    $dropdown.css({
      position: 'absolute',
      top: -999999
    });

    this.$container = $container;
  };

  AttachBody.prototype.render = function (decorated) {
    var $container = $('<span></span>');

    var $dropdown = decorated.call(this);
    $container.append($dropdown);

    this.$dropdownContainer = $container;

    return $container;
  };

  AttachBody.prototype._hideDropdown = function (decorated) {
    this.$dropdownContainer.detach();
  };

  AttachBody.prototype._attachPositioningHandler =
      function (decorated, container) {
    var self = this;

    var scrollEvent = 'scroll.select2.' + container.id;
    var resizeEvent = 'resize.select2.' + container.id;
    var orientationEvent = 'orientationchange.select2.' + container.id;

    var $watchers = this.$container.parents().filter(Utils.hasScroll);
    $watchers.each(function () {
      $(this).data('select2-scroll-position', {
        x: $(this).scrollLeft(),
        y: $(this).scrollTop()
      });
    });

    $watchers.on(scrollEvent, function (ev) {
      var position = $(this).data('select2-scroll-position');
      $(this).scrollTop(position.y);
    });

    $(window).on(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent,
      function (e) {
      self._positionDropdown();
      self._resizeDropdown();
    });
  };

  AttachBody.prototype._detachPositioningHandler =
      function (decorated, container) {
    var scrollEvent = 'scroll.select2.' + container.id;
    var resizeEvent = 'resize.select2.' + container.id;
    var orientationEvent = 'orientationchange.select2.' + container.id;

    var $watchers = this.$container.parents().filter(Utils.hasScroll);
    $watchers.off(scrollEvent);

    $(window).off(scrollEvent + ' ' + resizeEvent + ' ' + orientationEvent);
  };

  AttachBody.prototype._positionDropdown = function () {
    var $window = $(window);

    var isCurrentlyAbove = this.$dropdown.hasClass('select2-dropdown--above');
    var isCurrentlyBelow = this.$dropdown.hasClass('select2-dropdown--below');

    var newDirection = null;

    var offset = this.$container.offset();

    offset.bottom = offset.top + this.$container.outerHeight(false);

    var container = {
      height: this.$container.outerHeight(false)
    };

    container.top = offset.top;
    container.bottom = offset.top + container.height;

    var dropdown = {
      height: this.$dropdown.outerHeight(false)
    };

    var viewport = {
      top: $window.scrollTop(),
      bottom: $window.scrollTop() + $window.height()
    };

    var enoughRoomAbove = viewport.top < (offset.top - dropdown.height);
    var enoughRoomBelow = viewport.bottom > (offset.bottom + dropdown.height);

    var css = {
      left: offset.left,
      top: container.bottom
    };

    // Determine what the parent element is to use for calciulating the offset
    var $offsetParent = this.$dropdownParent;

    // For statically positoned elements, we need to get the element
    // that is determining the offset
    if ($offsetParent.css('position') === 'static') {
      $offsetParent = $offsetParent.offsetParent();
    }

    var parentOffset = $offsetParent.offset();

    css.top -= parentOffset.top;
    css.left -= parentOffset.left;

    if (!isCurrentlyAbove && !isCurrentlyBelow) {
      newDirection = 'below';
    }

    if (!enoughRoomBelow && enoughRoomAbove && !isCurrentlyAbove) {
      newDirection = 'above';
    } else if (!enoughRoomAbove && enoughRoomBelow && isCurrentlyAbove) {
      newDirection = 'below';
    }

    if (newDirection == 'above' ||
      (isCurrentlyAbove && newDirection !== 'below')) {
      css.top = container.top - parentOffset.top - dropdown.height;
    }

    if (newDirection != null) {
      this.$dropdown
        .removeClass('select2-dropdown--below select2-dropdown--above')
        .addClass('select2-dropdown--' + newDirection);
      this.$container
        .removeClass('select2-container--below select2-container--above')
        .addClass('select2-container--' + newDirection);
    }

    this.$dropdownContainer.css(css);
  };

  AttachBody.prototype._resizeDropdown = function () {
    var css = {
      width: this.$container.outerWidth(false) + 'px'
    };

    if (this.options.get('dropdownAutoWidth')) {
      css.minWidth = css.width;
      css.position = 'relative';
      css.width = 'auto';
    }

    this.$dropdown.css(css);
  };

  AttachBody.prototype._showDropdown = function (decorated) {
    this.$dropdownContainer.appendTo(this.$dropdownParent);

    this._positionDropdown();
    this._resizeDropdown();
  };

  return AttachBody;
});

S2.define('select2/dropdown/minimumResultsForSearch',[

], function () {
  function countResults (data) {
    var count = 0;

    for (var d = 0; d < data.length; d++) {
      var item = data[d];

      if (item.children) {
        count += countResults(item.children);
      } else {
        count++;
      }
    }

    return count;
  }

  function MinimumResultsForSearch (decorated, $element, options, dataAdapter) {
    this.minimumResultsForSearch = options.get('minimumResultsForSearch');

    if (this.minimumResultsForSearch < 0) {
      this.minimumResultsForSearch = Infinity;
    }

    decorated.call(this, $element, options, dataAdapter);
  }

  MinimumResultsForSearch.prototype.showSearch = function (decorated, params) {
    if (countResults(params.data.results) < this.minimumResultsForSearch) {
      return false;
    }

    return decorated.call(this, params);
  };

  return MinimumResultsForSearch;
});

S2.define('select2/dropdown/selectOnClose',[

], function () {
  function SelectOnClose () { }

  SelectOnClose.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('close', function (params) {
      self._handleSelectOnClose(params);
    });
  };

  SelectOnClose.prototype._handleSelectOnClose = function (_, params) {
    if (params && params.originalSelect2Event != null) {
      var event = params.originalSelect2Event;

      // Don't select an item if the close event was triggered from a select or
      // unselect event
      if (event._type === 'select' || event._type === 'unselect') {
        return;
      }
    }

    var $highlightedResults = this.getHighlightedResults();

    // Only select highlighted results
    if ($highlightedResults.length < 1) {
      return;
    }

    var data = $highlightedResults.data('data');

    // Don't re-select already selected resulte
    if (
      (data.element != null && data.element.selected) ||
      (data.element == null && data.selected)
    ) {
      return;
    }

    this.trigger('select', {
        data: data
    });
  };

  return SelectOnClose;
});

S2.define('select2/dropdown/closeOnSelect',[

], function () {
  function CloseOnSelect () { }

  CloseOnSelect.prototype.bind = function (decorated, container, $container) {
    var self = this;

    decorated.call(this, container, $container);

    container.on('select', function (evt) {
      self._selectTriggered(evt);
    });

    container.on('unselect', function (evt) {
      self._selectTriggered(evt);
    });
  };

  CloseOnSelect.prototype._selectTriggered = function (_, evt) {
    var originalEvent = evt.originalEvent;

    // Don't close if the control key is being held
    if (originalEvent && originalEvent.ctrlKey) {
      return;
    }

    this.trigger('close', {
      originalEvent: originalEvent,
      originalSelect2Event: evt
    });
  };

  return CloseOnSelect;
});

S2.define('select2/i18n/en',[],function () {
  // English
  return {
    errorLoading: function () {
      return 'The results could not be loaded.';
    },
    inputTooLong: function (args) {
      var overChars = args.input.length - args.maximum;

      var message = 'Please delete ' + overChars + ' character';

      if (overChars != 1) {
        message += 's';
      }

      return message;
    },
    inputTooShort: function (args) {
      var remainingChars = args.minimum - args.input.length;

      var message = 'Please enter ' + remainingChars + ' or more characters';

      return message;
    },
    loadingMore: function () {
      return 'Loading more results…';
    },
    maximumSelected: function (args) {
      var message = 'You can only select ' + args.maximum + ' item';

      if (args.maximum != 1) {
        message += 's';
      }

      return message;
    },
    noResults: function () {
      return 'No results found';
    },
    searching: function () {
      return 'Searching…';
    }
  };
});

S2.define('select2/defaults',[
  'jquery',
  'require',

  './results',

  './selection/single',
  './selection/multiple',
  './selection/placeholder',
  './selection/allowClear',
  './selection/search',
  './selection/eventRelay',

  './utils',
  './translation',
  './diacritics',

  './data/select',
  './data/array',
  './data/ajax',
  './data/tags',
  './data/tokenizer',
  './data/minimumInputLength',
  './data/maximumInputLength',
  './data/maximumSelectionLength',

  './dropdown',
  './dropdown/search',
  './dropdown/hidePlaceholder',
  './dropdown/infiniteScroll',
  './dropdown/attachBody',
  './dropdown/minimumResultsForSearch',
  './dropdown/selectOnClose',
  './dropdown/closeOnSelect',

  './i18n/en'
], function ($, require,

             ResultsList,

             SingleSelection, MultipleSelection, Placeholder, AllowClear,
             SelectionSearch, EventRelay,

             Utils, Translation, DIACRITICS,

             SelectData, ArrayData, AjaxData, Tags, Tokenizer,
             MinimumInputLength, MaximumInputLength, MaximumSelectionLength,

             Dropdown, DropdownSearch, HidePlaceholder, InfiniteScroll,
             AttachBody, MinimumResultsForSearch, SelectOnClose, CloseOnSelect,

             EnglishTranslation) {
  function Defaults () {
    this.reset();
  }

  Defaults.prototype.apply = function (options) {
    options = $.extend(true, {}, this.defaults, options);

    if (options.dataAdapter == null) {
      if (options.ajax != null) {
        options.dataAdapter = AjaxData;
      } else if (options.data != null) {
        options.dataAdapter = ArrayData;
      } else {
        options.dataAdapter = SelectData;
      }

      if (options.minimumInputLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MinimumInputLength
        );
      }

      if (options.maximumInputLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MaximumInputLength
        );
      }

      if (options.maximumSelectionLength > 0) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          MaximumSelectionLength
        );
      }

      if (options.tags) {
        options.dataAdapter = Utils.Decorate(options.dataAdapter, Tags);
      }

      if (options.tokenSeparators != null || options.tokenizer != null) {
        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          Tokenizer
        );
      }

      if (options.query != null) {
        var Query = require(options.amdBase + 'compat/query');

        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          Query
        );
      }

      if (options.initSelection != null) {
        var InitSelection = require(options.amdBase + 'compat/initSelection');

        options.dataAdapter = Utils.Decorate(
          options.dataAdapter,
          InitSelection
        );
      }
    }

    if (options.resultsAdapter == null) {
      options.resultsAdapter = ResultsList;

      if (options.ajax != null) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          InfiniteScroll
        );
      }

      if (options.placeholder != null) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          HidePlaceholder
        );
      }

      if (options.selectOnClose) {
        options.resultsAdapter = Utils.Decorate(
          options.resultsAdapter,
          SelectOnClose
        );
      }
    }

    if (options.dropdownAdapter == null) {
      if (options.multiple) {
        options.dropdownAdapter = Dropdown;
      } else {
        var SearchableDropdown = Utils.Decorate(Dropdown, DropdownSearch);

        options.dropdownAdapter = SearchableDropdown;
      }

      if (options.minimumResultsForSearch !== 0) {
        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          MinimumResultsForSearch
        );
      }

      if (options.closeOnSelect) {
        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          CloseOnSelect
        );
      }

      if (
        options.dropdownCssClass != null ||
        options.dropdownCss != null ||
        options.adaptDropdownCssClass != null
      ) {
        var DropdownCSS = require(options.amdBase + 'compat/dropdownCss');

        options.dropdownAdapter = Utils.Decorate(
          options.dropdownAdapter,
          DropdownCSS
        );
      }

      options.dropdownAdapter = Utils.Decorate(
        options.dropdownAdapter,
        AttachBody
      );
    }

    if (options.selectionAdapter == null) {
      if (options.multiple) {
        options.selectionAdapter = MultipleSelection;
      } else {
        options.selectionAdapter = SingleSelection;
      }

      // Add the placeholder mixin if a placeholder was specified
      if (options.placeholder != null) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          Placeholder
        );
      }

      if (options.allowClear) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          AllowClear
        );
      }

      if (options.multiple) {
        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          SelectionSearch
        );
      }

      if (
        options.containerCssClass != null ||
        options.containerCss != null ||
        options.adaptContainerCssClass != null
      ) {
        var ContainerCSS = require(options.amdBase + 'compat/containerCss');

        options.selectionAdapter = Utils.Decorate(
          options.selectionAdapter,
          ContainerCSS
        );
      }

      options.selectionAdapter = Utils.Decorate(
        options.selectionAdapter,
        EventRelay
      );
    }

    if (typeof options.language === 'string') {
      // Check if the language is specified with a region
      if (options.language.indexOf('-') > 0) {
        // Extract the region information if it is included
        var languageParts = options.language.split('-');
        var baseLanguage = languageParts[0];

        options.language = [options.language, baseLanguage];
      } else {
        options.language = [options.language];
      }
    }

    if ($.isArray(options.language)) {
      var languages = new Translation();
      options.language.push('en');

      var languageNames = options.language;

      for (var l = 0; l < languageNames.length; l++) {
        var name = languageNames[l];
        var language = {};

        try {
          // Try to load it with the original name
          language = Translation.loadPath(name);
        } catch (e) {
          try {
            // If we couldn't load it, check if it wasn't the full path
            name = this.defaults.amdLanguageBase + name;
            language = Translation.loadPath(name);
          } catch (ex) {
            // The translation could not be loaded at all. Sometimes this is
            // because of a configuration problem, other times this can be
            // because of how Select2 helps load all possible translation files.
            if (options.debug && window.console && console.warn) {
              console.warn(
                'Select2: The language file for "' + name + '" could not be ' +
                'automatically loaded. A fallback will be used instead.'
              );
            }

            continue;
          }
        }

        languages.extend(language);
      }

      options.translations = languages;
    } else {
      var baseTranslation = Translation.loadPath(
        this.defaults.amdLanguageBase + 'en'
      );
      var customTranslation = new Translation(options.language);

      customTranslation.extend(baseTranslation);

      options.translations = customTranslation;
    }

    return options;
  };

  Defaults.prototype.reset = function () {
    function stripDiacritics (text) {
      // Used 'uni range + named function' from http://jsperf.com/diacritics/18
      function match(a) {
        return DIACRITICS[a] || a;
      }

      return text.replace(/[^\u0000-\u007E]/g, match);
    }

    function matcher (params, data) {
      // Always return the object if there is nothing to compare
      if ($.trim(params.term) === '') {
        return data;
      }

      // Do a recursive check for options with children
      if (data.children && data.children.length > 0) {
        // Clone the data object if there are children
        // This is required as we modify the object to remove any non-matches
        var match = $.extend(true, {}, data);

        // Check each child of the option
        for (var c = data.children.length - 1; c >= 0; c--) {
          var child = data.children[c];

          var matches = matcher(params, child);

          // If there wasn't a match, remove the object in the array
          if (matches == null) {
            match.children.splice(c, 1);
          }
        }

        // If any children matched, return the new object
        if (match.children.length > 0) {
          return match;
        }

        // If there were no matching children, check just the plain object
        return matcher(params, match);
      }

      var original = stripDiacritics(data.text).toUpperCase();
      var term = stripDiacritics(params.term).toUpperCase();

      // Check if the text contains the term
      if (original.indexOf(term) > -1) {
        return data;
      }

      // If it doesn't contain the term, don't return anything
      return null;
    }

    this.defaults = {
      amdBase: './',
      amdLanguageBase: './i18n/',
      closeOnSelect: true,
      debug: false,
      dropdownAutoWidth: false,
      escapeMarkup: Utils.escapeMarkup,
      language: EnglishTranslation,
      matcher: matcher,
      minimumInputLength: 0,
      maximumInputLength: 0,
      maximumSelectionLength: 0,
      minimumResultsForSearch: 0,
      selectOnClose: false,
      sorter: function (data) {
        return data;
      },
      templateResult: function (result) {
        return result.text;
      },
      templateSelection: function (selection) {
        return selection.text;
      },
      theme: 'default',
      width: 'resolve'
    };
  };

  Defaults.prototype.set = function (key, value) {
    var camelKey = $.camelCase(key);

    var data = {};
    data[camelKey] = value;

    var convertedData = Utils._convertData(data);

    $.extend(this.defaults, convertedData);
  };

  var defaults = new Defaults();

  return defaults;
});

S2.define('select2/options',[
  'require',
  'jquery',
  './defaults',
  './utils'
], function (require, $, Defaults, Utils) {
  function Options (options, $element) {
    this.options = options;

    if ($element != null) {
      this.fromElement($element);
    }

    this.options = Defaults.apply(this.options);

    if ($element && $element.is('input')) {
      var InputCompat = require(this.get('amdBase') + 'compat/inputData');

      this.options.dataAdapter = Utils.Decorate(
        this.options.dataAdapter,
        InputCompat
      );
    }
  }

  Options.prototype.fromElement = function ($e) {
    var excludedData = ['select2'];

    if (this.options.multiple == null) {
      this.options.multiple = $e.prop('multiple');
    }

    if (this.options.disabled == null) {
      this.options.disabled = $e.prop('disabled');
    }

    if (this.options.language == null) {
      if ($e.prop('lang')) {
        this.options.language = $e.prop('lang').toLowerCase();
      } else if ($e.closest('[lang]').prop('lang')) {
        this.options.language = $e.closest('[lang]').prop('lang');
      }
    }

    if (this.options.dir == null) {
      if ($e.prop('dir')) {
        this.options.dir = $e.prop('dir');
      } else if ($e.closest('[dir]').prop('dir')) {
        this.options.dir = $e.closest('[dir]').prop('dir');
      } else {
        this.options.dir = 'ltr';
      }
    }

    $e.prop('disabled', this.options.disabled);
    $e.prop('multiple', this.options.multiple);

    if ($e.data('select2Tags')) {
      if (this.options.debug && window.console && console.warn) {
        console.warn(
          'Select2: The `data-select2-tags` attribute has been changed to ' +
          'use the `data-data` and `data-tags="true"` attributes and will be ' +
          'removed in future versions of Select2.'
        );
      }

      $e.data('data', $e.data('select2Tags'));
      $e.data('tags', true);
    }

    if ($e.data('ajaxUrl')) {
      if (this.options.debug && window.console && console.warn) {
        console.warn(
          'Select2: The `data-ajax-url` attribute has been changed to ' +
          '`data-ajax--url` and support for the old attribute will be removed' +
          ' in future versions of Select2.'
        );
      }

      $e.attr('ajax--url', $e.data('ajaxUrl'));
      $e.data('ajax--url', $e.data('ajaxUrl'));
    }

    var dataset = {};

    // Prefer the element's `dataset` attribute if it exists
    // jQuery 1.x does not correctly handle data attributes with multiple dashes
    if ($.fn.jquery && $.fn.jquery.substr(0, 2) == '1.' && $e[0].dataset) {
      dataset = $.extend(true, {}, $e[0].dataset, $e.data());
    } else {
      dataset = $e.data();
    }

    var data = $.extend(true, {}, dataset);

    data = Utils._convertData(data);

    for (var key in data) {
      if ($.inArray(key, excludedData) > -1) {
        continue;
      }

      if ($.isPlainObject(this.options[key])) {
        $.extend(this.options[key], data[key]);
      } else {
        this.options[key] = data[key];
      }
    }

    return this;
  };

  Options.prototype.get = function (key) {
    return this.options[key];
  };

  Options.prototype.set = function (key, val) {
    this.options[key] = val;
  };

  return Options;
});

S2.define('select2/core',[
  'jquery',
  './options',
  './utils',
  './keys'
], function ($, Options, Utils, KEYS) {
  var Select2 = function ($element, options) {
    if ($element.data('select2') != null) {
      $element.data('select2').destroy();
    }

    this.$element = $element;

    this.id = this._generateId($element);

    options = options || {};

    this.options = new Options(options, $element);

    Select2.__super__.constructor.call(this);

    // Set up the tabindex

    var tabindex = $element.attr('tabindex') || 0;
    $element.data('old-tabindex', tabindex);
    $element.attr('tabindex', '-1');

    // Set up containers and adapters

    var DataAdapter = this.options.get('dataAdapter');
    this.dataAdapter = new DataAdapter($element, this.options);

    var $container = this.render();

    this._placeContainer($container);

    var SelectionAdapter = this.options.get('selectionAdapter');
    this.selection = new SelectionAdapter($element, this.options);
    this.$selection = this.selection.render();

    this.selection.position(this.$selection, $container);

    var DropdownAdapter = this.options.get('dropdownAdapter');
    this.dropdown = new DropdownAdapter($element, this.options);
    this.$dropdown = this.dropdown.render();

    this.dropdown.position(this.$dropdown, $container);

    var ResultsAdapter = this.options.get('resultsAdapter');
    this.results = new ResultsAdapter($element, this.options, this.dataAdapter);
    this.$results = this.results.render();

    this.results.position(this.$results, this.$dropdown);

    // Bind events

    var self = this;

    // Bind the container to all of the adapters
    this._bindAdapters();

    // Register any DOM event handlers
    this._registerDomEvents();

    // Register any internal event handlers
    this._registerDataEvents();
    this._registerSelectionEvents();
    this._registerDropdownEvents();
    this._registerResultsEvents();
    this._registerEvents();

    // Set the initial state
    this.dataAdapter.current(function (initialData) {
      self.trigger('selection:update', {
        data: initialData
      });
    });

    // Hide the original select
    $element.addClass('select2-hidden-accessible');
    $element.attr('aria-hidden', 'true');

    // Synchronize any monitored attributes
    this._syncAttributes();

    $element.data('select2', this);
  };

  Utils.Extend(Select2, Utils.Observable);

  Select2.prototype._generateId = function ($element) {
    var id = '';

    if ($element.attr('id') != null) {
      id = $element.attr('id');
    } else if ($element.attr('name') != null) {
      id = $element.attr('name') + '-' + Utils.generateChars(2);
    } else {
      id = Utils.generateChars(4);
    }

    id = id.replace(/(:|\.|\[|\]|,)/g, '');
    id = 'select2-' + id;

    return id;
  };

  Select2.prototype._placeContainer = function ($container) {
    $container.insertAfter(this.$element);

    var width = this._resolveWidth(this.$element, this.options.get('width'));

    if (width != null) {
      $container.css('width', width);
    }
  };

  Select2.prototype._resolveWidth = function ($element, method) {
    var WIDTH = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;

    if (method == 'resolve') {
      var styleWidth = this._resolveWidth($element, 'style');

      if (styleWidth != null) {
        return styleWidth;
      }

      return this._resolveWidth($element, 'element');
    }

    if (method == 'element') {
      var elementWidth = $element.outerWidth(false);

      if (elementWidth <= 0) {
        return 'auto';
      }

      return elementWidth + 'px';
    }

    if (method == 'style') {
      var style = $element.attr('style');

      if (typeof(style) !== 'string') {
        return null;
      }

      var attrs = style.split(';');

      for (var i = 0, l = attrs.length; i < l; i = i + 1) {
        var attr = attrs[i].replace(/\s/g, '');
        var matches = attr.match(WIDTH);

        if (matches !== null && matches.length >= 1) {
          return matches[1];
        }
      }

      return null;
    }

    return method;
  };

  Select2.prototype._bindAdapters = function () {
    this.dataAdapter.bind(this, this.$container);
    this.selection.bind(this, this.$container);

    this.dropdown.bind(this, this.$container);
    this.results.bind(this, this.$container);
  };

  Select2.prototype._registerDomEvents = function () {
    var self = this;

    this.$element.on('change.select2', function () {
      self.dataAdapter.current(function (data) {
        self.trigger('selection:update', {
          data: data
        });
      });
    });

    this.$element.on('focus.select2', function (evt) {
      self.trigger('focus', evt);
    });

    this._syncA = Utils.bind(this._syncAttributes, this);
    this._syncS = Utils.bind(this._syncSubtree, this);

    if (this.$element[0].attachEvent) {
      this.$element[0].attachEvent('onpropertychange', this._syncA);
    }

    var observer = window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver
    ;

    if (observer != null) {
      this._observer = new observer(function (mutations) {
        $.each(mutations, self._syncA);
        $.each(mutations, self._syncS);
      });
      this._observer.observe(this.$element[0], {
        attributes: true,
        childList: true,
        subtree: false
      });
    } else if (this.$element[0].addEventListener) {
      this.$element[0].addEventListener(
        'DOMAttrModified',
        self._syncA,
        false
      );
      this.$element[0].addEventListener(
        'DOMNodeInserted',
        self._syncS,
        false
      );
      this.$element[0].addEventListener(
        'DOMNodeRemoved',
        self._syncS,
        false
      );
    }
  };

  Select2.prototype._registerDataEvents = function () {
    var self = this;

    this.dataAdapter.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerSelectionEvents = function () {
    var self = this;
    var nonRelayEvents = ['toggle', 'focus'];

    this.selection.on('toggle', function () {
      self.toggleDropdown();
    });

    this.selection.on('focus', function (params) {
      self.focus(params);
    });

    this.selection.on('*', function (name, params) {
      if ($.inArray(name, nonRelayEvents) !== -1) {
        return;
      }

      self.trigger(name, params);
    });
  };

  Select2.prototype._registerDropdownEvents = function () {
    var self = this;

    this.dropdown.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerResultsEvents = function () {
    var self = this;

    this.results.on('*', function (name, params) {
      self.trigger(name, params);
    });
  };

  Select2.prototype._registerEvents = function () {
    var self = this;

    this.on('open', function () {
      self.$container.addClass('select2-container--open');
    });

    this.on('close', function () {
      self.$container.removeClass('select2-container--open');
    });

    this.on('enable', function () {
      self.$container.removeClass('select2-container--disabled');
    });

    this.on('disable', function () {
      self.$container.addClass('select2-container--disabled');
    });

    this.on('blur', function () {
      self.$container.removeClass('select2-container--focus');
    });

    this.on('query', function (params) {
      if (!self.isOpen()) {
        self.trigger('open', {});
      }

      this.dataAdapter.query(params, function (data) {
        self.trigger('results:all', {
          data: data,
          query: params
        });
      });
    });

    this.on('query:append', function (params) {
      this.dataAdapter.query(params, function (data) {
        self.trigger('results:append', {
          data: data,
          query: params
        });
      });
    });

    this.on('keypress', function (evt) {
      var key = evt.which;

      if (self.isOpen()) {
        if (key === KEYS.ESC || key === KEYS.TAB ||
            (key === KEYS.UP && evt.altKey)) {
          self.close();

          evt.preventDefault();
        } else if (key === KEYS.ENTER) {
          self.trigger('results:select', {});

          evt.preventDefault();
        } else if ((key === KEYS.SPACE && evt.ctrlKey)) {
          self.trigger('results:toggle', {});

          evt.preventDefault();
        } else if (key === KEYS.UP) {
          self.trigger('results:previous', {});

          evt.preventDefault();
        } else if (key === KEYS.DOWN) {
          self.trigger('results:next', {});

          evt.preventDefault();
        }
      } else {
        if (key === KEYS.ENTER || key === KEYS.SPACE ||
            (key === KEYS.DOWN && evt.altKey)) {
          self.open();

          evt.preventDefault();
        }
      }
    });
  };

  Select2.prototype._syncAttributes = function () {
    this.options.set('disabled', this.$element.prop('disabled'));

    if (this.options.get('disabled')) {
      if (this.isOpen()) {
        this.close();
      }

      this.trigger('disable', {});
    } else {
      this.trigger('enable', {});
    }
  };

  Select2.prototype._syncSubtree = function (evt, mutations) {
    var changed = false;
    var self = this;

    // Ignore any mutation events raised for elements that aren't options or
    // optgroups. This handles the case when the select element is destroyed
    if (
      evt && evt.target && (
        evt.target.nodeName !== 'OPTION' && evt.target.nodeName !== 'OPTGROUP'
      )
    ) {
      return;
    }

    if (!mutations) {
      // If mutation events aren't supported, then we can only assume that the
      // change affected the selections
      changed = true;
    } else if (mutations.addedNodes && mutations.addedNodes.length > 0) {
      for (var n = 0; n < mutations.addedNodes.length; n++) {
        var node = mutations.addedNodes[n];

        if (node.selected) {
          changed = true;
        }
      }
    } else if (mutations.removedNodes && mutations.removedNodes.length > 0) {
      changed = true;
    }

    // Only re-pull the data if we think there is a change
    if (changed) {
      this.dataAdapter.current(function (currentData) {
        self.trigger('selection:update', {
          data: currentData
        });
      });
    }
  };

  /**
   * Override the trigger method to automatically trigger pre-events when
   * there are events that can be prevented.
   */
  Select2.prototype.trigger = function (name, args) {
    var actualTrigger = Select2.__super__.trigger;
    var preTriggerMap = {
      'open': 'opening',
      'close': 'closing',
      'select': 'selecting',
      'unselect': 'unselecting'
    };

    if (args === undefined) {
      args = {};
    }

    if (name in preTriggerMap) {
      var preTriggerName = preTriggerMap[name];
      var preTriggerArgs = {
        prevented: false,
        name: name,
        args: args
      };

      actualTrigger.call(this, preTriggerName, preTriggerArgs);

      if (preTriggerArgs.prevented) {
        args.prevented = true;

        return;
      }
    }

    actualTrigger.call(this, name, args);
  };

  Select2.prototype.toggleDropdown = function () {
    if (this.options.get('disabled')) {
      return;
    }

    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  };

  Select2.prototype.open = function () {
    if (this.isOpen()) {
      return;
    }

    this.trigger('query', {});
  };

  Select2.prototype.close = function () {
    if (!this.isOpen()) {
      return;
    }

    this.trigger('close', {});
  };

  Select2.prototype.isOpen = function () {
    return this.$container.hasClass('select2-container--open');
  };

  Select2.prototype.hasFocus = function () {
    return this.$container.hasClass('select2-container--focus');
  };

  Select2.prototype.focus = function (data) {
    // No need to re-trigger focus events if we are already focused
    if (this.hasFocus()) {
      return;
    }

    this.$container.addClass('select2-container--focus');
    this.trigger('focus', {});
  };

  Select2.prototype.enable = function (args) {
    if (this.options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `select2("enable")` method has been deprecated and will' +
        ' be removed in later Select2 versions. Use $element.prop("disabled")' +
        ' instead.'
      );
    }

    if (args == null || args.length === 0) {
      args = [true];
    }

    var disabled = !args[0];

    this.$element.prop('disabled', disabled);
  };

  Select2.prototype.data = function () {
    if (this.options.get('debug') &&
        arguments.length > 0 && window.console && console.warn) {
      console.warn(
        'Select2: Data can no longer be set using `select2("data")`. You ' +
        'should consider setting the value instead using `$element.val()`.'
      );
    }

    var data = [];

    this.dataAdapter.current(function (currentData) {
      data = currentData;
    });

    return data;
  };

  Select2.prototype.val = function (args) {
    if (this.options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `select2("val")` method has been deprecated and will be' +
        ' removed in later Select2 versions. Use $element.val() instead.'
      );
    }

    if (args == null || args.length === 0) {
      return this.$element.val();
    }

    var newVal = args[0];

    if ($.isArray(newVal)) {
      newVal = $.map(newVal, function (obj) {
        return obj.toString();
      });
    }

    this.$element.val(newVal).trigger('change');
  };

  Select2.prototype.destroy = function () {
    this.$container.remove();

    if (this.$element[0].detachEvent) {
      this.$element[0].detachEvent('onpropertychange', this._syncA);
    }

    if (this._observer != null) {
      this._observer.disconnect();
      this._observer = null;
    } else if (this.$element[0].removeEventListener) {
      this.$element[0]
        .removeEventListener('DOMAttrModified', this._syncA, false);
      this.$element[0]
        .removeEventListener('DOMNodeInserted', this._syncS, false);
      this.$element[0]
        .removeEventListener('DOMNodeRemoved', this._syncS, false);
    }

    this._syncA = null;
    this._syncS = null;

    this.$element.off('.select2');
    this.$element.attr('tabindex', this.$element.data('old-tabindex'));

    this.$element.removeClass('select2-hidden-accessible');
    this.$element.attr('aria-hidden', 'false');
    this.$element.removeData('select2');

    this.dataAdapter.destroy();
    this.selection.destroy();
    this.dropdown.destroy();
    this.results.destroy();

    this.dataAdapter = null;
    this.selection = null;
    this.dropdown = null;
    this.results = null;
  };

  Select2.prototype.render = function () {
    var $container = $(
      '<span class="select2 select2-container">' +
        '<span class="selection"></span>' +
        '<span class="dropdown-wrapper" aria-hidden="true"></span>' +
      '</span>'
    );

    $container.attr('dir', this.options.get('dir'));

    this.$container = $container;

    this.$container.addClass('select2-container--' + this.options.get('theme'));

    $container.data('element', this.$element);

    return $container;
  };

  return Select2;
});

S2.define('select2/compat/utils',[
  'jquery'
], function ($) {
  function syncCssClasses ($dest, $src, adapter) {
    var classes, replacements = [], adapted;

    classes = $.trim($dest.attr('class'));

    if (classes) {
      classes = '' + classes; // for IE which returns object

      $(classes.split(/\s+/)).each(function () {
        // Save all Select2 classes
        if (this.indexOf('select2-') === 0) {
          replacements.push(this);
        }
      });
    }

    classes = $.trim($src.attr('class'));

    if (classes) {
      classes = '' + classes; // for IE which returns object

      $(classes.split(/\s+/)).each(function () {
        // Only adapt non-Select2 classes
        if (this.indexOf('select2-') !== 0) {
          adapted = adapter(this);

          if (adapted != null) {
            replacements.push(adapted);
          }
        }
      });
    }

    $dest.attr('class', replacements.join(' '));
  }

  return {
    syncCssClasses: syncCssClasses
  };
});

S2.define('select2/compat/containerCss',[
  'jquery',
  './utils'
], function ($, CompatUtils) {
  // No-op CSS adapter that discards all classes by default
  function _containerAdapter (clazz) {
    return null;
  }

  function ContainerCSS () { }

  ContainerCSS.prototype.render = function (decorated) {
    var $container = decorated.call(this);

    var containerCssClass = this.options.get('containerCssClass') || '';

    if ($.isFunction(containerCssClass)) {
      containerCssClass = containerCssClass(this.$element);
    }

    var containerCssAdapter = this.options.get('adaptContainerCssClass');
    containerCssAdapter = containerCssAdapter || _containerAdapter;

    if (containerCssClass.indexOf(':all:') !== -1) {
      containerCssClass = containerCssClass.replace(':all:', '');

      var _cssAdapter = containerCssAdapter;

      containerCssAdapter = function (clazz) {
        var adapted = _cssAdapter(clazz);

        if (adapted != null) {
          // Append the old one along with the adapted one
          return adapted + ' ' + clazz;
        }

        return clazz;
      };
    }

    var containerCss = this.options.get('containerCss') || {};

    if ($.isFunction(containerCss)) {
      containerCss = containerCss(this.$element);
    }

    CompatUtils.syncCssClasses($container, this.$element, containerCssAdapter);

    $container.css(containerCss);
    $container.addClass(containerCssClass);

    return $container;
  };

  return ContainerCSS;
});

S2.define('select2/compat/dropdownCss',[
  'jquery',
  './utils'
], function ($, CompatUtils) {
  // No-op CSS adapter that discards all classes by default
  function _dropdownAdapter (clazz) {
    return null;
  }

  function DropdownCSS () { }

  DropdownCSS.prototype.render = function (decorated) {
    var $dropdown = decorated.call(this);

    var dropdownCssClass = this.options.get('dropdownCssClass') || '';

    if ($.isFunction(dropdownCssClass)) {
      dropdownCssClass = dropdownCssClass(this.$element);
    }

    var dropdownCssAdapter = this.options.get('adaptDropdownCssClass');
    dropdownCssAdapter = dropdownCssAdapter || _dropdownAdapter;

    if (dropdownCssClass.indexOf(':all:') !== -1) {
      dropdownCssClass = dropdownCssClass.replace(':all:', '');

      var _cssAdapter = dropdownCssAdapter;

      dropdownCssAdapter = function (clazz) {
        var adapted = _cssAdapter(clazz);

        if (adapted != null) {
          // Append the old one along with the adapted one
          return adapted + ' ' + clazz;
        }

        return clazz;
      };
    }

    var dropdownCss = this.options.get('dropdownCss') || {};

    if ($.isFunction(dropdownCss)) {
      dropdownCss = dropdownCss(this.$element);
    }

    CompatUtils.syncCssClasses($dropdown, this.$element, dropdownCssAdapter);

    $dropdown.css(dropdownCss);
    $dropdown.addClass(dropdownCssClass);

    return $dropdown;
  };

  return DropdownCSS;
});

S2.define('select2/compat/initSelection',[
  'jquery'
], function ($) {
  function InitSelection (decorated, $element, options) {
    if (options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `initSelection` option has been deprecated in favor' +
        ' of a custom data adapter that overrides the `current` method. ' +
        'This method is now called multiple times instead of a single ' +
        'time when the instance is initialized. Support will be removed ' +
        'for the `initSelection` option in future versions of Select2'
      );
    }

    this.initSelection = options.get('initSelection');
    this._isInitialized = false;

    decorated.call(this, $element, options);
  }

  InitSelection.prototype.current = function (decorated, callback) {
    var self = this;

    if (this._isInitialized) {
      decorated.call(this, callback);

      return;
    }

    this.initSelection.call(null, this.$element, function (data) {
      self._isInitialized = true;

      if (!$.isArray(data)) {
        data = [data];
      }

      callback(data);
    });
  };

  return InitSelection;
});

S2.define('select2/compat/inputData',[
  'jquery'
], function ($) {
  function InputData (decorated, $element, options) {
    this._currentData = [];
    this._valueSeparator = options.get('valueSeparator') || ',';

    if ($element.prop('type') === 'hidden') {
      if (options.get('debug') && console && console.warn) {
        console.warn(
          'Select2: Using a hidden input with Select2 is no longer ' +
          'supported and may stop working in the future. It is recommended ' +
          'to use a `<select>` element instead.'
        );
      }
    }

    decorated.call(this, $element, options);
  }

  InputData.prototype.current = function (_, callback) {
    function getSelected (data, selectedIds) {
      var selected = [];

      if (data.selected || $.inArray(data.id, selectedIds) !== -1) {
        data.selected = true;
        selected.push(data);
      } else {
        data.selected = false;
      }

      if (data.children) {
        selected.push.apply(selected, getSelected(data.children, selectedIds));
      }

      return selected;
    }

    var selected = [];

    for (var d = 0; d < this._currentData.length; d++) {
      var data = this._currentData[d];

      selected.push.apply(
        selected,
        getSelected(
          data,
          this.$element.val().split(
            this._valueSeparator
          )
        )
      );
    }

    callback(selected);
  };

  InputData.prototype.select = function (_, data) {
    if (!this.options.get('multiple')) {
      this.current(function (allData) {
        $.map(allData, function (data) {
          data.selected = false;
        });
      });

      this.$element.val(data.id);
      this.$element.trigger('change');
    } else {
      var value = this.$element.val();
      value += this._valueSeparator + data.id;

      this.$element.val(value);
      this.$element.trigger('change');
    }
  };

  InputData.prototype.unselect = function (_, data) {
    var self = this;

    data.selected = false;

    this.current(function (allData) {
      var values = [];

      for (var d = 0; d < allData.length; d++) {
        var item = allData[d];

        if (data.id == item.id) {
          continue;
        }

        values.push(item.id);
      }

      self.$element.val(values.join(self._valueSeparator));
      self.$element.trigger('change');
    });
  };

  InputData.prototype.query = function (_, params, callback) {
    var results = [];

    for (var d = 0; d < this._currentData.length; d++) {
      var data = this._currentData[d];

      var matches = this.matches(params, data);

      if (matches !== null) {
        results.push(matches);
      }
    }

    callback({
      results: results
    });
  };

  InputData.prototype.addOptions = function (_, $options) {
    var options = $.map($options, function ($option) {
      return $.data($option[0], 'data');
    });

    this._currentData.push.apply(this._currentData, options);
  };

  return InputData;
});

S2.define('select2/compat/matcher',[
  'jquery'
], function ($) {
  function oldMatcher (matcher) {
    function wrappedMatcher (params, data) {
      var match = $.extend(true, {}, data);

      if (params.term == null || $.trim(params.term) === '') {
        return match;
      }

      if (data.children) {
        for (var c = data.children.length - 1; c >= 0; c--) {
          var child = data.children[c];

          // Check if the child object matches
          // The old matcher returned a boolean true or false
          var doesMatch = matcher(params.term, child.text, child);

          // If the child didn't match, pop it off
          if (!doesMatch) {
            match.children.splice(c, 1);
          }
        }

        if (match.children.length > 0) {
          return match;
        }
      }

      if (matcher(params.term, data.text, data)) {
        return match;
      }

      return null;
    }

    return wrappedMatcher;
  }

  return oldMatcher;
});

S2.define('select2/compat/query',[

], function () {
  function Query (decorated, $element, options) {
    if (options.get('debug') && window.console && console.warn) {
      console.warn(
        'Select2: The `query` option has been deprecated in favor of a ' +
        'custom data adapter that overrides the `query` method. Support ' +
        'will be removed for the `query` option in future versions of ' +
        'Select2.'
      );
    }

    decorated.call(this, $element, options);
  }

  Query.prototype.query = function (_, params, callback) {
    params.callback = callback;

    var query = this.options.get('query');

    query.call(null, params);
  };

  return Query;
});

S2.define('select2/dropdown/attachContainer',[

], function () {
  function AttachContainer (decorated, $element, options) {
    decorated.call(this, $element, options);
  }

  AttachContainer.prototype.position =
    function (decorated, $dropdown, $container) {
    var $dropdownContainer = $container.find('.dropdown-wrapper');
    $dropdownContainer.append($dropdown);

    $dropdown.addClass('select2-dropdown--below');
    $container.addClass('select2-container--below');
  };

  return AttachContainer;
});

S2.define('select2/dropdown/stopPropagation',[

], function () {
  function StopPropagation () { }

  StopPropagation.prototype.bind = function (decorated, container, $container) {
    decorated.call(this, container, $container);

    var stoppedEvents = [
    'blur',
    'change',
    'click',
    'dblclick',
    'focus',
    'focusin',
    'focusout',
    'input',
    'keydown',
    'keyup',
    'keypress',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseover',
    'mouseup',
    'search',
    'touchend',
    'touchstart'
    ];

    this.$dropdown.on(stoppedEvents.join(' '), function (evt) {
      evt.stopPropagation();
    });
  };

  return StopPropagation;
});

S2.define('select2/selection/stopPropagation',[

], function () {
  function StopPropagation () { }

  StopPropagation.prototype.bind = function (decorated, container, $container) {
    decorated.call(this, container, $container);

    var stoppedEvents = [
      'blur',
      'change',
      'click',
      'dblclick',
      'focus',
      'focusin',
      'focusout',
      'input',
      'keydown',
      'keyup',
      'keypress',
      'mousedown',
      'mouseenter',
      'mouseleave',
      'mousemove',
      'mouseover',
      'mouseup',
      'search',
      'touchend',
      'touchstart'
    ];

    this.$selection.on(stoppedEvents.join(' '), function (evt) {
      evt.stopPropagation();
    });
  };

  return StopPropagation;
});

/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    if ( typeof S2.define === 'function' && S2.define.amd ) {
        // AMD. Register as an anonymous module.
        S2.define('jquery-mousewheel',['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

S2.define('jquery.select2',[
  'jquery',
  'jquery-mousewheel',

  './select2/core',
  './select2/defaults'
], function ($, _, Select2, Defaults) {
  if ($.fn.select2 == null) {
    // All methods that should return the element
    var thisMethods = ['open', 'close', 'destroy'];

    $.fn.select2 = function (options) {
      options = options || {};

      if (typeof options === 'object') {
        this.each(function () {
          var instanceOptions = $.extend(true, {}, options);

          var instance = new Select2($(this), instanceOptions);
        });

        return this;
      } else if (typeof options === 'string') {
        var ret;
        var args = Array.prototype.slice.call(arguments, 1);

        this.each(function () {
          var instance = $(this).data('select2');

          if (instance == null && window.console && console.error) {
            console.error(
              'The select2(\'' + options + '\') method was called on an ' +
              'element that is not using Select2.'
            );
          }

          ret = instance[options].apply(instance, args);
        });

        // Check if we should be returning `this`
        if ($.inArray(options, thisMethods) > -1) {
          return this;
        }

        return ret;
      } else {
        throw new Error('Invalid arguments for Select2: ' + options);
      }
    };
  }

  if ($.fn.select2.defaults == null) {
    $.fn.select2.defaults = Defaults;
  }

  return Select2;
});

  // Return the AMD loader configuration so it can be used outside of this file
  return {
    define: S2.define,
    require: S2.require
  };
}());

  // Autoload the jQuery bindings
  // We know that all of the modules exist above this, so we're safe
  var select2 = S2.require('jquery.select2');

  // Hold the AMD module references on the jQuery function that was just loaded
  // This allows Select2 to use the internal loader outside of this file, such
  // as in the language files.
  jQuery.fn.select2.amd = S2;

  // Return the Select2 instance for anyone who is importing it.
  return select2;
}));
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//


;
/* ========================================================================
 * Bootstrap: affix.js v3.2.0
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */



+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.2.0'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.2.0
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.2.0'

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.2.0
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.2.0'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    $el[val](data[state] == null ? this.options[state] : data[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.2.0
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.2.0'

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.keydown = function (e) {
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.2.0
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.2.0'

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      Plugin.call(actives, 'hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var href
    var $this   = $(this)
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.2.0
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.2.0'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.trigger('focus')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.2.0
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.VERSION = '3.2.0'

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.2.0
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.2.0
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this)

    this.$body          = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.2.0'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset'
    var offsetBase   = 0

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()

    var self     = this

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.2.0
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.2.0'

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.$body.addClass('modal-open')

    this.setScrollbar()
    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.$body.removeClass('modal-open')

    this.resetScrollbar()
    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(150) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  Modal.prototype.checkScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) return
    this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.2.0
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.2.0'

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = this.$element.parent()
        var parentDim    = this.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    this.$element.removeAttr('aria-describedby')

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.2.0
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.2.0'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').empty()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//









;
