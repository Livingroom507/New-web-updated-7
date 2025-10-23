import { SubscriptionService } from '../src/services/subscriptionService';

describe('Subscription Service', () => {
    let subscriptionService: SubscriptionService;

    beforeEach(() => {
        subscriptionService = new SubscriptionService();
    });

    it('should fetch subscription data for a user', async () => {
        const userId = 'test-user-id';
        const subscriptionData = await subscriptionService.getSubscriptionData(userId);
        
        expect(subscriptionData).toBeDefined();
        expect(subscriptionData.userId).toBe(userId);
        expect(subscriptionData).toHaveProperty('status');
        expect(subscriptionData).toHaveProperty('rewards');
        expect(subscriptionData).toHaveProperty('affiliateEarnings');
    });

    it('should calculate total compounded rewards', async () => {
        const userId = 'test-user-id';
        const totalRewards = await subscriptionService.calculateTotalCompoundedRewards(userId);
        
        expect(totalRewards).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors when fetching subscription data', async () => {
        const userId = 'invalid-user-id';
        await expect(subscriptionService.getSubscriptionData(userId)).rejects.toThrow('User not found');
    });
});