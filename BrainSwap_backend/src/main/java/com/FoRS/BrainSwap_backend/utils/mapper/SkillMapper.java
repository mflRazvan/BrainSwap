package com.FoRS.BrainSwap_backend.utils.mapper;

import com.FoRS.BrainSwap_backend.domain.Skill;
import com.FoRS.BrainSwap_backend.utils.dto.skill.BasicSkillDTO;
import com.FoRS.BrainSwap_backend.utils.dto.skill.CreateSkillDTO;
import com.FoRS.BrainSwap_backend.utils.dto.skill.GetSkillDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface SkillMapper {

    GetSkillDTO toDTO(Skill skill);

    List<GetSkillDTO> toDTO(List<Skill> skills);

    static List<BasicSkillDTO> toBasicDTO(List<Skill> skills){
        List<BasicSkillDTO> skillDTOs = new ArrayList<>();
        for (Skill skill : skills) {
            skillDTOs.add(new BasicSkillDTO(skill.getName()));
        }
        return skillDTOs;
    }

    Skill toEntity(CreateSkillDTO createSkillDTO);

    Skill toEntity(GetSkillDTO getSkillDTO);

    @Named("skillToId")
    default Long skillToId(Skill skill){
        if(skill == null)
            return null;
        return skill.getId();
    }
}
