package com.agrimatch.service;

import com.agrimatch.dto.CreateRequestDTO;
import com.agrimatch.model.Request;
import com.agrimatch.model.User;
import com.agrimatch.repository.RequestRepository;
import com.agrimatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public Request createRequest(String userId, CreateRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Request request = new Request();
        request.setType(dto.getType());
        request.setSubType(dto.getSubType());
        request.setWorkType(dto.getWorkType());
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setPriceOffered(dto.getPriceOffered());
        request.setPriceUnit(dto.getPriceUnit());
        request.setWorkersNeeded(dto.getWorkersNeeded());
        request.setWorkersAccepted(0);
        request.setTimeSlot(dto.getTimeSlot());
        request.setDate(dto.getDate());
        request.setLandArea(dto.getLandArea());
        request.setLandUnit(dto.getLandUnit());
        request.setFoodProvided(dto.isFoodProvided());
        request.setDriverRequired(dto.isDriverRequired());

        // Set farmer info
        request.setFarmerId(user.getId());
        request.setFarmerName(user.getName());
        request.setFarmerPhone(user.getPhone());
        request.setFarmerAvatar(user.getAvatar());
        request.setFarmerRating(user.getRating());

        // Set location
        request.setState(user.getState());
        request.setDistrict(user.getDistrict());
        request.setLocation(user.getLocation());

        request.setStatus("pending");
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        return requestRepository.save(request);
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public List<Request> getPendingRequests() {
        return requestRepository.findByStatusOrderByCreatedAtDesc("pending");
    }

    public List<Request> getRequestsByState(String state) {
        return requestRepository.findByStateAndStatusOrderByCreatedAtDesc(state, "pending");
    }

    public List<Request> getRequestsByUser(String userId) {
        return requestRepository.findByFarmerIdOrderByCreatedAtDesc(userId);
    }

    public List<Request> getAcceptedByUser(String userId) {
        return requestRepository.findByAcceptedUsersContaining(userId);
    }

    public Request getRequestById(String id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    /**
     * FCFS (First Come First Serve) acceptance logic.
     * Core business rule: first users to accept get assigned.
     */
    public Request acceptRequest(String requestId, String userId) {
        Request request = getRequestById(requestId);

        // Validate
        if (!"pending".equals(request.getStatus()) && !"active".equals(request.getStatus())) {
            throw new RuntimeException("Request is no longer accepting workers");
        }
        if (request.getFarmerId().equals(userId)) {
            throw new RuntimeException("You cannot accept your own request");
        }
        if (request.getAcceptedUsers().contains(userId)) {
            throw new RuntimeException("You have already accepted this request");
        }
        if (request.getWorkersAccepted() >= request.getWorkersNeeded()) {
            throw new RuntimeException("Request is already full");
        }

        // FCFS: Add user to accepted list
        request.getAcceptedUsers().add(userId);
        request.setWorkersAccepted(request.getAcceptedUsers().size());

        // Auto-activate when first worker accepts
        if ("pending".equals(request.getStatus())) {
            request.setStatus("active");
        }

        // Auto-close when all workers filled
        if (request.getWorkersAccepted() >= request.getWorkersNeeded()) {
            // Request remains active, just stops accepting more
        }

        request.setUpdatedAt(LocalDateTime.now());
        return requestRepository.save(request);
    }

    public Request completeRequest(String requestId) {
        Request request = getRequestById(requestId);

        if (!"active".equals(request.getStatus())) {
            throw new RuntimeException("Only active requests can be completed");
        }

        request.setStatus("completed");
        request.setUpdatedAt(LocalDateTime.now());

        // Increment completed jobs for all accepted users
        for (String uid : request.getAcceptedUsers()) {
            userService.incrementCompletedJobs(uid);
        }
        userService.incrementCompletedJobs(request.getFarmerId());

        return requestRepository.save(request);
    }

    public Request rateUser(String requestId, String fromUserId, String toUserId, int score, String comment) {
        Request request = getRequestById(requestId);

        if (!"completed".equals(request.getStatus())) {
            throw new RuntimeException("Can only rate completed requests");
        }

        Request.Rating rating = new Request.Rating(score, comment, LocalDateTime.now());
        request.getRatings().put(toUserId, rating);
        request.setUpdatedAt(LocalDateTime.now());

        // Update user's overall rating
        userService.updateRating(toUserId, score);

        return requestRepository.save(request);
    }
}
