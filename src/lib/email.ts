import nodemailer from 'nodemailer'

const FROM = process.env.EMAIL_FROM || 'KRAM <noreply@kram.ua>'

function createTransport() {
  // Use Gmail SMTP if configured, else log to console (dev mode)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    })
  }
  // Dev fallback — log to console
  return {
    sendMail: async (opts: any) => {
      console.log('[EMAIL DEV]', opts.to, '|', opts.subject)
      return { messageId: 'dev-' + Date.now() }
    }
  }
}

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 560px; margin: 0 auto; background: #fff;
  border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden;
`
const headerStyle = `background: #0B1220; padding: 24px 32px;`
const bodyStyle = `padding: 28px 32px;`
const btnStyle = `
  display: inline-block; background: #2563EB; color: white;
  text-decoration: none; padding: 12px 28px; border-radius: 12px;
  font-size: 15px; font-weight: 600; margin: 16px 0;
`
const footerStyle = `
  padding: 16px 32px; background: #F8FAFC; border-top: 1px solid #E2E8F0;
  font-size: 12px; color: #94A3B8; text-align: center;
`

function wrap(body: string): string {
  return `<!DOCTYPE html><html><body>
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <span style="font-size:20px;font-weight:800;color:white;letter-spacing:-0.5px;">⚡ KRAM</span>
    </div>
    <div style="${bodyStyle}">${body}</div>
    <div style="${footerStyle}">KRAM Marketplace · Ця пошта відправлена автоматично, не відповідайте на неї.</div>
  </div></body></html>`
}

export async function sendOutbidEmail(opts: {
  to: string
  name: string
  lotTitle: string
  lotUrl: string
  yourBid: number
  newBid: number
}) {
  const t = createTransport()
  await t.sendMail({
    from: FROM,
    to: opts.to,
    subject: `❌ Вашу ставку перебито — ${opts.lotTitle}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#0B1220;">Вашу ставку перебито!</h2>
      <p style="color:#64748B;margin:0 0 20px;">Привіт, <b>${opts.name || 'друже'}</b>! Хтось щойно перебив вашу ставку на лот:</p>
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#0B1220;">${opts.lotTitle}</p>
        <p style="margin:8px 0 0;color:#64748B;">Ваша ставка: <s>${opts.yourBid.toLocaleString('uk-UA')} ₴</s></p>
        <p style="margin:4px 0 0;color:#EF4444;font-weight:700;font-size:18px;">Поточна ставка: ${opts.newBid.toLocaleString('uk-UA')} ₴</p>
      </div>
      <p style="color:#64748B;">Ви ще можете виграти — поставте нову ставку!</p>
      <a href="${opts.lotUrl}" style="${btnStyle}">Зробити нову ставку →</a>
    `),
  })
}

export async function sendWinnerEmail(opts: {
  to: string
  name: string
  lotTitle: string
  lotUrl: string
  winAmount: number
}) {
  const t = createTransport()
  await t.sendMail({
    from: FROM,
    to: opts.to,
    subject: `🏆 Ви виграли аукціон — ${opts.lotTitle}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#0B1220;">🎉 Вітаємо з перемогою!</h2>
      <p style="color:#64748B;margin:0 0 20px;">Привіт, <b>${opts.name || 'переможцю'}</b>! Ви виграли аукціон:</p>
      <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#0B1220;">${opts.lotTitle}</p>
        <p style="margin:8px 0 0;color:#10B981;font-weight:700;font-size:20px;">Ваша ставка: ${opts.winAmount.toLocaleString('uk-UA')} ₴</p>
      </div>
      <p style="color:#64748B;">Зв'яжіться з продавцем для організації оплати та доставки.</p>
      <a href="${opts.lotUrl}" style="${btnStyle}">Перейти до лота →</a>
    `),
  })
}

export async function sendNewBidNotifyEmail(opts: {
  to: string
  name: string
  lotTitle: string
  lotUrl: string
  newBid: number
  bidderName: string
}) {
  const t = createTransport()
  await t.sendMail({
    from: FROM,
    to: opts.to,
    subject: `📈 Нова ставка на ваш лот — ${opts.lotTitle}`,
    html: wrap(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#0B1220;">Нова ставка на ваш лот!</h2>
      <p style="color:#64748B;margin:0 0 20px;">Привіт, <b>${opts.name || 'продавцю'}</b>! Покупець зробив ставку на ваш лот:</p>
      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#0B1220;">${opts.lotTitle}</p>
        <p style="margin:8px 0 0;color:#2563EB;font-weight:700;font-size:20px;">Поточна ставка: ${opts.newBid.toLocaleString('uk-UA')} ₴</p>
      </div>
      <a href="${opts.lotUrl}" style="${btnStyle}">Переглянути лот →</a>
    `),
  })
}
