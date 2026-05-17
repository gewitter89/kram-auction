// SMS Service for TurboSMS integration
// https://turbosms.ua/api.html

export async function sendVerificationSms(phone: string, code: string): Promise<boolean> {
  const token = process.env.TURBOSMS_TOKEN
  const isDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === 'true'
  
  if (isDemo && !token) {
    console.log(`[Mock SMS] Sending code ${code} to ${phone} (Demo Mode)`)
    return true
  }
  
  if (!token) {
    console.error('TurboSMS token is missing. Cannot send real SMS.')
    return false
  }

  try {
    const res = await fetch('https://api.turbosms.ua/message/send.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recipients: [phone],
        sms: {
          sender: process.env.TURBOSMS_SENDER || 'KRAM',
          text: `Ваш код підтвердження KRAM: ${code}`
        }
      })
    })
    
    const data = await res.json()
    // TurboSMS success response codes: 800 (Success), 0 (Accepted for processing)
    if (data.response_code === 800 || data.response_code === 0) {
      return true
    } else {
      console.error('TurboSMS failed:', data)
      return false
    }
  } catch (err) {
    console.error('Failed to send SMS:', err)
    return false
  }
}
