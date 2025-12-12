CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT,
  email TEXT,
  paypal_email TEXT,
  profile_picture_url TEXT,
  public_bio TEXT,
  role TEXT CHECK(role IN ('customer','affiliate','admin')),
  join_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  plan_name TEXT,
  monthly_fee REAL,
  compounding_rate REAL,
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS affiliate_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER,
  customers_referred INTEGER DEFAULT 0,
  total_earnings REAL DEFAULT 0.00,
  last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(affiliate_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT,
  plan_name TEXT,
  monthly_cost REAL,
  network_total REAL,
  avg_cost_cycle REAL,
  break_even_flow REAL,
  network_earnings REAL,
  yearly_capital REAL,
  subscription_cost REAL,
  purchase_unit REAL,
  purchase_earning REAL,
  network_earnings_goal REAL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  amount REAL,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_name TEXT UNIQUE,
  setting_value TEXT
);

CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER NOT NULL,
  referred_user_id INTEGER,
  referred_email TEXT,
  plan_name TEXT,
  commission REAL DEFAULT 0.0,
  status TEXT CHECK(status IN ('pending','active','cancelled','paid')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed_at DATETIME,
  FOREIGN KEY(affiliate_id) REFERENCES users(id),
  FOREIGN KEY(referred_user_id) REFERENCES users(id)
);

CREATE INDEX idx_user_role ON users(role);

CREATE INDEX idx_subscription_user ON subscriptions(user_id);

CREATE INDEX idx_affiliate_metrics ON affiliate_metrics(affiliate_id);

CREATE INDEX idx_transactions_user ON transactions(user_id);

CREATE INDEX idx_plans_role ON plans(role);

CREATE INDEX idx_admin_settings_name ON admin_settings(setting_name);

CREATE INDEX IF NOT EXISTS idx_referrals_affiliate ON referrals(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON referrals(referred_user_id);

-- Schema for the CRM

-- Contacts table
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Deals table with custom fields
CREATE TABLE deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    pipeline_stage TEXT NOT NULL DEFAULT 'Qualified Lead',
    main_pain TEXT,
    emotional_cost TEXT,
    uvp TEXT,
    readiness_score INTEGER,
    follow_up_trigger_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);