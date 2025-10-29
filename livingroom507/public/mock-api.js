// This file acts as a mock API for frontend development.
// It provides sample data that would normally come from a backend server.

const MOCK_API = {
  // Mock data for the /api/plans endpoint
  plans: [
    {
      name: "Starter Affiliate",
      description: "Ideal for new affiliates getting started.",
      monthly_cost: 29.99,
      yearly_capital: 359.88,
      benefits: ["5% Commission", "Basic Training", "Community Access"],
    },
    {
      name: "Pro Affiliate",
      description: "For affiliates ready to scale their earnings.",
      monthly_cost: 79.99,
      yearly_capital: 959.88,
      benefits: ["10% Commission", "Advanced Training", "Priority Support", "Analytics Suite"],
    },
    {
      name: "Enterprise Partner",
      description: "Top-tier plan for serious business builders.",
      monthly_cost: 149.99,
      yearly_capital: 1799.88,
      benefits: ["15% Commission", "Personalized Coaching", "Dedicated Account Manager", "All Pro Benefits"],
    },
  ],

  // Mock data for the /api/network-goal endpoint
  networkGoal: {
    current_paid_subscriptions: 157,
    target_paid_subscriptions: 500,
  },

  // You can add more mock data for other endpoints here
  // e.g., affiliate/overview, affiliate/plan, etc.
};