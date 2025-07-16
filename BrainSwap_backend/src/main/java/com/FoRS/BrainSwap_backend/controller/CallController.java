package com.FoRS.BrainSwap_backend.controller;

import com.FoRS.BrainSwap_backend.service.CallService;
import com.FoRS.BrainSwap_backend.utils.dto.call.CancelScheduleDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.CreateCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.GetCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.ScheduleCallDTO;
import com.FoRS.BrainSwap_backend.utils.dto.call.UpdateCallDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/calls")
public class CallController {
    private final CallService callService;

    @PostMapping
    public GetCallDTO createCall(@RequestBody CreateCallDTO call) {
        return callService.save(call);
    }

    @GetMapping
    public List<GetCallDTO> getAllCalls() {
        return callService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetCallDTO> getCall(@PathVariable Long id) {
        return callService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public GetCallDTO updateCall(@RequestBody UpdateCallDTO call) {
        return callService.update(call);
    }

    @DeleteMapping("/{id}")
    public void deleteCall(@PathVariable Long id) {
        callService.deleteById(id);
    }

    @PostMapping("/{id}/join")
    public GetCallDTO joinCall(@PathVariable Long id) {
        return callService.joinCall(id);
    }

    @PostMapping("/schedule")
    public GetCallDTO scheduleCall(@RequestBody ScheduleCallDTO dto) {
        return callService.scheduleCall(dto);
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSchedule(@RequestBody CancelScheduleDTO dto) {
        return ResponseEntity.ok(callService.cancelSchedule(dto));
    }

    @PostMapping("/{callId}/complete")
    public ResponseEntity<?> completeCall(@PathVariable Long callId, @RequestBody List<Long> joinedUserIds) {
        callService.completeCall(callId, joinedUserIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{callId}/deactivate")
    public ResponseEntity<?> deactivateCall(@PathVariable Long callId) {
        callService.deactivateCall(callId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{id}")
    public List<GetCallDTO> getAllByParticipantId(@PathVariable Long id) {
        return callService.getAllByParticipantId(id);
    }
}
