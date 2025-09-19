import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import Logo401 from '../../../common/components/layout/401';
import AuthBackground from '@/features/auth/components/AuthBackground';

const NotAccessPage: React.FC = () => {
    React.useEffect(() => {
        document.title = 'Acesso negado — 401';
    }, []);
    
    return (
        <div className="min-h-screen flex items-center justify-center">
            <AuthBackground />

            <Card className="w-full max-w-[550px] mx-auto text-center">
                <div className="flex justify-center">
                    <Logo401 className="" />
                </div>
                <CardContent className="pt-0">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1
                                className="text-2xl font-semibold text-gray-800"
                                style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                                Você precisa estar logado
                            </h1>
                            <p className="text-gray-600" style={{ fontFamily: 'Sora, sans-serif' }}>
                                Faça login para continuar.
                            </p>
                        </div>

                        {/* Botões de ação */}
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link to="/sign-in">Voltar ao Login</Link>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => window.history.back()}
                                className="w-full"
                            >
                                Voltar à página anterior
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotAccessPage;
