package com.shipyard.dto;

import lombok.*;

import java.time.Instant;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class ProjectResponse{
    private Long id;
    private String name;
    private String gitUrl;
    private Instant createdAt;
}
