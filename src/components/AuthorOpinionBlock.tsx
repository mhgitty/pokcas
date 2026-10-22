import { PortableText } from '@portabletext/react'
import { getAuthorById, getSiteSettings } from '@/lib/sanity'
import { replaceDateVars } from '@/lib/dateVars'

type Props = {
  value: {
    title?: string
    author?: { _ref?: string }
    body?: any[]
  }
}

const bodyComponents = {
  block: {
    normal: ({ children }: any) => <p>{children}</p>,
  },
  marks: {
    strong: ({ children }: any) => <strong>{children}</strong>,
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ value, children }: any) => {
      const rel = [value?.nofollow && 'nofollow', value?.blank && 'noopener noreferrer'].filter(Boolean).join(' ')
      return (
        <a href={value?.href} target={value?.blank ? '_blank' : undefined} rel={rel || undefined}>
          {children}
        </a>
      )
    },
  },
}

export async function AuthorOpinionBlock({ value }: Props) {
  const ref = value?.author?._ref
  let person: any = ref ? await getAuthorById(ref) : null
  if (!person) {
    const settings: any = await getSiteSettings()
    person = settings?.defaultAuthor ?? null
  }

  const name: string = person?.name || 'Pokcas team'
  const role: string | undefined = person?.role
  const slug: string | undefined = person?.slug?.current
  const href = slug ? `/author/${slug}/` : undefined
  const initial = name.trim().charAt(0).toUpperCase()

  if (!value?.body?.length && !value?.title) return null

  return (
    <aside className="op">
      <span className="op-mark" aria-hidden="true">”</span>

      <div className="op-head">
        <div className="op-avatar">
          {person?.imageUrl
            ? <img src={`${person.imageUrl}?w=128&h=128&fit=crop&auto=format`} alt={name} width={64} height={64} loading="lazy" />
            : <span className="op-initial">{initial}</span>}
          <span className="op-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        </div>
        <div className="op-who">
          <span className="op-kicker">Expert opinion</span>
          {href ? <a className="op-name" href={href}>{name}</a> : <span className="op-name">{name}</span>}
          {role && <span className="op-role">{role}</span>}
        </div>
      </div>

      {value.title && <h3 className="op-title">{replaceDateVars(value.title)}</h3>}

      {value.body?.length ? (
        <div className="op-body">
          <PortableText value={value.body} components={bodyComponents} />
        </div>
      ) : null}

      <div className="op-sign">
        <span className="op-sign-line" aria-hidden="true" />
        <span className="op-sign-name">{name}</span>
        {href && <a className="op-sign-link" href={href}>View profile →</a>}
      </div>
    </aside>
  )
}
