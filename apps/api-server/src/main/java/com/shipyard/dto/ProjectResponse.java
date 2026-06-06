package com.shipyard.dto;

import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class ProjectResponse{
    private Long id;
    private String name;
    private String gitUrl;
    private LocalDateTime createdAt;
}
