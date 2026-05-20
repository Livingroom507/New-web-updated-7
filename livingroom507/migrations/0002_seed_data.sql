INSERT INTO users (name, email, role, paypal_email, public_bio) VALUES
('Roblq Affiliate', 'roblq123@gmail.com', 'affiliate', 'roblq123@gmail.com', 'Affiliate advocate focused on community growth and customer referrals.'),
('James Watson', 'admin@livingroom507.com', 'admin', NULL, NULL),
('Client One', 'client1@livingroom507.com', 'customer', NULL, NULL);

INSERT INTO subscriptions (user_id, plan_name, monthly_fee, purchase_unit, purchase_earning, status)
SELECT id, 'PREMIUM', 39.50, 89.95, 14.61, 'active'
FROM users
WHERE email = 'roblq123@gmail.com';

INSERT INTO subscriptions (user_id, plan_name, monthly_fee, purchase_unit, purchase_earning, status)
SELECT id, 'STANDARD', 29.50, 67.18, 10.91, 'active'
FROM users
WHERE email = 'client1@livingroom507.com';

INSERT INTO affiliate_metrics (affiliate_id, customers_referred, total_earnings)
SELECT id, 12, 260.00
FROM users
WHERE email = 'roblq123@gmail.com';
