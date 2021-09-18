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
        const stores = [
          { id: '5d56f2cbc1a5e60034475656', name: 'Accon Curitiba' },
          { id: '5ec05c59d453ab004c08f1e7', name: 'Accon Delivery' },
          { id: '5ecedd46fd8511004c4f5c24', name: 'Accon Nordeste' },
          { id: '5d42e2a29ba6160034605f01', name: 'Accon Porto Alegre' },
          { id: '5ec818bee2b733004c82e547', name: 'Accon Rio de Janeiro' },
          { id: '5d0a82535a1cf10033cb0969', name: 'Accon São Paulo' }
        ]

        if ((xhr.url.indexOf('details') !== -1) && (xhr.url.indexOf('store'))) {
          const eventLabel = (xhr.url.indexOf('widget=') !== -1) ? '' : xhr.responseText
          const obj = JSON.parse(eventLabel)

          const url = new URL(xhr.url)
          stores.forEach(store => {
            if (store.id === url.searchParams.get('store')) {
              obj.store = {
                id: store.id,
                name: store.name
              }
            }
          })

          if (obj.price.originalPrice > 0) {
            obj.price.discount = obj.price.originalPrice - obj.price.actualPrice
          } else {
            obj.price.discount = 0
            obj.price.originalPrice = obj.price.actualPrice
          }

          obj.brand = 'Accon'

          dataLayer.push({ ecommerce: null })
          dataLayer.push({
            event: 'view_item',
            ecommerce: {
              currency: 'BRL',
              value: obj.price.actualPrice,
              items: [{
                item_id: obj._id,
                item_name: obj.printDescription,
                affiliation: obj.store.name,
                currency: 'BRL',
                discount: obj.price.discount,
                index: obj.order,
                item_brand: obj.brand,
                item_category: obj.group,
                item_variant: obj.details,
                price: obj.price.originalPrice,
                quantity: 1
              }]
            }
          })
        }
      }
      clearInterval(intervalId)
    }, 1)
    return xhrSend.apply(this, [].slice.call(arguments))
  }
  const originalFetch = window.fetch

  function onFetchStart () {
    if (arguments && arguments.length > 0) {
      const inExcludeList = window.ajrS && window.ajrS.length > 0 ? window.ajrS.filter(e => arguments[0].startsWith(e.url)).length > 0 : false
      dataLayer.push({
        event: 'ajaxSuccess',
        ajaxInfo: {
          ajaxEventMethod: arguments?.length > 1 ? arguments[1]?.method : 'get',
          ajaxEventUrl: arguments[0],
          ajaxPostData: arguments?.length > 1 ? arguments[1]?.body : '',
          ajaxEventLabel: ''
        }
      })
    }
  }

  function onFetchStop () {
    // console.log("fetch has loaded response", arguments)
  }
  window.fetch = function () {
    onFetchStart.apply(null, arguments)
    return originalFetch.apply(this, arguments).then(function (response) {
      onFetchStop.call(null, response)
      return response
    })
  }
})()
