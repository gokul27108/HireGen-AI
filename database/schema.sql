-- MySQL Schema for HireGen AI Multi-Agent Recruitment Platform

CREATE DATABASE IF NOT EXISTS hiregen_db;
USE hiregen_db;

-- 1. Jobs Description Table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    primary_skills TEXT, -- Comma-separated or JSON list
    min_experience_years INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Candidates Table (Parsed from resumes or entered manually)
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    education VARCHAR(255),
    cgpa VARCHAR(50),
    experience_summary TEXT,
    skills TEXT, -- Comma-separated or JSON list
    projects TEXT,
    achievements TEXT,
    languages VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Resume Screening Table (Agent 1 Output)
CREATE TABLE IF NOT EXISTS resume_screenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    resume_score INT CHECK (resume_score BETWEEN 0 AND 100),
    ats_score INT CHECK (ats_score BETWEEN 0 AND 100),
    strengths TEXT,
    weaknesses TEXT,
    missing_skills TEXT,
    improvement_suggestions TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 4. Job Matching Table (Agent 2 Output)
CREATE TABLE IF NOT EXISTS job_matchings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    match_percentage INT CHECK (match_percentage BETWEEN 0 AND 100),
    reason TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 5. Skill Gap Analysis Table (Agent 3 Output)
CREATE TABLE IF NOT EXISTS skill_gaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    current_skills TEXT,
    missing_skills TEXT,
    priority_order TEXT,
    weekly_learning_plan TEXT, -- Long detailed roadmap as JSON/Text
    recommended_projects TEXT,
    recommended_certifications TEXT,
    estimated_time_weeks INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 6. Interviews Table (Agent 4 Orchestration)
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    type VARCHAR(50), -- e.g., TECHNICAL, HR, BEHAVIORAL
    status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED
    final_score INT CHECK (final_score BETWEEN 0 AND 100),
    feedback TEXT,
    proctoring_logs TEXT,
    proctoring_score INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 7. Interview Questions & Answers Table (Agent 4 Transcripts)
CREATE TABLE IF NOT EXISTS interview_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    interview_id INT NOT NULL,
    question TEXT NOT NULL,
    candidate_answer TEXT,
    knowledge_score INT CHECK (knowledge_score BETWEEN 0 AND 100),
    confidence_score INT CHECK (confidence_score BETWEEN 0 AND 100),
    communication_score INT CHECK (communication_score BETWEEN 0 AND 100),
    problem_solving_score INT CHECK (problem_solving_score BETWEEN 0 AND 100),
    technical_accuracy_score INT CHECK (technical_accuracy_score BETWEEN 0 AND 100),
    score INT CHECK (score BETWEEN 0 AND 100), -- Average score
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- 8. Coding Evaluation Table (Agent 5 Output)
CREATE TABLE IF NOT EXISTS coding_evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    question TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'Java',
    candidate_code TEXT,
    correctness VARCHAR(50), -- Correct, Incorrect, Partial
    complexity_time VARCHAR(50),
    complexity_space VARCHAR(50),
    optimization_suggestions TEXT,
    final_score INT CHECK (final_score BETWEEN 0 AND 100),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 9. Communication Assessment Table (Agent 6 Output)
CREATE TABLE IF NOT EXISTS communication_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    grammar_feedback TEXT,
    vocabulary_feedback TEXT,
    confidence_feedback TEXT,
    professional_tone_feedback TEXT,
    sentence_structure_feedback TEXT,
    clarity_feedback TEXT,
    politeness_feedback TEXT,
    fluency_feedback TEXT,
    communication_score INT CHECK (communication_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 10. Hiring Decisions Table (Agent 7 Output)
CREATE TABLE IF NOT EXISTS hiring_decisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
    decision VARCHAR(50), -- STRONG_HIRE, HIRE, HOLD, NEED_IMPROVEMENT, REJECT
    reason TEXT,
    strengths TEXT,
    weaknesses TEXT,
    learning_suggestions TEXT,
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
