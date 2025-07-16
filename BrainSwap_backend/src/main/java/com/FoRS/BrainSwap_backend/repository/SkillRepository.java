package com.FoRS.BrainSwap_backend.repository;

import com.FoRS.BrainSwap_backend.domain.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findAllById(Iterable<Long> ids);
    List<Skill> findByNameIn(Iterable<String> names);
}
