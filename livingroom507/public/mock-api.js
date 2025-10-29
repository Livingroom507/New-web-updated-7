// This file acts as a mock API for frontend development.
// It provides sample data that would normally come from a backend server.

const MOCK_API = {
  // Mock data for the /api/plans endpoint
  plans: [
    {
      name: "Basic Access",
      description: "Customer plan for basic access.",
      monthly_cost: 9.99,
      yearly_capital: 119.88,
      benefits: ["Basic Content", "Community Forum"],
    },
    {
      name: "Premium Content",
      description: "Customer plan for premium content.",
      monthly_cost: 19.99,
      yearly_capital: 239.88,
      benefits: ["All Basic Benefits", "Exclusive Articles & Videos"],
    },
    {
      name: "All-Access Pass",
      description: "Customer plan for complete access.",
      monthly_cost: 29.99,
      yearly_capital: 359.88,
      benefits: ["All Premium Benefits", "Webinars & Q&A Sessions"],
    },
    {
      name: "Starter Affiliate",
      description: "Affiliate plan for getting started.",
      monthly_cost: 29.99,
      yearly_capital: 359.88,
      benefits: ["5% Commission", "Basic Training"],
    },
    {
      name: "Pro Affiliate",
      description: "Affiliate plan for scaling earnings.",
      monthly_cost: 79.99,
      yearly_capital: 959.88,
      benefits: ["10% Commission", "Advanced Training", "Priority Support"],
    },
    {
      name: "Enterprise Partner",
      description: "Top-tier plan for business builders.",
      monthly_cost: 149.99,
      yearly_capital: 1799.88,
      benefits: ["15% Commission", "Personalized Coaching"],
    },
    { name: "Manager Seat", description: "Internal admin plan.", monthly_cost: 0.00, yearly_capital: 0.00, benefits: ["Admin Access"] },
    { name: "Developer Seat", description: "Internal admin plan.", monthly_cost: 0.00, yearly_capital: 0.00, benefits: ["Admin Access", "API Access"] },
    { name: "Analyst Seat", description: "Internal admin plan.", monthly_cost: 0.00, yearly_capital: 0.00, benefits: ["Admin Access", "Reporting Suite"] },
  ],

  // Mock data for the /api/network-goal endpoint
  networkGoal: {
    current_paid_subscriptions: 157,
    target_paid_subscriptions: 500,
    },

  // You can add more mock data for other endpoints here
  // e.g., affiliate/overview, affiliate/plan, etc.
};