import type { ReactNode } from 'react';

interface PageShellProps {
    header: ReactNode;
    children: ReactNode;
}

/**
 * Shell padrão para páginas com scroll interno
 * Mantém bordas/gutters e layout fixo sem scroll no viewport
 */
export function PageShell({ header, children }: PageShellProps) {
    return (
        <div className="h-[100dvh] overflow-hidden p-6">
            <div className="h-full rounded-xl border bg-white shadow-sm flex flex-col">
                <header className="shrink-0 px-6 py-4">{header}</header>
                <main className="grow min-h-0 overflow-y-auto px-6 pb-6">{children}</main>
            </div>
        </div>
    );
}
