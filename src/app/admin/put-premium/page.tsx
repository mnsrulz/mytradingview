'use client';
import { ClientOnly } from "@/components/ClientOnly";
import { PutPremiumScreener } from "@/components/putPremium/PutPremiumScreener";

export default function Page() {
    return <ClientOnly><PutPremiumScreener /></ClientOnly>;
}