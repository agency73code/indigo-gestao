import { FileText, ClipboardList, FileBarChart, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AtividadeRecente } from '../types';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

const tipoConfig = {
  sessao: { icon: ClipboardList, label: 'Sessão', color: 'text-blue-500' },
  anamnese: { icon: FileText, label: 'Anamnese', color: 'text-purple-500' },
  relatorio: { icon: FileBarChart, label: 'Relatório', color: 'text-emerald-500' },
  programa: { icon: FolderKanban, label: 'Programa', color: 'text-orange-500' },
} as const;

interface AtividadesRecentesProps {
  data: AtividadeRecente[];
}

export function AtividadesRecentes({ data }: AtividadesRecentesProps) {
  const hasData = data.length > 0;

  return (
    <Card className="h-full flex flex-col border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-base font-medium">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-3 overflow-hidden">
        {hasData ? (
          <div className="h-full space-y-2 overflow-y-auto pr-1">
            {data.map((atividade) => {
              const config = tipoConfig[atividade.tipo];
              const Icon = config.icon;
              return (
                <div key={atividade.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-background/50 transition-colors">
                  <div className={`shrink-0 ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{atividade.descricao}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {atividade.paciente}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(atividade.data)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma atividade recente
          </div>
        )}
      </CardContent>
    </Card>
  );
}
