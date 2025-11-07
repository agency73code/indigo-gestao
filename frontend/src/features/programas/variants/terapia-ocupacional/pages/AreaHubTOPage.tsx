// Hub da variação Terapia Ocupacional
// Cards de atalho para criar programas e registrar sessões

import { useNavigate } from 'react-router-dom';
import { PlusCircle, ClipboardList, FileText, FolderOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toConfig } from '../config';

export default function AreaHubTOPage() {
  const navigate = useNavigate();

  const shortcuts = [
    {
      icon: PlusCircle,
      title: 'Criar OLP',
      description: 'Novo Objetivo de Longo Prazo',
      path: toConfig.routes.createOlp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: PlusCircle,
      title: 'Criar OCP',
      description: 'Novo Objetivo de Curto Prazo',
      path: toConfig.routes.createOcp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: ClipboardList,
      title: 'Registrar Sessão',
      description: 'Nova sessão de atendimento',
      path: toConfig.routes.registerSession,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: FolderOpen,
      title: 'Consultar Sessões',
      description: 'Histórico de atendimentos',
      path: toConfig.routes.listSessions,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
      {/* Header Section - Seguindo padrão do sistema */}
      <div className="space-y-2 p-0 pb-2">
        <h1
          style={{ fontFamily: 'Sora, sans-serif' }}
          className="text-xl sm:text-2xl font-medium text-primary leading-tight"
        >
          {toConfig.label}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Gerencie programas e sessões de Terapia Ocupacional
        </p>
      </div>

      {/* Shortcuts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Card
              key={shortcut.path}
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50 rounded-[5px]"
              onClick={() => navigate(shortcut.path)}
            >
              <CardHeader className="space-y-4">
                <div className={`h-12 w-12 rounded-lg ${shortcut.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${shortcut.color}`} />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-medium">
                    {shortcut.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    {shortcut.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Info complementar */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20 rounded-[5px]">
        <CardHeader>
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <CardTitle className="text-sm sm:text-base text-blue-900 dark:text-blue-100 font-medium">
                Sobre os registros TO
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-2 leading-relaxed">
                Nas sessões de Terapia Ocupacional são registrados dados complementares para cada objetivo: 
                resultado (Sim/Não/Parcial/N.A.), descrição do desempenho, frequência, duração, observações clínicas 
                e anexos (documentos).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

