package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "primary_skills", columnDefinition = "TEXT")
    private String primarySkills;

    @Column(name = "min_experience_years")
    private Integer minExperienceYears;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public Job() {}

    public Job(String title, String company, String description, String requirements, String primarySkills, Integer minExperienceYears) {
        this.title = title;
        this.company = company;
        this.description = description;
        this.requirements = requirements;
        this.primarySkills = primarySkills;
        this.minExperienceYears = minExperienceYears;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getPrimarySkills() { return primarySkills; }
    public void setPrimarySkills(String primarySkills) { this.primarySkills = primarySkills; }

    public Integer getMinExperienceYears() { return minExperienceYears; }
    public void setMinExperienceYears(Integer minExperienceYears) { this.minExperienceYears = minExperienceYears; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
