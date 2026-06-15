'use client'

import { Icon } from '@/components/Icon'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MarketSelector } from './MarketSelector'

interface NavChild { label: string; href: string; children?: { label: string; href: string }[] }
interface NavItem  { label: string; href: string; isHighlighted?: boolean; children?: NavChild[] }

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [subExpanded, setSubExpanded] = useState<string | null>(null)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => { setOpen(false); setExpanded(null); setSubExpanded(null) }, [pathname])

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
        {/* Market switcher at the top of the drawer */}
        <div style={{ padding: '4px 0 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
          <MarketSelector variant="navbar" />
        </div>
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
                  {item.children!.map((child) => {
                    const childHasKids = !!(child.children && child.children.length > 0)
                    const childKey = item.href + item.label + '::' + child.href + child.label
                    const isSubExpanded = subExpanded === childKey
                    if (!childHasKids) {
                      return (
                        <Link
                          key={childKey}
                          href={child.href}
                          className="mobile-menu-sublink"
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      )
                    }
                    return (
                      <div key={childKey}>
                        <div className="mobile-menu-link-row">
                          <Link href={child.href} className="mobile-menu-sublink" onClick={() => setOpen(false)}>
                            {child.label}
                          </Link>
                          <button
                            className="mobile-menu-chevron-btn"
                            onClick={() => setSubExpanded(isSubExpanded ? null : childKey)}
                            aria-expanded={isSubExpanded}
                            aria-label={isSubExpanded ? 'Close submenu' : 'Open submenu'}
                          >
                            <Icon name="alt-arrow-down" size={15} className={`mobile-menu-chevron${isSubExpanded ? ' open' : ''}`} />
                          </button>
                        </div>
                        {isSubExpanded && (
                          <div className="mobile-menu-children mobile-menu-children-nested">
                            {child.children!.map((g) => (
                              <Link
                                key={g.href + g.label}
                                href={g.href}
                                className="mobile-menu-sublink"
                                onClick={() => setOpen(false)}
                              >
                                {g.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </>
  )
}
