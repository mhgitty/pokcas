'use client'

import { Icon } from '@/components/Icon'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavChild { label: string; href: string }
interface NavItem  { label: string; href: string; isHighlighted?: boolean; children?: NavChild[] }

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => { setOpen(false); setExpanded(null) }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className={`burger-icon${open ? ' open' : ''}`}>
          <span /><span /><span />
        </span>
      </button>

      {/* Backdrop */}
      {open && <div className="mobile-menu-backdrop" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <nav className={`mobile-menu-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        {items.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expanded === item.href + item.label

          return (
            <div key={item.href + item.label} className="mobile-menu-group">
              {hasChildren ? (
                /* Label navigates, chevron toggles children */
                <div className="mobile-menu-link-row">
                  <Link
                    href={item.href}
                    className={`mobile-menu-link${item.isHighlighted ? ' mobile-menu-link-cta' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                  <button
                    className="mobile-menu-chevron-btn"
                    onClick={() => setExpanded(isExpanded ? null : item.href + item.label)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Close submenu' : 'Open submenu'}
                  >
                    <Icon name="alt-arrow-down" size={16} className={`mobile-menu-chevron${isExpanded ? ' open' : ''}`} />
                  </button>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`mobile-menu-link${item.isHighlighted ? ' mobile-menu-link-cta' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="mobile-menu-children">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href + child.label}
                      href={child.href}
                      className="mobile-menu-sublink"
                      onClick={() => setOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </>
  )
}
