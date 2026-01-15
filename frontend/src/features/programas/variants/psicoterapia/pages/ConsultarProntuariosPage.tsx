/**
 * Página de Consulta de Prontuários Psicológicos
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, ChevronRight, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { listarProntuarios, formatarData } from '../services';
import type { ProntuarioListItem } from '../types';

// Helper para pegar iniciais do nome
function getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ConsultarProntuariosPage() {
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [prontuarios, setProntuarios] = useState<ProntuarioListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setPageTitle('Consultar Prontuários');
    }, [setPageTitle]);

    // Carregar prontuários
    useEffect(() => {
        async function loadProntuarios() {
            setIsLoading(true);
            try {
                const result = await listarProntuarios({ q: searchTerm });
                setProntuarios(result.items);
            } catch (error) {
                console.error('Erro ao carregar prontuários:', error);
            } finally {
                setIsLoading(false);
            }
        }
        
        const debounce = setTimeout(loadProntuarios, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    return (
        <div className="flex flex-col p-4 md:p-6 space-y-6">
            {/* Barra de Ferramentas */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Busca - Lado Esquerdo */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome do cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-9 h-9 rounded-3xl w-[300px]"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setSearchTerm('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                {/* Botão Nova - Lado Direito */}
                <Button onClick={() => navigate('/app/programas/psicoterapia/cadastrar')} className="gap-2 shrink-0 h-9">
                    <Plus className="h-4 w-4" />
                    Novo Prontuário
                </Button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Lista de Prontuários */}
            {!isLoading && prontuarios.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground mb-4">
                        {searchTerm ? 'Nenhum prontuário encontrado com este termo.' : 'Nenhum prontuário cadastrado ainda.'}
                    </p>
                    <Button 
                        variant="outline"
                        onClick={() => navigate('/app/programas/psicoterapia/cadastrar')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Prontuário
                    </Button>
                </div>
            )}

            {!isLoading && prontuarios.length > 0 && (
                <div className="space-y-3">
                    {prontuarios.map((prontuario) => (
                        <Link
                            key={prontuario.id}
                            to={`/app/programas/psicoterapia/prontuario/${prontuario.id}`}
                            className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                            style={{ 
                                backgroundColor: 'var(--hub-card-background)',
                                borderRadius: 'var(--radius)'
                            }}
                        >
                            <Avatar className="h-12 w-12 shrink-0">
                                <AvatarImage src="" alt={prontuario.clienteNome} />
                                <AvatarFallback className="bg-primary/10 text-primary font-regular">
                                    {getInitials(prontuario.clienteNome)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-regular truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                                        {prontuario.clienteNome}
                                    </h3>
                                    <span 
                                        className={`px-2 py-1 text-xs font-medium rounded-full shrink-0 ${
                                            prontuario.status === 'ativo' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}
                                    >
                                        {prontuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {prontuario.clienteIdade} • {prontuario.terapeutaNome}
                                </p>
                            </div>

                            {/* Stats lado direito */}
                            <div className="hidden md:flex items-center gap-6 shrink-0">
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Evoluções</p>
                                    <p className="text-sm font-medium">{prontuario.totalEvolucoes}</p>
                                </div>
                                
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Última Sessão</p>
                                    <p className="text-sm font-medium flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {prontuario.ultimaEvolucao 
                                            ? formatarData(prontuario.ultimaEvolucao) 
                                            : '-'
                                        }
                                    </p>
                                </div>
                            </div>

                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
