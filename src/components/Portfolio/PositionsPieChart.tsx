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
  
  const groupedPositions = positions
    .filter(p => !selectedAccountId || p.brokerAccountId === selectedAccountId)
    .reduce((acc, p) => {
    if (!acc[p.symbol]) acc[p.symbol] = 0
    const price = priceMap?.[p.symbol]?.price ?? 0
    acc[p.symbol] += p.quantity * price
    return acc
  }, {} as Record<string, number>);

  const data = Object.entries(groupedPositions).map(([symbol, value]) => ({
    id: symbol,
    label: symbol,
    value,
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
