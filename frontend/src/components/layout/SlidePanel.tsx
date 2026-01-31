/**
 * ============================================================================
 * COMPONENTE: SlidePanel
 * ============================================================================
 * 
 * Painel deslizante lateral reutilizável para formulários e visualização de dados.
 * Segue o padrão visual do sistema com fundo cinza no conteúdo.
 * 
 * CARACTERÍSTICAS:
 * - Abre da direita para a esquerda
 * - Header com botão de voltar, título, subtítulo e ações
 * - Área de conteúdo com fundo cinza e scroll
 * - Footer opcional com ações
 * - Overlay com fechamento ao clicar
 * - Animação suave de entrada/saída
 * 
 * ============================================================================
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/layout/BackButton';

// ============================================
// TIPOS
// ============================================

export interface SlidePanelProps {
    /** Se o painel está aberto */
    isOpen: boolean;
    
    /** Callback ao fechar */
    onClose: () => void;
    
    /** Título do painel */
    title: string;
    
    /** Subtítulo opcional */
    subtitle?: string;
    
    /** Ações no header (botões) */
    headerActions?: ReactNode;
    
    /** Conteúdo principal */
    children: ReactNode;
    
    /** Footer opcional */
    footer?: ReactNode;
    
    /** Largura do painel */
    width?: 'sm' | 'md' | 'lg' | 'xl';
    
    /** Se permite fechar ao clicar no overlay */
    closeOnOverlayClick?: boolean;
    
    /** Classes adicionais para o container */
    className?: string;
}

// ============================================
// MAPEAMENTO DE LARGURA
// ============================================

const widthClasses = {
    sm: 'w-full md:w-[400px] lg:w-[450px]',
    md: 'w-full md:w-[500px] lg:w-[550px]',
    lg: 'w-full md:w-[600px] lg:w-[700px]',
    xl: 'w-full md:w-[700px] lg:w-[800px]',
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function SlidePanel({
    isOpen,
    onClose,
    title,
    subtitle,
    headerActions,
    children,
    footer,
    width = 'lg',
    closeOnOverlayClick = true,
    className,
}: SlidePanelProps) {
    // Se não está aberto, não renderizar nada
    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={handleOverlayClick}
            />

            {/* Panel */}
            <div
                className={cn(
                    "fixed right-0 top-0 bottom-0 bg-background z-50",
                    "shadow-2xl transform transition-transform duration-300 ease-in-out",
                    "flex flex-col rounded-l-2xl",
                    widthClasses[width],
                    isOpen ? "translate-x-0" : "translate-x-full",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4">
                    <BackButton onClick={onClose} />
                    
                    <div className="flex-1 min-w-0">
                        <h2 
                            className="font-semibold text-foreground truncate" 
                            style={{
                                fontSize: 'var(--page-title-font-size)',
                                fontWeight: 'var(--page-title-font-weight)',
                                fontFamily: 'var(--page-title-font-family)'
                            }}
                        >
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Ações do Header */}
                    {headerActions && (
                        <div className="flex items-center gap-2 shrink-0">
                            {headerActions}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 bg-header-bg rounded-2xl overflow-hidden flex flex-col shadow-sm m-2 mt-0">
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="p-4">
                            {children}
                        </div>
                    </div>
                    
                    {/* Footer (dentro do bloco cinza) */}
                    {footer && (
                        <div className="border-t bg-background/50 px-4 py-3">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default SlidePanel;
