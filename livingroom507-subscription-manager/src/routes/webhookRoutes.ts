import { Router } from 'express';
import webhookController from '../controllers/webhookController';

const router = Router();

// Route to handle webhook events
router.post('/webhook', webhookController.handleWebhook);

export default router;