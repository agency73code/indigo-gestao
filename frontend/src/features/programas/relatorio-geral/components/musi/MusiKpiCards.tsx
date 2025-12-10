import { Card, CardHeader, CardTitleHub } from '@/components/ui/card';
import { CheckCircle, HandHelping, XCircle, Activity, Calendar, Users, Heart } from 'lucide-react';

export interface MusiKpisData {
  desempenhou: number;
  desempenhouComAjuda: number;
  naoDesempenhou: number;
  avgParticipacao: number;
  avgSuporte: number;
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

/**
 * Formata o valor de participação (0-5) para exibição
 */
function formatParticipacao(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}/5`;
}

/**
 * Formata o valor de suporte (1-5) para exibição
 * Quanto menor, melhor (1 = independente)
 */
function formatSuporte(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}/5`;
}

/**
 * Retorna a descrição do nível de participação
 */
function getParticipacaoHint(value: number): string {
  if (value >= 4.5) return 'Supera expectativas';
  if (value >= 3.5) return 'Participa bem';
  if (value >= 2.5) return 'Participa parcialmente';
  if (value >= 1.5) return 'Tenta participar';
  return 'Baixa participação';
}

/**
 * Retorna a descrição do nível de suporte
 */
function getSuporteHint(value: number): string {
  if (value <= 1.5) return 'Quase independente';
  if (value <= 2.5) return 'Supervisão necessária';
  if (value <= 3.5) return 'Suporte moderado';
  return 'Suporte intensivo';
}

interface MusiKpiCardsProps {
  data: MusiKpisData;
  loading?: boolean;
}

export function MusiKpiCards({ data, loading = false }: MusiKpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3" data-print-kpi-grid>
        {Array.from({ length: 7 }, (_, i) => (
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3" data-print-kpi-grid>
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
        title="Participação"
        value={formatParticipacao(data.avgParticipacao)}
        hint={getParticipacaoHint(data.avgParticipacao)}
        icon={Users}
        bgColor="bg-[#EDE9FE]"
        iconColor="text-violet-600"
        textColor="text-violet-700 dark:text-violet-400"
      />

      <KpiCard
        title="Suporte"
        value={formatSuporte(data.avgSuporte)}
        hint={getSuporteHint(data.avgSuporte)}
        icon={Heart}
        bgColor="bg-[#FCE7F3]"
        iconColor="text-pink-600"
        textColor="text-pink-700 dark:text-pink-400"
      />

      <KpiCard
        title="Sessões"
        value={data.sessoesTotal}
        hint="Realizadas no período"
        icon={Calendar}
        bgColor="bg-[#F3E8FF]"
        iconColor="text-purple-600"
        textColor="text-purple-700 dark:text-purple-400"
      />
    </div>
  );
}
