'use client'

import { Button } from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridRowModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { YahooOptionsResponse } from "@/lib/types";
import ky from "ky";
import { OptionSpreadPricingTimeSeriesChart } from "./OptionSpreadPricingTimeSeriesChart";
import { TimeSalesResposne } from "@/lib/tradierService";
import Link from "next/link";

type LineItemModel = { id: string, expiration: string, strike: number, type: 'CALL' | 'PUT', mode: 'BUY' | 'SELL', quantity: number, contractSymbol: string };

export const OptionSpreadPricingWrapper = (props: { yf: YahooOptionsResponse }) => {
    const { yf } = props;
    const expirations = yf.expirationDates.map(j => `${j.toISOString().substring(0, 10)}`);
    const [rows, setRows] = useState<LineItemModel[]>([]);
    const [timesales, setTimesales] = useState<TimeSalesResposne[]>([]);

    const getStrikes = (expiration: string, type: 'CALL' | 'PUT') => {
        const k = yf.options.find(j => j.expirationDate.toISOString().substring(0, 10) == expiration);
        if (k) {
            return (type == 'CALL' ? k.calls : k.puts).map(o => o.strike);
        }
        return [];
    }
    const orderBook: Record<string, number> = rows.reduce((iv, c) => {
        iv[c.contractSymbol] = (iv[c.contractSymbol] || 0) + (c.quantity * (c.mode == 'BUY' ? 1 : -1));
        // console.log(`${c.contractSymbol} | ${c.quantity} | ${c.mode} | ${iv[c.contractSymbol]}`);
        return iv;
    }, {} as Record<string, number>)

    const uniqueOptionContractSymbols = [...new Set(rows.map(j => j.contractSymbol))].sort().join(',');  //fn();///`TSM241122C00190000,TSM241122C00200000`; //fn();

    // const [od, setOd] = useState<any[]>([]);

    useEffect(() => {
        if (!uniqueOptionContractSymbols) {
            setTimesales([]);
            return
        };
        ky(`/api/timesales`, {
            searchParams: {
                u: uniqueOptionContractSymbols
            }
        }).json<TimeSalesResposne[]>().then((d) => {
            setTimesales(d);
        })
    }, [uniqueOptionContractSymbols]);

    const calculateTimeSeriesData = () => {
        const md: Record<number, number[]> = {};
        timesales.forEach((j, ix) => {
            const multiplier = orderBook[j.symbol];
            j.series.data.forEach(k => {
                md[k.timestamp] = md[k.timestamp] || Array<number>(Object.keys(orderBook).length).fill(0);  //initialize the array if not exists
                md[k.timestamp][ix] = k.price * multiplier;
            })
        });

        for (const k of Object.keys(md)) {
            if (md[Number(k)].some(j => j === 0)) {
                delete md[Number(k)];   //if there's no data for any element we can't plot it. 
            } else {
                break;  //just need one such instance where the values are not all zero and we can plot the remaining.... HOPEFULLY???
            }
        }

        const lastKnownValues = Array<number>(Object.keys(orderBook).length);
        for (const k of Object.keys(md)) {
            md[Number(k)].forEach((v, ix) => {
                if (v === 0) {
                    console.log(`found zero at ${k} for ${ix}`);

                    md[Number(k)][ix] = lastKnownValues[ix];
                } else {
                    lastKnownValues[ix] = md[Number(k)][ix];
                }
            })
        }


        //at this time we have all the timestamp values defined
        return [Object.keys(md), Object.values(md).map(j => j.reduce((a, b) => a + b, 0))];
    }

    const timeSeriesData = calculateTimeSeriesData();

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(r => r.filter((row) => row.id !== id));
    };

    const columns: GridColDef<LineItemModel>[] = [
        { field: 'expiration', flex: 1, headerName: 'Expiration', editable: true, type: 'singleSelect', valueOptions: expirations },
        { field: 'type', flex: 1, headerName: 'Type', editable: true, type: 'singleSelect', valueOptions: ['CALL', 'PUT'] },
        { field: 'mode', flex: 1, headerName: 'Mode', editable: true, type: 'singleSelect', valueOptions: ['BUY', 'SELL'] },
        { field: 'contractSymbol', flex: 1, headerName: 'Contract', editable: false },
        {
            field: 'strike', flex: 1, headerName: 'Strike', editable: true, type: 'singleSelect', valueOptions({ row }) {
                const strikes = getStrikes(row?.expiration || '', row?.type || 'CALL');
                return strikes.map(s => ({ value: s, label: s }));
            },
        },
        { field: 'quantity', flex: 1, headerName: 'quantity', editable: true, type: 'number' },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        key={'Delete'}
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ]
            }
        }
    ];

    const handleAddNew = () => {
        setRows(v => [...v, { id: Date.now().toString(36), expiration: expirations[0], strike: 100, type: 'CALL', mode: 'BUY', quantity: 1, contractSymbol: '' }]);// dummy data
    }

    const handleProcessRowUpdate = (r: GridRowModel<LineItemModel>) => {
        const t = yf.options.find(j => j.expirationDate.toISOString().substring(0, 10) == r.expiration);
        if (t) {
            const smb = (r.type == 'CALL' ? t.calls : t.puts).find(k => k.strike == r.strike);
            if (smb) {
                r.contractSymbol = smb.contractSymbol;
            }
        }

        const updatedRow = { ...r, isNew: false };
        setRows(d => d.map((row) => (row.id === r.id ? updatedRow : row)));
        return updatedRow;
    }

    return <div>
        <Link href={'/screener'}>Screener</Link>
        <Button onClick={handleAddNew}  >Add new</Button>
        {timeSeriesData.length > 0 && <OptionSpreadPricingTimeSeriesChart data={timeSeriesData} />}
        <DataGrid
            editMode="row"
            density="compact"
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            processRowUpdate={handleProcessRowUpdate}
        />
        {/* <div>
            {JSON.stringify(orderBook)}

        </div> */}

        {/* 
        {JSON.stringify(rows)}
        {uniqueOptionContractSymbols}
        
        <h1>{od.length}</h1> */}

    </div>
}