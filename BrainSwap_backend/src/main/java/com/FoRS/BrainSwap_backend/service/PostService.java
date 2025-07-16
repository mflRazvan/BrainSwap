package com.FoRS.BrainSwap_backend.service;

import com.FoRS.BrainSwap_backend.domain.Post;
import com.FoRS.BrainSwap_backend.domain.Skill;
import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.domain.Call;
import com.FoRS.BrainSwap_backend.repository.PostRepository;
import com.FoRS.BrainSwap_backend.repository.UserRepository;
import com.FoRS.BrainSwap_backend.utils.constants.PostType;
import com.FoRS.BrainSwap_backend.utils.dto.post.CreatePostDTO;
import com.FoRS.BrainSwap_backend.utils.dto.post.GetPostDTO;
import com.FoRS.BrainSwap_backend.utils.dto.post.UpdatePostDTO;
import com.FoRS.BrainSwap_backend.utils.mapper.PostMapper;
import com.FoRS.BrainSwap_backend.utils.mapper.SkillMapper;
import com.FoRS.BrainSwap_backend.utils.mapper.CallMapper;
import com.FoRS.BrainSwap_backend.utils.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService implements IService<CreatePostDTO, GetPostDTO, UpdatePostDTO, Long> {
    private final PostRepository postRepository;
    private final SkillService skillService;
    private final UserRepository userRepository;
    private final CallService callService;
    @Autowired
    private final PostMapper postMapper;
    @Autowired
    private final SkillMapper skillMapper;
    @Autowired
    private final CallMapper callMapper;

    @Override
    @Transactional
    public GetPostDTO save(CreatePostDTO dto) {
        Post entity = postMapper.toEntity(dto);
        
        // Set the owner by fetching the user from the database
        AppUser owner = userRepository.findById(dto.ownerId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        entity.setOwner(owner);
        
        // Set the skill and its market value as the post's price
        Skill skill = skillMapper.toEntity(skillService.findById(dto.skillId()).orElseThrow());
        entity.setSkill(skill);
        entity.setPrice(skill.getMarketValue());
        
        // Create and set calls
        List<Call> calls = new ArrayList<>();
        if (dto.calls() != null && !dto.calls().isEmpty()) {
            for (var callDTO : dto.calls()) {
                Call call = callMapper.toEntity(callDTO);
                call.setPost(entity);
                call.setOwner(owner);
                call.setIsLearnTogether(dto.type() == PostType.LEARN_TOGETHER);
                
                // Calculate prices based on post type
                if (dto.type() == PostType.LEARN_TOGETHER) {
                    call.setParticipantPrice((int) (skill.getMarketValue() * 0.50));
                } else {
                    call.setParticipantPrice(skill.getMarketValue());
                }
                
                calls.add(call);
            }
        }
        entity.setCalls(calls);
        
        // Save the post first
        Post savedPost = postRepository.save(entity);
        
        // Save all calls
        if (!calls.isEmpty()) {
            callService.saveAll(calls);
        }
        
        return postMapper.toDTO(savedPost);
    }

    @Override
    public GetPostDTO update(UpdatePostDTO dto) {
        Post entity = postRepository.findById(dto.id()).orElseThrow(()->new RuntimeException("Post not found"));
        if(dto.title() != null && !dto.title().isEmpty())
            entity.setTitle(dto.title());
        if(dto.description() != null)
            entity.setDescription(dto.description());
        //return getPostDTOConverter.createFromEntity(postRepository.save(entity));
        return postMapper.toDTO(postRepository.save(entity));
    }

    @Override
    public List<GetPostDTO> findAll() {
        //return getPostDTOConverter.createFromEntities(postRepository.findAll());
        return postMapper.toDTO(postRepository.findAll());
    }

    @Override
    public Optional<GetPostDTO> findById(Long id) {
        Optional<Post> entity = postRepository.findById(id);
        //return entity.map(getPostDTOConverter::createFromEntity);
        return entity.map(postMapper::toDTO);
    }

    @Override
    public void deleteById(Long id) {
        postRepository.deleteById(id);
    }

    @Transactional
    public void deactivatePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        post.setIsActive(false);
        postRepository.save(post);
        callService.deactivateCallsForPost(postId);
    }

    public List<GetPostDTO> getByOwner(String owner) {
        AppUser user = userRepository.findByUsername(owner)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return postMapper.toDTO(postRepository.findByOwner(user));
    }

    public List<GetPostDTO> getByOwnerId(Long id) {
        return postMapper.toDTO(postRepository.findByOwnerId(id));
    }
}