package com.shipyard.service.impl;

import com.shipyard.dto.CreateProjectRequest;
import com.shipyard.dto.ProjectResponse;
import com.shipyard.entity.ProjectEntity;
import com.shipyard.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ProjectServiceImpl {

    private final ProjectRepository projectRepository;

    public ProjectResponse create(CreateProjectRequest request){
        System.out.println("Creating project with name: " + request.getName());;
        ProjectEntity project = ProjectEntity.builder()
                .name(request.getName())
                .gitUrl(request.getGitUrl())
                .build();
        ProjectEntity savedProjectEntity = projectRepository.save(project);
        return new ProjectResponse(
                savedProjectEntity.getId(),
                savedProjectEntity.getName(),
                savedProjectEntity.getGitUrl(),
                savedProjectEntity.getCreatedAt()
        );
    }
}
