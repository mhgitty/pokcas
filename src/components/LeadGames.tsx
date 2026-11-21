import { GameEmbed } from './GameEmbed'

/**
 * Game blocks placed at the very start of a page body are lifted out of the
 * article column and shown full width (same width as hero + body + TOC).
 * Game blocks further down the body stay inline.
 */
export function splitLeadGames(body: any[] | null | undefined): { games: any[]; rest: any[] } {
  if (!Array.isArray(body)) return { games: [], rest: [] }
  let i = 0
  while (i < body.length && body[i]?._type === 'gameEmbedBlock') i++
  return { games: body.slice(0, i), rest: i ? body.slice(i) : body }
}

export function LeadGames({ games }: { games: any[] }) {
  if (!games.length) return null
  return (
    <div className="lead-games">
      {games.map((g) => <GameEmbed key={g._key} game={g.game} />)}
    </div>
  )
}
