const VIEW = []

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
            event: 'view_item',
            data: data
          })

          VIEW.push(data)
        }

        if ((xhr.url === 'https://api.accon.app/v1/order') && (xhr.method === 'POST')) {
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
            event: 'purchase',
            data: data
          })
        }
      }
      clearInterval(intervalId)
    }, 1)
    return xhrSend.apply(this, [].slice.call(arguments))
  }
})()

(function () {
  const btn = document.getElementsByClassName('ion-page')
  btn[0].addEventListener('click', event => {
    const clickedElement = event.target
    if ((clickedElement.tagName === 'ION-BUTTON') && (clickedElement.textContent.includes('Adicionar R$ '))) {
      // console.log(clickedElement.tagName)
      const DB_NAME = '_ionicstorage'
      const DB_STORE = '_ionickv'
      const DB_VERSION = 2

      const openRequest = window.indexedDB.open(DB_NAME, DB_VERSION)

      openRequest.onsuccess = function () {
        const DB = openRequest.result
        const transaction = DB.transaction(DB_STORE)
        const store = transaction.objectStore(DB_STORE)
        const query = store.get('cart')

        query.onsuccess = function () {
          const cart = query.result
          const itemCart = cart[cart.length - 1]
          const itemView = VIEW[VIEW.length - 1].items[0]

          const view = {}
          view.affiliation = (itemCart.id === itemView.item_id) ? itemView.affiliation : 'N/D'
          view.item_brand = (itemCart.id === itemView.item_id) ? itemView.item_brand : 'N/D'
          view.item_category = (itemCart.id === itemView.item_id) ? itemView.item_category : 'N/D'

          const data = {
            currency: 'BRL',
            items: [{
              item_id: itemCart.id,
              item_name: itemCart.name,
              affiliation: view.affiliation,
              item_brand: view.item_brand,
              item_category: view.item_category,
              item_variant: itemCart.modifiers,
              price: itemCart.total,
              currency: 'BRL',
              quantity: itemCart.quantity
            }],
            value: itemCart.total
          }

          dataLayer.push({
            event: 'add_to_cart',
            data: data
          })
        }

        query.onerror = function () {
          console.log('Error: ', query.error)
        }
      }

      openRequest.onerror = function () {
        console.log('Error: ', openRequest.error)
      }
    }
  })
})()
