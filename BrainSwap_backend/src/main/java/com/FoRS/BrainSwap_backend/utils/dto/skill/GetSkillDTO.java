package com.FoRS.BrainSwap_backend.utils.dto.skill;

public record GetSkillDTO (Long id, String name, Integer popularity, Integer marketValue, Boolean predefined) {
}
