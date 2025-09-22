import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import Logo403 from '../../../common/components/layout/403';
import AuthBackground from '@/features/auth/components/AuthBackground';

const NotPermissionPage: React.FC = () => {
    React.useEffect(() => {
        document.title = 'Acesso negado — 403';
    }, []);
    
    return (
        <div className="min-h-screen flex items-center justify-center">
            <AuthBackground />

            <Card className="w-full max-w-[550px] mx-auto text-center">
                <div className="flex justify-center ">
                    <Logo403 className="" />
                </div>
                <CardContent className="pt-0 mt-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1
                                className="text-2xl font-semibold text-gray-800"
                                style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                                Você não tem permissão para <br />acessar esta página
                            </h1>
                            <p className="text-gray-600" style={{ fontFamily: 'Sora, sans-serif' }}>
                                Parece que sua conta não tem acesso a este conteúdo.
                            </p>
                        </div>

                        {/* Botões de ação */}
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link to="/sign-in">Voltar ao início</Link>
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

export default NotPermissionPage;
