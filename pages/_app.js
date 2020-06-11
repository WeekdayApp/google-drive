import React, { useState, useEffect } from 'react'
import { initDevKit, openAppModal } from '@tryyack/dev-kit'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initDevKit('47e58d79-f95e-4a22-94d1-cee9aacab8df', false)
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
