'use client'
import { useState } from 'react'

interface FaqBlockProps { value: { items?: { question: string; answer: string }[] } }

export function FaqBlock({ value }: FaqBlockProps) {
  const { items = [] } = value
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div style={{ margin: '32px 0' }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={i} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '20px 24px',
                  background: isOpen ? '#fff' : '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  lineHeight: 1.4,
                }}
              >
                <span>{item.question}</span>

                {/* ? icon circle */}
                <span style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isOpen ? 'var(--green)' : 'var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 17v-1M12 13c0-2 2-2 2-4a2 2 0 1 0-4 0"
                      stroke={isOpen ? '#fff' : '#9CA3AF'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isOpen && (
                <div style={{
                  padding: '0 24px 20px',
                  fontSize: '14.5px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  background: '#fff',
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
