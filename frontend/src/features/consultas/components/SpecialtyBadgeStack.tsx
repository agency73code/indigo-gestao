import { useState } from 'react';
import { getSpecialtyColors } from '@/utils/specialtyColors';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

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
    const [open, setOpen] = useState(false);

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

    // Múltiplas especialidades - mostra empilhado com popover
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div 
                    className="relative inline-flex items-center cursor-pointer"
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
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
                            className="text-[12px] font-medium inline-flex items-center justify-center h-6 min-w-6 px-2 z-0 ring-2 ring-white dark:ring-gray-900" 
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
                </div>
            </PopoverTrigger>
            <PopoverContent 
                className="w-auto p-3 z-50"
                align="start"
                side="bottom"
                sideOffset={8}
                avoidCollisions={true}
                collisionPadding={16}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
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
            </PopoverContent>
        </Popover>
    );
}

export default SpecialtyBadgeStack;
