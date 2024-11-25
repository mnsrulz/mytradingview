import { OptionSpreadPricingWrapper } from "@/components/OptionSpreadPricingWrapper";
import { getYfOptions } from "@/lib/yfOptions";

export default async function Page({ params }: { params: { symbol: string } }) {
    const { symbol } = params;
    const yfResponse = await getYfOptions(symbol);
    return <OptionSpreadPricingWrapper yf={yfResponse} />
}