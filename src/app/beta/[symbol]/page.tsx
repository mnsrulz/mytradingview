import { SymbolOverview } from "./SymbolOverview";

export default async function Page(props: { params: Promise<{ symbol: string }> }) {
    const params = await props.params;
    const { symbol } = params;
    return <SymbolOverview symbol={symbol} />;
}
