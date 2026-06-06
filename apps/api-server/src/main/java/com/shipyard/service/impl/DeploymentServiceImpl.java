package com.shipyard.service.impl;

import org.springframework.stereotype.Service;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
import com.shipyard.dto.CreateDeploymentRequest;
import com.shipyard.dto.DeploymentResponse;
import com.shipyard.entity.DeploymentEntity;
import com.shipyard.entity.ProjectEntity;
import com.shipyard.entity.type.Status;
import com.shipyard.repository.DeploymentRepository;
import com.shipyard.repository.ProjectRepository;
import com.shipyard.service.DeploymentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeploymentServiceImpl implements DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ProjectRepository projectRepository;

    @Override
    public DeploymentResponse deploy(CreateDeploymentRequest request) {
        // Implementation for deploying a new deployment
        ProjectEntity project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));

        String publicId = NanoIdUtils.randomNanoId(
                NanoIdUtils.DEFAULT_NUMBER_GENERATOR,
                "abcdefghijklmnopqrstuvwxyz0123456789".toCharArray(),
                5);
        DeploymentEntity deployment = DeploymentEntity.builder()
                .publicId(publicId)
                .deploymentUrl("")
                .status(Status.PENDING) // Assuming you have a Status enum
                .project(project)
                .build();
        deploymentRepository.save(deployment);
        return DeploymentResponse.builder()
                .id(deployment.getId())
                .publicId(deployment.getPublicId())
                // .project(project)
                .status(deployment.getStatus())
                .build();
    }

}
