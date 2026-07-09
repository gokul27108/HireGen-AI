package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skill_gaps")
public class SkillGap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "current_skills", columnDefinition = "TEXT")
    private String currentSkills;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(name = "priority_order", columnDefinition = "TEXT")
    private String priorityOrder;

    @Column(name = "weekly_learning_plan", columnDefinition = "TEXT")
    private String weeklyLearningPlan;

    @Column(name = "recommended_projects", columnDefinition = "TEXT")
    private String recommendedProjects;

    @Column(name = "recommended_certifications", columnDefinition = "TEXT")
    private String recommendedCertifications;

    @Column(name = "estimated_time_weeks")
    private Integer estimatedTimeWeeks;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public SkillGap() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getCurrentSkills() { return currentSkills; }
    public void setCurrentSkills(String currentSkills) { this.currentSkills = currentSkills; }

    public String getMissingSkills() { return missingSkills; }
    public void setMissingSkills(String missingSkills) { this.missingSkills = missingSkills; }

    public String getPriorityOrder() { return priorityOrder; }
    public void setPriorityOrder(String priorityOrder) { this.priorityOrder = priorityOrder; }

    public String getWeeklyLearningPlan() { return weeklyLearningPlan; }
    public void setWeeklyLearningPlan(String weeklyLearningPlan) { this.weeklyLearningPlan = weeklyLearningPlan; }

    public String getRecommendedProjects() { return recommendedProjects; }
    public void setRecommendedProjects(String recommendedProjects) { this.recommendedProjects = recommendedProjects; }

    public String getRecommendedCertifications() { return recommendedCertifications; }
    public void setRecommendedCertifications(String recommendedCertifications) { this.recommendedCertifications = recommendedCertifications; }

    public Integer getEstimatedTimeWeeks() { return estimatedTimeWeeks; }
    public void setEstimatedTimeWeeks(Integer estimatedTimeWeeks) { this.estimatedTimeWeeks = estimatedTimeWeeks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
