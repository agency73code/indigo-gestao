import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RegistroTentativa } from '../types';

interface RegistrosSessaoProps {
  registros: RegistroTentativa[];
}

const iconFor = (resultado: RegistroTentativa['resultado']) => {
  const icons = {
    erro: <span className="text-2xl sm:text-3xl text-red-600">✗</span>,
    ajuda: <span className="text-2xl sm:text-3xl text-yellow-600">✋</span>,
    acerto: <span className="text-2xl sm:text-3xl text-green-600">✓</span>,
  } as const;
  return icons[resultado];
};

export default function RegistrosSessao({ registros }: RegistrosSessaoProps) {
  if (registros.length === 0) {
    return (
      <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
        <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4" /> Registros da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-3 sm:pb-6">
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma tentativa registrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
      <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" /> Registros da Sessão
          <span className="text-sm font-normal text-muted-foreground">({registros.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 sm:pb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {registros.map((r, idx) => (
              <div key={`${r.tentativa}-${idx}`} className="relative flex items-center justify-center h-20 bg-white border rounded-[5px]">
                <span className="absolute top-1 left-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {r.tentativa}
                </span>
                {iconFor(r.resultado)}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <span className="flex items-center gap-1">
              <span className="text-red-600">✗</span> ERRO
            </span>
            <span className="flex items-center gap-1">
              <span className="text-yellow-600">✋</span> AJUDA
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">✓</span> INDEP.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

