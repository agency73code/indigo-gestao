import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';

interface ContextoFamiliarSectionProps {
    data: AnamneseDetalhe;
}

export function ContextoFamiliarSection({ data }: ContextoFamiliarSectionProps) {
    return (
        <div className="space-y-6">
            {/* 8. Histórico Familiar */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">8. Histórico Familiar</h4>
                {(data.contextoFamiliarRotina.historicoFamiliar || []).length > 0 ? (
                    <div className="space-y-3">
                        {(data.contextoFamiliarRotina.historicoFamiliar || []).map((hist, index) => (
                            <div key={hist.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Registro {index + 1}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="md:col-span-3">
                                        <p className="text-xs text-muted-foreground">Condição/Diagnóstico</p>
                                        <p className="text-sm font-medium">{hist.condicao || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Parentesco</p>
                                        <p className="text-sm font-medium">{hist.parentesco || 'Não informado'}</p>
                                    </div>
                                </div>
                                {hist.observacao && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-muted-foreground">Observações</p>
                                        <p className="text-sm">{hist.observacao}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                        Nenhum registro de histórico familiar
                    </div>
                )}
            </div>

            {/* 9. Rotina Atual */}
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">9. Rotina Atual</h4>
                <p className="text-xs text-muted-foreground mb-3">(Esportes, música, entre outros)</p>
                {(data.contextoFamiliarRotina.rotinaDiaria || []).length > 0 ? (
                    <div className="space-y-3">
                        {(data.contextoFamiliarRotina.rotinaDiaria || []).map((rot, index) => (
                            <div key={rot.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Atividade {index + 1}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-muted-foreground">Atividade</p>
                                        <p className="text-sm font-medium">{rot.atividade || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Horário</p>
                                        <p className="text-sm font-medium">{rot.horario || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Responsável</p>
                                        <p className="text-sm font-medium">{rot.responsavel || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Frequência</p>
                                        <p className="text-sm font-medium">{rot.frequencia || 'Não informado'}</p>
                                    </div>
                                </div>
                                {rot.observacao && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-muted-foreground">Observações</p>
                                        <p className="text-sm">{rot.observacao}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                        Nenhuma atividade na rotina cadastrada
                    </div>
                )}
            </div>
        </div>
    );
}
