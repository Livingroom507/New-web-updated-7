-- Migration to seed the 'plans' table with the 9 available subscription plans.

-- Customer Plans
INSERT INTO plans (role, plan_name, monthly_cost, network_total, avg_cost_cycle, break_even_flow, network_earnings, yearly_capital) VALUES
('customer', 'Basic Access', 9.99, 5000, 100, 50, 4500, 119.88),
('customer', 'Premium Content', 19.99, 5000, 100, 50, 4500, 239.88),
('customer', 'All-Access Pass', 29.99, 5000, 100, 50, 4500, 359.88);

-- Affiliate Plans
INSERT INTO plans (role, plan_name, monthly_cost, network_total, avg_cost_cycle, break_even_flow, network_earnings, yearly_capital) VALUES
('affiliate', 'Starter Affiliate', 29.99, 15000, 300, 150, 13500, 359.88),
('affiliate', 'Pro Affiliate', 79.99, 15000, 300, 150, 13500, 959.88),
('affiliate', 'Enterprise Partner', 149.99, 15000, 300, 150, 13500, 1799.88);

-- Admin/Internal Plans
INSERT INTO plans (role, plan_name, monthly_cost, network_total, avg_cost_cycle, break_even_flow, network_earnings, yearly_capital) VALUES
('admin', 'Manager Seat', 0.00, 0, 0, 0, 0, 0.00),
('admin', 'Developer Seat', 0.00, 0, 0, 0, 0, 0.00),
('admin', 'Analyst Seat', 0.00, 0, 0, 0, 0, 0.00);