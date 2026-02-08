import { Position } from '@/lib/types'
import { PieChart } from '@mui/x-charts/PieChart'

export function PositionsPieChart({
  positions,
  selectedAccountId,
}: {
  positions: Position[]
  selectedAccountId: string
}) {
  const data = positions
    .filter(p => !selectedAccountId || p.brokerAccountId === selectedAccountId)
    .map(p => ({
      id: p.id,
      label: p.symbol,
      value: p.quantity,
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
