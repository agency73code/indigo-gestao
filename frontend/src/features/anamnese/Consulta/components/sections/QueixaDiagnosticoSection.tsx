/**
 * Seção de Queixa e Diagnóstico (Step 2) - Visualização
 */
import { Paperclip, Image, FileText, Download } from 'lucide-react';
import ReadOnlyField from '../ReadOnlyField';
import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';
import { formatDate, formatMesAno } from './section-utils';

interface QueixaDiagnosticoSectionProps {
    data: AnamneseDetalhe;
}

export default function QueixaDiagnosticoSection({ data }: QueixaDiagnosticoSectionProps) {
    const queixa = data.queixaDiagnostico;

    return (
        <div className="space-y-6">
            <ReadOnlyField label="1. Queixa Principal Atual" value={queixa.queixaPrincipal} />
            <ReadOnlyField label="2. Diagnóstico Prévio" value={queixa.diagnosticoPrevio} />
            <ReadOnlyField label="3. Há Suspeita de Outra Condição Associada?" value={queixa.suspeitaCondicaoAssociada} />
            
            {/* Médicos Consultados */}
            {queixa.especialidadesConsultadas.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">4. Médicos Consultados até o Momento</h4>
                    <div className="space-y-2">
                        {queixa.especialidadesConsultadas.map(esp => (
                            <div key={esp.id} className="p-3 border rounded-lg bg-muted/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-sm">{esp.nome}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded ${esp.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {esp.ativo ? 'Ainda consulta' : 'Não consulta mais'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{esp.especialidade}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{formatMesAno(esp.data)}</span>
                                </div>
                                {esp.observacao && <p className="text-xs mt-1">{esp.observacao}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Medicamentos */}
            {queixa.medicamentosEmUso.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">5. Uso de Medicamentos</h4>
                    <div className="space-y-2">
                        {queixa.medicamentosEmUso.map(med => (
                            <div key={med.id} className="p-3 border rounded-lg bg-muted/30">
                                <p className="font-medium text-sm">{med.nome} - {med.dosagem}</p>
                                <p className="text-xs text-muted-foreground">Início: {formatDate(med.dataInicio)} | Motivo: {med.motivo}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Exames Prévios */}
            {queixa.examesPrevios.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">6. Exames Prévios Realizados</h4>
                    <div className="space-y-3">
                        {queixa.examesPrevios.map(exame => (
                            <div key={exame.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-sm text-foreground">{exame.nome}</p>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{formatDate(exame.data)}</span>
                                </div>
                                {exame.resultado && (
                                    <p className="text-sm text-muted-foreground mb-3">
                                        <span className="font-medium">Resultado:</span> {exame.resultado}
                                    </p>
                                )}
                                {exame.arquivos && exame.arquivos.length > 0 && (
                                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Paperclip className="h-4 w-4 text-blue-600" />
                                            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                Anexos ({exame.arquivos.length})
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {exame.arquivos.map(arquivo => (
                                                <a
                                                    key={arquivo.id}
                                                    href={arquivo.url || '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
                                                >
                                                    <div className={`p-1.5 rounded-md ${arquivo.tipo.startsWith('image/') ? 'bg-purple-100' : 'bg-orange-100'}`}>
                                                        {arquivo.tipo.startsWith('image/') ? (
                                                            <Image className="h-4 w-4 text-purple-600" />
                                                        ) : (
                                                            <FileText className="h-4 w-4 text-orange-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-foreground truncate group-hover:text-blue-700 transition-colors">
                                                            {arquivo.nome}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {arquivo.tipo.startsWith('image/') ? 'Imagem' : 'Documento'}
                                                        </p>
                                                    </div>
                                                    <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Terapias Prévias */}
            {queixa.terapiasPrevias.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">7. Terapias Prévias e/ou em Andamento</h4>
                    <div className="space-y-2">
                        {queixa.terapiasPrevias.map(ter => (
                            <div key={ter.id} className="p-3 border rounded-lg bg-muted/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-sm">{ter.profissional}</p>
                                        <p className="text-xs text-muted-foreground">{ter.especialidadeAbordagem}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded ${ter.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {ter.ativo ? 'Ativo' : 'Finalizado'}
                                    </span>
                                </div>
                                <p className="text-xs mt-1">Tempo: {ter.tempoIntervencao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
