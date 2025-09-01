import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import TokenNotFoundLogo from '../../../components/ui/token-not-found';
import AuthBackground from '@/components/AuthBackground';

const TokenNotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <AuthBackground />
            <Card className="w-full max-w-lg mx-auto text-center">
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {/* Ícone Token Not Found SVG */}
                        <div className="flex justify-center">
                            <TokenNotFoundLogo className="opacity-80" />
                        </div>

                        {/* Título */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Token não encontrado
                            </h1>
                            <p className="text-gray-600">
                                O token de recuperação de senha é inválido ou expirou. Solicite um
                                novo link de recuperação.
                            </p>
                        </div>

                        {/* Botões de ação */}
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link to="/forgot-password">Solicitar novo link</Link>
                            </Button>

                            <Button variant="outline" asChild className="w-full">
                                <Link to="/sign-in">Voltar ao Login</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TokenNotFoundPage;
