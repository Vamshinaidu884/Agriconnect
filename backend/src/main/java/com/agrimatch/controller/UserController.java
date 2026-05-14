package com.agrimatch.controller;

import com.agrimatch.dto.ApiResponse;
import com.agrimatch.model.User;
import com.agrimatch.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable String id) {
        return userService.findById(id)
                .map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(ApiResponse.success(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable String id, @RequestBody User updates) {
        try {
            User user = userService.updateUser(id, updates);
            user.setPassword(null);
            return ResponseEntity.ok(ApiResponse.success("Profile updated", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
