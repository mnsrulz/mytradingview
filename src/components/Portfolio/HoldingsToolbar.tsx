import { BrokerAccount } from '@/lib/types'
import {
  Button,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { AccountFormDialog } from './AccountFormDialog';

export function HoldingsToolbar({
  accounts,
  selectedAccountId,
  onAccountChange,
  viewMode,
  onViewModeChange,
  onAddPosition,
  onAddAccount,
  onRefresh
}: {
  accounts: BrokerAccount[]
  selectedAccountId: string
  onAccountChange: (id: string) => void
  viewMode: 'table' | 'pie'
  onViewModeChange: (mode: 'table' | 'pie') => void
  onAddPosition: () => void
  onAddAccount: (broker: string, accountName: string, accountNumber?: string | undefined) => Promise<any>
  onRefresh: () => void
}) {
  const [open, setOpen] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const handleNewAccountsClick = () => {
    setOpen(true);
    setSelectOpen(false);
  }

  return (<>

    <Stack direction="row" spacing={2} alignItems="center">
      <Select
        size="small"
        value={selectedAccountId}
        onChange={e => onAccountChange(e.target.value)}
        open={selectOpen}
        onOpen={() => setSelectOpen(true)}
        onClose={() => setSelectOpen(false)}
        displayEmpty
      >
        <MenuItem value="">All Accounts</MenuItem>
        {accounts.map(acc => (
          <MenuItem key={acc.id} value={acc.id}>
            {acc.broker} - {acc.accountName}
          </MenuItem>
        ))}
        <MenuItem disabled divider />
        <ListSubheader disableSticky>
          <Button
            startIcon={<AddIcon />}
            fullWidth
            onClick={handleNewAccountsClick}
            sx={{ justifyContent: 'flex-start' }}
          >
            Add new account
          </Button>
        </ListSubheader>
      </Select>

      <Button onClick={onAddPosition}>+ Add Position</Button>

      <ToggleButtonGroup
        size="small"
        value={viewMode}
        exclusive
        onChange={(_, v) => v && onViewModeChange(v)}
      >
        <ToggleButton value="table">Table</ToggleButton>
        <ToggleButton value="pie">Pie</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
    <AccountFormDialog
      open={open}
      onClose={() => setOpen(false)}
      onSaved={onRefresh}
      onAdd={onAddAccount}
    />
  </>
  )
}
