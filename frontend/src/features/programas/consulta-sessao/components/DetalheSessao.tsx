import HeaderSessao from './HeaderSessao';
import RegistrosSessao from './RegistrosSessao';
import ResumoSessaoCard from './ResumoSessao';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Sessao, Patient, ProgramDetail } from '../types';
import { resumirSessao } from '../services';

interface DetalheSessaoProps {
  sessao: Sessao;
  paciente: Patient;
  programa: ProgramDetail;
  onBack?: () => void;
}

export default function DetalheSessao({ sessao, paciente, programa, onBack }: DetalheSessaoProps) {
  const resumo = resumirSessao(sessao);

  // Agrupar registros por estímulo
  const registrosPorEstimulo = sessao.registros.reduce<Record<string, { label: string; tentativas: typeof sessao.registros }>>(
    (acc, r) => {
      const key = r.stimulusId || 'unknown';
      if (!acc[key]) acc[key] = { label: r.stimulusLabel || 'Estímulo', tentativas: [] };
      acc[key].tentativas.push(r);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <HeaderSessao sessao={sessao} paciente={paciente} programa={programa} onBack={onBack} />

      {/* Estímulos em treino */}
      <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
        <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
          <CardTitle className="text-base">Estímulos em treino</CardTitle>
        </CardHeader>
        <CardContent className="pb-3 sm:pb-6">
          <div className="space-y-3">
            {programa.stimuli.map((stim) => {
              const grupo = registrosPorEstimulo[stim.id];
              const tentativas = grupo?.tentativas ?? [];
              return (
                <div key={stim.id} className="border rounded-md p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{stim.label}</div>
                      {stim.description && (
                        <div className="text-xs text-muted-foreground mt-1">{stim.description}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Tentativas: {tentativas.length}</div>
                  </div>
                  {tentativas.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {tentativas.map((t) => {
                        const icon = t.resultado === 'acerto' ? '✓' : t.resultado === 'ajuda' ? '✋' : '✗';
                        const color = t.resultado === 'acerto' ? 'text-green-600' : t.resultado === 'ajuda' ? 'text-yellow-600' : 'text-red-600';
                        return (
                          <span key={`${stim.id}-${t.tentativa}`} className={`text-sm ${color}`} title={`Tentativa ${t.tentativa}`}>
                            {icon}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <RegistrosSessao registros={sessao.registros} />
      <ResumoSessaoCard resumo={resumo} />
    </div>
  );
}

