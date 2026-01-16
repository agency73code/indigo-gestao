import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EstimuloAtencao } from '../types';

interface EstimulosAtencaoProps {
  data: EstimuloAtencao[];
}

export function EstimulosAtencao({ data }: EstimulosAtencaoProps) {
  const hasData = data.length > 0;

  return (
    <Card className="h-full border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">Estímulos que Precisam Atenção</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {hasData ? (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.map((estimulo) => (
              <div 
                key={estimulo.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-background/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{estimulo.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {estimulo.area} • {estimulo.paciente}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      estimulo.taxaAcerto < 30 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {estimulo.taxaAcerto}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {estimulo.totalTentativas} tent.
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
            <div className="p-3 rounded-full bg-emerald-100">
              <AlertTriangle className="h-5 w-5 text-emerald-600" />
            </div>
            <p>Todos os estímulos estão com boa performance!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
