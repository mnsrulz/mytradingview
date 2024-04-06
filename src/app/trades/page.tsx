import { TradeList } from "@/components/trades";
import ky from "ky";
import { useEffect, useState } from "react";

type Trade = { id: string }

export default function Page() {
    return (
        <div>
            <TradeList></TradeList>
        </div>
    );
}