package com.hiregen.repository;

import com.hiregen.model.HiringDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HiringDecisionRepository extends JpaRepository<HiringDecision, Long> {
    Optional<HiringDecision> findFirstByCandidateIdAndJobIdOrderByIdDesc(Long candidateId, Long jobId);
}
