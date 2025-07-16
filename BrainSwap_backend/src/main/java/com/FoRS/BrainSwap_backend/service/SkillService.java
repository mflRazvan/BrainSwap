package com.FoRS.BrainSwap_backend.service;

import com.FoRS.BrainSwap_backend.domain.Skill;
import com.FoRS.BrainSwap_backend.repository.SkillRepository;
import com.FoRS.BrainSwap_backend.utils.dto.skill.CreateSkillDTO;
import com.FoRS.BrainSwap_backend.utils.dto.skill.GetSkillDTO;
import com.FoRS.BrainSwap_backend.utils.dto.skill.UpdateSkillAdminDTO;
import com.FoRS.BrainSwap_backend.utils.mapper.SkillMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SkillService implements IService<CreateSkillDTO, GetSkillDTO, UpdateSkillAdminDTO, Long> {
    private final SkillRepository skillRepository;
    @Autowired
    private final SkillMapper skillMapper;

    @Override
    public GetSkillDTO save(CreateSkillDTO dto) {
        Skill entity = skillMapper.toEntity(dto);
        return skillMapper.toDTO(skillRepository.save(entity));
    }

    @Override
    public GetSkillDTO update(UpdateSkillAdminDTO dto) {
        Skill entity = skillRepository.findById(dto.id()).orElseThrow(()->new RuntimeException("Skill not found"));
        if(dto.name() != null && !dto.name().isEmpty())
            entity.setName(dto.name());
        if(dto.popularity() != null)
            entity.setPopularity(dto.popularity());
        if(dto.marketValue() != null)
            entity.setMarketValue(dto.marketValue());
        if(dto.predefined() != null)
            entity.setPredefined(dto.predefined());
        return skillMapper.toDTO(skillRepository.save(entity));
    }

    @Override
    public List<GetSkillDTO> findAll() {
        return skillMapper.toDTO(skillRepository.findAll());
    }

    @Override
    public Optional<GetSkillDTO> findById(Long id) {
        Optional<Skill> entity = skillRepository.findById(id);
        return entity.map(skillMapper::toDTO);
    }

    @Override
    public void deleteById(Long id) {
        skillRepository.deleteById(id);
    }

    public List<Skill> findAllById(List<Long> ids){
        return skillRepository.findAllById(ids);
    }

    public List<Skill> findByNameIn(List<String> names){
        return skillRepository.findByNameIn(names);
    }

    public void addCustomSkills(List<String> skills){
        List<Skill> existing = skillRepository.findByNameIn(skills);
        List<String> existingNames = existing.stream()
                .map(Skill::getName)
                .toList();

        List<Skill> newSkills = skills.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> {
                    Skill s = new Skill();
                    s.setName(name);
                    return s;
                })
                .toList();

        if (!newSkills.isEmpty()) {
            skillRepository.saveAll(newSkills);
        }
    }
}