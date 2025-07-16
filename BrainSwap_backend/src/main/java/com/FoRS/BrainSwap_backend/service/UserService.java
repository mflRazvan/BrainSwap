package com.FoRS.BrainSwap_backend.service;

import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.domain.Skill;
import com.FoRS.BrainSwap_backend.repository.UserRepository;
import com.FoRS.BrainSwap_backend.security.SecurityUtil;
import com.FoRS.BrainSwap_backend.utils.dto.skill.BasicSkillDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.CreateUserDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.GetUserDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.UpdateUserDTO;
import com.FoRS.BrainSwap_backend.utils.exception.ResourceNotFoundException;
import com.FoRS.BrainSwap_backend.utils.mapper.AppUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements IService<CreateUserDTO, GetUserDTO, UpdateUserDTO, Long> {
    private final UserRepository userRepository;
    private final SkillService skillService;
    @Autowired
    private final AppUserMapper appUserMapper;
    @Autowired
    private final SecurityUtil securityUtil;

    @Override
    public GetUserDTO save(CreateUserDTO dto) {
        AppUser entity = appUserMapper.toEntity(dto);
        List<String> skillNames = dto.skills()
                .stream()
                .map(BasicSkillDTO::name)
                .toList();
        skillService.addCustomSkills(skillNames);
        List<Skill> skills = skillService.findByNameIn(skillNames);
        entity.setSkills(skills);
        System.out.println(entity.getPassword());
        return appUserMapper.toDTO(userRepository.save(entity));
    }

    @Override
    public GetUserDTO update(UpdateUserDTO dto) {
        Long id = securityUtil.getCurrentUserId();
        AppUser entity = userRepository.findById(id).orElseThrow(()->new RuntimeException("User Not Found"));
        if(dto.username() != null && !dto.username().isEmpty())
            entity.setUsername(dto.username());
        if(dto.email() != null && !dto.email().isEmpty())
            entity.setEmail(dto.email());
        if(dto.password() != null && !dto.password().isEmpty())
            entity.setPassword(dto.password());
        if(dto.balance() != null)
            entity.setBalance(dto.balance());

        List<String> skillNames = dto.skills()
                .stream()
                .map(BasicSkillDTO::name)
                .toList();
        skillService.addCustomSkills(skillNames);
        List<Skill> skills = skillService.findByNameIn(skillNames);
        entity.setSkills(skills);
        return appUserMapper.toDTO(userRepository.save(entity));
    }

    @Override
    public List<GetUserDTO> findAll() {
        return appUserMapper.toDTO(userRepository.findAll());
    }

    @Override
    public Optional<GetUserDTO> findById(Long id) {
        Optional<AppUser> entity = userRepository.findById(id);
        return entity.map(appUserMapper::toDTO);
    }

    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    public Optional<AppUser> findByUsernameEntity(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<GetUserDTO> findByUsername(String username) {
        return userRepository.findByUsername(username).map(appUserMapper::toDTO);
    }

    @Transactional
    public void updateZoomTokens(Long userId, String accessToken, String refreshToken, LocalDateTime expiry) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setZoomAccessToken(accessToken);
        user.setZoomRefreshToken(refreshToken);
        user.setZoomTokenExpiry(expiry);
        
        userRepository.save(user);
    }

    public GetUserDTO addBalance(Long id, Long balance){
        AppUser appUser = userRepository.findById(id).orElseThrow();
        appUser.setBalance(appUser.getBalance() + balance);
        userRepository.save(appUser);
        return appUserMapper.toDTO(appUser);
    }
}