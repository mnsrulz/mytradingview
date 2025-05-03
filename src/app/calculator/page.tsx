'use client';
import { useState } from 'react';
import { Stack, InputAdornment, Paper, TextField } from '@mui/material';
import { percentageFormatter } from '@/lib/formatters';

const SubComp = (props: { riskValue: number; duration: number; expectedProfit: number }) => {
    const { riskValue, duration, expectedProfit } = props;

    const totalReturn = (expectedProfit * 1.0) / riskValue;
    const annualizedReturn = totalReturn / (duration / 365);

    return (
        <Stack>
            <Stack direction="row" spacing={2}>
                Total Return: {percentageFormatter(totalReturn)}
            </Stack>
            <Stack direction="row" spacing={2}>
                Annualized Return: {percentageFormatter(annualizedReturn)}
            </Stack>
        </Stack>
    );
};

export default function Page() {
    const [formValues, setFormValues] = useState({
        riskValue: 1000,
        duration: 7,
        expectedProfit: 100,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value === '' ? '' : parseFloat(value), // Ensure numeric values
        }));
    };

    return (
        <Paper sx={{ p: 1, mt: 2, display: 'grid', placeItems: 'normal' }}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <TextField
                        name="riskValue"
                        label="Risk Value"
                        required
                        fullWidth
                        value={formValues.riskValue}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                    />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                        name="duration"
                        label="Number of Days"
                        required
                        fullWidth
                        type="number"
                        value={formValues.duration}
                        onChange={handleChange}
                    />
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                        name="expectedProfit"
                        label="Expected Profit"
                        required
                        fullWidth
                        value={formValues.expectedProfit}
                        onChange={handleChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                    />
                </Stack>
                <SubComp
                    riskValue={formValues.riskValue}
                    duration={formValues.duration}
                    expectedProfit={formValues.expectedProfit}
                />
            </Stack>
        </Paper>
    );
}