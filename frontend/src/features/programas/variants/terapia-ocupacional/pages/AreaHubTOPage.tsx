// Hub da variação Terapia Ocupacional
// Cards de atalho para criar programas e registrar sessões

import { useNavigate } from 'react-router-dom';
import { ClipboardList, FolderOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toConfig } from '../config';

export default function AreaHubTOPage() {
  const navigate = useNavigate();

  const shortcuts = [
    {
      icon: ClipboardList,
      title: 'Registrar Sessão',
      description: 'Nova sessão de atendimento',
      path: toConfig.routes.registerSession,
      iconColor: 'text-purple-600',
      bgColor: 'bg-[#E9D5FF]',
    },
    {
      icon: FolderOpen,
      title: 'Consultar Sessões',
      description: 'Histórico de atendimentos',
      path: toConfig.routes.listSessions,
      iconColor: 'text-orange-600',
      bgColor: 'bg-[#FED7AA]',
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
        
      </div>

      {/* Shortcuts Grid */}
      <div className="space-y-5 p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Card
              key={shortcut.path}
              className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-border/40 rounded-xl bg-[#F1F5F9]"
              onClick={() => navigate(shortcut.path)}
            >
              <CardHeader className="space-y-3 p-2">
                <div className={`h-14 w-14 rounded-xl ${shortcut.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-7 w-7 ${shortcut.iconColor}`} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {shortcut.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
}

