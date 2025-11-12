import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface ActionBarProps {
    children: ReactNode;
    className?: string;
    fixed?: boolean; // Se true, usa position fixed. Se false, apenas aplica o estilo
}

/**
 * Componente de barra de ação fixa no rodapé da página
 * 
 * Padrão de design:
 * - Separator no topo
 * - Fundo com backdrop blur
 * - Padding e alinhamento consistentes
 * - Botões arredondados
 * - Responsivo (mobile e desktop)
 * 
 * @example
 * ```tsx
 * <ActionBar>
 *   <Button onClick={handleSave} className="rounded-full">
 *     <Save className="h-4 w-4" />
 *     Salvar
 *   </Button>
 *   <Button onClick={handleCancel} variant="outline" className="rounded-full">
 *     <X className="h-4 w-4" />
 *     Cancelar
 *   </Button>
 * </ActionBar>
 * ```
 */
export default function ActionBar({ children, className = '', fixed = true }: ActionBarProps) {
    if (!fixed) {
        // Versão sem position fixed (para usar com wrapper externo)
        return (
            <>
                {/* Variante Mobile */}
                <div className={`md:hidden z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 no-print ${className}`}>
                    <Separator className="mb-0" />
                    <div className="px-4 py-4">
                        <div className="max-w-lg mx-auto flex items-center justify-end gap-3">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Variante Desktop/Tablet */}
                <div className={`hidden md:block sticky bottom-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 no-print ${className}`}>
                    <Separator className="mb-0" />
                    <div className="px-6 py-4">
                        <div className="max-w-screen-xl mx-auto flex items-center justify-end gap-3">
                            {children}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Variante Mobile - fixa no rodapé */}
            <div className={`md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 no-print ${className}`}>
                <Separator className="mb-0" />
                <div className="px-4 py-4">
                    <div className="max-w-lg mx-auto flex items-center justify-end gap-3">
                        {children}
                    </div>
                </div>
            </div>

            {/* Variante Desktop/Tablet - sticky dentro do container */}
            <div className={`hidden md:block sticky bottom-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 no-print ${className}`}>
                <Separator className="mb-0" />
                <div className="px-6 py-4">
                    <div className="max-w-screen-xl mx-auto flex items-center justify-end gap-3">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
