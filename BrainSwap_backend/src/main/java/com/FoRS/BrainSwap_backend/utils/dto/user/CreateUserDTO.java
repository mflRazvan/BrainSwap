package com.FoRS.BrainSwap_backend.utils.dto.user;

import com.FoRS.BrainSwap_backend.utils.dto.skill.BasicSkillDTO;

import java.util.List;

public record CreateUserDTO(String username, String email, String password, List<BasicSkillDTO> skills) {
}
