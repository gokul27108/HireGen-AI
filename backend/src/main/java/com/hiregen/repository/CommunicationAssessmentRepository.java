package com.hiregen.repository;

import com.hiregen.model.CommunicationAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CommunicationAssessmentRepository extends JpaRepository<CommunicationAssessment, Long> {
    Optional<CommunicationAssessment> findFirstByCandidateIdOrderByIdDesc(Long candidateId);
}
