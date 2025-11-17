-- Table: user_subscriptions

-- Table: user_subscriptions

CREATE TABLE IF NOT EXISTS user_subscriptions (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Foreign Key to link back to the main user profile table (data will link by email)
    user_email TEXT NOT NULL UNIQUE, 

    -- Current level of involvement (The Subscription Tier)
    -- Options: 'Client', 'Affiliate', 'Closer', 'Mastery', 'Panama Ready'
    subscription_tier TEXT NOT NULL DEFAULT 'Client', 

    -- Date the user reached this current tier
    tier_start_date TEXT NOT NULL, 

    -- Optional: Stores the date they completed the Panama milestone or became eligible
    panama_eligibility_date TEXT, 

    -- Optional: Any unique identifier for their current training cohort or group
    cohort_id TEXT
    
    -- REMOVED: FOREIGN KEY (user_email) REFERENCES PlacementProfiles(email) 

);