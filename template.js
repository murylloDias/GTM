const logToConsole = require('logToConsole')
const injectScript = require('injectScript')
const copyFromWindow = require('copyFromWindow')
const setInWindow = require('setInWindow')
const queryPermission = require('queryPermission')

const localStorage = require('localStorage')
localStorage.setItem('info', data.info_network)

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

const url = ''
if (queryPermission('inject_script', url)) {
  injectScript(url, data.gtmOnSuccess, data.gtmOnFailure, url)
}
data.gtmOnSuccess()
