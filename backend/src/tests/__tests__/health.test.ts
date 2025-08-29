import { describe, expect, test } from 'vitest';
import request from 'supertest';
import app from '../../server.js';

describe('Health Check', () => {
    test('GET /health should return status ok', async () => {
        const response = await request(app).get('/health').expect(200);

        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('environment');
    });
});
