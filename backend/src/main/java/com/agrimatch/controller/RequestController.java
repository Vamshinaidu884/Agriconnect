package com.agrimatch.controller;

import com.agrimatch.dto.ApiResponse;
import com.agrimatch.dto.CreateRequestDTO;
import com.agrimatch.model.Request;
import com.agrimatch.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @PostMapping
    public ResponseEntity<ApiResponse<Request>> createRequest(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody CreateRequestDTO dto) {
        try {
            Request request = requestService.createRequest(userId, dto);
            return ResponseEntity.ok(ApiResponse.success("Request created", request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Request>>> getAllRequests(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String status) {
        List<Request> requests;
        if (state != null && status != null) {
            requests = requestService.getRequestsByState(state);
        } else if (status != null) {
            requests = requestService.getPendingRequests();
        } else {
            requests = requestService.getAllRequests();
        }
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Request>> getRequest(@PathVariable String id) {
        try {
            Request request = requestService.getRequestById(id);
            return ResponseEntity.ok(ApiResponse.success(request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<ApiResponse<List<Request>>> getMyRequests(@PathVariable String userId) {
        List<Request> requests = requestService.getRequestsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/accepted/{userId}")
    public ResponseEntity<ApiResponse<List<Request>>> getAcceptedRequests(@PathVariable String userId) {
        List<Request> requests = requestService.getAcceptedByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    /**
     * FCFS Accept endpoint — the core USP
     */
    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<Request>> acceptRequest(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Request request = requestService.acceptRequest(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Request accepted!", request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Request>> completeRequest(@PathVariable String id) {
        try {
            Request request = requestService.completeRequest(id);
            return ResponseEntity.ok(ApiResponse.success("Request completed!", request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<ApiResponse<Request>> rateUser(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String fromUserId,
            @RequestBody Map<String, Object> body) {
        try {
            String toUserId = (String) body.get("toUserId");
            int score = (int) body.get("score");
            String comment = (String) body.getOrDefault("comment", "");

            Request request = requestService.rateUser(id, fromUserId, toUserId, score, comment);
            return ResponseEntity.ok(ApiResponse.success("Rating submitted!", request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
