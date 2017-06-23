(function($) {

  function Ufus() {
    this._api = '/v1/shorten/'
    this._form = '#ufus'
    this._error = 'Oops! You are trying to do something useful.'
  }

  Ufus.prototype = {
    main: function() {
      this._input = $(this._form).find('input')

      if (!this.validate(this._input.val())) {
        return this.notify(this._error, true)
      }

      this.request(this._input.val())
    },
    validate: function(url) {
      var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/

      return regexp.test(url)
    },
    notify: function(message, error) {
      var m = error === true ? 'alert' : 'success'

      $('.callout').hide()
      $('<div class="callout '
        + m
        + '" data-closable>'
        + '<button class=close-button aria-label="Dismiss alert" type=button data-close><span aria-hidden=true>&times;</span></button>'
        + message
        + '</div>').insertBefore(this._form)
    },
    request: function(url) {
      var _this = this

      $.post(_this._api, {
        long_url: url
      }, function(data) {
        if (data.hasOwnProperty('status') && parseInt(data.status) === 200) {
          _this._input.val(data.short_url).select()
          return _this.notify('Copy your shortened url.')
        } else {
          _this._error = data.statusText
        }

        return _this.notify(_this._error, true)
      })
      .error(function() { return _this.notify(_this._error, true) })
    }
  }

  $(function() {
    var ufus = new Ufus()
    var clipboard = new Clipboard('.btn')

    $(ufus._form).on('submit', function(e) {
      e && e.preventDefault()
      ufus.main()

      clipboard.on('success', function(e) {
        ufus.notify('copied!')
      })

      clipboard.on('error', function(e) {
        ufus.notify('Oops! Catastrophic Failure while shortening link.', true)
      })
    })

  })

})(window.jQuery)