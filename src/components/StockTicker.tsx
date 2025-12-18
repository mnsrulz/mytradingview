'use client';
import * as React from 'react';
import { useStockPrice } from '../lib/socket';
import { SearchTickerItem, StockPriceData } from '@/lib/types';
import { numberFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { ListItemText } from '@mui/material';
import { green, red } from "@mui/material/colors";
import NumberFlow from '@number-flow/react'
import { useInView } from "react-intersection-observer";

const [primaryTextSize, secondaryTextSize] = ['1em', '0.85em'];

interface ITickerProps {
    item: SearchTickerItem
}

export const StockTickerView = (props: ITickerProps) => {
    const oddata = useStockPrice(props.item);
    if (oddata && oddata.quoteSummary) {
        return <StockTickerViewInternal oddata={oddata} />;
    }
    return <div></div>;
}

const StockTickerViewInternal = (props: { oddata: StockPriceData }) => {
    const { quoteSummary } = props.oddata;
    const [price, change, changePercent] = (quoteSummary.hasPrePostMarketData && ['POST', 'POSTPOST', 'PRE'].includes(quoteSummary.marketState) && (quoteSummary.postMarketPrice || quoteSummary.preMarketPrice)) ?
        [quoteSummary.postMarketPrice || quoteSummary.preMarketPrice, quoteSummary.postMarketChange || quoteSummary.preMarketChange, quoteSummary.postMarketChangePercent || quoteSummary.preMarketChangePercent]
        : [quoteSummary.regularMarketPrice, quoteSummary.regularMarketChange, quoteSummary.regularMarketChangePercent];

    const secondaryColor = changePercent < 0 ? red[500] : green[500];
    const [ref, inView] = useInView();

    const primaryEl = inView ? <NumberFlow
        value={price}
        locales="en-US"
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
    /> : numberFormatter(price)

    const secondaryEl = inView ? <>
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
    </> : `${positiveNegativeNumberFormatter(change)} ${positiveNegativeNumberFormatter(changePercent)}%`

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