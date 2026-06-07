package com.shipyard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shipyard.dto.CreateDeploymentRequest;
import com.shipyard.dto.DeploymentResponse;
import com.shipyard.service.DeploymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/deployments")
@RequiredArgsConstructor
public class DeploymentController {
    
    private final DeploymentService DeploymentService;

    @PostMapping("/projects")
    public ResponseEntity<DeploymentResponse> createDeployment(
            @RequestParam("projectId") long projectId) {
        DeploymentResponse response = DeploymentService.deploy(projectId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
