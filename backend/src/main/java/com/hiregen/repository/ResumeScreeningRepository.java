package com.hiregen.repository;

import com.hiregen.model.ResumeScreening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ResumeScreeningRepository extends JpaRepository<ResumeScreening, Long> {
    Optional<ResumeScreening> findFirstByCandidateIdAndJobIdOrderByIdDesc(Long candidateId, Long jobId);
}
