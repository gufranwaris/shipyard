package com.shipyard.service.impl;

import com.shipyard.dto.BuildJobMessage;
import com.shipyard.producer.BuildPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.aventrix.jnanoid.jnanoid.NanoIdUtils;
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
@Slf4j
public class DeploymentServiceImpl implements DeploymentService {

    private final DeploymentRepository deploymentRepository;
    private final ProjectRepository projectRepository;
    private final BuildPublisher buildPublisher;

    @Override
    public DeploymentResponse deploy(long projectId) {
        // Implementation for deploying a new deployment
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

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
        DeploymentEntity savedDeploymentEntity = deploymentRepository.save(deployment);
        log.info("deploymentId: {}", savedDeploymentEntity.getId());

        BuildJobMessage message = BuildJobMessage.builder()
                        .deploymentId(savedDeploymentEntity.getId())
                        .build();
        buildPublisher.sendMessage(message);

        return DeploymentResponse.builder()
                .id(savedDeploymentEntity.getId())
                .publicId(savedDeploymentEntity.getPublicId())
                .status(savedDeploymentEntity.getStatus())
                .build();
    }

}
