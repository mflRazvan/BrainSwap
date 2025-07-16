package com.FoRS.BrainSwap_backend.utils.listener;

import com.FoRS.BrainSwap_backend.domain.Call;
import com.FoRS.BrainSwap_backend.utils.constants.CallStatus;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

import java.util.ArrayList;

public class CallEntityListener {
    @PrePersist
    public void prePersist(Call call) {
        if (call.getStatus() == null) {
            call.setStatus(CallStatus.SCHEDULED);
        }
        if(call.getParticipants() == null){
            call.setParticipants(new ArrayList<>());
        }
    }

    @PreUpdate
    public void preUpdate(Call call) {
        // Add any pre-update logic here if needed
    }
} 