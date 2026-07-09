-- Seed data for HireGen AI database

USE hiregen_db;

-- Insert jobs
INSERT INTO jobs (title, company, description, requirements, primary_skills, min_experience_years) VALUES
('Full Stack Java Engineer', 'TechCorp Systems', 
 'We are looking for a Senior Full Stack Engineer proficient in Spring Boot, React, and MySQL database management.', 
 '3+ years experience, Bachelors degree in CS or equivalent, Experience with RESTful APIs, Git, and Agile.', 
 'Java, Spring Boot, React, JavaScript, MySQL, CSS, HTML, Git, REST APIs', 
 3),
('Data Scientist', 'AnalyticsAI Solutions', 
 'Looking for an AI enthusiast skilled in Python, Machine Learning models, and SQL querying for predictive analysis.', 
 '2+ years experience, Masters/Bachelors in Statistics or CS, ML frameworks like TensorFlow/PyTorch, SQL databases.', 
 'Python, SQL, TensorFlow, PyTorch, Pandas, Scikit-learn, Machine Learning, Data Visualization', 
 2);

-- Insert a mock candidate
INSERT INTO candidates (name, email, phone, education, cgpa, experience_summary, skills, projects, achievements, languages) VALUES
('Alice Smith', 'alice.smith@example.com', '+1-555-0199', 
 'B.Tech in Computer Science, State University', '8.5/10', 
 '2.5 years of experience building modern web applications. Worked extensively with React and Node.js. Some exposure to Java backends.', 
 'JavaScript, React, HTML, CSS, Git, Node.js, Java, MySQL, REST APIs', 
 'E-commerce platform with React & Node (handled state management with Redux); Candidate tracking system (integrated with database)', 
 'Won 2nd place in local Hackathon 2025; Top 10% in Coding Competitions', 
 'English, Spanish');
