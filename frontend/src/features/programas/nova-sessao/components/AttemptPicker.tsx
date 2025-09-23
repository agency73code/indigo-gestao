import { useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SessionAttemptType } from '../types';

interface AttemptPickerProps {
    isOpen: boolean;
    stimulusLabel: string;
    onClose: () => void;
    onSelect: (type: SessionAttemptType) => void;
}

export default function AttemptPicker({
    isOpen,
    stimulusLabel,
    onClose,
    onSelect,
}: AttemptPickerProps) {
    const [selectedType, setSelectedType] = useState<SessionAttemptType | null>(null);

    const handleSelect = (type: SessionAttemptType) => {
        setSelectedType(type);
        // Pequeno delay para feedback visual
        setTimeout(() => {
            onSelect(type);
            setSelectedType(null);
        }, 150);
    };

    const attemptTypes = [
        {
            type: 'error' as SessionAttemptType,
            label: 'ERRO',
            icon: '✗',
            color: 'text-red-600',
        },
        {
            type: 'prompted' as SessionAttemptType,
            label: 'AJUDA',
            icon: '✋',
            color: 'text-yellow-600',
        },
        {
            type: 'independent' as SessionAttemptType,
            label: 'INDEP.',
            icon: '✓',
            color: 'text-green-600',
        },
    ];

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-background w-full max-w-md rounded-t-lg md:rounded-lg shadow-lg animate-in slide-in-from-bottom md:fade-in duration-300">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Registrar Tentativa</h2>
                        <p className="text-sm text-muted-foreground mt-1">{stimulusLabel}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                        {attemptTypes.map((attempt) => (
                            <Card
                                key={attempt.type}
                                className={`cursor-pointer transition-all duration-150 rounded-[5px] border ${selectedType === attempt.type ? 'scale-95' : 'hover:shadow-md'}`}
                                onClick={() => handleSelect(attempt.type)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`text-2xl ${attempt.color}`}>
                                            {attempt.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{attempt.label}</p>
                                            <p className="text-sm opacity-80">
                                                {attempt.type === 'error' &&
                                                    'Resposta incorreta ou sem resposta'}
                                                {attempt.type === 'prompted' &&
                                                    'Resposta com ajuda ou dica'}
                                                {attempt.type === 'independent' &&
                                                    'Resposta independente e correta'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
