package com.FoRS.BrainSwap_backend.domain;

import com.FoRS.BrainSwap_backend.utils.constants.Role;
import com.FoRS.BrainSwap_backend.utils.listener.UserEntityListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "app_user")
@EntityListeners(UserEntityListener.class)
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "Password must have at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[a-zA-Z\\d@$!%*?&]+$",
            message = "Password must contain at least one lowercase letter, one number, and one special character"
    )
    private String password;

    private Long balance;

    @OneToMany
    private List<Call> scheduledCalls;

    @ManyToMany
    @JoinTable(
            name = "user_skill",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> skills;

    @ManyToOne
    private Call currentCall;

    @Enumerated(EnumType.STRING)
    private Role role;              // USER or ADMIN

    @OneToMany(mappedBy = "owner")
    private List<Post> posts;

    // Zoom OAuth tokens
    @Column(name = "zoom_access_token")
    private String zoomAccessToken;

    @Column(name = "zoom_refresh_token")
    private String zoomRefreshToken;

    @Column(name = "zoom_token_expiry")
    private LocalDateTime zoomTokenExpiry;
}