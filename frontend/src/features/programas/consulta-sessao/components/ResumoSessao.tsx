import { BarChart3, PieChart, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumoSessao } from '../types';

interface ResumoSessaoProps {
    resumo: ResumoSessao;
}

export default function ResumoSessaoCard({ resumo }: ResumoSessaoProps) {
    console.log(resumo)
    return (
        <Card className="rounded-[5px] px-6 py-2 md:px-8 md:py-10 lg:px-8 lg:py-0">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4" /> Resumo da Sessão
                </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-[5px]">
                        <Target className="h-5 w-5 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round(resumo.acerto)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Acerto geral</p>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-[5px]">
                        <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">
                            {Math.round(resumo.independencia)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Independência</p>
                    </div>

                    <div className="text-center p-3 bg-muted/30 rounded-[5px]">
                        <BarChart3 className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold text-purple-600">
                            {resumo.tentativas}
                        </div>
                        <p className="text-xs text-muted-foreground">Tentativas</p>
                    </div>
                </div>

                    {/* Descrição adicional */}
                    <div className="mt-4 p-3 bg-muted/20 rounded-[5px] text-xs text-muted-foreground">
                        <p>
                            <strong>Acerto geral:</strong> Percentual de tentativas independentes em
                            relação ao total.
                        </p>
                        <p className="mt-1">
                            <strong>Independência:</strong> Percentual de respostas corretas sem
                            ajuda.
                        </p>
                    </div>
            </CardContent>
        </Card>
    );
}
