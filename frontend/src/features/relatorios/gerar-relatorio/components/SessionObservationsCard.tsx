'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { MessageSquareText, Calendar, User, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SessionObservation {
  id: string;
  data: string; // ISO date
  programa: string;
  terapeutaNome?: string;
  observacoes: string;
}

interface SessionObservationsCardProps {
  observations: SessionObservation[];
  loading?: boolean;
  maxItems?: number;
  title?: string;
}

export function SessionObservationsCard({
  observations,
  loading = false,
  maxItems = 30,
  title = 'Observações das Sessões',
}: SessionObservationsCardProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              <MessageSquareText className="h-5 w-5 text-green-600" />
            </div>
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar apenas observações não vazias e limitar quantidade
  const filteredObservations = observations
    .filter((obs) => obs.observacoes && obs.observacoes.trim() !== '')
    .slice(0, maxItems);

  if (filteredObservations.length === 0) {
    return null; // Não exibir card se não houver observações
  }

  // Agrupar observações por data
  const groupedByDate = filteredObservations.reduce(
    (acc, obs) => {
      const dateKey = format(parseISO(obs.data), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(obs);
      return acc;
    },
    {} as Record<string, SessionObservation[]>
  );

  // Ordenar datas (mais recentes primeiro)
  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <MessageSquareText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-base font-normal" style={{ fontFamily: 'Sora, sans-serif' }}>
              {title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {filteredObservations.length} observação{filteredObservations.length !== 1 ? 'ões' : ''} registrada{filteredObservations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateObservations = groupedByDate[dateKey];
            const formattedDate = format(parseISO(dateKey), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            });

            return (
              <div key={dateKey} className="space-y-3">
                {/* Header da data */}
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {formattedDate}
                  </span>
                </div>

                {/* Observações do dia */}
                <div className="space-y-3 pl-2">
                  {dateObservations.map((obs) => (
                    <div
                      key={obs.id}
                      className="bg-muted/30 border border-border rounded-lg p-4 space-y-2"
                    >
                      {/* Metadados */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {obs.programa && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {obs.programa}
                          </span>
                        )}
                        {obs.terapeutaNome && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {obs.terapeutaNome}
                          </span>
                        )}
                      </div>

                      {/* Texto da observação */}
                      <p
                        className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                        style={{ wordBreak: 'break-word' }}
                      >
                        {obs.observacoes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Aviso se houver mais observações */}
        {observations.filter((obs) => obs.observacoes?.trim()).length > maxItems && (
          <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-border">
            Exibindo as {maxItems} observações mais recentes de{' '}
            {observations.filter((obs) => obs.observacoes?.trim()).length} totais
          </p>
        )}
      </CardContent>
    </Card>
  );
}
