'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { BrokerAccount, Position, PositionPayload } from '@/lib/types'
import { useNotifications } from '@toolpad/core'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  onAdd: (position:PositionPayload)=> Promise<any>
  onUpdate: (positionId: string, payload: PositionPayload)=> Promise<any>
  accounts: BrokerAccount[]
  defaultAccountId?: string
  position: Position | null
}

export const PositionFormDialog = ({
  open,
  onClose,
  onSaved,
  accounts,
  position,
  defaultAccountId,
  onAdd,
  onUpdate,
}: Props) => {
  const notifications = useNotifications();
  const isEdit = Boolean(position)

  const [form, setForm] = useState({
    symbol: '',
    quantity: '',
    brokerAccountId: defaultAccountId || '',
    costBasis: '',
    notes: '',
  })

  useEffect(() => {
    if (position) {
      setForm({
        symbol: position.symbol,
        quantity: position.quantity.toString(),
        brokerAccountId: position.brokerAccountId,
        costBasis: position.costBasis?.toString() ?? '',
        notes: position.notes ?? '',
      })
    } else {
      setForm({
        symbol: '',
        quantity: '',
        brokerAccountId: defaultAccountId || '',
        costBasis: '',
        notes: '',
      })
    }
  }, [position, open])

  const submit = async () => {
    if (!form.brokerAccountId) {
      notifications.show('Please select a broker account', { severity: 'error' });
      return
    }
    try {
      const payload = {
        symbol: form.symbol.toUpperCase(),
        quantity: Number(form.quantity),
        brokerAccountId: form.brokerAccountId,
        costBasis: form.costBasis ? Number(form.costBasis) : undefined,
        notes: form.notes || undefined,
      }

      if (isEdit) {
        await onUpdate(position!.id, payload)
      } else {
        await onAdd(payload)
      }
      notifications.show(`Position ${isEdit ? 'updated' : 'added'} successfully`, { severity: 'success' });
      onSaved()
      onClose()
    } catch (error) {
      notifications.show('Error saving position', { severity: 'error' });
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? 'Edit Position' : 'Add Position'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            id='symbol'
            label="Symbol"
            value={form.symbol}
            disabled={isEdit}
            variant="outlined"
            onChange={e => setForm({ ...form, symbol: e.target.value })}
            required
          />

          <TextField
            id='brokerAccount'
            select
            label="Broker Account"
            value={form.brokerAccountId}
            disabled={isEdit}
            onChange={e =>
              setForm({ ...form, brokerAccountId: e.target.value })
            }
            required
          >
            {accounts.map(acc => (
              <MenuItem key={acc.id} value={acc.id}>
                {acc.broker} — {acc.accountName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={isEdit ? 'New Quantity' : 'Quantity'}
            type="number"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
            required
          />

          <TextField
            label="Cost Basis (optional)"
            type="number"
            value={form.costBasis}
            onChange={e => setForm({ ...form, costBasis: e.target.value })}
          />

          <TextField
            label="Notes"
            multiline
            minRows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>
          {isEdit ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
