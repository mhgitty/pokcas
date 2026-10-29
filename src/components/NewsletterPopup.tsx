'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { KLAVIYO_COMPANY_ID, NEWSLETTER, type NewsletterMarket } from '@/lib/newsletter'

const DELAY_MS = 20000
const SNOOZE_DAYS = 7

function storageGet(key: string): string | null {
  try { return window.localStorage.getItem(key) } catch { return null }
}
function storageSet(key: string, value: string) {
  try { window.localStorage.setItem(key, value) } catch { /* ignore */ }
}

export function NewsletterPopup({ market }: { market: NewsletterMarket }) {
  const cfg = NEWSLETTER[market]
  const enabled = Boolean(KLAVIYO_COMPANY_ID && cfg.listId)
  const key = `pokcas_nl_${market}`

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const shown = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const show = useCallback(() => {
    if (shown.current) return
    shown.current = true
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const saved = storageGet(key)
    if (saved === 'subscribed') return
    if (saved && Date.now() - Number(saved) < SNOOZE_DAYS * 864e5) return

    const timer = window.setTimeout(show, DELAY_MS)
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0 && !e.relatedTarget) show() }
    const onScroll = () => {
      const h = document.documentElement
      if ((h.scrollTop + window.innerHeight) / h.scrollHeight > 0.6) show()
    }
    document.addEventListener('mouseout', onLeave)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mouseout', onLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [enabled, key, show])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 250)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(t); document.removeEventListener('keydown', onKey) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const close = () => {
    setOpen(false)
    if (status !== 'done') storageSet(key, String(Date.now()))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return }
    if (!consent) { setError(`Please confirm you are ${cfg.age} and agree to receive emails.`); return }
    setStatus('loading')
    try {
      const res = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${KLAVIYO_COMPANY_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/vnd.api+json', revision: '2024-10-15' },
        body: JSON.stringify({
          data: {
            type: 'subscription',
            attributes: {
              custom_source: `Pokcas popup ${market.toUpperCase()}`,
              profile: {
                data: {
                  type: 'profile',
                  attributes: {
                    email: email.trim(),
                    properties: { pokcas_market: market, signup_page: window.location.pathname },
                    subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } },
                  },
                },
              },
            },
            relationships: { list: { data: { type: 'list', id: cfg.listId } } },
          },
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('done')
      storageSet(key, 'subscribed')
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again.')
    }
  }

  if (!enabled || !open) return null

  return (
    <div className="nl-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="nl-modal" role="dialog" aria-modal="true" aria-labelledby="nl-title">
        <button type="button" className="nl-close" aria-label="Close" onClick={close}>✕</button>
        <div className="nl-top">
          <span className="nl-gift" aria-hidden="true">🎁</span>
          <span className="nl-kicker">{cfg.kicker}</span>
          <h2 id="nl-title" className="nl-title">{cfg.headline}</h2>
          <p className="nl-sub">{cfg.sub}</p>
        </div>

        {status === 'done' ? (
          <div className="nl-done">
            <span className="nl-done-icon" aria-hidden="true">✓</span>
            <p>{cfg.success}</p>
            <button type="button" className="nl-btn" onClick={close}>Back to Pokcas</button>
          </div>
        ) : (
          <form className="nl-form" onSubmit={submit} noValidate>
            <ul className="nl-perks">
              {cfg.perks.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <input
              ref={inputRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              className="nl-input"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <label className="nl-consent">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I am {cfg.age} and agree to receive casino offers from Pokcas by email. Unsubscribe anytime.
                See our <a href="/privacy-policy/" target="_blank" rel="noopener">privacy policy</a>.
              </span>
            </label>
            {error && <p className="nl-error" role="alert">{error}</p>}
            <button type="submit" className="nl-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : cfg.button}
            </button>
            <button type="button" className="nl-skip" onClick={close}>No thanks</button>
          </form>
        )}
      </div>
    </div>
  )
}
