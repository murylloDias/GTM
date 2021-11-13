const VIEW = []
const CART = [];

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
          const marca = info.rede[0].nomeRede
          const stores = info.lojas

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

            const ecommerce = {
              page_title: getTitle('Produto'),
              page_location: getUTM('product/?'),
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

            gtag('event', 'view_item', ecommerce)

            fbq('track', 'ViewContent', {
              content_ids: obj._id,
              content_category: obj.group,
              content_name: obj.printDescription,
              content_type: 'product',
              contents: [{
                id: obj._id,
                quantity: 1
              }],
              currency: 'BRL',
              value: obj.price.actualPrice
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

            const contents = obj.products.map(item => {
              const content = {
                id: item.id,
                quantity: item.quantity
              }
              return content
            })

            gtag('event', 'purchase', {
              page_title: getTitle('Pedido'),
              page_location: getUTM('order/?'),
              affiliation: obj.store.name,
              coupon: cupom,
              currency: 'BRL',
              items: items,
              transaction_id: obj._id,
              shipping: obj.deliveryTax,
              value: obj.total,
              tax: 0
            })

            fbq('track', 'Purchase', {
              value: obj.total,
              currency: 'BRL',
              contents: contents,
              content_type: 'product'
            });            
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

            const ecommerce = {
              page_title: getTitle('Carrinho'),
              page_location: getUTM('cart/?'),
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

            gtag('event', 'add_to_cart', ecommerce)

            fbq('track', 'AddToCart', {
              content_ids: itemCart.id,
              content_name: itemCart.id,
              content_type: 'product',
              contents: [{
                id: itemCart.id,
                quantity: itemCart.quantity
              }],
              currency: 'BRL',
              value: itemCart.total
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

        const contents = getContents()

        gtag('event', 'begin_checkout', {
          page_title: getTitle('Carrinho'),
          page_location: getUTM('cart/?'),
          currency: 'BRL',
          items: CART,
          value: total
        })
        
        fbq('track', 'InitiateCheckout', {
          contents: contents,
          currency: 'BRL',
          num_items: CART.length,
          value: total
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

          const contents = getContents()

          gtag('event', 'add_payment_info', {
            page_title: getTitle('Carrinho'),
            page_location: getUTM('payments/?'),
            currency: 'BRL',
            items: CART,
            payment_type: type,
            value: total
          })

          fbq('track', 'AddPaymentInfo', {
            contents: contents,
            currency: 'BRL',
            value: total
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

        const ecommerce = {
          page_title: getTitle('Carrinho'),
          page_location: getUTM('change-address/?'),
          currency: 'BRL',
          items: CART,
          shipping_tier: 'Entrega/Retirada',
          value: total
        }

        gtag('event', 'add_shipping_info', ecommerce)
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
            const ecommerce = {
              page_title: getTitle('Carrinho'),
              page_location: getUTM('cart/?'),
              currency: 'BRL',
              items: item,
              value: item.price
            }

            gtag('event', 'remove_from_cart', ecommerce)

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
    gtag('event', 'page_view', {
      page_title: getTitle('Menu'),
      page_location: getUTM('menu/?')
    })

    fbq('track', 'PageView')

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
        gtag('event', 'login', {
          page_title: getTitle('Login'),
          page_location: getUTM('login/?'),
          method: 'E-mail/Password'
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
        gtag('event', 'sign_up', {
          page_title: getTitle('SiginUp'),
          page_location: getUTM('signup/?'),
          method: 'E-mail/Password'
        })

        fbq('track', 'CompleteRegistration', {
          currency: 'BRL',
          status: true
        })
      }
    })
  } catch (e) {
    console.error(e.message)
  }
})()

function getUTM (page) {
  const data = window.performance.getEntries()
  const url = data[0].name

  if ((url.includes('menu')) || ((url + 'menu') === window.location.href)) {
    return url
  } else {
    const str = url.split('?')
    return str[0] + page + str[1]
  }
}

function getTitle (pageName) {
  return document.title + ' | ' + pageName
}


function getContents () {
  const contents = CART.map(item => {
    const data = {
      id: item.item_id,
      quantity: item.quantity
    }
    return data
  })
  return contents
}