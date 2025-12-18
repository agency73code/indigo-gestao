'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, 
  User, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Search,
  MessageSquare,
  ChevronsUpDown,
  X,
  AlertCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// TYPES
// ============================================
interface SessionObservation {
  id: string;
  data: string; // ISO date
  programa: string;
  terapeutaNome?: string;
  observacoes: string;
}

interface SessionObservationsCardProps {
  observations: SessionObservation[];
  loading?: boolean;
  maxItems?: number;
  title?: string;
  initialCollapsed?: boolean;
}

// ============================================
// CONSTANTS
// ============================================
const INITIAL_VISIBLE_COUNT = 5;
const TRUNCATE_LENGTH = 150;

// ============================================
// SUB-COMPONENTS
// ============================================

/** Skeleton de loading */
function LoadingSkeleton() {
  return (
    <Card className="rounded-[5px] px-6 py-6 md:px-8 lg:px-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-48" />
            <div className="h-4 bg-muted animate-pulse rounded w-32" />
          </div>
          <div className="h-8 bg-muted animate-pulse rounded w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[5px] border p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 bg-muted animate-pulse rounded w-32" />
                <div className="h-5 bg-muted animate-pulse rounded-full w-20" />
              </div>
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4 mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Estado vazio */
function EmptyState({ hasFilters }: { hasFilters?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {hasFilters 
          ? 'Nenhuma observação encontrada para os filtros aplicados'
          : 'Nenhuma observação registrada no período'
        }
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        {hasFilters 
          ? 'Tente ajustar os filtros ou limpar a busca'
          : 'As observações das sessões aparecerão aqui'
        }
      </p>
    </div>
  );
}

/** Card de uma observação individual (colapsável) */
function ObservationCard({ 
  observation, 
  isExpanded, 
  onToggle,
  searchTerm 
}: { 
  observation: SessionObservation; 
  isExpanded: boolean;
  onToggle: () => void;
  searchTerm: string;
}) {
  const isLongText = observation.observacoes.length > TRUNCATE_LENGTH;
  // Na impressão, sempre mostra texto completo
  const displayText = isExpanded || !isLongText 
    ? observation.observacoes 
    : `${observation.observacoes.slice(0, TRUNCATE_LENGTH)}...`;

  // Highlight do termo de busca
  const highlightText = (text: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  // Formatar data para exibição
  const formattedDate = format(parseISO(observation.data), "dd/MM/yyyy", { locale: ptBR });

  return (
    <div className="rounded-[5px] border bg-background hover:bg-muted/20 transition-colors print:rounded-none print:border-0 print:border-b print:border-border/30 print:hover:bg-transparent">
      {/* Header com metadados - TELA */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border/50 print:hidden">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          <Badge variant="outline" className="gap-1 text-xs font-normal shrink-0">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </Badge>
          {observation.programa && (
            <Badge variant="secondary" className="gap-1 text-xs font-normal shrink-0">
              <FileText className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{observation.programa}</span>
            </Badge>
          )}
          {observation.terapeutaNome && (
            <Badge variant="outline" className="gap-1 text-xs font-normal shrink-0">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{observation.terapeutaNome}</span>
            </Badge>
          )}
        </div>
        
        {isLongText && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
            onClick={onToggle}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Mais
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Header com metadados - IMPRESSÃO (layout simplificado) */}
      <div className="hidden print:block px-0 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{formattedDate}</span>
        {observation.programa && (
          <span className="before:content-['_·_']">{observation.programa}</span>
        )}
        {observation.terapeutaNome && (
          <span className="before:content-['_·_']">{observation.terapeutaNome}</span>
        )}
      </div>
      
      {/* Conteúdo da observação - TELA */}
      <div className="px-4 py-3 print:hidden">
        <p 
          className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          {highlightText(displayText)}
        </p>
      </div>
      
      {/* Conteúdo da observação - IMPRESSÃO (texto completo) */}
      <div className="hidden print:block px-0 pb-3">
        <p 
          className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          {observation.observacoes}
        </p>
      </div>
    </div>
  );
}

/** Grupo de observações por data */
function ObservationGroup({ 
  date, 
  observations,
  expandedCards,
  toggleCard,
  searchTerm
}: { 
  date: string; 
  observations: SessionObservation[];
  expandedCards: Set<string>;
  toggleCard: (id: string) => void;
  searchTerm: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const formattedDate = format(parseISO(date), "dd 'de' MMMM", { locale: ptBR });
  const dayOfWeek = format(parseISO(date), "EEEE", { locale: ptBR });

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button 
          className="w-full flex items-center justify-between py-2 px-1 hover:bg-muted/30 rounded-md transition-colors group"
          type="button"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium capitalize">{formattedDate}</span>
            <span className="text-xs text-muted-foreground capitalize">({dayOfWeek})</span>
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {observations.length}
            </Badge>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="space-y-2 pl-6 border-l-2 border-border/50 ml-2">
          {observations.map((obs) => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              isExpanded={expandedCards.has(obs.id)}
              onToggle={() => toggleCard(obs.id)}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function SessionObservationsCard({
  observations,
  loading = false,
  maxItems = 30,
  title = 'Observações das Sessões',
}: SessionObservationsCardProps) {
  // ⚠️ TODOS OS HOOKS DEVEM VIR ANTES DE QUALQUER RETURN
  // States
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Filtrar observações válidas
  const validObservations = useMemo(() => 
    observations
      .filter((obs) => obs.observacoes && obs.observacoes.trim() !== '')
      .slice(0, maxItems),
    [observations, maxItems]
  );

  // Filtrar por busca
  const filteredObservations = useMemo(() => {
    if (!searchTerm.trim()) return validObservations;
    
    const term = searchTerm.toLowerCase();
    return validObservations.filter(obs => 
      obs.observacoes.toLowerCase().includes(term) ||
      obs.programa?.toLowerCase().includes(term) ||
      obs.terapeutaNome?.toLowerCase().includes(term)
    );
  }, [validObservations, searchTerm]);

  // Agrupar por data
  const groupedByDate = useMemo(() => {
    const grouped = filteredObservations.reduce((acc, obs) => {
      const dateKey = format(parseISO(obs.data), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(obs);
      return acc;
    }, {} as Record<string, SessionObservation[]>);

    // Ordenar datas (mais recentes primeiro)
    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({ date, observations: grouped[date] }));
  }, [filteredObservations]);

  // Determinar o que mostrar (progressive disclosure)
  const visibleGroups = useMemo(() => {
    if (isExpanded) return groupedByDate;
    
    // Mostrar apenas as primeiras N observações
    let count = 0;
    const result: typeof groupedByDate = [];
    
    for (const group of groupedByDate) {
      if (count >= INITIAL_VISIBLE_COUNT) break;
      
      const remaining = INITIAL_VISIBLE_COUNT - count;
      const obsToShow = group.observations.slice(0, remaining);
      result.push({ date: group.date, observations: obsToShow });
      count += obsToShow.length;
    }
    
    return result;
  }, [groupedByDate, isExpanded]);

  // Contadores
  const totalCount = validObservations.length;
  const visibleCount = visibleGroups.reduce((acc, g) => acc + g.observations.length, 0);
  const hiddenCount = filteredObservations.length - visibleCount;
  const uniqueDays = groupedByDate.length;

  // Toggle card expansion
  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle all cards
  const toggleAllCards = () => {
    if (expandedCards.size > 0) {
      setExpandedCards(new Set());
    } else {
      setExpandedCards(new Set(filteredObservations.map(o => o.id)));
    }
  };

  // ⚠️ EARLY RETURNS APÓS TODOS OS HOOKS
  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Não exibir se não houver observações válidas
  if (validObservations.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-[5px] px-2 py-2 md:px-2 lg:px-2">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-primary font-normal">
                {title}
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalCount} observação{totalCount !== 1 ? 'ões' : ''} em {uniqueDays} dia{uniqueDays !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Ações do toolbar */}
          <div className="flex items-center gap-2 no-print">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAllCards}
              className="text-xs h-8"
            >
              <ChevronsUpDown className="h-3.5 w-3.5 mr-1" />
              {expandedCards.size > 0 ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative mt-3 no-print">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nas observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Indicador de filtro ativo */}
        {searchTerm && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground no-print">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>
              {filteredObservations.length} resultado{filteredObservations.length !== 1 ? 's' : ''} para "{searchTerm}"
            </span>
          </div>
        )}
      </CardHeader>

      {/* Content */}
      <CardContent>
        {filteredObservations.length === 0 ? (
          <EmptyState hasFilters={!!searchTerm} />
        ) : (
          <>
            {/* Lista agrupada por data */}
            <div className="space-y-4">
              {visibleGroups.map(({ date, observations: groupObs }) => (
                <ObservationGroup
                  key={date}
                  date={date}
                  observations={groupObs}
                  expandedCards={expandedCards}
                  toggleCard={toggleCard}
                  searchTerm={searchTerm}
                />
              ))}
            </div>

            {/* CTA para ver mais/menos */}
            {totalCount > INITIAL_VISIBLE_COUNT && (
              <div className="mt-6 pt-4 border-t border-border/50 no-print">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Ver todas ({hiddenCount} mais)
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
