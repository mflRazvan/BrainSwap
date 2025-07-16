package com.FoRS.BrainSwap_backend.utils.listener;

import com.FoRS.BrainSwap_backend.domain.Skill;
import jakarta.persistence.PrePersist;

public class SkillEntityListener {

    @PrePersist
    public void prePersist(Skill skill) {
        if (skill.getPopularity() == null) {
            skill.setPopularity(0);
        }
        if (skill.getMarketValue() == null) {
            skill.setMarketValue(15);       //todo: change val
        }
        if(skill.getPredefined() == null){
            skill.setPredefined(false);
        }
    }
}