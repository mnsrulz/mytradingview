'use client';
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export const NoPrefetch = () => {
    const router = useRouter()
    useEffect(() => {
        const prefetch = router.prefetch
        router.prefetch = async () => { }
        return () => { router.prefetch = prefetch }
    }, [router]);
    return <></>
}

