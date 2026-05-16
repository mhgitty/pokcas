import { BonusCard } from './BonusCard'
import { BookmakerCard } from './BookmakerCard'

// Data comes from the comparisonTableTemplate document (expanded by the query)
interface ComparisonTableData {
  tableType?: 'bonus' | 'bookmaker'
  bonuses?: any[]
  bookmakers?: any[]
}

interface ComparisonTableProps {
  data?: ComparisonTableData | null
}

export function ComparisonTable({ data }: ComparisonTableProps) {
  if (!data) return null

  if (data.tableType === 'bookmaker') {
    const items = data.bookmakers || []
    if (!items.length) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((bm: any, i: number) => (
          <BookmakerCard key={bm._id} {...bm} rank={i + 1} />
        ))}
      </div>
    )
  }

  // Default: bonus
  const items = data.bonuses || []
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.map((bonus: any, i: number) => (
        <BonusCard key={bonus._id} {...bonus} rank={i + 1} />
      ))}
    </div>
  )
}
