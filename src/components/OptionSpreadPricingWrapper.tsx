'use client'
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { nanoid } from 'nanoid'
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Divider, FormControl, IconButton, InputLabel, LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import VisibleIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { YahooOptionsResponse } from "@/lib/types";
import ky from "ky";
import { OptionSpreadPricingTimeSeriesChart } from "./OptionSpreadPricingTimeSeriesChart";
import { TimeSalesResposne } from "@/lib/tradierService";
import Link from "next/link";
import { mergeMultipleTimeSalesData } from '@/lib/tool';

type BuySell = 'BUY' | 'SELL'
type CallPut = 'CALL' | 'PUT'
type LineItemModel = { id: string, expiration: string, strike: number, type: CallPut, mode: BuySell, quantity: number, contractSymbol: string };
type StrategyLineItem = { id: string, name: string, strategyType: string, items: LineItemModel[], hidden: boolean }

const calculateStrategyData = (strategyLineItem: StrategyLineItem, timesales: TimeSalesResposne[]) => {
    const optionSymbols = new Set(strategyLineItem.items.map(j => j.contractSymbol));
    const orderBook: Record<string, number> = strategyLineItem.items.reduce((iv, c) => {
        iv[c.contractSymbol] = (iv[c.contractSymbol] || 0) + (c.quantity * (c.mode == 'BUY' ? 1 : -1));
        return iv;
    }, {} as Record<string, number>)
    const md: Record<number, number[]> = {};
    timesales.filter(k => optionSymbols.has(k.symbol)).forEach((j, ix) => {
        const multiplier = orderBook[j.symbol] || 0;
        j.series.data.forEach(k => {
            md[k.timestamp] = md[k.timestamp] || Array<number>(Object.keys(orderBook).length).fill(0);  //initialize the array if not exists
            md[k.timestamp][ix] = k.price * multiplier;
        })
    });

    //fix the array merge issue when keys are not present
    // for (const k of Object.keys(md)) {
    //     if (md[Number(k)].some(j => j === 0)) {
    //         delete md[Number(k)];   //if there's no data for any element we can't plot it. 
    //     } else {
    //         break;  //just need one such instance where the values are not all zero and we can plot the remaining.... HOPEFULLY???
    //     }
    // }

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
    return [Object.keys(md).map(Number), Object.values(md).map(j => j.reduce((a, b) => a + b, 0))];

}

const useTimeSalesData = (uniqueOptionContractSymbols: string, timePeriod: number) => {
    const [data, setData] = useState<TimeSalesResposne[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!uniqueOptionContractSymbols) {
            setData([])
            return
        };
        setLoading(true);
        ky(`/api/timesales`, {
            searchParams: {
                u: uniqueOptionContractSymbols,
                p: timePeriod
            }
        }).json<TimeSalesResposne[]>().then((timesales) => {
            setData(timesales);
            setLoading(false);
        })
    }, [uniqueOptionContractSymbols, timePeriod]);

    return { data, loading }
}

export const OptionSpreadPricingWrapper = (props: { yf: YahooOptionsResponse }) => {
    const [strategies, setStrategies] = useState<StrategyLineItem[]>([]);
    const { yf } = props;
    const [openAddNewStrategy, setOpenAddNewStrategy] = useState(false);
    const [timePeriod, setTimePeriod] = useState(3);
    const [currentStrategyLineItem, setCurrentStrategyLineItem] = useState<StrategyLineItem | undefined>();
    const [chartdataset, setchartdataset] = useState<{ legends: string[], data: any }>({ data: [], legends: [] });
    const [] = useState([]);
    const visibleStrategies = strategies.filter(j => !j.hidden)
    const uniqueOptionContractSymbols = [...new Set(strategies.flatMap(j => j.items.map(k => k.contractSymbol)))].sort().join(',');  //fn();///`TSM241122C00190000,TSM241122C00200000`; //fn();
    const { data, loading } = useTimeSalesData(uniqueOptionContractSymbols, timePeriod);
    useEffect(() => {
        const allStrategyData = visibleStrategies.map(j => calculateStrategyData(j, data));
        const flattenedData = mergeMultipleTimeSalesData(allStrategyData);
        setchartdataset({ data: flattenedData, legends: visibleStrategies.map(j => j.name) })
    }, [data, strategies]);

    const handleSaveStrategyItem = (reason: StraetgyBuilderCloseReason, value?: StrategyLineItem) => {
        setOpenAddNewStrategy(false);
        if (value) {
            setStrategies(v => {
                if (v.some(j => j.id == value.id)) {
                    return v.map(k => k.id == value.id ? value : k);
                }
                v.push(value);
                return v;
            })
        }
        setCurrentStrategyLineItem(undefined);
    };
    const handleVisibility = (strategyId: string, enabled: boolean) => {
        setStrategies(v => v.map(k => {
            if (k.id == strategyId) {
                k.hidden = enabled;
            }
            return k;
        }))
    }

    const handleAddNew = () => {
        const defaultStrategyLineItems = buildCollar(yf);
        const id = nanoid();
        const newStrategy = {
            id: id,
            name: `strategy-${id}`,
            strategyType: 'COLLAR',
            items: defaultStrategyLineItems,
            hidden: false
        } as StrategyLineItem;
        setCurrentStrategyLineItem(newStrategy);
        setOpenAddNewStrategy(true);
    }

    return <Paper sx={{ p: 1, my: 1 }}>
        {/* <Link href={'/screener'}>Screener</Link> */}
        <Stack direction={'row'} sx={{ justifyContent: 'right' }}>
            <FormControl size='small' sx={{ width: 200 }}>
                <InputLabel>Period (D)</InputLabel>
                <Select id="timePeriod" label="Period (D)" value={timePeriod} onChange={(ev, v) => setTimePeriod(Number(ev.target.value))}>
                    {[1, 3, 5, 10, 20, 30, 50, 90].map(j => <MenuItem key={j} value={j}>{j}</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>

        <OptionSpreadPricingTimeSeriesChart loading={loading} data={chartdataset.data} legends={chartdataset.legends} />
        {currentStrategyLineItem && openAddNewStrategy && <StrategyPopup {...props} symbol={yf.underlyingSymbol} open={openAddNewStrategy} onClose={handleSaveStrategyItem} value={currentStrategyLineItem} />}
        <Stack direction={'row'} sx={{ justifyContent: 'space-between' }}>
            <Typography variant='h6'>Strategies</Typography>
            <Button onClick={handleAddNew}>Add new strategy</Button>
        </Stack>
        <Divider />
        <List dense>
            {strategies.map(j => <ListItem key={j.id}
                secondaryAction={
                    <Box>
                        <IconButton edge="end" aria-label="enabled" title='Clone' onClick={() => {
                            const cloned = JSON.parse(JSON.stringify(j));
                            cloned.id = nanoid();
                            setCurrentStrategyLineItem(cloned); 
                            setOpenAddNewStrategy(true);
                        }}>
                            <FileCopyIcon />                            
                        </IconButton>
                        <IconButton edge="end" aria-label="enabled" title='Toggle visibility' onClick={() => handleVisibility(j.id, !j.hidden)}>
                            {j.hidden ? <VisibilityOffIcon /> : <VisibleIcon />}
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => {
                            setCurrentStrategyLineItem(JSON.parse(JSON.stringify(j))); setOpenAddNewStrategy(true);
                        }}>
                            <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => setStrategies(s => s.filter(k => k.id != j.id))}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                }
            >
                <ListItemText primary={j.name} />
            </ListItem>
            )}
        </List>
    </Paper>
}


const buildCollar = (yf: YahooOptionsResponse) => {
    const e = `${yf.options[0].expirationDate.toISOString().substring(0, 10)}`;
    const callOptionContract = yf.options[0].calls[Math.round(yf.options[0].calls.length / 2)]
    const putOptionContract = yf.options[0].puts[Math.round(yf.options[0].puts.length / 2)]
    if (!callOptionContract || !putOptionContract) return [];

    return [
        {
            id: `${nanoid()}`, expiration: e, strike: callOptionContract.strike, type: 'CALL', mode: 'SELL', quantity: 1, contractSymbol: callOptionContract.contractSymbol
        },
        {
            id: `${nanoid()}`, expiration: e, strike: callOptionContract.strike, type: 'PUT', mode: 'BUY', quantity: 1, contractSymbol: putOptionContract.contractSymbol
        }
    ] as LineItemModel[]
}


const buildPCS = (yf: YahooOptionsResponse) => {
    const e = `${yf.options[0].expirationDate.toISOString().substring(0, 10)}`;
    const putSellOptionContract = yf.options[0].puts[Math.round(yf.options[0].puts.length / 2) + 1];
    const putBuyOptionContract = yf.options[0].puts[Math.round(yf.options[0].puts.length / 2)];
    if (!putSellOptionContract || !putBuyOptionContract) return [];

    return [
        {
            id: `${nanoid()}`, expiration: e, strike: putSellOptionContract.strike, type: 'PUT', mode: 'SELL', quantity: 1, contractSymbol: putSellOptionContract.contractSymbol
        },
        {
            id: `${nanoid()}`, expiration: e, strike: putBuyOptionContract.strike, type: 'PUT', mode: 'BUY', quantity: 1, contractSymbol: putBuyOptionContract.contractSymbol
        }
    ] as LineItemModel[]
}

const buildCCS = (yf: YahooOptionsResponse) => {
    const e = `${yf.options[0].expirationDate.toISOString().substring(0, 10)}`;
    const callSellOptionContract = yf.options[0].calls[Math.round(yf.options[0].calls.length / 2)]
    const callBuyOptionContract = yf.options[0].calls[Math.round(yf.options[0].calls.length / 2) + 1]
    if (!callSellOptionContract || !callBuyOptionContract) return [];

    return [
        {
            id: `${nanoid()}`, expiration: e, strike: callSellOptionContract.strike, type: 'CALL', mode: 'SELL', quantity: 1, contractSymbol: callSellOptionContract.contractSymbol
        },
        {
            id: `${nanoid()}`, expiration: e, strike: callBuyOptionContract.strike, type: 'CALL', mode: 'BUY', quantity: 1, contractSymbol: callBuyOptionContract.contractSymbol
        }
    ] as LineItemModel[]
}

const buildNLeg = (yf: YahooOptionsResponse, numberOfLegs: number) => {
    const e = `${yf.options[0].expirationDate.toISOString().substring(0, 10)}`;
    const optionContract = yf.options[0].calls.at(0);
    if (!optionContract) return [];

    return Array.from(Array(numberOfLegs).keys()).map(k => ({
        id: `${nanoid()}`, expiration: e, strike: optionContract.strike, type: 'CALL', mode: 'SELL', quantity: 1, contractSymbol: optionContract.contractSymbol
    } as LineItemModel))
}

type StraetgyBuilderCloseReason = 'cancel' | 'add';
const StrategyPopup = (props: { symbol: string, open: boolean, onClose: (reason: StraetgyBuilderCloseReason, value?: StrategyLineItem) => void, yf: YahooOptionsResponse, value: StrategyLineItem }) => {
    const { onClose, yf } = props;
    const [items, setItems] = useState(props.value.items);
    const strategies = [{
        id: 'COLLAR',
        label: 'COLLAR'
    }, {
        id: 'PCS',
        label: 'PCS'
    }, {
        id: 'CCS',
        label: 'CCS'
    }, {
        id: 'SINGLE_LEG',
        label: 'SINGLE LEG'
    }, {
        id: 'TWO_LEG',
        label: 'TWO LEG'
    }, {
        id: 'THREE_LEG',
        label: 'THREE LEG'
    }, {
        id: 'FOUR_LEG',
        label: 'FOUR LEG'
    }]

    const onCloseRequest: DialogProps["onClose"] = (event, reason) => {
        onClose('cancel');
    }

    const [strategy, setStrategy] = useState(props.value.strategyType);
    const [name, setName] = useState(props.value.name);
    const theme = useTheme();
    const showFullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'));

    const onChangeStrategy = (v: string) => {
        setStrategy(v);
        let newLineItems: LineItemModel[] = []

        switch (v) {
            case 'COLLAR':
                newLineItems = buildCollar(yf);
                break;
            case 'PCS':
                newLineItems = buildPCS(yf);
                break;
            case 'CCS':
                newLineItems = buildCCS(yf);
                break;
            case 'SINGLE_LEG':
                newLineItems = buildNLeg(yf, 1);
                break;
            case 'TWO_LEG':
                newLineItems = buildNLeg(yf, 2);
                break;
            case 'THREE_LEG':
                newLineItems = buildNLeg(yf, 3);
                break;
            case 'FOUR_LEG':
                newLineItems = buildNLeg(yf, 4);
                break;
        }
        setItems(newLineItems);
    }
    const onChangeItem = (value: LineItemModel) => {
        setItems(v => v.map(j => j.id == value.id ? value : j))
    }

    const handleSave = () => {
        for (const v of items) {
            const contractSymbol = getContractSymbol(yf, v.strike, v.expiration, v.type)
            if (!contractSymbol) throw new Error(`Error occurred`);
            v.contractSymbol = contractSymbol;
        }
        props.value.name = name;
        props.value.items = items;
        props.value.strategyType = strategy;
        onClose('add', props.value)
    }
    return <Dialog
        open={props.open}
        // maxWidth={'md'}
        fullScreen={showFullScreenDialog}
        fullWidth={true}
        onClose={onCloseRequest}
    >
        <DialogTitle>Strategy builder</DialogTitle>
        <DialogContent dividers={true}>
            <Stack spacing={2}>
                <Stack spacing={2} direction={'row'}>
                    <FormControl>
                        <InputLabel>Strategy</InputLabel>
                        <Select size='small' id="strategy" value={strategy} label="Strategy" onChange={(ev, v) => onChangeStrategy(ev.target.value)}>
                            {strategies.map(j => <MenuItem key={j.id} value={j.id}>{j.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                        <TextField fullWidth size='small' label="Name" value={name} onChange={(ev) => setName(ev.target.value)} />
                    </FormControl>
                </Stack>
                {
                    items.map(m => (
                        <StrategyBuilderLineItem key={m.id} item={m} yf={yf} onChange={onChangeItem} />))
                }
            </Stack>
        </DialogContent>
        <DialogActions>
            {/* <Button onClick={() => onClose('cancel')}>Cancel</Button> */}
            <Button type={'submit'} onClick={handleSave}>Save</Button>
        </DialogActions>
    </Dialog>
}

const StrategyBuilderLineItem = (props: { item: LineItemModel, yf: YahooOptionsResponse, onChange: (value: LineItemModel) => void }) => {
    const { item, yf, onChange } = props;
    const expirations = yf.expirationDates.map(j => `${j.toISOString().substring(0, 10)}`);
    const avaialbleoptiosn = yf.options.find(x => x.expirationDate.toISOString().substring(0, 10) == item.expiration);
    if (!avaialbleoptiosn) return <div>invalid data</div>

    const { calls, puts } = avaialbleoptiosn;
    const strikes = item.type == 'CALL' ? calls.map(j => j.strike) : puts.map(j => j.strike)

    return <Box>
        <Stack spacing={2} direction={'row'}>
            <FormControl>
                <InputLabel>{item.type.substring(0, 1)}</InputLabel>
                <Select size='small' value={item.type} label="CP" onChange={(ev, v) => { item.type = (ev.target.value as 'CALL' | 'PUT'); onChange(item) }}>
                    {['CALL', 'PUT'].map(j => <MenuItem key={j} value={j}>{j.substring(0, 1)}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel>Expiry</InputLabel>
                <Select size='small' value={item.expiration} label="expiration" onChange={(ev, v) => { item.expiration = ev.target.value; onChange(item) }}>
                    {expirations.map(j => <MenuItem key={j} value={j}>{j}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel>Strike</InputLabel>
                <Select size='small' value={item.strike} label="strike" onChange={(ev, v) => { item.strike = (Number(ev.target.value)); onChange(item) }}>
                    {strikes.map(j => <MenuItem key={j} value={j}>{j}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel>{item.mode.substring(0, 1)}</InputLabel>
                <Select size='small' value={item.mode} label="mode" onChange={(ev, v) => { item.mode = (ev.target.value as BuySell); onChange(item) }}>
                    {['BUY', 'SELL'].map(j => <MenuItem key={j} value={j}>{j.substring(0, 1)}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel>Size</InputLabel>
                <Select size='small' value={item.quantity} label="Size" onChange={(ev, v) => { item.quantity = (Number(ev.target.value)); onChange(item) }}>
                    {Array.from(Array(100).keys()).map(j => <MenuItem key={j} value={j}>{j}</MenuItem>)}
                </Select>
            </FormControl>
        </Stack>
    </Box>
}

const getContractSymbol = (yf: YahooOptionsResponse, strike: number, expiration: string, type: CallPut) => {
    const e = yf.options.find(f => f.expirationDate.toISOString().substring(0, 10) == expiration);
    if (type == 'CALL')
        return e?.calls.find(k => k.strike == strike)?.contractSymbol
    else
        return e?.puts.find(k => k.strike == strike)?.contractSymbol
}