import type { ReactNode } from 'react';

interface SettingsContentProps {
    children: ReactNode;
    footer?: ReactNode;
}

export function SettingsContent({
    children,
    footer,
}: SettingsContentProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Área de conteúdo com scroll */}
            <div className="flex-1 overflow-y-auto p-4">
                {children}
            </div>

            {/* Footer com ações (opcional) */}
            {footer && (
                <div className="px-4 py-4 border-t">
                    {footer}
                </div>
            )}
        </div>
    );
}
