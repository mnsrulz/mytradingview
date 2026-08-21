import type { GridColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { percentageFormatter } from '@/lib/formatters';
import { NumberRange, OptionsInnerData, OptionsPricingGridRow, OptionsQuote, PriceModeTypeEnum, PutCallType, ValueModeTypeEnum } from '@/lib/types';

export type StrikePriceItem = { strikePrice: string, value: number }

export type ConditionalFormattingSpec = { enabled: boolean, multiplier: number }

export const getPriceByMode = (quote: OptionsQuote | undefined, priceMode: PriceModeTypeEnum): number | null => {
    switch (priceMode) {
        case 'LAST_PRICE':
            return quote?.l ?? null;
        case 'ASK_PRICE':
            return quote?.a ?? null;
        case 'AVG_PRICE':
            return (quote?.a !== undefined && quote?.b !== undefined) ? (quote.a + quote.b) / 2 : null;
        default:
            return quote?.b ?? null;
    }
}

export type GetValueByModeParams = {
    price: number,
    strikeValue: number,
    targetPrice: number,
    costBasis: number,
    putCallType: PutCallType,
    valueMode: ValueModeTypeEnum,
    daysToExpiry: number,
    openInterest?: number,
    volume?: number
}

export const getValueByMode = (params: GetValueByModeParams): number | string | null => {
    const { price, strikeValue, targetPrice, costBasis, putCallType, valueMode, daysToExpiry, openInterest, volume } = params;
    switch (valueMode) {
        case 'TOTAL_RETURN':
            if (putCallType == PutCallType.PUT) {
                return (targetPrice > strikeValue ? price : (price - (strikeValue - targetPrice))) / (strikeValue);
            } else {
                const sellCost = targetPrice >= strikeValue ? (price + strikeValue) : (targetPrice + price);
                return (sellCost - costBasis) / costBasis;
            }
        case 'ANNUAL_RETURN':
            if (putCallType == PutCallType.PUT) {
                const sellCost = (targetPrice > strikeValue ? price : (price - (strikeValue - targetPrice)));
                const risk = strikeValue;
                return (sellCost / risk) * (365 / daysToExpiry);
            } else {
                const sellCost = targetPrice >= strikeValue ? (price + strikeValue) : (targetPrice + price);
                return ((sellCost - costBasis) / costBasis) * (365 / daysToExpiry);
            }
        case 'PCR':
            return openInterest ?? null;
        case 'VOLUME':
            return volume ?? null;
        default:
            return price?.toFixed(2) ?? null;
    }
}

export const getWorkingStrikes = (allStrikePrices: string[], range: NumberRange): StrikePriceItem[] => {
    return allStrikePrices
        .map(s => ({ strikePrice: s, value: Number(s) }))
        .filter(n => n.value >= range.start && n.value <= range.end)
        .sort((a, b) => a.value - b.value);
}

const numberFormatter = (v: string) => v && Number(v);

export const getConditionalFormatting = (valueMode: ValueModeTypeEnum): ConditionalFormattingSpec => ({
    enabled: ['ANNUAL_RETURN', 'TOTAL_RETURN', 'PCR', 'VOLUME'].includes(valueMode),
    multiplier: ['PCR', 'VOLUME'].includes(valueMode) ? 1 : 1000
})

export const buildColumns = (workingStrikes: StrikePriceItem[], valueMode: ValueModeTypeEnum): GridColDef[] => {
    const columns: GridColDef[] = [];
    workingStrikes.forEach(s => {
        columns.push({
            field: s.strikePrice,
            width: 10,
            headerName: `${parseFloat(s.strikePrice)}`,
            type: 'number',
            valueFormatter: ['PRICE', 'PCR', 'VOLUME'].includes(valueMode) ? numberFormatter : percentageFormatter
        });
    });
    return columns;
}

export type BuildRowsParams = {
    dates: string[],
    chain: Record<string, OptionsInnerData>,
    workingStrikes: StrikePriceItem[],
    putCallType: PutCallType,
    priceMode: PriceModeTypeEnum,
    valueMode: ValueModeTypeEnum,
    targetPrice: number,
    costBasis: number,
    todaysDate?: string
}

export const buildRows = (params: BuildRowsParams): OptionsPricingGridRow[] => {
    const { dates, chain, workingStrikes, putCallType, priceMode, valueMode, targetPrice, costBasis } = params;
    const todaysDate = params.todaysDate ?? dayjs().format('YYYY-MM-DD');
    return dates.map(d => {
        if (dayjs(d).isBefore(todaysDate)) return null;
        const daysToExpiry = dayjs(d).diff(todaysDate, 'days') + 1;
        const row: OptionsPricingGridRow = { id: d };
        workingStrikes.forEach(s => {
            const optionData = chain[d];
            if (!optionData) return;
            const po = putCallType == PutCallType.CALL ? optionData.c[s.strikePrice] : optionData.p[s.strikePrice];
            const price = getPriceByMode(po, priceMode);
            row[s.strikePrice] = price ? getValueByMode({
                price,
                strikeValue: s.value,
                targetPrice,
                costBasis,
                putCallType,
                valueMode,
                daysToExpiry,
                openInterest: po?.oi,
                volume: po?.v
            }) : price;
        });
        return row;
    }).filter((r): r is OptionsPricingGridRow => r !== null);
}