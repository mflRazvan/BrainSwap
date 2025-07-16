package com.FoRS.BrainSwap_backend.utils.dto.call;

import java.time.LocalDateTime;

public record CreateCallDTO(
    Long postId,
    Long ownerId,
    LocalDateTime scheduledTime,
    Integer maxParticipants,
    Boolean isLearnTogether
) {} 