const copyFromWindow = require('copyFromWindow')
const createArgumentsQueue = require('createArgumentsQueue')
const encodeUriComponent = require('encodeUriComponent')
const injectScript = require('injectScript')
const getTimestampMillis = require('getTimestampMillis')
const localStorage = require('localStorage')
const JSON = require('JSON')
const queryPermission = require('queryPermission')
const setInWindow = require('setInWindow')
const callInWindow = require('callInWindow')
const aliasInWindow = require('aliasInWindow')
const createQueue = require('createQueue')
const initIds = copyFromWindow('_fbq_gtm_ids') || []

const rede = data.infoRede
const lojas = data.listLojas

const idGA = data.idGA
const statusGA = data.statusGA

const idPixelFB = data.idPixel
const statusPixelFB = data.statusPixel

if (statusGA) {
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
}

if (statusPixelFB) {
  const getFbq = () => {
    const fbq = copyFromWindow('fbq')
    if (fbq) {
      return fbq
    }

    setInWindow('fbq', function () {
      const callMethod = copyFromWindow('fbq.callMethod.apply')
      if (callMethod) {
        callInWindow('fbq.callMethod.apply', null, arguments)
      } else {
        callInWindow('fbq.queue.push', arguments)
      }
    })
    aliasInWindow('_fbq', 'fbq')
    createQueue('fbq.queue')

    return copyFromWindow('fbq')
  }

  const fbq = getFbq()

  fbq('set', 'autoConfig', false, idPixelFB)
  fbq('init', idPixelFB)

  initIds.push(idPixelFB)
  setInWindow('_fbq_gtm_ids', initIds, true)

  injectScript('https://connect.facebook.net/en_US/fbevents.js', data.gtmOnSuccess, data.gtmOnFailure, 'fbPixel')
}

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
