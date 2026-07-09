package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coding_evaluations")
public class CodingEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    private String language;

    @Column(name = "candidate_code", columnDefinition = "TEXT")
    private String candidateCode;

    private String correctness; // Correct, Incorrect, Partial

    @Column(name = "complexity_time")
    private String complexityTime;

    @Column(name = "complexity_space")
    private String complexitySpace;

    @Column(name = "optimization_suggestions", columnDefinition = "TEXT")
    private String optimizationSuggestions;

    @Column(name = "final_score")
    private Integer finalScore;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public CodingEvaluation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCandidateCode() { return candidateCode; }
    public void setCandidateCode(String candidateCode) { this.candidateCode = candidateCode; }

    public String getCorrectness() { return correctness; }
    public void setCorrectness(String correctness) { this.correctness = correctness; }

    public String getComplexityTime() { return complexityTime; }
    public void setComplexityTime(String complexityTime) { this.complexityTime = complexityTime; }

    public String getComplexitySpace() { return complexitySpace; }
    public void setComplexitySpace(String complexitySpace) { this.complexitySpace = complexitySpace; }

    public String getOptimizationSuggestions() { return optimizationSuggestions; }
    public void setOptimizationSuggestions(String optimizationSuggestions) { this.optimizationSuggestions = optimizationSuggestions; }

    public Integer getFinalScore() { return finalScore; }
    public void setFinalScore(Integer finalScore) { this.finalScore = finalScore; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
