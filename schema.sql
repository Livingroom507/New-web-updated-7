CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  role TEXT CHECK(role IN ('customer','affiliate','admin')),
  join_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  plan_name TEXT,
  monthly_fee REAL,
  compounding_rate REAL,
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE affiliate_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  affiliate_id INTEGER,
  customers_referred INTEGER DEFAULT 0,
  total_earnings REAL DEFAULT 0.00,
  last_update DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(affiliate_id) REFERENCES users(id)
);