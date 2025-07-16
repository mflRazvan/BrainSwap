package com.FoRS.BrainSwap_backend.domain;

import com.FoRS.BrainSwap_backend.utils.constants.CallStatus;
import com.FoRS.BrainSwap_backend.utils.listener.CallEntityListener;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(CallEntityListener.class)
public class Call {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Column(nullable = false)
    private Integer maxParticipants;

    @Column(nullable = false)
    private Integer currentParticipants;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @ManyToMany
    @JoinTable(
        name = "call_participants",
        joinColumns = @JoinColumn(name = "call_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<AppUser> participants;

    @Column(nullable = false)
    private Integer participantPrice;  // For teaching: full skill value, For learn-together: 50% of skill value

    @Enumerated(EnumType.STRING)
    private CallStatus status;

    @Column(nullable = false)
    private Boolean isLearnTogether;  // true for learn-together, false for teaching

    // Zoom meeting information
    @Column(name = "zoom_join_url")
    private String zoomJoinUrl;

    @Column(name = "zoom_meeting_id")
    private String zoomMeetingId;

    @Column(name = "zoom_password")
    private String zoomPassword;

    @Column(name = "zoom_host_key")
    private String zoomHostKey;

    @Column(nullable = false)
    private Boolean isActive = true;  // true if the call is active, false if it's been removed
}
