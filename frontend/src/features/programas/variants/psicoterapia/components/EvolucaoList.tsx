/**
 * Componente de Lista de Evoluções
 */

import { useState } from 'react';
import { Calendar, FileText, ChevronDown, ChevronUp, Image, Video } from 'lucide-react';
import { Button } from '@/ui/button';
import type { EvolucaoTerapeutica } from '../types';
import { formatarData } from '../services';

interface EvolucaoListProps {
    evolucoes: EvolucaoTerapeutica[];
    onEvolucaoClick?: (evolucao: EvolucaoTerapeutica) => void;
}

export default function EvolucaoList({ 
    evolucoes,
    onEvolucaoClick: _onEvolucaoClick,
}: EvolucaoListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (evolucoes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhuma evolução registrada ainda.</p>
            </div>
        );
    }

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-3">
            {evolucoes.map((evolucao) => {
                const isExpanded = expandedId === evolucao.id;
                const arquivosFotos = evolucao.arquivos.filter(a => a.tipo === 'foto');
                const arquivosVideos = evolucao.arquivos.filter(a => a.tipo === 'video');
                
                return (
                    <div 
                        key={evolucao.id}
                        className="border rounded-lg overflow-hidden bg-card"
                    >
                        {/* Header da Evolução */}
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleExpand(evolucao.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                                    <span className="text-lg font-bold text-primary">
                                        {evolucao.numeroSessao}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">
                                        Sessão {evolucao.numeroSessao}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatarData(evolucao.dataEvolucao)}</span>
                                        {evolucao.arquivos.length > 0 && (
                                            <>
                                                <span className="mx-1">•</span>
                                                {arquivosFotos.length > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Image className="h-3 w-3" />
                                                        {arquivosFotos.length}
                                                    </span>
                                                )}
                                                {arquivosVideos.length > 0 && (
                                                    <span className="flex items-center gap-1 ml-2">
                                                        <Video className="h-3 w-3" />
                                                        {arquivosVideos.length}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <Button variant="ghost" size="sm">
                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </Button>
                        </div>

                        {/* Conteúdo Expandido */}
                        {isExpanded && (
                            <div className="px-4 pb-4 border-t">
                                <div className="pt-4">
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Descrição da Sessão
                                    </h4>
                                    <div className="prose prose-sm max-w-none">
                                        <p className="whitespace-pre-wrap text-sm">
                                            {evolucao.descricaoSessao || 'Sem descrição registrada.'}
                                        </p>
                                    </div>
                                    
                                    {/* Arquivos */}
                                    {evolucao.arquivos.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                                Arquivos Anexados
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {evolucao.arquivos.map((arquivo) => (
                                                    <div 
                                                        key={arquivo.id}
                                                        className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm"
                                                    >
                                                        {arquivo.tipo === 'foto' && <Image className="h-4 w-4" />}
                                                        {arquivo.tipo === 'video' && <Video className="h-4 w-4" />}
                                                        {arquivo.tipo === 'documento' && <FileText className="h-4 w-4" />}
                                                        <span>{arquivo.nome}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
