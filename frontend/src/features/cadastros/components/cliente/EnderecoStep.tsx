import { Button } from '@/ui/button';
import { Plus } from 'lucide-react';
import type { Cliente } from '../../types/cadastros.types';
import EnderecoForm from './EnderecoForm';
import { useCallback, useEffect } from 'react';
import * as mask from '@/common/utils/mask';

interface EnderecoStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
    onBlur: (field: string) => void;
}

export default function EnderecoStep({ data, onUpdate, errors, onBlur }: EnderecoStepProps) {
    const enderecos = data.enderecos || [
        {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: '',
            residenciaDe: '',
        },
    ];

    // Helper: encontra cuidador por relacao e retorna o endereço dele
    const findCuidadorByRelacao = (relacao: 'mae' | 'pai') =>
        (data.cuidadores || []).find((c) => c?.relacao === relacao);

    // Copia endereço do cuidador (mãe/pai) para enderecos[0]
    const applyEnderecoFromCuidador = useCallback(
        (relacao: 'mae' | 'pai') => {
            const c = findCuidadorByRelacao(relacao);
            if (!c?.endereco) return;

            onUpdate('enderecos.0.cep', mask.maskCEP(c.endereco.cep || ''));
            onUpdate('enderecos.0.logradouro', c.endereco.logradouro || '');
            onUpdate('enderecos.0.numero', c.endereco.numero || '');
            onUpdate('enderecos.0.complemento', c.endereco.complemento || '');
            onUpdate('enderecos.0.bairro', c.endereco.bairro || '');
            onUpdate('enderecos.0.cidade', c.endereco.cidade || '');
            onUpdate('enderecos.0.uf', c.endereco.uf || '');
        },
        [data.cuidadores, onUpdate],
    );

    // Prefill automático ao abrir (se já estiver selecionado mãe/pai)
    useEffect(() => {
        const v = data.enderecos?.[0]?.residenciaDe;
        if (v === 'mae' || v === 'pai') {
            applyEnderecoFromCuidador(v);
        }
        // roda quando mudar a seleção ou quando cuidadores forem atualizados
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.enderecos?.[0]?.residenciaDe, JSON.stringify(data.cuidadores)]);

    const handleEnderecoChange = useCallback(
        (index: number, field: string, value: string) => {
            const current = data.enderecos && data.enderecos.length ? data.enderecos : enderecos;
            const updated = [...current];
            updated[index] = { ...updated[index], [field]: value };
            onUpdate('enderecos', updated);

            // Lógica especial para residenciaDe no primeiro endereço
            if (index === 0 && field === 'residenciaDe') {
                const val = value as 'mae' | 'pai' | 'outro';
                if (val === 'mae' || val === 'pai') {
                    // preenche com o endereço do cuidador selecionado
                    applyEnderecoFromCuidador(val);
                    // zera o texto do "outro", se existir
                    const updatedWithCleanOutro = [...updated];
                    updatedWithCleanOutro[0] = { ...updatedWithCleanOutro[0], outroResidencia: '' };
                    onUpdate('enderecos', updatedWithCleanOutro);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data.enderecos, onUpdate, applyEnderecoFromCuidador],
    );

    const adicionarEndereco = useCallback(() => {
        const current = data.enderecos && data.enderecos.length ? data.enderecos : enderecos;
        const updated = [
            ...current,
            {
                cep: '',
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                uf: '',
                residenciaDe: '',
            },
        ];
        onUpdate('enderecos', updated);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.enderecos, onUpdate]);

    const removerEndereco = useCallback(
        (index: number) => {
            const current = data.enderecos && data.enderecos.length ? data.enderecos : enderecos;
            if (current.length > 1) {
                const updated = current.filter((_, i) => i !== index);
                onUpdate('enderecos', updated);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [data.enderecos, onUpdate],
    );

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
                    onBlur={onBlur}
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
