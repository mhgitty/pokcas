// Welcome email HTML for the Pokcas newsletter (Klaviyo "code" templates).
// Rules: the only Klaviyo tag used is {% unsubscribe %} (plain, not wrapped in <a>).
// Keep offers in sync with src/lib/newsletter.ts (popup copy).

const LOGO = 'https://cdn.sanity.io/images/a23xp5s4/production/5f9522862007152734d1bbf9a403328051e77e85-256x57.webp?fm=png&w=256'
const img = (u) => `${u.split('?')[0]}?fm=png&w=160&h=160&fit=crop`

export const OFFERS = {
  ca: [
    {
      casino: 'Slotsgem',
      headline: '10 No Deposit Free Spins',
      blurb: 'Sign up at Slotsgem and get 10 free spins without making a deposit. One of the highest-rated casinos on Pokcas (9/10).',
      cta: 'Claim 10 Free Spins',
      url: 'https://bandstrack.com/r/slotsgem/',
      logo: img('https://cdn.sanity.io/images/a23xp5s4/production/76dca942d0fc8103920c76ae376e8eb2b57add02-500x500.webp'),
    },
  ],
  au: [
    {
      casino: 'Fair Go Casino',
      headline: 'A$10 Free No Deposit Bonus',
      blurb: 'Get A$10 in free bonus cash at Fair Go Casino just for signing up. No deposit needed. Rated 9/10 by Pokcas.',
      cta: 'Claim A$10 Free',
      url: 'https://pokcas.com/au/go/fairgo/',
      logo: img('https://cdn.sanity.io/images/a23xp5s4/production/8f45a9a19e29124674c9c1983770941b01acba0e-500x500.webp'),
    },
    {
      casino: 'Ripper Casino',
      headline: '20 No Deposit Free Spins',
      blurb: 'Register at Ripper Casino and spin 20 times on the house. No deposit needed. Rated 9/10 by Pokcas.',
      cta: 'Claim 20 Free Spins',
      url: 'https://pokcas.com/au/go/rippercasino/',
      logo: img('https://cdn.sanity.io/images/a23xp5s4/production/22080000fb3d4bf438d55c35f45fd872a144166f-500x500.webp'),
    },
  ],
}

const COPY = {
  ca: {
    subject: 'Your 10 no deposit free spins at Slotsgem',
    preview: 'Claim 10 free spins without a deposit, straight from Pokcas.',
    heading: 'Welcome to Pokcas! Here are your free spins',
    intro: 'Thanks for joining the Pokcas newsletter. As promised, here is our best no deposit offer for Canadian players. Claim it now and play without depositing a cent.',
    moreUrl: 'https://pokcas.com/ca/online-casino/bonus/no-deposit/',
    moreLabel: 'See all no deposit bonuses in Canada',
    rg: 'Gambling should be fun. Set limits and never chase losses. For support visit ConnexOntario (1-866-531-2600) or responsiblegambling.org.',
    age: '19+',
  },
  au: {
    subject: 'Your A$10 free + 20 free spins (no deposit)',
    preview: 'Two no deposit offers for Aussie players, straight from Pokcas.',
    heading: 'Welcome to Pokcas! Here are your no deposit bonuses',
    intro: 'Thanks for joining the Pokcas newsletter. As promised, here are our two best no deposit offers for Australian players. Claim both and play without depositing a cent.',
    moreUrl: 'https://pokcas.com/au/online-casino/bonus/no-deposit/',
    moreLabel: 'See all no deposit bonuses in Australia',
    rg: 'Gambling should be fun. Set limits and never chase losses. For free, confidential support call Gambling Help Online on 1800 858 858 or visit gamblinghelponline.org.au.',
    age: '18+',
  },
}

const offerCard = (o, i) => `
<tr><td style="padding:0 28px ${i ? '16px' : '16px'};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #C8E6CA;border-radius:14px;background:#F6FBF7;">
    <tr><td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="72" valign="top" style="padding-right:16px;"><img src="${o.logo}" width="72" height="72" alt="${o.casino}" style="display:block;border-radius:12px;border:0;"></td>
        <td valign="middle">
          <div style="font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#1A7A3C;">${o.casino}</div>
          <div style="font-size:22px;line-height:28px;font-weight:800;color:#111827;margin-top:2px;">${o.headline}</div>
        </td>
      </tr></table>
      <p style="margin:14px 0 18px;font-size:15px;line-height:23px;color:#4B5563;">${o.blurb}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#1A7A3C" style="border-radius:10px;">
        <a href="${o.url}" target="_blank" style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:10px;">${o.cta} &rarr;</a>
      </td></tr></table>
      <p style="margin:12px 0 0;font-size:12px;line-height:18px;color:#9CA3AF;">New players only. T&amp;Cs apply. Please read the full terms at the casino before claiming.</p>
    </td></tr>
  </table>
</td></tr>`

export function buildEmail(market) {
  const c = COPY[market]
  const offers = OFFERS[market]
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${c.subject}</title></head>
<body style="margin:0;padding:0;background:#EEF4EF;font-family:Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${c.preview}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEF4EF;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:18px;overflow:hidden;">
  <tr><td bgcolor="#1A7A3C" style="padding:22px 28px;background:#1A7A3C;">
    <a href="https://pokcas.com/${market}/" target="_blank"><img src="${LOGO}" width="128" alt="Pokcas" style="display:block;border:0;"></a>
  </td></tr>
  <tr><td style="height:4px;background:#C9A84C;line-height:4px;font-size:0;">&nbsp;</td></tr>
  <tr><td style="padding:30px 28px 10px;">
    <h1 style="margin:0 0 12px;font-size:26px;line-height:32px;font-weight:800;color:#111827;">${c.heading}</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:25px;color:#4B5563;">${c.intro}</p>
  </td></tr>
  ${offers.map(offerCard).join('')}
  <tr><td style="padding:6px 28px 28px;">
    <p style="margin:0;font-size:15px;line-height:23px;color:#4B5563;">Want more? We update our lists every week. <a href="${c.moreUrl}" target="_blank" style="color:#1A7A3C;font-weight:700;">${c.moreLabel}</a>.</p>
    <p style="margin:18px 0 0;font-size:15px;line-height:23px;color:#4B5563;">Good luck,<br><strong style="color:#111827;">The Pokcas team</strong></p>
  </td></tr>
  <tr><td style="padding:20px 28px;background:#F9FAFB;border-top:1px solid #E5E7EB;">
    <p style="margin:0 0 10px;font-size:12px;line-height:18px;color:#6B7280;"><strong>${c.age} only.</strong> ${c.rg}</p>
    <p style="margin:0;font-size:12px;line-height:18px;color:#6B7280;">You are receiving this email because you signed up at pokcas.com. Don't want these emails anymore? {% unsubscribe %}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
  return { subject: c.subject, preview: c.preview, html }
}
