package com.hiregen.repository;

import com.hiregen.model.AptitudeTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AptitudeTestRepository extends JpaRepository<AptitudeTest, Long> {
    Optional<AptitudeTest> findFirstByCandidateIdOrderByIdDesc(Long candidateId);
}
