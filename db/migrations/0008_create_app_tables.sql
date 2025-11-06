
-- Migration: 0008_create_app_tables.sql
-- Description: Creates the initial tables for QuizResults, PlacementProfiles, PanamaLeads, and ClientCollaboration.

-- Table for storing quiz results
CREATE TABLE IF NOT EXISTS QuizResults (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    module1_score INTEGER,
    module2_score INTEGER,
    module3_score INTEGER,
    total_score INTEGER,
    knowledge_level TEXT, -- e.g., 'Certified', 'Mastery'
    completion_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing placement profiles
CREATE TABLE IF NOT EXISTS PlacementProfiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    fullName TEXT NOT NULL,
    linkedinUrl TEXT,
    salesExperience TEXT,
    nicheInterest TEXT,
    availability TEXT,
    deepPainSummary TEXT NOT NULL,
    objectionHandlingView TEXT NOT NULL,
    crmFamiliarity TEXT,
    submissionDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing Panama leads
CREATE TABLE IF NOT EXISTS PanamaLeads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    fullName TEXT NOT NULL,
    interest TEXT, -- 'Travel_Services', 'Personal_Growth', 'Barbershop_Franchise'
    submissionDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking client collaboration sessions
CREATE TABLE IF NOT EXISTS ClientCollaboration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_email TEXT NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    final_niche_id TEXT, -- e.g., 'dresses'
    final_niche_name TEXT, -- e.g., 'Women's Dresses'
    collaboration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
