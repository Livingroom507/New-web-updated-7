// client.ts

import axios from 'axios';

const API_BASE_URL = 'https://api.livingroom507.com/subscriptions';

export class SubscriptionClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async getSubscriptionData(userId: string) {
        try {
            const response = await axios.get(`${API_BASE_URL}/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching subscription data: ${error.message}`);
        }
    }

    async updateSubscription(userId: string, subscriptionData: any) {
        try {
            const response = await axios.put(`${API_BASE_URL}/${userId}`, subscriptionData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error updating subscription: ${error.message}`);
        }
    }

    async cancelSubscription(userId: string) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error canceling subscription: ${error.message}`);
        }
    }
}