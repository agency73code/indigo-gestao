import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileDown, FileType, Calendar, User, FileText, Target, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
// Componentes de Fono
import { KpiCards } from '../gerar-relatorio/components/KpiCards';
import { DualLineProgress } from '../gerar-relatorio/components/DualLineProgress';
import { OcpDeadlineCard } from '../gerar-relatorio/components/OcpDeadlineCard';
import { SessionObservationsCard } from '../gerar-relatorio/components/SessionObservationsCard';
// Componentes de TO
import { ToKpiCards, ToActivityDurationChart, ToAttentionActivitiesCard, ToAutonomyByCategoryChart } from '../../programas/relatorio-geral/components/to';
import type { ToKpisData } from '../../programas/relatorio-geral/components/to/ToKpiCards';
import ToPerformanceChart from '../../programas/variants/terapia-ocupacional/components/ToPerformanceChart';
// Componentes de Fisio
import { FisioKpiCards, FisioActivityDurationChart, FisioAttentionActivitiesCard, FisioAutonomyByCategoryChart } from '../../programas/relatorio-geral/components/fisio';
import type { FisioKpisData } from '../../programas/relatorio-geral/components/fisio/FisioKpiCards';
import FisioPerformanceChart from '../../programas/variants/fisioterapia/components/FisioPerformanceChart';
// Componentes de Musicoterapia
import { MusiKpiCards, MusiAttentionActivitiesCard, MusiAutonomyByCategoryChart, MusiParticipacaoChart, MusiSuporteChart, MusiParticipacaoSuporteEvolutionChart } from '../../programas/relatorio-geral/components/musi';
import type { MusiKpisData } from '../../programas/relatorio-geral/components/musi/MusiKpiCards';
import type { SavedReport, Paciente } from '../types';
import type { KpisRelatorio, SerieLinha } from '../gerar-relatorio/types';
import { 
  getReportById, 
  getAllPatients, 
  getTherapistsForReports,
  type TherapistListItem,
} from '../services/relatorios.service';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { AREA_LABELS } from '@/contexts/AreaContext';
import { ReportExporter } from '../gerar-relatorio/print/ReportExporter';
import { exportPdfDirectly, sanitizeForFileName } from '../services/pdf-export.service';
import { exportReportToWord } from '../services/word-export.service';

export function VisualizarRelatorioPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setPageTitle, setHeaderActions, setOnBackClick } = usePageTitle();
  const [report, setReport] = useState<SavedReport | null>(null);
  const [patient, setPatient] = useState<Paciente | null>(null);
  const [therapist, setTherapist] = useState<TherapistListItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para nomes dos filtros
  const [programaNome, setProgramaNome] = useState<string | null>(null);
  const [estimuloNome, setEstimuloNome] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useEffect loadReport - ID:', id);
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) {
      console.warn('⚠️ loadReport: ID não fornecido');
      return;
    }

    console.log('📥 Carregando relatório:', id);

    try {
      setLoading(true);
      const [reportData, patientsData, therapistsData] = await Promise.all([
        getReportById(id),
        getAllPatients(),
        getTherapistsForReports(true),
      ]);

      console.log('✅ Dados carregados:', {
        report: reportData,
        patientsCount: patientsData.length,
        therapistsCount: therapistsData.length,
      });

      if (!reportData) {
        console.error('❌ Relatório não encontrado:', id);
        toast.error('Relatório não encontrado');
        navigate('/app/relatorios');
        return;
      }

      setReport(reportData);
      setPatient(patientsData.find(p => p.id === reportData.patientId) || null);
      setTherapist(therapistsData.find(t => t.id === reportData.therapistId) || null);
      
      // Buscar nomes dos filtros se existirem
      if (reportData.filters?.programaId && reportData.patientId) {
        try {
          const res = await fetch(`/api/ocp/reports/filters/programs?clientId=${reportData.patientId}`, {
            credentials: 'include',
          });
          if (res.ok) {
            const programas = await res.json();
            const programa = programas.find((p: any) => String(p.id) === String(reportData.filters.programaId));
            setProgramaNome(programa?.nome || null);
          }
        } catch (_e) {
          console.warn('Não foi possível buscar nome do programa');
        }
      }
      
      if (reportData.filters?.estimuloId && reportData.patientId) {
        try {
          const url = `/api/ocp/reports/filters/stimulus?clientId=${reportData.patientId}${reportData.filters.programaId ? `&programaId=${reportData.filters.programaId}` : ''}`;
          const res = await fetch(url, { credentials: 'include' });
          if (res.ok) {
            const estimulos = await res.json();
            const estimulo = estimulos.find((e: any) => String(e.id) === String(reportData.filters.estimuloId));
            setEstimuloNome(estimulo?.nome || null);
          }
        } catch (_e) {
          console.warn('Não foi possível buscar nome do estímulo');
        }
      }
      
      console.log('✅ Estado atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  // Handler para exportar PDF diretamente (usando window.print)
  const handleExportPdf = useCallback(async () => {
    const reportElement = document.querySelector('[data-report-exporter]') as HTMLElement;
    if (!reportElement) {
      toast.error('Conteúdo do relatório não encontrado');
      return;
    }

    const patientName = patient?.nome || 'cliente';
    const pdfFileName = `relatorio_${sanitizeForFileName(patientName)}_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
      await exportPdfDirectly(reportElement, pdfFileName);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      // Toast já exibido pelo serviço
    }
  }, [patient]);

  // Handler para exportar Word
  const handleExportWord = useCallback(async () => {
    const reportElement = document.querySelector('[data-report-exporter]') as HTMLElement;
    if (!reportElement || !report) {
      toast.error('Conteúdo do relatório não encontrado');
      return;
    }

    try {
      // Encontrar os dados profissionais que correspondem à área do relatório
      const areaLabel = report.area ? AREA_LABELS[report.area] : undefined;
      const dadosProfissionaisArea = therapist?.dadosProfissionais?.find(
        dp => dp.areaAtuacao === areaLabel
      ) || therapist?.dadosProfissionais?.[0];

      await exportReportToWord({
        report,
        patientName: patient?.nome || 'cliente',
        patientAge: patient?.dataNascimento ? calculateAge(patient.dataNascimento) : null,
        therapistInfo: therapist ? {
          nome: therapist.nome,
          areaAtuacao: areaLabel || dadosProfissionaisArea?.areaAtuacao,
          numeroConselho: dadosProfissionaisArea?.numeroConselho ?? undefined,
        } : null,
        reportElement,
      });
    } catch (error) {
      console.error('Erro ao exportar Word:', error);
    }
  }, [report, patient, therapist]);

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const calculateAge = (birthDate?: string | null): number | null => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Configurar título do header
  useEffect(() => {
    setPageTitle('Visualizar Relatório');
  }, [setPageTitle]);

  // Configurar botão de voltar
  useEffect(() => {
    setOnBackClick(() => () => {
      navigate('/app/relatorios/lista');
    });

    return () => {
      setOnBackClick(undefined);
    };
  }, [setOnBackClick, navigate]);

  // Configurar botões de ação do header
  useEffect(() => {
    if (report) {
      setHeaderActions(
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-10 rounded-full gap-2"
            onClick={handleExportWord}
          >
            <FileType className="h-4 w-4" />
            Exportar Word
          </Button>
          <Button
            variant="default"
            className="h-10 rounded-full gap-2"
            onClick={handleExportPdf}
          >
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      );
    } else {
      setHeaderActions(null);
    }

    return () => setHeaderActions(null);
  }, [report, setHeaderActions, handleExportPdf, handleExportWord]);

  if (loading) {
    console.log('⏳ Componente em loading...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    console.log('⚠️ Report é null, não renderizando nada');
    return null;
  }

  console.log('✅ Renderizando relatório:', report.id, report.title);

  // Título do documento para o PDF
  const documentTitle = patient 
    ? `relatorio_${sanitizeForFileName(patient.nome)}_${new Date().toISOString().split('T')[0]}`
    : 'relatorio';

  // Idade do paciente para o cabeçalho do PDF
  const patientAge = patient?.dataNascimento ? calculateAge(patient.dataNascimento) : undefined;

  return (
    <div className="min-h-screen bg-background pb-8">
      <ReportExporter
        documentTitle={documentTitle}
        reportTitle={report.title}
        hideButton={true}
        clientInfo={patient ? {
          nome: patient.nome,
          idade: patientAge,
        } : undefined}
        therapistInfo={therapist ? {
          nome: therapist.nome,
          areaAtuacao: therapist.dadosProfissionais?.[0]?.areaAtuacao,
          numeroConselho: therapist.dadosProfissionais?.[0]?.numeroConselho ?? undefined,
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
          {/* Cabeçalho do Relatório - Layout Limpo */}
          <div className="bg-card rounded-[5px] border p-6">
            {/* Linha 1: Cliente + Período */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              {/* Info do Cliente */}
              <div className="flex items-center gap-4">
                {patient && (
                  <Avatar className="h-14 w-14">
                    <AvatarImage 
                      src={(patient as any)?.photoUrl || undefined} 
                      alt={patient.nome}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-base font-medium" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {getInitials(patient.nome)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div>
                  {patient && (
                    <>
                      <h2
                        className="font-semibold text-lg text-foreground"
                        style={{ fontFamily: 'Sora, sans-serif' }}
                      >
                        {patient.nome}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {patientAge !== null && patientAge !== undefined && (
                          <span>{patientAge} anos</span>
                        )}
                        {patient.responsavelNome && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {patient.responsavelNome}
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Período Analisado */}
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-4 py-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Período:</span>
                <span className="font-medium">
                  {new Date(report.periodStart).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })} — {new Date(report.periodEnd).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            <Separator className="mb-6" />
            
            {/* Linha 2: Filtros Aplicados */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Terapeuta */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Terapeuta
                </p>
                <p className="font-medium text-sm">
                  {therapist?.nome || 'Todos'}
                </p>
              </div>
              
              {/* Programa */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Programa
                </p>
                <p className="font-medium text-sm">
                  {programaNome || 'Todos os programas'}
                </p>
              </div>
              
              {/* Estímulo */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Estímulo
                </p>
                <p className="font-medium text-sm">
                  {estimuloNome || 'Todos os estímulos'}
                </p>
              </div>
              
              {/* Área Terapêutica */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Área
                </p>
                <p className="font-medium text-sm">
                  {report.area ? AREA_LABELS[report.area] || report.area : 'Não especificada'}
                </p>
              </div>
            </div>
          </div>

        {/* ========== KPIs por Área ========== */}
        
        {/* KPIs - Modelo Fono (Fonoaudiologia, Psicopedagogia, Terapia ABA) */}
        {['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(report.area) && report.generatedData?.kpis && (
          <KpiCards data={report.generatedData.kpis as KpisRelatorio} loading={false} />
        )}
        
        {/* KPIs - Terapia Ocupacional */}
        {report.area === 'terapia-ocupacional' && report.generatedData?.kpis && (
          // Verifica se os KPIs têm a estrutura correta de TO (com desempenhou, tempoTotal, etc.)
          'desempenhou' in report.generatedData.kpis ? (
            <ToKpiCards data={report.generatedData.kpis as unknown as ToKpisData} loading={false} />
          ) : (
            // Fallback: relatório antigo sem dados de TO - exibe mensagem
            <div className="rounded-lg p-6 text-center text-muted-foreground" style={{ backgroundColor: 'var(--hub-card-background)' }}>
              <p>Este relatório foi salvo antes da atualização do sistema.</p>
              <p className="text-sm mt-1">Gere um novo relatório para visualizar os dados completos de Terapia Ocupacional.</p>
            </div>
          )
        )}
        
        {/* KPIs - Modelo Fisio (Fisioterapia, Psicomotricidade, Educação Física) */}
        {['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(report.area) && report.generatedData?.kpis && (
          // Verifica se os KPIs têm a estrutura correta de Fisio (com desempenhou, compensacaoTotal, etc.)
          'desempenhou' in report.generatedData.kpis ? (
            <FisioKpiCards data={report.generatedData.kpis as unknown as FisioKpisData} loading={false} />
          ) : (
            // Fallback: relatório antigo sem dados de Fisio - exibe mensagem
            <div className="rounded-lg p-6 text-center text-muted-foreground" style={{ backgroundColor: 'var(--hub-card-background)' }}>
              <p>Este relatório foi salvo antes da atualização do sistema.</p>
              <p className="text-sm mt-1">Gere um novo relatório para visualizar os dados completos.</p>
            </div>
          )
        )}
        
        {/* KPIs - Musicoterapia */}
        {report.area === 'musicoterapia' && report.generatedData?.kpis && (
          <MusiKpiCards data={report.generatedData.kpis as unknown as MusiKpisData} loading={false} />
        )}

        {/* Observações Clínicas */}
        {report.clinicalObservations && (
          <div 
            className="rounded-lg p-6 overflow-hidden"
            style={{ backgroundColor: 'var(--hub-card-background)' }}
          >
            {/* Header com ícone */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-normal text-foreground" style={{ fontFamily: 'Sora, sans-serif' }}>
                Observações Clínicas
              </h3>
            </div>
            
            {/* Conteúdo das observações */}
            <div 
              className="clinical-observations text-sm text-muted-foreground leading-relaxed break-words overflow-wrap-anywhere"
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              dangerouslySetInnerHTML={{ __html: report.clinicalObservations }}
            />
          </div>
        )}

        {/* ========== Gráficos por Área ========== */}
        
        {/* Gráficos - Modelo Fono (Fonoaudiologia, Psicopedagogia, Terapia ABA) */}
        {['fonoaudiologia', 'psicopedagogia', 'terapia-aba'].includes(report.area) && report.generatedData?.graphic && report.generatedData.graphic.length > 0 && (
          <DualLineProgress 
            data={report.generatedData.graphic as SerieLinha[]} 
            loading={false}
          />
        )}
        
        {/* Gráficos - Terapia Ocupacional */}
        {report.area === 'terapia-ocupacional' && report.generatedData && (
          <>
            {/* Gráfico de Evolução do Desempenho */}
            {report.generatedData.performanceLineData && report.generatedData.performanceLineData.length > 0 && (
              <ToPerformanceChart 
                data={report.generatedData.performanceLineData} 
                loading={false}
                title="Evolução do Desempenho"
                description="Acompanhamento do desempenho nas atividades de vida diária"
                metaLabel="Meta: Convergência"
              />
            )}
            
            {/* Gráficos lado a lado: Tempo por Atividade + Autonomia por Categoria */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {report.generatedData.activityDuration && report.generatedData.activityDuration.length > 0 && (
                <ToActivityDurationChart 
                  data={report.generatedData.activityDuration} 
                  loading={false} 
                />
              )}

              {report.generatedData.autonomyByCategory && report.generatedData.autonomyByCategory.length > 0 && (
                <ToAutonomyByCategoryChart 
                  data={report.generatedData.autonomyByCategory} 
                  loading={false} 
                />
              )}
            </div>

            {/* Atividades com Atenção */}
            {report.generatedData.attentionActivities && report.generatedData.attentionActivities.length > 0 && (
              <ToAttentionActivitiesCard 
                data={report.generatedData.attentionActivities}
                loading={false}
              />
            )}
          </>
        )}
        
        {/* Gráficos - Modelo Fisio (Fisioterapia, Psicomotricidade, Educação Física) */}
        {['fisioterapia', 'psicomotricidade', 'educacao-fisica'].includes(report.area) && report.generatedData && (
          <>
            {/* Gráfico de Performance */}
            {report.generatedData.performance && report.generatedData.performance.length > 0 && (
              <FisioPerformanceChart 
                data={report.generatedData.performance} 
                loading={false}
              />
            )}
            
            {/* Gráficos lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {report.generatedData.activityDuration && report.generatedData.activityDuration.length > 0 && (
                <FisioActivityDurationChart 
                  data={report.generatedData.activityDuration} 
                  loading={false} 
                />
              )}

              {report.generatedData.autonomyByCategory && report.generatedData.autonomyByCategory.length > 0 && (
                <FisioAutonomyByCategoryChart 
                  data={report.generatedData.autonomyByCategory} 
                  loading={false} 
                />
              )}
            </div>

            {/* Atividades com Atenção */}
            {report.generatedData.attentionActivities && report.generatedData.attentionActivities.length > 0 && (
              <FisioAttentionActivitiesCard 
                data={report.generatedData.attentionActivities}
                loading={false}
              />
            )}
          </>
        )}
        
        {/* Gráficos - Musicoterapia */}
        {report.area === 'musicoterapia' && report.generatedData && (
          <>
            {/* Gráfico de Evolução */}
            {report.generatedData.evolutionData && report.generatedData.evolutionData.length > 0 && (
              <MusiParticipacaoSuporteEvolutionChart 
                data={report.generatedData.evolutionData} 
                loading={false}
              />
            )}
            
            {/* Gráficos lado a lado: Participação + Suporte */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {report.generatedData.participacao && report.generatedData.participacao.length > 0 && (
                <MusiParticipacaoChart 
                  data={report.generatedData.participacao} 
                  loading={false} 
                />
              )}

              {report.generatedData.suporte && report.generatedData.suporte.length > 0 && (
                <MusiSuporteChart 
                  data={report.generatedData.suporte} 
                  loading={false} 
                />
              )}
            </div>

            {/* Autonomia por Categoria */}
            {report.generatedData.autonomyByCategory && report.generatedData.autonomyByCategory.length > 0 && (
              <MusiAutonomyByCategoryChart 
                data={report.generatedData.autonomyByCategory} 
                loading={false} 
              />
            )}

            {/* Atividades com Atenção */}
            {report.generatedData.attentionActivities && report.generatedData.attentionActivities.length > 0 && (
              <MusiAttentionActivitiesCard 
                data={report.generatedData.attentionActivities}
                loading={false}
              />
            )}
          </>
        )}

        {/* Prazo do Programa - Usando componente OcpDeadlineCard */}
        {report.generatedData?.programDeadline && (
          <OcpDeadlineCard 
            inicio={report.generatedData.programDeadline.inicio}
            fim={report.generatedData.programDeadline.fim}
            percent={report.generatedData.programDeadline.percent}
            label={report.generatedData.programDeadline.label}
            loading={false}
          />
        )}
        
        {/* Observações das Sessões - Todas as áreas */}
        {report.generatedData?.sessionObservations && 
         report.generatedData.sessionObservations.length > 0 && (
          <SessionObservationsCard
            observations={report.generatedData.sessionObservations}
            loading={false}
            maxItems={30}
            title="Observações das Sessões"
          />
        )}
        </div>
      </ReportExporter>
    </div>
  );
}
