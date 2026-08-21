import { ClientOnly } from "@/components/ClientOnly";
import { HedgeTracker } from "@/components/HedgeTracker";

export default function Page() {
    return <ClientOnly><HedgeTracker /></ClientOnly>
}
