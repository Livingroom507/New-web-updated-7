// This file acts as a mock API for frontend development.
// It provides sample data that would normally come from a backend server.

const MOCK_API = {
  // Mock data for the /api/plans endpoint
  plans: [
    {
      role: "customer",
      plan_name: "Basic Access",
      description: "Customer plan for basic access.",
      monthly_cost: 9.99,
      network_total: 5000,
      avg_cost_cycle: 100,
      break_even_flow: 50,
      network_earnings: 4500,
      yearly_capital: 119.88,
      benefits: ["Basic Content", "Community Forum"],
    },
    {
      role: "customer",
      plan_name: "Premium Content",
      description: "Customer plan for premium content.",
      monthly_cost: 19.99,
      network_total: 5000,
      avg_cost_cycle: 100,
      break_even_flow: 50,
      network_earnings: 4500,
      yearly_capital: 239.88,
      benefits: ["All Basic Benefits", "Exclusive Articles & Videos"],
    },
    {
      role: "customer",
      plan_name: "All-Access Pass",
      description: "Customer plan for complete access.",
      monthly_cost: 29.99,
      network_total: 5000,
      avg_cost_cycle: 100,
      break_even_flow: 50,
      network_earnings: 4500,
      yearly_capital: 359.88,
      benefits: ["All Premium Benefits", "Webinars & Q&A Sessions"],
    },
    {
      role: "affiliate",
      plan_name: "Starter Affiliate",
      description: "Affiliate plan for getting started.",
      monthly_cost: 29.99,
      network_total: 15000,
      avg_cost_cycle: 300,
      break_even_flow: 150,
      network_earnings: 13500,
      yearly_capital: 359.88,
      benefits: ["5% Commission", "Basic Training"],
    },
    {
      role: "affiliate",
      plan_name: "Pro Affiliate",
      description: "Affiliate plan for scaling earnings.",
      monthly_cost: 79.99,
      network_total: 15000,
      avg_cost_cycle: 300,
      break_even_flow: 150,
      network_earnings: 13500,
      yearly_capital: 959.88,
      benefits: ["10% Commission", "Advanced Training", "Priority Support"],
    },
    {
      role: "affiliate",
      plan_name: "Enterprise Partner",
      description: "Top-tier plan for business builders.",
      monthly_cost: 149.99,
      network_total: 15000,
      avg_cost_cycle: 300,
      break_even_flow: 150,
      network_earnings: 13500,
      yearly_capital: 1799.88,
      benefits: ["15% Commission", "Personalized Coaching"],
    },
    {
      role: "admin",
      plan_name: "Manager Seat",
      description: "Internal admin plan.",
      monthly_cost: 0.0,
      network_total: 0,
      avg_cost_cycle: 0,
      break_even_flow: 0,
      network_earnings: 0,
      yearly_capital: 0.0,
      benefits: ["Admin Access"],
    },
    {
      role: "admin",
      plan_name: "Developer Seat",
      description: "Internal admin plan.",
      monthly_cost: 0.0,
      network_total: 0,
      avg_cost_cycle: 0,
      break_even_flow: 0,
      network_earnings: 0,
      yearly_capital: 0.0,
      benefits: ["Admin Access", "API Access"],
    },
    {
      role: "admin",
      plan_name: "Analyst Seat",
      description: "Internal admin plan.",
      monthly_cost: 0.0,
      network_total: 0,
      avg_cost_cycle: 0,
      break_even_flow: 0,
      network_earnings: 0,
      yearly_capital: 0.0,
      benefits: ["Admin Access", "Reporting Suite"],
    },
  ],

  // Mock data for the /api/network-goal endpoint
  networkGoal: {
    current_paid_subscriptions: 157,
    target_paid_subscriptions: 500,
    },

  // You can add more mock data for other endpoints here
  // e.g., affiliate/overview, affiliate/plan, etc.

  // Mock data for /api/affiliate/overview
  overview: {
    totalReferrals: 27,
    currentPlan: "Pro Affiliate",
    monthlyEarnings: 457.50,
    compoundedRewards: 123.45,
  },

  // Mock data for /api/affiliate/plan
  userPlan: {
    role: "affiliate",
    plan_name: "Pro Affiliate",
    monthly_cost: 79.99,
    yearly_capital: 959.88,
  },

  // Mock data for /api/affiliate/referrals
  referrals: [
    { date: "2025-10-28", referred_user: "John Doe", plan_chosen: "Basic Access", commission: 9.99, status: "Paid" },
    { date: "2025-10-25", referred_user: "Jane Smith", plan_chosen: "Pro Affiliate", commission: 29.99, status: "Paid" },
    { date: "2025-10-15", referred_user: "Peter Jones", plan_chosen: "Premium Content", commission: 19.99, status: "Pending" },
  ],

  // Mock data for /api/affiliate/earnings
  earnings: [
    { date: "2025-10-28", amount: "$9.99", type: "Commission", status: "Paid" },
    { date: "2025-10-25", amount: "$29.99", type: "Commission", status: "Paid" },
    { date: "2025-10-01", amount: "$12.50", type: "Bonus", status: "Paid" },
  ],

  // Mock data for /api/affiliate/training
  training: [
      { title: "Mastering the Sales Funnel", type: "Video", url: "#" },
      { title: "Advanced SEO for Affiliates", type: "Article", url: "#" },
      { title: "Top 5 Closing Techniques", type: "Video", url: "#" },
  ]
};