const VIEW = []
const CART = [];

(function () {
  const data = window.performance.getEntries()
  const url = data[0].name

  if (url.includes('?utm_source')) {
    const str = url.split('?')
    const params = 'menu/?' + str[1]

    window.history.replaceState({}, '', params)
  }
})();

(function () {
  try {
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
          const str = window.localStorage.getItem('info')
          const info = JSON.parse(str)
          const marca = info.network[0].networkName
          const stores = info.stores

          if ((xhr.url.indexOf('details') !== -1) && (xhr.url.indexOf('store') !== -1)) {
            const eventLabel = (xhr.url.indexOf('widget=') !== -1) ? '' : xhr.responseText
            const obj = JSON.parse(eventLabel)
            const url = new URL(xhr.url)

            let storeName
            stores.forEach(store => {
              if (store.storeID === url.searchParams.get('store')) {
                storeName = store.storeName
              }
            })

            customTitle('Produto')

            const ecommerce = {
              currency: 'BRL',
              items: [{
                item_id: obj._id,
                item_name: obj.printDescription,
                coupon: '',
                discount: obj.price.discount || 0,
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
              ecommerce: ecommerce
            })

            VIEW.push(ecommerce.items[0])
          }

          if ((xhr.url === 'https://api.accon.app/v1/order') && (xhr.method === 'POST') && (xhr.status === 201)) {
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
                quantity: item.quantity
              }
              return product
            })

            customTitle('Pedido')

            const ecommerce = {
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
              ecommerce: ecommerce
            })
          }
        }
        clearInterval(intervalId)
      }, 1)
      return xhrSend.apply(this, [].slice.call(arguments))
    }
  } catch (e) {
    console.error(e.mesage)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if ((clickedElement.tagName === 'ION-BUTTON') && (clickedElement.textContent.includes('Adicionar R$ '))) {
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
            const itemView = VIEW[VIEW.length - 1]

            const view = {}
            view.affiliation = (itemCart.id === itemView.item_id) ? itemView.affiliation : 'N/D'
            view.item_brand = (itemCart.id === itemView.item_id) ? itemView.item_brand : 'N/D'
            view.item_category = (itemCart.id === itemView.item_id) ? itemView.item_category : 'N/D'
            view.item_variant = (itemCart.modifiers.length === 0) ? itemView.item_variant : itemCart.modifiers

            customTitle('Menu')

            const ecommerce = {
              currency: 'BRL',
              items: [{
                item_id: itemCart.id,
                item_name: itemCart.name,
                affiliation: view.affiliation,
                item_brand: view.item_brand,
                item_category: view.item_category,
                item_variant: view.item_variant,
                price: itemCart.total,
                currency: 'BRL',
                quantity: itemCart.quantity
              }],
              value: itemCart.total
            }

            dataLayer.push({
              event: 'add_to_cart',
              ecommerce: ecommerce
            })

            CART.push(ecommerce.items[0])
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
  } catch (e) {
    console.error(e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if (((clickedElement.tagName === 'DIV') || (clickedElement.tagName === 'P')) && (clickedElement.textContent.includes('Ver itens'))) {
        const total = CART.reduce((total, item) => {
          return total + item.price
        }, 0)

        customTitle('Carrinho')

        dataLayer.push({
          event: 'begin_checkout',
          ecommerce: {
            currency: 'BRL',
            items: CART,
            value: total
          }
        })
      }
    })
  } catch (e) {
    console.error(e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clieckedElement = event.target
      if ((clieckedElement.tagName === 'ION-BUTTON') && (clieckedElement.textContent === 'Selecionar')) {
        setTimeout(() => {
          const data = window.localStorage.getItem('payment')
          const payment = JSON.parse(data)
          const type = payment ? payment.selectedPayment.name : 'N/D'
          const total = CART.reduce((total, item) => {
            return total + item.price
          }, 0)

          customTitle('Carrinho')

          dataLayer.push({
            event: 'add_payment_info',
            ecommerce: {
              currency: 'BRL',
              items: CART,
              payment_type: type,
              value: total
            }
          })
        }, 1000)
      }
    })
  } catch (e) {
    console.error(e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if ((clickedElement.tagName === 'ION-BUTTON') && ((clickedElement.textContent === 'Salvar') || (clickedElement.textContent === 'Continuar'))) {
        const total = CART.reduce((total, item) => {
          return total + item.price
        }, 0)

        customTitle('Carrinho')

        const ecommerce = {
          currency: 'BRL',
          items: CART,
          shipping_tier: 'Entrega/Retirada',
          value: total
        }

        dataLayer.push({
          event: 'add_shipping_info',
          ecommerce: ecommerce
        })
      }
    })
  } catch (e) {
    console.error(e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if ((clickedElement.tagName === 'SPAN') && (clickedElement.textContent === 'Remover')) {
        const element = document.getElementsByClassName('alert-message sc-ion-alert-ios')
        const str = element[0].innerText
        const name = str.substring(3, str.length)

        CART.forEach((item, index) => {
          if (item.item_name === name) {
            customTitle('Carrinho')

            const ecommerce = {
              currency: 'BRL',
              items: item,
              value: item.price
            }

            dataLayer.push({
              event: 'remove_from_cart',
              ecommerce: ecommerce
            })

            CART.splice(index, 1)
          }
        })
      }
    })
  } catch (e) {
    console.error(e.message)
  }
})();

(function () {
  try {
    customTitle('Menu')

    dataLayer.push({
      event: 'page_view'
    })
  } catch (e) {
    console.error(e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if ((clickedElement.tagName === 'ION-BUTTON') && (clickedElement.innerText === 'Enviar')) {
        customTitle('Login')

        dataLayer.push({
          event: 'login',
          method: 'Password'
        })
      }
    })
  } catch (e) {
    console.error(e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if ((clickedElement.tagName === 'ION-BUTTON') && (clickedElement.textContent === ' Cadastrar')) {
        customTitle('SiginUp')

        dataLayer.push({
          event: 'sign_up',
          method: 'Password'
        })
      }
    })
  } catch (e) {
    console.error(e.message)
  }
})()

function customTitle(titleName) {
  const title = document.title
  if (title.includes('|')) {
    const str = title.split('|')
    window.document.title = str[0] + ' | ' + titleName
  } else {
    document.title = title + ' | ' + titleName
  }
}
