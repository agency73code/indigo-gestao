import { z } from 'zod';

export const uuidParam = z
    .uuid({ message: 'ID inválido' });