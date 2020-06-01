import React, { useState, useEffect } from 'react'
import { initDevKit, openAppModal } from '@tryyack/dev-kit'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initDevKit('3398a8f5-443e-4b18-9ff8-70d052a8e2ff', true)
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
