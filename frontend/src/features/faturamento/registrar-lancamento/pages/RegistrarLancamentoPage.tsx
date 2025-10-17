import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HourEntryForm } from '../components/HourEntryForm';
import { therapistService } from '../../services/faturamento.service';
import type { CreateHourEntryInput } from '../../types/hourEntry.types';

export default function RegistrarLancamentoPage() {
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [formKey, setFormKey] = useState(0); // Para resetar o formulário

    // Handler para enviar direto para aprovação
    const handleSubmit = async (data: CreateHourEntryInput) => {
        setIsSubmitting(true);
        try {
            // Cria o lançamento e envia direto para aprovação
            const created = await therapistService.create(data);
            await therapistService.submit(created.id);

            toast.success('Lançamento enviado para aprovação.', {
                description: 'O gestor será notificado.',
            });
            setShowSuccessDialog(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao enviar lançamento';
            toast.error(message);
            console.error('Erro ao enviar lançamento:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler para "Lançar outro"
    const handleNewEntry = () => {
        setShowSuccessDialog(false);
        setFormKey((prev) => prev + 1); // Reset do formulário
    };

    // Handler para "Ir para Minhas Horas"
    const handleGoToMyHours = () => {
        navigate('/app/faturamento/minhas-horas');
    };

    return (
        <div className="flex flex-col min-h-full w-full p-1 md:p-4 lg:p-4 space-y-6">
            {/* Header */}
            <div className="space-y-1 mb-2">
                <h1
                    className="text-2xl font-semibold text-primary"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                >
                    Registrar Lançamento
                </h1>
                <p className="text-sm text-muted-foreground">
                    Informe os dados do atendimento. Valores não são exibidos neste módulo.
                </p>
            </div>

            {/* Card do formulário */}
            <Card className="p-4 md:p-6 rounded-[5px]">
                <HourEntryForm
                    key={formKey}
                    mode="create"
                    onCancel={() => navigate('/app/faturamento')}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />
            </Card>

            {/* Dialog de sucesso */}
            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-center">
                            Lançamento registrado!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            O que você gostaria de fazer agora?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                        <AlertDialogCancel asChild>
                            <Button variant="outline" onClick={handleNewEntry} className="flex-1">
                                <Clock className="mr-2 h-4 w-4" />
                                Lançar outro
                            </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button onClick={handleGoToMyHours} className="flex-1">
                                Ir para Minhas Horas
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
