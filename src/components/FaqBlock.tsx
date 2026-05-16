'use client'
import { useState } from 'react'

interface FaqBlockProps { value: { title?: string; items?: { question: string; answer: string }[] } }

export function FaqBlock({ value }: FaqBlockProps) {
  const { title = 'Ofte stillede spørgsmål', items = [] } = value
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ margin: '32px 0' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width: '100%', textAlign: 'left', padding: '16px 20px',
              background: open === i ? 'var(--bg-raised)' : 'var(--bg-card)', border: 'none', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '14.5px', fontWeight: 600, color: 'var(--text)',
            }}>
              {item.question}
              <span style={{ color: 'var(--text-faint)', fontSize: '18px', fontWeight: 300 }}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div style={{ padding: '0 20px 16px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
