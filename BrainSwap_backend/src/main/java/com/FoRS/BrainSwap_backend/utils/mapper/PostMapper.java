package com.FoRS.BrainSwap_backend.utils.mapper;

import com.FoRS.BrainSwap_backend.domain.Post;
import com.FoRS.BrainSwap_backend.utils.dto.post.CreatePostDTO;
import com.FoRS.BrainSwap_backend.utils.dto.post.GetPostDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.GetCallDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import java.util.List;

@Mapper(componentModel = "spring", uses = { AppUserMapper.class, SkillMapper.class, CallMapper.class })
public interface PostMapper {

    @Mapping(source = "skill", target = "skillId", qualifiedByName = "skillToId")
    @Mapping(source = "calls", target = "calls")
    GetPostDTO toDTO(Post post);

    Post toEntity(CreatePostDTO createPostDTO);

    List<GetPostDTO> toDTO(List<Post> posts);
}
