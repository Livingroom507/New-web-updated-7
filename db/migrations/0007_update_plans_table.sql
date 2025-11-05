-- Drop the old plans table
DROP TABLE IF EXISTS plans;

-- Create the new plans table
CREATE TABLE plans (
    plan_name TEXT PRIMARY KEY,
    subscription_cost REAL NOT NULL,
    purchase_unit REAL NOT NULL,
    purchase_earning REAL NOT NULL,
    network_earnings_goal REAL NOT NULL
);

-- Insert the new plan data
INSERT INTO plans (plan_name, subscription_cost, purchase_unit, purchase_earning, network_earnings_goal) VALUES
('BASIC', 19.50, 44.41, 7.21, 1825.94),
('STANDARD', 29.50, 67.18, 10.91, 2762.32),
('PREMIUM', 39.50, 89.95, 14.61, 3698.70),
('STANDARD-BRAND', 70.50, 160.55, 26.09, 6601.48),
('STANDARD+', 106.65, 242.87, 39.47, 9986.49),
('PREMIUM+', 142.81, 325.22, 52.85, 13372.44),
('CONTROLLER', 197.94, 450.77, 73.25, 18534.70),
('ENTERPRISE', 246.12, 560.49, 91.09, 23046.17),
('BUSINESS', 329.56, 750.00, 121.97, 30859.32);
