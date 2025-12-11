import { useState } from 'react';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloseButton } from '@/components/layout/CloseButton';
import type { AreaType } from '@/contexts/AreaContext';
import { AREA_LABELS } from '@/contexts/AreaContext';
import { getAvailableReportAreas, hasReportConfig } from '../configs';
import { getAreaStyle } from '../constants/areaStyles';

interface AreaSelectorCardProps {
  value: AreaType | null;
  onChange: (area: AreaType | null) => void;
  disabled?: boolean;
}

/**
 * Seletor de área terapêutica com layout de card (igual PatientSelector)
 */
export function AreaSelectorCard({ value, onChange, disabled }: AreaSelectorCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Apenas áreas com config de relatório
  const availableAreas = getAvailableReportAreas();

  // Filtrar áreas pela busca
  const filteredAreas = availableAreas.filter(area => 
    AREA_LABELS[area].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectArea = (area: AreaType) => {
    onChange(area);
    setIsOpen(false);
    setSearchQuery('');
  };

  const areaStyle = getAreaStyle(value);
  const AreaIcon = areaStyle.icon;

  return (
    <>
      <Card className="rounded-lg px-6 py-8 md:px-8 md:py-10 lg:px-8 lg:py-0 h-full">
        <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
          <h3 className="text-base flex items-center gap-2 font-normal" style={{fontFamily: "Sora"}}>
            <AreaIcon className="h-4 w-4" />
            Área Terapêutica
          </h3>
        </CardHeader>
        <CardContent className="pb-3 sm:pb-6">
          {/* Conteúdo */}
          {value ? (
            <div className="flex items-center gap-3 p-2 sm:p-3 bg-muted rounded-lg">
              {/* Ícone da área selecionada */}
              <div className={`h-12 w-12 rounded-full ${areaStyle.bgColor} flex items-center justify-center shrink-0`}>
                <AreaIcon className={`h-6 w-6 ${areaStyle.iconColor}`} />
              </div>

              {/* Informações da área */}
              <div className="flex-1 min-w-0">
                <p className="font-regular text-base">{AREA_LABELS[value]}</p>
                <p className="text-xs text-muted-foreground">
                  Relatório configurado
                </p>
              </div>

              {/* Botão de ação */}
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(true)}
                  disabled={disabled}
                  className="text-xs h-8 rounded-md no-print"
                >
                  Trocar
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              className="w-full h-12" 
              size="lg" 
              onClick={() => setIsOpen(true)}
              disabled={disabled}
            >
              <AreaIcon className="h-4 w-4 mr-2" />
              Selecionar área
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Drawer de Seleção de Área (abre da direita para esquerda) */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50 no-print"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300 no-print rounded-l-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b shrink-0">
              <h2 className="text-lg font-regular" style={{fontFamily: "sora"}}>Selecionar Área Terapêutica</h2>
              <CloseButton onClick={() => setIsOpen(false)} />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 flex-1 overflow-auto">
              <div className="space-y-4">
                <div className="relative">
                  <AreaIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar área..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 p-0.5">
                  {filteredAreas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma área encontrada
                    </div>
                  ) : (
                    filteredAreas.map((area) => {
                      const isSelected = value === area;
                      const isAvailable = hasReportConfig(area);
                      const itemAreaStyle = getAreaStyle(area);
                      const ItemAreaIcon = itemAreaStyle.icon;
                      
                      return (
                        <Card
                          padding="none"
                          key={area}
                          className={`cursor-pointer hover:shadow-md transition-all rounded-lg ${
                            isSelected ? 'ring-2 ring-primary' : ''
                          } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => isAvailable && handleSelectArea(area)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {/* Ícone da área */}
                              <div className={`h-10 w-10 rounded-full ${itemAreaStyle.bgColor} flex items-center justify-center shrink-0`}>
                                <ItemAreaIcon className={`h-5 w-5 ${itemAreaStyle.iconColor}`} />
                              </div>

                              {/* Nome da área */}
                              <div className="flex-1 min-w-0">
                                <p className="font-regular truncate">
                                  {AREA_LABELS[area]}
                                </p>
                                {!isAvailable && (
                                  <p className="text-sm text-muted-foreground">
                                    Configuração em desenvolvimento
                                  </p>
                                )}
                              </div>

                              {/* Indicador de seleção */}
                              {isSelected && (
                                <div className="shrink-0">
                                  <Check className="h-5 w-5 text-primary" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
