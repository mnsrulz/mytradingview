'use client';
import { ChangeEvent, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    InputAdornment,
    TextField,
    Select,
    MenuItem,
    Slider,
    TextareaAutosize,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ky from 'ky';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { DialogProps, SelectChangeEvent } from '@mui/material';
import { SearchTickerItem } from '@/lib/types';

export type AddTradeCloseDialogReason = 'cancel' | 'add';

interface ITickerProps {
    open: boolean;
    onClose: (reason: AddTradeCloseDialogReason) => void;
    ticker: SearchTickerItem | null;
}

const options = [
    { id: 'PUT_SELL', label: 'PUT_SELL' },
    { id: 'PUT_BUY', label: 'PUT_BUY' },
    { id: 'CALL_SELL', label: 'CALL_SELL' },
    { id: 'CALL_BUY', label: 'CALL_BUY' },
];

export const AddTradeDialog = (props: ITickerProps) => {
    const { onClose, open, ticker } = props;
    const theme = useTheme();
    const showFullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'));

    const [formValues, setFormValues] = useState({
        symbol: ticker?.symbol || '',
        numberOfContracts: 1,
        contractType: 'PUT_SELL',
        transactionStartDate: dayjs(),
        expiryDate: dayjs().add(7, 'days'),
        strikePrice: '',
        contractPrice: '',
        approxStockPriceAtPurchase: '',
        notes: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSliderChange = (e: Event, value: number | number[]) => {
        setFormValues((prev) => ({
            ...prev,
            numberOfContracts: value as number,
        }));
    };

    const handleDateChange = (name: string, value: Dayjs | null) => {
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // const handleContractTypeChange = (event: SelectChangeEvent) => {
    //     const value = event.target.value as string;
    //     setFormValues((prev) => ({
    //         ...prev,
    //         contractType: value,
    //     }));
    // };

    const handleSubmit = async () => {
        await ky.post('/api/trades', {
            json: formValues,
        }).json<{ id: string }>();
        onClose('add');
    };

    const onCloseRequest: DialogProps['onClose'] = (event, reason) => {
        if (reason && reason === 'backdropClick') return;
        onClose('cancel');
    };

    if (!open) return null;

    return (
        <Dialog
            open={open}
            fullScreen={showFullScreenDialog}
            fullWidth={true}
            onClose={onCloseRequest}
        >
            <DialogTitle id="scroll-dialog-title">Add trade</DialogTitle>
            <DialogContent dividers={true}>
                <Stack spacing={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TextField
                            name="symbol"
                            label="Symbol"
                            required
                            value={formValues.symbol}
                            onChange={handleChange}
                            fullWidth
                        />
                        <Select
                            name="contractType"
                            label="Type"                            
                            onChange={handleChange}
                            fullWidth
                        >
                            {options.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <Slider
                            name="numberOfContracts"
                            value={formValues.numberOfContracts}
                            onChange={handleSliderChange}
                            max={100}
                            min={1}
                            valueLabelDisplay="auto"
                        />
                        <Stack direction="row" spacing={2}>
                            <DatePicker
                                label="Transaction Start Date"
                                value={formValues.transactionStartDate}
                                onChange={(value) => handleDateChange('transactionStartDate', value)}
                                disableFuture
                                // renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                            <DatePicker
                                label="Expiry Date"
                                value={formValues.expiryDate}
                                onChange={(value) => handleDateChange('expiryDate', value)}
                                // renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                name="strikePrice"
                                label="Strike Price"
                                required
                                value={formValues.strikePrice}
                                onChange={handleChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }
                                }}
                                fullWidth
                            />
                            <TextField
                                name="contractPrice"
                                label="Contract Price"
                                required
                                value={formValues.contractPrice}
                                onChange={handleChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }
                                }}
                                fullWidth
                            />
                            <TextField
                                name="approxStockPriceAtPurchase"
                                label="Approx Stock Price at transaction time"
                                value={formValues.approxStockPriceAtPurchase}
                                onChange={handleChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }
                                }}
                                fullWidth
                            />
                        </Stack>
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
                <Button onClick={handleSubmit}>Add</Button>
            </DialogActions>
        </Dialog>
    );
};