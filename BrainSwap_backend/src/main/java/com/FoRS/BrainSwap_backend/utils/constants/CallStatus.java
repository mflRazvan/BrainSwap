package com.FoRS.BrainSwap_backend.utils.constants;

public enum CallStatus {
    SCHEDULED,    // Call is created and waiting for participants
    IN_PROGRESS,  // Call is currently happening
    COMPLETED,    // Call has ended successfully
    CANCELLED     // Call was cancelled before it started
} 