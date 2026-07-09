package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_screenings")
public class ResumeScreening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "resume_score")
    private Integer resumeScore;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(name = "improvement_suggestions", columnDefinition = "TEXT")
    private String improvementSuggestions;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public ResumeScreening() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Integer getResumeScore() { return resumeScore; }
    public void setResumeScore(Integer resumeScore) { this.resumeScore = resumeScore; }

    public Integer getAtsScore() { return atsScore; }
    public void setAtsScore(Integer atsScore) { this.atsScore = atsScore; }

    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }

    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }

    public String getMissingSkills() { return missingSkills; }
    public void setMissingSkills(String missingSkills) { this.missingSkills = missingSkills; }

    public String getImprovementSuggestions() { return improvementSuggestions; }
    public void setImprovementSuggestions(String improvementSuggestions) { this.improvementSuggestions = improvementSuggestions; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
