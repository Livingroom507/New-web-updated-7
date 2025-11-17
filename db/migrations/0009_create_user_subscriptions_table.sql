CREATE TABLE IF NOT EXISTS user_subscriptions (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- User Email (no foreign key check)
    user_email TEXT NOT NULL UNIQUE, 

    -- Current level of involvement (The Subscription Tier)
    subscription_tier TEXT NOT NULL DEFAULT 'Client', 

    -- Date the user reached this current tier
    tier_start_date TEXT NOT NULL, 

    -- Optional columns
    panama_eligibility_date TEXT, 
    cohort_id TEXT
);
);