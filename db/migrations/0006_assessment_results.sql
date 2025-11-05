-- Drop the old Module3Results table if it exists
DROP TABLE IF EXISTS Module3Results;

-- Create the new AssessmentResults table
CREATE TABLE AssessmentResults (
    id INTEGER PRIMARY KEY,
    user_email TEXT NOT NULL,
    module_number INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    knowledge_level TEXT,
    referrer_affiliate_id TEXT,
    submission_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional Index for fast lookups by email
CREATE INDEX idx_user_email ON AssessmentResults (user_email);
