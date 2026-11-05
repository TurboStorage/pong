/* global window, document, location, localStorage */
// Google Analytics 4 for pong.eyesonflash.com, live host only (local play and previews send nothing).
// The same property as eyesonflash.com and atlas.eyesonflash.com. page_location is trimmed to origin and path.
// Consent mode as on eyesonflash.com (PRIV1): visitors in the EEA, the UK and Switzerland start with analytics
// cookies off; everyone else starts with them on. Ad signals are off for everyone. A stored choice in
// localStorage eof-consent (12 months) is honoured. Keep the key, lifetime and region list in step with
// the site's src/scripts/consent.ts.
;(function () {
  var ID = 'G-9YLB43T4CS'
  if (location.hostname !== 'pong.eyesonflash.com') return
  var REGIONS = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT',
    'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
  ]
  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = window.gtag || gtag
  function stored() {
    try {
      var o = JSON.parse(localStorage.getItem('eof-consent'))
      if (o && (o.v === 'granted' || o.v === 'denied') && typeof o.t === 'number' && Date.now() - o.t <= 365 * 864e5) return o.v
    } catch (e) {
      // Storage blocked or unreadable: no stored choice.
    }
    return null
  }
  var ads = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }
  gtag('consent', 'default', Object.assign({ analytics_storage: 'denied', region: REGIONS, wait_for_update: 500 }, ads))
  gtag('consent', 'default', Object.assign({ analytics_storage: 'granted' }, ads))
  var choice = stored()
  if (choice) gtag('consent', 'update', { analytics_storage: choice })
  gtag('js', new Date())
  gtag('config', ID, { page_location: location.origin + location.pathname })
  var tag = document.createElement('script')
  tag.async = true
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID
  document.head.appendChild(tag)
})()
