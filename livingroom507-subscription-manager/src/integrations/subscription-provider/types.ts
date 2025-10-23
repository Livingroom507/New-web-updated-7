export interface Subscription {
    id: string;
    userId: string;
    status: 'active' | 'inactive' | 'canceled';
    startDate: Date;
    endDate: Date;
    plan: string;
    rewards: number;
}

export interface UserSubscriptionData {
    userId: string;
    subscriptions: Subscription[];
    totalRewards: number;
    affiliateEarnings: number;
}

export interface SubscriptionProvider {
    getSubscriptions(userId: string): Promise<Subscription[]>;
    getUserSubscriptionData(userId: string): Promise<UserSubscriptionData>;
    calculateCompoundedRewards(subscriptions: Subscription[]): number;
}