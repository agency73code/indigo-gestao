import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumoSessao } from '../types';

interface ResumoSessaoProps {
  resumo: ResumoSessao;
}

export default function ResumoSessaoCard({ resumo }: ResumoSessaoProps) {
  return (
    <Card className="rounded-[5px] p-1 sm:p-4">
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="h-4 w-4" /> Resumo da Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 border rounded-md">
            <div className="text-xs text-muted-foreground">Acerto</div>
            <div className="text-lg font-semibold">{Math.round(resumo.acerto)}%</div>
          </div>
          <div className="p-3 border rounded-md">
            <div className="text-xs text-muted-foreground">Independência</div>
            <div className="text-lg font-semibold">{Math.round(resumo.independencia)}%</div>
          </div>
          <div className="p-3 border rounded-md">
            <div className="text-xs text-muted-foreground">Tentativas</div>
            <div className="text-lg font-semibold">{resumo.tentativas}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

