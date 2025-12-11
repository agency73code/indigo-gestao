import { useState, useRef } from 'react';
import { getSpecialtyColors } from '@/utils/specialtyColors';

interface SpecialtyBadgeStackProps {
    especialidades: string[];
    /** Especialidade principal (exibida primeiro se não estiver no array) */
    especialidadePrincipal?: string;
}

/**
 * Componente que exibe especialidades empilhadas com hover para mostrar todas.
 * 
 * - Se houver apenas 1 especialidade, mostra normalmente
 * - Se houver 2+, mostra a primeira + badge "+N" empilhados
 * - Ao passar o mouse, exibe tooltip com todas as especialidades
 */
export function SpecialtyBadgeStack({ 
    especialidades, 
    especialidadePrincipal 
}: SpecialtyBadgeStackProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Combinar especialidade principal com o array, removendo duplicatas
    const allSpecialties = especialidadePrincipal 
        ? [especialidadePrincipal, ...especialidades.filter(e => e !== especialidadePrincipal)]
        : especialidades;

    // Remover duplicatas e valores vazios
    const uniqueSpecialties = [...new Set(allSpecialties)].filter(Boolean);

    if (uniqueSpecialties.length === 0) {
        return (
            <span 
                className="text-sm" 
                style={{ color: 'var(--table-text)' }}
            >
                Não informado
            </span>
        );
    }

    const firstSpecialty = uniqueSpecialties[0];
    const remainingCount = uniqueSpecialties.length - 1;
    const firstColors = getSpecialtyColors(firstSpecialty);

    // Se só tem uma especialidade, mostra normalmente
    if (uniqueSpecialties.length === 1) {
        return (
            <span 
                className="text-[14px] font-normal inline-block px-3 py-1" 
                style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    backgroundColor: firstColors.bg, 
                    color: firstColors.text,
                    borderRadius: '24px'
                }}
            >
                {firstSpecialty}
            </span>
        );
    }

    // Múltiplas especialidades - mostra empilhado com hover
    return (
        <div 
            ref={containerRef}
            className="relative inline-flex items-center"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Container empilhado */}
            <div className="flex items-center -space-x-2">
                {/* Primeira especialidade (badge principal) */}
                <span 
                    className="text-[14px] font-normal inline-block px-3 py-1 z-10 ring-2 ring-white dark:ring-gray-900" 
                    style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        backgroundColor: firstColors.bg, 
                        color: firstColors.text,
                        borderRadius: '24px'
                    }}
                >
                    {firstSpecialty}
                </span>
                
                {/* Badge "+N" indicando mais especialidades */}
                <span 
                    className="text-[12px] font-medium inline-flex items-center justify-center h-6 min-w-6 px-2 z-0 ring-2 ring-white dark:ring-gray-900 cursor-pointer" 
                    style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        borderRadius: '24px'
                    }}
                >
                    +{remainingCount}
                </span>
            </div>

            {/* Tooltip com todas as especialidades */}
            {showTooltip && (
                <div 
                    className="absolute left-0 top-full mt-2 z-50 min-w-max"
                    style={{
                        animation: 'fadeIn 0.15s ease-out'
                    }}
                >
                    <div 
                        className="rounded-lg shadow-lg p-3 space-y-2 border"
                        style={{ 
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)'
                        }}
                    >
                        <p 
                            className="text-xs font-medium mb-2 pb-2 border-b"
                            style={{ 
                                color: 'var(--muted-foreground)',
                                borderColor: 'var(--border)'
                            }}
                        >
                            Especialidades ({uniqueSpecialties.length})
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {uniqueSpecialties.map((specialty, index) => {
                                const colors = getSpecialtyColors(specialty);
                                return (
                                    <span 
                                        key={`${specialty}-${index}`}
                                        className="text-[13px] font-normal inline-block px-3 py-1 w-fit" 
                                        style={{ 
                                            fontFamily: 'Inter, sans-serif', 
                                            backgroundColor: colors.bg, 
                                            color: colors.text,
                                            borderRadius: '24px'
                                        }}
                                    >
                                        {specialty}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

export default SpecialtyBadgeStack;
