import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { CheckCircle, HandHelping, XCircle, Clock, Activity, Calendar } from 'lucide-react';

interface ToKpisData {
  desempenhou: number;
  desempenhouComAjuda: number;
  naoDesempenhou: number;
  tempoTotal: number;
  atividadesTotal: number;
  sessoesTotal: number;
}

interface KpiCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  textColor: string;
}

function KpiCard({ title, value, hint, icon: Icon, bgColor, iconColor, textColor }: KpiCardProps) {
  return (
    <Card 
      padding="hub" 
      className="border-0 shadow-none h-full"
      style={{ backgroundColor: 'var(--hub-card-background)' }}
    >
      <CardHeader className="space-y-3">
        <div className={`h-10 w-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="space-y-1">
          <CardTitleHub className="text-sm whitespace-nowrap">
            {title}
          </CardTitleHub>
          <div className={`text-2xl font-medium ${textColor}`} style={{ fontFamily: 'Sora, sans-serif' }}>
            {value}
          </div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardHeader>
    </Card>
  );
}

interface ToKpiCardsProps {
  data: ToKpisData;
  loading?: boolean;
}

export function ToKpiCards({ data, loading = false }: ToKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-print-kpi-grid>
        {Array.from({ length: 6 }, (_, i) => (
          <Card 
            key={i}
            padding="hub"
            className="border-0 shadow-none"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
          >
            <CardHeader className="space-y-3">
              <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-2 bg-muted animate-pulse rounded w-full" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }
  console.log(data);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-print-kpi-grid>
      <KpiCard
        title="Atividades"
        value={data.atividadesTotal}
        hint="Total trabalhadas"
        icon={Activity}
        bgColor="bg-[#E0F2FE]"
        iconColor="text-sky-600"
        textColor="text-sky-700 dark:text-sky-400"
      />

      <KpiCard
        title="Desempenhou"
        value={data.desempenhou}
        hint="Realizou sozinho"
        icon={CheckCircle}
        bgColor="bg-[#D1FAE5]"
        iconColor="text-green-600"
        textColor="text-green-700 dark:text-green-400"
      />

      <KpiCard
        title="Com Ajuda"
        value={data.desempenhouComAjuda}
        hint="Precisou de suporte"
        icon={HandHelping}
        bgColor="bg-[#FEF3C7]"
        iconColor="text-yellow-600"
        textColor="text-yellow-700 dark:text-yellow-400"
      />

      <KpiCard
        title="Não Desempenhou"
        value={data.naoDesempenhou}
        hint="Não conseguiu realizar"
        icon={XCircle}
        bgColor="bg-[#FEE2E2]"
        iconColor="text-red-600"
        textColor="text-red-700 dark:text-red-400"
      />

      <KpiCard
        title="Tempo Total"
        value={`${data.tempoTotal}min`}
        hint="Duração das atividades"
        icon={Clock}
        bgColor="bg-[#E0E7FF]"
        iconColor="text-indigo-600"
        textColor="text-indigo-700 dark:text-indigo-400"
      />

      <KpiCard
        title="Sessões"
        value={data.sessoesTotal}
        hint="Realizadas no período"
        icon={Calendar}
        bgColor="bg-[#FCE7F3]"
        iconColor="text-pink-600"
        textColor="text-pink-700 dark:text-pink-400"
      />
    </div>
  );
}
