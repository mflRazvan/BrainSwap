package com.FoRS.BrainSwap_backend.service;

import com.FoRS.BrainSwap_backend.domain.Call;
import com.FoRS.BrainSwap_backend.domain.AppUser;
import com.FoRS.BrainSwap_backend.domain.Post;
import com.FoRS.BrainSwap_backend.repository.CallRepository;
import com.FoRS.BrainSwap_backend.repository.PostRepository;
import com.FoRS.BrainSwap_backend.repository.UserRepository;
import com.FoRS.BrainSwap_backend.security.SecurityUtil;
import com.FoRS.BrainSwap_backend.utils.constants.CallConstants;
import com.FoRS.BrainSwap_backend.utils.constants.CallStatus;
import com.FoRS.BrainSwap_backend.utils.dto.call.CreateCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.GetCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.UpdateCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.ScheduleCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.CancelScheduleDTO;
import com.FoRS.BrainSwap_backend.utils.exception.ResourceNotFoundException;
import com.FoRS.BrainSwap_backend.utils.exception.CallFullException;
import com.FoRS.BrainSwap_backend.utils.exception.UserAlreadyScheduledException;
import com.FoRS.BrainSwap_backend.utils.exception.ScheduleNotFoundException;
import com.FoRS.BrainSwap_backend.utils.mapper.AppUserMapper;
import com.FoRS.BrainSwap_backend.utils.mapper.CallMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CallService implements IService<CreateCallDTO, GetCallDTO, UpdateCallDTO, Long> {
    private final CallRepository callRepository;
    private final UserRepository userRepository;
    private final ZoomService zoomService;
    @Autowired
    private final CallMapper callMapper;
    @Autowired
    private final AppUserMapper appUserMapper;
    @Autowired
    private final SecurityUtil securityUtil;
    private final UserService userService;
    private final PostRepository postRepository;

    @Override
    @Transactional
    public GetCallDTO save(CreateCallDTO dto) {
        // Create and set up the call entity
        Call entity = callMapper.toEntity(dto);
        
        // Set owner
        AppUser owner = userRepository.findById(dto.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        entity.setOwner(owner);
        
        // Set post
        Post post = postRepository.findById(dto.postId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        entity.setPost(post);
        
        // Set initial values
        entity.setCurrentParticipants(0);
        entity.setStatus(CallStatus.SCHEDULED);
        entity.setIsActive(true);
        
        // Calculate participant price based on post type
        if (entity.getIsLearnTogether()) {
            entity.setParticipantPrice((post.getPrice() * CallConstants.USER_LEARN_TOGETHER_PRICE_PERCENTAGE / 100));
        } else {
            entity.setParticipantPrice(post.getPrice());
        }
        
        // Create Zoom meeting
        ZoomService.ZoomMeetingInfo zoomMeetingInfo = zoomService.createMeeting(
            "BrainSwap Session",
            entity.getScheduledTime(),
            entity.getMaxParticipants()
        );
        
        // Set Zoom meeting details
        entity.setZoomJoinUrl(zoomMeetingInfo.getJoinUrl());
        entity.setZoomMeetingId(zoomMeetingInfo.getMeetingId());
        entity.setZoomPassword(zoomMeetingInfo.getPassword());
        entity.setZoomHostKey(zoomMeetingInfo.getHostKey());
        
        // Save the call
        return callMapper.toDTO(callRepository.save(entity));
    }

    @Transactional
    public List<Call> saveAll(List<Call> calls) {
        return callRepository.saveAll(calls);
    }

    @Override
    public GetCallDTO update(UpdateCallDTO dto) {
        Call entity = callRepository.findById(dto.id()).orElseThrow(() -> new RuntimeException("Call not found"));
        if(dto.scheduledTime() != null)
            entity.setScheduledTime(dto.scheduledTime());
        if(dto.maxParticipants() != null)
            entity.setMaxParticipants(dto.maxParticipants());
        if(dto.status() != null)
            entity.setStatus(dto.status());
        return callMapper.toDTO(callRepository.save(entity));
    }

    @Override
    public List<GetCallDTO> findAll() {
        return callMapper.toDTO(callRepository.findAll());
    }

    @Override
    public Optional<GetCallDTO> findById(Long id) {
        Optional<Call> entity = callRepository.findById(id);
        return entity.map(callMapper::toDTO);
    }

    @Override
    public void deleteById(Long id) {
        callRepository.deleteById(id);
    }

    @Transactional
    public GetCallDTO scheduleCall(ScheduleCallDTO dto) {
        Call call = callRepository.findById(dto.callId())
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        if (!call.getIsActive()) {
            throw new ResourceNotFoundException("Call has been removed");
        }

        AppUser user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (call.getStatus() != CallStatus.SCHEDULED) {
            throw new RuntimeException("Cannot join a call that is not scheduled");
        }

        if (call.getCurrentParticipants() >= call.getMaxParticipants()) {
            throw new CallFullException("Call is full");
        }

        if (call.getParticipants().contains(user)) {
            throw new UserAlreadyScheduledException("User is already scheduled for this call");
        }

        // Add user to participants
        call.getParticipants().add(user);
        call.setCurrentParticipants(call.getCurrentParticipants() + 1);
        List<Call> userScheduledCalls = user.getScheduledCalls();
        userScheduledCalls.add(call);
        user.setScheduledCalls(userScheduledCalls);
        userService.update(AppUserMapper.toUpdateDTO(user));

        call = callRepository.save(call);
        return callMapper.toDTO(call);
    }

    @Transactional
    public GetCallDTO cancelSchedule(CancelScheduleDTO dto) {
        Call call = callRepository.findById(dto.callId())
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        if (!call.getIsActive()) {
            throw new ResourceNotFoundException("Call has been removed");
        }

        AppUser user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!call.getParticipants().contains(user)) {
            throw new ScheduleNotFoundException("User is not scheduled for this call");
        }

        // Remove user from participants
        call.getParticipants().remove(user);
        call.setCurrentParticipants(call.getCurrentParticipants() - 1);

        call = callRepository.save(call);
        return callMapper.toDTO(call);
    }

    @Transactional
    public GetCallDTO joinCall(Long callId) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        if (!call.getIsActive()) {
            throw new ResourceNotFoundException("Call has been removed");
        }

        AppUser currentUser = userRepository.findById(securityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user is a participant or the owner
        if (!call.getParticipants().contains(currentUser) && !call.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("User is not a participant or owner of this call");
        }

        // If user is the owner and call is scheduled, update status to IN_PROGRESS and deduct balances
        if (call.getOwner().getId().equals(currentUser.getId()) && call.getStatus() == CallStatus.SCHEDULED) {
            // Deduct balance from all participants
            for (AppUser participant : call.getParticipants()) {
                if (participant.getBalance() < call.getParticipantPrice()) {
                    throw new RuntimeException("Participant " + participant.getUsername() + " has insufficient balance");
                }
                participant.setBalance(participant.getBalance() - call.getParticipantPrice());
                userRepository.save(participant);
            }
            
            call.setStatus(CallStatus.IN_PROGRESS);
            callRepository.save(call);
        }

        return callMapper.toDTO(call);
    }

    @Transactional
    public void deactivateCall(Long callId) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        call.setIsActive(false);
        callRepository.save(call);
    }

    @Transactional
    public void completeCall(Long callId, List<Long> joinedUserIds) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new ResourceNotFoundException("Call not found"));

        if (!call.getIsActive() || call.getStatus() != CallStatus.IN_PROGRESS) {
            throw new RuntimeException("Call is not active or not in progress");
        }

        // Mark call as completed
        call.setStatus(CallStatus.COMPLETED);
        callRepository.save(call);

        // Compute owner revenue and penalties
        int participantPrice = call.getParticipantPrice();
        int ownerRevenue = 0;
        int teachingRevenuePerUser = (int) Math.ceil(participantPrice * CallConstants.TEACHING_REVENUE_PERCENTAGE / 100.0);
        for (AppUser participant : call.getParticipants()) {
            if (joinedUserIds.contains(participant.getId())) {
                // User joined, balance already deducted at call start
                if (!call.getIsLearnTogether()) {
                    ownerRevenue += teachingRevenuePerUser;
                }
            } else {
                // User did not join, apply penalty
                int penalty = (int) Math.ceil(participantPrice * CallConstants.NO_SHOW_PENALTY_PERCENTAGE / 100.0);
                if (participant.getBalance() < penalty) {
                    participant.setBalance(0L);
                } else {
                    participant.setBalance(participant.getBalance() - penalty);
                }
                userRepository.save(participant);
            }
        }
        // Decrease owner balance if learn together
        AppUser owner = call.getOwner();
        if (call.getIsLearnTogether()) {
            owner.setBalance(owner.getBalance() - call.getPost().getPrice() * CallConstants.OWNER_LEARN_TOGETHER_PRICE_PERCENTAGE);
        } else {
            // Add revenue to owner
            owner.setBalance(owner.getBalance() + ownerRevenue);
        }
        userRepository.save(owner);
    }

    @Transactional
    public void deactivateCallsForPost(Long postId) {
        List<Call> calls = callRepository.findByPostId(postId);
        for (Call call : calls) {
            call.setIsActive(false);
            callRepository.save(call);
        }
    }

    /*public List<CallDetailsDTO> getAvailableCalls(Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return callRepository.findByStatusAndCurrentParticipantsLessThanMaxParticipants()
                .stream()
                .map(call -> convertToCallDetailsDTO(call, user))
                .collect(Collectors.toList());
    }*/

    private Integer calculateParticipantPrice(Post post, boolean isLearnTogether) {
        return isLearnTogether ? (int) (post.getSkill().getMarketValue() * 0.5) : post.getSkill().getMarketValue();
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void autoCompleteCalls() {
        LocalDateTime now = LocalDateTime.now();
        List<Call> inProgressCalls = callRepository.findByStatusAndIsActiveTrue(CallStatus.IN_PROGRESS);

        for (Call call : inProgressCalls) {
            // Check if call duration has passed
            LocalDateTime callEndTime = call.getScheduledTime().plusMinutes(CallConstants.DEFAULT_CALL_DURATION_MINUTES);
            if (now.isAfter(callEndTime)) {
                // Get list of participants who joined (in this case, all participants since we can't track actual joins)
                List<Long> joinedUserIds = call.getParticipants().stream()
                        .map(AppUser::getId)
                        .collect(Collectors.toList());

                // Complete the call
                completeCall(call.getId(), joinedUserIds);
            }
        }
    }

    @Transactional
    public GetCallDTO create(CreateCallDTO createCallDTO) {
        Call call = callMapper.toEntity(createCallDTO);
        
        // Set owner
        AppUser currentUser = userRepository.findById(securityUtil.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        call.setOwner(currentUser);
        
        // Set post
        Post post = postRepository.findById(createCallDTO.postId())
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        call.setPost(post);
        
        // Set initial values
        call.setCurrentParticipants(0);
        call.setStatus(CallStatus.SCHEDULED);
        call.setIsActive(true);
        
        // Calculate participant price based on post type
        if (call.getIsLearnTogether()) {
            call.setParticipantPrice((int) (post.getPrice() * 0.50));
        } else {
            call.setParticipantPrice(post.getPrice().intValue());
        }
        
        // Create Zoom meeting
        ZoomService.ZoomMeetingInfo zoomMeetingInfo = zoomService.createMeeting(
            "BrainSwap Session",
            call.getScheduledTime(),
            call.getMaxParticipants()
        );
        
        // Set Zoom meeting details
        call.setZoomJoinUrl(zoomMeetingInfo.getJoinUrl());
        call.setZoomMeetingId(zoomMeetingInfo.getMeetingId());
        call.setZoomPassword(zoomMeetingInfo.getPassword());
        call.setZoomHostKey(zoomMeetingInfo.getHostKey());
        
        // Save the call
        return callMapper.toDTO(callRepository.save(call));
    }

    public List<GetCallDTO> getAllByParticipantId(Long participantId) {
        return callMapper.toDTO(callRepository.findAllByParticipantId(participantId));
    }
}
