import { useRouter } from "next/navigation"
import { useEffect } from "react"

const router = useRouter()

export const NoPrefetch = () => {
    useEffect(() => {
        const prefetch = router.prefetch
        router.prefetch = async () => { }
        return () => { router.prefetch = prefetch }
    }, [router])

    return <></>
}

