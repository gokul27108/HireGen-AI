package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "aptitude_tests")
public class AptitudeTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "questions_json", columnDefinition = "TEXT")
    private String questionsJson;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson;

    @Column(name = "final_score")
    private Integer finalScore;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public AptitudeTest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getQuestionsJson() { return questionsJson; }
    public void setQuestionsJson(String questionsJson) { this.questionsJson = questionsJson; }

    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

    public Integer getFinalScore() { return finalScore; }
    public void setFinalScore(Integer finalScore) { this.finalScore = finalScore; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
