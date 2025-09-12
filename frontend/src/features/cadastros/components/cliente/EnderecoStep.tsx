import { Button } from '@/ui/button';
import { Plus } from 'lucide-react';
import type { Cliente } from '../../types/cadastros.types';
import EnderecoForm from './EnderecoForm';
import { useCallback } from 'react';

interface EnderecoStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
}

export default function EnderecoStep({ data, onUpdate, errors }: EnderecoStepProps) {
    const enderecos = data.enderecos || [
        { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', },
    ];

    const handleEnderecoChange = useCallback(
        (index: number, field: string, value: string) => {
            const current = data.enderecos && data.enderecos.length ? data.enderecos : enderecos;
            const updated = [...current];
            updated[index] = { ...updated[index], [field]: value};
            onUpdate('enderecos', updated);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data.enderecos, onUpdate]
    )

    const adicionarEndereco = useCallback(() => {
        const current = data.enderecos && data.enderecos.length ? data.enderecos : enderecos;
        const updated = [
            ...current,
            { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
        ];
        onUpdate('enderecos', updated);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.enderecos, onUpdate]);

    const removerEndereco = useCallback((index: number) => {
    const current = data.enderecos && data.enderecos.length ? data.enderecos : enderecos;
    if (current.length > 1) {
      const updated = current.filter((_, i) => i !== index);
      onUpdate('enderecos', updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.enderecos, onUpdate]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Endereço</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os endereços do cliente. Campos marcados com * são obrigatórios.
                </p>
            </div>

            {/* Endereços */}
            {enderecos.map((endereco, index) => (
                <EnderecoForm
                    key={index}
                    endereco={endereco}
                    index={index}
                    onUpdate={handleEnderecoChange}
                    onRemove={removerEndereco}
                    errors={errors}
                />
            ))}

            {/* Botão para adicionar novo endereço */}
            <Button
                type="button"
                variant="outline"
                onClick={adicionarEndereco}
                className="w-full flex items-center gap-2 mb-8"
            >
                <Plus className="w-4 h-4" />
                Adicionar outro endereço
            </Button>
        </div>
    );
}
