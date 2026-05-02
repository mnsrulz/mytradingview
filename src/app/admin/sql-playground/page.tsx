import { SqlPlayground } from "@/components/Admin/SqlPlayground";
import { getWatchlist } from "@/lib/dataService";
import { NoSsr } from "@mui/material";

export default async function Page() {
    const watchList = await getWatchlist();
    const symbols = watchList.map(k => k.symbol).sort();
    return <NoSsr><SqlPlayground symbols={symbols} /></NoSsr>
}