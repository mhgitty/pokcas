// Newsletter popup config (CA + AU).
// KLAVIYO_* ids are public identifiers (not secrets) and are written by
// scripts/klaviyo/setup.mjs. The popup stays hidden until they are filled in.
// Keep the offers in sync with scripts/klaviyo/emails.mjs (welcome emails).

export const KLAVIYO_COMPANY_ID = 'SdSptg'

export type NewsletterMarket = 'ca' | 'au'

export const NEWSLETTER: Record<NewsletterMarket, {
  listId: string
  kicker: string
  headline: string
  sub: string
  perks: string[]
  button: string
  success: string
  age: string
}> = {
  ca: {
    listId: 'XhQwvM',
    kicker: 'Free for Canadian players',
    headline: 'Get 10 No Deposit Free Spins',
    sub: "Join the Pokcas newsletter and we'll email you Slotsgem's 10 no deposit free spins.",
    perks: ['10 free spins at Slotsgem, no deposit needed', 'New no deposit bonuses before anyone else', 'No spam. Unsubscribe anytime'],
    button: 'Send me the free spins',
    success: 'Almost there! Check your inbox and confirm your email. Your 10 no deposit free spins arrive right after.',
    age: '19+',
  },
  au: {
    listId: 'U6835g',
    kicker: 'Free for Aussie players',
    headline: 'Get A$10 Free + 20 Free Spins',
    sub: "Join the Pokcas newsletter and we'll email you two no deposit offers. No deposit needed for either.",
    perks: ['A$10 no deposit bonus at Fair Go Casino', '20 no deposit free spins at Ripper Casino', 'No spam. Unsubscribe anytime'],
    button: 'Send me the bonuses',
    success: 'Almost there! Check your inbox and confirm your email. Your A$10 free bonus and 20 free spins arrive right after.',
    age: '18+',
  },
}
