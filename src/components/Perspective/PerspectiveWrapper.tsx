import React, { useEffect, useRef } from 'react';

const importCache = new Map();
function safeImport(url: string) {
    if (!importCache.has(url)) {
        // webpackIgnore prevents bundlers like Webpack or Vite from trying to compile the external CDN URL
        const promise = import(/* webpackIgnore: true */ url).catch((err) => {
            importCache.delete(url); // Evict failed attempts so components can retry
            throw err;
        });
        importCache.set(url, promise);
    }
    return importCache.get(url);
}

export const PerspectiveWrapper = ({
    data
}: {
    data: any[];
}) => {
    const viewerRef = useRef(null);

    useEffect(() => {
        // Inject theme CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.crossOrigin = 'anonymous';
        link.href = 'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer/dist/css/themes.css';
        document.head.appendChild(link);

        let worker = null;
        let table = null;

        const loadPerspective = async () => {
            try {
                const urls = [
                    "https://cdn.jsdelivr.net/npm/@perspective-dev/viewer@4.5.1/dist/cdn/perspective-viewer.js",
                    "https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-datagrid@4.5.1/dist/cdn/perspective-viewer-datagrid.js",
                    "https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-charts@4.5.1/dist/cdn/perspective-viewer-charts.js"
                ];

                await Promise.all(urls.map(safeImport));

                // 2. Load and return the client core module (which has default/named exports)
                const clientModule = await safeImport(
                    "https://cdn.jsdelivr.net/npm/@perspective-dev/client@4.5.1/dist/cdn/perspective.js"
                );

                const perspective = clientModule.default;

                worker = await perspective.worker();

                // 2. Pass the static JSON array straight into the engine (No fetch or arrayBuffer needed)
                table = await worker.table(data, { name: "options_data" });

                const viewerElement = viewerRef.current;
                if (viewerElement) {
                    await viewerElement.load(worker);
                    await viewerElement.restore({
                        table: "options_data",
                        settings: true,
                        plugin_config: {  },
                    });
                }
            } catch (error) {
                console.error("Error initializing Perspective with static data:", error);
            }
        };

        loadPerspective();

        return () => {
            document.head.removeChild(link);
            if (table) table.delete();
            if (worker) worker.terminate();
        };
    }, []);

    return (
        <perspective-viewer ref={viewerRef} style={
            {
                height: '100%'
            }
        } />
    );
};