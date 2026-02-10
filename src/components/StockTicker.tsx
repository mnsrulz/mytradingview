'use client';
import * as React from 'react';
import { useStockPrice } from '../lib/socket';
import { SearchTickerItem, StockPriceData } from '@/lib/types';
import { numberFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { ListItemText } from '@mui/material';
import { green, red } from "@mui/material/colors";
import NumberFlow from '@number-flow/react'
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState } from 'react';

const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];

interface ITickerProps {
    item: SearchTickerItem
}

export const StockTickerView = (props: ITickerProps) => {
    const oddata = useStockPrice(props.item);
    if (oddata && oddata.quoteSummary) {
        return <StockTickerViewInternal {...oddata} />;
    }
    return <div></div>;
}

const StockTickerViewInternal = (props: { price: number, change: number, changePercent: number }) => {
    const { price, change, changePercent } = props;

    const secondaryColor = changePercent < 0 ? red[500] : green[500];
    const [ref, inView] = useInView();

    const prevPriceRef = useRef<number | null>(null);
    const [flash, setFlash] = useState<'up' | 'down' | null>(null);
    const flashColor = flash === 'up' ? green[500] : flash === 'down' ? red[500] : undefined;

    useEffect(() => {
        if (prevPriceRef.current !== null && price !== prevPriceRef.current) {
            setFlash(price > prevPriceRef.current ? 'up' : 'down');
            prevPriceRef.current = price;
            const t = setTimeout(() => setFlash(null), 400);
            return () => clearTimeout(t);
        }
        prevPriceRef.current = price;
    }, [price]);

    const primaryEl = inView ? <span style={{
        color: flashColor,
        transition: 'color 150ms ease',
    }}><NumberFlow
            value={price}
            locales="en-US"
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        /></span> : numberFormatter(price)

    const secondaryEl = inView ? <span style={{
        color: flashColor,
        transition: 'color 150ms ease',
    }}>
        <NumberFlow
            value={isNaN(change) ? 0 : change}
            locales="en-US"
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }}
        />
        &nbsp;
        (
        <NumberFlow
            value={isNaN(changePercent) ? 0 : changePercent / 100}
            locales="en-US"
            color={secondaryColor}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'percent', signDisplay: 'never' }}
        />
        )
    </span> : `${positiveNegativeNumberFormatter(change)} ${positiveNegativeNumberFormatter(changePercent)}%`

    return <ListItemText
        ref={ref}
        slotProps={{
            primary: {
                fontSize: primaryTextSize
            },
            secondary: {
                fontSize: secondaryTextSize,
                color: secondaryColor
            }
        }}
        primary={primaryEl}
        secondary={secondaryEl}
    />
}

export const StockTickerSymbolView = (props: ITickerProps) => {
    const { name, symbol } = props.item;
    return <ListItemText
        slotProps={{
            primary: {
                fontSize: primaryTextSize
            },
            secondary: {
                fontSize: secondaryTextSize,
            }
        }}
        primary={symbol}
        secondary={name}
    />
}