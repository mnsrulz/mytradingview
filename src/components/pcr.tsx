import { IOptionsGrid, NumberRange, OptionsInnerData } from "@/lib/types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { StrikePriceSlider } from "./StrikePriceSlider";
import { axisClasses } from '@mui/x-charts';
import { useState } from "react";

interface ITickerProps {
    open: boolean,
    data: OptionsInnerData,
    onClose: () => void,
    currentPrice: number
}

const valueFormatter = (value: number | null) => `${value}`;
const chartSetting = {
    yAxis: [
        {
            label: 'Open interest',
        },
    ],
    // width: 500,
    colors: ['red', 'green'],
    height: 500,
    sx: {
        [`.${axisClasses.left} .${axisClasses.label}`]: {
            //transform: 'translate(-20px, 0)',
        },
    },
};

export const Pcr = (props: ITickerProps) => {
    const { open, onClose, data, currentPrice } = props;
    const allStrikePrices = Object.keys(data.c);
    const allStrikePricesValues = allStrikePrices?.map(Number)
    const thresholdValue = currentPrice * 0.1;
    const [strikePriceRange, setStrikePriceRange] = useState<NumberRange>({
        start: Math.round(currentPrice - thresholdValue),
        end: Math.round(currentPrice + thresholdValue)
    });

    const workingStrikePrices = allStrikePrices.map(s => ({
        strikePrice: s,
        value: Number(s)
    })).filter(n => n.value >= strikePriceRange.start && n.value <= strikePriceRange.end);

    const dataset = workingStrikePrices.map(d => {
        return {
            strike: d.value,
            p: data.p[d.strikePrice].oi,
            c: data.c[d.strikePrice].oi
        }
    })

    return (
        <Dialog fullWidth={true} fullScreen={true} open={open} onClose={onClose} aria-labelledby="pcr-dialog">
            <DialogTitle id="pcr-dialog">Put Call Ratio - {currentPrice}</DialogTitle>
            <DialogContent>
                <StrikePriceSlider currentPrice={currentPrice}
                    allStrikePricesValues={allStrikePricesValues}
                    onChange={setStrikePriceRange}
                    strikePriceRange={strikePriceRange}
                />
                <BarChart
                    dataset={dataset}
                    xAxis={[{
                        scaleType: 'band',
                        dataKey: 'strike',
                        disableTicks: true,


                        // categoryGapRatio: 0.8,
                        // barGapRatio: 1
                    }]}
                    series={[
                        { dataKey: 'p', label: 'Put', valueFormatter },
                        { dataKey: 'c', label: 'Calls', valueFormatter }
                    ]}
                    {...chartSetting}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};