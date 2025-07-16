package com.FoRS.BrainSwap_backend.repository;

import com.FoRS.BrainSwap_backend.domain.Call;
import com.FoRS.BrainSwap_backend.utils.constants.CallStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CallRepository extends JpaRepository<Call, Long> {
    List<Call> findByPostId(Long postId);
    List<Call> findByStatusAndIsActiveTrue(CallStatus status);

    @Query("SELECT c FROM Call c JOIN c.participants p WHERE p.id = :participantId")
    List<Call> findAllByParticipantId(@Param("participantId") Long participantId);
}
