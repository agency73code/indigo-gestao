import { ArrowLeft, Calendar, Brain, Clock } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Sessao } from '../types';
import type { Patient, ProgramDetail } from '../types';

interface HeaderSessaoProps {
  sessao: Sessao;
  paciente: Patient;
  programa: ProgramDetail;
  onBack?: () => void;
}

export default function HeaderSessao({ sessao, paciente, programa, onBack }: HeaderSessaoProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR');
    } catch {
      return iso;
    }
  };

  const daysLeftInfo = () => {
    const now = new Date();
    const end = new Date(programa.prazoFim!);
    const start = new Date(programa.prazoInicio!);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (isNaN(diff)) return null;
    const status = now > end ? 'finalizado' : `restam ${diff} dias`;
    const period = `${formatDate(start.toISOString())} — ${formatDate(end.toISOString())}`;
    return { status, period };
  };

  const prazo = daysLeftInfo();

  return (
    <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
      <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
        <div className="flex items-center gap-2 mb-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0" aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Sessão de {paciente.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-3 sm:pb-6 space-y-4">
        {/* Paciente */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
          <div className="flex-shrink-0">
            <Avatar className="w-12 h-12 rounded-full">
              {imageLoading && paciente.photoUrl && (
                <Skeleton className="h-12 w-12 rounded-full absolute inset-0" />
              )}
              {paciente.photoUrl ? (
                <AvatarImage 
                  src={paciente.photoUrl.startsWith('/api')
                    ? `${import.meta.env.VITE_API_BASE ?? ''}${paciente.photoUrl}`
                    : paciente.photoUrl}
                  alt={`Foto de ${paciente.name}`}
                  className={imageLoading ? 'opacity-0' : 'opacity-100 transition-opacity'}
                  onLoad={() => setImageLoading(false)}
                />
              ) : null}
              <AvatarFallback className="bg-purple-100 text-purple-600 rounded-full">{getInitials(paciente.name)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base">{paciente.name}</p>
            {paciente.age && <p className="text-xs text-muted-foreground">{paciente.age} anos</p>}
          </div>
        </div>

        {/* Terapeuta e Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Terapeuta:</span>
            <span className="font-medium">{sessao.terapeutaNome || programa.therapistName}</span>
          </div>
          <div className="flex items-center justify sm:justify-end">
            <span className="text-muted-foreground flex items-center gap-1 mr-2">
              <Calendar className="h-3 w-3" /> Data da sessão:
            </span>
            <span className="font-medium">{formatDate(sessao.data)}</span>
          </div>
        </div>

        {/* Programa e Objetivo */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Programa:</p>
          <p className="font-medium text-sm">{sessao.programa}</p>
          {sessao.objetivo && (
            <p className="text-sm text-muted-foreground">Objetivo: {sessao.objetivo}</p>
          )}
        </div>

        {/* Prazo */}
        {prazo && (
          <div className="pt-2 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Prazo do programa
            </span>
            <span className="font-medium text-right">
              {prazo.period}
              <span className="block text-xs text-muted-foreground">{prazo.status}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

