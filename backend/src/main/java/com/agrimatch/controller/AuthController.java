package com.agrimatch.controller;

import com.agrimatch.dto.ApiResponse;
import com.agrimatch.dto.LoginDTO;
import com.agrimatch.dto.RegisterDTO;
import com.agrimatch.model.User;
import com.agrimatch.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterDTO dto) {
        try {
            User user = userService.register(dto);
            // Don't send password back
            user.setPassword(null);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@Valid @RequestBody LoginDTO dto) {
        try {
            User user = userService.login(dto);
            user.setPassword(null);
            return ResponseEntity.ok(ApiResponse.success("Login successful", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
