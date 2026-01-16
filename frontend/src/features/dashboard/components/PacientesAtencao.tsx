import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, TrendingDown, Calendar } from 'lucide-react';
import type { PacienteAtencao } from '../types';

interface PacientesAtencaoProps {
  data: PacienteAtencao[];
}

const MOTIVO_CONFIG: Record<
  PacienteAtencao['motivo'],
  { label: string; icon: React.ReactNode; color: string }
> = {
  sem_sessao: {
    label: 'Sem sessão',
    icon: <Clock className="h-3.5 w-3.5" />,
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  },
  baixa_performance: {
    label: 'Baixa performance',
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  prazo_programa: {
    label: 'Prazo próximo',
    icon: <Calendar className="h-3.5 w-3.5" />,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
};

export function PacientesAtencao({ data }: PacientesAtencaoProps) {
  if (data.length === 0) {
    return (
      <Card className="h-full border-0 shadow-none flex flex-col" style={{ backgroundColor: 'var(--hub-card-background)' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Pacientes que Precisam de Atenção
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Nenhum paciente requer atenção no momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 shadow-none flex flex-col" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Pacientes que Precisam de Atenção
          <Badge variant="secondary" className="ml-auto">
            {data.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-2">
          {data.map((paciente) => {
            const config = MOTIVO_CONFIG[paciente.motivo];
            return (
              <div
                key={paciente.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className={`p-1.5 rounded-md ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{paciente.nome}</p>
                    <Badge variant="outline" className={`text-xs shrink-0 ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {paciente.descricao}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
