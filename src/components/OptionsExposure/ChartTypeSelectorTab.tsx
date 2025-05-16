import { DexGexType } from "@/lib/types";
import { Tabs, Tab } from "@mui/material";

export const ChartTypeSelectorTab = (props: { tab: DexGexType; onChange: (v: DexGexType) => void }) => {
    return <Tabs
        value={props.tab}
        onChange={(e, v) => { props.onChange(v) }}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth">
        <Tab label="Dex" value={'DEX'}></Tab>
        <Tab label="Gex" value={'GEX'}></Tab>
        <Tab label="OI" value={'OI'}></Tab>
        <Tab label="Volume" value={'VOLUME'}></Tab>
    </Tabs>
}
