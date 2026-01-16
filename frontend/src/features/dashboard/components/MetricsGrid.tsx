import { Users, CalendarDays, FolderKanban, UserCheck, TrendingUp, Stethoscope } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TerapeutaMetrics, GerenteMetrics, DashboardMetrics } from '../types';

// -----------------------------------------------------------------------------
// Shared MetricCard Component
// -----------------------------------------------------------------------------

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
}

function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
  return (
    <Card padding="none" className="border-0 shadow-none" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{title}</p>
            <p 
              className="text-2xl font-medium text-foreground mt-1"
              style={{ fontWeight: 'var(--dashboard-number-font-weight)' }}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
                <span>{trend.positive ? '+' : ''}{trend.value}% vs mês anterior</span>
              </div>
            )}
          </div>
          <div className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Terapeuta Metrics Grid
// -----------------------------------------------------------------------------

interface MetricsGridProps {
  metrics: TerapeutaMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Meus Pacientes"
        value={metrics.meusPacientes}
        icon={<Users className="h-5 w-5" />}
      />
      <MetricCard
        title="Sessões (Semana)"
        value={metrics.minhasSessoesEstaSemana}
        icon={<CalendarDays className="h-5 w-5" />}
      />
      <MetricCard
        title="Sessões (Mês)"
        value={metrics.minhasSessoesEsteMes}
        icon={<CalendarDays className="h-5 w-5" />}
      />
      <MetricCard
        title="Programas Ativos"
        value={metrics.meusProgramasAtivos}
        icon={<FolderKanban className="h-5 w-5" />}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Gerente Metrics Grid
// -----------------------------------------------------------------------------

interface GerenteMetricsGridProps {
  metrics: GerenteMetrics;
}

export function GerenteMetricsGrid({ metrics }: GerenteMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <MetricCard
        title="Total Pacientes"
        value={metrics.totalPacientes}
        icon={<Users className="h-5 w-5" />}
      />
      <MetricCard
        title="Terapeutas"
        value={metrics.totalTerapeutas}
        icon={<Stethoscope className="h-5 w-5" />}
      />
      <MetricCard
        title="Sessões (Semana)"
        value={metrics.sessoesClinicaSemana}
        icon={<CalendarDays className="h-5 w-5" />}
      />
      <MetricCard
        title="Sessões (Mês)"
        value={metrics.sessoesClinicaMes}
        icon={<CalendarDays className="h-5 w-5" />}
      />
      <MetricCard
        title="Taxa Independência"
        value={`${metrics.taxaIndependenciaClinica}%`}
        icon={<UserCheck className="h-5 w-5" />}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Legacy (mantido para compatibilidade)
// -----------------------------------------------------------------------------

interface LegacyMetricsGridProps {
  metrics: DashboardMetrics;
}

/** @deprecated Use MetricsGrid ou GerenteMetricsGrid */
export function LegacyMetricsGrid({ metrics }: LegacyMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <MetricCard
        title="Clientes Ativos"
        value={metrics.clientesAtivos}
        icon={<Users className="h-5 w-5" />}
      />
      <MetricCard
        title="Sessões (Semana)"
        value={metrics.sessoesEstaSemana}
        icon={<CalendarDays className="h-5 w-5" />}
      />
      <MetricCard
        title="Sessões (Mês)"
        value={metrics.sessoesEsteMes}
        icon={<CalendarDays className="h-5 w-5" />}
      />
      <MetricCard
        title="Programas Ativos"
        value={metrics.programasAtivos}
        icon={<FolderKanban className="h-5 w-5" />}
      />
      <MetricCard
        title="Taxa Independência"
        value={`${metrics.taxaIndependencia}%`}
        icon={<UserCheck className="h-5 w-5" />}
      />
    </div>
  );
}
