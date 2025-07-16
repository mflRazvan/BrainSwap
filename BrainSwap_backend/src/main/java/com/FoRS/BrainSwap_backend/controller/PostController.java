package com.FoRS.BrainSwap_backend.controller;

import com.FoRS.BrainSwap_backend.domain.Post;
import com.FoRS.BrainSwap_backend.service.PostService;
import com.FoRS.BrainSwap_backend.utils.dto.post.CreatePostDTO;
import com.FoRS.BrainSwap_backend.utils.dto.post.GetPostDTO;
import com.FoRS.BrainSwap_backend.utils.dto.post.UpdatePostDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping
    public GetPostDTO createPost(@RequestBody CreatePostDTO post) {
        return postService.save(post);
    }

    @GetMapping
    public List<GetPostDTO> getAllPosts() {
        return postService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetPostDTO> getPost(@PathVariable Long id) {
        return postService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public GetPostDTO updatePost(@RequestBody UpdatePostDTO post) {
        return postService.update(post);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id) {
        postService.deleteById(id);
    }

    @PostMapping("/{postId}/deactivate")
    public ResponseEntity<?> deactivatePost(@PathVariable Long postId) {
        postService.deactivatePost(postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/username/{username}")
    public List<GetPostDTO> getPostsByUser(@PathVariable String username) {
        return postService.getByOwner(username);
    }

    @GetMapping("/user/id/{id}")
    public List<GetPostDTO> getPostsById(@PathVariable Long id) {
        return postService.getByOwnerId(id);
    }
}