package com.agrimatch.service;

import com.agrimatch.dto.LoginDTO;
import com.agrimatch.dto.RegisterDTO;
import com.agrimatch.model.User;
import com.agrimatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User register(RegisterDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // In production, hash this!
        user.setPhone(dto.getPhone());
        user.setState(dto.getState());
        user.setDistrict(dto.getDistrict());
        user.setRoles(dto.getRoles() != null ? dto.getRoles() : List.of("farmer"));
        user.setActiveRole(user.getRoles().get(0));
        user.setAvatar("👤");
        user.setRating(0);
        user.setTotalRatings(0);
        user.setCompletedJobs(0);
        user.setRange(20);

        if (dto.getLat() != 0 && dto.getLng() != 0) {
            user.setLocation(new User.Location(dto.getLat(), dto.getLng()));
        }

        user.setJoinedDate(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User login(LoginDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public User updateUser(String id, User updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getName() != null) user.setName(updates.getName());
        if (updates.getPhone() != null) user.setPhone(updates.getPhone());
        if (updates.getRoles() != null) user.setRoles(updates.getRoles());
        if (updates.getActiveRole() != null) user.setActiveRole(updates.getActiveRole());
        if (updates.getRange() > 0) user.setRange(updates.getRange());
        if (updates.getLocation() != null) user.setLocation(updates.getLocation());

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public void updateRating(String userId, double newRating) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int total = user.getTotalRatings();
        double avg = user.getRating();
        double updatedAvg = ((avg * total) + newRating) / (total + 1);

        user.setRating(Math.round(updatedAvg * 10.0) / 10.0);
        user.setTotalRatings(total + 1);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    public void incrementCompletedJobs(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCompletedJobs(user.getCompletedJobs() + 1);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
