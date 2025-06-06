import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import ky from "ky";
import delay from 'delay';
import relativeTime from "dayjs/plugin/relativeTime";
import { DataModeType } from "@/lib/types";
dayjs.extend(relativeTime);

const client = ky.create({
    prefixUrl: "https://www.cboe.com/delayed_quote/api/options",
    referrerPolicy: "no-referrer",
    credentials: "omit",
    throwHttpErrors: false,
    mode: "no-cors" // Not needed for GET, and may block response
});
const staleWarningInMinutes = 15;
const staleWarningCheckIntervalInMinutes = 1;   //every one minutes is the check interval for stale data
const exceptionSymbols = ["CBTX", "DJX", "NANOS", "NDX", "OEX", "RUT", "VIX", "XSP", "SPX"]
export default function RefreshCboeData({ timestamp, symbol, onRefresh, dataMode }: { symbol: string, timestamp?: Date, onRefresh?: () => void, dataMode: DataModeType }) {
    const [showWarning, setShowWarning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stale, setStale] = useState(false);
    const [awaitingResponse, setAwaitingResponse] = useState(false);

    useEffect(() => {
        if (timestamp) {
            setAwaitingResponse(false);
            function checkStale() {
                //TODO: add some intelligence to check if the data is stale only if market is open
                if (timestamp && dayjs(timestamp).isBefore(dayjs().subtract(staleWarningInMinutes, "minute"))) {
                    setStale(true);
                } else {
                    setStale(false);
                }
            }
            checkStale();
            const interval = setInterval(checkStale, staleWarningCheckIntervalInMinutes * 1000);
            return () => clearInterval(interval);
        }
    }, [timestamp]);

    useEffect(() => {
        setShowWarning(stale);
    }, [stale]);

    const handleClick = async () => {
        setLoading(true);
        if (dataMode == DataModeType.CBOE) {
            await client(exceptionSymbols.includes(symbol.toUpperCase()) ? `^${symbol}` : symbol);
            await delay(10000); // Simulate 10seconds delay for data refresh
        }
        if (typeof onRefresh === "function") {
            onRefresh();
        }
        setLoading(false);
        setAwaitingResponse(true);
    };

    const tooltipText = showWarning
        ? `Data is older than ${dayjs(timestamp).fromNow(true)}. Click to refresh.`
        : loading
            ? "Refreshing data..."
            : "Data is fresh.";

    if (dataMode == DataModeType.HISTORICAL) {
        return <></>; // No refresh button for historical data
    }

    return (
        showWarning ? <Tooltip title={tooltipText}>
            <IconButton onClick={handleClick} color="warning" loading={loading || awaitingResponse}>
                <WarningAmberIcon />
            </IconButton>
        </Tooltip> : <></>
    );
}
