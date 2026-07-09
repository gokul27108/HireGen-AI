package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    private String type; // TECHNICAL, HR, BEHAVIORAL
    private String status; // IN_PROGRESS, COMPLETED

    @Column(name = "final_score")
    private Integer finalScore;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "proctoring_logs", columnDefinition = "TEXT")
    private String proctoringLogs;

    @Column(name = "proctoring_score")
    private Integer proctoringScore;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public Interview() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getFinalScore() { return finalScore; }
    public void setFinalScore(Integer finalScore) { this.finalScore = finalScore; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getProctoringLogs() { return proctoringLogs; }
    public void setProctoringLogs(String proctoringLogs) { this.proctoringLogs = proctoringLogs; }

    public Integer getProctoringScore() { return proctoringScore; }
    public void setProctoringScore(Integer proctoringScore) { this.proctoringScore = proctoringScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
