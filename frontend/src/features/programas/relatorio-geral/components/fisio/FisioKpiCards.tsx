import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { CheckCircle, HandHelping, XCircle, Activity, AlertTriangle } from 'lucide-react';

export interface FisioKpisData {
  desempenhou: number;
  desempenhouComAjuda: number;
  naoDesempenhou: number;
  atividadesTotal: number;
  compensacaoTotal: number;
  desconfortoTotal: number;
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

interface FisioKpiCardsProps {
  data: FisioKpisData;
  loading?: boolean;
}

export function FisioKpiCards({ data, loading = false }: FisioKpiCardsProps) {
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-print-kpi-grid>
      <KpiCard
        title="Atividades"
        value={`${data.atividadesTotal ?? 0}`}
        hint="Trabalhadas"
        icon={Activity}
        bgColor="bg-[#E0F2FE]"
        iconColor="text-sky-600"
        textColor="text-sky-700 dark:text-sky-400"
      />

      <KpiCard
        title="Desempenhou"
        value={data.desempenhou ?? 0}
        hint="Realizou sozinho"
        icon={CheckCircle}
        bgColor="bg-[#D1FAE5]"
        iconColor="text-green-600"
        textColor="text-green-700 dark:text-green-400"
      />

      <KpiCard
        title="Com Ajuda"
        value={data.desempenhouComAjuda ?? 0}
        hint="Precisou de suporte"
        icon={HandHelping}
        bgColor="bg-[#FEF3C7]"
        iconColor="text-yellow-600"
        textColor="text-yellow-700 dark:text-yellow-400"
      />

      <KpiCard
        title="Não Desempenhou"
        value={data.naoDesempenhou ?? 0}
        hint="Não conseguiu"
        icon={XCircle}
        bgColor="bg-[#FEE2E2]"
        iconColor="text-red-600"
        textColor="text-red-700 dark:text-red-400"
      />

      <KpiCard
        title="Compensação"
        value={data.compensacaoTotal ?? 0}
        hint="Atividades com comp."
        icon={Activity}
        bgColor="bg-[#DBEAFE]"
        iconColor="text-blue-600"
        textColor="text-blue-700 dark:text-blue-400"
      />

      <KpiCard
        title="Desconforto"
        value={data.desconfortoTotal ?? 0}
        hint="Atividades com dor"
        icon={AlertTriangle}
        bgColor="bg-[#FED7AA]"
        iconColor="text-orange-600"
        textColor="text-orange-700 dark:text-orange-400"
      />
    </div>
  );
}
