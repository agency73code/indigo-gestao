import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User } from 'lucide-react';

export default function CriarProgramaPage() {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');

    return (
        <div className="flex flex-col min-h-full w-full">
            <div className="px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/app/programas/lista">
                        <Button variant="ghost" size="sm" className="p-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1
                            className="text-2xl font-semibold text-primary"
                            style={{ fontFamily: 'Sora, sans-serif' }}
                        >
                            Criar Programa
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Criar um novo programa de treino personalizado
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 px-6 pb-6 w-full">
                <div className="space-y-6 max-w-4xl mx-auto w-full">
                    {/* Info do Paciente */}
                    {patientId && patientName && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Paciente Selecionado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                                    <div>
                                        <p className="font-medium">
                                            {decodeURIComponent(patientName)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            ID: {patientId}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Formulário de Criação do Programa */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Formulário do Programa</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-center text-muted-foreground py-12">
                                <p>Formulário de criação de programa será implementado aqui.</p>
                                <p className="text-sm mt-2">
                                    Paciente:{' '}
                                    {patientName
                                        ? decodeURIComponent(patientName)
                                        : 'Não selecionado'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
