package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "interview_id", nullable = false)
    private Long interviewId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "candidate_answer", columnDefinition = "TEXT")
    private String candidateAnswer;

    @Column(name = "knowledge_score")
    private Integer knowledgeScore;

    @Column(name = "confidence_score")
    private Integer confidenceScore;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "problem_solving_score")
    private Integer problemSolvingScore;

    @Column(name = "technical_accuracy_score")
    private Integer technicalAccuracyScore;

    private Integer score; // Average rating

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public InterviewQuestion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInterviewId() { return interviewId; }
    public void setInterviewId(Long interviewId) { this.interviewId = interviewId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getCandidateAnswer() { return candidateAnswer; }
    public void setCandidateAnswer(String candidateAnswer) { this.candidateAnswer = candidateAnswer; }

    public Integer getKnowledgeScore() { return knowledgeScore; }
    public void setKnowledgeScore(Integer knowledgeScore) { this.knowledgeScore = knowledgeScore; }

    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }

    public Integer getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Integer communicationScore) { this.communicationScore = communicationScore; }

    public Integer getProblemSolvingScore() { return problemSolvingScore; }
    public void setProblemSolvingScore(Integer problemSolvingScore) { this.problemSolvingScore = problemSolvingScore; }

    public Integer getTechnicalAccuracyScore() { return technicalAccuracyScore; }
    public void setTechnicalAccuracyScore(Integer technicalAccuracyScore) { this.technicalAccuracyScore = technicalAccuracyScore; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
