package com.FoRS.BrainSwap_backend.utils.mapper;

import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.domain.Skill;
import com.FoRS.BrainSwap_backend.utils.dto.user.BasicUserDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.CreateUserDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.GetUserDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.UpdateUserDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AppUserMapper {
    GetUserDTO toDTO(AppUser appUser);

    public static UpdateUserDTO toUpdateDTO(AppUser appUser){
        return new UpdateUserDTO(appUser.getUsername(), appUser.getEmail(), appUser.getPassword(), appUser.getBalance(), SkillMapper.toBasicDTO(appUser.getSkills()), appUser.getScheduledCalls());
    }

    BasicUserDTO toBasicDTO(AppUser appUser);

    List<GetUserDTO> toDTO(List<AppUser> appUsers);

    AppUser toEntity(CreateUserDTO createUserDTO);

    @Named("userToName")
    default String userToName(AppUser appUser){
        return appUser.getUsername();
    }
}
