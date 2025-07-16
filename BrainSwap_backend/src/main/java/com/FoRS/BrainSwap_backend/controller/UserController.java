package com.FoRS.BrainSwap_backend.controller;

import com.FoRS.BrainSwap_backend.utils.dto.AddBalanceDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.CreateUserDTO;
import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.service.UserService;
import com.FoRS.BrainSwap_backend.utils.dto.user.GetUserDTO;
import com.FoRS.BrainSwap_backend.utils.dto.user.UpdateUserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @PostMapping
    public GetUserDTO createUser(@RequestBody CreateUserDTO createUserDTO) {
        return userService.save(createUserDTO);
    }

    @GetMapping
    public List<GetUserDTO> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetUserDTO> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public GetUserDTO updateUser(@RequestBody UpdateUserDTO dto) {
        return userService.update(dto);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
    }

    @PostMapping("/add-balance")
    public GetUserDTO addBalance(@RequestBody AddBalanceDTO dto){
        return userService.addBalance(dto.id(), dto.balance());
    }
}