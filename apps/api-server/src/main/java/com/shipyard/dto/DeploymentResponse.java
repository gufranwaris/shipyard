package com.shipyard.dto;

import com.shipyard.entity.type.Status;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;


@Getter
@Setter
@Builder
public class DeploymentResponse {
    private Long id;
    private String publicId;
    private Status status;
}
