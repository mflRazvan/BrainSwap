package com.FoRS.BrainSwap_backend.utils.dto.post;

import com.FoRS.BrainSwap_backend.utils.constants.LearningType;
import com.FoRS.BrainSwap_backend.utils.constants.PostType;
import com.FoRS.BrainSwap_backend.utils.dto.call.CreateCallDTO;

import java.util.List;

public record CreatePostDTO (
    String title, 
    String description, 
    Long skillId, 
    Long ownerId, 
    LearningType learningType, 
    PostType type,
    List<CreateCallDTO> calls
) {}
