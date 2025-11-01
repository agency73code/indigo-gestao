import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Download, Archive, Calendar, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  getAllTherapists, 
  generateReportPdf,
  archiveReport
} from '../services/relatorios.service';

export function VisualizarRelatorioPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<SavedReport | null>(null);
  const [patient, setPatient] = useState<Paciente | null>(null);
  const [therapist, setTherapist] = useState<Terapeuta | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [archiving, setArchiving] = useState(false);

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
      
      console.log('✅ Estado atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;

    try {
      setGeneratingPdf(true);
      
      if (report.pdfUrl) {
        // Se já tem PDF, baixa direto
        window.open(report.pdfUrl, '_blank');
      } else {
        // Gera novo PDF
        const pdfUrl = await generateReportPdf(report.id);
        window.open(pdfUrl, '_blank');
      }
      
      toast.success('PDF aberto com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do relatório');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleArchive = async () => {
    if (!report) return;
    
    try {
      setArchiving(true);
      await archiveReport(report.id);
      toast.success('Relatório arquivado com sucesso!');
      navigate('/app/relatorios');
    } catch (error) {
      console.error('Erro ao arquivar relatório:', error);
      toast.error('Erro ao arquivar relatório');
    } finally {
      setArchiving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card sticky top-0 z-10">
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => navigate('/relatorios')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1
                  style={{ fontFamily: 'Sora, sans-serif' }}
                  className="text-xl sm:text-2xl font-medium text-primary leading-tight truncate"
                >
                  Visualizar Relatório
                </h1>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-12 rounded-[5px]"
                onClick={handleArchive}
                disabled={archiving || report.status === 'archived'}
              >
                <Archive className="h-4 w-4 mr-2" />
                {archiving ? 'Arquivando...' : report.status === 'archived' ? 'Arquivado' : 'Arquivar'}
              </Button>
              
              <Button
                variant="default"
                className="h-12 rounded-[5px]"
                onClick={handleDownloadPdf}
                disabled={generatingPdf}
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingPdf ? 'Gerando...' : 'Exportar PDF'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        {/* Cabeçalho do Relatório com Cliente */}
        <div className="bg-card rounded-[5px] border px-4 pt-2 py-6">
          <div className="flex items-start gap-4">
            {/* Avatar do cliente - mesmo padrão de vínculos */}
            {patient && (
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={(patient as any)?.avatarUrl || undefined} 
                  alt={patient.nome}
                  className="object-cover"
                />
                <AvatarFallback className="text-sm font-medium" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {getInitials(patient.nome)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Nome do cliente e idade */}
              <div className="flex-1 min-w-0 mb-3">
                {patient && (
                  <>
                    <h3
                      className="font-medium text-base text-foreground truncate mb-1"
                      style={{ fontFamily: 'Sora, sans-serif' }}
                    >
                      {patient.nome}
                    </h3>
                    {/* Idade - mesmo padrão de vínculos */}
                    {patient.dataNascimento && (
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(patient.dataNascimento)} anos
                      </p>
                    )}
                  </>
                )}
              </div>
              
              {/* Título do Relatório e Status na mesma linha */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <h2 
                  className="text-base font-medium flex-1 min-w-0 truncate"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {report.title}
                </h2>
                
                <Badge variant={
                  report.status === 'final' ? 'default' : 'outline'
                } className="shrink-0 text-xs">
                  {report.status === 'final' ? '✓ Finalizado' : '📦 Arquivado'}
                </Badge>
              </div>
              
              {/* Informações adicionais */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {therapist && (
                  <>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {therapist.nome}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Criado em {new Date(report.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {/* Período Analisado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Período Analisado</p>
              <p className="font-medium">
                {new Date(report.periodStart).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })} - {new Date(report.periodEnd).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tipo</p>
              <p className="font-medium capitalize">{report.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Última Atualização</p>
              <p className="font-medium">
                {new Date(report.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
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

        {/* Informações de Arquivo */}
        {report.pdfUrl && (
          <div className="bg-card rounded-[5px] border px-4 py-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              <Download className="h-5 w-5 text-primary" />
              PDF Gerado
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">PDF disponível</p>
                <p className="text-sm text-muted-foreground">Relatório já foi exportado anteriormente</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(report.pdfUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Abrir PDF Salvo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
