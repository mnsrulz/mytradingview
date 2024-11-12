// import { getPriceAtDate } from "@/lib/tradierService";   //if yahoo api fails then we can fall back to tradier
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import isToday from 'dayjs/plugin/isToday';
import timezone from 'dayjs/plugin/timezone';

import { NextResponse } from "next/server";
import yf from 'yahoo-finance2';
import 'dayjs/locale/en';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);

export async function GET(request: Request, p: { params: { symbol: string, dt: string } }) {
    const { symbol } = p.params;
    const { searchParams } = new URL(request.url);
    const dt = searchParams.get("dt");
    if (!dt) return NextResponse.json({ error: 'dt is null' }, { status: 400 });
    const resp = await getPriceAtDate(symbol, dt);
    return NextResponse.json({
        price: resp,
        symbol: p.params.symbol
    });
}


const getPriceAtDate = async (symbol: string, dt: string) => {
    const start = dayjs(dt.substring(0, 10)).format('YYYY-MM-DD');
    if (start == dayjs().format('YYYY-MM-DD')) {
        if (!isUSMarketOpenedForToday()) {
            const resp = await yf.historical(symbol, {
                interval: '1d',
                period1: dayjs().add(-7, 'day').toDate(),
                period2: new Date()
            });
            return resp.pop()?.close?.toFixed(2);
        }
    }
    
    //TODO: need to revisit this logic as it can potentially cause issues if market is still open since there might not be any close price available

    const resp = await yf.historical(symbol, {
        interval: '1d',
        period1: dayjs(start).add(-7, 'day').toDate(),  //in case of weekend it somehow blanking out
        period2: dayjs(start).toDate()
    });

    return resp.at(-1)?.close.toFixed(2);
}

function isUSMarketOpenedForToday(): boolean {
    const currentTime = dayjs().tz('America/New_York'); // Set timezone to Eastern Time (ET)
    const currentHour = currentTime.hour();
    const currentMinute = currentTime.minute();
    if (currentHour < 9) return false;
    if (currentHour > 9) return true;
    return (currentHour >= 9 && currentMinute >= 30);
}