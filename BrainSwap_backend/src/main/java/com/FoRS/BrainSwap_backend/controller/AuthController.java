package com.FoRS.BrainSwap_backend.controller;

import com.FoRS.BrainSwap_backend.domain.*;
import com.FoRS.BrainSwap_backend.security.*;
import com.FoRS.BrainSwap_backend.service.UserService;
import com.FoRS.BrainSwap_backend.utils.dto.AuthResponseDTO;
import com.FoRS.BrainSwap_backend.utils.dto.LoginDTO;
import com.FoRS.BrainSwap_backend.utils.dto.RegisterDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.CreateUserDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.GetUserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager am;
    private final UserService service;
    private final PasswordEncoder encoder;
    private final JwtGenerator jwt;

    @PostMapping("/register")
    public AuthResponseDTO register(@RequestBody RegisterDTO req) {
        /*AppUser user = AppUser.builder()
                .username(req.username())
                .email(req.email())
                .password(encoder.encode(req.password()))
                .balance(100L)       // starting points
                .role(Role.USER)
                .build();*/
        if(req.password().length() < 8){
            throw new RuntimeException("Password must be at least 8 characters");
        }
        CreateUserDTO dto = new CreateUserDTO(
                req.username(),
                req.email(),
                encoder.encode(req.password()),
                req.skills()
        );
        GetUserDTO getDTO = service.save(dto);
        AppUser user = service.findByUsernameEntity(getDTO.username()).orElseThrow();//getUserDTOConverter.createFromDto(getDTO);//todo doesnt work, change to find the added entity
        String token = jwt.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return new AuthResponseDTO(token);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginDTO req) {
        am.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        AppUser u = service.findByUsernameEntity(req.username()).orElseThrow();
        return new AuthResponseDTO(jwt.generateToken(u.getId(), u.getUsername(), u.getRole().name()));
    }
}