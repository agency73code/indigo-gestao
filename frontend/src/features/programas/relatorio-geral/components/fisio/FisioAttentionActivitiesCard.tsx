import { useState } from 'react';
import { Info, Clock, Dumbbell, AlertTriangle, Activity, CheckCircle, XCircle, HandHelping } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';

export interface FisioAttentionActivityItem {
  id: string;
  nome: string;
  counts: {
    desempenhou: number;
    comAjuda: number;
    naoDesempenhou: number;
  };
  total: number;
  durationMinutes: number | null;
  status: 'desempenhou' | 'desempenhou-com-ajuda' | 'nao-desempenhou';
  metadata?: {
    usedLoad?: boolean;
    loadValue?: string;
    hadDiscomfort?: boolean;
    discomfortDescription?: string;
    hadCompensation?: boolean;
    compensationDescription?: string;
  };
}

interface FisioAttentionActivitiesCardProps {
  data: FisioAttentionActivityItem[];
  loading?: boolean;
}

const WINDOW_OPTIONS = [
  { label: 'Últimas 1', value: 1 },
  { label: 'Últimas 3', value: 3 },
  { label: 'Últimas 5', value: 5 },
];

// Helper para pegar configuração de status
function getStatusConfig(status: string) {
  const configs = {
    'desempenhou': {
      label: 'Desempenhou',
      cls: 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    },
    'desempenhou-com-ajuda': {
      label: 'Desempenhou com Ajuda',
      cls: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
    },
    'nao-desempenhou': {
      label: 'Não Desempenhou',
      cls: 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
    }
  };
  return configs[status as keyof typeof configs] || configs['nao-desempenhou'];
}

export function FisioAttentionActivitiesCard({ data, loading = false }: FisioAttentionActivitiesCardProps) {
  const [lastSessions, setLastSessions] = useState<number>(5);

  // Filtrar apenas atividades com "não desempenhou" > 0
  const attentionActivities = data.filter(item => item.counts.naoDesempenhou > 0);

  const subtitle = `Baseado nas últimas ${lastSessions} sessões. Mostra atividades que precisam ser reforçadas.`;

  return (
    <Card 
      padding="hub" 
      className="rounded-lg border-0 shadow-none"
      style={{ backgroundColor: 'var(--hub-card-background)' }}
    >
      <CardHeader className="pb-3 border-b border-border/40 dark:border-white/15">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Atividades que precisam de atenção
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Critério de atenção"
                      className="text-muted-foreground"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                    Exibe atividades onde o paciente não desempenhou em pelo menos uma tentativa.
                    Ordenadas pela quantidade de "não desempenhou".
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <ToggleGroup
            type="single"
            value={String(lastSessions)}
            onValueChange={(v) => v && setLastSessions(Number(v))}
            className="w-full max-w-[280px] lg:w-auto"
          >
            {WINDOW_OPTIONS.map((opt) => (
              <ToggleGroupItem
                key={opt.value}
                value={String(opt.value)}
                className="flex-1 px-3 py-2 text-xs font-medium"
              >
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="border border-border/40 dark:border-white/15 rounded-lg overflow-hidden"
                style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
              >
                <div className="p-4 space-y-3 border-b border-border/40 dark:border-white/15">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
                <div className="p-4">
                  <Skeleton className="h-7 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : attentionActivities.length === 0 ? (
          <div className="rounded-md border px-4 py-4 text-sm text-muted-foreground">
            <p className="font-medium">
              Excelente! Nenhuma atividade com dificuldade nas últimas {lastSessions} sessões.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Continue acompanhando o desempenho do paciente.
            </p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {attentionActivities
                .sort((a, b) => b.counts.naoDesempenhou - a.counts.naoDesempenhou)
                .map((item) => {
                  const statusConfig = getStatusConfig(item.status);
                  
                  return (
                    <div
                      key={item.id}
                      className="border border-border/40 dark:border-white/15 rounded-lg hover:bg-muted/30 dark:hover:bg-white/5 transition-colors overflow-hidden"
                      style={{ backgroundColor: 'var(--hub-nested-card-background)' }}
                    >
                      {/* Cabeçalho: Título + Stats */}
                      <div className="p-4 space-y-3 border-b border-border/40 dark:border-white/15">
                        {/* Nome da atividade */}
                        <div className="font-normal text-sm" style={{fontFamily: "Sora"}}>
                          {item.nome}
                        </div>

                        {/* Stats com ícones neutros */}
                        <div className="flex flex-wrap gap-2 items-center">
                          {/* Desempenhou */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                            <div className="flex items-center justify-center w-5 h-5 rounded">
                              <CheckCircle className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">Desempenhou:</span>
                            <span className="text-xs text-foreground font-medium">
                              {item.counts.desempenhou}
                            </span>
                          </div>

                          {/* Com Ajuda */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                            <div className="flex items-center justify-center w-5 h-5 rounded">
                              <HandHelping className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">Com Ajuda:</span>
                            <span className="text-xs text-foreground font-medium">
                              {item.counts.comAjuda}
                            </span>
                          </div>

                          {/* Não Desempenhou */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                            <div className="flex items-center justify-center w-5 h-5 rounded">
                              <XCircle className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </div>
                            <span className="text-xs text-muted-foreground">Não Desempenhou:</span>
                            <span className="text-xs text-foreground font-medium">
                              {item.counts.naoDesempenhou}
                            </span>
                          </div>

                          {/* Total */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 ml-auto">
                            <span className="text-xs text-muted-foreground">Total:</span>
                            <span className="text-xs font-semibold text-foreground">
                              {item.total}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rodapé: Status + Tempo + Indicadores */}
                      <div className="p-4 flex flex-wrap items-center gap-2">
                        {/* Status */}
                        <div className={`px-3 py-1.5 rounded-md ${statusConfig.cls}`}>
                          <span className="text-xs font-medium whitespace-nowrap">
                            {statusConfig.label}
                          </span>
                        </div>

                        {/* Badge de tempo */}
                        {item.durationMinutes && item.durationMinutes > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                            <Clock className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {item.durationMinutes} min
                            </span>
                          </div>
                        )}

                        {/* Indicadores compactos de metadata */}
                        {item.metadata && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            {item.metadata.usedLoad && item.metadata.loadValue && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="flex items-center justify-center w-7 h-7 rounded-md cursor-help transition-colors"
                                    style={{
                                      color: 'var(--badge-load-text)',
                                      backgroundColor: 'var(--badge-load-bg)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-load-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-load-bg)'}
                                  >
                                    <Dumbbell className="h-4 w-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[220px] text-xs">
                                  <div className="space-y-1">
                                    <div className="font-semibold">Exercício com carga</div>
                                    <div className="text-muted-foreground">{item.metadata.loadValue}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {item.metadata.hadDiscomfort && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="flex items-center justify-center w-7 h-7 rounded-md cursor-help transition-colors"
                                    style={{
                                      color: 'var(--badge-discomfort-text)',
                                      backgroundColor: 'var(--badge-discomfort-bg)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-discomfort-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-discomfort-bg)'}
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[280px] text-xs">
                                  <div className="space-y-1">
                                    <div className="font-semibold">Desconforto apresentado</div>
                                    <div className="text-muted-foreground">
                                      {item.metadata.discomfortDescription || 'Sem descrição'}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {item.metadata.hadCompensation && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="flex items-center justify-center w-7 h-7 rounded-md cursor-help transition-colors"
                                    style={{
                                      color: 'var(--badge-compensation-text)',
                                      backgroundColor: 'var(--badge-compensation-bg)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-compensation-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--badge-compensation-bg)'}
                                  >
                                    <Activity className="h-4 w-4" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[280px] text-xs">
                                  <div className="space-y-1">
                                    <div className="font-semibold">Compensação apresentada</div>
                                    <div className="text-muted-foreground">
                                      {item.metadata.compensationDescription || 'Sem descrição'}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Campos descritivos de metadata - visível quando preenchido */}
                      {item.metadata && (
                        <div className="p-4 space-y-3 border-t border-border/40 dark:border-white/15">
                          {item.metadata.usedLoad && item.metadata.loadValue && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <Dumbbell 
                                  className="h-3.5 w-3.5"
                                  style={{ color: 'var(--badge-load-text)' }}
                                />
                                <span className="text-xs font-semibold text-foreground">
                                  Exercício com carga
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                {item.metadata.loadValue}
                              </p>
                            </div>
                          )}

                          {item.metadata.hadDiscomfort && item.metadata.discomfortDescription && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <AlertTriangle 
                                  className="h-3.5 w-3.5"
                                  style={{ color: 'var(--badge-discomfort-text)' }}
                                />
                                <span className="text-xs font-semibold text-foreground">
                                  Desconforto apresentado
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                {item.metadata.discomfortDescription}
                              </p>
                            </div>
                          )}
                          
                          {item.metadata.hadCompensation && item.metadata.compensationDescription && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <Activity 
                                  className="h-3.5 w-3.5"
                                  style={{ color: 'var(--badge-compensation-text)' }}
                                />
                                <span className="text-xs font-semibold text-foreground">
                                  Compensação apresentada
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                                {item.metadata.compensationDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
