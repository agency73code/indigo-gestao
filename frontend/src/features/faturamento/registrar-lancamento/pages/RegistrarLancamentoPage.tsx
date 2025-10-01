import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { searchTherapists } from '@/features/programas/cadastro-ocp/services';

// Componentes do faturamento
import PatientBlock from '../components/PatientBlock';
import TherapistBlock from '../components/TherapistBlock';
import BillingForm from '../components/BillingForm';
import TotalPreview from '../components/TotalPreview';
import SaveBar from '../components/SaveBar';

// Services e types
import { computeTotal, createBillingEntry, getTherapistRate } from '../../services';
import type { BillingEntry } from '../../types';
import type { Patient } from '@/features/programas/consultar-programas/types';
import type { Therapist } from '@/features/programas/cadastro-ocp/types';

// Modal para seleção de terapeuta (similar ao HeaderInfo)
interface SelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (therapist: Therapist) => void;
}

function TherapistSelectorModal({ isOpen, onClose, onSelect }: SelectorModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        if (!isOpen) return;

        const timeoutId = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await searchTherapists(searchQuery);
                setTherapists(results);
            } catch (error) {
                console.error('Erro ao buscar terapeutas:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-end justify-center md:items-center">
            <div className="bg-background w-full max-w-4xl h-[85vh] md:h-[70vh] rounded-t-lg md:rounded-lg shadow-lg animate-in slide-in-from-bottom md:fade-in duration-300 flex flex-col">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                    <h2 className="text-lg font-semibold">Selecionar Terapeuta</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 sm:p-6 flex-1 overflow-auto">
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Buscar por nome..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                                    <p className="text-muted-foreground">Buscando terapeutas...</p>
                                </div>
                            ) : therapists.length > 0 ? (
                                therapists.map((therapist) => (
                                    <div
                                        key={therapist.id}
                                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer rounded-[5px] border"
                                        onClick={() => {
                                            onSelect(therapist);
                                            onClose();
                                        }}
                                    >
                                        <div className="flex-shrink-0">
                                            {therapist.photoUrl ? (
                                                <img
                                                    src={therapist.photoUrl}
                                                    alt={`Foto de ${therapist.name}`}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                                                    {getInitials(therapist.name)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{therapist.name}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        {searchQuery.length >= 2
                                            ? 'Nenhum terapeuta encontrado'
                                            : 'Digite pelo menos 2 caracteres para buscar'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function RegistrarLancamentoPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados do formulário
    const [patient, setPatient] = useState<Patient | null>(null);
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [showTherapistSelector, setShowTherapistSelector] = useState(false);
    const [showSaveBar, setShowSaveBar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Estados dos campos do formulário
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [durationOption, setDurationOption] = useState('60');
    const [customDurationMinutes, setCustomDurationMinutes] = useState(0);
    const [hourlyRate, setHourlyRate] = useState(0);
    const [hasTravelCost, setHasTravelCost] = useState(false);
    const [travelCost, setTravelCost] = useState(0);
    const [notes, setNotes] = useState('');

    // Auto-selecionar terapeuta logado
    useEffect(() => {
        if (user) {
            setTherapist({
                id: user.id,
                name: user.name || 'Terapeuta',
                photoUrl: user.avatar_url || undefined,
            });
        }
    }, [user]);

    // Buscar valor hora do terapeuta quando ele for selecionado
    useEffect(() => {
        if (therapist?.id) {
            getTherapistRate(therapist.id).then((rate) => {
                if (rate && rate > 0) {
                    setHourlyRate(rate);
                }
            });
        }
    }, [therapist]);

    // Controle da SaveBar baseado no scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Mostrar SaveBar quando estiver próximo do final
            const threshold = docHeight - windowHeight - 100;
            setShowSaveBar(scrollY >= threshold || docHeight <= windowHeight * 1.2);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Verificar posição inicial

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calcular duração em minutos
    const getDurationMinutes = () => {
        if (durationOption === 'custom') {
            return customDurationMinutes;
        }
        return parseInt(durationOption) || 0;
    };

    // Calcular total em tempo real
    const total = computeTotal({
        durationMinutes: getDurationMinutes(),
        hourlyRate,
        travelCost,
    });

    // Validação do formulário
    const canSave = () => {
        return patient && therapist && date && getDurationMinutes() > 0 && hourlyRate > 0;
    };

    // Handlers
    const handlePatientSelect = (selectedPatient: Patient) => {
        setPatient(selectedPatient);
    };

    const handlePatientClear = () => {
        setPatient(null);
    };

    const handleTherapistSelect = (selectedTherapist: Therapist | null) => {
        setTherapist(selectedTherapist);
        setShowTherapistSelector(false);
    };

    const handleShowTherapistSelector = () => {
        setShowTherapistSelector(true);
    };

    const handleHasTravelCostChange = (hasCost: boolean) => {
        setHasTravelCost(hasCost);
        // Se desmarcou o checkbox, zerar o valor do deslocamento
        if (!hasCost) {
            setTravelCost(0);
        }
    };

    const handleSave = async () => {
        if (!canSave()) return;

        setIsSaving(true);
        try {
            const billingEntry: BillingEntry = {
                patientId: patient!.id,
                therapistId: therapist!.id,
                date,
                time: time || null,
                durationMinutes: getDurationMinutes(),
                hourlyRate,
                travelCost,
                notes: notes || null,
                total,
            };

            await createBillingEntry(billingEntry);

            toast.success('Lançamento salvo com sucesso!');
            navigate('/app/faturamento'); // Voltar para o hub
        } catch (error) {
            console.error('Erro ao salvar lançamento:', error);
            toast.error('Erro ao salvar lançamento. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/app/faturamento');
    };

    return (
        <div className="flex flex-col min-h-full w-full">
            {/* Header Section */}
            <div className="px-0 sm:px-4 py-4 sm:py-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            className="h-8 w-8 p-0 md:hidden"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h1
                            style={{ fontFamily: 'Sora, sans-serif' }}
                            className="text-xl sm:text-2xl font-semibold text-primary"
                        >
                            Registrar faturamento
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Lance horas e valores de um atendimento.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-0 sm:px-4 pb-20 sm:pb-24 w-full">
                <div className="space-y-4 sm:space-y-6 mx-auto w-full">
                    {/* Bloco Paciente */}
                    <PatientBlock
                        patient={patient}
                        onPatientSelect={handlePatientSelect}
                        onPatientClear={handlePatientClear}
                    />

                    {/* Bloco Terapeuta */}
                    <TherapistBlock
                        therapist={therapist}
                        onTherapistSelect={handleTherapistSelect}
                        onShowTherapistSelector={handleShowTherapistSelector}
                    />

                    {/* Formulário de dados do atendimento */}
                    <BillingForm
                        date={date}
                        time={time}
                        durationOption={durationOption}
                        customDurationMinutes={customDurationMinutes}
                        hourlyRate={hourlyRate}
                        hasTravelCost={hasTravelCost}
                        travelCost={travelCost}
                        notes={notes}
                        onDateChange={setDate}
                        onTimeChange={setTime}
                        onDurationOptionChange={setDurationOption}
                        onCustomDurationChange={setCustomDurationMinutes}
                        onHourlyRateChange={setHourlyRate}
                        onHasTravelCostChange={handleHasTravelCostChange}
                        onTravelCostChange={setTravelCost}
                        onNotesChange={setNotes}
                    />

                    {/* Preview do total */}
                    <TotalPreview
                        durationMinutes={getDurationMinutes()}
                        hourlyRate={hourlyRate}
                        travelCost={travelCost}
                        total={total}
                    />
                </div>
            </main>

            {/* SaveBar */}
            {showSaveBar && (
                <div
                    className="fixed bottom-0 left-0 right-0 transition-all duration-700 ease-out"
                    style={{
                        transform: showSaveBar ? 'translateY(0)' : 'translateY(100%)',
                        transition:
                            'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out',
                    }}
                >
                    <SaveBar
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={isSaving}
                        canSave={!!canSave()}
                    />
                </div>
            )}

            {/* Modal do Terapeuta */}
            <TherapistSelectorModal
                isOpen={showTherapistSelector}
                onClose={() => setShowTherapistSelector(false)}
                onSelect={handleTherapistSelect}
            />
        </div>
    );
}
