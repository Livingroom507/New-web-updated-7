import { Router } from 'express';
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../controllers/subscriptionController';

const router = Router();

// Route to get all subscriptions
router.get('/', getSubscriptions);

// Route to create a new subscription
router.post('/', createSubscription);

// Route to update an existing subscription
router.put('/:id', updateSubscription);

// Route to delete a subscription
router.delete('/:id', deleteSubscription);

export default router;