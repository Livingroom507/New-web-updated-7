import { config } from 'dotenv';

config();

const subscriptionConfig = {
    apiUrl: process.env.SUBSCRIPTION_API_URL || 'http://localhost:3000/api/subscriptions',
    rewardsMultiplier: parseFloat(process.env.REWARDS_MULTIPLIER) || 1.0,
    affiliateEarningsUrl: process.env.AFFILIATE_EARNINGS_URL || 'http://localhost:3000/api/affiliate-earnings',
};

export default subscriptionConfig;