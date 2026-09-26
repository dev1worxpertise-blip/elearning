-- =============================================================================
-- LearnPulse E-Learning Platform - PostgreSQL Database Schema
-- Database: elearning_db
-- =============================================================================

-- Enable UUID extension for secure random IDs (optional, fallback to standard serial/text)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    headline VARCHAR(255),
    bio TEXT,
    failed_login_attempts INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. PROGRAMS / COURSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline TEXT,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    level VARCHAR(50) DEFAULT 'All Levels' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
    duration VARCHAR(50) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    enrolled_count INT DEFAULT 0,
    instructor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    instructor_name VARCHAR(255) NOT NULL,
    instructor_role VARCHAR(255),
    instructor_avatar TEXT,
    authority_name VARCHAR(255),
    authority_role VARCHAR(255),
    authority_title VARCHAR(255),
    skills JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. MODULES / LESSONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(64) PRIMARY KEY,
    program_id VARCHAR(64) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    module_order INT NOT NULL,
    duration VARCHAR(50) NOT NULL,
    video_url TEXT NOT NULL,
    youtube_id VARCHAR(50),
    description TEXT NOT NULL,
    takeaways JSONB DEFAULT '[]'::jsonb,
    resources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_program_module_order UNIQUE (program_id, module_order)
);

-- -----------------------------------------------------------------------------
-- 5. QUIZZES TABLE (Post-Video Interactive Q&A)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) UNIQUE NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INT DEFAULT 80,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 6. ENROLLMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id VARCHAR(64) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_user_enrollment UNIQUE (user_id, program_id)
);

-- -----------------------------------------------------------------------------
-- 7. MODULE VIDEO WATCH PROGRESS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS module_progress (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(64) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    video_watched_percent INT DEFAULT 0 CHECK (video_watched_percent >= 0 AND video_watched_percent <= 100),
    is_video_finished BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_module_progress UNIQUE (user_id, module_id)
);

-- -----------------------------------------------------------------------------
-- 8. QUIZ SUBMISSIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    module_id VARCHAR(64) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage INT NOT NULL,
    is_passed BOOLEAN NOT NULL,
    user_answers JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. CERTIFICATES TABLE (Verifiable Digital Credentials)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(64) PRIMARY KEY,
    credential_id VARCHAR(64) UNIQUE NOT NULL, -- e.g. CERT-LP-782910
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id VARCHAR(64) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    program_title VARCHAR(255) NOT NULL,
    issue_date VARCHAR(100) NOT NULL,
    instructor_name VARCHAR(255) NOT NULL,
    instructor_role VARCHAR(255),
    authority_name VARCHAR(255),
    authority_role VARCHAR(255),
    authority_title VARCHAR(255),
    grade VARCHAR(100) DEFAULT 'Distinction (Honors)',
    verification_code VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_program_cert UNIQUE (user_id, program_id)
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_modules_program ON modules(program_id, module_order);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_user ON module_progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user ON quiz_submissions(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_certificates_credential ON certificates(credential_id);
