const copyFromWindow = require('copyFromWindow')
const createArgumentsQueue = require('createArgumentsQueue')
const encodeUriComponent = require('encodeUriComponent')
const injectScript = require('injectScript')
const getTimestampMillis = require('getTimestampMillis')
const localStorage = require('localStorage')
const JSON = require('JSON')
const queryPermission = require('queryPermission')

const idGA = data.idGA
const rede = data.infoRede
const lojas = data.listLojas;

(function () {
  let gtag = copyFromWindow('gtag')

  if (!gtag) {
    gtag = createArgumentsQueue('gtag', 'dataLayer')

    const url = 'https://www.googletagmanager.com/gtag/js?id=' + encodeUriComponent(idGA)
    injectScript(url, data.gtmOnSuccess, data.gtmOnFailure, 'gtag')

    gtag('js', getTimestampMillis())
  }

  gtag('config', idGA, {
    send_page_view: false
  })
})()

const info = {
  id_ga: idGA,
  rede: rede,
  lojas: lojas
}
localStorage.setItem('info', JSON.stringify(info))

const url = ''
if (queryPermission('inject_script', url)) {
  injectScript(url, data.gtmOnSuccess, data.gtmOnFailure, url)
}
data.gtmOnSuccess()
