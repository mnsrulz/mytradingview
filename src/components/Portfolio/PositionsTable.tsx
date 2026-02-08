import { Position, BrokerAccount } from '@/lib/types'
import { usePortfolio } from '@/lib/usePortfolio'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material'
import { useDialogs, useNotifications } from '@toolpad/core'

export function PositionsTable({
  loading,
  positions,
  selectedAccountId,
  onEdit,
  onDeleted,
}: {
  loading: boolean
  positions: Position[]
  selectedAccountId: string
  onEdit: (p: Position) => void
  onDeleted: () => void
}) {
  const { deletePosition } = usePortfolio();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const handleDelete = async (positionId: string) => {
    const confirm = await dialogs.confirm('Delete Position?', {
      okText: 'Yes',
      cancelText: 'No',
    });
    if (confirm) {
      await deletePosition(positionId).then(onDeleted);
      notifications.show('Position deleted', { severity: 'success' });
      onDeleted();
    }
  }
  if (loading) return <p>Loading...</p>

  const filtered = selectedAccountId
    ? positions.filter(p => p.brokerAccountId === selectedAccountId)
    : positions

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Symbol</TableCell>
          <TableCell>Qty</TableCell>
          <TableCell>Cost Basis</TableCell>
          <TableCell>Notes</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>

      <TableBody>
        {filtered.map(p => (
          <TableRow key={p.id}>
            <TableCell>{p.symbol}</TableCell>
            <TableCell>{p.quantity}</TableCell>
            <TableCell>{p.costBasis ?? '-'}</TableCell>
            <TableCell>{p.notes ?? '-'}</TableCell>
            <TableCell>
              <Button onClick={() => onEdit(p)}>Edit</Button>
              <Button color="error" onClick={() => handleDelete(p.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
