package com.FoRS.BrainSwap_backend.service;

import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.repository.UserRepository;
import com.FoRS.BrainSwap_backend.security.SecurityUtil;
import com.FoRS.BrainSwap_backend.utils.constants.CallConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ZoomService {
    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    @Value("${zoom.client.id}")
    private String clientId;

    @Value("${zoom.client.secret}")
    private String clientSecret;

    @Value("${zoom.account.id}")
    private String accountId;

    private static final String ZOOM_API_BASE_URL = "https://api.zoom.us/v2";
    private String accessToken;
    private LocalDateTime tokenExpiry;

    public static class ZoomMeetingInfo {
        private final String joinUrl;
        private final String meetingId;
        private final String password;
        private final String hostKey;

        public ZoomMeetingInfo(String joinUrl, String meetingId, String password, String hostKey) {
            this.joinUrl = joinUrl;
            this.meetingId = meetingId;
            this.password = password;
            this.hostKey = hostKey;
        }

        public String getJoinUrl() { return joinUrl; }
        public String getMeetingId() { return meetingId; }
        public String getPassword() { return password; }
        public String getHostKey() { return hostKey; }
    }

    private void refreshAccessTokenIfNeeded() {
        if (accessToken == null || tokenExpiry == null || LocalDateTime.now().isAfter(tokenExpiry)) {
            String authHeader = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + authHeader);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "account_credentials");
            body.add("account_id", accountId);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://zoom.us/oauth/token",
                request,
                Map.class
            );

            if (response.getBody() == null) {
                throw new RuntimeException("Failed to get Zoom access token");
            }

            accessToken = (String) response.getBody().get("access_token");
            Integer expiresIn = (Integer) response.getBody().get("expires_in");
            tokenExpiry = LocalDateTime.now().plusSeconds(expiresIn - 300); // Refresh 5 minutes before expiry
        }
    }

    public ZoomMeetingInfo createMeeting(String topic, LocalDateTime startTime, int maxParticipants) {
        refreshAccessTokenIfNeeded();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> meetingDetails = new HashMap<>();
        meetingDetails.put("topic", topic);
        meetingDetails.put("type", 2); // Scheduled meeting
        meetingDetails.put("start_time", startTime.toString());
        meetingDetails.put("duration", CallConstants.DEFAULT_CALL_DURATION_MINUTES);
        meetingDetails.put("timezone", ZoneId.systemDefault().getId());
        meetingDetails.put("settings", Map.of(
            "host_video", true,
            "participant_video", true,
            "join_before_host", true,
            "mute_upon_entry", true,
            "waiting_room", true,
            "meeting_authentication", true,
            "max_participants", maxParticipants
        ));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(meetingDetails, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ZOOM_API_BASE_URL + "/users/me/meetings",
                    request,
                    Map.class
            );

            if (response.getStatusCode() != HttpStatus.CREATED) {
                throw new RuntimeException("Failed to create Zoom meeting: " + response.getStatusCode());
            }

            Map<String, Object> meetingData = response.getBody();
            if (meetingData == null) {
                throw new RuntimeException("Failed to create Zoom meeting: No response data");
            }

            return new ZoomMeetingInfo(
                (String) meetingData.get("join_url"),
                String.valueOf(meetingData.get("id")),
                (String) meetingData.get("password"),
                (String) meetingData.get("host_key")
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Zoom meeting: " + e.getMessage(), e);
        }
    }
} 