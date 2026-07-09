package com.hiregen.controller;

import com.hiregen.model.*;
import com.hiregen.repository.*;
import com.hiregen.service.GeminiAgentService;
import com.hiregen.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RecruitmentController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private InterviewQuestionRepository interviewQuestionRepository;

    @Autowired
    private ResumeScreeningRepository resumeScreeningRepository;

    @Autowired
    private JobMatchingRepository jobMatchingRepository;

    @Autowired
    private SkillGapRepository skillGapRepository;

    @Autowired
    private CodingEvaluationRepository codingEvaluationRepository;

    @Autowired
    private CommunicationAssessmentRepository communicationAssessmentRepository;

    @Autowired
    private HiringDecisionRepository hiringDecisionRepository;

    @Autowired
    private GeminiAgentService geminiAgentService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private AptitudeTestRepository aptitudeTestRepository;

    @Autowired
    private CommunicationTestRepository communicationTestRepository;

    // Jobs endpoints
    @GetMapping("/jobs")
    public List<Job> getJobs() {
        return jobRepository.findAll();
    }

    @PostMapping("/jobs")
    public Job createJob(@RequestBody Job job) {
        return jobRepository.save(job);
    }

    // Candidate endpoints
    @GetMapping("/candidates")
    public List<Candidate> getCandidates() {
        return candidateRepository.findAll();
    }

    @PostMapping("/candidates/register")
    public ResponseEntity<?> registerCandidate(@RequestBody Candidate candidateInput) {
        Optional<Candidate> existingCandidate = candidateRepository.findByEmail(candidateInput.getEmail());
        if (existingCandidate.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email address already registered."));
        }
        Candidate candidate = new Candidate();
        candidate.setName(candidateInput.getName());
        candidate.setEmail(candidateInput.getEmail());
        candidate.setPhone(candidateInput.getPhone());
        candidate.setEducation(candidateInput.getEducation());
        candidate.setCgpa(candidateInput.getCgpa());
        candidate.setExperienceSummary(candidateInput.getExperienceSummary());
        candidate.setSkills(candidateInput.getSkills());
        candidate.setProjects(candidateInput.getProjects());
        candidate.setAchievements(candidateInput.getAchievements());
        candidate.setLanguages(candidateInput.getLanguages());
        candidate.setCurrentRound("ROUND_1_RESUME");
        candidate.setPassword(candidateInput.getPassword());
        candidate = candidateRepository.save(candidate);

        return ResponseEntity.ok(candidate);
    }

    @PostMapping(value = "/candidates/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadCandidateAndTriggerScreening(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String jobTitle,
            @ModelAttribute Candidate candidateInput,
            @RequestParam(value = "resumeFile", required = false) MultipartFile resumeFile) {
        
        String fileName = null;
        if (resumeFile != null && !resumeFile.isEmpty()) {
            try {
                fileName = System.currentTimeMillis() + "_" + resumeFile.getOriginalFilename();
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
                if (!java.nio.file.Files.exists(uploadPath)) {
                    java.nio.file.Files.createDirectories(uploadPath);
                }
                java.nio.file.Files.copy(resumeFile.getInputStream(), uploadPath.resolve(fileName), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                System.err.println("Failed to save resume file: " + e.getMessage());
            }
        }
        
        Long finalJobId = jobId;
        if ((finalJobId == null || finalJobId == 0) && jobTitle != null && !jobTitle.trim().isEmpty()) {
            List<Job> matchedJobs = jobRepository.findAll().stream()
                    .filter(j -> j.getTitle().equalsIgnoreCase(jobTitle.trim()))
                    .toList();
            if (!matchedJobs.isEmpty()) {
                finalJobId = matchedJobs.get(0).getId();
            } else {
                Job newJob = new Job(
                    jobTitle.trim(), 
                    "TechCorp Partner", 
                    "Dynamic job description generated automatically for " + jobTitle.trim(), 
                    "Required background in " + candidateInput.getSkills(), 
                    candidateInput.getSkills(), 
                    2
                );
                newJob = jobRepository.save(newJob);
                finalJobId = newJob.getId();
            }
        } else if (finalJobId == null || finalJobId == 0) {
            List<Job> allJobs = jobRepository.findAll();
            finalJobId = !allJobs.isEmpty() ? allJobs.get(0).getId() : 1L;
        }

        // Save or update Candidate
        Optional<Candidate> existingCandidate = candidateRepository.findByEmail(candidateInput.getEmail());
        Candidate candidate = existingCandidate.orElseGet(Candidate::new);
        candidate.setName(candidateInput.getName());
        candidate.setEmail(candidateInput.getEmail());
        candidate.setPhone(candidateInput.getPhone());
        candidate.setEducation(candidateInput.getEducation());
        candidate.setCgpa(candidateInput.getCgpa());
        candidate.setExperienceSummary(candidateInput.getExperienceSummary());
        candidate.setSkills(candidateInput.getSkills());
        candidate.setProjects(candidateInput.getProjects());
        candidate.setAchievements(candidateInput.getAchievements());
        candidate.setLanguages(candidateInput.getLanguages());
        if (fileName != null) {
            candidate.setResumeFileName(fileName);
        }

        // Check if no resume file was uploaded
        if (candidate.getResumeFileName() == null || candidate.getResumeFileName().trim().isEmpty()) {
            candidate.setCurrentRound("REJECTED");
            candidate = candidateRepository.save(candidate);

            ResumeScreening screening = new ResumeScreening();
            screening.setCandidateId(candidate.getId());
            screening.setJobId(finalJobId);
            screening.setResumeScore(0);
            screening.setAtsScore(0);
            screening.setStrengths("None");
            screening.setWeaknesses("No resume file uploaded.");
            screening.setImprovementSuggestions("Please upload a valid resume PDF/Word file.");
            screening.setRecommendation("REJECT");
            resumeScreeningRepository.save(screening);

            JobMatching matching = new JobMatching();
            matching.setCandidateId(candidate.getId());
            matching.setJobId(finalJobId);
            matching.setMatchPercentage(0);
            matching.setReason("No resume file was uploaded by the candidate.");
            matching.setConfidenceScore(0.0);
            jobMatchingRepository.save(matching);

            SkillGap gap = new SkillGap();
            gap.setCandidateId(candidate.getId());
            gap.setJobId(finalJobId);
            gap.setCurrentSkills("None");
            gap.setMissingSkills("All");
            gap.setPriorityOrder("N/A");
            gap.setWeeklyLearningPlan("N/A");
            gap.setRecommendedProjects("N/A");
            skillGapRepository.save(gap);

            Map<String, Object> response = new HashMap<>();
            response.put("candidate", candidate);
            response.put("resumeScreening", screening);
            response.put("jobMatching", matching);
            response.put("skillGap", gap);
            return ResponseEntity.ok(response);
        }

        candidate.setCurrentRound("ROUND_1_COMPLETED");
        candidate = candidateRepository.save(candidate);

        // Run Workflow Step 2: Resume Screening (Agent 1)
        ResumeScreening screening = geminiAgentService.runResumeScreening(candidate.getId(), finalJobId);

        // Run Workflow Step 3: Candidate Matching (Agent 2)
        JobMatching matching = geminiAgentService.runJobMatching(candidate.getId(), finalJobId);

        // Run Workflow Step 4: Skill Gap (Agent 3)
        SkillGap gap = geminiAgentService.runSkillGap(candidate.getId(), finalJobId);

        // Auto-predict and advance to next round
        if (matching.getMatchPercentage() != null && matching.getMatchPercentage() >= 60) {
            candidate.setCurrentRound("ROUND_3_APTITUDE");
        } else {
            candidate.setCurrentRound("REJECTED");
        }
        candidate = candidateRepository.save(candidate);

        Map<String, Object> response = new HashMap<>();
        response.put("candidate", candidate);
        response.put("resumeScreening", screening);
        response.put("jobMatching", matching);
        response.put("skillGap", gap);

        return ResponseEntity.ok(response);
    }

    // AI custom query endpoint for the chatbot assistant
    @PostMapping("/ai/query")
    public ResponseEntity<?> queryAiAgent(@RequestBody Map<String, Object> payload) {
        String query = (String) payload.get("query");
        String candidateName = (String) payload.get("candidateName");
        String userRole = (String) payload.get("userRole");
        String currentRound = (String) payload.get("currentRound");

        String context = "";
        if (candidateName != null && !candidateName.trim().isEmpty()) {
            context = "Context: The active user is " + candidateName + " (Role: " + userRole + ", Current Round: " + currentRound + "). ";
        }

        String prompt = "You are HireGen AI, a senior technical recruitment assistant. " +
                context +
                "Help the user with navigation, portal instructions, or where to upload resumes/details (e.g. they can upload resume details in the Dashboard under Stage 1). " +
                "CRITICAL SECURITY RULE: You must NEVER reveal or tell the answers to any coding questions, challenge details, or aptitude test questions. If asked for answers or solutions, politely decline and instruct the candidate to complete the assessment on their own. " +
                "Provide a very short, direct, and concise response (maximum 150 words) to the user's query: " + query;
        
        String aiResponse = geminiService.generate(prompt);
        return ResponseEntity.ok(Map.of("response", aiResponse));
    }


    // Interview endpoints
    @PostMapping("/interviews/start")
    public ResponseEntity<?> startInterview(
            @RequestParam Long candidateId,
            @RequestParam Long jobId,
            @RequestParam String type) {

        Interview interview = new Interview();
        interview.setCandidateId(candidateId);
        interview.setJobId(jobId);
        interview.setType(type);
        interview.setStatus("IN_PROGRESS");
        interview = interviewRepository.save(interview);

        // Generate the first question (Agent 4)
        String question = geminiAgentService.generateNextQuestion(interview.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("interview", interview);
        response.put("question", question);
        
        // Find the saved question record to get its ID
        List<InterviewQuestion> qs = interviewQuestionRepository.findByInterviewId(interview.getId());
        if (!qs.isEmpty()) {
            response.put("questionId", qs.get(qs.size() - 1).getId());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/interviews/question/{questionId}/answer")
    public ResponseEntity<?> answerQuestion(
            @PathVariable Long questionId,
            @RequestBody Map<String, String> payload) {

        String answer = payload.get("answer");
        // Evaluate the answer (Agent 4)
        InterviewQuestion evaluatedQuestion = geminiAgentService.evaluateAnswer(questionId, answer);

        Interview interview = interviewRepository.findById(evaluatedQuestion.getInterviewId())
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        String proctoringLogs = payload.get("proctoringLogs");
        String proctoringScoreStr = payload.get("proctoringScore");
        if (proctoringLogs != null) {
            interview.setProctoringLogs(proctoringLogs);
        }
        if (proctoringScoreStr != null) {
            try {
                interview.setProctoringScore(Integer.parseInt(proctoringScoreStr));
            } catch (NumberFormatException ignored) {}
        }
        interviewRepository.save(interview);

        // Check if we want to stop after 3 questions (or dynamic criteria)
        List<InterviewQuestion> allQuestions = interviewQuestionRepository.findByInterviewId(interview.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("evaluatedQuestion", evaluatedQuestion);

        if (allQuestions.size() >= 3) {
            // End interview
            interview.setStatus("COMPLETED");
            
            // Calculate final interview score
            int totalScore = 0;
            for (InterviewQuestion q : allQuestions) {
                totalScore += (q.getScore() != null) ? q.getScore() : 0;
            }
            int finalAvg = totalScore / allQuestions.size();
            interview.setFinalScore(finalAvg);
            
            // Generate final feedback summary
            interview.setFeedback("Mock interview completed. Average score: " + finalAvg);
            interviewRepository.save(interview);

            // Update Candidate round dynamically based on AI evaluation
            Candidate candidate = candidateRepository.findById(interview.getCandidateId()).orElse(null);
            if (candidate != null) {
                if (finalAvg >= 60) {
                    candidate.setCurrentRound("HIRED");
                } else {
                    candidate.setCurrentRound("REJECTED");
                }
                candidateRepository.save(candidate);
            }

            // Run Workflow Step 7: Communication Assessment (Agent 6)
            CommunicationAssessment comm = geminiAgentService.runCommunicationAssessment(
                    interview.getCandidateId(), interview.getId());

            response.put("interviewStatus", "COMPLETED");
            response.put("finalScore", finalAvg);
            response.put("communicationAssessment", comm);
        } else {
            // Generate next question
            String nextQuestion = geminiAgentService.generateNextQuestion(interview.getId());
            response.put("interviewStatus", "IN_PROGRESS");
            response.put("nextQuestion", nextQuestion);
            
            // Get latest question ID
            List<InterviewQuestion> updatedQuestions = interviewQuestionRepository.findByInterviewId(interview.getId());
            response.put("nextQuestionId", updatedQuestions.get(updatedQuestions.size() - 1).getId());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/interviews/{interviewId}/finish")
    public ResponseEntity<?> finishInterview(@PathVariable Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
        interview.setStatus("COMPLETED");

        List<InterviewQuestion> allQuestions = interviewQuestionRepository.findByInterviewId(interviewId);
        int totalScore = 0;
        int count = 0;
        for (InterviewQuestion q : allQuestions) {
            if (q.getScore() != null) {
                totalScore += q.getScore();
                count++;
            }
        }
        int finalAvg = count > 0 ? totalScore / count : 0;
        interview.setFinalScore(finalAvg);
        interview.setFeedback("Mock interview completed. Average score: " + finalAvg);
        interviewRepository.save(interview);

        Candidate candidate = candidateRepository.findById(interview.getCandidateId()).orElse(null);
        if (candidate != null) {
            if (finalAvg >= 60) {
                candidate.setCurrentRound("HIRED");
            } else {
                candidate.setCurrentRound("REJECTED");
            }
            candidateRepository.save(candidate);
        }

        // Run Workflow Step 7: Communication Assessment (Agent 6)
        try {
            geminiAgentService.runCommunicationAssessment(interview.getCandidateId(), interview.getId());
        } catch (Exception ignored) {}

        Map<String, Object> response = new HashMap<>();
        response.put("interviewStatus", "COMPLETED");
        response.put("finalScore", finalAvg);
        return ResponseEntity.ok(response);
    }

    // Aptitude endpoints
    @GetMapping("/aptitude/questions")
    public ResponseEntity<?> getAptitudeQuestions(@RequestParam Long candidateId) {
        AptitudeTest test = geminiAgentService.generateAptitudeQuestions(candidateId);
        return ResponseEntity.ok(test);
    }

    @PostMapping("/aptitude/submit")
    public ResponseEntity<?> submitAptitudeAnswers(
            @RequestParam Long candidateId,
            @RequestBody Map<String, String> payload) {
        
        AptitudeTest evaluated = geminiAgentService.evaluateAptitudeAnswers(candidateId, payload);
        return ResponseEntity.ok(evaluated);
    }

    // Communication MCQ endpoints
    @GetMapping("/communication/questions")
    public ResponseEntity<?> getCommunicationQuestions(@RequestParam Long candidateId) {
        CommunicationTest test = geminiAgentService.generateCommunicationQuestions(candidateId);
        return ResponseEntity.ok(test);
    }

    @PostMapping("/communication/submit")
    public ResponseEntity<?> submitCommunicationAnswers(
            @RequestParam Long candidateId,
            @RequestBody Map<String, String> payload) {
        
        CommunicationTest evaluated = geminiAgentService.evaluateCommunicationAnswers(candidateId, payload);
        return ResponseEntity.ok(evaluated);
    }

    // Coding endpoints
    @PostMapping("/coding/evaluate")
    public ResponseEntity<?> evaluateCoding(
            @RequestParam Long candidateId,
            @RequestParam Long jobId,
            @RequestParam String question,
            @RequestParam String language,
            @RequestBody Map<String, String> payload) {

        String code = payload.get("code");
        // Run Workflow Step 6: Coding Evaluation (Agent 5)
        CodingEvaluation evaluation = geminiAgentService.runCodingEvaluation(
                candidateId, jobId, question, code, language);

        // Update Candidate round dynamically based on AI evaluation
        Candidate candidate = candidateRepository.findById(candidateId).orElse(null);
        if (candidate != null) {
            if (evaluation.getFinalScore() != null && evaluation.getFinalScore() >= 60) {
                candidate.setCurrentRound("ROUND_5_INTERVIEW");
            } else {
                candidate.setCurrentRound("REJECTED");
            }
            candidateRepository.save(candidate);
        }

        return ResponseEntity.ok(evaluation);
    }

    // Hiring Decision endpoint
    @PostMapping("/decisions/run")
    public ResponseEntity<?> runHiringDecision(
            @RequestParam Long candidateId,
            @RequestParam Long jobId) {

        // Run Workflow Step 8: Hiring Decision (Agent 7)
        HiringDecision decision = geminiAgentService.runHiringDecision(candidateId, jobId);
        return ResponseEntity.ok(decision);
    }

    // Full Report consolidation
    @GetMapping("/reports/candidate/{candidateId}/job/{jobId}")
    public ResponseEntity<?> getConsolidatedReport(
            @PathVariable Long candidateId,
            @PathVariable Long jobId) {

        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        if (jobId == null || jobId == 0) {
            Optional<ResumeScreening> screen = resumeScreeningRepository.findAll().stream()
                    .filter(s -> s.getCandidateId().equals(candidateId))
                    .findFirst();
            if (screen.isPresent()) {
                jobId = screen.get().getJobId();
            } else {
                List<Job> allJobs = jobRepository.findAll();
                if (!allJobs.isEmpty()) {
                    jobId = allJobs.get(0).getId();
                } else {
                    throw new RuntimeException("No jobs in database to match candidate report");
                }
            }
        }
        final Long finalJobId = jobId;
        Job job = jobRepository.findById(finalJobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Optional<ResumeScreening> resume = resumeScreeningRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, finalJobId);
        Optional<JobMatching> matching = jobMatchingRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, finalJobId);
        Optional<SkillGap> skillGap = skillGapRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, finalJobId);
        Optional<CodingEvaluation> coding = codingEvaluationRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, finalJobId);
        Optional<CommunicationAssessment> communication = communicationAssessmentRepository.findFirstByCandidateIdOrderByIdDesc(candidateId);
        Optional<HiringDecision> decision = hiringDecisionRepository.findFirstByCandidateIdAndJobIdOrderByIdDesc(candidateId, finalJobId);
        Optional<AptitudeTest> aptitude = aptitudeTestRepository.findFirstByCandidateIdOrderByIdDesc(candidateId);
        Optional<CommunicationTest> communicationTest = communicationTestRepository.findFirstByCandidateIdOrderByIdDesc(candidateId);

        List<Interview> interviews = interviewRepository.findByCandidateIdAndJobId(candidateId, finalJobId);
        List<InterviewQuestion> interviewQuestions = null;
        if (!interviews.isEmpty()) {
            interviewQuestions = interviewQuestionRepository.findByInterviewId(interviews.get(0).getId());
        }

        Map<String, Object> report = new HashMap<>();
        report.put("candidate", candidate);
        report.put("job", job);
        report.put("resumeScreening", resume.orElse(null));
        report.put("jobMatching", matching.orElse(null));
        report.put("skillGap", skillGap.orElse(null));
        report.put("codingEvaluation", coding.orElse(null));
        report.put("communicationAssessment", communication.orElse(null));
        report.put("interview", !interviews.isEmpty() ? interviews.get(0) : null);
        report.put("interviewQuestions", interviewQuestions);
        report.put("hiringDecision", decision.orElse(null));
        report.put("aptitudeTest", aptitude.orElse(null));
        report.put("communicationTest", communicationTest.orElse(null));

        return ResponseEntity.ok(report);
    }

    // Recruiter Round Approval
    @PostMapping("/candidates/{id}/approve")
    public ResponseEntity<?> approveCandidateForNextRound(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            String current = candidate.getCurrentRound();
            if ("ROUND_1_RESUME".equals(current) || "ROUND_1_COMPLETED".equals(current) || "ROUND_2_MATCHING".equals(current) || "ROUND_2_COMPLETED".equals(current)) {
                candidate.setCurrentRound("ROUND_3_APTITUDE");
            } else if ("ROUND_3_APTITUDE".equals(current)) {
                candidate.setCurrentRound("ROUND_3_COMMUNICATION");
            } else if ("ROUND_3_COMMUNICATION".equals(current)) {
                candidate.setCurrentRound("ROUND_4_CODING");
            } else if ("ROUND_4_CODING".equals(current) || "ROUND_4_COMPLETED".equals(current)) {
                candidate.setCurrentRound("ROUND_5_INTERVIEW");
            } else if ("ROUND_5_INTERVIEW".equals(current) || "ROUND_5_COMPLETED".equals(current) || "ROUND_3_COMPLETED".equals(current)) {
                candidate.setCurrentRound("HIRED");
            }
            candidateRepository.save(candidate);
            return ResponseEntity.ok(candidate);
        }
        return ResponseEntity.notFound().build();
    }

    // Recruiter Candidate Rejection
    @PostMapping("/candidates/{id}/reject")
    public ResponseEntity<?> rejectCandidate(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            candidate.setCurrentRound("REJECTED");
            candidateRepository.save(candidate);
            return ResponseEntity.ok(candidate);
        }
        return ResponseEntity.notFound().build();
    }

    // Candidate Complete Stage 2 Matching Info
    @PostMapping("/candidates/{id}/complete-matching")
    public ResponseEntity<?> completeMatchingRound(@PathVariable Long id) {
        Optional<Candidate> candidateOpt = candidateRepository.findById(id);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            if ("ROUND_2_MATCHING".equals(candidate.getCurrentRound())) {
                candidate.setCurrentRound("ROUND_2_COMPLETED");
                candidateRepository.save(candidate);
            }
            return ResponseEntity.ok(candidate);
        }
        return ResponseEntity.notFound().build();
    }
}
