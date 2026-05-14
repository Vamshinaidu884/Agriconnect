package com.agrimatch.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String name;
    private String phone;
    private String avatar;

    private List<String> roles; // farmer, labour, machine_owner
    private String activeRole;

    // Location
    private String state;
    private String district;
    private Location location;
    private int range = 20; // km

    // Stats
    private double rating;
    private int totalRatings;
    private int completedJobs;

    private LocalDateTime joinedDate;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Location {
        private double lat;
        private double lng;
    }
}
