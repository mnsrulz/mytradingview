'use client';
import { Stack, InputAdornment, Paper, Grid } from '@mui/material';
import { FormContainer, TextFieldElement, useWatch } from 'react-hook-form-mui';
import { percentageFormatter } from '@/lib/formatters';

const SubComp = (props: { mode: CalcModel }) => {
    const [riskValue] = useWatch({
        name: ['riskValue'],
    });

    const [duration] = useWatch({
        name: ['duration'],
    });

    const [expectedProfit] = useWatch({
        name: ['expectedProfit'],
    });
    const totalReturn = (expectedProfit * 1.0) / riskValue;
    const annualizedReturn = totalReturn / (duration / 365);

    return <Stack>
        <Stack direction="row" spacing={2}>Total Return: {percentageFormatter(totalReturn)}</Stack>
        <Stack direction="row" spacing={2}>Annualized Return: {percentageFormatter(annualizedReturn)}</Stack>
    </Stack>
}

type CalcModel = { riskValue: number, duration: number, expectedProfit: number }

export default function Page() {
    const dv: CalcModel = {
        riskValue: 1000,
        duration: 7,
        expectedProfit: 100
    }

    return <Paper sx={{ p: 1, mt: 2, display: 'grid', placeItems: 'normal' }}>
        <FormContainer defaultValues={dv}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <TextFieldElement name={'riskValue'} label={'Risk Value'} required fullWidth
                        slotProps={
                            {
                                input: {
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                }
                            }
                        } />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextFieldElement name={'duration'} label={'Number of Days'} required fullWidth type='number' />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextFieldElement name={'expectedProfit'} label={'Expected Profit'} required fullWidth
                        slotProps={
                            {
                                input: {
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                }
                            }
                        } />
                </Stack>
                <SubComp mode={dv} ></SubComp>
            </Stack>
        </FormContainer>
    </Paper>
}