import { 
  Users, 
  CalendarDays, 
  FolderKanban, 
  UserCheck, 
  TrendingUp, 
  Stethoscope,
  Target,
  ClipboardCheck,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { TerapeutaMetrics, GerenteMetrics, DashboardMetrics } from '../types';

// -----------------------------------------------------------------------------
// Shared MetricCard Component - Design Profissional
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
  variant?: 'default' | 'highlight' | 'alert';
}

function MetricCard({ title, value, subtitle, icon, trend, variant = 'default' }: MetricCardProps) {
  const variants = {
    default: {
      card: 'bg-card',
      iconBg: 'bg-primary/10 text-primary',
      valueColor: 'text-foreground'
    },
    highlight: {
      card: 'bg-primary text-primary-foreground',
      iconBg: 'bg-white/20 text-white',
      valueColor: 'text-white'
    },
    alert: {
      card: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-700 dark:text-amber-400'
    }
  };

  const style = variants[variant];

  return (
    <Card 
      padding="none" 
      className={`border shadow-sm hover:shadow-md transition-shadow ${style.card}`}
      style={{ backgroundColor: variant === 'default' ? 'var(--hub-card-background)' : undefined }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-sm truncate ${variant === 'highlight' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <p 
              className={`text-2xl font-semibold mt-1 ${style.valueColor}`}
              style={{ fontWeight: 'var(--dashboard-number-font-weight, 600)' }}
            >
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs mt-1 ${variant === 'highlight' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                variant === 'highlight' 
                  ? 'text-primary-foreground/90' 
                  : trend.positive ? 'text-emerald-600' : 'text-red-500'
              }`}>
                <TrendingUp className={`h-3 w-3 ${!trend.positive && 'rotate-180'}`} />
                <span>{trend.positive ? '+' : ''}{trend.value}% vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={`shrink-0 p-2.5 rounded-xl ${style.iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Compact Metric Card - Para seção secundária
// -----------------------------------------------------------------------------

interface CompactMetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'info';
}

function CompactMetricCard({ title, value, icon, color = 'default' }: CompactMetricCardProps) {
  const colors = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border hover:shadow-sm transition-shadow"
         style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{title}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Terapeuta Metrics Grid - Layout Profissional
// -----------------------------------------------------------------------------

interface TerapeutaMetricsExpanded extends TerapeutaMetrics {
  // Dados calculáveis do banco existente
  sessoesHoje?: number;
  mediaAcertosSemana?: number;
  totalTentativasMes?: number;
  programasSemRegistro7Dias?: number;
  pacientesSemSessao7Dias?: number;
  programasEmManutencao?: number;
  relatoriosPendentes?: number;
}

interface MetricsGridProps {
  metrics: TerapeutaMetricsExpanded;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        title="Meus Pacientes"
        value={metrics.meusPacientes}
        icon={<Users className="h-5 w-5" />}
        variant="highlight"
      />
      <MetricCard
        title="Sessões Hoje"
        value={metrics.sessoesHoje ?? 0}
        icon={<Clock className="h-5 w-5" />}
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
