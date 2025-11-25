import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileText, ChevronDown, ChevronRight, Folder, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import ToolbarConsulta from '@/features/consultas/components/ToolbarConsulta';
import type {
  SavedReport,
  Paciente,
  Terapeuta,
  ReportListFilters,
} from '../types';
import {
  getAllReports,
  getAllPatients,
  getAllTherapists,
} from '../services/relatorios.service';

// Tipo para controlar estados de expansão
type ExpansionState = {
  [patientId: string]: {
    isOpen: boolean;
    folders: {
      [monthKey: string]: boolean;
    };
  };
};

export function RelatoriosPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setPageTitle } = usePageTitle();
  
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [total, setTotal] = useState(0);
  void total; // Silencia warning - será usado na paginação
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [therapists, setTherapists] = useState<Terapeuta[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar accordion de clientes e pastas
  const [expansionState, setExpansionState] = useState<ExpansionState>({});

  // 🔄 Lê filtros da URL
  const filters: ReportListFilters = {
    q: searchParams.get('q') || undefined,
    status: (searchParams.get('status') as any) || 'all',
    orderBy: (searchParams.get('orderBy') as any) || 'recent',
    page: Number(searchParams.get('page')) || 1,
    pageSize: 10,
  };

  // 🔄 Atualiza URL quando filtros mudam
  const updateFilters = (updates: Partial<ReportListFilters>) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Remove parâmetros vazios
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        newParams.set(key, String(value));
      } else {
        newParams.delete(key);
      }
    });
    
    // Reset página ao mudar filtros (exceto se mudança for só de página)
    if (!updates.page && (updates.q !== undefined || updates.status || updates.orderBy)) {
      newParams.delete('page');
    }
    
    setSearchParams(newParams);
  };

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    setPageTitle('Relatórios');
    loadData();
  }, [searchParams, setPageTitle]); // Recarrega quando URL muda

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsResponse, patientsData, therapistsData] = await Promise.all([
        getAllReports(filters),
        getAllPatients(),
        getAllTherapists(),
      ]);
      
      // 🔄 Extrai items e total da resposta paginada
      setReports(reportsResponse.items);
      setTotal(reportsResponse.total);
      setPatients(patientsData);
      setTherapists(therapistsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report: SavedReport) => {
    navigate(`/app/relatorios/${report.id}`);
  };

  // Função para toggle do accordion de cliente
  const togglePatient = (patientId: string) => {
    setExpansionState(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        isOpen: !prev[patientId]?.isOpen,
        folders: prev[patientId]?.folders || {},
      }
    }));
  };

  // Função para toggle de pasta de mês
  const toggleFolder = (patientId: string, monthKey: string) => {
    setExpansionState(prev => ({
      ...prev,
      [patientId]: {
        ...prev[patientId],
        isOpen: prev[patientId]?.isOpen ?? true,
        folders: {
          ...(prev[patientId]?.folders || {}),
          [monthKey]: !prev[patientId]?.folders?.[monthKey],
        }
      }
    }));
  };

  // Função para obter iniciais do nome
  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Função para calcular idade a partir da data de nascimento
  const calculateAge = (birthDate: string | null | undefined): number | null => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    // Verifica se a data é válida
    if (isNaN(birth.getTime())) return null;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Função para obter informações do paciente (com fallbacks)
  const getPatientInfo = (patientId: string, firstReport?: SavedReport) => {
    // 1º: Tenta usar patient do relatório (se populado pelo backend)
    if (firstReport?.patient) {
      return {
        nome: firstReport.patient.nome || 'Paciente',
        cpf: firstReport.patient.cpf,
        avatarUrl: (firstReport.patient as any)?.avatarUrl,
        dataNascimento: firstReport.patient.dataNascimento,
      };
    }

    // 2º: Busca no array de patients carregados
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      return {
        nome: patient.nome || 'Paciente',
        cpf: patient.cpf,
        avatarUrl: (patient as any)?.avatarUrl,
        dataNascimento: patient.dataNascimento,
      };
    }

    // 3º: Tenta extrair nome do título do primeiro relatório
    if (firstReport?.title) {
      // Padrão comum: "Relatório X - Mês Ano - Nome do Cliente"
      const titleParts = firstReport.title.split(' - ');
      if (titleParts.length >= 2) {
        const possibleName = titleParts[titleParts.length - 1].trim();
        if (possibleName && possibleName.length > 2) {
          return {
            nome: possibleName,
            cpf: undefined,
            avatarUrl: undefined,
            dataNascimento: undefined,
          };
        }
      }
    }

    // 4º: Fallback final
    return {
      nome: 'Paciente',
      cpf: undefined,
      avatarUrl: undefined,
      dataNascimento: undefined,
    };
  };

  // Função para obter chave do mês (YYYY-MM) usando UTC para evitar mudar o mês em timezones negativos
  const getMonthKey = (isoDate: string) => isoDate.slice(0, 7);

  const getMonthYearLabel = (monthKey: string) => {
    const utcDate = new Date(`${monthKey}-01T00:00:00Z`);
    return utcDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };

  const getReportGroupingIso = (report: SavedReport) => report.updatedAt || report.createdAt;

  const formatReportGroupingDate = (isoDate: string) => {
    const utcDate = new Date(isoDate);
    return utcDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC'
    });
  };

  const getReportGroupingDate = (report: SavedReport) => {
    const lastUpdate = report.updatedAt || report.createdAt;
    return new Date(lastUpdate);
  };

  // Agrupa relatórios por cliente e depois por mês
  const groupedByPatient = reports.reduce((acc, report) => {
    const patientId = report.patientId;
    if (!acc[patientId]) {
      acc[patientId] = [];
    }
    acc[patientId].push(report);
    return acc;
  }, {} as Record<string, SavedReport[]>);

  // Para cada cliente, agrupa relatórios por mês
  const groupedByPatientAndMonth = Object.entries(groupedByPatient).reduce((acc, [patientId, patientReports]) => {
    const reportsByMonth: Record<string, SavedReport[]> = {};
    
    patientReports.forEach(report => {
      const groupingIso = getReportGroupingIso(report);
      const monthKey = getMonthKey(groupingIso);
      
      if (!reportsByMonth[monthKey]) {
        reportsByMonth[monthKey] = [];
      }
      reportsByMonth[monthKey].push(report);
    });

    // Ordena meses do mais recente para o mais antigo
    const sortedMonths = Object.entries(reportsByMonth).sort((a, b) => {
      return b[0].localeCompare(a[0]); // Ordem decrescente (mais recente primeiro)
    });

    acc[patientId] = sortedMonths;
    return acc;
  }, {} as Record<string, [string, SavedReport[]][]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Conteúdo principal */}
      <div className="px-1 lg:px-4 py-4 space-y-4">
        {/* Linha com Filtros e Botão */}
        <div className="flex gap-4">
          <div className="flex-1">
            <ToolbarConsulta
              searchValue={filters.q || ''}
              onSearchChange={(value) => updateFilters({ q: value })}
              placeholder="Buscar por título, cliente..."
              showFilters={false}
            />
          </div>
          
          <div className="flex gap-2 items-start">
            {/* Filtro de Status */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilters({ status: value as any })}
            >
              <SelectTrigger
                className="w-[170px]"
                style={{ borderRadius: 'var(--radius) !important' }}
                aria-label="Filtrar por status"
              >
                <span className="text-sm">
                  {filters.status === 'all' || !filters.status ? 'Todos' : 
                   filters.status === 'final' ? 'Finalizados' : 'Arquivados'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="final">Finalizados</SelectItem>
                <SelectItem value="archived">Arquivados</SelectItem>
              </SelectContent>
            </Select>

            {/* Botão Novo Relatório */}
            <Button
              onClick={() => navigate('/app/relatorios/novo')}
              className="gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              Novo Relatório
            </Button>
          </div>
        </div>

        {/* Lista de relatórios agrupados por cliente e mês */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum relatório encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Novo Relatório" para criar seu primeiro relatório
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedByPatientAndMonth).map(([patientId, monthsData]) => {
              // Pega o primeiro relatório de qualquer mês para extrair dados do paciente
              const firstReport = monthsData[0]?.[1]?.[0]; // monthsData é array de [monthKey, reports[]]
              const patientInfo = getPatientInfo(patientId, firstReport);
              const totalReports = monthsData.reduce((sum, [, reports]) => sum + reports.length, 0);
              const isPatientOpen = expansionState[patientId]?.isOpen ?? false;
              
              // Debug - remover depois
              if (firstReport) {
                console.log('👤 Patient info para', patientId, ':', {
                  nome: patientInfo.nome,
                  dataNascimento: patientInfo.dataNascimento,
                  idade: patientInfo.dataNascimento ? calculateAge(patientInfo.dataNascimento) : null,
                  temPatientNoReport: !!firstReport.patient,
                });
              }
              
              return (
                <Collapsible
                  key={patientId}
                  open={isPatientOpen}
                  onOpenChange={() => togglePatient(patientId)}
                  className="border overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--hub-card-background)',
                    borderRadius: 'var(--radius)'
                  }}
                >
                  {/* Cabeçalho do Cliente (sempre visível) */}
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                      <div className="shrink-0">
                        {isPatientOpen ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={patientInfo.avatarUrl || ''} alt={patientInfo.nome} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(patientInfo.nome)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 text-left min-w-0">
                        <h3 className="text-base font-semibold truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                          {patientInfo.nome}
                        </h3>
                        {patientInfo.dataNascimento && (
                          <p className="text-sm text-muted-foreground">
                            {calculateAge(patientInfo.dataNascimento)} anos
                          </p>
                        )}
                        {patientInfo.cpf && !patientInfo.dataNascimento && (
                          <p className="text-sm text-muted-foreground">
                            CPF: {patientInfo.cpf}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {totalReports} {totalReports === 1 ? 'relatório' : 'relatórios'}
                        </span>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Conteúdo do Cliente (pastas por mês) */}
                  <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-2">
                      {monthsData.map(([monthKey, monthReports]) => {
                        const monthLabel = getMonthYearLabel(monthKey);
                        const isFolderOpen = expansionState[patientId]?.folders?.[monthKey] ?? false;
                        
                        return (
                          <Collapsible
                            key={monthKey}
                            open={isFolderOpen}
                            onOpenChange={() => toggleFolder(patientId, monthKey)}
                            className="overflow-hidden"
                            style={{ 
                              backgroundColor: 'var(--hub-nested-card-background)',
                              borderRadius: 'var(--radius)'
                            }}
                          >
                            {/* Cabeçalho da Pasta (Mês/Ano) */}
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center gap-2 p-3 hover:bg-muted/30 transition-colors">
                                <div className="shrink-0">
                                  {isFolderOpen ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                
                                <Folder className="h-4 w-4 text-primary shrink-0" />
                                
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-medium capitalize">{monthLabel}</p>
                                </div>
                                
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                  {monthReports.length}
                                </span>
                              </div>
                            </CollapsibleTrigger>

                            {/* Conteúdo da Pasta (Relatórios do mês) */}
                            <CollapsibleContent>
                              <div className="space-y-1 p-2" style={{ backgroundColor: 'var(--hub-nested-card-background)' }}>
                                {monthReports.map((report) => {
                                  const therapist = therapists.find(t => t.id === report.therapistId);
                                  
                                  return (
                                    <div
                                      key={report.id}
                                      className="flex items-center justify-between p-2.5 bg-background hover:bg-muted/50 transition-colors cursor-pointer group"
                                      style={{ borderRadius: 'var(--radius)' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewReport(report);
                                      }}
                                    >
                                      <div className="flex-1 min-w-0 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                            {report.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <p className="text-xs text-muted-foreground">
                                              {formatReportGroupingDate(getReportGroupingIso(report))}
                                            </p>
                                            <span className="text-muted-foreground">•</span>
                                            <p className="text-xs text-muted-foreground truncate">
                                              {therapist?.nome || 'Terapeuta não encontrado'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="shrink-0 ml-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                          report.status === 'final' 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                          {report.status === 'final' ? 'Finalizado' : 'Arquivado'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
