'use client'
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const URL = `https://tidy-spider-52.deno.dev`

export const socket = io(URL, {
    reconnectionDelayMax: 10000,
    transports: ['websocket', 'polling']
    // transports: ['websocket']
});

socket.on("connect", () => {
    console.log("Connected")
})

export type SearchTickerResult = { items: SearchTickerItem[] };
export type SearchTickerItem = { symbol: string, name: string }
export type AddTickerToMyListResult = { success: boolean }
export const searchTicker = async (searchTerm: string) => {
    return new Promise<SearchTickerResult>((res, rej) => {
        socket.emit('stock-list-request', {
            q: searchTerm
        });

        socket.once(`stock-list-response`, (args: SearchTickerResult) => {
            res(args);
        });
    });
}

export const AddTickerToMyList = (item: SearchTickerItem) => {
    socket.emit('mystocks-add-request', item);    
}

export const RemoveItemFromMyList = (item: SearchTickerItem) => {
    socket.emit('mystocks-remove-request', item);    
}

// export const LoadMyTickerList = () => {
//     return new Promise<SearchTickerItem[]>((res, rej) => {
//         socket.emit('mystocks-list-request');
//         socket.once(`mystocks-list-response`, (args: SearchTickerItem[]) => {
//             res(args);
//             console.log(JSON.stringify(args));
//         });
//     });
// }

export const useMyStockList = () => {
    const [mytickers, setMyTickers] = useState<SearchTickerItem[]>([]);
    useEffect(() => {
        socket.emit('mystocks-list-request');        
        socket.on(`mystocks-list-response`, setMyTickers);
        return () => {
            socket.off('mystocks-list-response', setMyTickers);
        }
    }, []);
    return mytickers;
}