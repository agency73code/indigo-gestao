export class AIServiceError extends Error {
    constructor(
        public code: 'AI_EMPTY_RESPONSE' | 'AI_CONFIG_ERROR' | 'AI_PROVIDER_ERROR',
        message?: string
    ) {
        super(message || code);
        this.name = 'AIServiceError';
    }
}