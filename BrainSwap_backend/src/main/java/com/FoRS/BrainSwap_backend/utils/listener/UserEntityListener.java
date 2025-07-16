package com.FoRS.BrainSwap_backend.utils.listener;

import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.utils.constants.Role;
import jakarta.persistence.PrePersist;

import java.util.ArrayList;

public class UserEntityListener {

    @PrePersist
    public void prePersist(AppUser user) {
        if (user.getBalance() == null) {
            user.setBalance(100L);
        }
        if (user.getSkills() == null) {
            user.setSkills(new ArrayList<>());
        }
        if(user.getRole() == null){
            user.setRole(Role.USER);
        }
    }
}