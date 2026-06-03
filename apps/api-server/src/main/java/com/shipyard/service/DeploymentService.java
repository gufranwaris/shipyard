package com.shipyard.service;

import com.shipyard.dto.DeploymentResponse;
import com.shipyard.dto.CreateDeploymentRequest;

public interface DeploymentService {
    DeploymentResponse deploy(CreateDeploymentRequest request);
}
