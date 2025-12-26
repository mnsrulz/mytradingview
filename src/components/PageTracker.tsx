'use client';

import {usePathname} from 'next/navigation';
import { useTrackPage } from '@/lib/socket';
export const PageTracker = () => {
    const pathname = usePathname();
    useTrackPage(pathname);
    return null;
};