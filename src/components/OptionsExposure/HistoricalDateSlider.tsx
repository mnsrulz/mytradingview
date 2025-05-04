'use client';
import { Slider } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Grid, IconButton, Paper } from "@mui/material";
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

type IHistoricalDateSliderPorps = { dates: string[], currentValue: string, onChange: (v: string) => void }
export const HistoricalDateSlider = (props: IHistoricalDateSliderPorps) => {
    const { dates, onChange, currentValue } = props;
    const [value, setValue] = useState<number>(dates.indexOf(currentValue || ''));
    const hasPrevious = dates.indexOf(currentValue) > 0;
    const hasNext = dates.indexOf(currentValue) < dates.length - 1;
    const strikePriceMarks = useMemo(() => {
        const marks = dates.map((m, ix) => ({ value: ix, label: dayjs(m).format('D MMM') }));
        const maxMarks = 5;
        if (dates.length <= maxMarks) return marks;
        const result = [];
        const step = (marks.length - 1) / (maxMarks - 1);
        for (let i = 0; i < maxMarks; i++) {
            result.push(marks[Math.round(i * step)]);
        }
        return result;
    }, [dates]);

    useEffect(() => {
        if (currentValue && dates.indexOf(currentValue)) {
            setValue(dates.indexOf(currentValue));
        }
    }, [currentValue, dates]);


    const handlePreviousClick = () => {
        const currentIx = dates.indexOf(currentValue);
        const nextValue = dates.at(currentIx - 1);
        nextValue && onChange(nextValue);
    }

    const handleNextClick = () => {
        const currentIx = dates.indexOf(currentValue);
        const nextValue = dates.at(currentIx + 1);
        nextValue && onChange(nextValue);
    }

    return <Paper>
        <Grid container>
            <Grid>
                <IconButton size="small" disabled={!hasPrevious} onClick={handlePreviousClick}>
                    <SkipPreviousIcon />
                </IconButton>
            </Grid>
            <Grid size="grow">
                <Slider
                    value={value}
                    onChange={(e, v) => setValue(v as number)}
                    onChangeCommitted={(e, v) => onChange(dates[v as number])}
                    getAriaValueText={(v, ix) => dates[ix]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => dayjs(dates[v]).format('D MMM')}
                    marks={strikePriceMarks}
                    min={0}
                    max={dates.length - 1}                    
                    step={1} />
            </Grid>
            <Grid>
                <IconButton size="small" disabled={!hasNext} onClick={handleNextClick}>
                    <SkipNextIcon />
                </IconButton>
            </Grid>
        </Grid>
    </Paper>
};
