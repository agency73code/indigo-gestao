import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getSpecialtyColors } from '@/utils/specialtyColors';
import type { MeuCliente } from '../types';

interface MeusClientesProps {
  data: MeuCliente[];
}

export function MeusClientes({ data }: MeusClientesProps) {
  function getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function formatUltimaSessao(date: string | null): string {
    if (!date) return 'Sem sessão';
    
    const sessaoDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - sessaoDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} sem.`;
    return `Há ${Math.floor(diffDays / 30)} mês`;
  }

  return (
    <Card padding="none" className="h-full flex flex-col border-0 shadow-none p-4" style={{ backgroundColor: 'var(--hub-card-background)' }}>
      <CardHeader className="">
        <CardTitle className="text-sm font-medium text-muted-foreground flex pb-2 items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Meus Clientes
          <Badge variant="secondary" className="ml-auto font-normal text-xs">
            {data.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-3 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-2 pr-1">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              Nenhum cliente vinculado
            </div>
          ) : (
            data.map((cliente) => {
              const colors = getSpecialtyColors(cliente.areaAtuacao);
              return (
                <div
                  key={cliente.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={cliente.avatarUrl} alt={cliente.nome} />
                    <AvatarFallback className="text-xs font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {getInitials(cliente.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cliente.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal px-1.5 py-0"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {cliente.areaAtuacao}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatUltimaSessao(cliente.ultimaSessao)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
