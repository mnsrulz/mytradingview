'use client';
import { GridColDef, GridActionsCellItem, DataGrid, useGridApiRef, gridClasses } from "@mui/x-data-grid";
import { Trade } from "@prisma/client";
import ky from "ky";
import { useState, useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { CloseTradeCloseDialogReason, CloseTradeDialog } from "./close-trade";
import { ConfirmDialog } from "./confirm-dialog";

interface ITradeView extends Trade {
    averageProfitPerDay: number
    maximumProfit: number
    maximumRisk: number
    maxReturn: number
    maxAnnualizedReturn: number
    actualProfit: number
    actualAnnualizedReturn: number
    buyCost: number,
    sellCost: number,
    isClosed: boolean
}

const mapTradeToView = (trade: Trade) => {
    const sellCost = trade.contractType == 'PUT_SELL' ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const buyCost = (trade.contractType == 'PUT_SELL' && trade.contractPriceAtClose) ? (Number(trade.contractPriceAtClose) * 100 * trade.numberOfContracts) : NaN;
    const maximumRisk = trade.contractType == 'PUT_SELL' ? (Number(trade.strikePrice) * 100 * trade.numberOfContracts) : 0;
    const maximumProfit = trade.contractType == 'PUT_SELL' ? (Number(trade.contractPrice) * 100 * trade.numberOfContracts) : 0;
    const tradeDays = dayjs(trade.contractExpiry).diff(trade.transactionStartDate, 'days') + 1;
    const actualTradeDays = trade.transactionEndDate ? (dayjs(trade.transactionEndDate).diff(trade.transactionStartDate, 'days') + 1) : NaN;
    const averageProfitPerDay = trade.contractType == 'PUT_SELL' ? maximumProfit / (tradeDays) : 0;
    const isClosed = trade.transactionEndDate ? true : false;
    const actualProfit = (trade.contractType == 'PUT_SELL' && isClosed) ? (sellCost - buyCost) : 0;
    const maxReturn = trade.approxStockPriceAtPurchase ? maximumProfit / (Number(trade.approxStockPriceAtPurchase) * trade.numberOfContracts * 100) : 0;
    const maxAnnualizedReturn = (sellCost / maximumRisk) * (365 / tradeDays);
    const actualAnnualizedReturn = (actualProfit / maximumRisk) * (365 / actualTradeDays);
    return {
        ...trade,
        sellCost,
        buyCost,
        maximumRisk,
        maximumProfit,
        maxAnnualizedReturn,
        actualAnnualizedReturn,
        averageProfitPerDay,
        isClosed,
        maxReturn,
        actualProfit
    } as ITradeView
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format;
const percentageFormatter = (v: number) => v && Number(v).toLocaleString(undefined, { style: 'percent', minimumFractionDigits: 2 }) || '';
const dateFormatter = (v: string) => v && dayjs(v.substring(0, 10)).format('DD/MM/YYYY');   //to avoid utc conversion strip the time part

export const TradeList = () => {
    const [trades, setTrades] = useState<ITradeView[]>([]);
    const [currentTrade, setCurrentTrade] = useState<ITradeView | null>(null);
    const apiRef = useGridApiRef();
    const loadTrades = () => ky('/api/trades').json<{ items: Trade[] }>().then(r => setTrades(r.items.map(mapTradeToView)));
    useEffect(() => {
        loadTrades();
    }, []);

    const [openCloseTrade, setOpenCloseTrade] = useState(false);
    const [isDeleteTradeOpen, setisDeleteTradeOpen] = useState(false);
    const [deleteTradeId, setDeleteTradeId] = useState('');
    const handleCloseContractClick = (trade: ITradeView) => {
        setCurrentTrade(trade);
        setOpenCloseTrade(true);
    }

    const handleDeleteTrade = (trade: ITradeView) => {
        setisDeleteTradeOpen(true);
        setDeleteTradeId(trade.id);
    }

    const columns: GridColDef<ITradeView>[] = [
        { field: 'transactionStartDate', headerName: 'Start', valueFormatter: dateFormatter },
        { field: 'transactionEndDate', headerName: 'End', valueFormatter: dateFormatter },
        { field: 'contractExpiry', headerName: 'Expiry', valueFormatter: dateFormatter },
        { field: 'contractType', headerName: 'Type', },
        { field: 'symbol', headerName: 'Ticker', },
        { field: 'isClosed', headerName: 'Cleared', type: 'boolean' },
        { field: 'strikePrice', headerName: 'Strike Price', type: 'number', valueFormatter: currencyFormatter },
        { field: 'numberOfContracts', headerName: 'Contracts', type: 'number' },
        { field: 'contractPrice', headerName: 'Price', type: 'number', valueFormatter: currencyFormatter },
        { field: 'buyCost', headerName: 'Buy Cost', type: 'number', valueFormatter: currencyFormatter },
        { field: 'sellCost', headerName: 'Sell Cost', type: 'number', valueFormatter: currencyFormatter },
        { field: 'actualProfit', headerName: 'Actual Profit', type: 'number', valueFormatter: currencyFormatter },
        { field: 'maximumRisk', headerName: 'Max Risk', type: 'number', valueFormatter: currencyFormatter },
        { field: 'maximumProfit', headerName: 'Max Profit', type: 'number', valueFormatter: currencyFormatter },
        { field: 'maxReturn', headerName: 'Max Profit%', type: 'number', valueFormatter: percentageFormatter },
        { field: 'maxAnnualizedReturn', headerName: 'Max Annualized%', type: 'number', valueFormatter: percentageFormatter },
        { field: 'actualAnnualizedReturn', headerName: 'Actual Annualized%', type: 'number', valueFormatter: percentageFormatter },
        { field: 'averageProfitPerDay', headerName: 'Avg Profit per day', type: 'number', valueFormatter: currencyFormatter },
        { field: 'approxStockPriceAtPurchase', headerName: 'Price at transaction date', type: 'number', valueFormatter: currencyFormatter },
        {
            field: 'actions',
            type: 'actions',

            getActions: ({ id, row }) => {
                return [
                    <GridActionsCellItem
                        key='Remove'
                        icon={<DeleteIcon />}
                        label="Remove from my list"
                        onClick={() => handleDeleteTrade(row)}
                    />,
                    <GridActionsCellItem
                        key='CloseContract'
                        icon={<CloseIcon />}
                        label="Close contract"
                        onClick={() => handleCloseContractClick(row)}
                    />]
            }
        }
    ];
    const handleCloseCloseTrade = (reason: CloseTradeCloseDialogReason) => {
        setOpenCloseTrade(false);
        setCurrentTrade(null);
        if (reason == 'close') loadTrades();
    };
    columns.forEach(c => c.resizable = false);
    async function onDeleteTradeConfirm() {
        await ky.delete(`/api/trades/${deleteTradeId}`);
        loadTrades();
    }

    return <div>
        <DataGrid rows={trades}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            // sx={{ display: 'grid' }}
            sx={{
                [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                    outline: 'none',
                },
                [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                {
                    outline: 'none',
                },
            }}
            style={{
                fontSize: '12px'
            }}
            apiRef={apiRef} />
        {
            currentTrade && <CloseTradeDialog
                open={openCloseTrade}
                onClose={handleCloseCloseTrade}
                tradeId={currentTrade.id} />
        }

        {
            <ConfirmDialog text="Are you sure you want to delete this Trade?"
                title="Delete trade"
                open={isDeleteTradeOpen}
                onClose={() => setisDeleteTradeOpen(false)}
                onConfirm={onDeleteTradeConfirm}
            />
        }

    </div>
}