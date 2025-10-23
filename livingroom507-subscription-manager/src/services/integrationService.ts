// integrationService.ts

import { Subscription } from '../models/subscription';
import { getSubscriptionData, calculateRewards } from '../integrations/subscription-provider/client';

export class IntegrationService {
    async fetchSubscriptionData(userId: string): Promise<Subscription | null> {
        try {
            const subscriptionData = await getSubscriptionData(userId);
            return subscriptionData;
        } catch (error) {
            console.error('Error fetching subscription data:', error);
            return null;
        }
    }

    async calculateTotalRewards(userId: string): Promise<number> {
        try {
            const rewards = await calculateRewards(userId);
            return rewards;
        } catch (error) {
            console.error('Error calculating rewards:', error);
            return 0;
        }
    }
}