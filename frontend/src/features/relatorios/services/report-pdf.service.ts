import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

export interface PdfGenerationOptions {
    fileName: string;
    margin?: number;
    quality?: number;
    scale?: number;
}

/**
 * Serviço para geração de PDFs a partir de elementos HTML
 */
export class ReportPdfService {
    /**
     * Gera um PDF a partir de um elemento HTML e retorna como Blob
     * 
     * @param element - Elemento HTML a ser convertido em PDF
     * @param options - Opções de geração do PDF
     * @returns Promise<Blob> - PDF gerado como Blob
     */
    static async generatePdfBlob(
        element: HTMLElement,
        options: PdfGenerationOptions
    ): Promise<Blob> {
        const { fileName, margin = 10, quality = 0.98, scale = 2 } = options;

        const pdfOptions = {
            margin,
            filename: fileName,
            image: { 
                type: 'jpeg' as const, 
                quality 
            },
            html2canvas: {
                scale,
                useCORS: true,
                logging: false,
                letterRendering: true,
                imageTimeout: 15000,
                removeContainer: true,
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait' as const,
                compress: true,
            },
        };

        try {
            const blob = await html2pdf()
                .set(pdfOptions)
                .from(element)
                .output('blob');

            return blob as Blob;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw new Error('Falha na geração do PDF. Tente novamente.');
        }
    }

    /**
     * Gera um PDF e faz o download direto no navegador
     * 
     * @param element - Elemento HTML a ser convertido em PDF
     * @param options - Opções de geração do PDF
     */
    static async downloadPdf(
        element: HTMLElement,
        options: PdfGenerationOptions
    ): Promise<void> {
        const { fileName, margin = 10, quality = 0.98, scale = 2 } = options;

        const pdfOptions = {
            margin,
            filename: fileName,
            image: { 
                type: 'jpeg' as const, 
                quality 
            },
            html2canvas: {
                scale,
                useCORS: true,
                logging: false,
                letterRendering: true,
                imageTimeout: 15000,
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait' as const,
            },
        };

        try {
            await html2pdf()
                .set(pdfOptions)
                .from(element)
                .save();
            
            toast.success('PDF baixado com sucesso!');
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            toast.error('Erro ao baixar o PDF');
            throw error;
        }
    }

    /**
     * Converte Blob para Base64 (alternativa mais leve para envio)
     * Útil se você preferir enviar como string ao invés de FormData
     * 
     * @param blob - Blob do PDF
     * @returns Promise<string> - String Base64
     */
    static async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove o prefixo "data:application/pdf;base64,"
                const base64Data = base64String.split(',')[1];
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Calcula o tamanho do PDF em MB
     * 
     * @param blob - Blob do PDF
     * @returns Tamanho em MB formatado
     */
    static getPdfSize(blob: Blob): string {
        const sizeInMB = blob.size / (1024 * 1024);
        return `${sizeInMB.toFixed(2)} MB`;
    }

    /**
     * Prepara o elemento para impressão (aplica estilos especiais)
     * 
     * @param element - Elemento a ser preparado
     */
    static prepareElementForPrint(element: HTMLElement): void {
        // Adiciona classe temporária para estilos de impressão
        element.classList.add('print-preparing');
        
        // Remove elementos que não devem aparecer no PDF
        const noPrintElements = element.querySelectorAll('.no-print');
        noPrintElements.forEach(el => {
            (el as HTMLElement).style.display = 'none';
        });

        // Mostra elementos que só aparecem no PDF
        const printOnlyElements = element.querySelectorAll('[data-print-only]');
        printOnlyElements.forEach(el => {
            (el as HTMLElement).style.display = 'block';
        });
    }

    /**
     * Restaura o elemento após impressão
     * 
     * @param element - Elemento a ser restaurado
     */
    static restoreElementAfterPrint(element: HTMLElement): void {
        element.classList.remove('print-preparing');
        
        // Restaura elementos no-print
        const noPrintElements = element.querySelectorAll('.no-print');
        noPrintElements.forEach(el => {
            (el as HTMLElement).style.display = '';
        });

        // Esconde elementos print-only
        const printOnlyElements = element.querySelectorAll('[data-print-only]');
        printOnlyElements.forEach(el => {
            (el as HTMLElement).style.display = 'none';
        });
    }
}
