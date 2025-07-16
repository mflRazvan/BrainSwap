package com.FoRS.BrainSwap_backend.controller;

import com.FoRS.BrainSwap_backend.service.ZoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/zoom")
@RequiredArgsConstructor
public class ZoomController {
    private final ZoomService zoomService;

    @PostMapping("/test-meeting")
    public ResponseEntity<?> testZoomIntegration() {
        try {
            // Create a test meeting 1 hour from now
            ZoomService.ZoomMeetingInfo meetingInfo = zoomService.createMeeting(
                "Test Meeting",
                LocalDateTime.now().plusHours(1),
                5 // max participants
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Zoom integration is working!",
                "meetingUrl", meetingInfo.getJoinUrl(),
                "meetingId", meetingInfo.getMeetingId(),
                "password", meetingInfo.getPassword()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to create test meeting",
                "details", e.getMessage()
            ));
        }
    }
} 