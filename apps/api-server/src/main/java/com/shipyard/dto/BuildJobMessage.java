package com.shipyard.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class BuildJobMessage{
    private long deploymentId;
}
