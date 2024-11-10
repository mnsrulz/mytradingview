'use client';
import { useCallback, useState } from "react"
import { useLocalStorage } from "@uidotdev/usehooks";
import { SearchTickerItem } from "./types";

export const useShowCloseTrades = () => {
    const [showCloseTrades, setShowCloseTrades] = useState((typeof window !== "undefined" ? window?.localStorage?.getItem("showCloseTrades") == 'true' : false) || false);
    const toggleShowCloseTrades = useCallback((newstate: boolean) => {
        setShowCloseTrades(newstate);
        window?.localStorage?.setItem("showCloseTrades", `${newstate}`);
    }, []);

    return { showCloseTrades, toggleShowCloseTrades }
}

export const useMyLocalWatchList = (initialState: SearchTickerItem[]) => {
    const [wl, setWl] = useLocalStorage("localwatchlist", initialState);

    const removeFromMyList = (item: SearchTickerItem) => {
        setWl(v => v.filter((ticker) => ticker.symbol != item.symbol));
    }

    const addToMyList = (item: SearchTickerItem) => {
        setWl(v => {
            const items = v.filter((ticker) => ticker.symbol != item.symbol);   //ensuring we are not adding the same item again.
            items.push(item);
            return items;
        });
    }

    return { wl, removeFromMyList, addToMyList }
}


