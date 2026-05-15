import { AggregatedPosition } from '@/lib/usePortfolio';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMemo } from 'react';

export const PositionsPieChart = ({
  positions,
}: {
  positions: AggregatedPosition[];
}) => {
  const { data, total } = useMemo(() => {
    const total = positions.reduce((sum, p) => sum + p.totalValue, 0);

    return {
      total,
      data: positions.map((p) => ({
        id: p.symbol,
        label: p.symbol,
        value: p.totalValue,
      })),
    };
  }, [positions]);

  if (!data.length || total === 0) return null;

  return (
    <PieChart
      series={[
        {
          data,
          arcLabel: (item) =>
            `${item.label} ${((item.value / total) * 100).toFixed(1)}%`,
          arcLabelMinAngle: 20,
          innerRadius: 60,
          outerRadius: 140,
        },
      ]}
      width={600}
      height={400}
    />
  );
};