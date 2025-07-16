package com.FoRS.BrainSwap_backend.repository;

import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByOwner(AppUser owner);
    List<Post> findByOwnerId(Long id);
}
