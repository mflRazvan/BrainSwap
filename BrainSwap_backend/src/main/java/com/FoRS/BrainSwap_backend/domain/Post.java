package com.FoRS.BrainSwap_backend.domain;

import com.FoRS.BrainSwap_backend.utils.constants.LearningType;
import com.FoRS.BrainSwap_backend.utils.constants.PostType;
import com.FoRS.BrainSwap_backend.utils.listener.PostEntityListener;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(PostEntityListener.class)
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id", nullable = false)
    private AppUser owner;

    @ManyToOne
    @JoinColumn(name = "skill_id", referencedColumnName = "id", nullable = false)
    @NotNull(message = "Cannot post nothing")
    private Skill skill;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private List<Call> calls;

    private Integer price;

    @Enumerated(EnumType.STRING)
    private LearningType learningType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PostType type;

    @Column(nullable = false)
    private Boolean isActive = true;
}
