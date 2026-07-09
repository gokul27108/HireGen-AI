package com.hiregen.repository;

import com.hiregen.model.CommunicationTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CommunicationTestRepository extends JpaRepository<CommunicationTest, Long> {
    Optional<CommunicationTest> findFirstByCandidateIdOrderByIdDesc(Long candidateId);
}
