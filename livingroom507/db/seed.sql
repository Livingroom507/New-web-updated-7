INSERT INTO users (name, email, role) VALUES 
('James Watson', 'admin@livingroom507.com', 'admin'),
('Affiliate One', 'affiliate1@livingroom507.com', 'affiliate'),
('Client One', 'client1@livingroom507.com', 'customer');

INSERT INTO subscriptions (user_id, plan_name, monthly_fee, compounding_rate) VALUES
(1, 'Premium Barber Plan', 50.00, 1.429),
(3, 'Standard Membership', 25.00, 1.429);

INSERT INTO affiliate_metrics (affiliate_id, customers_referred, total_earnings)
VALUES (2, 12, 260.00);