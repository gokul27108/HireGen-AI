package com.hiregen.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.*;
import com.hiregen.model.*;
import com.hiregen.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GeminiAgentService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ResumeScreeningRepository resumeScreeningRepository;

    @Autowired
    private JobMatchingRepository jobMatchingRepository;

    @Autowired
    private SkillGapRepository skillGapRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private InterviewQuestionRepository interviewQuestionRepository;

    @Autowired
    private CodingEvaluationRepository codingEvaluationRepository;

    @Autowired
    private CommunicationAssessmentRepository communicationAssessmentRepository;

    @Autowired
    private HiringDecisionRepository hiringDecisionRepository;

    @Autowired
    private AptitudeTestRepository aptitudeTestRepository;

    @Autowired
    private CommunicationTestRepository communicationTestRepository;

    @Autowired
    private GeminiService geminiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private boolean isResumeContentEmpty(String content) {
        if (content == null) return true;
        String val = content.trim().toLowerCase();
        return val.isEmpty() || val.equals("none") || val.equals("na") || val.equals("n/a") || val.equals("null") || val.length() < 3;
    }

    // AGENT 1: Resume Screening
    public ResumeScreening runResumeScreening(Long candidateId, Long jobId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isEmptyProfile = isResumeContentEmpty(candidate.getSkills()) && isResumeContentEmpty(candidate.getExperienceSummary());

        if (isEmptyProfile) {
            ResumeScreening screening = new ResumeScreening();
            screening.setCandidateId(candidateId);
            screening.setJobId(jobId);
            screening.setResumeScore(0);
            screening.setAtsScore(0);
            screening.setStrengths("None");
            screening.setWeaknesses("Candidate profile is empty. No skills or experience summary provided.");
            screening.setImprovementSuggestions("Please populate your skills and experience summary details.");
            screening.setRecommendation("REJECT");
            return resumeScreeningRepository.save(screening);
        }

        String prompt = String.format(
            "You are a Senior Technical Recruiter acting as the Resume Screening Agent for HireGen AI.\n" +
            "Analyze the candidate's resume and compare it with the Job Description.\n\n" +
            "Candidate Profile:\n" +
            "Name: %s\nEducation: %s (CGPA: %s)\nSkills: %s\nExperience: %s\nProjects: %s\nAchievements: %s\n\n" +
            "Job Description:\n" +
            "Title: %s\nCompany: %s\nRequirements: %s\nSkills: %s\n\n" +
            "Return a JSON object with the following fields (DO NOT add any markdown formatting or extra text):\n" +
            "{\n" +
            "  \"resumeScore\": (integer 0-100),\n" +
            "  \"atsScore\": (integer 0-100),\n" +
            "  \"strengths\": \"(string summarizing strengths)\",\n" +
            "  \"weaknesses\": \"(string summarizing weaknesses)\",\n" +
            "  \"missingSkills\": \"(string comma-separated list of missing skills)\",\n" +
            "  \"improvementSuggestions\": \"(string detailing how to improve)\",\n" +
            "  \"recommendation\": \"(string recommendation summary)\"\n" +
            "}",
            candidate.getName(), candidate.getEducation(), candidate.getCgpa(), candidate.getSkills(),
            candidate.getExperienceSummary(), candidate.getProjects(), candidate.getAchievements(),
            job.getTitle(), job.getCompany(), job.getRequirements(), job.getPrimarySkills()
        );

        String json = geminiService.generate(prompt);
        try {
            ResumeScreening screening = objectMapper.readValue(json, ResumeScreening.class);
            screening.setCandidateId(candidateId);
            screening.setJobId(jobId);
            
            // Check if existing screening exists
            Optional<ResumeScreening> existing = resumeScreeningRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
            existing.ifPresent(value -> screening.setId(value.getId()));
            
            return resumeScreeningRepository.save(screening);
        } catch (Exception e) {
            throw new RuntimeException("Failed to screen resume: " + e.getMessage(), e);
        }
    }

    // AGENT 2: Candidate Matching
    public JobMatching runJobMatching(Long candidateId, Long jobId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isEmptyProfile = isResumeContentEmpty(candidate.getSkills()) && isResumeContentEmpty(candidate.getExperienceSummary());

        if (isEmptyProfile) {
            JobMatching matching = new JobMatching();
            matching.setCandidateId(candidateId);
            matching.setJobId(jobId);
            matching.setMatchPercentage(0);
            matching.setReason("Candidate profile contains no relevant skills or experience, resulting in 0% match.");
            matching.setConfidenceScore(0.0);
            return jobMatchingRepository.save(matching);
        }

        String prompt = String.format(
            "You are the Candidate Matching Agent. Analyze the alignment between the candidate and the target job.\n\n" +
            "Candidate Skills: %s\nExperience: %s\n\n" +
            "Job Title: %s\nJob Requirements: %s\nJob Skills: %s\n\n" +
            "Return a JSON object with the following fields (DO NOT add any markdown formatting or extra text):\n" +
            "{\n" +
            "  \"matchPercentage\": (integer 0-100),\n" +
            "  \"reason\": \"(string explanation why you reached this match conclusion)\",\n" +
            "  \"confidenceScore\": (double 0-100)\n" +
            "}",
            candidate.getSkills(), candidate.getExperienceSummary(),
            job.getTitle(), job.getRequirements(), job.getPrimarySkills()
        );

        String json = geminiService.generate(prompt);
        try {
            JobMatching matching = objectMapper.readValue(json, JobMatching.class);
            matching.setCandidateId(candidateId);
            matching.setJobId(jobId);

            Optional<JobMatching> existing = jobMatchingRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
            existing.ifPresent(value -> matching.setId(value.getId()));

            return jobMatchingRepository.save(matching);
        } catch (Exception e) {
            throw new RuntimeException("Failed to match job: " + e.getMessage(), e);
        }
    }

    // AGENT 3: Skill Gap Analysis
    public SkillGap runSkillGap(Long candidateId, Long jobId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isEmptyProfile = isResumeContentEmpty(candidate.getSkills()) && isResumeContentEmpty(candidate.getExperienceSummary());

        if (isEmptyProfile) {
            SkillGap gap = new SkillGap();
            gap.setCandidateId(candidateId);
            gap.setJobId(jobId);
            gap.setCurrentSkills("None");
            gap.setMissingSkills("All requirements: " + job.getPrimarySkills());
            gap.setPriorityOrder("Please fill in candidate details to receive a prioritized gap analysis.");
            gap.setWeeklyLearningPlan("Please fill in candidate details to receive a weekly learning plan.");
            gap.setRecommendedProjects("None");
            return skillGapRepository.save(gap);
        }

        String prompt = String.format(
            "You are the Skill Gap Agent. Conduct a detail gap analysis and outline a learning roadmap.\n\n" +
            "Candidate Skills: %s\n" +
            "Job Required Skills: %s\n\n" +
            "Return a JSON object with the following fields (DO NOT add any markdown formatting or extra text):\n" +
            "{\n" +
            "  \"currentSkills\": \"(string current skills)\",\n" +
            "  \"missingSkills\": \"(string missing skills)\",\n" +
            "  \"priorityOrder\": \"(string order of priority list)\",\n" +
            "  \"weeklyLearningPlan\": \"(string weekly plan roadmap)\",\n" +
            "  \"recommendedProjects\": \"(string suggested project projects)\",\n" +
            "  \"recommendedCertifications\": \"(string recommended certifications)\",\n" +
            "  \"estimatedTimeWeeks\": (integer estimate in weeks)\n" +
            "}",
            candidate.getSkills(), job.getPrimarySkills()
        );

        String json = geminiService.generate(prompt);
        try {
            SkillGap skillGap = objectMapper.readValue(json, SkillGap.class);
            skillGap.setCandidateId(candidateId);
            skillGap.setJobId(jobId);

            Optional<SkillGap> existing = skillGapRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
            existing.ifPresent(value -> skillGap.setId(value.getId()));

            return skillGapRepository.save(skillGap);
        } catch (Exception e) {
            throw new RuntimeException("Failed to run skill gap analysis: " + e.getMessage(), e);
        }
    }

    // AGENT 4: Mock Interview - Generate Question
    public String generateNextQuestion(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        Candidate candidate = candidateRepository.findById(interview.getCandidateId())
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Job job = jobRepository.findById(interview.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        List<InterviewQuestion> pastQuestions = interviewQuestionRepository.findByInterviewId(interviewId);

        StringBuilder conversationContext = new StringBuilder();
        for (InterviewQuestion q : pastQuestions) {
            conversationContext.append("Q: ").append(q.getQuestion()).append("\n");
            if (q.getCandidateAnswer() != null) {
                conversationContext.append("A: ").append(q.getCandidateAnswer()).append("\n");
            }
        }

        String prompt = String.format(
            "You are the Mock Interview Agent. Conduct a dynamic %s interview for candidate %s targeting the role '%s' at '%s'.\n" +
            "The candidate's target questions must be based strictly on their parsed Resume profile and skills details.\n" +
            "Candidate Resume Skills: %s\n" +
            "Resume Experience Summary: %s\n" +
            "Resume Education: %s\n\n" +
            "Your objective is to ask one challenging interview question matching this resume, wait for their answer, evaluate it, and move on. Ask ONE question at a time.\n" +
            "Analyze the following conversation context and formulate the NEXT logical question. " +
            "Do not output any introductory greetings or explanations, output ONLY the question text.\n\n" +
            "Previous Conversation:\n%s\n\n" +
            "Next Question:",
            interview.getType(), candidate.getName(), job.getTitle(), job.getCompany(),
            candidate.getSkills(), candidate.getExperienceSummary(), candidate.getEducation(), conversationContext.toString()
        );

        String questionText = geminiService.generate(prompt);
        
        // Save question record (waiting for answer)
        InterviewQuestion questionObj = new InterviewQuestion();
        questionObj.setInterviewId(interviewId);
        questionObj.setQuestion(questionText);
        interviewQuestionRepository.save(questionObj);

        return questionText;
    }

    // AGENT 4: Mock Interview - Evaluate Answer
    public InterviewQuestion evaluateAnswer(Long questionId, String answer) {
        InterviewQuestion questionObj = interviewQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question record not found"));
        
        questionObj.setCandidateAnswer(answer);

        String prompt = String.format(
            "You are the Mock Interview Agent. Evaluate the candidate's answer to the given question.\n\n" +
            "Question: %s\n" +
            "Answer: %s\n\n" +
            "Evaluate across parameters (Knowledge, Confidence, Communication, Problem Solving, Technical Accuracy) out of 100.\n" +
            "Return a JSON object with the following fields (DO NOT add any markdown formatting or extra text):\n" +
            "{\n" +
            "  \"knowledgeScore\": (integer 0-100),\n" +
            "  \"confidenceScore\": (integer 0-100),\n" +
            "  \"communicationScore\": (integer 0-100),\n" +
            "  \"problemSolvingScore\": (integer 0-100),\n" +
            "  \"technicalAccuracyScore\": (integer 0-100),\n" +
            "  \"score\": (integer average score 0-100),\n" +
            "  \"feedback\": \"(string summary feedback explaining score and correctness)\"\n" +
            "}",
            questionObj.getQuestion(), answer
        );

        String json = geminiService.generate(prompt);
        try {
            // Parse and merge
            InterviewQuestion evaluation = objectMapper.readValue(json, InterviewQuestion.class);
            questionObj.setKnowledgeScore(evaluation.getKnowledgeScore());
            questionObj.setConfidenceScore(evaluation.getConfidenceScore());
            questionObj.setCommunicationScore(evaluation.getCommunicationScore());
            questionObj.setProblemSolvingScore(evaluation.getProblemSolvingScore());
            questionObj.setTechnicalAccuracyScore(evaluation.getTechnicalAccuracyScore());
            questionObj.setScore(evaluation.getScore());
            questionObj.setFeedback(evaluation.getFeedback());

            return interviewQuestionRepository.save(questionObj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate interview answer: " + e.getMessage(), e);
        }
    }

    // AGENT 5: Coding Evaluation Agent
    public CodingEvaluation runCodingEvaluation(Long candidateId, Long jobId, String question, String code, String language) {
        String prompt = String.format(
            "You are the Coding Evaluation Agent. Evaluate the candidate's coding solution for correctness, complexity, and best practices.\n\n" +
            "Coding Problem:\n%s\n\n" +
            "Language: %s\n" +
            "Submitted Code:\n%s\n\n" +
            "Return a JSON object with the following fields (DO NOT add any markdown formatting or extra text):\n" +
            "{\n" +
            "  \"correctness\": \"(string: 'Correct', 'Partial' or 'Incorrect')\",\n" +
            "  \"complexityTime\": \"(string time complexity, e.g., O(N))\",\n" +
            "  \"complexitySpace\": \"(string space complexity, e.g., O(1))\",\n" +
            "  \"optimizationSuggestions\": \"(string detailing optimizations or improvements)\",\n" +
            "  \"finalScore\": (integer 0-100),\n" +
            "  \"feedback\": \"(string technical feedback)\"\n" +
            "}",
            question, language, code
        );

        String json = geminiService.generate(prompt);
        try {
            CodingEvaluation eval = objectMapper.readValue(json, CodingEvaluation.class);
            eval.setCandidateId(candidateId);
            eval.setJobId(jobId);
            eval.setQuestion(question);
            eval.setLanguage(language);
            eval.setCandidateCode(code);

            Optional<CodingEvaluation> existing = codingEvaluationRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
            existing.ifPresent(value -> eval.setId(value.getId()));

            return codingEvaluationRepository.save(eval);
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate code submission: " + e.getMessage(), e);
        }
    }

    // AGENT 6: Communication Assessment Agent
    public CommunicationAssessment runCommunicationAssessment(Long candidateId, Long interviewId) {
        List<InterviewQuestion> qasList = interviewQuestionRepository.findByInterviewId(interviewId);
        
        StringBuilder transcript = new StringBuilder();
        for (InterviewQuestion q : qasList) {
            transcript.append("Interviewer: ").append(q.getQuestion()).append("\n");
            transcript.append("Candidate: ").append(q.getCandidateAnswer()).append("\n\n");
        }

        String prompt = String.format(
            "You are the Communication Assessment Agent. Analyze the interview transcript to evaluate the candidate's communications skills.\n" +
            "Evaluate parameters: Grammar, Vocabulary, Confidence, Professional Tone, Sentence Structure, Clarity, Politeness, Fluency.\n\n" +
            "Transcript:\n%s\n" +
            "Return a JSON object with the following fields (DO NOT add any markdown formatting or extra text):\n" +
            "{\n" +
            "  \"grammarFeedback\": \"(string)\",\n" +
            "  \"vocabularyFeedback\": \"(string)\",\n" +
            "  \"confidenceFeedback\": \"(string)\",\n" +
            "  \"professionalToneFeedback\": \"(string)\",\n" +
            "  \"sentenceStructureFeedback\": \"(string)\",\n" +
            "  \"clarityFeedback\": \"(string)\",\n" +
            "  \"politenessFeedback\": \"(string)\",\n" +
            "  \"fluencyFeedback\": \"(string)\",\n" +
            "  \"communicationScore\": (integer 0-100)\n" +
            "}",
            transcript.toString()
        );

        String json = geminiService.generate(prompt);
        try {
            CommunicationAssessment assessment = objectMapper.readValue(json, CommunicationAssessment.class);
            assessment.setCandidateId(candidateId);

            Optional<CommunicationAssessment> existing = communicationAssessmentRepository.findFirstByCandidateIdOrderByIdDesc(candidateId);
            existing.ifPresent(value -> assessment.setId(value.getId()));

            return communicationAssessmentRepository.save(assessment);
        } catch (Exception e) {
            throw new RuntimeException("Failed to run communication assessment: " + e.getMessage(), e);
        }
    }

    // AGENT 7: Hiring Decision Agent
    public HiringDecision runHiringDecision(Long candidateId, Long jobId) {
        // Collect inputs from every agent
        Optional<ResumeScreening> resumeOpt = resumeScreeningRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
        Optional<JobMatching> matchingOpt = jobMatchingRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
        Optional<SkillGap> skillGapOpt = skillGapRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
        Optional<CodingEvaluation> codingOpt = codingEvaluationRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
        Optional<CommunicationAssessment> commOpt = communicationAssessmentRepository.findFirstByCandidateIdOrderByIdDesc(candidateId);
        
        List<Interview> interviews = interviewRepository.findByCandidateIdAndJobId(candidateId, jobId);
        Integer interviewScoreAvg = null;
        if (!interviews.isEmpty()) {
            interviewScoreAvg = interviews.get(0).getFinalScore();
        }

        String dataSummary = String.format(
            "RESUME SCREENING: Score=%d, Strengths=%s, Weaknesses=%s\n" +
            "JOB MATCHING: Percentage=%d, Reason=%s\n" +
            "SKILL GAP: Missing=%s, WeeksNeeded=%d\n" +
            "MOCK INTERVIEW: Score=%d\n" +
            "CODING EVALUATION: Score=%d, ComplexityTime=%s\n" +
            "COMMUNICATION ASSESSMENT: Score=%d, Tone=%s\n",
            resumeOpt.map(ResumeScreening::getResumeScore).orElse(0),
            resumeOpt.map(ResumeScreening::getStrengths).orElse("N/A"),
            resumeOpt.map(ResumeScreening::getWeaknesses).orElse("N/A"),
            matchingOpt.map(JobMatching::getMatchPercentage).orElse(0),
            matchingOpt.map(JobMatching::getReason).orElse("N/A"),
            skillGapOpt.map(SkillGap::getMissingSkills).orElse("N/A"),
            skillGapOpt.map(SkillGap::getEstimatedTimeWeeks).orElse(0),
            interviewScoreAvg != null ? interviewScoreAvg : 0,
            codingOpt.map(CodingEvaluation::getFinalScore).orElse(0),
            codingOpt.map(CodingEvaluation::getComplexityTime).orElse("N/A"),
            commOpt.map(CommunicationAssessment::getCommunicationScore).orElse(0),
            commOpt.map(CommunicationAssessment::getProfessionalToneFeedback).orElse("N/A")
        );

        String prompt = String.format(
            "You are the Hiring Decision Agent. Synthesize all assessments from our recruitment pipeline and make a final recommendation.\n" +
            "Decision options: STRONG_HIRE, HIRE, HOLD, NEED_IMPROVEMENT, REJECT.\n" +
            "Explain your reasoning based strictly on the aggregated data. Never recommend hiring without solid justification.\n\n" +
            "Assessment Reports:\n%s\n\n" +
            "Return a JSON object with the following fields (DO NOT add any markdown formatting or extra text):\n" +
            "{\n" +
            "  \"overallScore\": (integer 0-100),\n" +
            "  \"decision\": \"(STRONG_HIRE, HIRE, HOLD, NEED_IMPROVEMENT, or REJECT)\",\n" +
            "  \"reason\": \"(string detailed explainable reasoning)\",\n" +
            "  \"strengths\": \"(string consolidated list)\",\n" +
            "  \"weaknesses\": \"(string consolidated list)\",\n" +
            "  \"learningSuggestions\": \"(string clear future suggestions)\",\n" +
            "  \"confidenceScore\": (double 0-100)\n" +
            "}",
            dataSummary
        );

        String json = geminiService.generate(prompt);
        try {
            HiringDecision decision = objectMapper.readValue(json, HiringDecision.class);
            decision.setCandidateId(candidateId);
            decision.setJobId(jobId);

            Optional<HiringDecision> existing = hiringDecisionRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, jobId);
            existing.ifPresent(value -> decision.setId(value.getId()));

            return hiringDecisionRepository.save(decision);
        } catch (Exception e) {
            throw new RuntimeException("Failed to run hiring decision assessment: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> createMcq(int id, String category, String question, String[] options, String answer) {
        Map<String, Object> mcq = new HashMap<>();
        mcq.put("id", id);
        mcq.put("category", category);
        mcq.put("question", question);
        mcq.put("options", Arrays.asList(options));
        mcq.put("answer", answer);
        return mcq;
    }

    // AGENT 8: Aptitude Test Generation
    public AptitudeTest generateAptitudeQuestions(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        List<Map<String, Object>> qList = new ArrayList<>();
        List<Map<String, Object>> aptitudePool = new ArrayList<>();
        List<Map<String, Object>> reasoningPool = new ArrayList<>();
        List<Map<String, Object>> verbalPool = new ArrayList<>();
        List<Map<String, Object>> techPool = new ArrayList<>();

        // Add 25 Aptitude questions
        aptitudePool.add(createMcq(1, "Aptitude", "If a work is done by A in 10 days and B in 15 days, in how many days can they complete it together?", new String[]{"5 days", "6 days", "7 days", "8 days"}, "6 days"));
        aptitudePool.add(createMcq(2, "Aptitude", "A train 120m long passes a telegraph post in 6 seconds. Find the speed of the train in km/h.", new String[]{"60 km/h", "72 km/h", "80 km/h", "90 km/h"}, "72 km/h"));
        aptitudePool.add(createMcq(3, "Aptitude", "The average of 5 consecutive odd numbers is 25. What is the smallest number?", new String[]{"19", "21", "23", "25"}, "21"));
        aptitudePool.add(createMcq(4, "Aptitude", "A sum of money doubles itself in 8 years at simple interest. What is the rate of interest?", new String[]{"10%", "12%", "12.5%", "15%"}, "12.5%"));
        aptitudePool.add(createMcq(5, "Aptitude", "If the cost price of 15 articles is equal to the selling price of 12 articles, find the gain percentage.", new String[]{"20%", "25%", "30%", "33.3%"}, "25%"));
        aptitudePool.add(createMcq(6, "Aptitude", "Find the single discount equivalent to a series of discounts of 20% and 10%.", new String[]{"25%", "28%", "30%", "32%"}, "28%"));
        aptitudePool.add(createMcq(7, "Aptitude", "The ratio of present ages of two persons is 3:4. After 5 years, it becomes 4:5. Find their present ages.", new String[]{"12 and 16", "15 and 20", "18 and 24", "21 and 28"}, "15 and 20"));
        aptitudePool.add(createMcq(8, "Aptitude", "A card is drawn from a pack of 52 cards. What is the probability of getting a queen of club or a king of heart?", new String[]{"1/52", "2/52", "4/52", "8/52"}, "2/52"));
        aptitudePool.add(createMcq(9, "Aptitude", "A person crosses a 600m long street in 5 minutes. What is his speed in km/h?", new String[]{"3.6 km/h", "7.2 km/h", "8.4 km/h", "10 km/h"}, "7.2 km/h"));
        aptitudePool.add(createMcq(10, "Aptitude", "A boat goes 8 km downstream in 40 minutes and returns upstream in 1 hour. What is the speed of stream?", new String[]{"1 km/h", "2 km/h", "3 km/h", "4 km/h"}, "1 km/h"));
        aptitudePool.add(createMcq(11, "Aptitude", "If 20% of a = b, then b% of 20 is equal to:", new String[]{"4% of a", "5% of a", "20% of a", "None of these"}, "4% of a"));
        aptitudePool.add(createMcq(12, "Aptitude", "A sum of money at compound interest doubles itself in 15 years. It will become eight times of itself in:", new String[]{"30 years", "40 years", "45 years", "60 years"}, "45 years"));
        aptitudePool.add(createMcq(13, "Aptitude", "Find the compound interest on Rs. 10,000 for 2 years at 10% per annum, compounded annually.", new String[]{"Rs. 2,000", "Rs. 2,100", "Rs. 2,200", "Rs. 2,500"}, "Rs. 2,100"));
        aptitudePool.add(createMcq(14, "Aptitude", "A can run 22.5 m while B runs 25 m. In a kilometer race, B beats A by:", new String[]{"50 m", "100 m", "110 m", "125 m"}, "100 m"));
        aptitudePool.add(createMcq(15, "Aptitude", "How many seconds will a 150m long train take to cross a bridge of 250m long, if the speed of the train is 60 km/h?", new String[]{"20 seconds", "24 seconds", "30 seconds", "40 seconds"}, "24 seconds"));
        aptitudePool.add(createMcq(16, "Aptitude", "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:", new String[]{"Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"}, "Rs. 698"));
        aptitudePool.add(createMcq(17, "Aptitude", "The ratio of the area of a square to that of the circle inscribed in it is:", new String[]{"2 : pi", "4 : pi", "pi : 4", "None of these"}, "4 : pi"));
        aptitudePool.add(createMcq(18, "Aptitude", "A metallic sheet is of a rectangular shape with dimensions 48m x 36m. From each corner, a square of 8m is cut off. An open box is made of the remaining sheet. Find the volume.", new String[]{"4800 m^3", "5120 m^3", "5200 m^3", "None of these"}, "5120 m^3"));
        aptitudePool.add(createMcq(19, "Aptitude", "The price of petrol went up by 20%. By how much percent must a motorist reduce consumption so expenditure remains unchanged?", new String[]{"15%", "16.67%", "20%", "25%"}, "16.67%"));
        aptitudePool.add(createMcq(20, "Aptitude", "In how many different ways can the letters of the word 'LEADING' be arranged so vowels always come together?", new String[]{"360", "480", "720", "5040"}, "720"));
        aptitudePool.add(createMcq(21, "Aptitude", "Three unbiased coins are tossed. What is the probability of getting at least 2 heads?", new String[]{"1/4", "1/2", "3/8", "3/4"}, "1/2"));
        aptitudePool.add(createMcq(22, "Aptitude", "A pipe can fill a tank in 12 hours and another empty it in 18 hours. If both are opened, tank is filled in:", new String[]{"24 hours", "30 hours", "36 hours", "48 hours"}, "36 hours"));
        aptitudePool.add(createMcq(23, "Aptitude", "The period (in years) of simple/compound interest for Rs 30000 at 7% to become Rs 4347 is:", new String[]{"2 years", "2.5 years", "3 years", "4 years"}, "2 years"));
        aptitudePool.add(createMcq(24, "Aptitude", "A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?", new String[]{"3", "4", "5", "6"}, "5"));
        aptitudePool.add(createMcq(25, "Aptitude", "A man walks at 5 km/h and runs at 10 km/h. If he covers 15 km in 2 hours, how much distance did he walk?", new String[]{"5 km", "7.5 km", "10 km", "12 km"}, "5 km"));

        // Add 25 Reasoning questions
        reasoningPool.add(createMcq(26, "Reasoning", "Complete the series: 3, 5, 9, 17, 33, ...?", new String[]{"49", "55", "65", "73"}, "65"));
        reasoningPool.add(createMcq(27, "Reasoning", "If 'TIGER' is coded as 'SUHJFHDFQS', how is 'CAT' coded?", new String[]{"BDZBSU", "BDFGHI", "XYZABC", "None of these"}, "BDZBSU"));
        reasoningPool.add(createMcq(28, "Reasoning", "Introducing a man, a woman said, 'His wife is the only daughter of my father'. How is the man related to the woman?", new String[]{"Husband", "Brother", "Father-in-law", "Cousin"}, "Husband"));
        reasoningPool.add(createMcq(29, "Reasoning", "Choose the odd one out: Circle, Square, Sphere, Triangle.", new String[]{"Circle", "Square", "Sphere", "Triangle"}, "Sphere"));
        reasoningPool.add(createMcq(30, "Reasoning", "If '+' means 'x', '-' means '+', 'x' means '/' and '/' means '-', then: 15 + 3 x 5 / 2 - 4 = ?", new String[]{"9", "11", "13", "15"}, "11"));
        reasoningPool.add(createMcq(31, "Reasoning", "Point Q is 10m West of point P. Point R is 10m North of point Q. Where is R relative to P?", new String[]{"North-East", "North-West", "South-East", "South-West"}, "North-West"));
        reasoningPool.add(createMcq(32, "Reasoning", "A is taller than B, C is taller than A, D is taller than E but shorter than B. Who is the tallest?", new String[]{"A", "B", "C", "D"}, "C"));
        reasoningPool.add(createMcq(33, "Reasoning", "Complete the analogy: Book is to Publisher as Film is to ...?", new String[]{"Director", "Producer", "Actor", "Screenwriter"}, "Producer"));
        reasoningPool.add(createMcq(34, "Reasoning", "Which word cannot be formed from the letters of 'CONSTITUTION'?", new String[]{"COIN", "UNIT", "TUTOR", "STATION"}, "STATION"));
        reasoningPool.add(createMcq(35, "Reasoning", "If yesterday was Tuesday, what day will it be 10 days from today?", new String[]{"Friday", "Saturday", "Sunday", "Monday"}, "Saturday"));
        reasoningPool.add(createMcq(36, "Reasoning", "Identify the missing number: 4, 9, 20, 43, 90, ...?", new String[]{"180", "185", "190", "195"}, "185"));
        reasoningPool.add(createMcq(37, "Reasoning", "If 'RED' is coded as 360, what is the code for 'BLUE'?", new String[]{"180", "200", "240", "280"}, "240"));
        reasoningPool.add(createMcq(38, "Reasoning", "In a row of trees, one tree is 7th from either end of the row. How many trees are there in the row?", new String[]{"11", "13", "14", "15"}, "13"));
        reasoningPool.add(createMcq(39, "Reasoning", "Look at this series: U32, V29, __, X23, Y20. What should fill the blank?", new String[]{"W26", "W25", "V26", "X26"}, "W26"));
        reasoningPool.add(createMcq(40, "Reasoning", "If all tables are chairs and all chairs are benches, which of the following is true?", new String[]{"All tables are benches", "All benches are tables", "Some tables are not benches", "None of these"}, "All tables are benches"));
        reasoningPool.add(createMcq(41, "Reasoning", "If A is the brother of B; B is the sister of C; and C is the father of D, how is D related to A?", new String[]{"Brother", "Sister", "Nephew or Niece", "Uncle"}, "Nephew or Niece"));
        reasoningPool.add(createMcq(42, "Reasoning", "Statement: All flowers are trees. No tree is a plant. Conclusion I: No flower is a plant. Conclusion II: Some plants are flowers.", new String[]{"Only Conclusion I follows", "Only Conclusion II follows", "Both follow", "Neither follows"}, "Only Conclusion I follows"));
        reasoningPool.add(createMcq(43, "Reasoning", "Find the missing number in the box: 2, 4, 8; 3, 9, 27; 4, 16, ?", new String[]{"32", "48", "64", "80"}, "64"));
        reasoningPool.add(createMcq(44, "Reasoning", "If table is called chair, chair is called blackboard, blackboard is called duster, what does the teacher write on?", new String[]{"Chair", "Blackboard", "Duster", "Table"}, "Duster"));
        reasoningPool.add(createMcq(45, "Reasoning", "If 1st Jan 2007 was a Monday, what day of the week lies on 1st Jan 2008?", new String[]{"Monday", "Tuesday", "Wednesday", "Sunday"}, "Tuesday"));
        reasoningPool.add(createMcq(46, "Reasoning", "Which number should replace the question mark? 121, 144, 169, 196, ?", new String[]{"210", "220", "225", "256"}, "225"));
        reasoningPool.add(createMcq(47, "Reasoning", "If 'LIGHT' is coded as 'MJHIU', then 'DARK' is coded as:", new String[]{"EBSL", "CBSL", "EASL", "None of these"}, "EBSL"));
        reasoningPool.add(createMcq(48, "Reasoning", "A man faces North. He turns 45 degrees clockwise and then 180 degrees counter-clockwise. Which direction is he facing?", new String[]{"South-East", "South-West", "North-East", "North-West"}, "South-West"));
        reasoningPool.add(createMcq(49, "Reasoning", "Find the odd one out: 27, 64, 125, 144.", new String[]{"27", "64", "125", "144"}, "144"));
        reasoningPool.add(createMcq(50, "Reasoning", "If B is 50% taller than A, then A is how much shorter than B?", new String[]{"25%", "33.33%", "50%", "75%"}, "33.33%"));

        // Add 20 Verbal questions
        verbalPool.add(createMcq(51, "Verbal", "Choose the correct synonym of 'OBSTINATE'.", new String[]{"Flexible", "Stubborn", "Polite", "Gentle"}, "Stubborn"));
        verbalPool.add(createMcq(52, "Verbal", "Choose the correct antonym of 'TRANSITORY'.", new String[]{"Temporary", "Permanent", "Brief", "Rapid"}, "Permanent"));
        verbalPool.add(createMcq(53, "Verbal", "Complete the sentence: The committee ______ disagreed on the proposal.", new String[]{"have", "has", "were", "are"}, "has"));
        verbalPool.add(createMcq(54, "Verbal", "Identify the misspelled word:", new String[]{"Receive", "Belief", "Accomodate", "Calendar"}, "Accomodate"));
        verbalPool.add(createMcq(55, "Verbal", "Select the word that best fits: He is too ______ to be deceived by their flattery.", new String[]{"naive", "shrewd", "honest", "simple"}, "shrewd"));
        verbalPool.add(createMcq(56, "Verbal", "What is the meaning of the idiom 'Spill the beans'?", new String[]{"Waste food", "Reveal a secret", "Work hard", "Create trouble"}, "Reveal a secret"));
        verbalPool.add(createMcq(57, "Verbal", "Complete the analogy: Sound is to Cacophony as Smell is to ...?", new String[]{"Perfume", "Stench", "Aroma", "Flavor"}, "Stench"));
        verbalPool.add(createMcq(58, "Verbal", "Choose the grammatically correct sentence:", new String[]{"Neither of the two candidates was selected.", "Neither of the two candidates were selected.", "Neither of the two candidates has selected.", "Neither of the two candidates are selected."}, "Neither of the two candidates was selected."));
        verbalPool.add(createMcq(59, "Verbal", "Select the correct passive voice of: 'The chef prepared a delicious meal.'", new String[]{"A delicious meal was prepared by the chef.", "A delicious meal is prepared by the chef.", "A delicious meal had prepared by the chef.", "A delicious meal has prepared by the chef."}, "A delicious meal was prepared by the chef."));
        verbalPool.add(createMcq(60, "Verbal", "Choose the word that means 'a person who hates humanity'.", new String[]{"Philanthropist", "Misogynist", "Misanthrope", "Optimist"}, "Misanthrope"));
        verbalPool.add(createMcq(61, "Verbal", "Choose the word that is most nearly opposite in meaning to 'ABUNDANT'.", new String[]{"Plentiful", "Scarce", "Ample", "Generous"}, "Scarce"));
        verbalPool.add(createMcq(62, "Verbal", "Select the word that correctly completes: The new policy will ______ every employee.", new String[]{"effect", "affect", "affects", "effects"}, "affect"));
        verbalPool.add(createMcq(63, "Verbal", "Choose the correct spelling:", new String[]{"Commitment", "Comitment", "Committment", "Comittment"}, "Commitment"));
        verbalPool.add(createMcq(64, "Verbal", "What is the meaning of the idiom 'Burn the midnight oil'?", new String[]{"Waste fuel", "Work late into the night", "Wake up early", "None of these"}, "Work late into the night"));
        verbalPool.add(createMcq(65, "Verbal", "Identify the word that means 'one who walks in sleep'.", new String[]{"Somnambulist", "Soporific", "Egoist", "Altruist"}, "Somnambulist"));
        verbalPool.add(createMcq(66, "Verbal", "Choose the correct preposition: She is proficient ______ English.", new String[]{"in", "at", "with", "for"}, "in"));
        verbalPool.add(createMcq(67, "Verbal", "Select the correct active voice of: 'The target was achieved by the team.'", new String[]{"The team achieved the target.", "The team has achieved the target.", "The team was achieving the target.", "None of these"}, "The team achieved the target."));
        verbalPool.add(createMcq(68, "Verbal", "Find the synonym of 'INDOLENT'.", new String[]{"Active", "Lazy", "Energetic", "Industrious"}, "Lazy"));
        verbalPool.add(createMcq(69, "Verbal", "Fill in the blank: Neither John nor his friends ______ present at the party.", new String[]{"was", "were", "is", "has been"}, "were"));
        verbalPool.add(createMcq(70, "Verbal", "What is the study of word origins called?", new String[]{"Entomology", "Etymology", "Ecology", "Philology"}, "Etymology"));

        // Add 15 Technical questions based on stack
        String skillsLower = candidate.getSkills() != null ? candidate.getSkills().toLowerCase() : "";
        if (skillsLower.contains("java")) {
            techPool.add(createMcq(71, "Technical", "Which of these is not a feature of Java?", new String[]{"Object Oriented", "Platform Independent", "Use of pointers", "Multi-threaded"}, "Use of pointers"));
            techPool.add(createMcq(72, "Technical", "What is the size of double variable in Java?", new String[]{"2 bytes", "4 bytes", "8 bytes", "16 bytes"}, "8 bytes"));
            techPool.add(createMcq(73, "Technical", "Which keyword is used to prevent method overriding in Java?", new String[]{"static", "final", "abstract", "private"}, "final"));
            techPool.add(createMcq(74, "Technical", "Which package contains the Random class?", new String[]{"java.io", "java.lang", "java.util", "java.awt"}, "java.util"));
            techPool.add(createMcq(75, "Technical", "What is the root class of the Java Class Hierarchy?", new String[]{"Class", "Object", "System", "String"}, "Object"));
            techPool.add(createMcq(76, "Technical", "Which of these is a checked exception in Java?", new String[]{"NullPointerException", "ArithmeticException", "IOException", "ArrayIndexOutOfBoundsException"}, "IOException"));
            techPool.add(createMcq(77, "Technical", "Which method is used to start a thread execution?", new String[]{"run()", "start()", "execute()", "init()"}, "start()"));
            techPool.add(createMcq(78, "Technical", "Which collection class allows unique elements and maintains insertion order?", new String[]{"HashSet", "LinkedHashSet", "TreeSet", "ArrayList"}, "LinkedHashSet"));
            techPool.add(createMcq(79, "Technical", "What does JVM stand for?", new String[]{"Java Virtual Machine", "Java Variable Method", "Joint Vector Machine", "Java Version Manager"}, "Java Virtual Machine"));
            techPool.add(createMcq(80, "Technical", "Which garbage collector is the default in Java 9+?", new String[]{"Serial GC", "Parallel GC", "G1 GC", "ZGC"}, "G1 GC"));
            techPool.add(createMcq(81, "Technical", "Which of these is not a loop control statement in Java?", new String[]{"break", "continue", "exit", "return"}, "exit"));
            techPool.add(createMcq(82, "Technical", "Which collection class is synchronized in Java?", new String[]{"ArrayList", "LinkedList", "Vector", "HashSet"}, "Vector"));
            techPool.add(createMcq(83, "Technical", "What is the default value of local variables in Java?", new String[]{"0", "null", "false", "Not initialized"}, "Not initialized"));
            techPool.add(createMcq(84, "Technical", "Which method is used to compare two String objects for value equality?", new String[]{"compare()", "equals()", "==", "compareTo()"}, "equals()"));
            techPool.add(createMcq(85, "Technical", "Which keyword prevents a class from being inherited?", new String[]{"static", "final", "private", "abstract"}, "final"));
        } else if (skillsLower.contains("react") || skillsLower.contains("javascript") || skillsLower.contains("web") || skillsLower.contains("html") || skillsLower.contains("css")) {
            techPool.add(createMcq(71, "Technical", "Which hook is used to perform side effects in React functional components?", new String[]{"useState", "useEffect", "useContext", "useReducer"}, "useEffect"));
            techPool.add(createMcq(72, "Technical", "What is React's Virtual DOM?", new String[]{"A direct copy of the real DOM", "An in-memory representation of the real DOM", "A HTML parser", "A browser extension"}, "An in-memory representation of the real DOM"));
            techPool.add(createMcq(73, "Technical", "What does JSX stand for?", new String[]{"JavaScript XML", "JavaScript Extension", "JSON XML", "Java Syntax Extension"}, "JavaScript XML"));
            techPool.add(createMcq(74, "Technical", "Which operator is used to check both value and type in JavaScript?", new String[]{"==", "===", "=", "!="}, "==="));
            techPool.add(createMcq(75, "Technical", "How do you pass data from a parent component to a child component in React?", new String[]{"State", "Props", "Context", "Redux"}, "Props"));
            techPool.add(createMcq(76, "Technical", "What is the purpose of keys in React list rendering?", new String[]{"To uniquely identify elements and optimize rendering", "To apply styling to list items", "To bind event handlers", "To index elements in local storage"}, "To uniquely identify elements and optimize rendering"));
            techPool.add(createMcq(77, "Technical", "Which state manager is officially recommended by the Redux team?", new String[]{"MobX", "Redux Toolkit", "Zustand", "Recoil"}, "Redux Toolkit"));
            techPool.add(createMcq(78, "Technical", "What is the output of typeof null in JavaScript?", new String[]{"null", "undefined", "object", "string"}, "object"));
            techPool.add(createMcq(79, "Technical", "Which method is used to fetch data asynchronously in modern JS?", new String[]{"fetch()", "get()", "xml()", "request()"}, "fetch()"));
            techPool.add(createMcq(80, "Technical", "What is the purpose of React.memo?", new String[]{"To store component variables in local storage", "To memoize functional components and prevent unnecessary re-renders", "To log rendering performance metrics", "To handle error boundaries"}, "To memoize functional components and prevent unnecessary re-renders"));
            techPool.add(createMcq(81, "Technical", "What is the default port used by Vite for development server?", new String[]{"3000", "5000", "8080", "5173"}, "5173"));
            techPool.add(createMcq(82, "Technical", "Which hook returns a stateful value and a function to update it?", new String[]{"useEffect", "useState", "useRef", "useMemo"}, "useState"));
            techPool.add(createMcq(83, "Technical", "Which is used to handle multiple states transition in React functional component?", new String[]{"useCallback", "useReducer", "useRef", "useMemo"}, "useReducer"));
            techPool.add(createMcq(84, "Technical", "What is the purpose of React Router?", new String[]{"To connect to backend databases", "To enable navigation between different views in a SPA", "To build responsive grids", "None of these"}, "To enable navigation between different views in a SPA"));
            techPool.add(createMcq(85, "Technical", "What are the rules of React Hooks?", new String[]{"Call hooks anywhere", "Call hooks only at the top level and only from React functions", "Call hooks inside loops", "None of these"}, "Call hooks only at the top level and only from React functions"));
        } else {
            techPool.add(createMcq(71, "Technical", "What is the time complexity of searching in a Hash Map in the average case?", new String[]{"O(1)", "O(log n)", "O(n)", "O(n log n)"}, "O(1)"));
            techPool.add(createMcq(72, "Technical", "Which SQL clause is used to filter records in a group?", new String[]{"WHERE", "HAVING", "GROUP BY", "ORDER BY"}, "HAVING"));
            techPool.add(createMcq(73, "Technical", "Which protocol operates at the Application Layer of the OSI Model?", new String[]{"TCP", "IP", "HTTP", "UDP"}, "HTTP"));
            techPool.add(createMcq(74, "Technical", "Which data structure operates on a Last In, First Out (LIFO) basis?", new String[]{"Queue", "Stack", "Linked List", "Tree"}, "Stack"));
            techPool.add(createMcq(75, "Technical", "What does SQL stand for?", new String[]{"Simple Query Language", "Structured Query Language", "Sequential Query Language", "Secure Query Language"}, "Structured Query Language"));
            techPool.add(createMcq(76, "Technical", "Which gate is called the universal gate?", new String[]{"AND", "OR", "NAND", "XOR"}, "NAND"));
            techPool.add(createMcq(77, "Technical", "What is the primary function of an Operating System kernel?", new String[]{"File compression", "Manage system resources and hardware communication", "Virus scanning", "Render web pages"}, "Manage system resources and hardware communication"));
            techPool.add(createMcq(78, "Technical", "Which HTTP status code represents a successful resource creation?", new String[]{"200 OK", "201 Created", "204 No Content", "400 Bad Request"}, "201 Created"));
            techPool.add(createMcq(79, "Technical", "What is a deadlock in operating systems?", new String[]{"A crash in the browser", "A state where a set of processes are blocked because each holds a resource the other needs", "An infinite loop in a script", "A memory leak"}, "A state where a set of processes are blocked because each holds a resource the other needs"));
            techPool.add(createMcq(80, "Technical", "Which SQL join returns all rows from the left table and matched rows from the right table?", new String[]{"INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN"}, "LEFT JOIN"));
            techPool.add(createMcq(81, "Technical", "Which sorting algorithm has a worst-case time complexity of O(n log n)?", new String[]{"Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"}, "Merge Sort"));
            techPool.add(createMcq(82, "Technical", "Which SQL keyword is used to sort the result-set?", new String[]{"SORT BY", "ORDER BY", "GROUP BY", "ARRANGE"}, "ORDER BY"));
            techPool.add(createMcq(83, "Technical", "Which protocol is connection-oriented at the Transport Layer?", new String[]{"UDP", "TCP", "HTTP", "DNS"}, "TCP"));
            techPool.add(createMcq(84, "Technical", "What does CSS stand for?", new String[]{"Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "None of these"}, "Cascading Style Sheets"));
            techPool.add(createMcq(85, "Technical", "What is the binary equivalent of decimal number 10?", new String[]{"1001", "1010", "1100", "1111"}, "1010"));
        }

        // Shuffle pools to ensure they vary every time!
        Collections.shuffle(aptitudePool);
        Collections.shuffle(reasoningPool);
        Collections.shuffle(verbalPool);
        Collections.shuffle(techPool);

        // Select and re-index sequentially (1 to 50)
        int currentId = 1;
        for (int i = 0; i < 15; i++) {
            Map<String, Object> q = aptitudePool.get(i);
            q.put("id", currentId++);
            qList.add(q);
        }
        for (int i = 0; i < 15; i++) {
            Map<String, Object> q = reasoningPool.get(i);
            q.put("id", currentId++);
            qList.add(q);
        }
        for (int i = 0; i < 10; i++) {
            Map<String, Object> q = verbalPool.get(i);
            q.put("id", currentId++);
            qList.add(q);
        }
        for (int i = 0; i < 10; i++) {
            Map<String, Object> q = techPool.get(i);
            q.put("id", currentId++);
            qList.add(q);
        }

        try {
            String questionsJson = objectMapper.writeValueAsString(qList);
            
            AptitudeTest test = new AptitudeTest();
            test.setCandidateId(candidateId);
            test.setQuestionsJson(questionsJson);

            Optional<AptitudeTest> existing = aptitudeTestRepository.findFirstByCandidateIdOrderByIdDesc(candidateId);
            existing.ifPresent(value -> {
                test.setId(value.getId());
                test.setAnswersJson(value.getAnswersJson());
                test.setFinalScore(value.getFinalScore());
                test.setFeedback(value.getFeedback());
            });

            return aptitudeTestRepository.save(test);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate aptitude questions: " + e.getMessage(), e);
        }
    }

    // AGENT 8: Aptitude Test Evaluation
    public AptitudeTest evaluateAptitudeAnswers(Long candidateId, Map<String, String> candidateAnswers) {
        AptitudeTest test = aptitudeTestRepository.findFirstByCandidateIdOrderByIdDesc(candidateId)
                .orElseThrow(() -> new RuntimeException("Aptitude test not initialized for this candidate"));

        try {
            String questionsJson = test.getQuestionsJson();
            List<Map<String, Object>> questions = objectMapper.readValue(questionsJson, new TypeReference<List<Map<String, Object>>>() {});
            
            int correctCount = 0;
            int total = questions.size();
            for (Map<String, Object> q : questions) {
                String idStr = String.valueOf(q.get("id"));
                String correctAnswer = (String) q.get("answer");
                String candidateAnswer = candidateAnswers.get(idStr);

                if (candidateAnswer != null && candidateAnswer.trim().equalsIgnoreCase(correctAnswer.trim())) {
                    correctCount++;
                }
            }

            int score = (correctCount * 100) / total;
            test.setFinalScore(score);
            test.setAnswersJson(objectMapper.writeValueAsString(candidateAnswers));
            test.setFeedback(String.format("Candidate answered %d out of %d questions correctly. Average score: %d%%.", correctCount, total, score));

            AptitudeTest saved = aptitudeTestRepository.save(test);

            // AUTO PREDICT & AUTO PROGRESS TO NEXT ROUND (Communication MCQ Round)
            Candidate candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new RuntimeException("Candidate not found"));
            if (saved.getFinalScore() >= 60) {
                candidate.setCurrentRound("ROUND_3_COMMUNICATION");
            } else {
                candidate.setCurrentRound("REJECTED");
            }
            candidateRepository.save(candidate);

            return saved;
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate aptitude answers: " + e.getMessage(), e);
        }
    }

    // AGENT 9: Communication MCQ Generation
    public CommunicationTest generateCommunicationQuestions(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        List<Map<String, Object>> qList = new ArrayList<>();
        List<Map<String, Object>> vocabPool = new ArrayList<>();
        List<Map<String, Object>> grammarPool = new ArrayList<>();
        List<Map<String, Object>> compPool = new ArrayList<>();

        // Add 15 Vocabulary questions
        vocabPool.add(createMcq(1, "Vocabulary", "Choose the synonym of 'OMNIPRESENT'.", new String[]{"Scattered", "Ubiquitous", "Invisible", "Transient"}, "Ubiquitous"));
        vocabPool.add(createMcq(2, "Vocabulary", "Choose the antonym of 'EPHEMERAL'.", new String[]{"Short-lived", "Eternal", "Frail", "Mysterious"}, "Eternal"));
        vocabPool.add(createMcq(3, "Vocabulary", "What is the meaning of the word 'PRAGMATIC'?", new String[]{"Theoretical", "Practical", "Stubborn", "Artistic"}, "Practical"));
        vocabPool.add(createMcq(4, "Vocabulary", "Select the word that means 'fluent or persuasive in speaking or writing'.", new String[]{"Eloquent", "Hesitant", "Loud", "Verbose"}, "Eloquent"));
        vocabPool.add(createMcq(5, "Vocabulary", "Choose the synonym of 'MITIGATE'.", new String[]{"Aggravate", "Alleviate", "Determine", "Exaggerate"}, "Alleviate"));
        vocabPool.add(createMcq(6, "Vocabulary", "Find the synonym of 'CAPRICIOUS'.", new String[]{"Stable", "Unpredictable", "Calm", "Decisive"}, "Unpredictable"));
        vocabPool.add(createMcq(7, "Vocabulary", "Choose the antonym of 'LOQUACIOUS'.", new String[]{"Talkative", "Taciturn", "Energetic", "Friendly"}, "Taciturn"));
        vocabPool.add(createMcq(8, "Vocabulary", "What does the word 'BENEVOLENT' mean?", new String[]{"Malevolent", "Kindhearted", "Avaricious", "Greedy"}, "Kindhearted"));
        vocabPool.add(createMcq(9, "Vocabulary", "Find the synonym of 'METICULOUS'.", new String[]{"Careless", "Precise", "Messy", "Slow"}, "Precise"));
        vocabPool.add(createMcq(10, "Vocabulary", "Choose the antonym of 'AUDACIOUS'.", new String[]{"Bold", "Timid", "Cruel", "Silly"}, "Timid"));
        vocabPool.add(createMcq(11, "Vocabulary", "Choose the synonym of 'VOCIFEROUS'.", new String[]{"Quiet", "Clamorous", "Soft", "Shy"}, "Clamorous"));
        vocabPool.add(createMcq(12, "Vocabulary", "Choose the antonym of 'RETICENT'.", new String[]{"Silent", "Talkative", "Secretive", "Reserved"}, "Talkative"));
        vocabPool.add(createMcq(13, "Vocabulary", "What is the meaning of 'APATHETIC'?", new String[]{"Passionate", "Uninterested", "Enthusiastic", "Anxious"}, "Uninterested"));
        vocabPool.add(createMcq(14, "Vocabulary", "Find the synonym of 'PERSPICACIOUS'.", new String[]{"Dull", "Insightful", "Ignorant", "Stupid"}, "Insightful"));
        vocabPool.add(createMcq(15, "Vocabulary", "Choose the antonym of 'GARRULOUS'.", new String[]{"Verbose", "Taciturn", "Friendly", "Loud"}, "Taciturn"));

        // Add 15 Grammar questions
        grammarPool.add(createMcq(16, "Grammar", "Which of the following sentences is grammatically correct?", new String[]{"Each of the students have a book.", "Each of the students has a book.", "Every students has a book.", "None of these"}, "Each of the students has a book."));
        grammarPool.add(createMcq(17, "Grammar", "Fill in the blank: If I ______ you, I would accept the job offer.", new String[]{"was", "were", "am", "had been"}, "were"));
        grammarPool.add(createMcq(18, "Grammar", "Identify the error in: 'She has been working here since three years.'", new String[]{"She has", "been working", "here", "since three years"}, "since three years"));
        grammarPool.add(createMcq(19, "Grammar", "Choose the correct preposition: He is married ______ a doctor.", new String[]{"with", "to", "by", "of"}, "to"));
        grammarPool.add(createMcq(20, "Grammar", "Select the correct passive voice: 'They are building a new house.'", new String[]{"A new house was built by them.", "A new house is being built by them.", "A new house has been built.", "None of these"}, "A new house is being built by them."));
        grammarPool.add(createMcq(21, "Grammar", "Fill in the blank: Neither the teacher nor the students ______ present.", new String[]{"was", "were", "is", "has been"}, "were"));
        grammarPool.add(createMcq(22, "Grammar", "Identify the correct conjunction: She worked hard ______ she could pass the exam.", new String[]{"so that", "because", "although", "but"}, "so that"));
        grammarPool.add(createMcq(23, "Grammar", "Choose the correct form: By next Monday, we ______ the project.", new String[]{"completed", "will complete", "will have completed", "would complete"}, "will have completed"));
        grammarPool.add(createMcq(24, "Grammar", "Identify the part of speech of the bold word: She ran **fast**.", new String[]{"Adjective", "Adverb", "Noun", "Verb"}, "Adverb"));
        grammarPool.add(createMcq(25, "Grammar", "Choose the correct sentence:", new String[]{"He is one of those men who never tells a lie.", "He is one of those men who never tell a lie.", "He is one of those man who never tell a lie.", "None of these"}, "He is one of those men who never tell a lie."));
        grammarPool.add(createMcq(26, "Grammar", "Choose the correct conditional sentence:", new String[]{"If it will rain, we cancel the match.", "If it rains, we will cancel the match.", "If it would rain, we would have cancelled.", "None of these"}, "If it rains, we will cancel the match."));
        grammarPool.add(createMcq(27, "Grammar", "Fill in the blank: He is ______ honorable man.", new String[]{"a", "an", "the", "no article"}, "an"));
        grammarPool.add(createMcq(28, "Grammar", "Choose the correct pronoun: Between you and ______, I think he is lying.", new String[]{"I", "me", "myself", "we"}, "me"));
        grammarPool.add(createMcq(29, "Grammar", "Identify the tense: 'I have been reading this book since morning.'", new String[]{"Present Perfect", "Present Perfect Continuous", "Past Continuous", "Past Perfect"}, "Present Perfect Continuous"));
        grammarPool.add(createMcq(30, "Grammar", "Choose the correct tag question: You are coming with us, ______?", new String[]{"isn't it", "aren't you", "don't you", "won't you"}, "aren't you"));

        // Add 15 Reading Comprehension / Other questions
        compPool.add(createMcq(31, "Comprehension", "Choose the word that is spelled correctly:", new String[]{"Maintainance", "Maintenance", "Maintenence", "Maintainence"}, "Maintenance"));
        compPool.add(createMcq(32, "Comprehension", "What does the idiom 'Bite the bullet' mean?", new String[]{"Eat something hard", "Face a difficult situation with courage", "Express anger", "None of these"}, "Face a difficult situation with courage"));
        compPool.add(createMcq(33, "Comprehension", "What does the idiom 'Under the weather' mean?", new String[]{"Feeling slightly unwell", "Stuck in a storm", "Depressed", "Happy"}, "Feeling slightly unwell"));
        compPool.add(createMcq(34, "Comprehension", "Identify the option that correctly replaces the phrase in bold: **To tell you the truth**, I don't like his behavior.", new String[]{"To be honest", "Frankly speaking", "Truthfully told", "None of these"}, "Frankly speaking"));
        compPool.add(createMcq(35, "Comprehension", "What is the meaning of the suffix '-phobia'?", new String[]{"Love", "Fear", "Study of", "Hate"}, "Fear"));
        compPool.add(createMcq(36, "Comprehension", "Complete the analogy: Cold is to Ice as Heat is to ______.", new String[]{"Water", "Steam", "Sun", "Temperature"}, "Steam"));
        compPool.add(createMcq(37, "Comprehension", "What is the meaning of the idiom 'Blessing in disguise'?", new String[]{"A secret gift", "A good thing that seemed bad at first", "A curse", "None of these"}, "A good thing that seemed bad at first"));
        compPool.add(createMcq(38, "Comprehension", "Which word means 'a statement that seems self-contradictory but may be true'?", new String[]{"Paradox", "Oxymoron", "Metaphor", "Simile"}, "Paradox"));
        compPool.add(createMcq(39, "Comprehension", "Choose the correct spelling:", new String[]{"Occurence", "Ocurrence", "Occurrence", "Occurrance"}, "Occurrence"));
        compPool.add(createMcq(40, "Comprehension", "Complete the analogy: Doctor is to Patient as Teacher is to ______.", new String[]{"Classroom", "Student", "School", "Lesson"}, "Student"));
        compPool.add(createMcq(41, "Comprehension", "What does the idiom 'Cry over spilled milk' mean?", new String[]{"Complain about food waste", "Worry about past mistakes that cannot be undone", "Cry for help", "None of these"}, "Worry about past mistakes that cannot be undone"));
        compPool.add(createMcq(42, "Comprehension", "Choose the correct spelling:", new String[]{"Heirarchy", "Hierarchy", "Hierarcy", "Heirarcy"}, "Hierarchy"));
        compPool.add(createMcq(43, "Comprehension", "What does the phrase 'Ad hoc' mean?", new String[]{"In progress", "For a specific purpose", "To the point", "None of these"}, "For a specific purpose"));
        compPool.add(createMcq(44, "Comprehension", "What does the idiom 'Piece of cake' mean?", new String[]{"A delicious dessert", "A very easy task", "A small portion", "None of these"}, "A very easy task"));
        compPool.add(createMcq(45, "Comprehension", "Choose the correct spelling:", new String[]{"Liaison", "Liason", "Liasion", "Liaisonne"}, "Liaison"));

        // Shuffle pools to make them varied
        Collections.shuffle(vocabPool);
        Collections.shuffle(grammarPool);
        Collections.shuffle(compPool);

        // Select and re-index sequentially (1 to 30)
        int currentId = 1;
        for (int i = 0; i < 10; i++) {
            Map<String, Object> q = vocabPool.get(i);
            q.put("id", currentId++);
            qList.add(q);
        }
        for (int i = 0; i < 10; i++) {
            Map<String, Object> q = grammarPool.get(i);
            q.put("id", currentId++);
            qList.add(q);
        }
        for (int i = 0; i < 10; i++) {
            Map<String, Object> q = compPool.get(i);
            q.put("id", currentId++);
            qList.add(q);
        }

        try {
            String questionsJson = objectMapper.writeValueAsString(qList);
            
            CommunicationTest test = new CommunicationTest();
            test.setCandidateId(candidateId);
            test.setQuestionsJson(questionsJson);

            Optional<CommunicationTest> existing = communicationTestRepository.findFirstByCandidateIdOrderByIdDesc(candidateId);
            existing.ifPresent(value -> {
                test.setId(value.getId());
                test.setAnswersJson(value.getAnswersJson());
                test.setFinalScore(value.getFinalScore());
                test.setFeedback(value.getFeedback());
            });

            return communicationTestRepository.save(test);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate communication questions: " + e.getMessage(), e);
        }
    }

    // AGENT 9: Communication MCQ Evaluation
    public CommunicationTest evaluateCommunicationAnswers(Long candidateId, Map<String, String> candidateAnswers) {
        CommunicationTest test = communicationTestRepository.findFirstByCandidateIdOrderByIdDesc(candidateId)
                .orElseThrow(() -> new RuntimeException("Communication test not initialized for this candidate"));

        try {
            String questionsJson = test.getQuestionsJson();
            List<Map<String, Object>> questions = objectMapper.readValue(questionsJson, new TypeReference<List<Map<String, Object>>>() {});
            
            int correctCount = 0;
            int total = questions.size();
            for (Map<String, Object> q : questions) {
                String idStr = String.valueOf(q.get("id"));
                String correctAnswer = (String) q.get("answer");
                String candidateAnswer = candidateAnswers.get(idStr);

                if (candidateAnswer != null && candidateAnswer.trim().equalsIgnoreCase(correctAnswer.trim())) {
                    correctCount++;
                }
            }

            int score = (correctCount * 100) / total;
            test.setFinalScore(score);
            test.setAnswersJson(objectMapper.writeValueAsString(candidateAnswers));
            test.setFeedback(String.format("Candidate answered %d out of %d questions correctly. Average score: %d%%.", correctCount, total, score));

            CommunicationTest saved = communicationTestRepository.save(test);

            // AUTO PREDICT & AUTO PROGRESS TO NEXT ROUND (Coding)
            Candidate candidate = candidateRepository.findById(candidateId)
                    .orElseThrow(() -> new RuntimeException("Candidate not found"));
            if (saved.getFinalScore() >= 60) {
                candidate.setCurrentRound("ROUND_4_CODING");
            } else {
                candidate.setCurrentRound("REJECTED");
            }
            candidateRepository.save(candidate);

            return saved;
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate communication answers: " + e.getMessage(), e);
        }
    }
}
