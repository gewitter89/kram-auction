'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Gavel, ShoppingBag, DollarSign, Heart, MessageCircle, Bell, Star, Settings, LogOut, User, ShieldCheck, PlusCircle, Eye, Trash2, CheckCircle } from 'lucide-react'
import { formatPrice, timeAgo } from '@/lib/utils'

interface CabinetContentProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

const menuItems = [
  { id: 'lots', label: 'Мої лоти', icon: Package },
  { id: 'bids', label: 'Мої ставки', icon: Gavel },
  { id: 'purchases', label: 'Покупки', icon: ShoppingBag },
  { id: 'sales', label: 'Продажі', icon: DollarSign },
  { id: 'favorites', label: 'Обране', icon: Heart },
  { id: 'messages', label: 'Повідомлення', icon: MessageCircle },
  { id: 'notifications', label: 'Сповіщення', icon: Bell },
  { id: 'reviews', label: 'Відгуки', icon: Star },
  { id: 'verification', label: 'Верифікація', icon: ShieldCheck },
  { id: 'settings', label: 'Налаштування', icon: Settings },
]

export function CabinetContent({ user }: CabinetContentProps) {
  const [activeTab, setActiveTab] = useState('lots')
  const [stats, setStats] = useState({ activeLots: 0, sold: 0, bought: 0 })

  useEffect(() => {
    fetch('/api/my/lots').then(r => r.json()).then(({ lots = [] }) => {
      setStats({
        activeLots: lots.filter((l: any) => l.status === 'active').length,
        sold: lots.filter((l: any) => l.status === 'sold').length,
        bought: 0,
      })
    })
  }, [])

  return (
    <div className="max-w-[1320px] mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-5 flex-1">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-[#2563EB]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-[20px] font-bold text-[#0B1220]">{user.name || 'Користувач'}</h1>
                <div className="flex items-center gap-1 px-2 h-5 bg-[#ECFDF5] rounded-full">
                  <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                  <span className="text-[10px] font-semibold text-[#10B981]">Верифіковано</span>
                </div>
              </div>
              <p className="text-[13px] text-[#64748B]">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#0B1220]">{stats.activeLots}</p>
              <p className="text-[11px] text-[#64748B]">Активні лоти</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#0B1220]">{stats.sold}</p>
              <p className="text-[11px] text-[#64748B]">Продано</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-[240px] flex-shrink-0">
          <nav className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[13px] font-medium transition-colors border-b border-[#F1F5F9] last:border-0 ${
                    isActive ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
            <a
              href="/auth/signout"
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-[13px] font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
            >
              <LogOut className="w-4 h-4" />
              <span>Вийти</span>
            </a>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6">
            {activeTab === 'lots' && <MyLotsTab />}
            {activeTab === 'bids' && <MyBidsTab />}
            {activeTab === 'purchases' && <EmptyState icon={ShoppingBag} title="Покупки" text="У вас ще немає покупок. Знайдіть щось цікаве в каталозі." cta={{ href: '/catalog', label: 'Переглянути каталог' }} />}
            {activeTab === 'sales' && <EmptyState icon={DollarSign} title="Продажі" text="У вас ще немає продажів. Створіть свій перший лот." cta={{ href: '/sell', label: 'Створити лот' }} />}
            {activeTab === 'favorites' && <FavoritesTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'reviews' && <EmptyState icon={Star} title="Відгуки" text="У вас ще немає відгуків від покупців" />}
            {activeTab === 'verification' && <VerificationTab user={user} />}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function MyLotsTab() {
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/my/lots').then(r => r.json()).then(d => {
      setLots(d.lots || [])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  async function deleteLot(id: string) {
    if (!confirm('Видалити цей лот? Дію не можна скасувати.')) return
    await fetch(`/api/lots/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <SkeletonList />

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[18px] font-bold text-[#0B1220]">Мої лоти</h2>
        <Link href="/sell" className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1D4ED8]">
          <PlusCircle className="w-4 h-4" /> Створити
        </Link>
      </div>
      {lots.length === 0 ? (
        <EmptyState icon={Package} title="Немає лотів" text="Створіть свій перший лот, щоб почати продавати" cta={{ href: '/sell', label: 'Створити лот' }} />
      ) : (
        <div className="space-y-3">
          {lots.map(lot => {
            let images: string[] = []
            try { images = JSON.parse(lot.images || '[]') } catch {}
            return (
              <div key={lot.id} className="flex items-center gap-4 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/20 transition-colors">
                <Link href={`/lot/${lot.id}`} className="w-16 h-16 bg-[#F1F5F9] rounded-lg overflow-hidden flex-shrink-0">
                  {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                </Link>
                <Link href={`/lot/${lot.id}`} className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-semibold text-[#0F172A] truncate">{lot.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-[#64748B]">
                    <span className="flex items-center gap-1"><Gavel className="w-3 h-3" />{lot._count?.bids || 0} ставок</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{lot.views} переглядів</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      lot.status === 'active' ? 'bg-[#ECFDF5] text-[#10B981]' :
                      lot.status === 'sold' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {lot.status === 'active' ? 'Активний' : lot.status === 'sold' ? 'Продано' : 'Завершено'}
                    </span>
                  </div>
                </Link>
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  <p className="text-[15px] font-bold text-[#0F172A]">{formatPrice(lot.currentPrice)}</p>
                  <button
                    onClick={() => deleteLot(lot.id)}
                    className="flex items-center gap-1 text-[11px] text-[#EF4444] hover:text-[#DC2626] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Видалити
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function MyBidsTab() {
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/my/bids').then(r => r.json()).then(d => {
      setBids(d.bids || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <SkeletonList />

  return (
    <>
      <h2 className="text-[18px] font-bold text-[#0B1220] mb-5">Мої ставки</h2>
      {bids.length === 0 ? (
        <EmptyState icon={Gavel} title="Немає ставок" text="Зробіть свою першу ставку на аукціоні" cta={{ href: '/catalog', label: 'Знайти лот' }} />
      ) : (
        <div className="space-y-3">
          {bids.map(bid => {
            let images: string[] = []
            try { images = JSON.parse(bid.listing.images || '[]') } catch {}
            return (
              <Link key={bid.id} href={`/lot/${bid.listing.id}`}
                className="flex items-center gap-4 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/40">
                <div className="w-16 h-16 bg-[#F1F5F9] rounded-lg overflow-hidden flex-shrink-0">
                  {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-semibold text-[#0F172A] truncate">{bid.listing.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[11px] font-semibold ${bid.isWinning ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {bid.isWinning ? '✓ Ви лідируєте' : '✗ Ставку перебито'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#94A3B8]">Ваша ставка</p>
                  <p className="text-[15px] font-bold text-[#0F172A]">{formatPrice(bid.amount)}</p>
                  <p className="text-[11px] text-[#64748B]">Поточна: {formatPrice(bid.listing.currentPrice)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

function FavoritesTab() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/favorites').then(r => r.json()).then(d => {
      setFavorites(d.favorites || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <SkeletonList />

  return (
    <>
      <h2 className="text-[18px] font-bold text-[#0B1220] mb-5">Обране</h2>
      {favorites.length === 0 ? (
        <EmptyState icon={Heart} title="Обране порожнє" text="Додавайте лоти в обране натиснувши на серце" cta={{ href: '/catalog', label: 'Перейти в каталог' }} />
      ) : (
        <div className="space-y-3">
          {favorites.map(lot => {
            let images: string[] = []
            try { images = JSON.parse(lot.images || '[]') } catch {}
            return (
              <Link key={lot.id} href={`/lot/${lot.id}`}
                className="flex items-center gap-4 p-3 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/40">
                <div className="w-16 h-16 bg-[#F1F5F9] rounded-lg overflow-hidden flex-shrink-0">
                  {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-semibold text-[#0F172A] truncate">{lot.title}</h4>
                </div>
                <p className="text-[15px] font-bold text-[#0F172A]">{formatPrice(lot.currentPrice)}</p>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      setNotifications(d.notifications || [])
      setLoading(false)
      // Mark all as read
      if ((d.unreadCount ?? 0) > 0) {
        fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) })
      }
    })
  }, [])

  if (loading) return <SkeletonList />

  return (
    <>
      <h2 className="text-[18px] font-bold text-[#0B1220] mb-5">Сповіщення</h2>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Немає сповіщень" text="Тут зʼявляться сповіщення про ваші ставки та повідомлення" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'bg-white border-[#E2E8F0]' : 'bg-[#EFF6FF] border-[#2563EB]/20'}`}>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[13px] font-semibold text-[#0F172A]">{n.title}</h4>
                <span className="text-[11px] text-[#94A3B8]">{timeAgo(n.createdAt)}</span>
              </div>
              <p className="text-[12px] text-[#64748B]">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function MessagesTab() {
  return (
    <>
      <h2 className="text-[18px] font-bold text-[#0B1220] mb-5">Повідомлення</h2>
      <Link href="/messages" className="block p-4 border border-[#E2E8F0] rounded-xl hover:border-[#2563EB]/40">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-[#2563EB]" />
          <span className="text-[14px] font-medium text-[#0F172A]">Перейти до повідомлень →</span>
        </div>
      </Link>
    </>
  )
}

function SettingsTab({ user }: { user: any }) {
  const [name, setName] = useState(user.name || '')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      if (d.user) {
        setName(d.user.name || '')
        setCity(d.user.city || '')
        setPhone(d.user.phone || '')
        setBio(d.user.bio || '')
      }
    })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, phone, bio })
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      <h2 className="text-[18px] font-bold text-[#0B1220] mb-5">Налаштування</h2>
      <form onSubmit={save} className="max-w-[420px] space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Імʼя *</label>
          <input value={name} onChange={e => setName(e.target.value)} type="text"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Email</label>
          <input type="email" value={user.email || ''} disabled
            className="w-full h-11 px-4 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[14px] text-[#94A3B8]" />
          <p className="text-[11px] text-[#94A3B8] mt-1">Email змінити неможливо</p>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Місто</label>
          <input value={city} onChange={e => setCity(e.target.value)} type="text" placeholder="Наприклад: Дніпро"
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Телефон</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+380..."
            className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#0F172A] mb-1.5">Про себе</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Розкажіть про себе..."
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB] resize-none" />
        </div>
        {error && <p className="text-[13px] text-[#EF4444]">{error}</p>}
        <button type="submit" disabled={saving}
          className="h-11 px-6 bg-[#2563EB] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1D4ED8] disabled:opacity-60 transition-all">
          {saving ? 'Збереження...' : saved ? '✓ Збережено!' : 'Зберегти'}
        </button>
      </form>
    </>
  )
}

function VerificationTab({ user }: { user: any }) {
  const [requested, setRequested] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function requestVerification() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          listingId: '', // Special case for verification
          reason: 'Запит на верифікацію профілю' 
        })
      })
      if (res.ok) {
        setRequested(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Помилка при відправці запиту')
      }
    } catch {
      setError('Помилка сервера')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-[480px]">
      <h2 className="text-[18px] font-bold text-[#0B1220] mb-2">Верифікація профілю</h2>
      <p className="text-[14px] text-[#64748B] mb-6">
        Верифіковані користувачі отримують позначку <ShieldCheck className="inline-block w-4 h-4 text-[#2563EB]" /> та мають більше довіри від покупців.
      </p>

      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-[#0F172A]">Статус довіри</h4>
            <p className="text-[12px] text-[#64748B]">Пройдіть перевірку, щоб стати частиною еліти KRAM</p>
          </div>
        </div>

        {requested ? (
          <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-4">
            <p className="text-[13px] font-semibold text-[#10B981] mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Запит надіслано
            </p>
            <p className="text-[12px] text-[#10B981]/80">
              Ми перевіримо ваш профіль протягом 24 годин. Очікуйте на сповіщення.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[13px] text-[#0F172A]">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>Підвищення лімітів ставок</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#0F172A]">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>Пріоритет у видачі каталогу</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#0F172A]">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>Більше довіри при Безпечній Угоді</span>
              </div>
            </div>

            <button
              onClick={requestVerification}
              disabled={loading}
              className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-[14px] font-bold hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
            >
              {loading ? 'Надсилання...' : 'Подати запит на верифікацію'}
            </button>
            {error && <p className="text-[12px] text-[#EF4444] text-center">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text, cta }: { icon: any; title: string; text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="py-12 text-center">
      <div className="w-14 h-14 mx-auto mb-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#94A3B8]" />
      </div>
      <p className="text-[16px] font-semibold text-[#0F172A] mb-2">{title}</p>
      <p className="text-[13px] text-[#64748B] mb-5 max-w-[320px] mx-auto">{text}</p>
      {cta && (
        <Link href={cta.href} className="inline-flex h-10 px-5 items-center bg-[#2563EB] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1D4ED8]">
          {cta.label}
        </Link>
      )}
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-4 p-3 border border-[#E2E8F0] rounded-xl">
          <div className="w-16 h-16 bg-[#F1F5F9] rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[#F1F5F9] rounded animate-pulse w-3/4" />
            <div className="h-3 bg-[#F1F5F9] rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
