package com.FoRS.BrainSwap_backend.utils.mapper;

import com.FoRS.BrainSwap_backend.domain.Call;
import com.FoRS.BrainSwap_backend.utils.dto.call.CreateCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.GetCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.UpdateCallDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = { AppUserMapper.class, PostMapper.class })
public interface CallMapper {

    Call toEntity(CreateCallDTO dto);

    @Mapping(target = "zoomJoinUrl", source = "zoomJoinUrl")
    @Mapping(target = "zoomMeetingId", source = "zoomMeetingId")
    @Mapping(target = "zoomPassword", source = "zoomPassword")
    @Mapping(target = "zoomHostKey", source = "zoomHostKey")
    GetCallDTO toDTO(Call call);

    List<GetCallDTO> toDTO(List<Call> calls);
} 