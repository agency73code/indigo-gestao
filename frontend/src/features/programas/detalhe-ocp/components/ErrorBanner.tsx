import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBannerProps {
    message?: string;
    onRetry?: () => void;
}

export default function ErrorBanner({
    message = 'Ocorreu um erro ao carregar os dados. Tente novamente.',
    onRetry,
}: ErrorBannerProps) {
    return (
        <Card className="rounded-[5px] border-red-200 bg-red-50">
            <CardContent className="p-1 sm:p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />

                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 mb-1">
                            Erro ao carregar dados
                        </h3>
                        <p className="text-sm text-red-700">{message}</p>
                    </div>

                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0 border-red-300 text-red-700 hover:bg-red-100"
                        >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Tentar novamente
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
