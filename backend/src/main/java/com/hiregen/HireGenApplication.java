package com.hiregen;

import com.hiregen.model.Job;
import com.hiregen.model.Candidate;
import com.hiregen.repository.JobRepository;
import com.hiregen.repository.CandidateRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class HireGenApplication {

    public static void main(String[] args) {
        SpringApplication.run(HireGenApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDatabase(JobRepository jobRepository, CandidateRepository candidateRepository) {
        return args -> {
            if (jobRepository.count() == 0) {
                jobRepository.save(new Job(
                    "Full Stack Java Engineer", 
                    "TechCorp Systems", 
                    "We are looking for a Senior Full Stack Engineer proficient in Spring Boot, React, and MySQL/H2 database management.", 
                    "3+ years experience, Bachelors degree in CS or equivalent, Experience with RESTful APIs, Git, and Agile.", 
                    "Java, Spring Boot, React, JavaScript, MySQL, CSS, HTML, Git, REST APIs", 
                    3
                ));
                jobRepository.save(new Job(
                    "Data Scientist", 
                    "AnalyticsAI Solutions", 
                    "Looking for an AI enthusiast skilled in Python, Machine Learning models, and SQL querying for predictive analysis.", 
                    "2+ years experience, Masters/Bachelors in Statistics or CS, ML frameworks like TensorFlow/PyTorch, SQL databases.", 
                    "Python, SQL, TensorFlow, PyTorch, Pandas, Scikit-learn, Machine Learning, Data Visualization", 
                    2
                ));
            }

            if (candidateRepository.count() == 0) {
                Candidate alice = new Candidate();
                alice.setName("Alice Smith");
                alice.setEmail("alice.smith@example.com");
                alice.setPhone("+1-555-0199");
                alice.setEducation("B.Tech in Computer Science, State University");
                alice.setCgpa("8.5/10");
                alice.setExperienceSummary("2.5 years of experience building modern web applications. Worked extensively with React and Node.js. Some exposure to Java backends.");
                alice.setSkills("JavaScript, React, HTML, CSS, Git, Node.js, Java, MySQL, REST APIs");
                alice.setProjects("E-commerce platform with React & Node; Candidate tracking system");
                alice.setAchievements("Won 2nd place in local Hackathon 2025");
                alice.setLanguages("English, Spanish");
                candidateRepository.save(alice);
            }
        };
    }
}
