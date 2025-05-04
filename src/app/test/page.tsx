'use client'
import { useState } from "react";
import { dexdata } from './ds1'
import { gexdata } from './ds2'
import { BarChart } from "@mui/x-charts";
import { Tabs, Tab } from "@mui/material";
enum DexGexType {
    'DEX' = 'DEX',
    'GEX' = 'GEX',
    'OI' = 'OI',
    'VOLUME' = 'VOLUME'
}
const getData = (gextype: DexGexType) => {
    switch (gextype) {
        case DexGexType.DEX:
            return dexdata;
        case DexGexType.GEX:
            return gexdata;
        case DexGexType.OI:
            return dexdata;
        case DexGexType.VOLUME:
            return gexdata;
    }
}

export default function Page() {
    const [tab, setTab] = useState<DexGexType>(DexGexType.DEX);
    const data = getData(tab);
    const { items, expirations, strikes, series } = data;
    return <div>
        <Tabs
            value={tab}
            onChange={(e, v) => { setTab(v) }}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth">
            <Tab label="Dex" value={'DEX'}></Tab>
            <Tab label="Gex" value={'GEX'}></Tab>
            <Tab label="OI" value={'OI'}></Tab>
            <Tab label="Volume" value={'VOLUME'}></Tab>
        </Tabs>
        <BarChart
            height={400}
            series={series.slice(0, 10)}
            skipAnimation={false}
            yAxis={[{
                data: strikes,
                scaleType: 'band',
                reverse: true,
            }]}
            xAxis={[{
                reverse: true,
                barGapRatio: 0.1,
            }]}
            layout="horizontal" />
    </div>

}