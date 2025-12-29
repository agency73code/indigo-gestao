/**
 * Serviço de exportação de Anamnese para Word (.doc)
 * Usa HTML compatível com Word para gerar o documento com formatação completa
 */

import { toast } from 'sonner';

export interface WordExportOptions {
    filename: string;
}

/**
 * Converte classes CSS para estilos inline para compatibilidade com Word
 */
function processHtmlForWord(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Mapa de classes para estilos inline
    const classStyles: Record<string, string> = {
        // Cores de texto
        'text-gray-900': 'color: #111827;',
        'text-gray-800': 'color: #1f2937;',
        'text-gray-700': 'color: #374151;',
        'text-gray-600': 'color: #4b5563;',
        'text-gray-500': 'color: #6b7280;',
        'text-gray-400': 'color: #9ca3af;',
        
        // Tamanhos de fonte
        'text-xs': 'font-size: 10pt;',
        'text-sm': 'font-size: 11pt;',
        'text-base': 'font-size: 12pt;',
        'text-lg': 'font-size: 14pt;',
        'text-xl': 'font-size: 16pt;',
        'text-2xl': 'font-size: 18pt;',
        
        // Peso da fonte
        'font-normal': 'font-weight: 400;',
        'font-medium': 'font-weight: 500;',
        'font-semibold': 'font-weight: 600;',
        'font-bold': 'font-weight: 700;',
        
        // Margens
        'mb-1': 'margin-bottom: 4pt;',
        'mb-2': 'margin-bottom: 8pt;',
        'mb-3': 'margin-bottom: 12pt;',
        'mb-4': 'margin-bottom: 16pt;',
        'mb-6': 'margin-bottom: 24pt;',
        'mt-1': 'margin-top: 4pt;',
        'mt-2': 'margin-top: 8pt;',
        'mt-3': 'margin-top: 12pt;',
        'mt-4': 'margin-top: 16pt;',
        'py-1': 'padding-top: 4pt; padding-bottom: 4pt;',
        'py-2': 'padding-top: 8pt; padding-bottom: 8pt;',
        'p-3': 'padding: 12pt;',
        'p-4': 'padding: 16pt;',
        'pl-2': 'padding-left: 8pt;',
        
        // Backgrounds
        'bg-white': 'background-color: #ffffff;',
        'bg-gray-50': 'background-color: #f9fafb;',
        'bg-gray-100': 'background-color: #f3f4f6;',
        
        // Bordas
        'border': 'border: 1px solid #e5e7eb;',
        'border-l-2': 'border-left: 2px solid #e5e7eb;',
        'border-gray-200': 'border-color: #e5e7eb;',
        'rounded': 'border-radius: 4pt;',
        
        // Layout
        'flex': 'display: flex;',
        'flex-1': 'flex: 1;',
        'block': 'display: block;',
        'grid': 'display: table; width: 100%;',
        'grid-cols-2': '',
        'gap-2': 'margin: 4pt;',
        'gap-x-8': '',
        'gap-y-1': '',
        'space-y-2': '',
        'space-y-3': '',
        
        // Outros
        'whitespace-pre-wrap': 'white-space: pre-wrap;',
        'col-span-2': '',
        'min-w-\\[200px\\]': 'min-width: 150pt;',
    };
    
    // Processar todos os elementos
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el) => {
        const element = el as HTMLElement;
        const classes = element.className?.split?.(' ') || [];
        let inlineStyles = element.getAttribute('style') || '';
        
        classes.forEach(cls => {
            const cleanClass = cls.trim();
            if (classStyles[cleanClass]) {
                inlineStyles += ' ' + classStyles[cleanClass];
            }
        });
        
        if (inlineStyles) {
            element.setAttribute('style', inlineStyles);
        }
        
        // Converter grid para table para melhor compatibilidade com Word
        if (element.classList.contains('grid')) {
            element.style.display = 'table';
            element.style.width = '100%';
            element.style.borderCollapse = 'collapse';
        }
    });
    
    // Processar imagens - converter SVG para texto se necessário
    const images = clone.querySelectorAll('img');
    images.forEach((img) => {
        const src = img.getAttribute('src');
        if (src?.includes('data:image/svg') || src?.endsWith('.svg')) {
            // Substituir logo SVG por texto estilizado
            const logoText = document.createElement('span');
            logoText.style.cssText = 'font-size: 24pt; font-weight: bold; color: #2c3e50; font-family: Arial, sans-serif;';
            logoText.textContent = 'ÍNDIGO';
            img.parentNode?.replaceChild(logoText, img);
        }
    });
    
    return clone.innerHTML;
}

/**
 * Exporta um elemento HTML para Word (.doc)
 * Usa a técnica de salvar HTML como .doc que o Word consegue abrir
 */
export async function exportToWord(
    element: HTMLElement,
    options: WordExportOptions
): Promise<void> {
    const { filename } = options;

    try {
        toast.loading('Gerando documento Word...', { id: 'word-export' });

        // Processar HTML para Word
        const processedHtml = processHtmlForWord(element);
        
        // Criar documento HTML completo compatível com Word
        const htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>100</w:Zoom>
                        <w:DoNotOptimizeForBrowser/>
                    </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    /* Reset e base */
                    @page {
                        size: A4;
                        margin: 2cm;
                    }
                    
                    body { 
                        font-family: Arial, Helvetica, sans-serif; 
                        font-size: 11pt; 
                        color: #333333;
                        line-height: 1.4;
                        margin: 0;
                        padding: 20pt;
                    }
                    
                    /* Títulos de seção */
                    h2 {
                        font-size: 14pt;
                        font-weight: 600;
                        color: #2c3e50;
                        border-bottom: 2pt solid #2c3e50;
                        padding-bottom: 6pt;
                        margin-top: 20pt;
                        margin-bottom: 12pt;
                        page-break-after: avoid;
                    }
                    
                    h3 {
                        font-size: 12pt;
                        font-weight: 500;
                        color: #374151;
                        margin-top: 14pt;
                        margin-bottom: 8pt;
                    }
                    
                    /* Campos */
                    .field-row {
                        display: table;
                        width: 100%;
                        margin-bottom: 4pt;
                    }
                    
                    .field-label {
                        display: table-cell;
                        width: 180pt;
                        font-size: 11pt;
                        color: #4b5563;
                        padding: 3pt 0;
                        vertical-align: top;
                    }
                    
                    .field-value {
                        display: table-cell;
                        font-size: 11pt;
                        color: #111827;
                        padding: 3pt 0;
                        vertical-align: top;x   
                    }
                    
                    /* Blocos de texto */
                    .text-block {
                        background-color: #f9fafb;
                        border: 1pt solid #e5e7eb;
                        padding: 10pt;
                        margin: 6pt 0;
                        font-size: 11pt;
                        color: #111827;
                        white-space: pre-wrap;
                    }
                    
                    /* Listas */
                    .list-item {
                        background-color: #f9fafb;
                        border: 1pt solid #e5e7eb;
                        padding: 10pt;
                        margin: 6pt 0;
                    }
                    
                    .list-item table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    
                    .list-item td {
                        padding: 2pt 8pt 2pt 0;
                        font-size: 11pt;
                        vertical-align: top;
                    }
                    
                    /* Grid de 2 colunas */
                    .grid-2 {
                        display: table;
                        width: 100%;
                        table-layout: fixed;
                    }
                    
                    .grid-2 > div {
                        display: table-cell;
                        width: 50%;
                        padding-right: 16pt;
                        vertical-align: top;
                    }
                    
                    /* Subseções */
                    .subsection {
                        margin-left: 12pt;
                        padding-left: 10pt;
                        border-left: 2pt solid #e5e7eb;
                        margin-bottom: 12pt;
                    }
                    
                    /* Cabeçalho */
                    .header {
                        border-bottom: 1pt solid #2c3e50;
                        padding-bottom: 12pt;
                        margin-bottom: 16pt;
                    }
                    
                    .header-title {
                        font-size: 20pt;
                        font-weight: 400;
                        color: #2c3e50;
                        margin: 0;
                    }
                    
                    .header-subtitle {
                        font-size: 12pt;
                        color: #4b5563;
                        margin-top: 4pt;
                    }
                    
                    .header-info {
                        display: table;
                        width: 100%;
                        margin-top: 12pt;
                    }
                    
                    .header-info > div {
                        display: table-cell;
                        vertical-align: top;
                    }
                    
                    .header-info-label {
                        font-size: 9pt;
                        text-transform: uppercase;
                        color: #6b7280;
                        margin-bottom: 2pt;
                    }
                    
                    .header-info-value {
                        font-size: 11pt;
                        font-weight: 500;
                        color: #111827;
                    }
                    
                    /* Rodapé */
                    .footer {
                        margin-top: 30pt;
                        padding-top: 16pt;
                        border-top: 1pt solid #e5e7eb;
                        text-align: center;
                        font-size: 9pt;
                        color: #6b7280;
                    }
                    
                    /* Assinaturas */
                    .signatures {
                        display: table;
                        width: 100%;
                        margin-top: 40pt;
                        margin-bottom: 30pt;
                    }
                    
                    .signature-box {
                        display: table-cell;
                        width: 45%;
                        text-align: center;
                        padding: 0 16pt;
                    }
                    
                    .signature-line {
                        border-top: 1pt solid #111827;
                        margin-bottom: 4pt;
                    }
                    
                    .signature-name {
                        font-size: 11pt;
                        font-weight: 500;
                        color: #111827;
                    }
                    
                    .signature-role {
                        font-size: 10pt;
                        color: #6b7280;
                    }
                    
                    /* Utilitários */
                    strong {
                        font-weight: 600;
                    }
                    
                    .text-muted {
                        color: #6b7280;
                    }
                    
                    .text-small {
                        font-size: 10pt;
                    }
                    
                    .mb-2 { margin-bottom: 8pt; }
                    .mb-4 { margin-bottom: 16pt; }
                    .mt-2 { margin-top: 8pt; }
                    .mt-4 { margin-top: 16pt; }
                    
                    /* Evitar quebras */
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                    
                    /* Tabelas */
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    
                    td, th {
                        padding: 4pt 8pt;
                        vertical-align: top;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                ${processedHtml}
            </body>
            </html>
        `;

        // Criar Blob com o conteúdo HTML
        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        // Criar link de download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Documento Word exportado com sucesso!', { id: 'word-export' });
    } catch (error) {
        console.error('Erro ao exportar Word:', error);
        toast.error('Erro ao exportar documento Word. Tente novamente.', { id: 'word-export' });
        throw error;
    }
}
