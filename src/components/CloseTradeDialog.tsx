'use client';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, InputAdornment, Grid, useMediaQuery, useTheme } from '@mui/material';
import { FormContainer, TextFieldElement, TextareaAutosizeElement, useWatch } from 'react-hook-form-mui';
export type CloseTradeCloseDialogReason = 'cancel' | 'close';
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
import { mapTradeToView } from '@/lib/useTrades';
import { currencyFormatter, fixedCurrencyFormatter, percentageFormatter } from '@/lib/formatters';
import { TickerName } from './TickerName';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';


const SubComp = (props: { t: Trade }) => {
    const [contractPriceAtClose] = useWatch({
        name: ['contractPriceAtClose'],
    });
    
    const [transactionEndDate] = useWatch({
        name: ['transactionEndDate'],
    });

    const t1 = mapTradeToView({ ...props.t, contractPriceAtClose, transactionEndDate });
    return (
        <>
            <Stack>
                <Grid container>
                    <Grid item xs={12}><TickerName trade={t1} /></Grid>
                    <Grid item xs={6}>Max Profit: {fixedCurrencyFormatter(t1.maximumProfit)}</Grid>
                    <Grid item xs={6}>Expected Profit per day: {currencyFormatter(t1.averageProfitPerDay)}</Grid>
                    <Grid item xs={12}>Expected TotalReturn/Annual Return: {percentageFormatter(t1.maxReturn)}/{percentageFormatter(t1.maxAnnualizedReturn)}</Grid>
                    <Grid>Estimated Profit: {fixedCurrencyFormatter(t1.actualProfit)}</Grid>
                    <Grid item xs={12}>Estimated Annualized Returns: {percentageFormatter(t1.actualAnnualizedReturn)}</Grid>
                    <Grid>Estimated profit per day: {fixedCurrencyFormatter(t1.actualProfitPerDay)}</Grid>
                </Grid>
            </Stack>
        </>
    )
}

export const CloseTradeDialog = (props: ITickerProps) => {
    const { onClose, open, tradeId } = props;
    const [trade, setTrade] = useState<Trade | null>(null);
    const [p1, setp1] = useState(0);
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));

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
        transactionEndDate: dayjs(),
        contractExpiry: dayjs(trade.contractExpiry).format('MM/DD/YYYY'),
        transactionStartDate: dayjs(trade.transactionStartDate).format('MM/DD/YYYY'),
        contractPriceAtClose: trade.lastContractPrice
    }

    return <Dialog
        open={open}
        // maxWidth={'md'}
        fullScreen={matches}
        fullWidth={true}
        onClose={onCloseRequest}>
        <FormContainer onSuccess={handleSubmit} defaultValues={dv}>
            <DialogTitle id="scroll-dialog-title">Close trade</DialogTitle>
            <DialogContent dividers={true}>
                <Stack rowGap={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        {/* <Typography variant='h6'>{dv.symbol} ${dv.contractPriceAtOpen as unknown as string} - Purchased on {dv.transactionStartDate}</Typography> */}
                        <SubComp t={trade} />
                        {/* <Grid container spacing={2}>
                            <Grid item xs={6} >
                                <TextFieldElement fullWidth name={'tradeId'} label={'Trade Id'} required disabled />
                            </Grid>
                            <Grid item xs={6}>
                                <TextFieldElement fullWidth name={'symbol'} label={'Symbol'} required disabled />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextFieldElement fullWidth name={'contractPriceAtOpen'} label={'Contract Price at Open'} disabled required
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextFieldElement fullWidth name={'transactionStartDate'} label={'Purchase date'} disabled />
                            </Grid>
                        </Grid> */}
                        
                        <DatePickerElement label="Transaction End Date" name="transactionEndDate" required disableFuture={false} disablePast={false} />

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
