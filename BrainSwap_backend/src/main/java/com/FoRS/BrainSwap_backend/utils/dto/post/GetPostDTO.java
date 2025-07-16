package com.FoRS.BrainSwap_backend.utils.dto.post;

import com.FoRS.BrainSwap_backend.utils.constants.LearningType;
import com.FoRS.BrainSwap_backend.utils.constants.PostType;
import com.FoRS.BrainSwap_backend.utils.dto.call.GetCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.BasicUserDTO;

import java.util.List;

public record GetPostDTO (
    Long id,
    String title,
    String description,
    BasicUserDTO owner,
    Long skillId,
    Integer price,
    LearningType learningType,
    PostType type,
    Boolean isActive,
    List<GetCallDTO> calls
) {}
