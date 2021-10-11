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
        const info = window.localStorage.getItem('info')
        const network = JSON.parse(info)
        const marca = network.name
        const stores = network.stores

        if ((xhr.url.indexOf('details') !== -1) && (xhr.url.indexOf('store') !== -1)) {
          const eventLabel = (xhr.url.indexOf('widget=') !== -1) ? '' : xhr.responseText
          const obj = JSON.parse(eventLabel)
          const url = new URL(xhr.url)

          let storeName
          stores.forEach(store => {
            if (store.id === url.searchParams.get('store')) {
              storeName = store.name
            }
          })

          const data = {
            currency: 'BRL',
            items: [{
              item_id: obj._id,
              item_name: obj.printDescription,
              coupon: '',
              discount: obj.price.discount,
              affiliation: storeName,
              item_brand: marca,
              item_category: obj.group,
              item_variant: obj.details,
              price: obj.price.originalPrice === 0 ? obj.price.actualPrice : obj.price.originalPrice,
              currency: 'BRL',
              index: obj.order,
              quantity: 1
            }],
            value: obj.price.actualPrice
          }

          dataLayer.push({
            event: 'view',
            data: data
          })
        }

        if (xhr.url === 'https://api.accon.app/v1/order') {
          const eventLabel = (xhr.url.indexOf('widget=') !== -1) ? '' : xhr.responseText
          const obj = JSON.parse(eventLabel)

          const cupom = obj.voucher ? obj.voucher.name : ''

          const items = obj.products.map(item => {
            const product = {
              item_id: item.id,
              item_name: item.name,
              coupon: cupom,
              affiliation: obj.store.name,
              item_brand: marca,
              price: item.total,
              currency: 'BRL',
              quantity: 1
            }
            return product
          })

          const data = {
            affiliation: obj.store.name,
            coupon: cupom,
            currency: 'BRL',
            items: items,
            transaction_id: obj._id,
            shipping: obj.deliveryTax,
            value: obj.total,
            tax: 0
          }

          dataLayer.push({
            event: 'order',
            data: data
          })
        }
      }
      clearInterval(intervalId)
    }, 1)
    return xhrSend.apply(this, [].slice.call(arguments))
  }
})()
