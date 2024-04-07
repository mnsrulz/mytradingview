'use client';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, InputAdornment } from '@mui/material';
import { DatePickerElement, FormContainer, TextFieldElement, TextareaAutosizeElement } from 'react-hook-form-mui';

export type CloseTradeCloseDialogReason = 'cancel' | 'close'

interface ITickerProps {
    tradeId: string,
    open: boolean,
    onClose: (reason: CloseTradeCloseDialogReason) => void
}

import type { DialogProps } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ky from 'ky';
import { useEffect, useState } from 'react';
import { Trade } from '@prisma/client';
export const CloseTradeDialog = (props: ITickerProps) => {
    const { onClose, open, tradeId } = props;
    const [trade, setTrade] = useState<Trade | null>(null);

    useEffect(() => {
        ky(`/api/trades/${tradeId}`).json<Trade>().then(j => setTrade(j));
    }, [tradeId]);

    if (!open) return <div></div>

    if (!trade) return <div>...loading</div>;

    const handleSubmit = async (data: any) => {
        await ky.post(`/api/trades/${tradeId}/close`, {
            json: { ...data, tradeId }
        }).json<{ id: string }>();
        onClose('close');
    }

    const onCloseRequest: DialogProps["onClose"] = (event, reason) => {
        if (reason && reason === "backdropClick")
            return;
        onClose('cancel');
    }

    const dv = {
        symbol: trade.symbol,
        contractPriceAtOpen: trade.contractPrice,
        tradeId: tradeId,
        notes: trade.notes,
        transactionEndDate: dayjs()
    }

    return <Dialog
        open={open}
        maxWidth={'md'}
        fullWidth={true}
        onClose={onCloseRequest}>
        <FormContainer onSuccess={handleSubmit} defaultValues={dv}>
            <DialogTitle id="scroll-dialog-title">Close trade</DialogTitle>
            <DialogContent dividers={true}>
                <Stack spacing={2}  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TextFieldElement name={'tradeId'} label={'Trade Id'} required disabled />
                        <TextFieldElement name={'symbol'} label={'Symbol'} required disabled />
                        <TextFieldElement name={'contractPriceAtOpen'} label={'Contract Price at Open'} disabled required
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                        <DatePickerElement label="Transaction End Date" name="transactionEndDate" required disableFuture={true} disablePast={false} />
                        <TextFieldElement name={'contractPriceAtClose'} label={'Contract Price at close'} required
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                        <TextareaAutosizeElement label="Notes" name="notes" rows={5} />
                    </LocalizationProvider>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose('cancel')}>Cancel</Button>
                <Button type={'submit'}>Close</Button>
            </DialogActions>
        </FormContainer>
    </Dialog>
}
