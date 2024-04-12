'use client';
import { ITradeView } from "@/lib/types";
import { shortDateFormatter } from "./trades";


export const TickerName = (p: { trade: ITradeView; }) => {
    const { trade } = p;
    return <div>{trade.symbol} {trade.strikePrice as unknown as string} {shortDateFormatter(trade.contractExpiry as unknown as string)} x {trade.numberOfContracts}</div>;
};
