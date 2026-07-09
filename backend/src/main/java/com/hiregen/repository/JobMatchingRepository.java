package com.hiregen.repository;

import com.hiregen.model.JobMatching;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JobMatchingRepository extends JpaRepository<JobMatching, Long> {
    Optional<JobMatching> findFirstByCandidateIdAndJobIdOrderByIdDesc(Long candidateId, Long jobId);
}
