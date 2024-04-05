import * as React from 'react';
import { SearchTickerItem, useStockPrice } from '../lib/socket';

interface ITickerProps {
    item: SearchTickerItem
}

export const StockTickerView = (props: ITickerProps) => {
    const oddata = useStockPrice(props.item);

    return <div>
        {oddata?.quoteSummary.price.regularMarketPrice}
    </div>

}