import { DexGexType } from "@/lib/types";
import { Tabs, Tab } from "@mui/material";
import { sendGAEvent } from '@next/third-parties/google';

export const ChartTypeSelectorTab = (props: { tab: DexGexType; onChange: (v: DexGexType) => void }) => {
    const handleChange = (_: React.SyntheticEvent, newValue: DexGexType) => {
        sendGAEvent('event', 'exposure_tab_change', { value: newValue });
        props.onChange(newValue);
    }
    return <Tabs
        value={props.tab}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth">
        <Tab label="Dex" value={'DEX'}></Tab>
        <Tab label="Gex" value={'GEX'}></Tab>
        <Tab label="OI" value={'OI'}></Tab>
        <Tab label="Volume" value={'VOLUME'}></Tab>
    </Tabs>
}
