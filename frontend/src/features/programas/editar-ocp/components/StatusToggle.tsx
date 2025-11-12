import { Archive, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StatusToggleProps {
    status: 'active' | 'archived';
    onStatusChange: (status: 'active' | 'archived') => void;
}

export default function StatusToggle({ status, onStatusChange }: StatusToggleProps) {
    const isActive = status === 'active';

    const handleToggle = () => {
        onStatusChange(isActive ? 'archived' : 'active');
    };

    return (
        <Card padding="small" className="rounded-[5px] mb-16 lg:mb-2">
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                <CardTitle className="text-base flex items-center gap-2">
                    {isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                        <Archive className="h-4 w-4 text-gray-600" />
                    )}
                    Status do Programa
                </CardTitle>
            </CardHeader>
            <CardContent className=" pb-3 sm:pb-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {isActive ? 'Ativo' : 'Arquivado'}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {isActive
                                ? 'O programa está ativo e disponível para sessões.'
                                : 'O programa está arquivado e não aparecerá nas consultas.'}
                        </p>
                    </div>

                    <Button
                        onClick={handleToggle}
                        variant={isActive ? 'outline' : 'default'}
                        size="sm"
                        className="ml-3"
                    >
                        {isActive ? (
                            <>
                                <Archive className="h-4 w-4 mr-2" />
                                Arquivar
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Ativar
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
