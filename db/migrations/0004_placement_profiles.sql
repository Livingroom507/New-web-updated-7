CREATE TABLE PlacementProfiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    fullName TEXT NOT NULL,
    linkedinUrl TEXT,
    salesExperience INTEGER,
    nicheInterest TEXT,
    availability TEXT,
    deepPainSummary TEXT,
    objectionHandlingView TEXT,
    crmFamiliarity TEXT,
    submissionDate TEXT DEFAULT CURRENT_TIMESTAMP
);
