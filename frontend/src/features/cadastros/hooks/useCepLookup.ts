import { useEffect, useState } from "react";
import { fetchCep, type CepData } from "@/services/cepService";

export function useCepLookup(cep: string) {
    const [data, setData] = useState<CepData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const sanitized = cep.replace(/\D/g, '');
        if (sanitized.length === 8) {
            fetchCep(sanitized)
                .then((res) => {
                    setData(res);
                    setError(null);
                })
                .catch(() => {
                    setError('CEP não encontrado');
                    setData(null);
                });
        } else {
            setData(null);
            setError(null);
        }
    }, [cep]);

    return { data, error };
}