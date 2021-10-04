const logToConsole = require('logToConsole')
const injectScript = require('injectScript')
const copyFromWindow = require('copyFromWindow')
const setInWindow = require('setInWindow')
const queryPermission = require('queryPermission')

const log = data.debug ? logToConsole : () => { }
const urls = data.excludeUrls
const getSettings = () => {
  if (!urls) {
    log('no excludes')
    return false
  }
  log(urls)
  const ajrS = copyFromWindow('ajrS')
  if (ajrS) {
    return false
  }
  setInWindow('ajrS', urls)
  return false
}

getSettings()

const url = 'https://cdn.jsdelivr.net/gh/murylloDias/GTM@f74923d20f6d7384c8be868c21a993c461f36f32/config-dataLayer.js'
if (queryPermission('inject_script', url)) {
  injectScript(url, data.gtmOnSuccess, data.gtmOnFailure, url)
}
data.gtmOnSuccess()
