import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useEffect } from 'react';

export default function AreaHubMusiPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Musicoterapia');
    }, [setPageTitle]);

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-4">
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    Em breve: criação/consulta de programas e sessões.
                </p>
            </div>
        </div>
    );
}
