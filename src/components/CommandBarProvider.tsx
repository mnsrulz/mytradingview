'use client';
import dynamic from 'next/dynamic';

const CommandBar = dynamic(() => import("@/components/CommandBar").then(m => ({ default: m.CommandBar })), { ssr: false });

export const CommandBarProvider = () => <CommandBar />;
