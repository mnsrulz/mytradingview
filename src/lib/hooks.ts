'use client';
import { useCallback, useState } from "react"

export const useShowCloseTrades = () => {
    const [showCloseTrades, setShowCloseTrades] = useState((typeof window !== "undefined" ? window?.localStorage?.getItem("showCloseTrades") == 'true': false) || false);
    const toggleShowCloseTrades = useCallback((newstate: boolean) => {
        setShowCloseTrades(newstate);
        window?.localStorage?.setItem("showCloseTrades", `${newstate}`);
    }, []);

    return {showCloseTrades, toggleShowCloseTrades }
}

