import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContent } from './SettingsContent';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface PasswordInfo {
    lastChangedAt: string | null; // ISO date string
    daysAgo: number | null;
}

export function SecuritySettings() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [passwordInfo, setPasswordInfo] = useState<PasswordInfo>({
        lastChangedAt: null,
        daysAgo: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;

        const fetchPasswordInfo = async () => {
            setIsLoading(true);
            try {
                // TODO: Integrar com endpoint do backend
                // const response = await fetch(`/api/usuarios/${user.id}/password-info`, {
                //     credentials: 'include',
                // });
                // if (response.ok) {
                //     const data = await response.json();
                //     setPasswordInfo({
                //         lastChangedAt: data.lastChangedAt,
                //         daysAgo: data.daysAgo,
                //     });
                // }
                
                // Dados temporários até o backend estar pronto
                setPasswordInfo({
                    lastChangedAt: null,
                    daysAgo: null,
                });
            } catch (error) {
                console.error('Erro ao buscar informações da senha:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPasswordInfo();
    }, [user?.id]);

    const handleChangePassword = () => {
        navigate('/forgot-password');
    };

    const renderPasswordStatus = () => {
        if (isLoading) {
            return (
                <div className="p-4 bg-background rounded-lg border border-muted animate-pulse">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                </div>
            );
        }

        if (passwordInfo.daysAgo !== null) {
            return (
                <div className="p-4 bg-background dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">
                        ✓ Sua senha foi alterada há {passwordInfo.daysAgo} {passwordInfo.daysAgo === 1 ? 'dia' : 'dias'}
                    </p>
                </div>
            );
        }

        return (
            <div className="p-4 bg-background dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Não há informações sobre a última alteração de senha
                </p>
            </div>
        );
    };

    return (
        <SettingsContent>
            <div className="space-y-8">
                {/* Senha */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[312px] shrink-0">
                        <h3 className="text-sm font-medium text-foreground">Senha</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Altere sua senha de acesso
                        </p>
                    </div>
                    <div className="flex-1">
                        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                            {renderPasswordStatus()}
                            <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={handleChangePassword}
                            >
                                Alterar Senha
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsContent>
    );
}
