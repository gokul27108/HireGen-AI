package com.hiregen.repository;

import com.hiregen.model.CodingEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CodingEvaluationRepository extends JpaRepository<CodingEvaluation, Long> {
    Optional<CodingEvaluation> findFirstByCandidateIdAndJobIdOrderByIdDesc(Long candidateId, Long jobId);
}
