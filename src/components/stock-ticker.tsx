import * as React from 'react';
import { useStockPrice } from '../lib/socket';
import { SearchTickerItem } from '@/lib/types';
import { currencyFormatter, numberFormatter, percentageFormatter, positiveNegativeNumberFormatter } from '@/lib/formatters';
import { ListItem, ListItemText, Typography } from '@mui/material';
import { green, red } from "@mui/material/colors";

const [primaryTextSize, secondaryTextSize] = ['0.8em', '0.75em'];

interface ITickerProps {
    item: SearchTickerItem
}

export const StockTickerView = (props: ITickerProps) => {
    const oddata = useStockPrice(props.item);
    if (oddata) {
        const { quoteSummary } = oddata;
        const [price, change, changePercent] = (quoteSummary.hasPrePostMarketData && quoteSummary.marketState == 'POST') ?
            [quoteSummary.postMarketPrice, quoteSummary.postMarketChange, quoteSummary.postMarketChangePercent]
            : [quoteSummary.regularMarketPrice, quoteSummary.regularMarketChange, quoteSummary.regularMarketChangePercent];

        const secondaryColor = changePercent < 0 ? red[500] : green[500];
        const secondaryText = `${positiveNegativeNumberFormatter(change)} ${positiveNegativeNumberFormatter(changePercent)}%`
        return <ListItemText
            primaryTypographyProps={{
                fontSize: primaryTextSize
            }}
            secondaryTypographyProps={{
                fontSize: secondaryTextSize,
                color: secondaryColor
            }}
            primary={numberFormatter(price)}
            secondary={secondaryText}
        />
    }

    return <div></div>;
}

export const StockTickerSymbolView = (props: ITickerProps) => {
    const { name, symbol } = props.item;
    return <ListItemText
        primaryTypographyProps={{
            fontSize: primaryTextSize
        }}
        secondaryTypographyProps={{
            fontSize: secondaryTextSize,
        }}
        primary={symbol}
        secondary={name}
    />
}