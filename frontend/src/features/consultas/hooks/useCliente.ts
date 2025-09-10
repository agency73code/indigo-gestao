import type { Cliente } from "@/features/cadastros";
import { buscarClientePorId } from "@/lib/api";
import { useEffect, useState } from "react";

export function useCliente(id?: string, enable = true) {
    const [data, setData] = useState<Cliente | null>(null);

    useEffect(() => {
        if (!id || !enable) {
            setData(null);
            return;
        }

        buscarClientePorId(id)
            .then((res) => setData(res))
            .catch(() => setData(null));
    }, [id, enable]);
    
    return data;
}