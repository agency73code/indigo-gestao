export function asciiFallbackFilename(name: string): string {
    const noControls = name.replace(/[\r\n\t\0]/g, ' ').trim();
    const noQuotes = noControls.replace(/["\\]/g, '');
    const asciiOnly = noQuotes.replace(/[^\x20-\x7E]/g, '_');

    return asciiOnly.length > 0 ? asciiOnly : 'download';
}