package com.FoRS.BrainSwap_backend.utils.dto.call;

import com.FoRS.BrainSwap_backend.utils.constants.CallStatus;
import com.FoRS.BrainSwap_backend.utils.dto.user.BasicUserDTO;

import java.time.LocalDateTime;
import java.util.List;

public record GetCallDTO(
    Long id,
    //Long postId,
    LocalDateTime scheduledTime,
    Integer maxParticipants,
    Integer currentParticipants,
    BasicUserDTO owner,
    List<BasicUserDTO> participants,
    Integer participantPrice,
    CallStatus status,
    Boolean isActive,
    String zoomJoinUrl,
    String zoomMeetingId,
    String zoomPassword,
    String zoomHostKey
) {}