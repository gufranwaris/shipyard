package com.shipyard.service.impl;

import com.shipyard.service.ProjectService;

import org.springframework.stereotype.Service;

import com.shipyard.dto.CreateProjectRequest;
import com.shipyard.dto.ProjectResponse;
import com.shipyard.entity.ProjectEntity;
import com.shipyard.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectResponse create(CreateProjectRequest request) {
        System.out.println("Creating project with name: " + request.getName());
        ;
        ProjectEntity project = ProjectEntity.builder()
                .name(request.getName())
                .gitUrl(request.getGitUrl())
                .build();
        ProjectEntity savedProjectEntity = projectRepository.save(project);
        return ProjectResponse.builder()
                .id(savedProjectEntity.getId())
                .name(savedProjectEntity.getName())
                .gitUrl(savedProjectEntity.getGitUrl())
                .build();
    }
}
