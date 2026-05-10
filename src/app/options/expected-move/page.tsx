'use client';
import { redirect, usePathname } from 'next/navigation';

export default function Page() {
    const pathname = usePathname(); // e.g., "/chart/TSLA"
    redirect(`${pathname}/NVDA`);
}