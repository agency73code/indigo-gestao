import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileDown, Calendar, User, FileText, Target, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { KpiCards } from '../gerar-relatorio/components/KpiCards';
import { DualLineProgress } from '../gerar-relatorio/components/DualLineProgress';
import { OcpDeadlineCard } from '../gerar-relatorio/components/OcpDeadlineCard';
import type { SavedReport, Paciente, Terapeuta } from '../types';
import type { KpisRelatorio, SerieLinha } from '../gerar-relatorio/types';
import { 
  getReportById, 
  getAllPatients, 
  getAllTherapists
} from '../services/relatorios.service';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { AREA_LABELS } from '@/contexts/AreaContext';
import { ReportExporter } from '../gerar-relatorio/print/ReportExporter';
import { exportPdfDirectly, sanitizeForFileName } from '../services/pdf-export.service';

export function VisualizarRelatorioPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { setPageTitle, setHeaderActions, setOnBackClick } = usePageTitle();
  const [report, setReport] = useState<SavedReport | null>(null);
  const [patient, setPatient] = useState<Paciente | null>(null);
  const [therapist, setTherapist] = useState<Terapeuta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para nomes dos filtros
  const [programaNome, setProgramaNome] = useState<string | null>(null);
  const [estimuloNome, setEstimuloNome] = useState<string | null>(null);

  console.log('🎯 VisualizarRelatorioPage montado - ID:', id);

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
        getAllTherapists(),
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
        } catch (e) {
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
        } catch (e) {
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

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
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
  }, [report, setHeaderActions, handleExportPdf]);

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
          numeroConselho: therapist.dadosProfissionais?.[0]?.numeroConselho,
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
                        {patient.dataNascimento && (
                          <span>{calculateAge(patient.dataNascimento)} anos</span>
                        )}
                        {patient.responsavel?.nome && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {patient.responsavel.nome}
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

        {/* KPIs - Usando componente KpiCards */}
        {report.generatedData?.kpis && (
          <KpiCards data={report.generatedData.kpis as KpisRelatorio} loading={false} />
        )}

        {/* Observações Clínicas */}
        {report.clinicalObservations && (
          <div className="bg-card rounded-[5px] border px-4 py-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              <FileText className="h-5 w-5 text-primary" />
              Observações Clínicas
            </h3>
            <div 
              className="clinical-observations prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: report.clinicalObservations }}
              style={{
                '--tw-prose-headings': 'var(--foreground)',
                '--tw-prose-body': 'var(--foreground)',
                '--tw-prose-bold': 'var(--foreground)',
                '--tw-prose-lists': 'var(--foreground)',
              } as React.CSSProperties}
            />
            <style>{`
              .clinical-observations h3 {
                font-size: 1.125rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                color: var(--foreground);
              }
              .clinical-observations h3:first-child {
                margin-top: 0;
              }
              .clinical-observations p {
                margin-bottom: 1rem;
                line-height: 1.75;
                color: var(--foreground);
              }
              .clinical-observations ul {
                margin-top: 0.5rem;
                margin-bottom: 1rem;
              }
              .clinical-observations ul li {
                margin-bottom: 0.5rem;
              }
              .clinical-observations strong {
                font-weight: 600;
                color: var(--primary);
              }
              .clinical-observations .space-y-4 > * + * {
                margin-top: 1rem;
              }
            `}</style>
          </div>
        )}

        {/* Gráfico de Evolução - Usando componente DualLineProgress */}
        {report.generatedData?.graphic && report.generatedData.graphic.length > 0 && (
          <DualLineProgress 
            data={report.generatedData.graphic as SerieLinha[]} 
            loading={false}
          />
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
        </div>
      </ReportExporter>
    </div>
  );
}
