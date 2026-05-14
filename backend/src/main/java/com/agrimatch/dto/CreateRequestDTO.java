package com.agrimatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateRequestDTO {
    @NotBlank(message = "Type is required")
    private String type;

    private String subType;
    private String workType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private double priceOffered;
    private String priceUnit;

    @Positive(message = "Workers needed must be positive")
    private int workersNeeded;

    private String timeSlot;
    private String date;
    private double landArea;
    private String landUnit;
    private boolean foodProvided;
    private boolean driverRequired;
}
