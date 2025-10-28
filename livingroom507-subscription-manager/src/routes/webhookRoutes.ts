import { Router } from 'express'; // Import Router from 'express'
import { handleWebhook } from '../controllers/webhookController';

const router = Router();

// Route to handle webhook events
router.post('/webhook', handleWebhook);

export default router;