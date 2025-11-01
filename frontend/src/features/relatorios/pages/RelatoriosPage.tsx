import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Plus, FileText, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
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

export function RelatoriosPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [total, setTotal] = useState(0);
  void total; // Silencia warning - será usado na paginação
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [therapists, setTherapists] = useState<Terapeuta[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadData();
  }, [searchParams]); // Recarrega quando URL muda

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
    console.log('🔍 Abrindo relatório:', report.id, report.title);
    console.log('📍 Navegando para:', `/app/relatorios/${report.id}`);
    navigate(`/app/relatorios/${report.id}`);
  };

  // Agrupa relatórios por cliente
  const groupedByPatient = reports.reduce((acc, report) => {
    const patientId = report.patientId;
    if (!acc[patientId]) {
      acc[patientId] = [];
    }
    acc[patientId].push(report);
    return acc;
  }, {} as Record<string, SavedReport[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-0 sm:px-4 py-3 sm:pt-4 pb-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="p-1.5 sm:p-2 shrink-0"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1
                style={{ fontFamily: 'Sora, sans-serif' }}
                className="text-lg sm:text-2xl font-medium text-primary leading-tight"
              >
                Relatórios
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="px-1 lg:px-4 py-4 space-y-4">
        {/* Linha com Filtros e Botão */}
        <div className="flex items-center gap-4">
          {/* Busca - Esquerda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por título, cliente..."
              value={filters.q || ''}
              onChange={(e) => updateFilters({ q: e.target.value })}
              className="pl-10 h-12 rounded-[5px]"
            />
          </div>

          {/* Filtro de Status */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilters({ status: value as any })}
          >
            <SelectTrigger
              className="w-[170px] h-12! min-h-12 rounded-[5px]"
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
          
          {/* Botão Novo Relatório - Direita */}
          <Button
            onClick={() => navigate('/app/relatorios/novo')}
            className="h-12 rounded-[5px] shrink-0 px-4"
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span>Novo Relatório</span>
          </Button>
        </div>

        {/* Lista de relatórios agrupados por cliente */}
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
          <div className="space-y-4">
            {Object.entries(groupedByPatient).map(([patientId, patientReports]) => {
              const patient = patients.find(p => p.id === patientId);
              
              // Pega as iniciais do nome do cliente
              const getInitials = (nome: string) => {
                return nome
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
              };
              
              return (
                <div key={patientId} className="bg-card rounded-lg border p-4">
                  {/* Cabeçalho do grupo com foto do cliente */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={(patient as any)?.avatarUrl || ''} alt={patient?.nome || 'Cliente'} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {patient?.nome ? getInitials(patient.nome) : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {patient?.nome || 'Cliente não encontrado'}
                      </h3>
                      {patient?.cpf && (
                        <p className="text-sm text-muted-foreground">
                          CPF: {patient.cpf}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {patientReports.length} {patientReports.length === 1 ? 'relatório' : 'relatórios'}
                    </span>
                  </div>
                  
                  {/* Lista de relatórios do cliente */}
                  <div className="space-y-2">
                    {patientReports.map((report) => {
                      const therapist = therapists.find(t => t.id === report.therapistId);
                      
                      return (
                        <div
                          key={report.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewReport(report)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                              <p className="font-medium truncate">{report.title}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-muted-foreground">
                                {therapist?.nome || 'Terapeuta não encontrado'}
                              </p>
                              <span className="text-muted-foreground">•</span>
                              <p className="text-sm text-muted-foreground">
                                {new Date(report.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                              {report.periodStart && report.periodEnd && (
                                <>
                                  <span className="text-muted-foreground">•</span>
                                  <p className="text-sm text-muted-foreground">
                                    Período: {new Date(report.periodStart).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - {new Date(report.periodEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
