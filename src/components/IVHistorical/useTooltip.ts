import { useCallback, useRef, useState, useMemo, useEffect } from "react";
import type { MouseEventParams, Time } from "lightweight-charts";
import { VolatilityResponse } from "@/lib/socket";

type OptionsPricingTooltipData = {
    show: boolean;
    time: string;
    callPrice: number;
    putPrice: number;
    straddle: number;
    callStrike: number;
    putStrike: number;
    position: { x: number; y: number };
};

export const useOptionsPricingTooltip = (
    volatility: VolatilityResponse & { straddle: number[] },
) => {
    const volRef = useRef(volatility);
    useEffect(() => { volRef.current = volatility; }, [volatility]);

    const emptyData = useMemo<OptionsPricingTooltipData>(() => ({
        show: false,
        time: "",
        callPrice: 0,
        putPrice: 0,
        straddle: 0,
        callStrike: 0,
        putStrike: 0,
        position: { x: 0, y: 0 },
    }), []);
    const [tooltipData, setTooltipData] = useState<OptionsPricingTooltipData>(emptyData);
    const lastKey = useRef<string | null>(null);

    const onCrosshairMove = useCallback(
        (param: MouseEventParams<Time>) => {
            if (
                param.time === undefined ||
                param.point === undefined ||
                param.point.x <= 0 ||
                param.point.y <= 0
            ) {
                if (lastKey.current !== null) {
                    lastKey.current = null;
                    setTooltipData(emptyData);
                }
                return;
            }

            const vol = volRef.current;
            const timeStr = param.time as string;
            const ix = vol.dt.indexOf(timeStr);
            if (ix === -1) {
                if (lastKey.current !== null) {
                    lastKey.current = null;
                    setTooltipData(emptyData);
                }
                return;
            }

            const key = `${timeStr}:${ix}`;
            if (lastKey.current === key) return;
            lastKey.current = key;

            setTooltipData({
                show: true,
                time: timeStr,
                callPrice: vol.cp[ix],
                putPrice: vol.pp[ix],
                straddle: vol.straddle[ix],
                callStrike: vol.cs[ix],
                putStrike: vol.ps[ix],
                position: {
                    x: param.point.x + 14,
                    y: param.point.y + 14,
                },
            });
        },
        [emptyData]
    );

    return { onCrosshairMove, tooltipData };
};
