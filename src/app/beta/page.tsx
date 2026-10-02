import { ClientOnly } from "@/components/ClientOnly";
import BetaHomeContent from "./BetaHome";

export default function BetaHome() {
    return (
        <ClientOnly>
            <BetaHomeContent />
        </ClientOnly>
    );
}
