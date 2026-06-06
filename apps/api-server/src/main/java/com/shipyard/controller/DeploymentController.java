package com.shipyard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shipyard.dto.CreateDeploymentRequest;
import com.shipyard.dto.DeploymentResponse;
import com.shipyard.service.DeploymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/deployments")
@RequiredArgsConstructor
public class DeploymentController {
    
    private final DeploymentService DeploymentService;

    @PostMapping
    public ResponseEntity<DeploymentResponse> createDeployment(
            @RequestBody CreateDeploymentRequest request) {
        DeploymentResponse response = DeploymentService.deploy(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
