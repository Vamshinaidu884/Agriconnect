package com.agrimatch.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "requests")
public class Request {
    @Id
    private String id;

    // Type
    private String type; // labour, machine
    private String subType;
    private String workType;

    // Details
    private String title;
    private String description;

    // Farmer info
    private String farmerId;
    private String farmerName;
    private String farmerPhone;
    private String farmerAvatar;
    private double farmerRating;

    // Pricing
    private double priceOffered;
    private String priceUnit; // per_day, per_hour, per_acre

    // Workers
    private int workersNeeded;
    private int workersAccepted;
    private List<String> acceptedUsers = new ArrayList<>();

    // Schedule
    private String timeSlot; // morning, afternoon, full_day
    private String date;

    // Land
    private double landArea;
    private String landUnit; // acres, hectares

    // Location
    private String state;
    private String district;
    private User.Location location;

    // Options
    private boolean foodProvided;
    private boolean driverRequired;

    // Status
    private String status = "pending"; // pending, active, completed, expired

    // Ratings (userId -> rating)
    private Map<String, Rating> ratings = new HashMap<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Rating {
        private int score;
        private String comment;
        private LocalDateTime createdAt;
    }
}
