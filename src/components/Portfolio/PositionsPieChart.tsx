import { Position, PriceMap } from '@/lib/types'
import { PieChart } from '@mui/x-charts/PieChart'

export function PositionsPieChart({
  positions,
  selectedAccountId,
  priceMap,
}: {
  positions: Position[]
  selectedAccountId: string
  priceMap: PriceMap;
}) {
  
  const data = positions
    .filter(p => !selectedAccountId || p.brokerAccountId === selectedAccountId)
    .map(p => ({
      id: p.id,
      label: p.symbol,
      value: p.quantity * (priceMap && priceMap[p.symbol]?.price || 0),
    }))

  if (!data.length || !priceMap) return null

  return (
    <PieChart
      series={[{ data }]}
      width={600}
      height={400}
    />
  )
}
