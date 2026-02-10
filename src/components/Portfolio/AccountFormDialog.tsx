'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useNotifications } from '@toolpad/core'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  onAdd: (broker: string, accountName: string, accountNumber?: string) => Promise<void>
}

export function AccountFormDialog({
  open,
  onClose,
  onSaved,
  onAdd
}: Props) {
  const notifications = useNotifications();
  const [form, setForm] = useState({
    broker: '',
    accountName: '',
    accountNumber: '',
  })

  const submit = async () => {
    try {
      await onAdd(form.broker, form.accountName, form.accountNumber);
      notifications.show('Account created successfully', { severity: 'success' });
    } catch (err) {
      notifications.show('Error creating account', { severity: 'error' });
      return;
    }

    setForm({ broker: '', accountName: '', accountNumber: '' })
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New Broker Account</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Broker"
            value={form.broker}
            onChange={e => setForm({ ...form, broker: e.target.value })}
            required
          />

          <TextField
            label="Account Name"
            value={form.accountName}
            onChange={e =>
              setForm({ ...form, accountName: e.target.value })
            }
            required
          />

          <TextField
            label="Account Number (optional)"
            value={form.accountNumber}
            onChange={e =>
              setForm({ ...form, accountNumber: e.target.value })
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}
