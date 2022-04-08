const VIEW = []
const CART = []
const USER = {};

(function () {
  try {
    const data = window.performance.getEntries()
    const url = data[0].name

    if (url.includes('?utm_source')) {
      const str = url.split('?')
      const params = 'menu/?' + str[1]

      window.history.replaceState({}, '', params)
    }
  } catch (e) {
    setEventException('custom_url', e.message)
  }
})();

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
    const intervalId = window.setInterval(function () {
      if (xhr.readyState !== 4) {
        return
      }

      if ((xhr.url.indexOf('details') !== -1) && (xhr.url.indexOf('store') !== -1)) {
        try {
          const eventLabel = (xhr.url.indexOf('widget=') !== -1) ? '' : xhr.responseText
          const obj = JSON.parse(eventLabel)
          const url = new URL(xhr.url)

          const marca = GetInfoLocalstorage('marca')
          const stores = GetInfoLocalstorage('store')

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
            value: obj.price.actualPrice,
            contents: [{
              id: obj._id,
              quantity: 1
            }]
          }

          dataLayer.push({
            event: 'view_item',
            ecommerce: ecommerce,
            user: USER
          })

          VIEW.push(ecommerce.items[0])
        } catch (e) {
          setEventException('view_item', e.message)
        }
      }
      clearInterval(intervalId)
    }, 1)
    return xhrSend.apply(this, [].slice.call(arguments))
  }
})();

(function () {
  const btn = document.getElementsByClassName('ion-page')
  btn[0].addEventListener('click', event => {
    const clickedElement = event.target
    if ((clickedElement.tagName === 'ION-BUTTON') && (clickedElement.textContent === 'Fazer pedido')) {
      setTimeout(() => {
        const DB_NAME = '_ionicstorage'
        const DB_STORE = '_ionickv'
        const DB_VERSION = 2

        const openRequest = window.indexedDB.open(DB_NAME, DB_VERSION)

        openRequest.onsuccess = function () {
          const DB = openRequest.result
          const transaction = DB.transaction(DB_STORE)
          const store = transaction.objectStore(DB_STORE)
          const query = store.get('orders')

          query.onsuccess = function () {
            const orders = query.result
            const order = orders[orders.length - 1]

            const str = order.status[0].date
            const date = new Date(str)

            const dateNow = new Date()

            //if ((dateNow.getTime() - date.getTime()) < 10000) {
            const items = order.products.map(item => {
              const product = {
                item_id: item.id,
                item_name: item.name,
                item_category: getCategoryName(item.id),
                price: item.total,
                quantity: item.quantity
              }
              return product
            })

            const cupom = order.voucher ? order.voucher.name : ''

            dataLayer.push({
              event: 'purchase',
              ecommerce: {
                affiliation: order.store.name,
                coupon: cupom,
                currency: 'BRL',
                items: items,
                transaction_id: order._id,
                shipping: order.deliveryTax,
                tax: 0
              }
            })
            //}
          }

          query.onerror = function () {
            setEventException('purchase', query.error)
          }
        }

        openRequest.onerror = function () {
          setEventException('purchase', openRequest.error)
        }
      }, 5000)
    }
  })
})();

(function () {
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
            value: itemCart.total,
            contents: [{
              id: itemCart.id,
              quantity: itemCart.quantity
            }]
          }

          dataLayer.push({
            event: 'add_to_cart',
            ecommerce: ecommerce,
            user: USER
          })

          CART.push(ecommerce.items[0])
        }

        query.onerror = function () {
          setEventException('add_to_cart', query.error)
        }
      }

      openRequest.onerror = function () {
        setEventException('add_to_cart', openRequest.error)
      }
    }
  })
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

        const contents = getContents()

        dataLayer.push({
          event: 'begin_checkout',
          ecommerce: {
            currency: 'BRL',
            items: CART,
            value: total,
            contents: contents
          },
          user: USER
        })
      }
    })
  } catch (e) {
    setEventException('begin_checkout', e.message)
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

          const contents = getContents()

          dataLayer.push({
            event: 'add_payment_info',
            ecommerce: {
              currency: 'BRL',
              items: CART,
              payment_type: type,
              value: total,
              contents: contents
            },
            user: USER
          })
        }, 1000)
      }
    })
  } catch (e) {
    setEventException('add_payment_info', e.message)
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
        getInfoIndexedDB('user')
        getInfoIndexedDB('actualAddress')

        const contents = getContents()

        const ecommerce = {
          currency: 'BRL',
          items: CART,
          shipping_tier: 'Entrega/Retirada',
          value: total,
          contents: contents
        }

        dataLayer.push({
          event: 'add_shipping_info',
          ecommerce: ecommerce,
          user: USER
        })
      }
    })
  } catch (e) {
    setEventException('add_shipping_info', e.message)
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
              items: [item],
              value: item.price,
              contents: [{
                id: item.item_id,
                quantity: item.quantity
              }]
            }

            dataLayer.push({
              event: 'remove_from_cart',
              ecommerce: ecommerce,
              user: USER
            })

            CART.splice(index, 1)
          }
        })
      }
    })
  } catch (e) {
    setEventException('remove_from_cart', e.message)
  }
})();

(function () {
  try {
    customTitle('Menu')
    getInfoIndexedDB('user')
    getInfoIndexedDB('actualAddress')

    dataLayer.push({
      event: 'page_view',
      user: USER
    })
  } catch (e) {
    setEventException('page_view', e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if ((clickedElement.tagName === 'ION-BUTTON') && (clickedElement.innerText === 'Enviar')) {
        customTitle('Login')
        getInfoIndexedDB('user')
        getInfoIndexedDB('actualAddress')

        dataLayer.push({
          event: 'login',
          method: 'Password',
          user: USER
        })
      }
    })
  } catch (e) {
    setEventException('login', e.message)
  }
})();

(function () {
  try {
    const btn = document.getElementsByClassName('ion-page')
    btn[0].addEventListener('click', event => {
      const clickedElement = event.target
      if ((clickedElement.tagName === 'ION-BUTTON') && (clickedElement.textContent === ' Cadastrar')) {
        customTitle('SiginUp')
        getInfoIndexedDB('user')
        getInfoIndexedDB('actualAddress')

        dataLayer.push({
          event: 'sign_up',
          method: 'Password',
          user: USER
        })
      }
    })
  } catch (e) {
    setEventException('sign_up', e.message)
  }
})()

function setEventException(eventName, err) {
  dataLayer.push({
    event: 'exception',
    referent: eventName,
    description: err,
    fatal: false
  })
}

function customTitle(titleName) {
  try {
    const title = document.title
    if (title.includes('|')) {
      const str = title.split('|')
      window.document.title = str[0] + ' | ' + titleName
    } else {
      document.title = title + ' | ' + titleName
    }
  } catch (e) {
    setEventException('custom_title', e)
  }
}

function getContents() {
  try {
    const contents = CART.map(item => {
      const data = {
        id: item.item_id,
        quantity: item.quantity
      }
      return data
    })
    return contents
  } catch (e) {
    setEventException('get_contents', e.message)
  }
}

function getInfoIndexedDB(keyName) {
  const DB_NAME = '_ionicstorage'
  const DB_STORE = '_ionickv'
  const DB_VERSION = 2

  const openRequest = window.indexedDB.open(DB_NAME, DB_VERSION)

  openRequest.onsuccess = function () {
    const DB = openRequest.result
    const transaction = DB.transaction(DB_STORE)
    const store = transaction.objectStore(DB_STORE)

    if (keyName === 'user') {
      const query = store.get('user')
      query.onsuccess = function () {
        const user = query.result

        USER.email = user.email || ''
      }
      query.onerror = function () {
        setEventException('get_info_IDB', query.error)
      }
    }

    if (keyName === 'actualAddress') {
      const query = store.get('actualAddress')
      query.onsuccess = function () {
        const address = query.result

        USER.cep = address.zip || ''
        USER.city = address.city || ''
        USER.state = address.state || ''
        USER.country = 'Brasil'
      }
      query.onerror = function () {
        setEventException('get_info_IDB', query.error)
      }
    }
  }

  openRequest.onerror = function () {
    setEventException('get_info_IDB', openRequest.error)
  }
}

function GetInfoLocalstorage(keyName) {
  try {
    const str = window.localStorage.getItem('info')
    const info = JSON.parse(str)

    if (keyName === 'marca') {
      return info.network[0].networkName
    }

    if (keyName === 'store') {
      return info.stores
    }
  } catch (e) {
    setEventException('get_info_LS')
  }
}

function getCategoryName(id) {
  const name = CART.filter(item => {
    if (item.item_id === id) {
      return item.item_category
    } else {
      return ''
    }
  })
  return name[0].item_category
}
