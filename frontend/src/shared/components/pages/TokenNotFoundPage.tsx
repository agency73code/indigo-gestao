import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import TokenNotFoundLogo from '../../../features/auth/components/token-not-found';
import AuthBackground from '@/features/auth/components/AuthBackground';

const TokenNotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <AuthBackground />
            <Card className="max-w-[550px] flex flex-center text-center m-4">
                <CardContent className="">
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <TokenNotFoundLogo className="opacity-80" />
                        </div>

                        {/* Título */}
                        <div className="space-y-2">
                            <h3
                                className="text-2xl font-semibold text-primary"
                                style={{ fontFamily: 'Sora, sans-serif' }}
                            >
                                Token não encontrado
                            </h3>
                            <p className="text-gray-600" style={{ fontFamily: 'Sora, sans-serif' }}>
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
