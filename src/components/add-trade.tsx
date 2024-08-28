'use client';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, InputAdornment } from '@mui/material';
import { FormContainer, SelectElement, SliderElement, TextFieldElement, TextareaAutosizeElement } from 'react-hook-form-mui';
import { DatePickerElement } from 'react-hook-form-mui/date-pickers';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

interface ITickerProps {
    //onChange: (value: SearchTickerItem) => void,
    open: boolean,
    onClose: () => void,
    ticker: SearchTickerItem | null
}

// export const AddTrade = (props: ITickerProps) => {
//     const [open, setOpen] = useState(false);
//     const handleClose = () => {
//         setOpen(false);
//     };

//     return <GridActionsCellItem
//         key='AddTrade'
//         icon={<AddTradeIcon />}
//         label="Add trade"
//         onClick={() => {
//             // setCurrentStock(row);
//             // setOpen(true);
//         }} />
// }

type FormValues = {
    symbol: string
    currentPrice: string
    email: string
}

const options = [{
    id: 'PUT_SELL',
    label: 'PUT_SELL'
}, {
    id: 'PUT_BUY',
    label: 'PUT_BUY'
}, {
    id: 'CALL_SELL',
    label: 'CALL_SELL'
},
{
    id: 'CALL_BUY',
    label: 'CALL_BUY'
}];
import type { DialogProps } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import ky from 'ky';
import { SearchTickerItem } from '@/lib/types';
export const AddTradeDialog = (props: ITickerProps) => {
    const { onClose, open, ticker } = props;
    const theme = useTheme();
    const showFullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'));

    if (!open) return <div></div>
    const handleSubmit = async (data: any) => {
        await ky.post('/api/trades', {
            json: data
        }).json<{ id: string }>();
        onClose();
    }

    const onCloseRequest: DialogProps["onClose"] = (event, reason) => {
        if (reason && reason === "backdropClick")
            return;
        onClose();
    }

    const dv = {
        symbol: ticker?.symbol,
        numberOfContracts: 1,
        contractType: 'PUT_SELL',
        transactionStartDate: dayjs(),
        expiryDate: dayjs().add(7, 'days'),
    }

    return <Dialog
        open={open}
        // maxWidth={'md'}
        fullScreen={showFullScreenDialog}
        fullWidth={true}
        onClose={onCloseRequest}>
        <FormContainer onSuccess={handleSubmit} defaultValues={dv}>
            <DialogTitle id="scroll-dialog-title">Add trade</DialogTitle>
            <DialogContent dividers={true}>
                {/* Hi I am in add trade: {ticker.symbol} */}
                <Stack spacing={2}  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TextFieldElement name={'symbol'} label={'Symbol'} required />
                        <SelectElement name={'contractType'} label={'Type'} options={options} fullWidth />
                        <SliderElement name={"numberOfContracts"} label='Number of contracts' max={20} min={1} />
                        <Stack direction="row" spacing={2}>
                            <DatePickerElement label="Transaction Start Date" name="transactionStartDate" required disableFuture={true} disablePast={false} />
                            <DatePickerElement label="Expiry Date" name="contractExpiry" required disableFuture={false} disablePast={false} />
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <TextFieldElement name={'strikePrice'} label={'Strike Price'} required
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                            <TextFieldElement name={'contractPrice'} label={'Contract Price'} required
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                            <TextFieldElement name={'approxStockPriceAtPurchase'} label={'Approx Stock Price at transaction time'}
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                        </Stack>
                        <TextareaAutosizeElement label="Notes" name="notes" rows={5} />
                    </LocalizationProvider>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type={'submit'}>Add</Button>
            </DialogActions>
        </FormContainer>
    </Dialog>
}