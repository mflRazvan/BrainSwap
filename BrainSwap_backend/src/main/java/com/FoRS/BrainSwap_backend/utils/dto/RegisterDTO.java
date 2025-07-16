package com.FoRS.BrainSwap_backend.utils.dto;

import com.FoRS.BrainSwap_backend.utils.dto.skill.BasicSkillDTO;

import java.util.List;

public record RegisterDTO (String username, String email, String password, List<BasicSkillDTO> skills) {}
