function () {
  var data = window.performance.getEntries()
  var url = data[0].name

  if (url.includes('menu')) {
    return url
  } else {
    var str = url.split('?')
    return str[0] + 'menu/?' + str[1]
  }
}


function () {
  return document.title
}


for (var b in window) {
  if (window.hasOwnProperty(b)) {
    console.log(b)
  }
}

monitorEvents(window,'click')


function () {
  var DB_NAME = '_ionicstorage'
  var DB_STORE = '_ionickv'
  var DB_VERSION = 2

  var openRequest = window.indexedDB.open(DB_NAME, DB_VERSION)

  openRequest.onsuccess = function () {
    var DB = openRequest.result
    var transaction = DB.transaction(DB_STORE)
    var store = transaction.objectStore(DB_STORE)
    var query = store.get('cart')

    query.onsuccess = function () {
      var cart = query.result
      window.localStorage.setItem('cart', JSON.stringify(cart))
      dataLayer.push({
        event: 'add_to_cart',
        data: cart[cart.length - 1]
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