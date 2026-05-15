import { Dialog, DialogContent, DialogTitle, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { DialogProps } from '@toolpad/core';
import { AggregatedPosition } from '@/lib/usePortfolio';
import { PositionPayload } from '@/lib/types';

export const PositionPickerDialog = ({ payload, onClose, open }: DialogProps<AggregatedPosition, PositionPayload | null>) => {
    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="sm"
            onClose={() => onClose(null)}
        >
            <DialogTitle>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                    Positions
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, minHeight: '300px' }}>

                <List disablePadding>
                    {payload.accounts.map((account) => (
                        <ListItemButton
                            key={account.id}
                            onClick={() => onClose({
                                symbol: payload.symbol,
                                brokerAccountId: account.brokerAccountId,
                                costBasis: account.costBasis,
                                quantity: account.quantity,
                                id: account.id,
                                notes: account.notes
                            })}
                            divider
                            sx={{ py: 1.5 }}
                        >
                            <ListItemText
                                primary={account.accountName}
                                slotProps={{
                                    primary: {
                                        fontWeight: 500, color: 'primary.main'
                                    }
                                }}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
}