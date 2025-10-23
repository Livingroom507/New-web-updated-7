// subscriptionController.ts

import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscriptionService';

class SubscriptionController {
    private subscriptionService: SubscriptionService;

    constructor() {
        this.subscriptionService = new SubscriptionService();
    }

    public async getSubscriptions(req: Request, res: Response): Promise<void> {
        try {
            const subscriptions = await this.subscriptionService.getAllSubscriptions();
            res.status(200).json(subscriptions);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching subscriptions', error });
        }
    }

    public async getSubscriptionById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const subscription = await this.subscriptionService.getSubscriptionById(id);
            if (subscription) {
                res.status(200).json(subscription);
            } else {
                res.status(404).json({ message: 'Subscription not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error fetching subscription', error });
        }
    }

    public async createSubscription(req: Request, res: Response): Promise<void> {
        try {
            const newSubscription = await this.subscriptionService.createSubscription(req.body);
            res.status(201).json(newSubscription);
        } catch (error) {
            res.status(500).json({ message: 'Error creating subscription', error });
        }
    }

    public async updateSubscription(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const updatedSubscription = await this.subscriptionService.updateSubscription(id, req.body);
            if (updatedSubscription) {
                res.status(200).json(updatedSubscription);
            } else {
                res.status(404).json({ message: 'Subscription not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating subscription', error });
        }
    }

    public async deleteSubscription(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const result = await this.subscriptionService.deleteSubscription(id);
            if (result) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Subscription not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting subscription', error });
        }
    }
}

export default new SubscriptionController();