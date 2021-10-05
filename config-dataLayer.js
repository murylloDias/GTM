(function () {
  const xhrOpen = window.XMLHttpRequest.prototype.open
  const xhrSend = window.XMLHttpRequest.prototype.send
  window.XMLHttpRequest.prototype.open = function () {
    this.method = arguments[0]
    this.url = arguments[1]
    return xhrOpen.apply(this, [].slice.call(arguments))
  }
  window.XMLHttpRequest.prototype.send = function () {
    const xhr = this
    const xhrData = arguments[0]
    const intervalId = window.setInterval(function () {
      if (xhr.readyState !== 4) {
        return
      }
      const inExcludeList = window.ajrS && window.ajrS.length > 0 ? window.ajrS.filter(e => xhr.url.startsWith(e.url)).length > 0 : false
      if (!inExcludeList) {
        if ((xhr.url.indexOf('details') !== -1) && (xhr.url.indexOf('store') !== -1)) {
          const eventLabel = (xhr.url.indexOf('widget=') !== -1) ? '' : xhr.responseText
          const obj = JSON.parse(eventLabel)
          const url = new URL(xhr.url)

          obj.store = {
            id: url.searchParams.get('store'),
            name: ''
          }

          if (obj.price.originalPrice > 0) {
            obj.price.discount = obj.price.originalPrice - obj.price.actualPrice
          } else {
            obj.price.discount = 0
            obj.price.originalPrice = obj.price.actualPrice
          }
          obj.brand = 'Accon'
          dataLayer.push({
            event: 'view',
            data: JSON.stringify(obj)
          })
        }

        if (xhr.url === 'https://api.accon.app/v1/order') {
          const eventLabel = (xhr.url.indexOf('widget=') !== -1) ? '' : xhr.responseText
          dataLayer.push({
            event: 'order',
            data: eventLabel
          })
        }
      }
      clearInterval(intervalId)
    }, 1)
    return xhrSend.apply(this, [].slice.call(arguments))
  }
})()

const VIEW = []
const CART = []
const ORDER = []
