-- Creates the schema for the CRM

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
