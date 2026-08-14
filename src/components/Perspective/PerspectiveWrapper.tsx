'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import type { HTMLPerspectiveViewerElement } from '@perspective-dev/viewer';

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

export const PerspectiveWrapper = ({ data }: { data: any[] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<HTMLPerspectiveViewerElement | null>(null);
    const [ready, setReady] = useState(false);

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
                viewerRef.current?.remove();
                tableRef.current.table?.delete();
                tableRef.current.worker.terminate();
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
                await viewerRef.current!.restore({
                    table: "options_data",
                    settings: true,
                    plugin_config: {},
                });
            }
        };
        loadOrUpdate();
    }, [workerReady, data]);

    return <Box ref={containerRef} sx={{ height: '100%' }} />;
};