'use client';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    InputAdornment,
    Grid,
    TextField,
    TextareaAutosize,
    useMediaQuery,
    useTheme,
    DialogProps,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ky from 'ky';
import { useEffect, useState } from 'react';
import { Trade } from '@prisma/client';
import { mapTradeToView } from '@/lib/useTrades';
import { currencyFormatter, fixedCurrencyFormatter, percentageFormatter } from '@/lib/formatters';
import { TickerName } from './TickerName';

export type CloseTradeCloseDialogReason = 'cancel' | 'close';

interface ITickerProps {
    tradeId: string;
    open: boolean;
    onClose: (reason: CloseTradeCloseDialogReason) => void;
}

const SubComp = (props: { t: Trade; formValues: any }) => {
    const { t, formValues } = props;

    const t1 = mapTradeToView({
        ...t,
        contractPriceAtClose: formValues.contractPriceAtClose,
        transactionEndDate: formValues.transactionEndDate,
    });

    return (
        <Stack>
        <Grid container>
            <Grid size={12}><TickerName trade={t1} /></Grid>
            <Grid size={6}>Max Profit: {fixedCurrencyFormatter(t1.maximumProfit)}</Grid>
            <Grid size={6}>Expected Profit per day: {currencyFormatter(t1.averageProfitPerDay)}</Grid>
            <Grid size={12}>Expected TotalReturn/Annual Return: {percentageFormatter(t1.maxReturn)}/{percentageFormatter(t1.maxAnnualizedReturn)}</Grid>
            <Grid>Estimated Profit: {fixedCurrencyFormatter(t1.actualProfit)}</Grid>
            <Grid size={12}>Estimated Annualized Returns: {percentageFormatter(t1.actualAnnualizedReturn)}</Grid>
            <Grid>Estimated profit per day: {fixedCurrencyFormatter(t1.actualProfitPerDay)}</Grid>
        </Grid>
    </Stack>
    );
};

export const CloseTradeDialog = (props: ITickerProps) => {
    const { onClose, open, tradeId } = props;
    const [trade, setTrade] = useState<Trade | null>(null);
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));

    const [formValues, setFormValues] = useState({
        transactionEndDate: dayjs(),
        contractPriceAtClose: '',
        notes: '',
    });

    useEffect(() => {
        ky(`/api/trades/${tradeId}`)
            .json<Trade>()
            .then((j) => setTrade(j));
    }, [tradeId]);

    if (!open) return null;

    if (!trade) return <div>...loading</div>;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (name: string, value: Dayjs | null) => {
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        await ky.post(`/api/trades/${tradeId}/close`, {
            json: { ...formValues, tradeId },
        }).json<{ id: string }>();
        onClose('close');
    };

    const onCloseRequest: DialogProps['onClose'] = (event, reason) => {
        if (reason && reason === 'backdropClick') return;
        onClose('cancel');
    };

    return (
        <Dialog
            open={open}
            fullScreen={matches}
            fullWidth={true}
            onClose={onCloseRequest}
        >
            <DialogTitle id="scroll-dialog-title">Close trade</DialogTitle>
            <DialogContent dividers={true}>
                <Stack rowGap={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <SubComp t={trade} formValues={formValues} />
                        <DatePicker
                            label="Transaction End Date"
                            value={formValues.transactionEndDate}
                            onChange={(value) => handleDateChange('transactionEndDate', value)}                            
                        />
                        <TextField
                            name="contractPriceAtClose"
                            label="Contract Price at Close"
                            required
                            value={formValues.contractPriceAtClose}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            fullWidth
                        />
                        <TextareaAutosize
                            name="notes"
                            placeholder="Notes"
                            value={formValues.notes}
                            onChange={handleChange}
                            minRows={5}
                            style={{ width: '100%' }}
                        />
                    </LocalizationProvider>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose('cancel')}>Cancel</Button>
                <Button onClick={handleSubmit}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
