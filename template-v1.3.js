const localStorage = require('localStorage')
const queryPermission = require('queryPermission')
const injectScript = require('injectScript')
const JSON = require('JSON')

const network = data.infoNetwork
const stores = data.storeList

const info = {
  network: network,
  stores: stores
}

localStorage.setItem('info', JSON.stringify(info))

const url = ''

if (queryPermission('injectScript', url)) {
  injectScript(url, data.gtmOnSuccess, data.gtmOnFailure, url)
}

data.gtmOnSuccess()