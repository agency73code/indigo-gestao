import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface SettingsCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
    return (
        <Card className="rounded-[5px]">
            <CardHeader className="pb-4">
                <h4 className="text-base font-medium text-foreground">{title}</h4>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
