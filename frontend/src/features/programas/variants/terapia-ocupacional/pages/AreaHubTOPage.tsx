// Hub da variação Terapia Ocupacional
// Cards de atalho para criar programas e registrar sessões

import { useNavigate } from 'react-router-dom';
import { ClipboardList, FolderOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toConfig } from '../config';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useEffect } from 'react';

export default function AreaHubTOPage() {
  const navigate = useNavigate();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(toConfig.label);
  }, [setPageTitle]);

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
      {/* Shortcuts Grid */}
      <div className="space-y-5 p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Card
              key={shortcut.path}
              className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border border-border/40 rounded-lg bg-[#F1F5F9]"
              onClick={() => navigate(shortcut.path)}
            >
              <CardHeader className="space-y-3 p-2">
                <div className={`h-14 w-14 rounded-lg ${shortcut.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-7 w-7 ${shortcut.iconColor}`} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium text-foreground">
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

