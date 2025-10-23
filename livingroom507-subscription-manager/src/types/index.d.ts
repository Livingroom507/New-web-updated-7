// This file defines TypeScript types for the Livingroom507 Subscription Manager project.

declare module 'livingroom507-subscription-manager' {
    export interface Subscription {
        id: string;
        userId: string;
        status: 'active' | 'inactive' | 'canceled';
        startDate: Date;
        endDate: Date;
        plan: string;
        rewards: number;
    }

    export interface User {
        id: string;
        name: string;
        email: string;
        subscriptions: Subscription[];
    }

    export interface Affiliate {
        id: string;
        userId: string;
        earnings: number;
        referrals: number;
    }

    export interface CompoundedRewards {
        totalRewards: number;
        activeSubscribers: number;
    }
}