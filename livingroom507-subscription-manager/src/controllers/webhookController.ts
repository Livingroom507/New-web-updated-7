import { Request, Response } from 'express';

export const handleWebhook = async (req: Request, res: Response) => {
    try {
        const event = req.body;

        // Process the webhook event here
        // For example, handle subscription updates, cancellations, etc.

        res.status(200).send({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};