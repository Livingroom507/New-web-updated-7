-- Sample data for plans
INSERT INTO plans (plan_name, subscription_cost, purchase_unit, purchase_earning, network_earnings_goal)
VALUES
('Basic', 19.50, 0.0, 0.0, 1825.94),
('Standard', 29.50, 0.0, 0.0, 2762.33),
('Premium', 39.50, 0.0, 0.0, 3698.71),
('Standard-Brand', 70.50, 0.0, 0.0, 6601.49),
('Standard+', 106.65, 0.0, 0.0, 9986.51),
('Premium+', 142.81, 0.0, 0.0, 13372.47),
('Controller', 197.94, 0.0, 0.0, 18534.74),
('Enterprise', 246.12, 0.0, 0.0, 23046.23),
('Business', 329.56, 0.0, 0.0, 30859.40);

-- Add minimal sample users only when none exist (safe for dev/test)
INSERT INTO users(full_name, email, role)
SELECT 'Affiliate One', 'aff1@example.com', 'affiliate'
WHERE (SELECT COUNT(*) FROM users WHERE role = 'affiliate') = 0;

INSERT INTO users(full_name, email, role)
SELECT 'Customer One', 'cust1@example.com', 'customer'
WHERE (SELECT COUNT(*) FROM users WHERE role = 'customer') = 0;

INSERT INTO users(full_name, email, role)
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
