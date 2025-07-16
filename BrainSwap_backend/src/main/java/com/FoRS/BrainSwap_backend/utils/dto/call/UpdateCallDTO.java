package com.FoRS.BrainSwap_backend.utils.dto.call;

import com.FoRS.BrainSwap_backend.utils.constants.CallStatus;
import java.time.LocalDateTime;

public record UpdateCallDTO(
    Long id,
    LocalDateTime scheduledTime,
    Integer maxParticipants,
    CallStatus status
) {} 