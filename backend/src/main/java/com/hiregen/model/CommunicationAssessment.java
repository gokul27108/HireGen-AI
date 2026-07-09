package com.hiregen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "communication_assessments")
public class CommunicationAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "grammar_feedback", columnDefinition = "TEXT")
    private String grammarFeedback;

    @Column(name = "vocabulary_feedback", columnDefinition = "TEXT")
    private String vocabularyFeedback;

    @Column(name = "confidence_feedback", columnDefinition = "TEXT")
    private String confidenceFeedback;

    @Column(name = "professional_tone_feedback", columnDefinition = "TEXT")
    private String professionalToneFeedback;

    @Column(name = "sentence_structure_feedback", columnDefinition = "TEXT")
    private String sentenceStructureFeedback;

    @Column(name = "clarity_feedback", columnDefinition = "TEXT")
    private String clarityFeedback;

    @Column(name = "politeness_feedback", columnDefinition = "TEXT")
    private String politenessFeedback;

    @Column(name = "fluency_feedback", columnDefinition = "TEXT")
    private String fluencyFeedback;

    @Column(name = "communication_score")
    private Integer communicationScore;

    @Column(name = "created_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    public CommunicationAssessment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public String getGrammarFeedback() { return grammarFeedback; }
    public void setGrammarFeedback(String grammarFeedback) { this.grammarFeedback = grammarFeedback; }

    public String getVocabularyFeedback() { return vocabularyFeedback; }
    public void setVocabularyFeedback(String vocabularyFeedback) { this.vocabularyFeedback = vocabularyFeedback; }

    public String getConfidenceFeedback() { return confidenceFeedback; }
    public void setConfidenceFeedback(String confidenceFeedback) { this.confidenceFeedback = confidenceFeedback; }

    public String getProfessionalToneFeedback() { return professionalToneFeedback; }
    public void setProfessionalToneFeedback(String professionalToneFeedback) { this.professionalToneFeedback = professionalToneFeedback; }

    public String getSentenceStructureFeedback() { return sentenceStructureFeedback; }
    public void setSentenceStructureFeedback(String sentenceStructureFeedback) { this.sentenceStructureFeedback = sentenceStructureFeedback; }

    public String getClarityFeedback() { return clarityFeedback; }
    public void setClarityFeedback(String clarityFeedback) { this.clarityFeedback = clarityFeedback; }

    public String getPolitenessFeedback() { return politenessFeedback; }
    public void setPolitenessFeedback(String politenessFeedback) { this.politenessFeedback = politenessFeedback; }

    public String getFluencyFeedback() { return fluencyFeedback; }
    public void setFluencyFeedback(String fluencyFeedback) { this.fluencyFeedback = fluencyFeedback; }

    public Integer getCommunicationScore() { return communicationScore; }
    public void setCommunicationScore(Integer communicationScore) { this.communicationScore = communicationScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
