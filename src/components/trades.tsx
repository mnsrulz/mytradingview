'use client';
import { GridColDef, GridActionsCellItem, DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { Trade } from "@prisma/client";
import ky from "ky";
import { useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';

interface ITradeView extends Trade {
    averageProfitPerDay: number
    maximumProfit: number
    maximumRisk: number
    maxReturn: number
    maxAnnualizedReturn: number
    actualAnnualizedReturn: number
    buyCost: number,
    sellCost: number,
    isClosed: boolean
}

const mapTradeToView = (trade: Trade) => {
    const sellCost = trade.contractType == 'PUT_SELL' ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const maximumRisk = trade.contractType == 'PUT_SELL' ? (Number(trade.strikePrice) * 100 * trade.numberOfContracts) : 0;
    const maximumProfit = trade.contractType == 'PUT_SELL' ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const averageProfitPerDay = trade.contractType == 'PUT_SELL' ? maximumProfit / (dayjs(trade.contractExpiry).diff(trade.transactionStartDate, 'days')) : 0;
    const isClosed = trade.transactionEndDate ? true : false;
    const maxReturn = trade.approxStockPriceAtPurchase ? maximumProfit / (Number(trade.approxStockPriceAtPurchase) * trade.numberOfContracts * 100) : 0;
    return {
        ...trade,
        sellCost,
        maximumRisk,
        maximumProfit,
        averageProfitPerDay,
        isClosed,
        maxReturn
    } as ITradeView
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;
const percentageFormatter = (v) => v && Number(v).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 });;
const dateFormatter = (v) => v && dayjs(v).format('DD/MM/YYYY')

export const TradeList = () => {
    const [trades, setTrades] = useState<ITradeView[]>([]);
    const apiRef = useGridApiRef();

    useEffect(() => {
        (async () => {
            const t = await ky('/api/trades').json<{ items: Trade[] }>();
            setTrades(t.items.map(mapTradeToView));
        })();
    }, []);

    const columns: GridColDef<Trade>[] = [
        { field: 'transactionStartDate', headerName: 'Start', valueFormatter: dateFormatter },
        { field: 'transactionEndDate', headerName: 'End', valueFormatter: dateFormatter },
        { field: 'contractExpiry', headerName: 'Expiry', valueFormatter: dateFormatter },
        { field: 'contractType', headerName: 'Type', },
        { field: 'symbol', headerName: 'Ticker', },
        { field: 'isClosed', headerName: 'Cleared', type: 'boolean' },
        { field: 'buyCost', headerName: 'Buy Cost', type: 'number', valueFormatter: currencyFormatter },
        { field: 'sellCost', headerName: 'Sell Cost', type: 'number', valueFormatter: currencyFormatter },
        { field: 'maximumRisk', headerName: 'Max Risk', type: 'number', valueFormatter: currencyFormatter },
        { field: 'maximumProfit', headerName: 'Max Profit', type: 'number', valueFormatter: currencyFormatter },
        { field: 'maxReturn', headerName: 'Max Profit%', type: 'number', valueFormatter: percentageFormatter },
        { field: 'averageProfitPerDay', headerName: 'Avg Profit per day', type: 'number', valueFormatter: currencyFormatter },
        { field: 'numberOfContracts', headerName: 'Contracts', type: 'number' },
        { field: 'strikePrice', headerName: 'Strike Price', type: 'number', valueFormatter: currencyFormatter },
        { field: 'approxStockPriceAtPurchase', headerName: 'Price at transaction date', type: 'number', valueFormatter: currencyFormatter },
        { field: 'contractPrice', headerName: 'Price', type: 'number', valueFormatter: currencyFormatter },

        // {
        //     field: 'price', headerName: 'Price', flex: 1, renderCell: (p) => {
        //         return <StockTickerView item={p.row}></StockTickerView>
        //     }
        // },
        {
            field: 'actions',
            type: 'actions',

            getActions: ({ id, row }) => {
                return [<GridActionsCellItem
                    key='Remove'
                    icon={<DeleteIcon />}
                    label="Remove from my list"
                    onClick={() => alert(JSON.stringify(row))}
                />]
            }
        }
    ];
    return <div>
        <DataGrid rows={trades}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            sx={{ display: 'grid' }}
            style={{
                fontSize: '12px'
            }}
            apiRef={apiRef} />
    </div>
}