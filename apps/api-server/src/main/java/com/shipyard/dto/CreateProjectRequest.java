package com.shipyard.dto;

import lombok.*;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class CreateProjectRequest {
    private String name;
    private String gitUrl;

}
