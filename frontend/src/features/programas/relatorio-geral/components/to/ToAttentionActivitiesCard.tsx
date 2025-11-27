import { useState } from 'react';
import { Info, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';

export interface ToAttentionActivityItem {
  id: string;
  nome: string;
  counts: {
    desempenhou: number;
    comAjuda: number;
    naoDesempenhou: number;
  };
  total: number;
  durationMinutes: number | null;
}

interface ToAttentionActivitiesCardProps {
  data: ToAttentionActivityItem[];
  loading?: boolean;
}

const WINDOW_OPTIONS = [
  { label: 'Últimas 1', value: 1 },
  { label: 'Últimas 3', value: 3 },
  { label: 'Últimas 5', value: 5 },
];

export function ToAttentionActivitiesCard({ data, loading = false }: ToAttentionActivitiesCardProps) {
  const [lastSessions, setLastSessions] = useState<number>(5);

  // Filtrar apenas atividades com "não desempenhou" > 0
  const attentionActivities = data.filter(item => item.counts.naoDesempenhou > 0);

  const subtitle = `Baseado nas últimas ${lastSessions} sessões. Mostra atividades que precisam ser reforçadas.`;

  return (
    <Card className="rounded-[5px] px-6 py-6 md:px-8 lg:px-8">
      <CardHeader className="pb-4">
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
              <div key={i} className="rounded-[5px] border">
                <div className="border-b bg-muted/40 px-4 py-2">
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
                  <div className="flex flex-1 flex-wrap gap-2">
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
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
          <div className="space-y-3">
            {attentionActivities
              .sort((a, b) => b.counts.naoDesempenhou - a.counts.naoDesempenhou)
              .map((item) => (
                <div key={item.id} className="rounded-[5px] border border-orange-200">
                  <div className="border-b bg-orange-50/30 px-4 py-2 flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{item.nome}</p>
                    {item.durationMinutes && (
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {item.durationMinutes}min
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
                    <div className="flex flex-1 flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className="gap-1.5 px-3 py-1 border-red-200 bg-red-50 text-red-700"
                      >
                        <XCircle className="h-3 w-3" />
                        <span className="text-xs">Não Desempenhou:</span>
                        <span className="font-semibold">{item.counts.naoDesempenhou}</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1.5 px-3 py-1">
                        <span className="text-xs">Com Ajuda:</span>
                        <span className="font-semibold">{item.counts.comAjuda}</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1.5 px-3 py-1">
                        <span className="text-xs">Desempenhou:</span>
                        <span className="font-semibold">{item.counts.desempenhou}</span>
                      </Badge>
                    </div>
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 shrink-0">
                      <span className="text-xs">Total:</span>
                      <span className="font-semibold">{item.total}</span>
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
