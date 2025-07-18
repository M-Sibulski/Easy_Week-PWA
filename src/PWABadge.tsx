import './PWABadge.css'
import registerPeriodicSync from './registerPeriodicSync'

import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  // check for updates every 3 minutes
  const period = 0.5 * 60 * 1000

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      }
      else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated')
            registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="" role="alert" aria-labelledby="toast-message">
      { offlineReady &&
        <div className="absolute top-0 w-lg flex justify-between py-1 px-3 bg-green-400 text-center">
          <p id="toast-message" className='m-0 p-0 inline-block align-middle'>App ready to work offline</p>
          <div onClick={() => close()} className="cursor-pointer h-full p-1 rounded-md hover:bg-green-300">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000ff"><path d="M200-440v-80h560v80H200Z"/></svg>
          </div>
        </div>}
      { needRefresh &&
      <div className="absolute top-0 w-lg flex justify-between py-1 px-3 bg-green-400 text-center">
          <p id="toast-message" className='m-0 p-0 inline-block align-middle'>New content available, click on reload button to update.</p>
          <div onClick={() => updateServiceWorker(true)} className="cursor-pointer h-full p-1 rounded-md hover:bg-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000ff"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
          </div>
        </div>
      }
    </div>
  )
}

export default PWABadge