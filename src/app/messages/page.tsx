'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageCircle, User, Send } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

function MessagesPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const withUserId = searchParams.get('with')

  const [conversations, setConversations] = useState<any[]>([])
  const [activePartner, setActivePartner] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/messages')
      return
    }
    if (status === 'authenticated') {
      loadInitialData()
    }
  }, [status, router, withUserId])

  async function loadInitialData() {
    try {
      const res = await fetch('/api/messages')
      const data = await res.json()
      const convos = data.conversations || []
      setConversations(convos)
      setLoading(false)

      if (withUserId) {
        const existing = convos.find((c: any) => c.partnerId === withUserId)
        if (existing) {
          selectConversation(existing)
        } else {
          // If no conversation exists yet, fetch user details to show empty chat
          const userRes = await fetch(`/api/users/${withUserId}`)
          const userData = await userRes.json()
          if (userData.user) {
            setActivePartner(userData.user)
            setMessages([])
          }
        }
      }
    } catch (err) {
      setLoading(false)
    }
  }

  async function loadConversations() {
    const r = await fetch('/api/messages')
    const d = await r.json()
    setConversations(d.conversations || [])
  }

  async function loadMessages(partnerId: string) {
    const r = await fetch(`/api/messages?with=${partnerId}`)
    const d = await r.json()
    setMessages(d.messages || [])
  }

  async function selectConversation(conv: any) {
    setActivePartner(conv.partner)
    await loadMessages(conv.partnerId)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !activePartner) return

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: activePartner.id, text })
    })
    setText('')
    await loadMessages(activePartner.id)
    loadConversations()
  }

  if (status === 'loading' || loading) {
    return <div className="max-w-[1200px] mx-auto px-4 py-8"><div className="text-[14px] text-[#64748B]">Завантаження...</div></div>
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h1 className="text-[24px] font-bold text-[#0B1220] mb-6">Повідомлення</h1>

      {conversations.length === 0 && !activePartner ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-[#F8FAFC] rounded-2xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-[#94A3B8]" />
          </div>
          <p className="text-[16px] font-medium text-[#0F172A] mb-2">Немає повідомлень</p>
          <p className="text-[13px] text-[#64748B]">Напишіть продавцю на сторінці лота, щоб почати спілкування</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden grid lg:grid-cols-[320px_1fr] h-[600px]">
          {/* List */}
          <div className="border-r border-[#E2E8F0] overflow-y-auto hidden lg:block">
            {conversations.map((conv: any) => (
              <button
                key={conv.partnerId}
                onClick={() => selectConversation(conv)}
                className={`w-full p-4 text-left border-b border-[#F1F5F9] transition-colors ${
                  activePartner?.id === conv.partnerId ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {conv.partner.image ? <img src={conv.partner.image} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-[#94A3B8]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#0F172A] truncate">{conv.partner.name}</span>
                      <span className="text-[10px] text-[#94A3B8] flex-shrink-0">{timeAgo(conv.lastMessage.createdAt)}</span>
                    </div>
                    <p className="text-[12px] text-[#64748B] line-clamp-1">{conv.lastMessage.text}</p>
                    {conv.unread > 0 && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#2563EB] text-white text-[10px] font-semibold rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat */}
          <div className="flex flex-col">
            {activePartner ? (
              <>
                <div className="p-4 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#F1F5F9] rounded-full flex items-center justify-center overflow-hidden">
                      {activePartner.image ? <img src={activePartner.image} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-[#94A3B8]" />}
                    </div>
                    <span className="text-[14px] font-semibold text-[#0F172A]">{activePartner.name}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-[12px] text-[#94A3B8] mt-4">Немає повідомлень. Напишіть щось щоб почати діалог!</div>
                  )}
                  {messages.map(msg => {
                    const isMe = msg.senderId === session?.user?.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl ${
                          isMe ? 'bg-[#2563EB] text-white rounded-br-sm' : 'bg-[#F1F5F9] text-[#0F172A] rounded-bl-sm'
                        }`}>
                          <p className="text-[14px]">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-[#94A3B8]'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-[#E2E8F0]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="Написати повідомлення..."
                      className="flex-1 h-10 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] focus:outline-none focus:border-[#2563EB]"
                    />
                    <button type="submit" disabled={!text.trim()} className="h-10 px-4 bg-[#2563EB] text-white rounded-xl disabled:opacity-50">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" />
                  <p className="text-[14px] text-[#64748B]">Оберіть діалог</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="max-w-[1200px] mx-auto px-4 py-8 text-[14px] text-[#64748B]">Завантаження...</div>}>
      <MessagesPageContent />
    </Suspense>
  )
}
