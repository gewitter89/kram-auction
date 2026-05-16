'use client'

import { useState, useEffect } from 'react'

export function useLiqPayStatus() {
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check LiqPay status via API
    fetch('/api/liqpay/status')
      .then(r => r.json())
      .then(data => {
        setConfigured(data.configured || false)
        setLoading(false)
      })
      .catch(() => {
        setConfigured(false)
        setLoading(false)
      })
  }, [])

  return { configured, loading }
}
