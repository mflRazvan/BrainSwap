package com.FoRS.BrainSwap_backend.controller;

import com.FoRS.BrainSwap_backend.domain.Skill;
import com.FoRS.BrainSwap_backend.service.SkillService;
import com.FoRS.BrainSwap_backend.utils.dto.skill.CreateSkillDTO;
import com.FoRS.BrainSwap_backend.utils.dto.skill.GetSkillDTO;
import com.FoRS.BrainSwap_backend.utils.dto.skill.UpdateSkillAdminDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
public class SkillController {
    private final SkillService skillService;

    @PostMapping
    public GetSkillDTO createSkill(@RequestBody CreateSkillDTO skill) {
        return skillService.save(skill);
    }

    @GetMapping("/public")
    public List<GetSkillDTO> getAllSkills() {
        return skillService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetSkillDTO> getSkill(@PathVariable Long id) {
        return skillService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public GetSkillDTO updateSkill(@RequestBody UpdateSkillAdminDTO skill) {
        return skillService.update(skill);
    }

    @DeleteMapping("/{id}")
    public void deleteSkill(@PathVariable Long id) {
        skillService.deleteById(id);
    }

    /*@PutMapping("/admin/{id}/make-predefined")
    @PreAuthorize("hasRole('ADMIN')")
    public Skill convertToPredefined(@PathVariable Long id, @RequestBody int marketValue) {
        Skill s = skillService.findById(id).orElseThrow();
        s.setMarketPrice(marketValue);
        s.setCreatedBy(-1);
        return skillService.save(s);
    }*/
}