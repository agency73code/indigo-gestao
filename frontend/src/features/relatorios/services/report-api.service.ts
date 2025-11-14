import type { SavedReport } from '../types';

export interface SaveReportPayload {
    // Arquivo PDF
    pdfBlob: Blob;
    pdfFileName: string;

    // Metadados básicos
    title: string;
    type: 'mensal' | 'trimestral' | 'semestral' | 'anual';
    patientId: string;
    therapistId: string;
    periodStart: string; // ISO Date (YYYY-MM-DD)
    periodEnd: string;   // ISO Date (YYYY-MM-DD)
    clinicalObservations: string;
    status: 'draft' | 'final';

    // Dados estruturados (JSON)
    structuredData: {
        filters: any;
        generatedData: any;
    };
}

/**
 * Serviço para comunicação com a API de relatórios
 */
export class ReportApiService {
    private static readonly BASE_URL = `${import.meta.env.VITE_API_BASE || ''}/api/relatorios`;

    /**
     * Salva um relatório no backend com PDF e metadados
     * 
     * @param payload - Dados do relatório a serem salvos
     * @returns Promise<SavedReport> - Relatório salvo com ID e URL
     */
    static async saveReport(payload: SaveReportPayload): Promise<SavedReport> {
        const formData = new FormData();

        // Anexa o PDF
        formData.append('pdf', payload.pdfBlob, payload.pdfFileName);

        // Anexa metadados
        formData.append('title', payload.title);
        formData.append('type', payload.type);
        formData.append('patientId', payload.patientId);
        formData.append('therapistId', payload.therapistId);
        formData.append('periodStart', payload.periodStart);
        formData.append('periodEnd', payload.periodEnd);
        formData.append('clinicalObservations', payload.clinicalObservations);
        formData.append('status', payload.status);

        // Anexa dados estruturados como JSON string
        formData.append('data', JSON.stringify(payload.structuredData));

        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
            }

            const savedReport: SavedReport = await response.json();
            return savedReport;
        } catch (error) {
            console.error('Erro ao salvar relatório:', error);
            
            if (error instanceof Error) {
                throw error;
            }
            
            throw new Error('Erro desconhecido ao salvar relatório');
        }
    }

    /**
     * Lista todos os relatórios salvos (com filtros opcionais)
     * 
     * @param filters - Filtros opcionais
     * @returns Promise<SavedReport[]> - Lista de relatórios
     */
    static async listReports(filters?: {
        patientId?: string;
        therapistId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<SavedReport[]> {
        const params = new URLSearchParams();
        
        if (filters?.patientId) params.append('patientId', filters.patientId);
        if (filters?.therapistId) params.append('therapistId', filters.therapistId);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const url = `${this.BASE_URL}?${params.toString()}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const reports: SavedReport[] = await response.json();
            return reports;
        } catch (error) {
            console.error('Erro ao listar relatórios:', error);
            throw error;
        }
    }

    /**
     * Busca um relatório específico por ID
     * 
     * @param reportId - ID do relatório
     * @returns Promise<SavedReport> - Relatório encontrado
     */
    static async getReport(reportId: string): Promise<SavedReport> {
        try {
            const response = await fetch(`${this.BASE_URL}/${reportId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const report: SavedReport = await response.json();
            return report;
        } catch (error) {
            console.error('Erro ao buscar relatório:', error);
            throw error;
        }
    }

    /**
     * Deleta um relatório
     * 
     * @param reportId - ID do relatório a ser deletado
     */
    static async deleteReport(reportId: string): Promise<void> {
        try {
            const response = await fetch(`${this.BASE_URL}/${reportId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error('Erro ao deletar relatório:', error);
            throw error;
        }
    }

    /**
     * Faz o download de um PDF já salvo
     * 
     * @param pdfUrl - URL do PDF no Google Drive ou storage
     * @param fileName - Nome do arquivo para download
     */
    static async downloadPdf(pdfUrl: string, fileName: string): Promise<void> {
        try {
            const response = await fetch(pdfUrl);
            const blob = await response.blob();
            
            // Cria um link temporário e dispara o download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpa o objeto URL
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            throw new Error('Erro ao baixar o PDF');
        }
    }
}
