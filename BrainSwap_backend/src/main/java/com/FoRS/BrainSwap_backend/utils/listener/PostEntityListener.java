package com.FoRS.BrainSwap_backend.utils.listener;

import com.FoRS.BrainSwap_backend.domain.Call;
import com.FoRS.BrainSwap_backend.domain.Post;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

public class PostEntityListener {
    @PrePersist
    public void prePersist(Post post) {
        if (post.getDescription() == null) {
            post.setDescription("");
        }
        if(post.getPrice() == null){
            post.setPrice(post.getSkill().getMarketValue());
        }
        if(post.getIsActive() == null){
            post.setIsActive(true);
        }
    }

    @PreUpdate
    public void preUpdate(Call call) {
        // Add any pre-update logic here if needed
    }
}