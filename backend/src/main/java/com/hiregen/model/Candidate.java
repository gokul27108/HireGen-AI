package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String education;
    private String cgpa;

    @Column(name = "experience_summary", columnDefinition = "TEXT")
    private String experienceSummary;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String projects;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    private String languages;

    private String currentRound = "ROUND_1_RESUME";

    @Column(name = "resume_file_name")
    private String resumeFileName;

    private String password;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public Candidate() {}

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getCgpa() { return cgpa; }
    public void setCgpa(String cgpa) { this.cgpa = cgpa; }

    public String getExperienceSummary() { return experienceSummary; }
    public void setExperienceSummary(String experienceSummary) { this.experienceSummary = experienceSummary; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getProjects() { return projects; }
    public void setProjects(String projects) { this.projects = projects; }

    public String getAchievements() { return achievements; }
    public void setAchievements(String achievements) { this.achievements = achievements; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public String getCurrentRound() { return currentRound; }
    public void setCurrentRound(String currentRound) { this.currentRound = currentRound; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
