import { z } from 'zod';
import { ORDER_BY, STATUS, VIEW_BY } from './supervisionLink.types.js';

export const LinkFiltersSchema = z.object({
    viewBy: z
        .enum([
            VIEW_BY.PATIENT,
            VIEW_BY.THERAPIST,
            VIEW_BY.SUPERVISION,
        ])
        .optional(),

    status: z
        .enum([
            STATUS.ALL,
            STATUS.ACTIVE,
            STATUS.ENDED,
            STATUS.ARCHIVED,
        ])
        .optional(),
    
    orderBy: z
        .enum([
            ORDER_BY.RECENT,
            ORDER_BY.OLDEST
        ])
        .optional(),
    
    q: z.string().optional(),
});

// Tipo inferido automaticamente do schema
export type LinkFilters = z.infer<typeof LinkFiltersSchema>;