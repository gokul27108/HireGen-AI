package com.hiregen.repository;

import com.hiregen.model.SkillGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SkillGapRepository extends JpaRepository<SkillGap, Long> {
    Optional<SkillGap> findFirstByCandidateIdAndJobIdOrderByIdDesc(Long candidateId, Long jobId);
}
