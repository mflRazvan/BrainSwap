package com.FoRS.BrainSwap_backend.utils.dto.user;

import com.FoRS.BrainSwap_backend.domain.Call;
import com.FoRS.BrainSwap_backend.utils.dto.skill.BasicSkillDTO;

import java.util.List;

public record UpdateUserDTO (String username, String email, String password, Long balance, List<BasicSkillDTO> skills, List<Call> scheduledCalls) {
}
