import { OptionSpreadPricingWrapper } from "@/components/OptionSpreadPricingWrapper";
import { getYfOptions } from "@/lib/yfOptions";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    const yfResponse = await getYfOptions(symbol);
    return <OptionSpreadPricingWrapper yf={yfResponse} />
}