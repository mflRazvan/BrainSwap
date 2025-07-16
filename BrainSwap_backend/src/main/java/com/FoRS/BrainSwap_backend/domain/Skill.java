package com.FoRS.BrainSwap_backend.domain;

import com.FoRS.BrainSwap_backend.utils.listener.SkillEntityListener;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(SkillEntityListener.class)
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Skill cannot be empty")
    @Column(unique = true, nullable = false)
    private String name;

    private Integer popularity;        // how wanted a skill is based on lessons/searches done

    private Integer marketValue;        // the value of that skill on the market, specific one for custom skills

    private Boolean predefined;         // true for predefined, false for custom
}
