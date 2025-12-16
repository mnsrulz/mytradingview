import { ContactMessages } from "@/components/Admin/ContactMessages";
import { getContactMessages } from "@/lib/dataService";

export default async function Page() {
    const contacts = await getContactMessages();
    return <ContactMessages data={contacts} />
}
