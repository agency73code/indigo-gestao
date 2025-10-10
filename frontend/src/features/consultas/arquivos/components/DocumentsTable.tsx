import { Eye, Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocuments } from '../hooks/useDocuments';

interface DocumentsTableProps {
    ownerType: 'cliente' | 'terapeuta';
    ownerId: string;
}

export default function DocumentsTable({ ownerType, ownerId }: DocumentsTableProps) {
    const { data, isLoading, error, onView, onDownload, pendingId } = useDocuments({
        ownerType,
        ownerId,
        enabled: Boolean(ownerId),
    });

    // Helper para formatação de bytes
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper para formatação de data
    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    // Helper para obter extensão do contentType
    const getFileExtension = (tipo_conteudo: string): string => {
        const typeMap: Record<string, string> = {
            'application/pdf': 'PDF',
            'image/jpeg': 'JPG',
            'image/jpg': 'JPG',
            'image/png': 'PNG',
            'image/gif': 'GIF',
            'application/msword': 'DOC',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
            'text/plain': 'TXT',
            'application/zip': 'ZIP',
            'application/x-rar-compressed': 'RAR',
        };
        return typeMap[tipo_conteudo] || tipo_conteudo.split('/').pop()?.toUpperCase() || 'ARQUIVO';
    };

    // Mapear tipo_documento para labels amigáveis
    const getDocumentTypeLabel = (tipo: string): string => {
        const labelMap: Record<string, string> = {
            fotoPerfil: 'Foto de Perfil',
            diplomaGraduacao: 'Diploma de Graduação',
            diplomaPosGraduacao: 'Diploma de Pós-graduação',
            registroCRP: 'Registro CRP',
            comprovanteEndereco: 'Comprovante de Endereço',
            documentoIdentidade: 'Documento de Identidade',
            comprovanteCpf: 'Comprovante de CPF',
            comprovanteResidencia: 'Comprovante de Residência',
            carterinhaPlano: 'Carteirinha do Plano',
            relatoriosMedicos: 'Relatórios Médicos',
            prescricaoMedica: 'Prescrição Médica',
            RG: 'RG',
            CPF: 'CPF',
            Comprovante: 'Comprovante',
            Diploma: 'Diploma',
            CRP: 'CRP',
        };
        return labelMap[tipo] || tipo;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo do documento</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Formato</TableHead>
                                <TableHead>Enviado em</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-12" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-4 w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-20" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="md:hidden space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <Skeleton className="h-4 w-32 mb-2" />
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-600 mb-2">{error}</div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Tentar novamente
                </Button>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum documento enviado.</p>
            </div>
        );
    }

    // Versão desktop - Tabela
    const DesktopTable = () => (
        <div className="hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tipo do documento</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Formato</TableHead>
                        <TableHead>Enviado em</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((file) => (
                        <TableRow key={file.id} data-testid={`doc-row-${file.id}`}>
                            <TableCell>{getDocumentTypeLabel(file.tipo_documento)}</TableCell>
                            <TableCell className="max-w-48 truncate" title={file.nome}>
                                {file.nome}
                            </TableCell>
                            <TableCell>{formatBytes(file.tamanho)}</TableCell>
                            <TableCell>{getFileExtension(file.tipo_conteudo)}</TableCell>
                            <TableCell>{formatDate(file.data_envio)}</TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onView(file)}
                                        disabled={pendingId === file.id}
                                        data-testid={`doc-view-${file.id}`}
                                        aria-label={`Visualizar ${file.nome}`}
                                    >
                                        <Eye className="w-4 h-4" />
                                        Visualizar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => onDownload(file)}
                                        disabled={pendingId === file.id}
                                        data-testid={`doc-dl-${file.id}`}
                                        aria-label={`Baixar ${file.nome}`}
                                    >
                                        <Download className="w-4 h-4" />
                                        Baixar
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    // Versão mobile - Cards
    const MobileCards = () => (
        <div className="md:hidden space-y-4">
            {data.map((file) => (
                <Card key={file.id} data-testid={`doc-row-${file.id}`}>
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-medium text-sm">
                                    {getDocumentTypeLabel(file.tipo_documento)}
                                </h4>
                                <p className="text-sm text-gray-600 truncate" title={file.nome}>
                                    {file.nome}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                <div>
                                    <span className="block font-medium">Tamanho:</span>
                                    {formatBytes(file.tamanho)}
                                </div>
                                <div>
                                    <span className="block font-medium">Formato:</span>
                                    {getFileExtension(file.tipo_conteudo)}
                                </div>
                                <div className="col-span-2">
                                    <span className="block font-medium">Enviado em:</span>
                                    {formatDate(file.data_envio)}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onView(file)}
                                    disabled={pendingId === file.id}
                                    data-testid={`doc-view-${file.id}`}
                                    aria-label={`Visualizar ${file.nome}`}
                                    className="flex-1"
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Visualizar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onDownload(file)}
                                    disabled={pendingId === file.id}
                                    data-testid={`doc-dl-${file.id}`}
                                    aria-label={`Baixar ${file.nome}`}
                                    className="flex-1"
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    Baixar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div>
            <DesktopTable />
            <MobileCards />
        </div>
    );
}
