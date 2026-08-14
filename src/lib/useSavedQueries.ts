import { SavedQuery } from "@/lib/db.types";
import ky from "ky";
import { useState, useEffect, useCallback } from "react";

export const useSavedQueries = () => {
    const [queries, setQueries] = useState<SavedQuery[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadQueries = () => ky('/api/queries')
        .json<{ items: SavedQuery[] }>()
        .then(r => setQueries(r.items))
        .finally(() => setIsLoading(false));

    useEffect(() => {
        loadQueries();
    }, []);

    const deleteQuery = useCallback(async (queryId: string) => {
        await ky.delete(`/api/queries/${queryId}`);
        setQueries((v) => v.filter(t => t.id != queryId));
    }, []);

    const saveQuery = useCallback(async (query: Omit<SavedQuery, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
        const id = query.id;
        const payload = {
            name: query.name,
            query: query.query,
            perspectiveSettings: query.perspectiveSettings ?? null
        };
        if (id) {
            return ky.put(`/api/queries/${id}`, {
                json: payload
            }).then(_ => {
                setQueries((k) => k.map(o => {
                    if (o.id == id) {
                        o.query = query.query,
                            o.name = query.name,
                            o.perspectiveSettings = query.perspectiveSettings
                    }
                    return o
                }));
            });
        } else {
            return ky.post('/api/queries', { json: payload }).json<SavedQuery>().then(v => {
                setQueries(k => [...k, v]);
                return v;
            });
        }
    }, [])

    return { queries, saveQuery, deleteQuery, isLoading, loadQueries };
};