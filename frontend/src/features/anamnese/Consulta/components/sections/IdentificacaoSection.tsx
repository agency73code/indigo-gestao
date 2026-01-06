/**
 * Seção de Identificação (Step 1) - Visualização
 */
import ReadOnlyField from '../ReadOnlyField';
import type { AnamneseDetalhe } from '../../types/anamnese-consulta.types';
import { formatDate, PARENTESCO_LABELS, calcularIdade } from './section-utils';

interface IdentificacaoSectionProps {
    data: AnamneseDetalhe;
}

export default function IdentificacaoSection({ data }: IdentificacaoSectionProps) {
    const cabecalho = data.cabecalho;

    return (
        <div className="space-y-6">
            {/* Dados da Entrevista */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="Data da Entrevista" value={formatDate(cabecalho.dataEntrevista)} />
                <ReadOnlyField label="Profissional Responsável" value={cabecalho.profissionalNome} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="Data de Nascimento" value={formatDate(cabecalho.dataNascimento)} />
                <ReadOnlyField label="Idade" value={cabecalho.idade} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField label="Informante" value={cabecalho.informante} />
                <ReadOnlyField 
                    label="Parentesco" 
                    value={
                        cabecalho.parentesco === 'outro' && cabecalho.parentescoDescricao
                            ? cabecalho.parentescoDescricao
                            : (PARENTESCO_LABELS[cabecalho.parentesco] || cabecalho.parentesco)
                    } 
                />
            </div>
            <ReadOnlyField label="Quem indicou" value={cabecalho.quemIndicou} />

            {/* Cuidadores do Cliente */}
            {cabecalho.cuidadores && cabecalho.cuidadores.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Cuidadores</h4>
                    <div className="space-y-3">
                        {cabecalho.cuidadores.map((cuidador) => {
                            const idade = calcularIdade(cuidador.dataNascimento);
                            
                            return (
                                <div key={cuidador.id} className="p-4 border rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                            {cuidador.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{cuidador.nome}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {cuidador.relacao === 'Outro' && cuidador.descricaoRelacao 
                                                    ? cuidador.descricaoRelacao 
                                                    : cuidador.relacao}
                                                {idade !== null && ` • ${idade} anos`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {cuidador.dataNascimento && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                                                <p className="text-sm">{new Date(cuidador.dataNascimento).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        )}
                                        {idade !== null && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Idade</p>
                                                <p className="text-sm">{idade} anos</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-muted-foreground">Telefone</p>
                                            <p className="text-sm">{cuidador.telefone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">E-mail</p>
                                            <p className="text-sm">{cuidador.email}</p>
                                        </div>
                                        {cuidador.escolaridade && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Escolaridade</p>
                                                <p className="text-sm">{cuidador.escolaridade}</p>
                                            </div>
                                        )}
                                        {cuidador.profissao && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Profissão</p>
                                                <p className="text-sm">{cuidador.profissao}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
