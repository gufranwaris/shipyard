package com.shipyard.dto;

public record BuildJobMessage(
        String deploymentId,
        Long projectId,
        String gitUrl
) {
}
