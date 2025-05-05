import { useRouter } from "next/router"
import { useEffect } from "react"

const router = useRouter()
useEffect(() => {
  router.prefetch = async () => { }
}, [router])