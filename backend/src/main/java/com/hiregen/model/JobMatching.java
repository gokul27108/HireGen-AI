package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_matchings")
public class JobMatching {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "match_percentage")
    private Integer matchPercentage;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public JobMatching() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public Integer getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Integer matchPercentage) { this.matchPercentage = matchPercentage; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
