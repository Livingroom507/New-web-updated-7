import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app'; // Adjust the path as necessary

describe('Webhook Routes', () => {
    it('should respond with a 200 status for valid webhook events', async () => {
        const response = await request(app)
            .post('/webhook') // Adjust the endpoint as necessary
            .send({ event: 'subscription.updated', data: { /* mock data */ } });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Webhook received' });
    });

    it('should respond with a 400 status for invalid webhook events', async () => {
        const response = await request(app)
            .post('/webhook')
            .send({ event: 'invalid.event', data: {} });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid event type' });
    });
});