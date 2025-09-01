import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import Logo404 from '../../../components/ui/404';
import AuthBackground from '@/components/AuthBackground';

const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <AuthBackground />
            <Card className="w-full max-w-md mx-auto text-center">
                        <div className="flex justify-center">
                            <Logo404 className="opacity-80" />
                        </div>
                <CardContent className="pt-0">
                    <div className="space-y-6">
                        {/* Ícone 404 SVG */}

                        {/* Título */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Página não encontrada
                            </h1>
                            <p className="text-gray-600">
                                A página que você está procurando não existe ou foi movida.
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

export default NotFoundPage;
