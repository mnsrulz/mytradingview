import { PositionPricing } from '@/lib/usePortfolio';
import { PieChart } from '@mui/x-charts/PieChart'
export function PositionsPieChart({
  positions,
  selectedAccountId
}: {
  positions: PositionPricing[]
  selectedAccountId: string
}) {
  
  const groupedPositions = positions
    .filter(p => !selectedAccountId || p.brokerAccountId === selectedAccountId)
    .reduce((acc, p) => {
    if (!acc[p.symbol]) acc[p.symbol] = 0
    acc[p.symbol] += p.quantity * p.price
    return acc
  }, {} as Record<string, number>);

  const data = Object.entries(groupedPositions).map(([symbol, value]) => ({
    id: symbol,
    label: symbol,
    value,
  }))
    
  if (!data.length) return null

  return (
    <PieChart
      series={[{ data }]}
      width={600}
      height={400}
    />
  )
}
