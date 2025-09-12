import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorBannerProps {
    message?: string;
    onRetry?: () => void;
}

export default function ErrorBanner({
    message = 'Não foi possível carregar os programas.',
    onRetry,
}: ErrorBannerProps) {
    return (
        <Card className="rounded-[5px] border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                        <p className="text-sm text-destructive">{message}</p>
                    </div>
                    {onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                            Tentar novamente
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
