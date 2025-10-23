// subscriptionService.ts

import { Subscription } from '../models/subscription';
import { getDatabaseConnection } from '../utils/database'; // Assuming a utility to get DB connection

export class SubscriptionService {
    private db;

    constructor() {
        this.db = getDatabaseConnection();
    }

    async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
        const subscription = await this.db('subscriptions').where({ userId }).first();
        return subscription || null;
    }

    async updateSubscription(userId: string, subscriptionData: Partial<Subscription>): Promise<boolean> {
        const result = await this.db('subscriptions').where({ userId }).update(subscriptionData);
        return result > 0;
    }

    async getAllSubscriptions(): Promise<Subscription[]> {
        return await this.db('subscriptions').select('*');
    }

    async deleteSubscription(userId: string): Promise<boolean> {
        const result = await this.db('subscriptions').where({ userId }).del();
        return result > 0;
    }
}