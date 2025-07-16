package com.FoRS.BrainSwap_backend.utils.dto.user;

import com.FoRS.BrainSwap_backend.utils.dto.call.GetCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.skill.BasicSkillDTO;

import java.util.List;

public record GetUserDTO (Long id, String username, String email, Long balance, List<BasicSkillDTO> skills, List<GetCallDTO> scheduledCalls) {
}
