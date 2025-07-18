package com.FoRS.BrainSwap_backend.repository;

import com.FoRS.BrainSwap_backend.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
}
