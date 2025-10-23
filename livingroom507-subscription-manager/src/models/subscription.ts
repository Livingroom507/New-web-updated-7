// subscription.ts

export interface Subscription {
    id: string;
    userId: string;
    status: 'active' | 'inactive' | 'canceled';
    startDate: Date;
    endDate: Date;
    plan: string;
    rewards: number;
    affiliateEarnings: number;
}

export class SubscriptionModel {
    constructor(
        public id: string,
        public userId: string,
        public status: 'active' | 'inactive' | 'canceled',
        public startDate: Date,
        public endDate: Date,
        public plan: string,
        public rewards: number,
        public affiliateEarnings: number
    ) {}

    isActive(): boolean {
        return this.status === 'active';
    }

    calculateTotalRewards(): number {
        // Logic to calculate total rewards can be added here
        return this.rewards;
    }

    calculateAffiliateEarnings(): number {
        // Logic to calculate affiliate earnings can be added here
        return this.affiliateEarnings;
    }
}