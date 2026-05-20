DROP TABLE IF EXISTS quiz_results;
DROP TABLE IF EXISTS affiliate_metrics;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer',
  paypal_email TEXT,
  public_bio TEXT,
  profile_picture_url TEXT,
  password_hash TEXT,
  password_salt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_name TEXT NOT NULL,
  monthly_fee REAL NOT NULL,
  purchase_unit REAL NOT NULL,
  purchase_earning REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE affiliate_metrics (
  affiliate_id INTEGER PRIMARY KEY,
  customers_referred INTEGER NOT NULL DEFAULT 0,
  total_earnings REAL NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (affiliate_id) REFERENCES users(id)
);

CREATE TABLE quiz_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT,
  user_email TEXT NOT NULL,
  module_number INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage REAL NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status, start_date DESC);
CREATE INDEX idx_quiz_results_email_module ON quiz_results(user_email, module_number, submitted_at DESC);
