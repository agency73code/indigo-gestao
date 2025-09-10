import type { Terapeuta } from "@/features/cadastros/types/cadastros.types";
import { buscarTerapeutaPorId } from "@/lib/api";
import { useEffect, useState } from "react";


export function useTerapeuta(id?: string, enabled = true) {
    const [data, setData] = useState<Terapeuta | null>(null);

    useEffect(() => {
        if (!id || !enabled) {
            setData(null);
            return;
        }

        buscarTerapeutaPorId(id)
            .then((res) => setData(res))
            .catch(() => setData(null));
    }, [id, enabled]);

    return data;
}