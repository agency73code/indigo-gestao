import { Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { } from '../types';

export default function LinkHubCard({}: {}) {
    const navigate = useNavigate();

    // Mock data - em um ambiente real, isso viria de props ou context
    const stats = {
        totalLinks: 124,
        activeLinks: 98,
        recentLinks: 12,
        pendingTransfers: 3,
    };

    const handleNavigate = () => {
        navigate('/app/cadastros/vinculos');
    };

    return (
        <Card
            className="h-full hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleNavigate}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-md">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-sora">
                                Vínculos Paciente ⇄ Terapeuta
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Gerencie relacionamentos terapêuticos
                            </CardDescription>
                        </div>
                    </div>
                    {stats.pendingTransfers > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {stats.pendingTransfers}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Total</span>
                        </div>
                        <p className="text-lg font-semibold">{stats.totalLinks}</p>
                    </div>

                    <div className="bg-green-50 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Ativos</span>
                        </div>
                        <p className="text-lg font-semibold text-green-600">{stats.activeLinks}</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Atividade Recente</span>
                    </div>
                    <p className="text-sm text-blue-700">
                        {stats.recentLinks} novos vínculos este mês
                    </p>
                </div>

                {/* Pending Actions */}
                {stats.pendingTransfers > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-600">
                                Ações Pendentes
                            </span>
                        </div>
                        <p className="text-sm text-amber-700">
                            {stats.pendingTransfers} transferência
                            {stats.pendingTransfers > 1 ? 's' : ''} pendente
                            {stats.pendingTransfers > 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate();
                    }}
                >
                    Gerenciar Vínculos
                </Button>
            </CardContent>
        </Card>
    );
}
