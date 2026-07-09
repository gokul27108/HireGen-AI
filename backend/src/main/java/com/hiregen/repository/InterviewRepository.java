package com.hiregen.repository;

import com.hiregen.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCandidateIdAndJobId(Long candidateId, Long jobId);
}
