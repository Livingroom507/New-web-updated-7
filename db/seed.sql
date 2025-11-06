-- Sample data for plans
INSERT INTO plans (role, plan_name, monthly_cost, network_total, avg_cost_cycle, break_even_flow, network_earnings, yearly_capital)
VALUES
('A-Team', 'Basic', 19.50, 4933.50, 70.53, 16433.50, 1825.94, 21911.33),
('A-Team & Admin', 'Standard', 29.50, 7463.50, 106.70, 24860.94, 2762.33, 33147.92),
('Admin', 'Premium', 39.50, 9993.50, 142.87, 33288.37, 3698.71, 44384.49),
('Admin', 'Standard-Brand', 70.50, 17836.50, 254.99, 59413.42, 6601.49, 79217.89),
('Admin', 'Standard+', 106.65, 26982.45, 385.75, 89878.60, 9986.51, 119838.13),
('Admin', 'Premium+', 142.81, 36130.93, 516.53, 120352.21, 13372.47, 160469.61),
('Admin', 'Controller', 197.94, 50078.82, 715.93, 166812.67, 18534.74, 222416.89),
('Admin', 'Enterprise', 246.12, 62268.36, 890.20, 207416.05, 23046.23, 276554.73),
('Admin', 'Business', 329.56, 83378.68, 1191.99, 277734.58, 30859.40, 370312.77);

-- Add minimal sample users only when none exist (safe for dev/test)
INSERT INTO users(name, email, role)
SELECT 'Affiliate One', 'aff1@example.com', 'affiliate'
WHERE (SELECT COUNT(*) FROM users WHERE role = 'affiliate') = 0;

INSERT INTO users(name, email, role)
SELECT 'Customer One', 'cust1@example.com', 'customer'
WHERE (SELECT COUNT(*) FROM users WHERE role = 'customer') = 0;

INSERT INTO users(name, email, role)
SELECT 'Customer Two', 'cust2@example.com', 'customer'
WHERE (SELECT COUNT(*) FROM users WHERE role = 'customer') = 0;

-- Seed referrals only when referrals table is empty
INSERT INTO referrals (affiliate_id, referred_user_id, referred_email, plan_name, commission, status, created_at, confirmed_at)
SELECT a.id, c.id, c.email, 'Basic', 5.00, 'paid',
       datetime('now','-10 days'), datetime('now','-7 days')
FROM (SELECT id FROM users WHERE role = 'affiliate' LIMIT 3) a
CROSS JOIN (SELECT id, email FROM users WHERE role = 'customer' LIMIT 3) c
WHERE (SELECT COUNT(*) FROM referrals) = 0
LIMIT 9;
