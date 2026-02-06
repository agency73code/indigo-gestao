export type UploadedFile = Express.Multer.File & {
    size: number;
    nome?: string;
};