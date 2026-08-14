'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import type { HTMLPerspectiveViewerElement } from '@perspective-dev/viewer';

export interface PerspectiveSettings {
    plugin?: string;
    columns?: string[];
    group_by?: string[];
    split_by?: string[];
    filter?: unknown[];
    sort?: unknown[];
    aggregates?: Record<string, unknown>;
    plugin_config?: Record<string, unknown>;
}

interface PerspectiveWrapperProps {
    data: any[];
    isDarkMode?: boolean;
    onSettingsChange?: (settings: PerspectiveSettings) => void;
    initialSettings?: PerspectiveSettings | null;
}

const importCache = new Map<string, Promise<any>>();
function safeImport(url: string) {
    if (!importCache.has(url)) {
        const promise = import(/* webpackIgnore: true */ url).catch((err) => {
            importCache.delete(url);
            throw err;
        });
        importCache.set(url, promise);
    }
    return importCache.get(url)!;
}

const CDN = {
    viewer: "https://cdn.jsdelivr.net/npm/@perspective-dev/viewer@5.2.0/dist/cdn/perspective-viewer.js",
    datagrid: "https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-datagrid@5.2.0/dist/cdn/perspective-viewer-datagrid.js",
    charts: "https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-charts@5.2.0/dist/cdn/perspective-viewer-charts.js",
    client: "https://cdn.jsdelivr.net/npm/@perspective-dev/client@5.2.0/dist/cdn/perspective.js",
    serverWasm: "https://cdn.jsdelivr.net/npm/@perspective-dev/server@5.2.0/dist/wasm/perspective-server.wasm",
    theme: "https://cdn.jsdelivr.net/npm/@perspective-dev/viewer@5.2.0/dist/css/themes.css",
};

const SCRIPTS_READY = Promise.all([
    safeImport(CDN.viewer),
    safeImport(CDN.datagrid),
    safeImport(CDN.charts),
    safeImport(CDN.client),
]).then(() => {
    if (typeof document === 'undefined') return;
    if (!document.querySelector(`link[href="${CDN.theme}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.crossOrigin = 'anonymous';
        link.href = CDN.theme;
        document.head.appendChild(link);
    }
});

export const PerspectiveWrapper = ({ data, isDarkMode = false, onSettingsChange, initialSettings }: PerspectiveWrapperProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLPerspectiveViewerElement | null>(null);
    const [ready, setReady] = useState(false);
    const onSettingsChangeRef = useRef(onSettingsChange);
    onSettingsChangeRef.current = onSettingsChange;

    useEffect(() => {
        SCRIPTS_READY.then(() => setReady(true));
    }, []);

    useEffect(() => {
        if (!ready || !containerRef.current || viewerRef.current) return;
        const viewer = document.createElement('perspective-viewer');
        viewer.style.height = '100%';
        viewer.style.width = '100%';
        containerRef.current.appendChild(viewer);
        viewerRef.current = viewer;
        return () => {
            viewerRef.current?.remove();
            viewerRef.current = null;
        };
    }, [ready]);

    const tableRef = useRef<any>(null);
    const [workerReady, setWorkerReady] = useState(false);

    useEffect(() => {
        if (!ready || !viewerRef.current || workerReady) return;
        let cancelled = false;

        const init = async () => {
            const clientModule = await safeImport(CDN.client);
            const perspective = clientModule.default;
            await perspective.init_server({ wasm32: () => fetch(CDN.serverWasm) });
            const worker = await perspective.worker();
            if (cancelled) { worker.terminate(); return; }
            tableRef.current = { worker, table: null };
            setWorkerReady(true);
        };
        init();

        return () => {
            cancelled = true;
            if (tableRef.current) {
                viewerRef.current?.delete();
                tableRef.current.table?.delete({ lazy: true });
                tableRef.current = null;
                viewerRef.current = null;
                setWorkerReady(false);
            }
        };
    }, [ready]);

    useEffect(() => {
        if (!workerReady || !viewerRef.current || data.length === 0) return;
        const { worker } = tableRef.current;

        const loadOrUpdate = async () => {
            if (tableRef.current.table) {
                tableRef.current.table.update(data);
            } else {
                const table = await worker.table(data, { name: "options_data" });
                tableRef.current.table = table;
                await viewerRef.current!.load(worker);
                const restoreConfig: Record<string, unknown> = {
                    ...initialSettings,
                    table: "options_data",
                    settings: true,
                    theme: isDarkMode ? "Pro Dark" : "Pro Light",
                };
                await viewerRef.current!.restore(restoreConfig);

                viewerRef.current!.addEventListener('perspective-config-update', () => {
                    viewerRef.current!.save().then((config) => {
                        const { table: _table, settings: _settings, ...userSettings } = config as Record<string, unknown>;
                        onSettingsChangeRef.current?.(userSettings as PerspectiveSettings);
                    }).catch(() => {});
                });
            }
        };
        loadOrUpdate();
    }, [workerReady, data]);

    useEffect(() => {
        if (!viewerRef.current || !tableRef.current?.table) return;
        viewerRef.current.restore({
            theme: isDarkMode ? "Pro Dark" : "Pro Light",
        }).catch(() => {});
    }, [isDarkMode]);

    const prevSettingsRef = useRef<PerspectiveSettings | null | undefined>(undefined);
    useEffect(() => {
        if (!viewerRef.current || !tableRef.current?.table) return;
        if (prevSettingsRef.current === initialSettings) return;
        prevSettingsRef.current = initialSettings;
        if (!initialSettings) return;

        viewerRef.current.restore({
            ...initialSettings,
            table: "options_data",
            settings: true,
        } as any).catch(() => {});
    }, [initialSettings]);

    return <Box ref={containerRef} sx={{ height: '100%' }} />
};