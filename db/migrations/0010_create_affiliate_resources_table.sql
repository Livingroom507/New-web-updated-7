-- Table: affiliate_resources
CREATE TABLE IF NOT EXISTS affiliate_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Script', 'Video', 'Template'
    created_at TEXT NOT NULL
);