import { Calendar, User, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Sessao } from '../types';
import { resumirSessao } from '../services';

interface ListaSessoesProps {
  sessoes: Sessao[];
  onVerDetalhes: (sessaoId: string) => void;
}

export default function ListaSessoes({ sessoes, onVerDetalhes }: ListaSessoesProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatPercentage = (value?: number | null) => {
    if (value === null || value === undefined) return 'â€”';
    return `${Math.round(value)}%`;
  };

  if (sessoes.length === 0) {
    return (
      <Card className="rounded-[5px]">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Sessões
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="text-center py-6 text-sm text-muted-foreground">Nenhuma sessão encontrada.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-6 lg:py-0">
      <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Sessões recentes
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-3 sm:pb-6">
        <div className="space-y-3">
          {sessoes.map((sessao) => {
            const resumo = resumirSessao(sessao);
            return (
              <div
                key={sessao.id}
                className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{formatDate(sessao.data)}</span>
                    <span className="text-xs text-muted-foreground">{formatPercentage(resumo.acerto)} acerto</span>
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">{sessao.programa}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{sessao.objetivo}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" /> {sessao.terapeutaNome}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatPercentage(resumo.independencia)} independência</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 ml-3"
                  onClick={() => onVerDetalhes(sessao.id)}
                  aria-label="Ver sessÃ£o"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


