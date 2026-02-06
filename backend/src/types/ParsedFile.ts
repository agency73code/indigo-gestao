export type ParsedFile = {
    name: string;
    original_name: string;
    mime_type: string;
    size: number;
    buffer: Buffer;
}