import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TerapeutaRanking } from '../types';

interface TerapeutasRankingProps {
  data: TerapeutaRanking[];
}

export function TerapeutasRanking({ data }: TerapeutasRankingProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 1:
        return 'bg-slate-400/10 text-slate-500 border-slate-400/20';
      case 2:
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="h-full border-0 shadow-none flex flex-col" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Ranking Terapeutas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-3">
          {data.map((terapeuta, index) => (
            <div
              key={terapeuta.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${getRankColor(index)}`}
              >
                {index + 1}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(terapeuta.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{terapeuta.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {terapeuta.pacientesAtivos} pacientes
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{terapeuta.sessoesMes}</p>
                <p className="text-xs text-muted-foreground">sessões</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {terapeuta.taxaIndependencia}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
