const createArgumentsQueue = require('createArgumentsQueue')
const queryPermission = require('queryPermission')
const copyFromWindow = require('copyFromWindow')
const injectScript = require('injectScript')
const localStorage = require('localStorage')
const logToConsole = require('logToConsole')
const setInWindow = require('setInWindow')
const encodeUriComponent = require('encodeUriComponent ')
const getTimestampMillis = require('getTimestampMillis ')
const JSON = require('JSON')
const callInWindow = require('callInWindow')

const mensuredID = data.mensuredID
const infoLojas = data.infoLojas
const urlGA = 'https://www.googletagmanager.com/gtag/js?id='

let pageLocation = ''
// if (queryPermission('access_globals', 'readwrite')) {
const str = callInWindow('performance.getEntries')
pageLocation = str[0].name
// }

let gtag = copyFromWindow('gtag')

if (!gtag) {
  gtag = createArgumentsQueue('gtag', 'dataLayer')
  injectScript(urlGA + encodeUriComponent(mensuredID), data.gtmOnSuccess, data.gtmOnFailure, 'gtag')
  gtag('js', getTimestampMillis())
}

gtag('config', mensuredID, {
  page_title: data.name,
  page_location: pageLocation
})

localStorage.setItem('info', JSON.stringfy(infoLojas))

/*
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
*/
